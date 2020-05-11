//1. 使用するライブラリ、ファイルの読み込み
const http = require("http");
const fs = require("fs");
const querystring = require("querystring");
const request = require("request");
const axiosBase = require("axios");
const conf = require("config");
const requestDataJson = require("./setting/requestData.json");
const {createObjectCsvWriter} = require('csv-writer');
const body = require("./setting/requestBody.json");

//APIサーバーのURL
//const url = " https://gateway.api.cuvicitc-st.jp/orico/api/helios/v1/"
const url = "http://localhost:3000/api/v1/";

//2. 使用する情報の定義

//連携する内部APIに対する情報を定義（baseURL/header）
//認証情報は/config/default.yaml内にて定義
const axios = axiosBase.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-IBM-Client-Id": conf.client_id,
    "X-IBM-Client-Secret":conf.client_secret,
    "X-Transaction-Id":"20190207000000010123",
  },
  responseType: "json",
});

// csv出力に関する定義
const csvfilepath =  __dirname+'/responseData.csv'
const headers = []
for (index in requestDataJson.requestData) {
    let value = requestDataJson.requestData[index]
    let header = { id:[value], title: [value] }
    headers.push(header)
}

const csvWriter = createObjectCsvWriter({
    path: csvfilepath,
    header: headers,
    encoding:'utf8',
    append :false, // append : no header if true
});

//内部APIに対するリクエスト
//axios: HTTPリクエストライブラリ
//baseURL + '/path', body（setting/requestBody.json）
axios
  .post('/', body)
  .then(function (response) { //レスポンスを受け取った後の処理を定義
    let records = []
    let record = {}
    for (index in requestDataJson.requestData) {
        let key = requestDataJson.requestData[index]
        record[key] = JSON.stringify(response.data[key])
    }
    records.push(record)
    console.log(records)

    let allData = response.data
    fs.writeFileSync('responseDataAll.json', JSON.stringify(allData, null, '    '));
    csvWriter.writeRecords(records)
    .then(() => {
        console.log('Finished csv and json export');
    });
  })
  .catch(function (error) {
    console.log(error);
  });