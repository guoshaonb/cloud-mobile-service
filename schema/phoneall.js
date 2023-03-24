/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-05 23:45:56
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-06 21:40:47
 */
const moment = require('moment');
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('phoneall', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		// 设备名
		phone_name: {
			type: DataTypes.STRING(50),
			field: 'phone_name',
			allowNull: false
		},
		// 设备ip 
		phone_ip: {
			type: DataTypes.STRING(50),
			field: 'phone_ip',
			allowNull: false,
		},
		// 分配的游戏
		distri_game: {
			type: DataTypes.STRING(50),
			field: 'distri_game',
			allowNull: true,
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
