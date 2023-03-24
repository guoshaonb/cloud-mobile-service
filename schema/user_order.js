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
	return sequelize.define('user_order', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		// 订单id
		order_id: {
			type: DataTypes.STRING(50),
			field: 'order_id',
			allowNull: false
		},
		// 订单价格
		order_price: {
			type: DataTypes.FLOAT(10, 2),
			field: 'order_price',
			allowNull: false
		},
		// 购买时长
		buy_duration: {
			type: DataTypes.STRING(50),
			field: 'buy_duration',
			allowNull: false,
		},
		// 购买后云币
		after_balance: {
			type: DataTypes.FLOAT(10, 2),
			field: 'after_balance',
			allowNull: false,
		},
		//是否到期
		is_expire: {
			type: DataTypes.BOOLEAN,
			field: 'is_expire',
			allowNull: true,
			defaultValue: false
		},
		// 购买时间
		createdAt: {
			type: DataTypes.DATE,
			field: 'createdAt',
		},
		updatedAt: {
			type: DataTypes.DATE,
			field: 'updatedAt',
		},
		// 到期时间
		expiration_date: {
			type: DataTypes.DATE,
			field: 'expiration_date',
		}
	}, {
		// 如果为 true 则表的名称和 model 相同，即 user
		// 为 false MySQL创建的表名称会是复数 users
		// 如果指定的表名称本就是复数形式则不变
		freezeTableName: true
	})
}
