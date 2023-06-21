import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import urlJoin from "url-join";
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile,
} from "react-device-detect";
const dev = process.env.NODE_ENV !== "production";

// UNTUK MENRAIK HOST http://localhost:3000/
function getHost() {
  if (Capacitor.isNativePlatform()) {
    if (dev) {
      return location.protocol + "//" + location.host;
    } else {
      return process.env.NEXT_PUBLIC_SERVER;
    }
  } else if (typeof location !== "undefined") {
    return location.protocol + "//" + location.host;
  } else {
    return process.env.NEXT_PUBLIC_SERVER;
  }
}

function contains(target, pattern) {
  var value = false;
  pattern.forEach(function (word) {
    value = value || target.includes(word);
  });
  console.log(value, "rrrrrrTTTTTTTTTT");
  return value;
}
function createBody(data, paramsData) {
  var body = null;
  if (paramsData == 1) {
    body = new FormData();
    for (let key in data) {
      if (data[key] instanceof FileList) {
        for (let i = 0; i < data[key].length; i++) {
          body.append(key, data[key][i]);
        }
        console.log(data[key]);
      } else {
        if (Array.isArray(data[key])) {
          for (let i = 0; i < data[key].length; i++)
            body.append(key, data[key][i]);
        } else {
          body.append(key, data[key]);
        }
      }
    }
  } else if (paramsData == 2) {
    // body = JSON.stringify(data);
    var formBody = [];
    for (var property in data) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(data[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    body = formBody;
  } else if (paramsData == 3) {
    body = JSON.stringify(data);
  }
  return body;
}
const propperCase = (text) =>
  text.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
export const helpers = {
  toDegreesMinutesAndSeconds: (coordinate) => {
    var absolute = Math.abs(coordinate);
    var degrees = Math.floor(absolute);
    var minutesNotTruncated = (absolute - degrees) * 60;
    var minutes = Math.floor(minutesNotTruncated);
    var seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    return degrees + "°" + minutes + "´" + seconds + `"`;
  },

  //UNTUK MEMBUAT HALAMAN DI MOBILE
  isMobile: () => {
    if (Capacitor.isNativePlatform()) {
      return true;
    } else {
      if (isBrowser) return false;
      else if (isMobile) return true;
    }
  },
  isNativePlatform: function () {
    return Capacitor.isNativePlatform();
  },

  //UNTUK Menarik HOST
  getHost: function () {
    return getHost();
  },
  //   UNTUK LOCALSTORAGE
  storage: {
    set: async (key, value) => {
      if (Capacitor.isNativePlatform()) {
        await Preferences.set({
          key: key,
          value: value,
        });
      } else {
        localStorage.setItem(key, value);
      }
    },
    get: async (key) => {
      if (Capacitor.isNativePlatform()) {
        console.log("****", key);
        const { value } = await Preferences.get({
          key: key,
        });
        return value;
      } else {
        var data = localStorage.getItem(key);
        return data;
      }
    },
    clear: async () => {
      if (Capacitor.isNativePlatform()) {
        await Preferences.clear();
      } else {
        localStorage.clear();
      }
    },
    remove: async (key) => {
      if (Capacitor.isNativePlatform()) {
        await Preferences.remove({ key: key });
      } else {
        localStorage.removeItem(key);
      }
    },
    setConfig: async (rootKey, key, value) => {
      helpers.storage.get(rootKey).then((e) => {
        var ob = {};

        if (e == undefined) e = {};
        else {
          try {
            ob = JSON.parse(e);
          } catch (ex) {
            ob = {};
          }
        }

        ob[key] = value;
        helpers.storage.set("FocusedModal", JSON.stringify(ob));
      });
    },
    getConfig: async (rootKey, key) => {
      return new Promise(async function (myResolve, myReject) {
        helpers.storage.get(rootKey).then((e) => {
          var ob = {};

          if (e == undefined) e = {};
          else {
            try {
              ob = JSON.parse(e);
              if (key in ob) myResolve(ob[key]);
              return myResolve(null);
            } catch (ex) {
              return myResolve(null);
            }
          }
          return null;
        });
      });
    },
  },
  //   UNTUK WARNA DI AVATAR MATERIAL UI
  stringToColor: (string) => {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  },
  //   UNTUK AVATAR DI MATERIAL UI
  stringAvatar: (name) => {
    if (
      typeof name !== "undefined" &&
      name !== null &&
      name.split(" ").length >= 2
    ) {
      return {
        sx: {
          bgcolor: helpers.stringToColor(name),
        },

        children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
      };
    } else if (name == null) {
      return {
        children: "TP",
      };
    } else {
      return {
        sx: {
          bgcolor: helpers.stringToColor(name),
        },
        children: `${name.split(" ")[0][0]}`,
      };
    }
  },
  //   UNTUK MENGENALI SIAPA YANG LOGIN DAN MENGENALI AKUN LOGIN
  user_info: null,
  whoami(force_reload = false) {
    return new Promise(async function (myResolve, myReject) {
      // "Producing Code" (May take some time)
      var token = await helpers.storage.get("token");
      // console.log(force_reload);
      if (token) {
        if (helpers.user_info == null || force_reload == true) {
          helpers
            .auth_fetch("/api/whoami", {})
            .then(function (data) {
              if (data.result == false) {
                myReject(data.message);
                return;
              }

              helpers.user_info = data;
              myResolve(data);
            })
            .catch((ex) => {
              myReject(ex);
            });
        } else {
          myResolve(helpers.user_info);
        }
      } else {
        myReject("Token is not exists");
      }
    });
  },
  //   UNTUK LOGOUT
  logout: function (container) {
    helpers.storage.clear();
    localStorage.clear();
    helpers.user_info = null;
  },
  //   UNTUK CHECK SIAPA YANG LOGIN
  check_login: (username, password) => {
    return new Promise((resolve, reject) => {
      helpers
        .fetch("/api/login", { username: username, password: password })
        .then((result) => {
          resolve(result);
        });
    });
  },
  //   UNTUK LOGIN
  login: function (username, password) {
    return new Promise((resolve, reject) => {
      helpers.check_login(username, password).then((r) => {
        if (r.result == false) {
          reject(r.message);
        } else {
          helpers.storage.set("token", r.token);
          resolve(r);
        }
      });
    });
  },

  isAuth: async () => {
    var d = await helpers.storage.get("token");

    return new Promise((resolve, reject) => {
      if (d == undefined || d == null || d === "undefined") {
        resolve(false);
      } else {
        helpers
          .whoami(true)
          .then((r) => {
            console.log(r, "TEST DATA R");
            resolve(r);
          })
          .catch((ex) => {
            resolve(false);
          });
      }
    });
  },
  //function ini digunakan saat fetch diluar URL /auth
  fetch: function (url, data, bodyFormat = "urlencoded") {
    return new Promise(function (resolve, reject) {
      var body = null;
      var headers = {};
      if (bodyFormat == "urlencoded") {
        //urlencoded
        body = createBody(data, 2);
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else if (bodyFormat == "jsonraw") {
        body = createBody(data, 3);
      } else if (bodyFormat == "formdata") {
        body = createBody(data, 1);
      }

      fetch(urlJoin(getHost(), url), {
        method: "POST",
        headers: headers,
        body: body,
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch((ex) => {
          reject(ex);
        });
    });
  },

  //function ini digunakan saat fetch dgn URL /auth/*
  //1 = formdata
  //2 = urlencoded
  //3 = jsonraw
  //   FUNCTION UNTUK MEMANGGIL API
  auth_fetch: function (url, data, bodyFormat = "urlencoded") {
    return new Promise(async function (resolve, reject) {
      var body = null;
      var token = await helpers.storage.get("token");

      var headers = {
        // 'Content-Type': multipart_formdata?'multipart/form-data;':'application/x-www-form-urlencoded',
        // "Accept": "applicaton/json",
        token: token,
      };
      if (bodyFormat == "urlencoded") {
        //urlencoded
        body = createBody(data, 2);
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else if (bodyFormat == "jsonraw") {
        headers["Content-Type"] = "application/json";

        body = createBody(data, 3);
      } else if (bodyFormat == "formdata") {
        body = createBody(data, 1);
      }

      await fetch(urlJoin(getHost(), url), {
        method: "POST",
        headers: headers,
        body: body,
      })
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch((ex) => {
          reject(ex);
        });
    });
  },
  //   UNTUK UPLOAD IMAGE
  upload_image: function (image) {
    return new Promise(async function (resolve, reject) {
      var body = null;
      var token = await helpers.storage.get("token");
      var headers = {
        // 'Content-Type': multipart_formdata?'multipart/form-data;':'application/x-www-form-urlencoded',
        // "Accept": "applicaton/json",
        token: token,
      };
      body = createBody({ file: image }, 1);
      await fetch(
        urlJoin(process.env.NEXT_PUBLIC_IMAGE_DELIVERY, "upload_image"),
        {
          method: "POST",
          headers: headers,
          body: body,
        }
      )
        .then((response) => response.json())
        .then((data) => {
          resolve(data);
        })
        .catch((ex) => {
          reject(ex);
        });
    });
  },
  get: function (url, data) {
    return new Promise(async function (resolve, reject) {
      await fetch(urlJoin(getHost(), url), {
        method: "GET",
        // headers: headers,
      })
        .then((response) => response.text())
        .then((data) => {
          resolve(data);
        });
    });
  },
};
