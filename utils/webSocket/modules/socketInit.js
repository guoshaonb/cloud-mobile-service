const http = require('http');
const global = require("./globalData")
const socketCom = require("./common")
const phoneClient = require("./phoneClient")
const webServer = require("./webServer")
const phone_Init = phoneClient.phone_Init
const PhoneallModel = require('../../../models/PhoneallModel')

async function webSocketStart() {
  const data = await PhoneallModel.findAllPhoneallList({
    pageIndex: 1,
    pageSize: 500
  });
  const phoneList = []
  data.rows.forEach(element => {
    const phoneIp = 
      element.dataValues.phone_ip
    phoneList.push(phoneIp)
  });
 
  // 设置全局变量
  global.set("timeObj", {})
  global.set("connecObj", {})
  global.set("ipList", phoneList)
  // 设备初始化操作
  await socketCom.delay(1000)
  await phoneClient.phone_Init()
  await webServer.createWebServer(8866)
  const ipList = global.get("ipList")
  const timeObj = global.get("timeObj")
  // 时间对象初始化
  socketCom.timeObj_DataInit(ipList, timeObj)
  // 检测设备连接状态
  socketCom.timeObj_Examine(ipList, timeObj, phone_Init)
}

module.exports = {
  webSocketStart
}