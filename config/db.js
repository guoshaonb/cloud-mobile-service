/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-05 23:45:56
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-07 12:06:16
 */
const Sequelize = require('sequelize');

/**
 *
 * 配置数据库
 *
 * 第一个参数 boblog    数据库名字
 * 第二个参数 root      数据库名字
 * 第三个参数 password  数据库密码
 */

//本地环境
const localObj = {
  environ: "本地",
  basename: 'xingyueyun',
  username: 'root',
  password: '123456',
  host: 'localhost'
}

//服务器环境
const serverObj = {
  environ: "服务器",
  basename: 'xingyueyun',
  username: 'guoshao_yun',
  password: '123456',
  host: 'localhost'
}

const connObj = __dirname.includes("yunserver") ? serverObj : localObj
const { basename, username, password } = connObj || {}
const sequelize = new Sequelize(basename, username, password, {
  host: connObj["host"],
  port: '3306',
  dialect: 'mysql',
  operatorsAliases: false,
  dialectOptions: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
    supportBigNumbers: true,
    bigNumberStrings: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+08:00' //东八时区
});

module.exports = {
  sequelize
}