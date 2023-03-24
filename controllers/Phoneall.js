const PhoneallModel = require('../models/PhoneallModel');
const jwt = require('jsonwebtoken');
const secret = require('../config/secret');
const bcrypt = require('bcryptjs');
const util = require('util');
const http = require('http');
const verify = util.promisify(jwt.verify);
const Common = require('../utils/common');
const mineType = require("mime-types");
class Phoneall {
	/**
	 * 创建设备
	 * @param ctx phone_name     设备字
	 * @param ctx password     设备密码
	 * @returns 创建成功返回设备信息，失败返回错误信息
	 */
	static async create(ctx) {
		let {
			phone_name,
			phone_ip
		} = ctx.request.body;

		let params = {
			phone_name,
			phone_ip
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		// 查询设备是否重复
		const existPhoneall = await PhoneallModel.phone_name(params.phone_name)

		if (existPhoneall) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "设备已经存在"
			}
		} else {
			try {
				const data = await PhoneallModel.create(params);
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: `创建设备成功`,
					data: data
				}

			} catch (err) {
				ctx.response.status = 500;
				ctx.body = {
					code: 500,
					message: `创建设备失败`,
					data: err
				}
			}
		}
	}


	/**
	 * 获取设备列表
	 * @param ctx
	 * @returns 设备列表数据
	 */
	static async list(ctx) {
		const {
			keyword,
			phone_name,
			phone_ip,
			pageIndex = 1,
			pageSize = 10
		} = ctx.query
		try {
			let data = await PhoneallModel.findAllPhoneallList({
				keyword, phone_name, phone_ip, pageIndex, pageSize
			});
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "获取成功",
				data
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
	 * 查询设备详情
	 * @param ctx id  设备ID
	 *
	 * @returns 设备的详情
	 */
	static async detail(ctx) {
		// 设备ID
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		try {

			let data = await PhoneallModel.detail(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `查询单一设备成功`,
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
	 * 删除设备
	 * @param ctx id 设备ID
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
			await PhoneallModel.delete(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "删除设备成功"
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
	 * 更新设备数据
	 * @param ctx id 设备ID
	 * @param ctx phone_name         设备名称
	 * @param ctx phone_ip          设备ip
	 * @param ctx distri_game   	占用的游戏
	 *
	 * @returns 更新成功返回更新后的数据，失败返回错误信息
	 */
	static async update(ctx) {
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		let {
			phone_name,
			phone_ip,
			distri_game
		} = ctx.request.body;
		let params = {
			phone_name,
			phone_ip,
			distri_game,
		}

		if (!phone_name) delete params.phone_name
		if (!phone_ip) delete params.phone_name
		if (!distri_game) delete params.distri_game

		try {

			await PhoneallModel.update(id, params);
			let data = await PhoneallModel.detail(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `更新设备成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `更新失败`,
				data: err
			}
		}
	}

	/**
	 * 获取设备屏幕
	 * @param ctx
	 * @returns 设备屏幕数据
	 */
	static async screen(ctx) {
		let {
			ip,
			type = '',
			text = ''
		} = ctx.query 

		async function getImg(url) {
			return new Promise((reslove, reject) => {
				http.get(url, function (res) {
					reslove(res)
				})
			})
		}

		try {
			let imgUrl = ""
			// type: 11：发送文字 20：回到首页 21：切换进程
			if (type) {
				imgUrl = "http://" + ip + ":50005/event?type=" + type + "&state=0&text=" + text;
			} else {
				imgUrl = "http://" + ip + ":50005/snapshot1?ext=jpg&orient=0&compress=0.00001&scale=1&t-" + new Date().getTime();
			}
			let data = await getImg(imgUrl)
			ctx.body = data
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: err
			}
		}
	}
}

module.exports = Phoneall
