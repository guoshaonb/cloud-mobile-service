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
const User_Recharge = Sequelize.import('../schema/user_recharge');

User.hasMany(User_Recharge); // 将会添加 user_id 到 UserModel 模型
User_Recharge.belongsTo(User, { foreignKey: 'userId' });
User_Recharge.sync({ force: false });

class User_RechargeModel {
  /**
   * 生成一条充值记录
   * @param data 生成一条充值记录的参数
   * @returns {Promise<void>}
   */
  static async create(data) {
    return await User_Recharge.create(data)
  }

  /**
   * 获取充值记录列表
   * @returns {Promise<*>}
   */
  static async list(params) {
    let {
      keyword,
      pageIndex,
      pageSize
    } = params;

    let userWhere = keyword ? {
      UserId: Sequelize.col('User_Recharge.UserId'),
      [(keyword.length == 11 || (keyword.length == 4 && parseInt(keyword) > 0)) ? 'telephone' : 'username']: {
        // 模糊查询
        [Op.like]: '%' + keyword
      }
    } : {
        UserId: Sequelize.col('User_Recharge.UserId'),
      }
    return await User_Recharge.findAndCountAll({
      limit: parseInt(pageSize), //每页10条
      offset: (parseInt(pageIndex) - 1) * parseInt(pageSize),
      include: {
        model: User,
        where: userWhere,
        attributes: ["username", "telephone"]
      },
      attributes: ['recharge_id', 'recharge_balance', 'after_balance', 'createdAt', 'updatedAt'],
    })
  }

}

module.exports = User_RechargeModel