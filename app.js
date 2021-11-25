//jshint esversion:6
/************
Setup
************/
const _ = require("lodash");
const bodyParser = require("body-parser");
const dayjs = require('dayjs');
const ejs = require("ejs");
const express = require("express");
const https      = require('https');         // gets.
const moment     = require('moment');        // Date manipulation.
const mongoose = require('mongoose');



const app = express();

app.use(express.static("public")); // allow relative URL references in html files from public subdirectory.
app.use(
   bodyParser.urlencoded({
      extended: true,
   })
);
app.use( function(req, res, next) { // Ignore favicon.ico requests.
   if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
      return res.sendStatus(204);
   }
   return next();
});

app.set('view engine', 'ejs');

const sYYYYMMDDHHMMSS = 'YYYY.MM.DD-HH.mm.ss'; // .UUU to append milliseconds.
const sYYYYMMDDHHMMSSUUU = sYYYYMMDDHHMMSS + '.uuu'; // .UUU for milliseconds.

// Debug level settings.
const oDebug = {
   iNever:    -1,
   iNone:      0,
   iInit:      1,
   iHigh:      2,
   iMedium:    3,
   iFunction:  4,
   iInput:     5,
   iValues:    6,
   iDetails:   7,
   iTemporary: 8,
   iFull:      9,
   iAlways:   10,
}
let iDebug = oDebug.iFunction;  // Output function calls.



// Connect to Mongoose db.
const oDB = {
   oOptions: { useNewUrlParser: true, useUnifiedTopology: true },
   // sCollection: 'cTest',
   sName: 'dbToDoLists', //'ToDoListDB';
   sPassword: 'm0unTa1n',
   sPort: '27017',
   sUser: 'AdminMDB',
   sUri: '',   // sUri is for the online database.
   sUriQuery: '?retryWrites=true&w=majority',
   sUrl: '', // For the local database.
}
oDB.sUri = `mongodb+srv://${oDB.sUser}:${oDB.sPassword}@cluster0.h1arl.mongodb.net/${oDB.sName}`;
oDB.sUrl = `mongodb://localhost:${oDB.sPort}/${oDB.sName}`;
const sUrX = oDB.sUrl; // Select either local (sUrl), for testing, or online (sUri).

mongoose.connect(sUrX);
if (iDebug >= oDebug.iInit) { lg(`Connected to ${sUrX}.`); }



const oServer = {
   iPort: process.env.PORT || 3000,  // If PORT does not exist, use local value.
   sDirProj: __dirname + '/',
   sRoot: 'public/',
   sRootFull: '', // Place holder. Calculate value later.
   sRouteAbout: '/about',
   sRouteLists: '/lists/:sListName',
   sRouteAll: '/:sParam(*$)',
   sRouteCompose: '/compose',
   sRouteContact: '/contact',
   sRouteDelete: '/delete',
   sRouteFailure: '/f',
   sRouteHome: '/home',
   sRouteNew: '/new', // New.
   sRoutePost: '/post',
   sRoutePostsId: '/posts/:sId',
   sRoutePostsName: '/posts/:sPostName',
   sRoutePostsAll: '/posts/:sParam(*$)',
   sRouteRoot: '/', // Test functionality.
   sRouteWork: '/work',
   // See https://en.wikipedia.org/wiki/Uniform_Resource_Identifier.
   sURLScheme:'https://', // identifies the protocol to be used to access the resource on the Internet.
   sURLUserInfo: 'username:password@',
   sURLSub: 'www.', // Example.  www. is the default so it is not truly needed.
   sURLDomain: 'SalesTime', // Example.
   sURLTLD: '.com', // Example.
   sURLHost: '',  // sub.domain.TLD   // Place holder. Calculate value later.
   sURLPort: ':80', // Place holder. Calculate value later.
   sURLAuth: '', // UserInfo@Host:Port // Place holder. Calculate value later.
   sURLPath: '/PATH/PATH/TEST.html', //d '/TEST.HTML', // Example.
   sURLQuery: '?', //d '?id=234&name=FIRST',
   asURLParms: ['id=234', 'name=FIRST'], // Examples
   sURLFragement: '#top', // Example.
   sURL: '', // Place holder. Calculate value later.
   sView: '', // Place holder. Calculate value later.
   sViewPath: 'views/',
}
oServer.sRootFull  = oServer.sDirProj + oServer.sRoot;
oServer.sView      = oServer.sDirProj + oServer.sViewPath;
oServer.sURLHost   = oServer.sURLSub  + oServer.sURLDomain + oServer.sURLTLD;
oServer.sURLQuery += oServer.asURLParms.join('&');
oServer.sURLAuth   = oServer.sURLUserInfo + oServer.sURLHost + oServer.sURLPort;
oServer.sURL       = oServer.sURLScheme;
oServer.sURL      += oServer.sURLAuth;
oServer.sURL      += oServer.sURLPath;
oServer.sURL      += oServer.sURLQuery;
oServer.sURL      += oServer.sURLFragement;

