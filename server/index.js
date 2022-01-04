var express = require('express');
var multer  = require('multer');
const { Crypto } = require("@peculiar/webcrypto");
const crypto = new Crypto();
const util = require('util');
var fs = require('fs'),
    path = require('path')   
    
var app = express();

app.use(express.static('public')); // for serving the HTML file

// var upload = multer({ dest: __dirname + '/public/uploads/' });
var storage1 = multer.memoryStorage();
var upload = multer({ 
    storage:storage1
});
var type = upload.single('upl');


app.post('/api/test', type, function (req, res) {
   
decryptfile(req.file.buffer)
   

   async function decryptfile(imageName) {

      

		//var imageName = JSON.stringify(imageName);
      console.log("imageName : " , imageName);
        
      //   // var cipherbytes=await Buffer.from(JSON.stringify(file),'binary');
      //   // console.log("buffer : " , cipherbytes)

        var cipherbytes  = new Uint8Array(imageName);
        console.log("uint8Array : " , cipherbytes);
        
     
        
        var pbkdf2iterations=10000;
		var passphrasebytes=new TextEncoder("utf-8").encode(imageName)
		var pbkdf2salt=cipherbytes.slice(8,16);

        var passphrasekey=await crypto.subtle.importKey('raw', passphrasebytes, {name: 'PBKDF2'}, '', ['deriveBits'])
		.catch(function(err){
			console.error(err);

		});
        console.log("passphrasekey : " , passphrasekey);

        var pbkdf2bytes=await crypto.subtle.deriveBits({"name": 'PBKDF2', "salt": pbkdf2salt, "iterations": pbkdf2iterations, "hash": 'SHA-256'}, passphrasekey, 384)		
		.catch(function(err){
			console.error(err);
		});
        console.log("pbkdf2bytes : " , pbkdf2bytes);

        pbkdf2bytes=new Uint8Array(pbkdf2bytes);
        console.log("pbkdf2bytes **** : " , pbkdf2bytes);

		var keybytes=pbkdf2bytes.slice(0,32);
        console.log("keybytes **** : " , pbkdf2bytes);

		var ivbytes=pbkdf2bytes.slice(32);
        console.log("ivbytes **** : " , ivbytes);

		cipherbytes=cipherbytes.slice(16);
        console.log("cipherbytes **** : " , cipherbytes);

        var key=await crypto.subtle.importKey('raw', keybytes, {name: 'AES-CBC', length: 256}, false, ['decrypt']) 
		.catch(function(err){
			console.error(err);
		});

        console.log("key : " , key);

        var plaintextbytes=await crypto.subtle.decrypt({name: "AES-CBC", iv: ivbytes}, key, cipherbytes)
		.catch(function(err){
			console.error(err);
		});

        console.log("plaintextbytes : " , plaintextbytes);

        if(!plaintextbytes) {
           console.log("Plaint text not found");
           return;
        }

        plaintextbytes=new Uint8Array(plaintextbytes);

		var blob=new Blob([plaintextbytes], {type: 'application/download'});

        console.log("FINAL BLOB : " , blob)
	}

   
});

app.listen(9000);