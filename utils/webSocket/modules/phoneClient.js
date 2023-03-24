const global = require("./globalData")
const { client: WebSocketClient }= require('websocket')

// 遍历设备列表，构建手机的客户端 
async function phone_Init(ip) {
  const ipList = global.get("ipList")
  const connecObj = global.get("connecObj")
  if (ipList.length == 0) return
  try {
    for (let i = 0; i < ipList.length; i++) {
      // 如果有设备ip传过来，就重新连接指定设备，否则就是所有设备连接
      if (ip ? ipList[i] == ip : true) {
        const client = new WebSocketClient(); // 创建客户端对象

        // 连接失败执行
        client.on('connectFailed',
          function (error) {
            console.log('Connect Error: ' + error.toString());
          }
        );

        client.on('connect', function (connection) {
          global.setProp("connecObj", ipList[i], connection) // 存放连接对象
          // connecObj[ipList[i]] = connection 
          console.log('正在启动：' + ipList[i]);

          // 连接错误抛出
          connection.on('error', function (error) {
            console.log("Connection Error: " + error.toString());
          });

          // 连接关闭执行
          connection.on('close', function () {
            console.log('echo-protocol Connection Closed');
          });

          // 收到服务器的返回消息
          connection.on('message', function (message) {
            if (message.type === 'utf8') {
              console.log("Received: '" + message.utf8Data + "'");
            }
          });

        });

        client.connect(`ws://${ipList[i]}:51008/`); // 连接服务器
      }
    }
  } catch (e) {
    console.log("发生异常:" + e)
  }
}

module.exports = {
  phone_Init
}