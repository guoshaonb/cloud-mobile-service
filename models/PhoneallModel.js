/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-05 23:45:56
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-07 11:24:42
 */
const db = require('../config/db')
const Sequelize = db.sequelize
const Phoneall = Sequelize.import('../schema/phoneall.js')
const Op = Sequelize.Op;
Phoneall.sync({
	force: false
});

class PhoneallModel {
	/**
	 * 创建设备
	 * @param phone
	 * @returns {Promise<boolean>}
	 */
	static async create(data) {
		return await Phoneall.create(data)
	}

	/**
	 * 删除设备
	 * @param id listID
	 * @returns {Promise.<boolean>}
	 */
	static async delete(id) {
		await Phoneall.destroy({
			where: {
				id,
			}
		})
		return true
	}

	/**
	 * 更新设备数据
	 * @param id  设备ID
	 * @param data  事项的状态
	 * @returns {Promise.<boolean>}
	 */
	static async update(id, data) {
		await Phoneall.update(data, {
			where: {
				id
			},
			fields: ['phone_name', 'phone_ip', 'distri_game']
		});
		return true
	}

	/**
	 * 更新设备占用情况
	 * @param ip  设备ip
	 * @param data  事项的状态
	 * @returns {Promise.<boolean>}
	 */
	static async upd_dis_game(phone_ip, data) {
		await Phoneall.update(data, {
			where: {
				phone_ip
			},
			fields: ['distri_game']
		});
		return true
	}


	/**
	 * 查询设备列表
	 * @returns {Promise<*>}
	 */
	static async findAllPhoneallList(params) {

		let {
			keyword,
			phone_name,
			phone_ip,
			pageIndex,
			pageSize
		} = params;
		let where = null
		if (keyword && phone_name) {
			where = {
				[Op.or]: [{
						distri_game: keyword
					},
					{
						distri_game: 'false'
					},
					{
						distri_game: '0'
					},
					{
						distri_game: null
					},
				],
				phone_name: phone_name
			}
		} else if (keyword) {
			where = {
				[Op.or]: [{
						distri_game: keyword
					},
					{
						distri_game: 'false'
					},
					{
						distri_game: '0'
					},
					{
						distri_game: null
					},
				],
			}
		} else if (phone_name) {
			where = {
				phone_name
			}
		} else if (phone_ip) {
			where = {
				phone_ip
			}
		}

		return await Phoneall.findAndCountAll({
			limit: parseInt(pageSize), //每页10条
			offset: (parseInt(pageIndex) - 1) * parseInt(pageSize),
			where: where,
			attributes: ['id', 'phone_name', 'phone_ip', 'distri_game']
		})
	}

	/**
	 * 获取设备详情数据
	 * @param id  设备ID
	 * @returns {Promise<Model>}
	 */
	static async detail(id) {
		return await Phoneall.findOne({
			where: {
				id,
			},
		})
	}

	/**
	 * 根据设备名称查询
	 * @param phone_name
	 * @returns {Promise.<*>}
	 */
	static async phone_name(phone_name) {
		return await Phoneall.findOne({
			where: {
				phone_name
			}
		})
	}
}

module.exports = PhoneallModel
