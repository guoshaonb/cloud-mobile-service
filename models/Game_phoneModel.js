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
const Game = Sequelize.import('../schema/game');
const Game_Phone = Sequelize.import('../schema/game_phone');

Game.hasMany(Game_Phone); // 将会添加 game_id 到 GameModel 模型
Game_Phone.belongsTo(Game, { foreignKey: 'gameId' });
Game_Phone.sync({ force: false });
class Game_PhoneModel {
  /**
   * 创建游戏下设备
   * @param data 创建游戏下设备的参数
   * @returns {Promise<void>}
   */
  static async create(data) {
    return await Game_Phone.create(data)
  }

  /**
   * 更新设备数据
   * @param id 设备ID
   * @param data 设备更新的属性参数
   */
  static async update(id, data) {
    return await Game_Phone.update(data, {
      where: {
        id
      },
      fields: ['username', 'telephone', 'phone_name', 'phone_remarks', 'phone_ip', 'phone_status', 'gameId']
    });
  }

  /**
   * 获取设备列表
   * @returns {Promise<*>}
   */
  static async list(params) {
    return await Game_Phone.findAll({
      attributes: ['id', 'phone_name', 'phone_remarks', 'phone_ip', 'phone_status', 'username', 'gameId'],
    })
  }

  /**
   * 查询几天内的设备数据
   * @returns {Promise<*>}
   */
  static async findFewDaysPhoneList(n) {
    return await Game_Phone.findAll({
      where: {
        phone_status: 1,
        updatedAt: {
          [Op.lt]: new Date(),
          [Op.gt]: new Date(new Date() - n * 24 * 60 * 60 * 1000)
        }
      },
      attributes: ['id', 'phone_name', 'phone_remarks', 'phone_ip', 'phone_status', 'username', 'gameId', 'createdAt', 'updatedAt'],
    })
  }

  /**
   * 获取单一设备
   * @param id 设备ID
   * @returns {Promise<Model>}
   */
  static async detail(id) {
    return await Game_Phone.findOne({
      where: {
        id,
      },
      include: [{
        model: Game,
        where: { GameId: Sequelize.col('game_phone.GameId') }
      }],
    })
  }

	/**
	 * 获取单一设备
	 * @param id 设备ID
	 * @returns {Promise<Model>}
	 */
  static async detail_ip(phone_ip) {
    return await Game_Phone.findOne({
      where: {
        phone_ip,
      },
      include: [{
        model: Game,
        where: { GameId: Sequelize.col('game_phone.GameId') }
      }],
    })
  }

  /**
   * 获取用户购买的设备
   * @param username 用户名
   * @returns {Promise<Model>}
   */
  static async userphone(username) {
    return await Game_Phone.findAll({
      where: {
        [(username.length == 11 || (username.length == 4 && parseInt(username) > 0)) ? 'telephone' : 'username']: {
          // 模糊查询
          [Op.like]: '%' + username
        }
      },
      include: [{
        model: Game,
        where: { GameId: Sequelize.col('game_phone.GameId') }
      }],
    })
  }

  /**
   * 删除游戏下设备 --根据id删除
   * @param id 删除ID
   */
  static async delete(id) {
    return await Game_Phone.destroy({
      where: {
        id,
      }
    })
  }

	/**
	 * 删除游戏下设备 --根据ip删除
	 * @param id 删除ip
	 */
  static async delete_ip(phone_ip) {
    return await Game_Phone.destroy({
      where: {
        phone_ip,
      }
    })
  }


  /**
   * 用户更改设备备注
   * @param id  游戏ID
   * @param data  事项的状态
   * @returns {Promise.<boolean>}
   */
  static async updremarks(id, data) {
    await Game_Phone.update(data, {
      where: {
        id
      },
      fields: ['phone_remarks']
    });
    return true
  }

  /**
   * 用户购买设备 -- 暂时没有支付系统
   * @param id  游戏ID
   * @param data  事项的状态
   * @returns {Promise.<boolean>}
   */
  static async buyphone(id, data) {
    await Game_Phone.update(data, {
      where: {
        id
      },
      fields: ['phone_remarks', 'username', 'telephone', 'phone_status']
    });
    return true
  }
}

module.exports = Game_PhoneModel