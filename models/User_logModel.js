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
const User_Log = Sequelize.import('../schema/user_log');
const Game_Phone = Sequelize.import('../schema/game_phone');
User.hasMany(User_Log); // 将会添加 user_id 到 UserModel 模型
Game_Phone.hasMany(User_Log); // 将会添加 phoneId 到 Game_Phone 模型
User_Log.belongsTo(User, {
	foreignKey: 'userId'
});
User_Log.belongsTo(Game_Phone, {
	foreignKey: 'gamePhoneId'
});
User_Log.sync({
	force: false
});

class User_LogModel {
	/**
	 * 生成一条日志记录
	 * @param data 生成一条日志记录的参数
	 * @returns {Promise<void>}
	 */
	static async create(data) {
		return await User_Log.create(data)
	}

	/**
	 * 获取日志列表
	 * @returns {Promise<*>}
	 */
	static async list(params) {

		let {
			keyword,
			pageIndex,
			pageSize,
			hours,
			isPageShow
		} = params;

		let userWhere = keyword ? {
			UserId: Sequelize.col('User_Log.userId'),
			[(keyword.length == 11 || (keyword.length == 4 && parseInt(keyword) > 0)) ? 'telephone' : 'username']: {
				// 模糊查询
				[Op.like]: '%' + keyword
			}
		} : {
			UserId: Sequelize.col('User_Log.userId'),
		}

		let myWhere = hours ? {
			createdAt: {
				[Op.lt]: new Date(),
				[Op.gt]: new Date(new Date() - hours * 60 * 60 * 1000)
			}
		} : null

		if (isPageShow == "yes") {
			return await User_Log.findAndCountAll({
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
							phoneId: Sequelize.col('User_Log.gamePhoneId'),
						},
						attributes: ["phone_name", "phone_ip"],
					}
				],
				where: myWhere,
				attributes: ['id', 'name', 'content', 'imgurl', 'createdAt', 'updatedAt'],
			})
		} else {
			return await User_Log.findAll({
				include: [{
						model: User,
						where: userWhere,
						attributes: ["username", "telephone"]
					},
					{
						model: Game_Phone,
						where: {
							phoneId: Sequelize.col('User_Log.gamePhoneId'),
						},
						attributes: ["phone_name", "phone_ip"],
					}
				],
				where: myWhere,
				attributes: ['id', 'name', 'content', 'imgurl', 'createdAt', 'updatedAt'],
			})
		}

	}

	/**
	 * 删除日志
	 * @param id listID
	 * @returns {Promise.<boolean>}
	 */
	static async delete(id) {
		await User_Log.destroy({
			where: {
				id,
			}
		})
		return true
	}
}

module.exports = User_LogModel
