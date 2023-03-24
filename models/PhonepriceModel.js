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
const PhonePrice = Sequelize.import('../schema/phoneprice');
const Category = Sequelize.import('../schema/category');
PhonePrice.sync({ force: false });
Category.sync({ force: false });
class PhonePriceModel {

	/**
	 * 更新价格选项数据
	 * @param id  价格选项ID
	 * @param data  事项的状态
	 * @returns {Promise.<boolean>}
	 */
  static async update(id, data) {
    await PhonePrice.update(data, {
      where: {
        id
      },
      fields: ['buy_type', 'buy_price']
    });
    return true
  }

  /**
   * 获取价格选项列表
   * @returns {Promise<*>}
   */
  static async list(params) {
    return await PhonePrice.findAll({
      attributes: ['id', 'buy_type', 'buy_price'],
    })
  }

	/**
	 * 获取价格选项详情数据
	 * @param id 选项ID
	 * @returns {Promise<Model>}
	 */
  static async detail(id) {
    return await PhonePrice.findOne({
      where: {
        id,
      },
    })
  }

}

module.exports = PhonePriceModel