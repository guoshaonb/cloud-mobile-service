const User_RechargeModel = require('../models/User_rechargeModel')
const UserModel = require('../models/UserModel')
const Common = require("../utils/common");
class User_Recharge {
	/**
	 * 生成一条充值记录
	 * @param ctx username     用户名
	 * @param ctx recharge_balance    充值金额
	 * @returns 生成成功返回用户信息，失败返回错误信息
	 */
	static async create(ctx) {
		//生成充值编号
		let recharge_id = await Common.randomNum(16)
		recharge_id = recharge_id.toString()
		//数据校验
		let {
			username,
			recharge_balance
		} = ctx.request.body;
		
		try {
			
			let {
				id,
				rec_balances,
				balance
			} = await UserModel.username(username)
			let params = {
				userId: id,
				recharge_balance
			}
			// 数据格式校验
			if (!await Common.isParamsFormat(ctx, params)) {
				return false;
			}

			if (recharge_balance < 0 || recharge_balance > 10000) {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: `充值的云币范围超出，充值失败！`,
				}
				return
			}

			//生成一条充值信息
			params.recharge_balance = params.recharge_balance * 10
			params.recharge_id = recharge_id
			params.after_balance = parseFloat(balance) + parseFloat(params.recharge_balance) //充值后的云币：用户当前云币+充值云币
			params.rec_balances = parseFloat(params.recharge_balance) + parseFloat(rec_balances ? rec_balances : 0) //云币的充值总数：充值云币+累计充值云币

			/**
			 * 贵族等级判定
			 */
			//充值100云币:贵族1
			//充值500云币:贵族2
			//充值1000云币:贵族3
			//充值2000云币:贵族4
			//充值5000云币:贵族5
			//充值10000云币:贵族6
			//充值20000云币:贵族7
			//充值50000云币:贵族8
			let noble_num = 0
			if (params.rec_balances >= 50000) {
				noble_num = 8
			} else if (params.rec_balances >= 20000 && params.rec_balances < 50000) {
				noble_num = 7
			} else if (params.rec_balances >= 10000 && params.rec_balances < 20000) {
				noble_num = 6
			} else if (params.rec_balances >= 5000 && params.rec_balances < 10000) {
				noble_num = 5
			} else if (params.rec_balances >= 2000 && params.rec_balances < 5000) {
				noble_num = 4
			} else if (params.rec_balances >= 1000 && params.rec_balances < 2000) {
				noble_num = 3
			} else if (params.rec_balances >= 500 && params.rec_balances < 1000) {
				noble_num = 2
			} else if (params.rec_balances >= 100 && params.rec_balances < 500) {
				noble_num = 1
			}

			//增加用户的云币,并设置用户的充值总数和贵族等级
			await UserModel.upduser(id, {
				balance: params.after_balance,
				rec_balances: params.rec_balances,
				noble_num: noble_num
			})

			try {
				const data = await User_RechargeModel.create(params);
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: `生成一条充值记录成功`,
					data: data
				}
			} catch (err) {
				ctx.response.status = 500;
				ctx.body = {
					code: 500,
					message: `生成一条充值记录失败`,
					data: err
				}
			}
		} catch (err) {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: `无此用户,充值失败！`,
				data: err
			}
		}
		
	}

	/**
	 * 获取充值列表
	 * @params ctx include 包含内容
	 *
	 * @returns 充值列表数据
	 */
	static async list(ctx) {
		let {
			keyword,
			pageIndex = 1,
			pageSize = 10
		} = ctx.query;

		try {
			let data = await User_RechargeModel.list({
				keyword,
				pageIndex,
				pageSize
			})
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `获取充值记录成功！`,
				data
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `获取充值记录失败`,
				data: err
			}
		}
	}
}

module.exports = User_Recharge
