module.exports = require('./node_modules/fuzzyset/lib/fuzzyset.js');
const a = require('./config.json'); 
const token = a.token;
const apiKey = a.key;
const Discord = require('discord.js');

const Client = new Discord.Client();

const fetch = require('cross-fetch'); 


var itemlookup = FuzzySet();
var nameToID = {}; // convert a name to an ID
var allItems = {}; // stores ITEM_ID : {object} (basically the json file)
fetch('https://api.slothpixel.me/api/skyblock/items').then(function(response){
    return response.json();
}).then(function(data){
    for (var key in data){
        itemlookup.add(data[key].name);
        nameToID[data[key].name] = key;
        allItems[key] = data[key];
    }
})

var hypixelapi = 'https://api.hypixel.net/';

var playerapi = 'https://api.slothpixel.me/api/players/';
var auctionapi = 'https://api.slothpixel.me/api/skyblock/auctions/';
var bazaarapi = 'https://api.slothpixel.me/api/skyblock/bazaar/';
var headImages = 'https://sky.lea.moe/head/';

Client.on('message', function(msg){
    if (msg.content.startsWith('!getlevel')){
        let username = msg.content.replace('!getlevel ', '');
        fetch(playerapi + username).then(function(response){
            return response.json();
        }).then(function(data){
            let levelStr = JSON.stringify(data.level);
            msg.reply(username + "'s level is " + levelStr);
        })
    }
    if (msg.content.startsWith('!price')){
        let find = msg.content.replace('!price ', '');
        let name = itemlookup.get(find);
        let item = nameToID[name[0][1]]; // find the ID of the closest match (name[0][1] is closest, then name[1][1], etc)
        let texture = '';
        if ('texture' in allItems[item]){
            texture = allItems[item].texture;
        }
        let bazaar = allItems[item].bazaar;
        
        fetch(auctionapi + item + '?from=now-1d&to=now').then(function(response){ // RIGHT NOW QUERY IS FROM 1 day ago to now 
            return response.json();
        }).then(function(data){
            let priceEmbed = new Discord.MessageEmbed().setTitle('Price Check Successful! :white_check_mark:')
            .setDescription('**Average price** of ' + item + ' is: ' + data.average_price);
            if (texture != ''){
                priceEmbed.setThumbnail(headImages + texture);
            }
            msg.channel.send(priceEmbed);
        })
    }
});

var pg = 0;
fetch(hypixelapi + 'skyblock/auctions?key=' + apiKey + '&page=' + pg).then(function(response){
    return response.json();
}).then(function(data){
    auctions = data.auctions;
    console.log(data.totalPages + ' ' + data.totalAuctions);
    /*auctions.forEach(function(element) {
        console.log(element.item_name);
        console.log(element.starting_bid);
        var endTime = new Date(element.end);
        let dateString = endTime.getMonth() + '/' + endTime.getDate() + '/' + endTime.getFullYear() + ' ' + 
        endTime.getHours() + ':' + endTime.getMinutes();   
        console.log('ending at:' + dateString);
        if (element.hasOwnProperty('bin')){
            console.log('bin' + element.bin);
        }
    });*/
});


Client.login(token);