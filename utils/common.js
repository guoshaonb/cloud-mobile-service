/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-07 09:36:23
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-08 14:53:09
 */

class Common {
	/*
	 *   数据校验公用模块
	 */
  //判断前端传过来的值有没有包含空的
  static async isParamsFormat(ctx, params) {
    let errors = [];

    for (let item in params) {
      if (params[item] === undefined || params[item] == null || params[item] == "") {
        let index = errors.length + 1;
        errors.push("错误" + index + ": 参数: " + item + "不能为空")
      }
    }

    //判断数据是否为空
    if (errors.length > 0) {
      ctx.response.status = 412;
      ctx.body = {
        code: 412,
        message: "输入的信息不完整，请检查",
        message_detail: errors
      }
      return false;
    } else {
      //数据格式校验
      const isValidate = await Common.validateData(params)
      if (typeof isValidate == "string") {
        ctx.response.status = 412;
        ctx.body = {
          code: 412,
          message: isValidate
        }
        return false;
      } else {
        return isValidate
      }
    }
  }


  //表单数据校验
  static async validateData(params) {
    //用户名正则，4到16位（字母，数字，下划线，减号）
    var uPattern = /^[a-zA-Z0-9_-]{4,20}$/;
    //密码正则，6到20位（字母，数字，下划线，减号）
    var pPattern = /^[a-zA-Z0-9_-]{6,20}$/;
    //IP地址正则
    var regexIP = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/;
    //手机号正则，9位以上数字
    var reTele = /^1[3456789]\d{9}$/;
    //验证码正则，6位数字
    var reVerify = /^\d{6}$/;

    let valiList = [
      { prop: "username", vali: uPattern, message: "用户名是4到20位数字、字母或下划线！" },
      { prop: "password", vali: pPattern, message: "密码是6到20位数字、字母或下划线！" },
      { prop: "password_old", vali: pPattern, message: "原密码是6到20位数字、字母或下划线！" },
      { prop: "password_new", vali: pPattern, message: "新密码是6到20位数字、字母或下划线！" },
      { prop: "password_new2", vali: pPattern, message: "请再次输入6到20位数字、字母或下划线的密码！" },
      { prop: "phone_ip", vali: regexIP, message: "请输入格式正确的ip地址！" },
      { prop: "telephone", vali: reTele, message: "请输入格式正确的手机号！" },
      { prop: "verify_code", vali: reVerify, message: "请输入6位数字的验证码！" },
    ]

    //公用部分检测
    for (let key in params) {
      for (let i = 0; i < valiList.length; i++) {
        if (key == valiList[i].prop) {
          if (!valiList[i].vali.test(params[key])) {
            return valiList[i].message
          }
        }
      }
    }

    //修改密码检测
    if (params.hasOwnProperty("password_old") && params.hasOwnProperty("password_new")) {
      //如果输入的旧密码和新密码一致
      if (params.password_old == params.password_new) {
        return "旧密码不能与新密码一致！"
      }
    }

    //重置密码检测
    if (params.hasOwnProperty("password_new") && params.hasOwnProperty("password_new2")) {
      //如果两次输入的新密码不一致
      if (params.password_new != params.password_new2) {
        return "两次输入的新密码不一致！"
      }
    }

    return true
  }

  //判断id是否为空
  static async isIncludeId(ctx, id) {
    if (!id) {
      ctx.response.status = 412;
      ctx.body = {
        code: 412,
        message: `ID不能为空`
      }

      return false;
    }

    if (isNaN(id)) {
      ctx.response.status = 412;
      ctx.body = {
        code: 412,
        message: `请传入正确的ID`
      }

      return false;
    }
    return true
  }

	/*
	 *   数据处理通用方法模块
	 */
  //生成随机数
  static async randomNum(n) {
    var t = '';
    for (var i = 0; i < n; i++) {
      t += Math.floor(Math.random() * 10);
    }
    return t;
  }

  static async delay(times) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, times)
    })
  }

  //获取当前周的日期列表
  static async getDates(currentTime) {
    var currentDate = new Date(currentTime)
    var timesStamp = currentDate.getTime();
    var currenDay = currentDate.getDay();
    var dates = [];
    for (var i = 0; i < 7; i++) {
      dates.push(new Date(timesStamp + 24 * 60 * 60 * 1000 * (i - (currenDay + 6) % 7)).toLocaleDateString().replace(
        /\//g, '-'));
    }
    return dates
  }

  //返回本周的新增数量
  static async getCounts(data) {

    let list_data = []
    let wekk_list = await Common.getDates(new Date())
    for (let i = 0; i < wekk_list.length; i++) {
      list_data[i] = 0
    }
    for (let i = 0; i < wekk_list.length; i++) {
      let day_time = new Date(wekk_list[i])
      let day_year = day_time.getYear() + 1900
      let day_month = day_time.getMonth() + 1
      let day_date = day_time.getDate()
      let day_time_str = day_year + "-" + day_month + "-" + day_date
      for (let j = 0; j < data.length; j++) {
        let time = new Date(data[j].updatedAt)
        let r_year = time.getYear() + 1900
        let r_month = time.getMonth() + 1
        let r_date = time.getDate()
        let r_time_str = r_year + "-" + r_month + "-" + r_date
        day_time_str == r_time_str && ++list_data[i]
      }
    }
    return list_data

  }

	/*
	 *   功能:实现VBScript的DateAdd功能.
	 *   参数:interval,字符串表达式，表示要添加的时间间隔.
	 *   参数:number,数值表达式，表示要添加的时间间隔的个数.
	 *   参数:date,时间对象.
	 *   返回:新的时间对象.
	 *   var   now   =   new   Date();
	 *   var   newDate   =   DateAdd( "d ",5,now);
	 *---------------   DateAdd(interval,number,date)   -----------------
	 */
  static async DateAdd(interval, number, date) {

    switch (interval) {
      case "y":
        {
          date.setFullYear(date.getFullYear() + number);
          return date;
          break;
        }
      case "q":
        {
          date.setMonth(date.getMonth() + number * 3);
          return date;
          break;
        }
      case "m":
        {
          date.setMonth(date.getMonth() + number);
          return date;
          break;
        }
      case "w":
        {
          date.setDate(date.getDate() + number * 7);
          return date;
          break;
        }
      case "d":
        {
          date.setDate(date.getDate() + number);
          return date;
          break;
        }
      case "h":
        {
          date.setHours(date.getHours() + number);
          return date;
          break;
        }
      case "m":
        {
          date.setMinutes(date.getMinutes() + number);
          return date;
          break;
        }
      case "s":
        {
          date.setSeconds(date.getSeconds() + number);
          return date;
          break;
        }
      default:
        {
          date.setDate(d.getDate() + number);
          return date;
          break;
        }
    }
  }

  //转换日期格式
  static async formatDateTime(date, isAfter = true) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var hour = date.getHours();
    hour = hour < 10 ? ('0' + hour) : hour;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    var second = date.getSeconds();
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + (isAfter ? (' ' + hour + ':' + minute + ':' + second) : '');
  }
}

module.exports = Common
