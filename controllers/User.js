const UserModel = require('../models/UserModel');
const fs = require("fs")
const jwt = require('jsonwebtoken');
const secret = require('../config/secret');
const bcrypt = require('bcryptjs');
const util = require('util')
const verify = util.promisify(jwt.verify)
const Common = require("../utils/common");
const httpRequest = require("../utils/httpRequest.js")
const wxBizDataCrypt = require("../utils/wxBizDataCrypt");
const { voluntInit } = require("../utils/voluntarily.js")
const { setItem, getItem, redisClient } = require('../utils/redisConfig');
let userCodes = {}
let isShowVeri = "yes"

class User {
	/**
	 * 登录
	 * @param ctx username     用户名字
	 * @param ctx password     用户密码
	 *
	 * @returns 登录成功返回用户信息，失败返回错误原因
	 */
	static async login(ctx) {
		const {
			username,
			password
		} = ctx.request.body

		// 查询用户
		const userDetail = await UserModel.username(username)

		if (!userDetail) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "账户不存在"
			}
			return false;
		} else if (userDetail.is_forbidden) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "由于多次违规行为,该用户已被禁用,具体原因请联系管理员！"
			}
			return false;
		}

		// 判断前端传递的用户密码是否与数据库密码一致
		if (bcrypt.compareSync(password, userDetail.password)) {
			// 用户token
			const userToken = {
				id: userDetail.id,
				username: userDetail.username,
				user_num: userDetail.user_num,
				user_id: userDetail.user_id,
				user_openid: userDetail.user_openid,
				invitation_code: userDetail.invitation_code,
				balance: userDetail.balance,
				safety_problem: userDetail.safety_problem,
				telephone: userDetail.telephone,
				is_experience: userDetail.is_experience,
				user_nickname: userDetail.user_nickname,
				user_profile: userDetail.user_profile,
				noble_num: userDetail.noble_num,
			}
			// 签发token
			const token = jwt.sign(userToken, secret.sign, {
				expiresIn: '24h'
			});
			// 更新登录状态
			await UserModel.updloginstatus(userDetail.username, {
				login_status: true
			})

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "登录成功",
				data: {
					id: userDetail.id,
					username: userDetail.username,
					user_num: userDetail.user_num,
					user_id: userDetail.user_id,
					user_openid: userDetail.user_openid,
					invitation_code: userDetail.invitation_code,
					balance: userDetail.balance,
					safety_problem: userDetail.safety_problem,
					telephone: userDetail.telephone,
					is_experience: userDetail.is_experience,
					user_nickname: userDetail.user_nickname,
					user_profile: userDetail.user_profile,
					noble_num: userDetail.noble_num,
					token: token
				}
			}
		} else {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "用户名或密码错误"
			}
		}
	}

	/**
	 * 退出登录
	 *
	 * @returns 退出登录成功返回用户信息，失败返回错误原因
	 */

	static async logoff(ctx) {
		const {
			username
		} = ctx.user

		try {
			// 更新登录状态
			await UserModel.updloginstatus(username, {
				login_status: false
			})
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "退出登录成功",
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: "退出登录失败",
			}
		}
	}

	/**
	 * 注册用户
	 * @param ctx username     用户名字
	 * @param ctx password     用户密码
	 * @returns 注册成功返回用户信息，失败返回错误信息
	 */
	static async create(ctx) {
		let random_user_id = await Common.randomNum(6)
		let {
			username,
			user_nickname,
			password,
			user_num = 2,
			user_id = random_user_id,
			invitation_code = 0,
			telephone,
			verify_code,
			invite_user
		} = ctx.request.body;

		let params = {
			username,
			user_nickname,
			password,
			user_num,
			user_id,
			invitation_code,
			telephone,
			verify_code
		}

		// 如果是普通用户注册，需要校验验证码
		if (user_num == 2) {
			// 正常用户
			// 查询手机号
			const teleDetail = await UserModel.telephone(params.telephone)
			if (teleDetail) {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: "手机号已被绑定"
				}
				return false;
			}

			if (!userCodes[telephone]) {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: "请点击获取验证码！"
				}
				return false
			}

			if (userCodes[telephone].code == verify_code) {
				// 当前时间
				let curTime = new Date().getTime()
				console.log("时间:", curTime, userCodes[telephone].time)
				if (curTime - userCodes[telephone].time > 60 * 1000) {
					ctx.response.status = 412;
					ctx.body = {
						code: 412,
						message: "验证码已过期,请重新获取"
					}
					return false
				}
				console.log("验证码正确")
			} else {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: "验证码输入错误"
				}
				return false
			}
		} else {
			delete params.telephone
			delete params.verify_code
		}

		// 如果是通过邀请人注册的的
		if (invite_user) {
			// 给这个邀请人赠送20云币
			let {
				id,
				balance
			} = await UserModel.username(invite_user)
			await UserModel.upduser(id, {
				balance: parseFloat(balance) + 20
			})
			// 给自己也增加20云币
			params.balance = 20.00
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}
		// 查询用户名是否重复
		const existUser = await UserModel.username(params.username)

		if (existUser) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "用户已经存在"
			}
		} else {

			try {
				// 加密密码
				const salt = bcrypt.genSaltSync();
				const hash = bcrypt.hashSync(params.password, salt);
				params.password = hash;

				// 创建用户
				await UserModel.create(params);
				const newUser = await UserModel.username(params.username)

				// 签发token
				const userToken = {
					username: newUser.username,
					user_num: newUser.user_num,
					user_id: newUser.user_id,
					invitation_code: newUser.invitation_code,
					balance: newUser.balance,
					safety_problem: newUser.safety_problem,
					telephone: newUser.telephone,
					phone_count: newUser.phone_count,
					user_nickname: newUser.user_nickname,
					user_remarks: newUser.user_remarks,
					rec_balances: newUser.rec_balances,
					noble_num: newUser.noble_num,
				}

				// 储存token失效有效期1天
				const token = jwt.sign(userToken, secret.sign, {
					expiresIn: '24h'
				});

				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: params.user_num == 1 ? `注册代理成功` : `注册用户成功`,
					data: token
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

	/**
	 * 微信 -->获取code
	 *
	 * @returns 微信-->获取code成功返回用户信息，失败返回错误原因
	 */

	static async wechatcode(ctx) {

		let {
			js_code
		} = ctx.request.body

		let params = {
			js_code
		}
		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}
		
		const appid = "wxddf2a2394ca27423"
		const secret = "eadb495e2fb3b4033c0bc0bdaf9f90a1"

		try {
			let url =
				`https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${js_code}&grant_type=authorization_code`
			const data = await httpRequest.get(url)
			if(data) {
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: '获取用户数据成功！',
					data
				}
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
	 * 微信 -->获取加密信息
	 *
	 * @returns 微信登录-->获取加密信息成功返回用户信息，失败返回错误原因
	 */

	static async wechatdecrypt(ctx) {

		const appId = 'wxddf2a2394ca27423'
		// const appId = 'wx367a44af3e596c7e'
		let {
			sessionKey,
			encryptedData,
			iv
		} = ctx.request.body

		let params = {
			sessionKey,
			encryptedData,
			iv
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		try {
			let bizDataCrypt = new wxBizDataCrypt(appId, sessionKey)
			const data = bizDataCrypt.decryptData(encryptedData, iv)
			
			if (Object.keys(data).length > 0) {
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: '获取数据成功！',
					data
				}
			} else {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: '获取失败,请重新授权！',
				}
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
	 * 微信 -->查看用户是否存在
	 * @param ctx openid     用户唯一标识
	 *
	 * @returns 查看用户是否存在成功返回用户信息，失败返回错误原因
	 */

	static async wxisregister(ctx) {
		const {
			user_openid
		} = ctx.request.body
		// 查询用户
		try {
			const userDetail = await UserModel.user_openid(user_openid)
			if (userDetail) {
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					status: 1,
					message: "已注册微信"
				}
			} else {
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					status: 0,
					message: "未注册微信"
				}
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
	 * 微信 -->登录
	 * @param ctx openid     用户唯一标识
	 *
	 * @returns 登录成功返回用户信息，失败返回错误原因
	 */
	static async wxlogin(ctx) {
		const {
			user_openid,
			telephone
		} = ctx.request.body

		// 查询用户
		const userDetail = await UserModel.user_openid(user_openid)
		if (!userDetail) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "账户不存在"
			}
			return false;
		} else {

			// 如果用户传递的手机号跟绑定的手机号不符合
			if (userDetail.telephone != telephone) {
				ctx.response.status = 403;
				ctx.body = {
					code: 403,
					message: "登录异常,请重试"
				}
				return false;
			}

			// 用户token
			const userToken = {
				id: userDetail.id,
				username: userDetail.username,
				user_num: userDetail.user_num,
				user_id: userDetail.user_id,
				user_openid: userDetail.user_openid,
				invitation_code: userDetail.invitation_code,
				balance: userDetail.balance,
				safety_problem: userDetail.safety_problem,
				telephone: userDetail.telephone,
				is_experience: userDetail.is_experience,
				user_nickname: userDetail.user_nickname,
				user_profile: userDetail.user_profile,
				noble_num: userDetail.noble_num,
			}
			// 签发token
			const token = jwt.sign(userToken, secret.sign, {});

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "登录成功",
				data: {
					id: userDetail.id,
					username: userDetail.username,
					user_num: userDetail.user_num,
					user_id: userDetail.user_id,
					user_openid: userDetail.user_openid,
					invitation_code: userDetail.invitation_code,
					balance: userDetail.balance,
					safety_problem: userDetail.safety_problem,
					telephone: userDetail.telephone,
					is_experience: userDetail.is_experience,
					user_nickname: userDetail.user_nickname,
					user_profile: userDetail.user_profile,
					noble_num: userDetail.noble_num,
					token: token
				}
			}
		}

	}

	/**
	 * 微信 -->注册
	 * @param ctx username     用户名字
	 * @returns 注册成功返回用户信息，失败返回错误信息
	 */
	static async wxcreate(ctx) {
		let random_user_id = await Common.randomNum(6)
		let {
			username,
			user_nickname,
			password = "123456",
			user_num = 2,
			user_id = random_user_id,
			invitation_code = 0,
			telephone,
			invite_user,
			user_openid
		} = ctx.request.body;

		let params = {
			username,
			user_nickname,
			password,
			user_num,
			user_id,
			invitation_code,
			telephone,
			user_openid
		}

		// 如果是通过邀请人注册的的
		if (invite_user) {
			// 给这个邀请人赠送20云币
			let {
				id,
				balance
			} = await UserModel.username(invite_user)
			await UserModel.upduser(id, {
				balance: parseFloat(balance) + 20
			})
			params.balance = 20.00
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		// 查询用户名是否重复
		const existUser = await UserModel.username(params.username)
		if (existUser) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "用户已经存在"
			}
		} else {

			try {
				// 加密密码
				const salt = bcrypt.genSaltSync();
				const hash = bcrypt.hashSync(params.password, salt);
				params.password = hash;

				// 创建用户
				await UserModel.create(params);
				const newUser = await UserModel.username(params.username)
				// 签发token
				const userToken = {
					username: newUser.username,
					user_num: newUser.user_num,
					user_id: newUser.user_id,
					invitation_code: newUser.invitation_code,
					balance: newUser.balance,
					safety_problem: newUser.safety_problem,
					telephone: newUser.telephone,
					phone_count: newUser.phone_count,
					user_nickname: newUser.user_nickname,
					user_remarks: newUser.user_remarks,
					rec_balances: newUser.rec_balances,
					noble_num: newUser.noble_num,
				}
				// 储存token失效有效期1天
				const token = jwt.sign(userToken, secret.sign, {
					expiresIn: '24h'
				});

				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: `注册用户成功`,
					data: token
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


	/**
	 * 查询用户信息
	 * @param ctx token 分发的用户token
	 *
	 * @returns 查询成功返回用户信息，失败返回错误原因
	 */
	static async info(ctx) {
		// 获取jwt
		const token = ctx.header.authorization;

		if (!token) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "Headers Token不能为空"
			}
		}

		let payload
		try {
			// 解密payload，获取用户名和ID
			payload = await verify(token.split(' ')[1], secret.sign)
			const user = {
				id: payload.id,
				email: payload.email,
				username: payload.username,
				createdAt: payload.createdAt
			}

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: '查询成功！',
				data: user
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
	 * 删除用户
	 * @param ctx id 用户ID
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
			await UserModel.delete(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "删除用户成功"
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
	 * 禁用用户
	 * @param ctx id 用户ID
	 * @returns  禁用成功返回true，失败返回错误原因
	 */
	static async forbidden(ctx) {
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		try {

			let {
				is_forbidden
			} = ctx.request.body;

			let params = {
				is_forbidden
			}

			const isForbwin = await UserModel.forbidden(id, {
				is_forbidden: params.is_forbidden
			});

			// 如果禁用用户成功
			if (isForbwin) {
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: params.is_forbidden == 1 ? "禁用用户成功" : "解除禁用成功"
				}
			} else {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: params.is_forbidden == 1 ? "禁用用户失败" : "解除禁用失败"
				}
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
	 * 获取用户列表
	 * @param ctx
	 *
	 * @returns 用户列表数据
	 */
	static async list(ctx) {
		let {
			keyword,
			login_status
		} = ctx.query
		try {
			const data = await UserModel.findAllUserList({
				keyword,
				login_status
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
	 * 获取用户总数
	 * @param ctx
	 *
	 * @returns 用户总数数据
	 */
	static async counts(ctx) {
		let {
			keyword,
			login_status
		} = ctx.query
		try {
			const data = await UserModel.findAllUserList({
				keyword,
				login_status
			});
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "获取成功",
				data: data.length
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
	 * 获取今日的注册用户列表
	 * @param ctx
	 *
	 * @returns 今日的注册用户列表数据
	 */
	static async today(ctx) {
		try {
			const data = await UserModel.findFewDaysUserList(1);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "获取成功",
				data: data.length
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
	 * 获取本周的注册用户列表
	 * @param ctx
	 *
	 * @returns 本周的注册用户列表数据
	 */
	static async thisweek(ctx) {
		try {
			const data = await UserModel.findFewDaysUserList(7);
			let list_data = await Common.getCounts(data)
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "获取成功",
				data: list_data
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
	 * 获取代理列表
	 * @param ctx
	 *
	 * @returns 代理列表数据
	 */
	static async agents(ctx) {
		try {
			let {
				keyword,
				pageIndex = 1,
				pageSize = 10
			} = ctx.query
			const data = await UserModel.findAagentUserList({
				keyword,
				pageIndex,
				pageSize
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
	 * 获取某代理下用户列表
	 * @param ctx
	 *
	 * @returns 某代理下用户列表数据
	 */
	static async users(ctx) {

		let {
			user_id
		} = ctx.params;
		let {
			keyword,
			filterType = "",
			pageIndex = 1,
			pageSize = 10
		} = ctx.query
		if (!await Common.isIncludeId(ctx, user_id)) {
			return false;
		}
		try {
			const data = await UserModel.findCommonUserList({
				user_id,
				keyword,
				filterType,
				pageIndex,
				pageSize
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
	 * 获取用户的当前状态
	 * @param ctx
	 *
	 * @returns 用户的当前信息数据
	 */
	static async userstatus(ctx) {
		try {
			const {
				username
			} = ctx.user
			const data = await UserModel.userstatus(username)
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "返回个人的当前状态成功",
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
	 * 修改用户密码
	 * @param ctx
	 *
	 * @returns 密码是否修改成功
	 */

	static async updpass(ctx) {
		let {
			username,
			password_old,
			password_new,
		} = ctx.request.body;

		let params = {
			username,
			password_old,
			password_new,
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		// 查询用户
		const userDetail = await UserModel.username(username)

		if (!userDetail) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "账号不存在"
			}
			return false;
		}

		// 判断前端传递的用户密码是否与数据库密码一致
		if (bcrypt.compareSync(params.password_old, userDetail.password)) {

			// 加密密码
			const salt = bcrypt.genSaltSync();
			const hash = bcrypt.hashSync(params.password_new, salt);

			const isUpdwin = await UserModel.updpass(params.username, {
				password: hash
			});

			// 如果修改密码成功
			if (isUpdwin) {
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: "密码修改成功"
				}
			}

		} else {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "用户名或密码错误"
			}
		}
	}

	/**
	 * 绑定手机号
	 * @param ctx
	 *
	 * @returns 手机号是否绑定成功
	 */

	static async bindtele(ctx) {
		let {
			username
		} = ctx.user
		let {
			telephone,
			verify_code
		} = ctx.request.body;
		let params = {
			username,
			telephone
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		// 查询用户
		const userDetail = await UserModel.username(params.username)
		// 查询手机号
		const teleDetail = await UserModel.telephone(params.telephone)
		if (!userDetail) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "账户不存在"
			}
			return false;
		}

		if (teleDetail) {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "手机号已被绑定"
			}
			return false;
		}

		if (!userCodes[telephone]) {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "请点击获取验证码！"
			}
			return false
		}

		if (userCodes[telephone].code == verify_code) {
			// 当前时间
			let curTime = new Date().getTime()
			console.log("时间:", curTime, userCodes[telephone].time)
			if (curTime - userCodes[telephone].time > 60 * 1000) {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: "验证码已过期,请重新获取"
				}
				return false
			}

			const isBindwin = await UserModel.bindtele(params.username, {
				telephone: params.telephone
			});

			// 如果绑定手机号成功
			if (isBindwin) {
				ctx.body = {
					code: 200,
					message: "手机号绑定成功"
				}
			} else {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: "手机号绑定失败"
				}
			}
		} else {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "验证码输入错误"
			}
			return false
		}

	}

	/**
	 * 取消体验资格
	 * @param ctx
	 *
	 * @returns 体验资格是否取消成功
	 */

	static async overexperience(ctx) {
		let {
			username
		} = ctx.user;

		let params = {
			username,
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		const isBindwin = await UserModel.updexperience(params.username, {
			is_experience: true
		});

		// 如果取消体验资格成功
		if (isBindwin) {
			ctx.body = {
				code: 200,
				message: "取消体验资格成功"
			}
		} else {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "取消体验资格失败"
			}
		}
	}

	/**
	 * 恢复体验资格
	 * @param ctx
	 *
	 * @returns 体验资格是否恢复成功
	 */

	static async recoverexperience(ctx) {
		let {
			username,
			user_num
		} = ctx.user;

		if (user_num != 2) {
			username = ctx.request.body.username
		}

		let params = {
			username,
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		const isBindwin = await UserModel.updexperience(params.username, {
			is_experience: false
		});

		// 如果恢复体验资格成功
		if (isBindwin) {
			ctx.body = {
				code: 200,
				message: "恢复体验资格成功"
			}
		} else {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "恢复体验资格失败"
			}
		}
	}

	/**
	 * 编辑昵称
	 * @param ctx
	 *
	 * @returns 编辑昵称是否成功
	 */

	static async updnickname(ctx) {

		let {
			username
		} = ctx.user;

		let {
			user_nickname
		} = ctx.request.body;

		let params = {
			username,
			user_nickname
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		const isEditwin = await UserModel.updnickname(params.username, {
			user_nickname: user_nickname
		});

		// 如果编辑昵称成功
		if (isEditwin) {
			ctx.body = {
				code: 200,
				message: "编辑昵称成功"
			}
		} else {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "编辑昵称失败"
			}
		}
	}

	/**
	 * 上传图片
	 * @param ctx
	 *
	 * @returns 上传图片是否成功
	 */

	static async uploadimg(ctx) {
		let {
			username
		} = ctx.user;
		let pathPrefix = "./file/"
		let {
			imgData,
			filePath = "screen"
		} = ctx.request.body;
		filePath = pathPrefix + filePath
		let gettime = new Date().getTime() + "-" + await Common.randomNum(5)
		var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
		var dataBuffer = new Buffer(base64Data, 'base64');
		fs.writeFile(`${filePath}/${gettime}.jpg`, dataBuffer, function(err) {
			if (err) {
				console.log(err)
			} else {
				console.log("保存成功！")
			}
		});
		let params = {
			username
		}
		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}
		let isEditwin = null
		if (filePath == './file/screen') {
			isEditwin = true
		} else {
			isEditwin = await UserModel.uplprofile(params.username, {
				user_profile: `${gettime}.jpg`
			});
		}
		// 如果编辑昵称成功
		if (isEditwin) {
			ctx.body = {
				code: 200,
				message: filePath == './file/screen' ? "上传屏幕成功" : "上传头像成功",
				data: {
					imgPath: `${gettime}.jpg`
				}
			}
		} else {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: filePath == './file/screen' ? "上传屏幕失败" : "上传头像失败",
			}
		}
	}

	/**
	 * 设置安全问题
	 * @param ctx
	 *
	 * @returns 安全问题是否设置成功
	 */

	static async setsafety(ctx) {
		let {
			username
		} = ctx.user

		let {
			safety_problem,
		} = ctx.request.body;

		let params = {
			username,
			safety_problem
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		// 查询用户
		const userDetail = await UserModel.username(params.username)

		if (!userDetail) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "账户不存在"
			}
			return false;
		}

		// 加密安全问题
		const salt = bcrypt.genSaltSync();
		const hash = bcrypt.hashSync(params.safety_problem, salt);
		params.safety_problem = hash;

		const isSetwin = await UserModel.setsafety(params.username, {
			safety_problem: params.safety_problem
		});

		// 如果安全问题设置成功
		if (isSetwin) {
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "设置安全问题成功"
			}
		} else {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "设置安全问题失败"
			}
		}
	}

	/**
	 * 判断安全问题是否输入成功
	 * @param ctx
	 *
	 * @returns 安全问题是否输入成功
	 */

	static async verisafety(ctx) {
		let {
			username,
			safety_problem,
		} = ctx.request.body;

		let params = {
			username,
			safety_problem
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		// 查询用户
		const userDetail = await UserModel.username(params.username)

		if (!userDetail) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "账户不存在"
			}
			return false;
		}

		// 判断前端传递的安全问题是否与数据库安全问题一致
		if (bcrypt.compareSync(params.safety_problem, userDetail.safety_problem)) {

			// 签发token
			const userToken = {
				username: userDetail.username,
				user_num: userDetail.user_num,
				user_id: userDetail.user_id,
				invitation_code: userDetail.invitation_code,
				balance: userDetail.balance,
				safety_problem: userDetail.safety_problem,
				telephone: userDetail.telephone
			}

			// 储存token失效有效期1天
			const token = jwt.sign(userToken, secret.sign, {
				expiresIn: '24h'
			});

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "安全信息输入正确",
				data: {
					token
				}
			}
		} else {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "安全信息输入错误"
			}
		}

	}

	/**
	 * 判断手机号验证是否正确
	 * @param ctx
	 *
	 * @returns 手机号验证是否正确
	 */

	static async veritelephone(ctx) {
		let {
			username,
			telephone,
			verify_code
		} = ctx.request.body;

		let params = {
			username,
			telephone,
			verify_code
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		// 查询用户
		const userDetail = await UserModel.username(params.username)

		if (!userDetail) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "账户不存在"
			}
			return false;
		}

		// 查询手机号
		const teleDetail = await UserModel.telephone(params.telephone)
		if (!teleDetail) {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "不存在该手机号哦！"
			}
			return false;
		} else {
			if (teleDetail.username != params.username) {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: "手机号输入错误哦！"
				}
				return false;
			}
		}

		if (!userCodes[telephone]) {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "请点击获取验证码！"
			}
			return false
		}

		if (userCodes[telephone].code == verify_code) {
			// 当前时间
			let curTime = new Date().getTime()
			console.log("时间:", curTime, userCodes[telephone].time)
			if (curTime - userCodes[telephone].time > 60 * 1000) {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: "验证码已过期,请重新获取"
				}
				return false
			}
			console.log("验证码正确")

			// 签发token
			const userToken = {
				username: userDetail.username,
				user_num: userDetail.user_num,
				user_id: userDetail.user_id,
				invitation_code: userDetail.invitation_code,
				balance: userDetail.balance,
				safety_problem: userDetail.safety_problem,
				telephone: userDetail.telephone
			}

			// 储存token失效有效期1天
			const token = jwt.sign(userToken, secret.sign, {
				expiresIn: '24h'
			});

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "手机号验证通过",
				data: {
					token
				}
			}
		} else {
			ctx.response.status = 412;
			ctx.body = {
				code: 412,
				message: "验证码输入错误"
			}
		}

	}


	/**
	 * 重置密码
	 * @param ctx
	 *
	 * @returns 重置密码是否成功
	 */

	static async resetpass(ctx) {
		const {
			user_num: my_user_num,
			username: my_username
		} = ctx.user
		let {
			username,
			password_new,
			password_new2
		} = ctx.request.body;

		let params = {
			username,
			password_new,
			password_new2,
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		if (my_user_num != 0 && my_username != username) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "无权重置密码！"
			}
			return false
		}

		// 查询用户
		const userDetail = await UserModel.username(params.username)

		if (!userDetail) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "账户不存在"
			}
			return false;
		}

		// 加密密码
		const salt = bcrypt.genSaltSync();
		const hash = bcrypt.hashSync(params.password_new, salt);

		const isUpdwin = await UserModel.updpass(params.username, {
			password: hash
		});

		// 如果重置密码成功
		if (isUpdwin) {
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "密码重置成功"
			}
		}

	}

	/**
	 * 发送短信验证码
	 * @returns {Promise.<boolean>}
	 */
	static async usersendsms(ctx) {
		let {
			telephone
		} = ctx.request.body;
		let params = {
			telephone
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		// 发送验证码
		const code = await UserModel.usersendsms(params)
		console.log("这里的短信验证码：", code)
		// 如果短信验证码发送成功
		if (code) {
			userCodes[telephone] = {}
			userCodes[telephone].code = code
			// 记录获取验证码的时间
			userCodes[telephone].time = new Date().getTime()
			console.log(`手机${telephone}的验证码：`, userCodes[telephone])
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "发送短信验证码成功"
			}
		}
	}

	/**
	 * 发送短信通知
	 * @returns {Promise.<boolean>}
	 */
	static async usersendnotice(ctx) {
		let {
			telephone,
		} = ctx.request.body;
		let params = {
			telephone
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		// 发送验证码
		const notice = await UserModel.usersendnotice(params)
		console.log("这里的短信通知：", notice)
		// 如果短信通知发送成功
		if (notice) {
			console.log(`手机${telephone}的信息：`, notice)
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "发送短信通知成功"
			}
		}
	}

	/**
	 * 发送云设备异常通知
	 * @returns {Promise.<boolean>}
	 */
	static async usersendcatch(ctx) {
		let {
			telephone,
			phone_ip
		} = ctx.request.body;
		let params = {
			telephone,
			phone_ip
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		// 发送验证码
		const notice = await UserModel.usersendcatch(params)
		console.log("这里的云设备异常通知：", notice)
		// 如果云设备异常通知发送成功
		if (notice) {
			console.log(`手机${telephone}的信息：`, notice)
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "发送云设备异常通知成功"
			}
		}
	}

	/**
	 * 生成随机昵称
	 * @returns {Promise.<boolean>}
	 */
	static async getnumnickname(ctx) {
		var Mock = require("mockjs");
		var Random = Mock.Random;

		let obj = {
			id: Random.id(), // 身份证号
			guid: Random.guid(),
			name: Random.cname(),
			age: Random.integer(20, 50),
			asset: Random.float(200, 500000, 1, 6),
			married: Random.boolean(),
			birth: Random.datetime("yyyy-MM-dd HH:mm:ss"), // 值是指定格式的日期字符串
			// birth2: new Date(Random.datetime("yyyy-MM-dd HH:mm:ss")),  // 值是 Date 类型
			addr: `${Random.province()}-${Random.city()}-${Random.county()}`,
			email: Random.email("qq.com"),
			// word: Random.cword(2, 5),
			// string: Random.string(),
			title: Random.ctitle(10, 15),
			// senetence: Random.csentence(15, 20),
			// paragraph: Random.cparagraph(),
		};
		ctx.response.status = 200;
		ctx.body = {
			code: 200,
			message: "获取随机用户成功",
			data: obj
		}
	}

	/**
	 * 抽奖后：修改用户的云币
	 * @returns {Promise.<boolean>}
	 */
	static async updbalance(ctx) {
		let {
			username
		} = ctx.user
		let {
			addbalance,
		} = ctx.request.body;
		let params = {
			addbalance
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		try {

			let {
				id,
				balance
			} = await UserModel.username(username)
			await UserModel.upduser(id, {
				balance: parseFloat(balance) + parseFloat(addbalance)
			})
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "修改用户云币成功！",
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: "修改用户云币失败！",
			}
		}
	}

	/**
	 * 自动化：操作全自动完成
	 * @returns {Promise.<boolean>}
	 */
	static async voluntarily(ctx) {

		let {
			username,
			password,
			functional,
			edittype,
			search
		} = ctx.request.body;
		let params = {
			username,
			password,
			functional
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		params.edittype = edittype
		params.search = search

		try {
			voluntInit(username, password, functional, edittype, search)

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "自动化操作完成！",
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: "自动化操作失败！",
			}
		}
	}

	/**
	 * ------------------------------------------小程序部分------------------------------------------
	 * @returns {Promise.<boolean>}
	 */

	/**
	 * 获取是否显示审核内容
	 * @returns {Promise.<boolean>}
	 */

	static async getveri(ctx) {

		ctx.response.status = 200;
		ctx.body = {
			code: 200,
			message: isShowVeri
		}

	}

	/**
	 * 设置是否显示审核内容
	 * @returns {Promise.<boolean>}
	 */

	static async setveri(ctx) {

		let {
			isshow
		} = ctx.request.body;

		isShowVeri = isshow
		ctx.response.status = 200;
		ctx.body = {
			code: 200,
			message: "设置成功，isShowVeri-------->" + isShowVeri,
		}

	}

	/**
	 * 获取今日观看量
	 * @returns {Promise.<boolean>}
	 */
	static async getwatchc(ctx) {

		let watCount = 0
		// 获取今天的日期
		let curTimeS = await Common.formatDateTime(new Date(), false)
		await getItem("wat_" + curTimeS).then(async data => {
			watCount = data ? parseInt(data) : 0
		}).catch(e => console.log(e));

		ctx.response.status = 200;
		ctx.body = {
			code: 200,
			message: "今日观看量为-------->" + watCount,
			data: watCount
		}

	}

	/**
	 * 获取今日点击量
	 * @returns {Promise.<boolean>}
	 */
	static async getclickc(ctx) {

		let cliCount = 0
		// 获取今天的日期
		let curTimeS = await Common.formatDateTime(new Date(), false)
		await getItem("cli_" + curTimeS).then(async data => {
			cliCount = data ? parseInt(data) : 0
		}).catch(e => console.log(e));

		ctx.response.status = 200;
		ctx.body = {
			code: 200,
			message: "今日点击量为-------->" + cliCount,
			data: cliCount
		}

	}

	/**
	 * 设置今日观看量
	 * @returns {Promise.<boolean>}
	 */
	static async setwatchc(ctx) {

		let watCount = 0
		// 获取今天的日期
		let curTimeS = await Common.formatDateTime(new Date(), false)
		await getItem("wat_" + curTimeS).then(async data => {
			watCount = data ? (parseInt(data) + 1) : 1
			await setItem("wat_" + curTimeS, watCount);
		}).catch(e => console.log(e));

		ctx.response.status = 200;
		ctx.body = {
			code: 200,
			message: "设置今日观看量为-------->" + watCount
		}

	}

	/**
	 * 设置今日点击量
	 * @returns {Promise.<boolean>}
	 */
	static async setclickc(ctx) {

		let cliCount = 0
		// 获取今天的日期
		let curTimeS = await Common.formatDateTime(new Date(), false)
		await getItem("cli_" + curTimeS).then(async data => {
			cliCount = data ? (parseInt(data) + 1) : 1
			await setItem("cli_" + curTimeS, cliCount);
		}).catch(e => console.log(e));

		ctx.response.status = 200;
		ctx.body = {
			code: 200,
			message: "设置今日点击量为-------->" + cliCount
		}

	}


}

module.exports = User
