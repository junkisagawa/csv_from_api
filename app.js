//1. 使用するライブラリ、ファイルの読み込み
const http = require("http");
const fs = require("fs");
const querystring = require("querystring");
const url = require("url");
const request = require("request");
const axiosBase = require("axios");
const conf = require("config");
const requestDataJson = require("./requestData.json");
const {createObjectCsvWriter} = require('csv-writer');

//2. 使用する情報の定義

//連携する内部APIに対する情報を定義（baseURL/header）
//認証情報は/config/default.yaml内にて定義
const axios = axiosBase.create({
  baseURL: "http://localhost:3000/api/v1/",
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  responseType: "json",
});


// csv出力に関する定義
const csvfilepath =  __dirname+'/responseData.csv'
const headers = []
for (index in requestDataJson.requestData) {
    let value = requestDataJson.requestData[index]
    let header = { [value] : value }
    headers.push(header)
}

const csvWriter = createObjectCsvWriter({
    path: csvfilepath,
    header: [
        // {id: 'name', title: 'NAME'},      //Headerつける場合
        // {id: 'lang', title: 'LANGUAGE'}　 //Headerつける場合
    ],
    encoding:'utf8',
    append :false, // append : no header if true
});

//内部APIに対するリクエスト
//axios: HTTPリクエストライブラリ
axios
  .get()
  .then(function (response) { //レスポンスを受け取った後の処理を定義
    let records = []
    for (_index in response.data.data) {
        console.log(response.data.data)
        let record = {}
        for (index in requestDataJson.requestData) {
            console.log("key:" + requestDataJson.requestData)
            let key = requestDataJson.requestData[index]
            record[key] = response.data.data[_index][key]
        }
        records.push(record)
    }
    console.log(records)
    csvWriter.writeRecords(records)       // returns a promise
    .then(() => {
        console.log('Finished csv export');
    });
  })
  .catch(function (error) {
    console.log("ERROR!! occurred in Backend.");
  });
