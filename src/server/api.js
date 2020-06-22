// Simple Express server setup to serve for local testing/dev API server
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');

const app = express();
app.use(helmet());
app.use(compression());

const HOST = process.env.API_HOST || 'localhost';
const PORT = process.env.API_PORT || 3002;

/*const   fs = require('fs')
    ,   privateKey = fs.readFileSync('src/server/private.pem').toString('utf8')
    ,   jwt = require("salesforce-jwt-bearer-token-flow")
;

let token = jwt.getToken({
    iss: "3MVG9z6NAroNkeMk9xcC463M5am1T7EarK9xvIfGqg.SwwZ1ru_fc9w72O7Ooab9sDRmdBrrhWtELd0sG7Izu",
    sub: "test-1mgadsbshvcv@example.com",
    aud: "https://test.salesforce.com",
    privateKey: privateKey
},
function(err, token){
    console.log(err);
    console.log(token);
}
);

var path = require('path');
*/

app.get('/api/v1/getsomething', function (req, res) {
    res.send('here you go');
});

app.listen(PORT, () =>
    console.log(
        `✅  API Server started: http://${HOST}:${PORT}/api/v1/endpoint`
    )
);
