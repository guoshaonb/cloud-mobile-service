/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-06 16:21:36
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-08 20:35:16
 */
const db = require('../config/db');
const Sequelize = db.sequelize;
const Op = Sequelize.Op;
const User = Sequelize.import('../schema/user');
const User_Order = Sequelize.import('../schema/user_order');
const Game_Phone = Sequelize.import('../schema/game_phone');
User.hasMany(User_Order); // 将会添加 user_id 到 UserModel 模型
Game_Phone.hasMany(User_Order); // 将会添加 phoneId 到 Game_Phone 模型
User_Order.belongsTo(User, {
	foreignKey: 'userId'
});
User_Order.belongsTo(Game_Phone, {
	foreignKey: 'gamePhoneId'
});
User_Order.sync({
	force: false
});

class User_OrderModel {
	/**
	 * 生成一条订单记录
	 * @param data 生成一条订单记录的参数
	 * @returns {Promise<void>}
	 */
	static async create(data) {
		return await User_Order.create(data)
	}

	/**
	 * 更新一条订单记录
	 * @param id 更新ID
	 * @param data 记录更新的属性参数
	 */
	static async update(id, data) {
		return await User_Order.update(data, {
			where: {
				id
			},
			fields: ['expiration_date', 'is_expire']
		});
	}

	/**
	 * 设置为过期订单
	 * @param gamePhoneId 设备Id
	 * @param data 设置为过期的属性参数
	 */
	static async setoverdue(gamePhoneId, data) {
		return await User_Order.update(data, {
			where: {
				gamePhoneId
			},
			fields: ['is_expire']
		});
	}

	/**
	 * 获取订单列表
	 * @returns {Promise<*>}
	 */
	static async list(params) {

		let {
			keyword,
			is_expire,
			pageIndex,
			pageSize
		} = params;
		
		let userWhere = keyword ? {
			UserId: Sequelize.col('User_Order.userId'),
			[(keyword.length == 11 || (keyword.length == 4 && parseInt(keyword) > 0)) ? 'telephone' : 'username']: {
				// 模糊查询
				[Op.like]: '%' + keyword
			}
		} : {
			UserId: Sequelize.col('User_Order.userId'),
		}
		
		let myWhere = is_expire.indexOf("expire")!=-1 ? {
			is_expire: (is_expire == "no_expire" ? 0 : 1)
		} : null

		return await User_Order.findAndCountAll({
			limit: parseInt(pageSize), //每页10条
			offset: (parseInt(pageIndex) - 1) * parseInt(pageSize),
			include: [{
					model: User,
					where: userWhere,
					attributes: ["username", "telephone"]
				},
				{
					model: Game_Phone,
					where: {
						phoneId: Sequelize.col('User_Order.gamePhoneId'),
					},
					attributes: ["id","phone_name", "phone_ip"],
				}
			],
			where: myWhere,
			attributes: ['id','order_id', 'order_price', 'buy_duration', 'createdAt', 'updatedAt', 'expiration_date',
				'after_balance', 'is_expire'
			],
		})
	}

	/**
	 * 查询某条订单的记录
	 * ctx id 订单id
	 * @returns {Promise<*>}
	 */
	static async detail(id) {
		return await User_Order.findOne({
			where: {
				id,
			}
		})
	}
	
	/**
	 * 查询某条订单的所有记录
	 * ctx gamePhoneId 设备id
	 * @returns {Promise<*>}
	 */
	static async details(gamePhoneId) {
		return await User_Order.findAll({
			where: {
				gamePhoneId,
				is_expire: false
			}
		})
	}
	
	/**
	 * 移除订单记录
	 * @param gamePhoneId 设备Id
	 * @returns {Promise.<boolean>}
	 */
	static async delete(gamePhoneId) {
		await User_Order.destroy({
			where: {
				gamePhoneId,
			}
		})
		return true
	}

}

module.exports = User_OrderModel
