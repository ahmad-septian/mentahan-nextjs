import glob from "global_module/response_service";
const Users = require("global_module/model/users");
const { Sequelize } = require("sequelize");
var Op = Sequelize.Op;
const moment = require("moment");

/*
    Author  : Rizki
    Input   : 
*/
export default async function addSMTP(req, res) {
  glob.post(req, res, async (json, opt) => {
    const bcrypt = require("bcryptjs");
    var name = req.body.name;
    if (name == " ") {
      // json.ex_info = "field nama tidak boleh kosong";
      throw "the name field cannot be empty";
    }

    var username = req.body.username;

    if (username) {
      // Check apakah username yang di input pernah terdaftar
      const countusername = await Users(opt.db).count({
        where: { username: username },
      });

      console.log(username, "TEST Username");
      if (countusername >= 1) {
        throw "Username is already registered, please use another one.";
      }
    }

    var email = req.body.email;

    if (email) {
      //check apakah email yang di input pernah terdaftar ?
      const countEmail = await Users(opt.db).count({
        where: { email: email },
      });
      if (countEmail >= 1)
        throw "Email is already registered, please use other";
    }

    if ("password" in req.body) {
      const salt = await bcrypt.genSalt(10);
      const haspassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = haspassword.replace("$2a", "$2y");
      console.log(req.body.password.replace("$2a", "$2y"), "TEST PASSWORD");
    }

    var password = req.body.password;
    var telepon = req.body.telepon;
    var alamat = req.body.alamat;

    await Users(opt.db).create(
      {
        name: name,
        username: username,
        email: email,
        telepon: telepon,
        alamat: alamat,
        password: password,
      },

      { transaction: opt.tr }
    );
    json.message = "data masuk";
  });
}
