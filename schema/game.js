/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-05 23:45:56
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-08 14:36:12
 */
const moment = require('moment');
module.exports = function (sequelize, DataTypes) {
	return sequelize.define('game', {
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		// 游戏名
		game_name: {
			type: DataTypes.STRING(50),
			field: 'game_name',
			allowNull: false
		},
		// 游戏logo
		game_logo: {
			type: DataTypes.STRING(100),
			field: 'game_logo',
			allowNull: true,
			defaultValue: ""
		},
		//游戏介绍
		game_introduce: {
			type: DataTypes.STRING(255),
			field: 'game_introduce',
			allowNull: true,
			defaultValue: ""
		},
		// 设备数量
		phone_count: {
			type: DataTypes.INTEGER,
			field: 'phone_count',
			allowNull: true,
			defaultValue: 0
		},
		// 权重
		sort: {
			type: DataTypes.INTEGER,
			field: 'sort',
			allowNull: true,
			defaultValue: 0
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
