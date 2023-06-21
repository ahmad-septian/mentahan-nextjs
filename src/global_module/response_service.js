// import { response } from "next/server";
// import { NextRequest } from "next/server";
import NextCors from "nextjs-cors";
import CryptoJS from "crypto-js";
import Hashids from "hashids";
var dbcon = require("./dbmysql");
var authToken = require("./authToken.js");

function processThrow(ex, retJson) {
  if (typeof ex === "string" || ex instanceof String) {
    retJson.message = ex;
  } else if (ex instanceof Error) {
    retJson.message = ex.message;
  }
  retJson.result = false;
}
function preResponseProcess(req) {
  var optParams = {};

  if (req.headers["token"] != undefined) {
    var user_info = authToken.decode(req.headers["token"]);

    optParams.user_id = user_info.user_id;
  }

  return optParams;
}
async function process_resp(req, res, callback) {
  var retJson = {};
  try {
    await dbcon.scopeConnect(
      async ({ sequelize, transaction, sequelize_qos, transaction_qos }) => {
        var optParams = preResponseProcess(req);
        optParams.db = sequelize;
        optParams.tr = transaction;

        optParams.db_qos = sequelize_qos;
        optParams.tr_qos = transaction_qos;

        await callback(retJson, optParams);

        retJson.result = true;
        await NextCors(req, res, {
          // Options
          methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
          origin: "*",
          optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
        });
        res.status(200).json(retJson);
      }
    );
  } catch (ex) {
    processThrow(ex, retJson);
    res.status(200).json(retJson);
  }
}

export default {
  encode_id: (id) => {
    const hashids = new Hashids("!@#%_TABLE)(*%^&_PASSWORD", 10);
    return hashids.encode(id);
  },
  decode_id: (str) => {
    const hashids = new Hashids("!@#%_TABLE)(*%^&_PASSWORD", 10);
    return hashids.decode(str);
  },
  // UNTUK MEMBUAT API
  post: async function (req, res, callback) {
    if (req.method !== "POST") {
      res.status(405).send({
        message: "Only POST requests allowed",
        result: false,
      });
      return;
    } else {
      await process_resp(req, res, callback);
    }
  },
};
