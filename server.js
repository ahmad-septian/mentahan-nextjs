var glob = require( 'glob' )
  , path = require( 'path' );
require('dotenv').config()
process.setMaxListeners(0)
var middlewares = [];
glob.sync( './src/middlewares/**/*.js' ).forEach( function( file ) {
  console.log("Load middleware : ",file )
  middlewares.push(require( path.resolve( file ) ));
});

var services = [];
glob.sync( './src/services/**/*.js' ).forEach( function( file ) {
  console.log("Execute service : ",file )
  services.push(require( path.resolve( file ) ));
});




const chalk = require("chalk");
const PORT = process.env.PORT
const PORT_PRODUCTION_STATIC = process.env.PORT_PRODUCTION_STATIC
const HOST = process.env.HOST
const SSL_KEY = process.env.SSL_KEY
const SSL_CERT = process.env.SSL_CERT

var UrlPattern = require('url-pattern');
const { parse } = require("url");
const next = require("next");


const express = require('express');
var appExpress = null;
const fs = require("fs");
const dev = process.env.NODE_ENV !== "production";

const appNext = next({dev:dev, hostname: HOST, port: PORT });
var servNext = null;
var servStatic = null;
var protocol = "http";
var useSSL = false;
const handle = appNext.getRequestHandler();
const httpsOptions = {
    
};
if (fs.existsSync(SSL_KEY) && fs.existsSync(SSL_CERT)  ) {
    useSSL = true;
    protocol = "https";
    httpsOptions.key = fs.readFileSync(SSL_KEY);
    httpsOptions.cert = fs.readFileSync(SSL_CERT);
}

function handleRequest(req,res){


  //middleware processing before reach NextJS handler
  try{
    for (const mware of middlewares){
      var pattern = new UrlPattern(mware.match);
      var match = pattern.match(req.url);
      if (match){
          if (!mware.handle(req,res)) return;
      }
    }
  }catch(err){
    console.log("Middleware Processing Error", err)
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: `Middleware Error: ${err}`, result: false }));
    return;
  }

  handle(req, res);
}
const server = express();
const cors = require('cors');
server.use(cors({
    origin: '*'
}));
server.use("/dist", express.static(path.join(__dirname, "dist")));
server.all("*", (req, res) => {
  return handleRequest(req,res); 
});
if (useSSL){
    var https = require('https');
    servNext = https.createServer(httpsOptions, server);
}else{
    var http = require('http');
    servNext = http.createServer(server);
}

if (dev){
  
    appNext.prepare().then(() => {
      servNext.listen(PORT, (err) => {
          if (err) throw err;    
          console.log(`> Server started on ${protocol}://${HOST}:${PORT}`);
          for (const service of services){
            service.handle();
          }
        });
    });
}else{
    
    
    
    appNext.prepare().then(() => {

      
          servNext.listen(PORT, (err) => {
            if (!err) {
              // log the LOCALHOST and LOCALIP addresses where the app is running
              console.log(
                `\n${chalk.rgb(7, 54, 66).bgRgb(38, 139, 210)(" I ")} ${chalk.blue(
                  "Application is running at"
                )} ${chalk.rgb(235, 220, 52).bold(HOST)} ${chalk.blue(
                  "or"
                )} ${chalk.rgb(235, 220, 52).bold(`http://${HOST}:${PORT}`)}\n`
              );

              for (const service of services){
                service.handle();
              }
            } else {
              console.err(`\nUnable to start server: ${err}`);
            }
        });
  }).catch((err)=>{
    console.log(err)
  });

    // appExpress.use(express.static("out"));
    // // tell express to listen for incoming connections on the specified PORT
    // servStatic.listen(PORT_PRODUCTION_STATIC, (err) => {
    //       if (!err) {
    //         // log the LOCALHOST and LOCALIP addresses where the app is running
    //         console.log(
    //           `\n${chalk.rgb(7, 54, 66).bgRgb(38, 139, 210)(" I ")} ${chalk.blue(
    //             "Application Static build is running at"
    //           )} ${chalk.rgb(235, 220, 52).bold(HOST)} ${chalk.blue(
    //             "or"
    //           )} ${chalk.rgb(235, 220, 52).bold(`http://${HOST}:${PORT_PRODUCTION_STATIC}`)}\n`
    //         );
    //       } else {
    //         console.err(`\nUnable to start server: ${err}`);
    //       }
    //   });
}
//git pull
//git checkout HEAD^ package-lock.json 