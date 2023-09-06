#! /usr/bin/env node
var moment = require('moment');
var figlet = require('figlet');
const {verifyConfig} = require('./config.js')

moment().format();

figlet('Candy V2 Mint Bot', function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data)
    verifyConfig()
});