// An object must be output via console.log() separately to prevent [obj obj].
// Or use JSON.stringify() if text output before object in same statement.
if (iDebug >= oDebug.iInit) { lg('oServer:', oServer); }



// Create Files object.
// For Directories only, end with trailing slash for consistancy.
// const oFiles = {
//    sFailure: oServer.sRootFull + 'failure.html',
//    sSignUp:  oServer.sRootFull + 'signup.html',
//    sStart:   oServer.sRootFull + 'index.html',
//    sSuccess: oServer.sRootFull + 'success.html',
//    //c sWorking: '',
// }

// With or Without sRootFull?999
const oFiles = {
   sAbout:   'about.ejs',
   sCompose: 'compose.ejs',
   sContact: 'contact.ejs',
   sHome:    'home.ejs',
   sPost:    'post.ejs',
}

if (iDebug >= oDebug.iInit) { lg('oFiles:', oFiles); }



/************
Initialize
************/



const sAboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const sContactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const sHomeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";

let aoPosts = [];
let sTemp;



// Create API config object.
const oApiConfig = {
   // MailChimp configuration.
   // A bad value causes 401 error
   sAPIKey: 'c6bfe2483357adfa219e49625906cf62-us5', // MailChimp.
   sAudienceId: '2ff7272871', // MailChimp.
   // A bad value causes .on('error')... to fire.
   sServer: 'us5', // MailChimp
   sURL: '',
   // A bad value causes 404 error.
   sURLRoot: '.API.MailChimp.com/3.0/lists/', // MailChimp

   /* // OpenWeather configuration.
   sURLRoot: 'api.openweathermap.org/data/2.5/weather/'; // End with / since not a file.
   sURLImage: 'http://openweathermap.org/img/wn/',
   sApiKey: '4ae6598710bbd0f6ab377a3796ff65b3',
   sUnitsDefault: 'imperial',
   sCityName: 'Laguna Niguel', /* */

   /* // JokeAPI configuration.
   sURLRoot: 'v2.jokeapi.dev/joke/Any/', //'encrypted.google.com';
   sURLQuery: '?format=txt'; // Returns text so must update ??? /* */
}
// oApiConfig.sURLQuery = ``;
// https:// + us5 + .API.MailChimp.com/3.0.lists/ + 2ff727871
oApiConfig.sURL = `${oServer.sURLScheme}${oApiConfig.sServer}${oApiConfig.sURLRoot}${oApiConfig.sAudienceId}`;
// oApiConfig.sURL += sURLQuery;
//d console.log('MCConfig:' + JSON.Stringify(oApiConfig));
if (iDebug >= oDebug.iInit) { lg('oApiConfig:', oApiConfig); }



