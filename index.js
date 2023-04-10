const express = require('express');
const fs = require('fs');
const multer  = require('multer');

require('dotenv').config();
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

const http = require("http");



const app = express();






// configure multer storage and file filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '.mp3')
  }
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'audio/mp3' || file.mimetype === 'audio/mpeg') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only MP3 files are allowed.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });


// Speech to text if needed : 
const speech = require('@google-cloud/speech').v1p1beta1;
const { promisify } = require('util');
const linear16 = require('linear16');
// const speech = require('@google-cloud/speech');

const client2 = new speech.SpeechClient({
  keyFilename: './smiling-matrix-345211-51682d772521.json'
});




// route for file upload
app.post('/upload', upload.single('hindi'), (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error('Please upload an MP3 file.');
    error.status = 400;
    return next(error);
  }

else
  (async () => {

    const outPath = await linear16({
    inPath:  req.file.path,
    outPath: './uploads/' +file.fieldname+'.wav'
    });
    console.log(outPath); // Returns the output path, ex: ./output.wav
    const readFile = promisify(fs.readFile);
  async function quickstart() {
    // The path to the remote LINEAR16 file
    const gcsUri = await readFile(outPath);
  
    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
      content: gcsUri,
    };
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz:16000,
      languageCode: 'hi-IN',
    };
    // hi-IN
    // en-US
    const request = {
      audio: audio,
      config: config,
    };
  
    // Detects speech in the audio file
    const [response] = await client2.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log(`Transcription: ${transcription}`);
    res.send(`${transcription}`)
    // return transcription;
  }
  quickstart();
    })();












  // res.send('File uploaded successfully.');
});

// start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});






module.exports = app;




