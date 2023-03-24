const User_OrderModel = require('../models/User_orderModel')
const UserModel = require('../models/UserModel')
const Common = require("../utils/common");
class User_Order {
	/**
	 * 生成订单记录
	 * @param ctx userId     用户id
	 * @param ctx order_price 订单价格
	 * @param ctx buy_phone 购买设备
	 * @param ctx buy_duration 购买时长
	 * @returns 购买成功返回用户信息，失败返回错误信息
	 */
	static async create(ctx) {
		let order_id = await Common.randomNum(16)
		order_id = order_id.toString()
		let {
			id: userId
		} = ctx.user
		let {
			gamePhoneId,
			order_price,
			buy_duration,
		} = ctx.request.body;

		let params = {
			userId,
			gamePhoneId,
			order_price,
			buy_duration
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		let {
			balance
		} = await UserModel.find_id(userId)

		//生成一条订单信息
		params.order_id = order_id
		params.after_balance = parseFloat(balance) - parseFloat(order_price)

		if (params.after_balance < 0) {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: `余额不足，提交订单失败`,
			}
			return
		}

		//减少用户的云币
		await UserModel.upduser(userId, {
			balance: params.after_balance
		})

		//看表里面是否已存在了该设备的记录
		//不存在就是刚购买的，过期时间是现在的时间加上购买的时长
		//存在就是续费操作，过期时间是上一次的时间为基点，加上续费的时长
		let phoneDetail = await User_OrderModel.details(gamePhoneId)
		phoneDetail = phoneDetail && phoneDetail[phoneDetail.length - 1]
		//计算什么时候过期
		let dredgeDates = {
			"体验版": ["d", 2],
			"周卡": ["d", 7],
			"1个月": ["m", 1],
			"3个月": ["m", 3],
			"1年": ["y", 1],
			"永久专享": ["y", 999],
		}

		let curTime = phoneDetail ? phoneDetail.expiration_date : new Date() //有这条数据就用之前的时间为基点，否则用现在的时间
		let durationarr = dredgeDates[buy_duration]
		params.expiration_date = await Common.DateAdd(durationarr[0], durationarr[1], curTime)

		try {
			const data = await User_OrderModel.create(params);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `生成一条订单记录成功`,
				data: data
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `生成一条订单记录失败`,
				data: err
			}
		}

	}

	/**
	 * 获取订单列表
	 * @params ctx include 包含内容
	 *
	 * @returns 订单列表数据
	 */
	static async list(ctx) {
		let {
			keyword,
			is_expire,
			pageIndex = 1,
			pageSize = 10
		} = ctx.query;
		try {
			let data = await User_OrderModel.list({
				keyword,
				is_expire,
				pageIndex,
				pageSize
			})
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `获取订单记录成功！`,
				data
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `获取订单记录失败`,
				data: err
			}
		}
	}

	/**
	 * 查询某条订单的所有记录
	 * @param ctx id  订单ID
	 *
	 * @returns 某条订单的所有记录
	 */
	static async details(ctx) {
		// 订单ID
		let {
			gamePhoneId
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, gamePhoneId)) {
			return false;
		}

		try {

			let data = await User_OrderModel.details(gamePhoneId);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `查询该条订单的所有记录`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `查询失败`,
				data: err
			}
		}

	}

	/**
	 * 移除订单记录
	 * @param ctx id 需要根据的id
	 * @returns  移除成功返回true，失败返回错误原因
	 */
	static async delete(ctx) {
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		try {
			await User_OrderModel.delete(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "移除记录成功"
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: err
			}
		}
	}

	/**
	 * 更新某条订单
	 * @param ctx id     订单表id
	 * @returns 更新某条订单成功返回正确信息，失败返回错误信息
	 */
	static async update(ctx) {

		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		// 接收参数
		let {
			expiration_date
		} = ctx.request.body;

		// 减去8小时时区
		expiration_date = await Common.DateAdd("h", -8, new Date(expiration_date))
		console.log("时间这里了--------------------->", expiration_date)

		let params = {
			expiration_date
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		try {
			await User_OrderModel.update(id, params);
			let data = await User_OrderModel.detail(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `更新该条订单成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `更新该条订单失败`,
				data: err
			}
		}

	}
}

module.exports = User_Order