/************
DB Schema setup.
************/
const oSchemaPost = {
   sTitle: {
      type: String,
      required: [true, 'The Title is required (e.g. Red Car).'],
   },
   sTitleLc: String, // Used for comparisons.
   sContent: {
      type: String,
      required: [true, 'Some content is required (e.g. I purchased a new car today.).'],
   },
   sDate: {
      type: String,
      default: sNow(),
   },
   iLength: {
      type: Number,
      default: -1,
   },
};
if (iDebug >= oDebug.iInit) { lg('oSchemaPost created.'); }

let sCollection = 'Post';
const mNewModelPost = mongoose.model(sCollection, oSchemaPost);
sCollection += 's';
if (iDebug >= oDebug.iInit) { lg('mNewModelPost created.'); }


/************
Functions.
************/
function bIsEmpty(oObject) {
   let iDebug = oDebug.iNever; // Override default w local var to turn off permanently.
   if (iDebug >= oDebug.iFunction) { console.log('= bIsEmpty():')}
   let bIsEmpty_ = false; // Assume the object is not empty.  Set to true if found to be 'empty'.
   let sType = typeof oObject;
   if (sType == 'object') {
      bIsEmpty_ |= oObject.keys(oObject).length == 0;
      bIsEmpty_ |= oObject == Null;
   } else {
      bIsEmpty_ |= oObject == '';
      bIsEmpty_ |= oObject == undefined;
      bIsEmpty_ |= oObject == NaN;
   }
   if (iDebug >= oDebug.iDetails) { console.log((bIsEmpty_ ? 'true' : 'false') + '.'); }
   return bIsEmpty_;
}

function init() {
   //d document.addEventListener('keyup', KeyPressed); // wait for a key press.
}

function iRandom(iMaxValue = 4) {
   let iNum = Math.floor(Math.random() * iMaxValue); // 0 - (iMaxValue-1).
   return iNum + 1; // returns 1 - iMaxValue.
}

// Log the object separate from the text to display the object's structure and key/value pairs.
function lg(sTemp, oTemp = '', bStringify = false) {
   if (typeof oTemp == 'object') { // object or array.
      console.log(sTemp);
      if (bStringify) {
         console.log(JSON.stringify(oTemp));
      } else {
         console.log(oTemp);
      }
   } else {
      console.log(sTemp + oTemp);
   }
}

function sHTTPSErrorMessage(oRes, sURL) {
   let sTemp = `Error: ${oRes.statusCode} (${oRes.statusMessage}).`;
   sTemp += `  Could not get requested information from ${oApiConfig.sURL}.`;
   return sTemp;
}

function sNowY2S() {
   // Requires momentjs.
   return moment().format('YYYY.MM.DD HH:MM:SS');
}

function sNow(sFormat = sYYYYMMDDHHMMSS, dDate = new Date()) {
   // Requires dayjs.
   return dayjs(dDate).format(sFormat)
}

function notifyOnce(oRes, sNotice) {
   // let dNow = new Date();
   // let sDate = moment(dNow).format('YYYY-MM-DD HH:MM:SS');
   let sTemp = `${sNowY2S()}: ${sNotice}.`;
   console.log(sTemp);
   oRes.send(sTemp);
}

// Replace the last character of a string, if it matches, with the replacement.
function sReplaceLastCharacter(sString, cLast, sReplacement) {
   let sReturn = '';
   if (sString.slice(-1) == cLast) {
      // Does this string end in cLast?
      let sReturn = sString.slice(0, -1) + sReplacement;
   } else {
      sReturn = sString;
   }
   return sReturn;
}



/************
Server. Process the web requests. 111 for quick search.
************/

app.get(oServer.sRouteRoot, function(oBrowserReq, oBrowserRes) {
   oBrowserRes.send(`Server is up and running on port ${oServer.iPort} at ${oServer.sRootFull}.`);
});

// Reserve root for testing.  Use /i to start the webpage.
app.get(oServer.sRouteNew, function(oBrowserReq, oBrowserRes) {
   console.log(sNowY2S(), ':', oFiles.sSignUp);
   oBrowserRes.sendFile(oFiles.sSignUp);
});

