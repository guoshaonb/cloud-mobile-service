const GameModel = require('../models/GameModel')
const PhoneallModel = require('../models/PhoneallModel')
const Game_PhoneModel = require('../models/Game_phoneModel')
const UserModel = require('../models/UserModel');
const User_orderModel = require('../models/User_orderModel')
const Common = require("../utils/common")
class Game_Phone {
	/**
	 * 分配设备
	 */
	static async create(ctx) {
		// 接收参数
		let {
			phone_name,
			phone_ip,
			gameId
		} = ctx.request.body;

		let params = {
			phone_name,
			phone_ip,
			gameId
		}

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		try {

			// 查询游戏是否存在
			let detail = await GameModel.detail(gameId);

			if (!detail) {
				ctx.response.status = 412;
				ctx.body = {
					code: 412,
					message: `游戏ID：${gameId}，不存在！`
				}
				return false;
			}

			// 创建设备
			const {
				id
			} = await Game_PhoneModel.create(params);
			// 获取游戏里面的count属性
			const phonelist = await GameModel.phonelist(gameId);
			const game_phones = phonelist[0].game_phones
			const phone_count = game_phones.length
			// 游戏里面的count属性+1
			await GameModel.update(gameId, {
				phone_count: phone_count + 1
			});
			// 查询设备列表
			const data = await Game_PhoneModel.detail(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `分配设备成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `分配设备失败`,
				data: err
			}
		}

	}

	/**
	 * 获取设备列表
	 * @param ctx
	 *
	 * @returns 设备列表数据
	 */
	static async list(ctx) {
		try {
			const data = await Game_PhoneModel.list();
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `查询设备列表成功`,
				data
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `查询设备列表失败`,
				data: err
			}
		}
	}

	/**
	 * 获取购买设备总数
	 * @param ctx
	 *
	 * @returns 购买设备总数数据
	 */
	static async counts(ctx) {
		try {
			const data = await Game_PhoneModel.list();
			let length = data.filter(item=>item.phone_status == 1).length
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "获取成功",
				data: length
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: err
			}
		}
	}

	/**
	 * 获取今日的购买设备列表
	 * @param ctx
	 *
	 * @returns 今日的购买设备列表数据
	 */
	static async today(ctx) {
		try {
			const data = await Game_PhoneModel.findFewDaysPhoneList(1);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "获取成功",
				data: data.length
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: err
			}
		}
	}

	/**
	 * 获取本周的购买设备列表
	 * @param ctx
	 *
	 * @returns 本周的购买设备列表数据
	 */
	static async thisweek(ctx) {
		try {
			const data = await Game_PhoneModel.findFewDaysPhoneList(7);
			let list_data = await Common.getCounts(data)
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "获取成功",
				data: list_data
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: err
			}
		}
	}

	/**
	 * 查询单一设备
	 * @param ctx id  设备ID
	 *
	 * @returns 单一设备
	 */
	static async detail(ctx) {
		// 设备ID
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		try {

			let data = await Game_PhoneModel.detail(id);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `查询单一设备成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `查询失败`,
				data: err
			}
		}

	}

