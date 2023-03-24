const User_LogModel = require('../models/User_logModel')
const Common = require("../utils/common");
class User_Log {
	/**
	 * 生成日志记录
	 * @param ctx userId     用户id
	 * @param ctx order_price 日志价格
	 * @param ctx buy_phone 购买设备
	 * @param ctx buy_duration 购买时长
	 * @returns 购买成功返回用户信息，失败返回错误信息
	 */
	static async create(ctx) {
		let { id: userId } = ctx.user
		let {
			gamePhoneId,
			name,
			content,
			imgurl
		} = ctx.request.body;

		let params = {
			userId,
			gamePhoneId,
			name,
			content,
			imgurl
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		try {
			const data = await User_LogModel.create(params);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `生成一条日志记录成功`,
				data: data
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `生成一条日志记录失败`,
				data: err
			}
		}

	}

	/**
	 * 获取日志列表
	 * @params ctx include 包含内容
	 *
	 * @returns 日志列表数据
	 */
	static async list(ctx) {
		let {
			keyword,
			pageIndex = 1,
			pageSize = 10,
			hours,
			isPageShow = "yes"
		} = ctx.query;

		try {
			let data = await User_LogModel.list({ keyword, pageIndex, pageSize, hours, isPageShow })
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: isPageShow == "yes" ? `获取日志记录成功！` : `获取使用中的人数成功！`,
				data
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: isPageShow == "yes" ? `获取日志记录失败` : `获取使用中的人数失败`,
				data: err
			}
		}
	}

	/**
	 * 删除日志
	 * @param ctx id 日志ID
	 * @returns  删除成功返回true，失败返回错误原因
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
			await User_LogModel.delete(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "删除日志成功"
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: err
			}
		}
	}
}

module.exports = User_Log
