const GameModel = require('../models/GameModel')
const Common = require('../utils/common');
class Game {
	/**
	 * 创建游戏
	 * @returns 成功创建游戏返回游戏详情数据，失败返回错误信息
	 */
	static async create(ctx) {
		let {
			game_name,
			game_logo = "",
			game_introduce = "",
			sort = 0,
			phone_count = 0
		} = ctx.request.body;

		let params = {
			game_name,
			game_logo,
			game_introduce,
			sort,
			phone_count
		}

		if (!game_logo) delete params.game_logo
		if (!game_introduce) delete params.game_introduce
		if (!sort) delete params.sort
		if (!phone_count) delete params.phone_count

		// 数据格式校验
		if (!await Common.isParamsFormat(ctx, params)) {
			return false;
		}

		const existGame = await GameModel.game_name(params.game_name)
		if (existGame) {
			ctx.response.status = 403;
			ctx.body = {
				code: 403,
				message: "游戏已经存在"
			}
		} else {
			try {
				const data = await GameModel.create(params);
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: `创建游戏成功`,
					data: data
				}
			} catch (err) {
				ctx.response.status = 500;
				ctx.body = {
					code: 500,
					message: `创建游戏失败`,
					data: err
				}
			}
		}

	}

	/**
	 * 获取游戏列表
	 * @params ctx include 包含内容
	 *
	 * @returns 游戏列表数据
	 */
	static async list(ctx) {
		let {
			keyword
		} = ctx.query;

		try {
			let data = await GameModel.list(keyword)
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `获取游戏列表成功！`,
				data
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `获取游戏列表失败`,
				data: err
			}
		}
	}


	/**
	 * 查询当前游戏下的所有设备
	 *
	 * @returns 设备列表数据
	 */
	static async phonelist(ctx) {
		let {
			id
		} = ctx.params;
		let {
			keyword,
			phone_ip,
			filterType,
			pageIndex = 1,
			pageSize = 100
		} = ctx.query;
		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		try {
			if(keyword || phone_ip){
				const phonelist = await GameModel.phonesearch({keyword,phone_ip});
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: `查询成功！`,
					count:phonelist.length,
					data:phonelist
				}
			}else{
				const phonelist = await GameModel.phonelist(id);
				const game_phones = phonelist[0].game_phones
				let phones = game_phones
				let statusObj = {
					"employ" : 0,
					"noemploy" : 1,
					"safeguard" : 2
				}
				//1、先根据状态过滤
				phones = game_phones.filter(item => statusObj.hasOwnProperty(filterType) 
				? item.phone_status == statusObj[filterType] : true)
				//2、再根据账户/手机号过滤
				phones = phones.filter(item => keyword ? (item.username.indexOf(keyword)!=-1 || 
				(item.telephone && keyword.indexOf(item.telephone.substring(item.telephone.length - 4))!=-1)) : true)
				//赋值数据的总数
				let length = phones.length
				//分页方式返回
				phones = phones.splice((pageIndex - 1) * pageSize,pageSize)
				
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: `查询成功！`,
					count:length,
					data:phones
				}
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `获取该游戏下的设备列表失败`,
				data: err
			}
		}
	}

	/**
	 * 查询当前游戏下的一台空闲设备
	 *
	 * @returns 当前游戏下的一台空闲设备
	 */
	static async phonefree(ctx) {
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		try {
			const phonelist = await GameModel.phonelist(id);
			const game_phones = phonelist[0].game_phones
			if (game_phones) {
				//随机一台空闲的设备给用户
				let obj1 = game_phones.filter(item => item.phone_status == 0)
				let random = parseInt(Math.random() * obj1.length)
				let obj2 = obj1.length > 0 ? obj1[random] : null
				ctx.response.status = 200;
				ctx.body = {
					code: 200,
					message: `查询成功！`,
					data: obj2
				}
			} else {
				ctx.response.status = 500;
				ctx.body = {
					code: 500,
					message: `获取该游戏下的设备列表失败`,
					data: err
				}
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `获取该游戏下的设备列表失败`,
				data: err
			}
		}
	}

	/**
	 * 查询单一游戏
	 * @param ctx id  游戏ID
	 *
	 * @returns 游戏的详情
	 */
	static async detail(ctx) {
		// 游戏ID
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}
		try {
			let data = await GameModel.detail(id);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `查询单一游戏成功`,
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
	 * 删除游戏数据
	 * @param ctx
	 *
	 * @returns 删除成功返回true，失败返回错误信息
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
			await GameModel.delete(id);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `删除游戏成功`
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `删除游戏失败`,
				data: err
			}
		}

	}

	/**
	 * 更新游戏数据
	 * @param ctx id 设备游戏ID
	 * @param ctx name         游戏名称
	 * @param ctx icon         游戏icon图标
	 * @param ctx parent_id    父游戏ID
	 * @param ctx z_index      权重
	 *
	 * @returns 更新成功返回更新后的数据，失败返回错误信息
	 */
	static async update(ctx) {
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if (!await Common.isIncludeId(ctx, id)) {
			return false;
		}

		let {
			game_name,
			game_logo,
			game_introduce,
			sort,
			phone_count
		} = ctx.request.body;
		let params = {
			game_name,
			game_logo,
			game_introduce,
			sort,
			phone_count
		}

		if (!game_name) delete params.game_name
		if (!game_logo) delete params.game_logo
		if (!game_introduce) delete params.game_introduce
		if (!sort) delete params.sort
		if (!phone_count) delete params.phone_count

		try {

			await GameModel.update(id, params);
			let data = await GameModel.detail(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `更新游戏成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `更新失败`,
				data: err
			}
		}


	}
}

module.exports = Game
