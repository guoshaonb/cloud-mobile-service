/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-05 23:45:56
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-09 12:07:25
 */
const Router = require('koa-router')
const User = require('../controllers/User')
const User_Recharge = require('../controllers/User_recharge')
const User_Order = require('../controllers/User_order')
const Article = require('../controllers/Article')
const Category = require('../controllers/Category')
const UploadToken = require('../controllers/UploadToken')
const Phoneall = require('../controllers/Phoneall')
const Phoneprice = require('../controllers/Phoneprice')
const Game = require('../controllers/Game')
const Game_phone = require('../controllers/Game_phone')
const Announce = require('../controllers/Announce')
const User_log = require('../controllers/User_log')
const Routers = new Router({
    prefix: '/api/v1'
})

/**
 * 用户接口
 */
// 用户登录
Routers.post('/user/login', User.login);
// 用户退出登录
Routers.post('/user/logoff', User.logoff);
// 用户注册
Routers.post('/user/register', User.create);
// 微信 -->获取code
Routers.post('/user/wechat/code', User.wechatcode);
// 微信 -->获取加密信息
Routers.post('/user/wechat/decrypt', User.wechatdecrypt);
// 微信 -->查看用户是否已注册微信
Routers.post('/user/wechat/isregister', User.wxisregister);
// 微信 -->登录
Routers.post('/user/wechat/login', User.wxlogin);
// 微信 -->注册
Routers.post('/user/wechat/register', User.wxcreate);
// 密码修改
Routers.put('/user/updpass', User.updpass);
// 删除用户
Routers.delete('/user/delete/:id', User.delete);
// 禁用用户
Routers.put('/user/forbidden/:id', User.forbidden);
// 获取用户信息
Routers.get('/user/info', User.info);
// 获取用户列表
Routers.get('/user/list', User.list);
// 获取代理列表
Routers.get('/user/list/agents', User.agents);
// 获取某个代理下面的用户
Routers.get('/user/list/agents/users/:user_id', User.users);
// 获取用户的当前状态
Routers.get('/user/userstatus', User.userstatus);
// 绑定手机号
Routers.put('/user/bindtele', User.bindtele);
// 取消体验资格
Routers.put('/user/overexperience', User.overexperience);
// 恢复体验资格
Routers.post('/user/recoverexperience', User.recoverexperience);
// 编辑昵称
Routers.put('/user/updnickname', User.updnickname);
// 上传头像
Routers.post('/user/uploadimg', User.uploadimg);
// 设置安全问题
Routers.put('/user/setsafety', User.setsafety);
// 对比安全问题
Routers.post('/user/verisafety', User.verisafety);
// 重置密码
Routers.put('/user/resetpass', User.resetpass);
// 发送短信验证码
Routers.post('/user/usersendsms', User.usersendsms);
// 发送短信通知
Routers.post('/user/usersendnotice', User.usersendnotice);
// 发送云设备异常通知
Routers.post('/user/usersendcatch', User.usersendcatch);
// 判断手机号验证是否正确
Routers.post('/user/veritelephone', User.veritelephone);
// 生成随机昵称
Routers.get('/user/getnumnickname', User.getnumnickname);
// 抽奖后 --修改用户云币
Routers.put('/user/updbalance', User.updbalance);

/**
 *  小程序审核
 */
// 获取是否显示审核内容
Routers.get('/user/getveri', User.getveri);
// 设置是否显示审核内容
Routers.put('/user/setveri', User.setveri);
// 获取今日观看量
Routers.get('/user/getwatchc', User.getwatchc);
// 设置今日观看量
Routers.get('/user/setwatchc', User.setwatchc);
// 获取今日点击量
Routers.get('/user/getclickc', User.getclickc);
// 设置今日点击量
Routers.get('/user/setclickc', User.setclickc);

/**
 *  数据走势 --用户走势
 */
//获取注册用户总数
Routers.get('/user/list/counts', User.counts);
//获取今日的注册用户数量列表
Routers.get('/user/list/today', User.today);
//获取本周的注册用户数量列表
Routers.get('/user/list/thisweek', User.thisweek);

/**
 *  云币系统 
 */
//---------------------充值记录---------------------
//获取用户充值记录
Routers.get('/user/recharge/list', User_Recharge.list);
//生成一条充值记录
Routers.post('/user/recharge/create', User_Recharge.create);
//---------------------订单记录---------------------
//获取用户订单记录
Routers.get('/user/order/list', User_Order.list);
//查询某条订单的所有记录
Routers.get('/user/order/details/:gamePhoneId',User_Order.details);
//生成一条订单记录
Routers.post('/user/order/create', User_Order.create);
//更新某条订单记录
Routers.put('/user/order/update/:id', User_Order.update);

