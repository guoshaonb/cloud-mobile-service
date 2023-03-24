/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-05 23:45:56
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-09 13:27:13
 */
const db = require('../config/db')
const Sequelize = db.sequelize
const User = Sequelize.import('../schema/user.js')
const {
	randomCode,
	sendCont
} = require("../utils/getMessage")
const Op = Sequelize.Op;
User.sync({
	force: false
});

class UserModel {
	/**
	 * 创建用户
	 * @param user
	 * @returns {Promise<boolean>}
	 */
	static async create(user) {
		let {
			username,
			password,
			user_num,
			user_id,
			invitation_code,
			telephone,
			user_nickname,
			user_openid,
			balance
		} = user;

		let params = {
			username,
			password,
			user_num,
			user_id,
			invitation_code,
			telephone,
			user_nickname,
			user_openid,
			balance
		}

		await User.create(params)
		return true

	}

	/**
	 * 删除用户
	 * @param id listID
	 * @returns {Promise.<boolean>}
	 */
	static async delete(id) {
		await User.destroy({
			where: {
				id,
			}
		})
		return true
	}

	/**
	 * 禁用用户
	 * @param id 用户ID
	 * @param data 用户ID
	 */
	static async forbidden(id, data) {
		return await User.update(data, {
			where: {
				id,
			},
			fields: ['is_forbidden']
		})
	}

	/**
	 * 查询用户列表
	 * @returns {Promise<*>}
	 */
	static async findAllUserList(params) {
		let {
			keyword,
			login_status
		} = params
		let myWhere = login_status ? {
			login_status: login_status == 'online' ? 1 : 0
		} : (keyword ? {
			[(keyword.length == 11 || (keyword.length == 4 && parseInt(keyword) > 0)) ? 'telephone' : 'username']: {
				// 模糊查询
				[Op.like]: '%' + keyword
			}
		} : null)
		return await User.findAll({
			where: myWhere,
			attributes: ['id', 'username', 'user_num', 'user_id', 'balance', 'invitation_code', 'telephone', 'phone_count',
				'is_forbidden', 'user_nickname', 'user_remarks', 'rec_balances', 'noble_num', 'createdAt', 'updatedAt'
			]
		})
	}

	/**
	 * 查询代理列表
	 * @returns {Promise<*>}
	 */
	static async findAagentUserList(params) {
		let {
			keyword,
			pageIndex,
			pageSize
		} = params

		let where = keyword ? {
			user_num: 1,
			username: keyword
		} : {
			user_num: 1
		}

		return await User.findAndCountAll({
			limit: parseInt(pageSize), //每页10条
			offset: (parseInt(pageIndex) - 1) * parseInt(pageSize),
			where: where,
			attributes: ['id', 'username', 'balance', 'user_id', 'createdAt', 'updatedAt']
		})
	}

	/**
	 * 查询代理下面的用户
	 * @returns {Promise<*>}
	 */
	static async findCommonUserList(params) {
		let {
			user_id,
			keyword,
			filterType,
			pageIndex,
			pageSize
		} = params

		let where = keyword ? {
			user_num: 2,
			invitation_code: user_id,
			[(keyword.length == 11 || (keyword.length == 4 && parseInt(keyword) > 0)) ? 'telephone' : 'username']: {
				// 模糊查询
				[Op.like]: '%' + keyword
			}
		} : {
			user_num: 2,
			invitation_code: user_id
		}

		if (filterType == "weixin") {
			where.user_openid = {
				[Op.not]: null
			}
		} else if (filterType == "common") {
			where.user_openid = null
		}

		return await User.findAndCountAll({
			limit: parseInt(pageSize), //每页10条
			offset: (parseInt(pageIndex) - 1) * parseInt(pageSize),
			where: where,
			attributes: ['id', 'username', 'user_id', 'balance', 'invitation_code', 'telephone', 'phone_count',
				'is_forbidden', 'user_nickname', 'user_remarks', 'rec_balances', 'noble_num', 'createdAt', 'updatedAt'
			]
		})
	}

	/**
	 * 查询几天内的用户数据
	 * @returns {Promise<*>}
	 */
	static async findFewDaysUserList(n) {
		return await User.findAll({
			where: {
				createdAt: {
					[Op.lt]: new Date(),
					[Op.gt]: new Date(new Date() - n * 24 * 60 * 60 * 1000)
				}
			},
			attributes: ['id', 'username', 'user_id', 'balance', 'invitation_code', 'telephone', 'phone_count',
				'is_forbidden', 'user_nickname', 'user_remarks', 'rec_balances', 'noble_num', 'createdAt', 'updatedAt'
			]
		})
	}

	/**
	 * 查询用户信息 
	 * @param username  用户名
	 * @returns {Promise.<*>}
	 */
	static async username(username) {
		return await User.findOne({
			where: {
				[(username.length == 11 || (username.length == 4 && parseInt(username) > 0)) ? 'telephone' : 'username']: {
					// 模糊查询
					[Op.like]: '%' + username
				},
			}
		})
	}

