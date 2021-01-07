
import fs = require('fs');
import http = require('http');
import https = require('https');
import bodyParser = require('body-parser')
var privateKey  = fs.readFileSync('.ssh\\id_rsa', 'utf8');
var certificate = fs.readFileSync('.ssh\\certificate_management.azure.com.cer', 'utf8');
var certificate = fs.readFileSync('.ssh\\certificate_127.0.0.1.cer', 'utf8');

var credentials = {key: privateKey, cert: certificate};
import express = require('express');
var app = express();

import {validateRequest} from "./validator"

// your express configuration here
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/hello', (req, res) => {
    console.log(req)
    res.send('Hello World!')
  });

app.get('/metadata/endpoints',  (req, res) => { 
  console.log("fetching metadata");

  let ret = {
        "galleryEndpoint": "",
        "graphEndpoint": "https://graph.chinacloudapi.cn/",
        // "graphEndpoint": "https://localhost:8443",
        "portalEndpoint": "",
        "authentication": {
            // "loginEndpoint": "https://localhost:8443", // "https://login.chinacloudapi.cn/",
            "loginEndpoint": "https://login.chinacloudapi.cn/",
            "audiences": [
                // "http://localhost:8081",
                "https://management.core.chinacloudapi.cn/",
                "https://management.chinacloudapi.cn/"
            ]
        }
    }

  res.writeHead(200, {'content-type': 'application/json; charset=utf-8'});
  res.end(JSON.stringify(ret));
});

app.all('*', (req, res) => {

    if (req.url.indexOf("/subscriptions?")>=0) {
      res.status(200).json({"value":[
        {
          "cloudName": "mock",
          "homeTenantId": "00000000-0000-0000-0000-000000000000",
          "id": "00000000-0000-0000-0000-000000000000",
          "isDefault": false,
          "managedByTenants": [
            {
              "tenantId": "00000000-0000-0000-0000-000000000000"
            }
          ],
          "name": "Code generate Test and Infra",
          "state": "Enabled",
          "tenantId": "00000000-0000-0000-0000-000000000000",
          "user": {
            "name": "00000000-0000-0000-0000-000000000000",
            "type": "servicePrincipal"
          }
        }
      ]})
      return;
    }
    console.log("hitting: ", req.originalUrl, req.body)
    //res.send('Hello World!')
    validateRequest(req, res).then((x)=> {

    }).catch(reason=>{
      res.status(500).json({error: reason})
    })
});


var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(80, '0.0.0.0');
httpsServer.listen(443, '0.0.0.0');
console.log("listening")

