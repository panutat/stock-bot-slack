var Botkit = require('./lib/Botkit.js');
var http = require("http");

var host = 'dev.markitondemand.com';
var path = '/MODApis/Api/v2/Quote/json?symbol=';

var controller = Botkit.slackbot({
    debug: false
});

// connect the bot to a stream of messages
controller.spawn({
    token: 'XXXXXXXXXXXXXXXXXXXXX',
}).startRTM()

// give the bot something to listen for.
controller.hears('help', 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, 'Usage: quote {SYMBOL}.');
});

controller.hears('quote (.*)', 'direct_message,direct_mention,mention', function(bot, message) {
    var matches = message.text.match(/quote (.*)/i);
    var symbol = matches[1];

    var options = {
        host: host,
        path: path + symbol,
        method: 'POST',
        json: true
    };

    var callback = function(response) {
        var str = '';
        response.on('data', function(chunk) {
            str += chunk;
        });
        response.on('end', function() {
            var quote = JSON.parse(str);
            if (quote.Message) {
                bot.reply(message, quote.Message);
            } else {
                bot.reply(message, quote.Name + ' (' + quote.Symbol + ') -> ' + quote.LastPrice + ' (' + Math.round(quote.Change * 100) / 100 + ')');
            }
        });
    }

    http.request(options, callback).end();
});
