const PhonepriceModel = require('../models/PhonepriceModel')
const Common = require("../utils/common");
class Phoneprice {
	/**
	 * 更新某一价格选项
	 * @param ctx id     价格选项id
	 * @param ctx buy_price 价格选项价格
	 * @returns 更新成功返回正确信息，失败返回错误信息
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
			buy_price
		} = ctx.request.body;
		
		let params = {
			buy_price
		}
		
		if (!buy_price) delete params.buy_price
		
		try {
		
			await PhonepriceModel.update(id, params);
			let data = await PhonepriceModel.detail(id);
		
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `更新价格选项成功`,
				data
			}
		
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `更新价格选项失败`,
				data: err
			}
		}
		
	}

	/**
	 * 获取价格列表
	 * @params ctx include 包含内容
	 *
	 * @returns 价格列表数据
	 */
	static async list(ctx) {
		let {
			include
		} = ctx.query;

		try {
			let data = await PhonepriceModel.list()
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `获取价格列表成功！`,
				data
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `获取价格列表失败`,
				data: err
			}
		}
	}
}

module.exports = Phoneprice
