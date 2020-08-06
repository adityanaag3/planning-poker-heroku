const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const jwt = require('salesforce-jwt-bearer-token-flow');
const jsforce = require('jsforce');
const bodyParser = require('body-parser');
const SSE = require('express-sse');
const RestUtils = require('./restUtils.js');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(helmet());
app.use(compression());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3002;

const DIST_DIR = './dist';

app.use(express.static(DIST_DIR));

let conn;
let sse = new SSE();
let restUtilsObj;

// Read Environment Variables
const { SF_CONSUMER_KEY, SF_USERNAME, SF_LOGIN_URL } = process.env;
let PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    PRIVATE_KEY = require('fs').readFileSync('private.pem').toString('utf8');
}

let SF_NAMESPACE = process.env.SF_NAMESPACE;
if (!SF_NAMESPACE) {
    SF_NAMESPACE = '';
}

if (!(SF_CONSUMER_KEY && SF_USERNAME && SF_LOGIN_URL && PRIVATE_KEY)) {
    console.error(
        'Cannot start app: missing mandatory configuration. Check your environment variables'
    );
    process.exit(-1);
}

// Authenticate to Salesforce using JWT Flow
jwt.getToken(
    {
        iss: SF_CONSUMER_KEY,
        sub: SF_USERNAME,
        aud: SF_LOGIN_URL,
        privateKey: PRIVATE_KEY
    },
    (err, tokenResponse) => {
        if (tokenResponse) {
            conn = new jsforce.Connection({
                instanceUrl: tokenResponse.instance_url,
                accessToken: tokenResponse.access_token
            });

            restUtilsObj = new RestUtils(conn);

            //Subscribe to Streaming Events
            conn.streaming
                .topic(`/event/${SF_NAMESPACE}__Game_State_Change__e`)
                .subscribe(function (message) {
                    sse.send(message, 'GameStateChange');
                });

            conn.streaming
                .topic('PlayerResponses')
                .subscribe(function (message) {
                    sse.send(message, 'NewPlayerResponse');
                });
        } else if (err) {
            console.error(err);
            process.exit(-1);
        }
    }
);

// Redirect all non /api/ endpoint requests to index.html
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.resolve(DIST_DIR + '/index.html'));
});

// Initialize Server Sent Events
app.get('/api/gameUpdatesStream', sse.init);

// Keep SSE Connection Alive
const HEARTBEAT_INTERVAL = process.env.HEARTBEAT_INTERVAL || 30 * 1000; // 30 seconds
const heartBeat = () => sse.send(':ping');
setInterval(heartBeat, HEARTBEAT_INTERVAL);

// Endpoint to get stored namespace
app.get('/api/getNamespace', function (req, res) {
    let underscoredNamespace = SF_NAMESPACE;
    if (underscoredNamespace !== '') {
        underscoredNamespace = underscoredNamespace + '__';
    }
    res.json(underscoredNamespace);
});

// Expose API endpoints for Salesforce Integration

app.get('/api/validateGameKey', function (req, res) {
    const { gameKey } = req.query;
    const url = `/${SF_NAMESPACE}/PlanningPokerServices/ValidateGameKey?gameKey=${gameKey}`;
    restUtilsObj.doApexGet(url, req, res);
});

app.get('/api/verifyPlayer', function (req, res) {
    const { gameId, playerName } = req.query;
    const url = `/${SF_NAMESPACE}/PlanningPokerServices/VerifyPlayer?gameId=${gameId}&playerName=${encodeURI(
        playerName
    )}`;
    restUtilsObj.doApexGet(url, req, res);
});

app.get('/api/getPlayerResponses', function (req, res) {
    const { gameId, storyId } = req.query;
    const url = `/${SF_NAMESPACE}/PlanningPokerServices/GetAllPlayerResponses?gameId=${gameId}&storyId=${storyId}`;
    restUtilsObj.doApexGet(url, req, res);
});

app.get('/api/getUnvotedItem', function (req, res) {
    const { gameId } = req.query;
    const url = `/${SF_NAMESPACE}/PlanningPokerServices/GetCurrentUnvotedItem?gameId=${gameId}`;
    restUtilsObj.doApexGet(url, req, res);
});

app.get('/api/getTimerTimestamp', function (req, res) {
    const { gameId } = req.query;
    const url = `/${SF_NAMESPACE}/PlanningPokerServices/GetTimerTimestamp?gameId=${gameId}`;
    restUtilsObj.doApexGet(url, req, res);
});

app.post('/api/insertPlayer', function (req, res) {
    const url = `/${SF_NAMESPACE}/PlanningPokerServices/InsertPlayer`;
    restUtilsObj.doApexPost(url, req.body, res);
});

app.post('/api/captureVote', function (req, res) {
    const url = `/${SF_NAMESPACE}/PlanningPokerServices/CaptureVote`;
    restUtilsObj.doApexPost(url, req.body, res);
});

app.listen(PORT, () =>
    console.log(`✅  API Server started: http://${HOST}:${PORT}`)
);
