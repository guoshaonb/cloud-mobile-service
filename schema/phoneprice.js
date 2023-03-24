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
	return sequelize.define('phoneprice', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		// 购买类型
		buy_type: {
			type: DataTypes.STRING(50),
			field: 'buy_type',
			allowNull: false,
		},
		// 购买价格
		buy_price: {
			type: DataTypes.FLOAT,
			field: 'buy_price',
			allowNull: false
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
