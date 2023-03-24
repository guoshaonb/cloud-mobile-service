const ws = require('nodejs-websocket')
const global = require("./globalData")
const phoneClient = require("./phoneClient")
const { doSend, isJSON } = require("./common")

async function createWebServer(port = 8866) {
  ws.createServer(function (conn) {
    console.log("----------------New connection----------------")

    conn.on('text', function (text) {
      const timeObj = global.get("timeObj")
      const connecObj = global.get("connecObj")
      // 重连设备
      if (text.indexOf("rebinding") !== -1) {
        let ipText = text.split(":")[1]
        let relloadIp = ipText
          .substring(0, ipText.length - 1)
        console.log("正在重连设备：" + relloadIp)
        phoneClient.phone_Init(relloadIp) // 重连指定设备 
      } else {
        if (isJSON(text)) {
          let data = JSON.parse(text)
          if (data.hasOwnProperty("input")) {
            let ip = data["input"]["text"]
            if (timeObj[ip]) {
              if ("isclick" in timeObj[ip]) {
                global.setProp("timeObj", "ip", true, "isclick")
              }
            }
            doSend(connecObj[ip], text)
          }
        }
      }
    });
  
    conn.on('message', function (code, reason) {
      console.log('传递数据中');
    });
  
    conn.on('close', function (code, reason) {
      console.log('关闭连接');
    });
  
    conn.on('error', function (code, reason) {
      console.log('异常关闭');
    });
  
  }).listen(port);
}

module.exports = {
  createWebServer
}
