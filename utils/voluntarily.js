const puppeteer = require('puppeteer');
const common = require("./common")
let page, _username, _password, _functional, _isinsert, _edittype //用户属性

// 打开界面
const openPage = async (linkurl) => {
	const browser = await puppeteer.launch({
		headless: false,
		args: [`--window-size=1920,1000`],
		defaultViewport: {
			width: 1920,
			height: 1000,
		}
	});
	page = await browser.newPage();
	await page.goto(linkurl);
}

// 自动登录
const loginAutomatic = async () => {
	await common.delay(1000)
	let inputEle1 = await page.$(".el-input__inner[type='text']")
	await inputEle1.focus()
	await page.keyboard.type(_username)
	let inputEle2 = await page.$(".el-input__inner[type='password']")
	await inputEle2.focus()
	await page.keyboard.type(_password)
	await page.mouse.move(800, 630);
	await page.mouse.down();
	// await page.mouse.down();
	await common.delay(1000)
	await page.mouse.move(1150, 630);
	await page.mouse.up();
	let butEle = await page.$(".el-button")
	await butEle.click()
}

// 选择功能
const selectFun = async () => {
	await common.delay(6000)
	try {
		let _functional_adv = parseInt(_functional.split("-")[0])
		let _functional_son = parseInt(_functional.split("-")[1])
		let _functional_son_son = parseInt(_functional.split("-")[2])
		let domPrefix = `.el-menu .el-submenu:nth-child(${_functional_adv + 1})`
		let elmenuEle = await page.$(`${domPrefix} span`)
		_functional_adv != 1 && elmenuEle.click()
		await common.delay(1000)
		let elmenuEleChirld = await page.$(
			`${domPrefix} ul ul li:nth-child(${_functional_son}) i`)
		_functional_adv != 1 && elmenuEleChirld.click()
		if (_functional_son_son) {
			await common.delay(6000)
			let elmenuEleChirld_Chirld = await page.$(
				`${domPrefix} ul ul li:nth-child(${_functional_son}) li:nth-child(${_functional_son_son})`
			)
			elmenuEleChirld_Chirld.click()
		}
		await common.delay(2000)
		// 如果是第一个模块
		if (_functional_adv == 1) {
			if (_functional_son == 2) {
				let elButton = await page.$(".el-button")
				elButton.click()
			}
			return
		}

		if (_edittype == "search") {
			let input_innerEle = await page.$(".el-input__inner")
			await input_innerEle.focus()
			await page.keyboard.type(_search)
			let elicon_search = await page.$(".el-icon-search")
			await elicon_search.click()
		} else if (_edittype == "insert") {
			let addBut = await page.$(".el-card__header .el-icon-document-add")
			if (!addBut) {
				addBut = await page.$(".el-card__header .el-button--success")
			}
			addBut.click()
		}
	} catch (e) {
		console.log(e)
	}
}

const voluntInit = async (username, password, functional, edittype, search) => {
	(async () => {
		// functional 
		// 0:单纯登录
		// 1-1:云系统事迹
		// 1-2:可视化界面
		// 1-2:用户管理
		// 2-1:用户管理
		// 2-2:游戏管理
		// 2-3:公告管理
		// 2-4:日志管理
		// ......
		_username = username
		_password = password
		_functional = functional
		_edittype = edittype
		_search = search
		await openPage('https://www.xingyue.xin:444/yun_admin/#/login')
		await loginAutomatic()
		_functional != "0" && await selectFunction()
		// await browser.close();
	})();
};

exports.openPage = openPage
exports.selectFun = selectFun
exports.voluntInit = voluntInit

