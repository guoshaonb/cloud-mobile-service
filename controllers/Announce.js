const AnnounceModel = require('../models/AnnounceModel')
const Common = require("../utils/common.js")
class Announce {
	/**
	 * 创建公告
	 * @param ctx title      公告标题
	 * @param ctx author     公告作者
	 * @param ctx banner     公告图片
	 * @param ctx linkurl    公告跳转链接
	 * @param ctx content    公告内容
	 * @param ctx sort       公告排序
	 *
	 * @returns  成功创建公告返回公告详情数据，失败返回错误信息
	 */
	static async create(ctx) {
		// 接收参数
		let {
			title,
			author,
			banner,
			linkurl,
			content,
			sort = 1
		} = ctx.request.body;

		let params = {
			title,
			author,
			banner,
			linkurl,
			content,
			sort
		}
		if (!banner)
			delete params.banner

		if (!linkurl)
			delete params.linkurl

		if (!await Common.isParamsFormat(ctx, params)) {
			return
		}

		try {

			// 创建公告
			const {
				id
			} = await AnnounceModel.create(params);
			// 查询公告
			const data = await AnnounceModel.detail(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `创建公告成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `创建公告失败`,
				data: err
			}
		}

	}

	/**
	 * 获取公告列表
	 * @param ctx
	 *
	 * @returns 公告列表数据
	 */
	static async list(ctx) {
		const {
			keyword,
			pageIndex = 1,
			pageSize = 10
		} = ctx.query
		try {
			const data = await AnnounceModel.list({keyword,pageIndex,pageSize});
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `查询公告列表成功`,
				data
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `查询公告列表失败`,
				data: err
			}
		}
	}

	/**
	 * 查询公告详情
	 * @param ctx id  公告ID
	 *
	 * @returns 公告的详情
	 */
	static async detail(ctx) {
		// 公告ID
		let {
			id
		} = ctx.params;
		
		if(!await Common.isIncludeId(ctx,id)){
			return false; 
		}

		try {

			let data = await AnnounceModel.detail(id);
			if (data !== null) {
				// 浏览次数增加1
				let browser = data.browser + 1;
				await AnnounceModel.update(id, {
					browser
				})
			}

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `查询公告成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `查询公告失败`,
				data: err
			}
		}

	}
	
	/**
	 * 删除公告数据
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
			await AnnounceModel.delete(id);
			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `删除公告成功`
			}
		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `删除公告失败`,
				data: err
			}
		}
	
	}

	/**
	 * 更新公告数据
	 * @param ctx title      公告标题
	 * @param ctx author     公告作者
	 * @param ctx banner     公告图片
	 * @param ctx linkurl    公告跳转链接
	 * @param ctx content    公告内容
	 * @param ctx sort       公告排序
	 *
	 * @returns 更新成功则返回更新后的公告数据，失败返回更新失败的原因
	 */
	static async update(ctx) {
		let {
			id
		} = ctx.params;

		// 检测是否传入ID
		if(!await Common.isIncludeId(ctx,id)){
			return false; 
		}

		// 接收参数
		let {
			title,
			author,
			banner,
			linkurl,
			content,
			sort
		} = ctx.request.body;

		let params = {
			title,
			author,
			banner,
			linkurl,
			content,
			sort
		}
		
		if (!title) delete params.title
		if (!author) delete params.author
		if (!banner) delete params.banner
		if (!linkurl) delete params.linkurl
		if (!content) delete params.content
		if (!sort) delete params.sort

		try {
			await AnnounceModel.update(id, params);
			let data = await AnnounceModel.detail(id);

			ctx.response.status = 200;
			ctx.body = {
				code: 200,
				message: `更新公告成功`,
				data
			}

		} catch (err) {
			ctx.response.status = 500;
			ctx.body = {
				code: 500,
				message: `更新公告失败`,
				data: err
			}
		}
	}
}

module.exports = Announce