	/**
	 * 查询某个用户购买的设备
	 *
	 * @returns 某个用户购买的设备
	 */
	static async userphone(ctx) {
		let {
			username,
			telephone,
			user_num
		} = ctx.user;
		
		try {

			let data = await Game_PhoneModel.userphone(user_num == 2 ? telephone : username);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `查询用户购买的设备成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `查询失败`,
				data: err
			}
		}

	}

	/**
	 * 删除设备
	 * @param ctx id 设备ID
	 * @returns  删除成功返回true，失败返回错误原因
	 */
	static async delete(ctx) {
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		try {
			//查找对应的gameId
			const {
				gameId
			} = await Game_PhoneModel.detail(id);
			// 获取游戏里面的count属性
			const phonelist = await GameModel.phonelist(gameId);
			const game_phones = phonelist[0].game_phones
			const phone_count = game_phones.length
			if (phone_count > 0) {
				// 游戏里面的count属性-1
				await GameModel.update(gameId, {
					phone_count: phone_count - 1
				});
			}
			await Game_PhoneModel.delete(id);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: "删除设备成功"
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: err
			}
		}
	}

	/**
	 * 批量操作[设置所属游戏|批量移除]
	 * @param ctx ids       设备ids
	 * @param ctx gameId           游戏id
	 *
	 * @returns 批量操作则返回批量操作的设备数据，失败返回更新失败的原因
	 */

	static async edits(ctx) {

		// 接收参数
		let {
			type,
			ips,
			gameId,
			distri_game
		} = ctx.request.body;
		let ipsArr = ips && ips.split(',')
		let params = {
			type,
			ips: ipsArr,
			gameId,
			distri_game
		}
		if (type == 1) delete params.distri_game
		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		try {

			const phonelist = await GameModel.phonelist(gameId);
			const game_phones = phonelist[0].game_phones
			let phone_count = game_phones.length
			//批量设置所属游戏|批量移除

			for (let i = 0; i < ipsArr.length; i++) {
				if (type == 0) {
					phone_count++
					// 游戏里面的count属性+1
					await GameModel.update(gameId, {
						phone_count: phone_count
					});

					await Game_PhoneModel.create({
						phone_name: "云设备-" + await Common.randomNum(4),
						phone_ip: ipsArr[i],
						gameId: gameId
					});

					await PhoneallModel.upd_dis_game(ipsArr[i], {
						distri_game: distri_game
					});
				} else {
					//看是否有用户已占用
					const {
						username
					} = await Game_PhoneModel.detail_ip(ipsArr[i])
					if (username) {
						ctx.response.status = 412;
						ctx.body = {
							code: 412,
							message: `分配设备失败!设备ip为${ipsArr[i]}的,已被用户${username}购买！`,
						}
						console.log("------------------被占用了------------------")
						return
					} else {
						if (phone_count > 0) {
							phone_count--
							// 游戏里面的count属性-1
							await GameModel.update(gameId, {
								phone_count: phone_count
							});
						}
						await Game_PhoneModel.delete_ip(ipsArr[i]);
						await PhoneallModel.upd_dis_game(ipsArr[i], {
							distri_game: 0
						});
					}
				}
			}
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: type == 0 ? `批量设置成功` : `批量移除成功`,
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: type == 0 ? `批量设置失败` : `批量移除失败`,
				data: err
			}
		}
	}

	/**
	 * 更新设备数据
	 * @param ctx phone_name       设备名称
	 * @param ctx phone_ip         设备ip
	 * @param ctx gameId           游戏id
	 *
	 * @returns 更新成功则返回更新后的设备数据，失败返回更新失败的原因
	 */
	static async update(ctx) {
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		// 接收参数
		let {
			phone_name,
			phone_remarks,
			phone_ip,
			phone_status,
			gameId
		} = ctx.request.body;

		let params = {
			phone_name,
			phone_remarks,
			phone_ip,
			phone_status,
			gameId
		}

		if (!phone_name) delete params.phone_name
		if (!phone_remarks) delete params.phone_remarks
		if (!phone_ip) delete params.phone_ip
		if (!phone_status) delete params.phone_status
		if (!gameId) delete params.gameId

		try {

			await Game_PhoneModel.update(id, params);
			let data = await Game_PhoneModel.detail(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `更新设备成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `更新设备失败`,
				data: err
			}
		}
	}

	/**
	 * 用户更改设备备注
	 * @param ctx phone_remarks       设备备注
	 * @param ctx id                  设备id
	 *
	 * @returns 更新成功则返回更新后的设备数据，失败返回更新失败的原因
	 */
	static async updremarks(ctx) {
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		// 接收参数
		let {
			phone_remarks
		} = ctx.request.body;

		let params = {
			phone_remarks
		}

		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		try {

			await Game_PhoneModel.update(id, params);
			let data = await Game_PhoneModel.detail(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `更改设备备注成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `更改设备备注失败`,
				data: err
			}
		}
	}

	/**
	 * 移除用户设备 : 重置设备的phone_status
	 * @param ctx id       设备id
	 *
	 * @returns 移除设备是否成功
	 */
	static async resetphone(ctx) {
		let {
			id
		} = ctx.params;
		let {
			username,
			user_num
		} = ctx.user
		
		//如果是管理员回收设备
		if(user_num == 0){
			let {username : uname} = await Game_PhoneModel.detail(id)
			username = uname
		}

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		let params = {
			username: "",
			telephone: "",
			phone_remarks: "",
			phone_status: 0
		}

		try {
			//设备数 - 1
			{
				let {
					id,
					phone_count
				} = await UserModel.username(username)
				if (phone_count > 0) {
					// 游戏里面的count属性-1
					await UserModel.upduser(id, {
						phone_count: phone_count - 1
					})
				}
			}

			await Game_PhoneModel.update(id, params);
			//设置为过期记录
			await User_orderModel.setoverdue(id, {
				is_expire: true
			});
			let data = await Game_PhoneModel.detail(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `回收设备成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `回收设备失败`,
				data: err
			}
		}
	}

	/**
	 * 用户购买设备
	 * @param ctx id    设备id
	 *
	 * @returns 购买设备则返回购买设备后的设备数据，失败返回购买失败的原因
	 */
	static async buyphone(ctx) {
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		let {
			username,
			user_num,
			telephone
		} = ctx.user
		
		if(user_num != 2 ){
			telephone = "16666666666"
		}
		
		// 接收参数
		let {
			phone_remarks,
			phone_status = 1
		} = ctx.request.body;

		let params = {
			phone_remarks,
			username,
			telephone,
			phone_status
		}

		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		console.log("这里了id为:", id, username)

		try {
			//设备数 + 1
			{
				let {
					id,
					phone_count
				} = await UserModel.username(username)

				await UserModel.upduser(id, {
					phone_count: phone_count + 1
				})
			}
			
			await Game_PhoneModel.buyphone(id, params);
			let data = await Game_PhoneModel.detail(id);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `购买设备成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `购买设备失败`,
				data: err
			}
		}

	}

}

module.exports = Game_Phone
