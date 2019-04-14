//abdulsmapara
var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var Cookie = require('cookie-parser');
var upload_module = require('./upload');
//var filename = "";
var validator = require('express-validator');
        // pull in the required packages.
var sdk = require("microsoft-cognitiveservices-speech-sdk");
// replace with your own subscription key,
// service region (e.g., "westus"), and
// the name of the file you want to run
// through the speech recognizer.
var subscriptionKey = "9e48f5d03e9c46aa89e3f5d11cc15cdb";
var serviceRegion = "westus"; // e.g., "westus"

// create the push stream we need for the speech sdk.



var port_no =process.env.PORT || 3000;
app.use(validator());

app.use(bodyparser.urlencoded({
    extended: true
}));
//console.log(__dirname);
app.use('/',express.static('/home/abdulsmapara/Speech-to-Text/public'));

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '');

    res.setHeader('Access-Control-Allow-Methods', 'POST', 'GET');

    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
           
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});


//app.use(bodyparser); 
//var jsonParser = bodyparser.json();
//
//var urlParser = bodyparser.urlencoded({
//    extended: true
//});

app.use(bodyparser.json());

app.use(Cookie());

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index',{"text":"none"});
});

app.get('/downloadSpeech',function (req,res) {
   var orgfile = req.query.orgfile;
    var confile = req.query.confile;

    res.download("./uploads/" + confile, function(err) {
        fs.unlink('uploads/' + orgfile, function (err) {
            if (err) {
                throw err;  
            } else {
                fs.unlink('uploads/' + confile, function (err) {
                    if (err) {
                        throw err;  
                    } else {
                        // res.redirect("http://localhost:3000/");
                    }
                    
                });
            }
            
        });
    });
     
});

app.post('/speechToText',function(req,res){

    var pushStream = sdk.AudioInputStream.createPushStream();
    if (!fs.existsSync('uploads/'))
    {
        fs.mkdirSync('uploads/');
    }

    var upload = upload_module.uploadFile('speech[]', './uploads/');
    upload(req, res, function (err) {
        if (err) {
            console.log('error ' + err);
        }else{
    console.log('FILE UPLOADED');
    var fname = upload_module.name();
    console.log('HERE IS MY FILE '+ fname);
    var filename = "./uploads/"+fname // 16000 Hz, Mono
    console.log("Now recognizing from: " + filename);

    // open the file and push it to the push stream.
    fs.createReadStream(filename).on('data', function(arrayBuffer) {
      pushStream.write(arrayBuffer.buffer);
    }).on('end', function() {
      pushStream.close();
    });

    // we are done with the setup
    
    // now create the audio-config pointing to our stream and
    // the speech config specifying the language.
    var audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    var speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);

    // setting the recognition language to English.
    speechConfig.speechRecognitionLanguage = "en-US";

    // create the speech recognizer.
    var recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // start the recognizer and wait for a result.
    recognizer.recognizeOnceAsync(
      function (result) {
        fs.writeFile('./uploads/Speech.txt',result.privText,function(err) {
            if(err) {
                recognizer.close();
                recognizer = undefined;
            } else {
                recognizer.close();
                recognizer = undefined;
                res.redirect("/downloadSpeech?orgfile=" + fname + "&confile=Speech.txt");
                
            }
        });
        
      },
      function (err) {
        console.trace("err - " + err);
        console.log('-----------------------HERE IS AN ERROR-----------------------');
        recognizer.close();
        recognizer = undefined;
        fs.unlink('uploads/' + file, function (err) {
            if (err) throw err;
            res.send("Error Occurred");

            });
        
        });

        }
    });
});

app.listen(process.env.PORT || 3000);

//http://abdulsmapara.eu-gb.mybluemix.net/