	/**
	 * 查询用户信息 --根据user_openid查询
	 * @param user_openid  微信登录后的唯一标识
	 * @returns {Promise.<*>}
	 */
	static async user_openid(user_openid) {
		return await User.findOne({
			where: {
				user_openid
			}
		})
	}

	/**
	 * 查询用户信息 --根据手机号查询
	 * @param telephone  手机号
	 * @returns {Promise.<*>}
	 */
	static async telephone(telephone) {
		return await User.findOne({
			where: {
				telephone
			}
		})
	}

	/**
	 * 查询用户信息 --根据用户id查询
	 * @param id  用户id
	 * @returns {Promise.<*>}
	 */
	static async find_id(id) {
		return await User.findOne({
			where: {
				id
			}
		})
	}

	/**
	 * 查询用户当前状态 
	 * @param username  姓名
	 * @returns {Promise.<*>}
	 */
	static async userstatus(username) {
		return await User.findOne({
			where: {
				username
			},
			attributes: ['id', 'username', 'user_id', 'user_num', 'invitation_code', 'telephone', 'balance', 'phone_count',
				'is_experience', 'is_forbidden', 'user_nickname', 'user_remarks', 'user_profile', 'rec_balances', 'noble_num'
			]
		})
	}

	/**
	 * 修改用户密码
	 * @param username  用户名
	 * @returns {Promise.<boolean>}
	 */
	static async updpass(username, data) {
		await User.update(data, {
			where: {
				[(username.length == 11 || (username.length == 4 && parseInt(username) > 0)) ? 'telephone' : 'username']: {
					// 模糊查询
					[Op.like]: '%' + username
				},
			},
			fields: ['password']
		});
		return true
	}

	/**
	 * 绑定手机号
	 * @param username  用户名
	 * @returns {Promise.<boolean>}
	 */
	static async bindtele(username, data) {
		await User.update(data, {
			where: {
				username
			},
			fields: ['telephone']
		});
		return true
	}

	/**
	 * 更新体验资格
	 * @param username  用户名
	 * @returns {Promise.<boolean>}
	 */
	static async updexperience(username, data) {
		await User.update(data, {
			where: {
				username
			},
			fields: ['is_experience']
		});
		return true
	}

	/**
	 * 更新登录状态
	 * @param login_status  登录状态
	 * @returns {Promise.<boolean>}
	 */
	static async updloginstatus(username, data) {
		await User.update(data, {
			where: {
				username
			},
			fields: ['login_status']
		});
		return true
	}

	/**
	 * 编辑昵称
	 * @param username  用户名
	 * @returns {Promise.<boolean>}
	 */
	static async updnickname(username, data) {
		await User.update(data, {
			where: {
				username
			},
			fields: ['user_nickname']
		});
		return true
	}

	/**
	 * 上传头像
	 * @param username  用户名
	 * @returns {Promise.<boolean>}
	 */
	static async uplprofile(username, data) {
		await User.update(data, {
			where: {
				username
			},
			fields: ['user_profile']
		});
		return true
	}

	/**
	 * 设置安全问题
	 * @param username  用户名
	 * @returns {Promise.<boolean>}
	 */
	static async setsafety(username, data) {
		await User.update(data, {
			where: {
				username
			},
			fields: ['safety_problem']
		});
		return true
	}

	/**
	 * 更新用户数据
	 * @param id  用户id
	 * @param balance  云币
	 * @returns {Promise.<boolean>}
	 */
	static async upduser(id, data) {
		await User.update(data, {
			where: {
				id
			},
			fields: ['balance', 'rec_balances', 'noble_num', 'phone_count']
		});
		return true
	}

	/**
	 * 发送短信验证码
	 * @returns {Promise.<boolean>}
	 */
	static async usersendsms(params) {
		let {
			telephone
		} = params
		let code = randomCode(6); //生成6位数字随机验证码
		sendCont(telephone, code, 'sms', function(success) {
			console.log("是否发送成功", success)
		})
		return code
	}

	/**
	 * 发送短信通知
	 * @returns {Promise.<boolean>}
	 */
	static async usersendnotice(params) {
		let {
			telephone
		} = params
		sendCont(telephone, "", 'notice', function(success) {
			console.log("是否发送成功", success)
		})
		return "发送成功"
	}
	
	/**
	 * 发送云设备异常通知
	 * @returns {Promise.<boolean>}
	 */
	static async usersendcatch(params) {
		let {
			telephone,
			phone_ip
		} = params
		sendCont(telephone, phone_ip, 'catch', function(success) {
			console.log("是否发送成功", success)
		})
		return "发送成功"
	}
}

module.exports = UserModel
