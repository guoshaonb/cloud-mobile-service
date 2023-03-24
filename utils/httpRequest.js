/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-02 19:28:11
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-19 12:19:09
 */
const axios = require("axios");
const Qs = require("qs");　　 //qs是一个url参数转化（parse/stringify）的js库
const path = require("path");
const fs = require("fs");
const filePath = "E:\\testAPI" //文件下载的位置

async function get(url) {
  let response = await axios({
    method: "GET",
    url: url
  })
  return response.data
}

async function post(url, params, token) {
  let response = await axios({
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "JWT " + token
    },
    url: url,
    data: Qs.stringify(params)
  })
  return response.data
}

async function download() {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filepath)
  }　　 /* name是生成的文件的文件名，自定义，比如，我希望产生的文件名为test.pdf,那么name='test.pdf' */
  const mypath = path.resolve(filePath, name)
  const writer = fs.createWriteStream(mypath)
  let response = await axios({
    url: resource, //需要访问的资源链接
    method: "GET",
    responseType: "stream",
    params: param //需要传的参数
  })
  response.data.pipe(writer)
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve)
    writer.on("error", reject)
  })
}

module.exports = {
  get,
  post,
  download
}