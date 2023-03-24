/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-05 23:45:56
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-06 14:09:05
 */
module.exports = [
  // 文章列表
  /^\/api\/v1\/article\/list/,
  // 文章详情
  /^\/api\/v1\/article\/detail/,
  // 文章搜索
  /^\/api\/v1\/article\/search/,
  // 上传token
  /^\/api\/v1\/upload\/token/,
  // 注册
  /^\/api\/v1\/user\/register/,
  // 登录
  /^\/api\/v1\/user\/login/,
  // 微信登录 
  /^\/api\/v1\/user\/wechat/,
  // --找回密码 校验安全问题
  /^\/api\/v1\/user\/verisafety/,
  // --找回密码 校验手机号验证
  /^\/api\/v1\/user\/veritelephone/,
  // --获取所有的设备
  /^\/api\/v1\/phoneall\/list/,
  // --获取设备屏幕
  /^\/api\/v1\/phoneall\/screen/,
  // 发送短信验证码
  /^\/api\/v1\/user\/usersendsms/,
  // 发送短信通知
  /^\/api\/v1\/user\/usersendnotice/,
  // 发送云设备异常通知
  /^\/api\/v1\/user\/usersendcatch/,
  // 生成随机昵称
  /^\/api\/v1\/user\/getnumnickname/,
  // 获取今日观看量
  /^\/api\/v1\/user\/getwatchc/,
  // 设置今日观看量
  /^\/api\/v1\/user\/setwatchc/,
  // 获取今日点击量
  /^\/api\/v1\/user\/getclickc/,
  // 设置今日点击量
  /^\/api\/v1\/user\/setclickc/,
  // 获取是否显示审核内容
  /^\/api\/v1\/user\/getveri/,
  // 设置是否显示审核内容
  /^\/api\/v1\/user\/setveri/,
  // 分类列表
  /^\/api\/v1\/category\/list/,
  // 分类文章
  /^\/api\/v1\/category\/article/,
  // 分类列表
  /^\/api\/v1\/category\/article\/list/,
  // 游戏列表
  /^\/api\/v1\/game\/list/,
  // 游戏设备列表
  /^\/api\/v1\/game_phone\/list/
]