app.post(oServer.sRouteAdd, function(oBrowserReq, oBrowserRes) {
   oBrowserRes.redirect(oServer.sRouteNew);
});

app.post(oServer.sRouteFailure, function(oBrowserReq, oBrowserRes) {
   oBrowserRes.redirect(oServer.sRouteNew);
});

app.post(oServer.sRouteNew, function(oBrowserReq, oBrowserRes) {
   // notifyOnce(browserRes, browserReq.body.cityName);
   // console.log('Post received.');
   // browserRes.send('Post received.');
   let sCityName = oBrowserReq.body.cityName;
   if (sCityName.length == 0) {
      oBrowserRes.send('No city name.');
   } else {
      let sQuery = `?q=${sCityName}`;
      let sUnits = `&units=${oApiConfig.sUnitsDefault}`;
      let sAppId = `&appid=${oApiConfig.sApiKey}`; // Backticks.
      let sURL = sURLPath + sQuery + sUnits + sAppId;
      let sTemp = 'Post:' + sURL;
      console.log(sTemp);
      // notifyOnce(browserRes, sTemp);
      https
         .get(sURL, (oAPIRes) => {
            let iStatusCode = oAPIRes.statusCode;
            console.log('statusCode:', iStatusCode);
            if (iStatusCode != 200) {
               //d console.log('----------all:', oAPIRes);
               let sTemp = sHTTPSErrorMessage(oAPIRes, sURL);
               console.log(sTemp);
               browserRes.send(sTemp);
            } else {
               //d console.log('headers:', response.headers);
               //d console.log('----------all:', response);
               oAPIRes.on('data', (hData) => {
                  /* process.stdout.write('hData:' + hData); // "{...}"
                  console.log('hData:', hData)  // Result: <buffer 7b ... 7b>
                  let sData = hData.toString(); // Result: "{...}"
                  console.log('sData:', sData) /* eod */
                  let oWeatherData = JSON.parse(hData); // Formal string is not required.  result: {...}
                  console.log('oData:', oWeatherData);
                  let sTemp = sDateYyyy2Ss();
                  sTemp = `<p>As of ${sTemp}:</p>`;
                  oBrowserRes.write(sTemp);
                  let oMain = oWeatherData.main; // Test functionality in case need multiple values from same object.
                  let iTemperature = oMain.feels_like.toFixed(0); // Whole number.
                  let sDescription = oWeatherData.weather[0].description;
                  sDescription = sReplaceLastCharacter( // sky becomes skies.
                     sDescription,
                     'y',
                     'ies'
                  );
                  // Used several writes opposed to sTemp concationation to test write and send functionality.
                  sTemp = `<p>It is currently ${sDescription}.</p>`;
                  oBrowserRes.write(sTemp);
                  sTemp = oWeatherData.sys.country;
                  sTemp = `<h1>${iTemperature} degrees Fahrenheit in ${sCityName}, ${sTemp}.</h1>`;
                  oBrowserRes.write(sTemp);

                  let iImgSize = 4; // 2-4.
                  sTemp = ((iImgSize >= 2) && (iImgSize <= 4)) ? `@${iImgSize}x` : '';
                  sTemp = `${oApiConfig.sURLImage}${oWeatherData.weather[0].icon}${sTemp}.png`; // image URL.
                  sTemp = `<img src="${sTemp}" alt="Weather Icon" />`; // Ending / = XML compatable.
                  oBrowserRes.write(sTemp);

                  oBrowserRes.send();
               });
            } // eo else != 200.
         })
         .on('error', (oEvnt) => {
            // https.get error.
            console.error(oEvnt);
         });
   }
});

app.listen(oServer.iPort, function() {
   let sTemp = `Express server started on port ${oServer.iPort}.`;
   sTemp += `  Use localhost:${oServer.iPort + oServer.sRouteNew}.`;
   sTemp += `  Root:${oServer.sRootFull}.`;
   console.log(sTemp);
});



init();
