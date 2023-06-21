var CryptoJS = require("crypto-js");
module.exports = {
  encode: function (userID) {
    var token = null;
    try {
      var now = (Date.now() / 1000) | 0;
      var message = `${now}|${userID}`;
      var token = CryptoJS.AES.encrypt(
        message,
        process.env.TOKEN_KEY
      ).toString();
    } catch (err) {
      console.log(err);
    }
    return token;
  },
  decode: function (token) {
    try {
      const decoded = CryptoJS.AES.decrypt(
        token,
        process.env.TOKEN_KEY
      ).toString(CryptoJS.enc.Utf8);
      if (decoded.length == 0) throw "invalid token";
      var info = decoded.split("|");
      return { genrated_at: info[0], user_id: info[1] };
    } catch (ex) {
      return null;
    }
  },
};
