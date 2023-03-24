/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-05 23:45:56
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-08 17:31:52
 */
const moment = require('moment');
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		// 用户名
		username: {
			type: DataTypes.STRING(50),
			field: 'username',
			allowNull: false
		},
		// 用户密码
		password: {
			type: DataTypes.STRING(100),
			field: 'password',
			allowNull: false
		},
		// 用户等级
		user_num: {
			type: DataTypes.INTEGER,
			field: 'user_num',
			allowNull: false,
		},
		//用户id
		user_id: {
			type: DataTypes.INTEGER,
			field: 'user_id',
			allowNull: false,
		},
		//用户openid --通过微信注册的
		user_openid: {
			type: DataTypes.STRING(50),
			field: 'user_openid',
			allowNull: true,
			defaultValue: null
		},
		//推广id
		invitation_code: {
			type: DataTypes.INTEGER,
			field: 'invitation_code',
			allowNull: false,
		},
		//用户积分
		balance: {
			type: DataTypes.FLOAT(10, 2),
			field: 'balance',
			allowNull: true,
			defaultValue: 0
		},
		//安全问题
		safety_problem: {
			type: DataTypes.STRING(100),
			field: 'safety_problem',
			allowNull: true,
			defaultValue: ""
		},
		//电话号码
		telephone: {
			type: DataTypes.STRING(50),
			field: 'telephone',
			allowNull: true,
			defaultValue: ""
		},
		//用户昵称
		user_nickname: {
			type: DataTypes.STRING(50),
			field: 'user_nickname',
			allowNull: true
		},
		//用户备注
		user_remarks: {
			type: DataTypes.STRING(50),
			field: 'user_remarks',
			allowNull: true
		},
		//用户头像
		user_profile: {
			type: DataTypes.STRING(50),
			field: 'user_profile',
			allowNull: true
		},
		//充值云币
		rec_balances: {
			type: DataTypes.FLOAT(10, 2),
			field: 'rec_balances',
			allowNull: true,
			defaultValue: 0
		},
		//贵族等级
		noble_num: {
			type: DataTypes.INTEGER,
			field: 'noble_num',
			allowNull: true
		},
		//设备个数
		phone_count: {
			type: DataTypes.INTEGER,
			field: 'phone_count',
			allowNull: true,
			defaultValue: 0
		},
		// 是否禁用
		is_forbidden: {
			type: DataTypes.BOOLEAN,
			field: 'is_forbidden',
			allowNull: true,
			defaultValue: false
		},
		// 是否已体验
		is_experience: {
			type: DataTypes.BOOLEAN,
			field: 'is_experience',
			allowNull: true,
			defaultValue: false
		},
		// 登录状态
		login_status: {
			type: DataTypes.BOOLEAN,
			field: 'login_status',
			allowNull: true,
			defaultValue: false
		},
		createdAt: {
			type: DataTypes.DATE,
			field: 'createdAt',
		},
		updatedAt: {
			type: DataTypes.DATE,
			field: 'updatedAt',
		}
	}, {
		// 如果为 true 则表的名称和 model 相同，即 user
		// 为 false MySQL创建的表名称会是复数 users
		// 如果指定的表名称本就是复数形式则不变
		freezeTableName: true
	})
}
