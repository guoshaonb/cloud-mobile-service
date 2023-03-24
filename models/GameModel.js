/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-06 16:35:58
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-08 19:55:55
 */
const db = require('../config/db');
const Sequelize = db.sequelize;
const Game = Sequelize.import('../schema/game');
const Game_Phone = Sequelize.import('../schema/game_phone');
const Op = Sequelize.Op;
Game.sync({
	force: false
});

class GameModel {
	/**
	 * 创建游戏
	 * @param data
	 * @returns {Promise<*>}
	 */
	static async create(data) {
		return await Game.create(data)
	}

	/**
	 * 更新游戏数据
	 * @param id  游戏ID
	 * @param data  事项的状态
	 * @returns {Promise.<boolean>}
	 */
	static async update(id, data) {
		await Game.update(data, {
			where: {
				id
			},
			fields: ['game_name', 'game_logo', 'game_introduce', 'sort', 'phone_count']
		});
		return true
	}

	/**
	 * 获取游戏列表
	 * @returns {Promise<*>}
	 */
	static async list(keyword) {
		let where = keyword ? {
			game_name: {
				// 模糊查询
				[Op.like]: '%' + keyword
			},
		} : null
		return await Game.findAll({
			where: where,
			order: ['sort'],
			attributes: ['id', 'game_name', 'game_logo', 'game_introduce', 'sort', 'phone_count'],
		})
	}

	/**
	 * 查询设备
	 * @returns {Promise<*>}
	 */
	static async phonesearch(params) {
		let {
			keyword,
			phone_ip
		} = params
		let where
		if (keyword) {
			where = {
				[(keyword.length == 11 || (keyword.length == 4 && parseInt(keyword) > 0)) ? 'telephone' : 'username']: {
					// 模糊查询
					[Op.like]: '%' + keyword
				}
			}
		} else if (phone_ip) {
			where = {
				phone_ip
			}
		} else {
			where = null
		}

		return await Game_Phone.findAll({
			where: where
		})
	}

	// 查询当前游戏下的所有设备
	static async phonelist(id) {
		return await Game.findAll({
			where: {
				id,
			},
			include: [{
				model: Game_Phone
			}]
		})
	}


	/**
	 * 获取游戏详情数据
	 * @param id 游戏ID
	 * @returns {Promise<Model>}
	 */
	static async detail(id) {
		return await Game.findOne({
			where: {
				id,
			},
		})
	}

	/**
	 * 根据游戏名称查询
	 * @param Game
	 * @returns {Promise.<*>}
	 */
	static async game_name(game_name) {
		return await Game.findOne({
			where: {
				game_name
			}
		})
	}

	/**
	 * 删除游戏
	 * @param id
	 * @returns {Promise.<boolean>}
	 */
	static async delete(id) {
		await Game.destroy({
			where: {
				id,
			}
		})
		return true
	}

}

module.exports = GameModel
