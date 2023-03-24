const global = require("./globalData")

/***
 * 时间方法
 */

// 日期格式转换
Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k])
        .length)));
    }
  }
  return fmt;
}

// 延迟时钟
async function delay(times) {
  return new Promise((reslove, reject) => {
    setTimeout(() => {
      reslove()
    }, times)
  })
}

// 计算时间差
function times(start_time, end_time, type) {
  start_time = new Date(start_time)
  end_time = new Date(end_time)
  switch (type) {
    case "秒":
      return parseInt(end_time - start_time) / 1000;
    case "分":
      return parseInt(end_time - start_time) / 60000;
    case "时":
      return parseInt(end_time - start_time) / 3600000;
  }
}

/***
 * 功能方法
 */

// 发送消息到网页客户端
function doSend(connection, text) {
  if (connection) {
    if (connection.connected) {
      connection.send(text); //发送数据    
    }
  }
}

// 判断是否为Json数据
function isJSON(str) {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }

    } catch (e) {
      console.log('error：' + str + '!!!' + e);
      return false;
    }
  }
  console.log('It is not a string!')
}

/***
 * 状态设置方法
 */

// 时间对象初始化
function timeObj_DataInit(ipList, timeObj) {
  for (let i = 0; i < ipList.length; i++) {
    const startTime = new Date().format("yyyy/MM/dd hh:mm:ss")
    global.setProp("timeObj", ipList[i], {})
    global.setProp("timeObj", ipList[i], false, "isclick")
    global.setProp("timeObj", ipList[i], startTime, "start_time")
    console.log("设备ip：" + ipList[i])
    // console.log("开始时间：" + timeObj[ipList[i]].start_time)
  }
}

// 每10分钟检测一次连接状态
function timeObj_Examine(ipList, timeObj, phone_Init) {
  setInterval(() => {
    const startTime = new Date().format("yyyy/MM/dd hh:mm:ss")
    for (let i = 0; i < ipList.length; i++) {
      let ele_time = new Date().format("yyyy/MM/dd hh:mm:ss");
      // 每10分钟检测一次
      if(timeObj[ipList[i]]) {
        if (times(timeObj[ipList[i]].start_time, ele_time, "分") >= 10) {
          // 如果还未点击过
          if (!timeObj[ipList[i]].isclick) {
            phone_Init(ipList[i])
            console.log(ipList[i] + '正在重连......')
            global.setProp("timeObj", ipList[i], false, "isclick")
            global.setProp("timeObj", ipList[i], startTime, "start_time")
          }
        }
      }
    }
  }, 5000);
}

module.exports = {
  times,
  delay,
  doSend,
  isJSON,
  timeObj_DataInit,
  timeObj_Examine,
}