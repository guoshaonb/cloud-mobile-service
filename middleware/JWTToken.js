const jwt = require('jsonwebtoken')
const secret = require('../config/secret')
const util = require('util')
const verify = util.promisify(jwt.verify)
const JWTPath = require('./JWTPath')

/**
 * 判断token是否可用
 */
module.exports = function() {
	return async function(ctx, next) {
		// 检测过滤的路由就不做解析JWT了
		if (JWTPath.find(item => item === ctx.request.url)) {
			await next()
			return false;
		}

		try {
			// 获取jwt
			const token = ctx.header.authorization
			if (token) {
				let payload
				try {
					// 解密payload，获取用户数据
					payload = await verify(token.split(' ')[1], secret.sign)
					ctx.user = {
						id: payload.id,
						username: payload.username,
						user_num: payload.user_num,
						user_id: payload.user_id,
						invitation_code: payload.invitation_code,
						balance: payload.balance,
						safety_problem: payload.safety_problem,
						telephone: payload.telephone,
						is_experience: payload.is_experience,
						user_nickname: payload.user_nickname,
						noble_num: payload.noble_num,
					}
				} catch (err) {
					ctx.status = 401;
					ctx.body = {
						code: 401,
						message: "Token身份无效!"
					}
				}
			}
			await next()

		} catch (err) {
			if (err.status === 401) {
				ctx.status = 401;
				ctx.body = {
					code: 401,
					err
				}
			} else {
				ctx.status = 500;
				ctx.body = {
					code: 500,
					err
				}
			}
		}
		
	}
}