//---------------------设备价格---------------------
//获取价格选项列表
Routers.get('/phoneprice/list', Phoneprice.list);
//更新某一价格选项
Routers.put('/phoneprice/update/:id', Phoneprice.update);

/**
 * 文章接口
 */
// 创建文章
Routers.post('/article/create', Article.create);
// 获取文章详情
Routers.get('/article/detail/:id', Article.detail);
// 删除文章
Routers.delete('/article/hidden/:id', Article.hidden);
// 更新文章
Routers.put('/article/update/:id', Article.update);
// 获取文章列表
Routers.get('/article/list', Article.list);
// 搜索文章
Routers.get('/article/search', Article.search)

/**
 * 分类接口
 */
// 创建分类
Routers.post('/category/create', Category.create);
// 获取分类详情
Routers.get('/category/detail/:id', Category.detail);
// 删除分类
Routers.delete('/category/delete/:id', Category.delete);
// 更新分类
Routers.put('/category/update/:id', Category.update);
// 获取分类列表
Routers.get('/category/list', Category.list);
// 查询分类ID下的所有文章列表
Routers.get('/category/article/:id', Category.article);

/**
 * 上传token
 */
Routers.get('/upload/token', UploadToken.token)

/**
 *  设备列表接口
 */
// 获取总设备列表
Routers.get('/phoneall/list', Phoneall.list);
// 查询单一总设备
Routers.get('/phoneall/detail/:id', Phoneall.detail);
// 创建总设备
Routers.post('/phoneall/create', Phoneall.create);
// 删除总设备
Routers.delete('/phoneall/delete/:id', Phoneall.delete);
// 更新总设备
Routers.put('/phoneall/update/:id', Phoneall.update);
// 获取设备屏幕 
Routers.get('/phoneall/screen', Phoneall.screen);

/**
 *  游戏列表接口
 */
// 获取游戏列表
Routers.get('/game/list', Game.list);
// 查询单一游戏
Routers.get('/game/detail/:id', Game.detail);
// 查询当前游戏下面的设备列表
Routers.get('/game/phonelist/:id', Game.phonelist);
// 查询当前游戏下面的一台空闲设备
Routers.get('/game/phonefree/:id', Game.phonefree);
// 创建游戏
Routers.post('/game/create', Game.create);
// 更新游戏
Routers.put('/game/update/:id', Game.update);
// 删除游戏
Routers.delete('/game/delete/:id', Game.delete);

/**
 *  游戏设备接口
 */
// 获取游戏设备
Routers.get('/game_phone/list', Game_phone.list);
// 查询单一游戏设备
Routers.get('/game_phone/detail/:id', Game_phone.detail);
// 查询自己购买的设备
Routers.get('/game_phone/userphone', Game_phone.userphone);
// 创建游戏设备
Routers.post('/game_phone/create', Game_phone.create);
// 更新游戏设备
Routers.put('/game_phone/update/:id', Game_phone.update);
// 删除游戏设备
Routers.delete('/game_phone/delete/:id', Game_phone.delete);
// 用户更新设备备注
Routers.put('/game_phone/updremarks/:id', Game_phone.updremarks);
// 移除用户设备
Routers.put('/game_phone/resetphone/:id', Game_phone.resetphone);
// 用户购买设备 
Routers.put('/game_phone/buyphone/:id', Game_phone.buyphone);
// 批量操作[设置所属游戏|批量移除]
Routers.post('/game_phone/edits', Game_phone.edits);

/**
 *  数据走势 --购买设备走势
 */
//获取购买设备总数
Routers.get('/game_phone/list/counts', Game_phone.counts);
//获取今日的购买设备数量列表
Routers.get('/game_phone/list/today', Game_phone.today);
//获取本周的购买设备数量列表
Routers.get('/game_phone/list/thisweek', Game_phone.thisweek);

/**
 *  公告模块 
 */
// 查询公告列表
Routers.get('/announce/list', Announce.list);
// 查询公告详情
Routers.get('/announce/detail/:id', Announce.detail);
// 创建公告
Routers.post('/announce/create', Announce.create);
// 更新公告
Routers.put('/announce/update/:id', Announce.update);
// 删除公告
Routers.delete('/announce/delete/:id', Announce.delete);

/**
 *  日志模块 
 */
// 查询日志列表
Routers.get('/user_log/list', User_log.list);
// 创建一条日志
Routers.post('/user_log/create', User_log.create);
// 删除一条日志
Routers.delete('/user_log/delete/:id', User_log.delete);
module.exports = Routers