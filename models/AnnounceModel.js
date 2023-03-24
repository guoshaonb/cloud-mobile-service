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
const Announce = Sequelize.import('../schema/announce');
const Op = Sequelize.Op;
Announce.sync({
	force: false
});

class AnnounceModel {
	/**
	 * 创建公告
	 * @param data
	 * @returns {Promise<*>}
	 */
	static async create(data) {
		return await Announce.create(data)
	}

	/**
	 * 更新公告数据
	 * @param id  公告ID
	 * @param data  事项的状态
	 * @returns {Promise.<boolean>}
	 */
	static async update(id, data) {
		await Announce.update(data, {
			where: {
				id
			},
			fields: ['title', 'author', 'banner', 'linkurl', 'content','browser','sort']
		});
		return true
	}

	/**
	 * 获取公告列表
	 * @returns {Promise<*>}
	 */
	static async list(params) {
		let {keyword,pageIndex,pageSize} = params
		let myWhere = keyword ? {
			author: {
				// 模糊查询
				[Op.like]: '%' + keyword
			},
		} : null
		return await Announce.findAndCountAll({
			limit: parseInt(pageSize), //每页10条
			offset: (parseInt(pageIndex) - 1) * parseInt(pageSize),
			where: myWhere,
			attributes: ['id', 'title', 'author', 'banner', 'linkurl', 'content','browser','sort','createdAt','updatedAt'],
		})
	}

	/**
	 * 获取公告详情数据
	 * @param id 公告ID
	 * @returns {Promise<Model>}
	 */
	static async detail(id) {
		return await Announce.findOne({
			where: {
				id,
			},
		})
	}

	/**
	 * 根据公告名称查询
	 * @param Announce
	 * @returns {Promise.<*>}
	 */
	static async title(title) {
		return await Announce.findOne({
			where: {
				title
			}
		})
	}

	/**
	 * 删除公告
	 * @param id
	 * @returns {Promise.<boolean>}
	 */
	static async delete(id) {
		await Announce.destroy({
			where: {
				id,
			}
		})
		return true
	}

}

module.exports = AnnounceModel
