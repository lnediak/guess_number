var Discord = require("discord.io");
var auth = require("./auth.json");

function now() {
    return (new Date()).getTime();
};

function makeTimeString(t) {
    var toreturn = "";
    if (t >= 3600000) {
	toreturn += "`" + Math.floor(t / 3600000) + "` hours, ";
    }
    if (t >= 60000) {
	toreturn += "`" + Math.floor((t % 3600000) / 60000) + "` minutes, ";
    }
    if (t >= 1000) {
	toreturn += "`" + Math.floor((t % 60000) / 1000) + "` seconds, and ";
    }
    return toreturn + "`" + Math.floor(t % 1000) + "` miliseconds";
};

function log(str) {
    var d = new Date();
    console.log(d.toString() + ": " + str);
};

var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on("ready", function(event) {
    log("Logged in as " + bot.username + " - (" + bot.id + ")");
});

var games = [];
bot.on("message", function(user, userID, channelID, message, event) {
    if (bot.channels[channelID].name != "guess-that-number") return;


    function send(str) {
	bot.sendMessage({to: channelID, message: str});
    };
    function game_report(game) {
	return "`" + game.number +
	    "` after `" + game.guesses + "` guesses, " +
	    makeTimeString(now() - game.timestamp);
    };




    if (message.substring(0, 7) == "g!start") {
	for (var i = 0; i < games.length; i++) {
	    var game = games[i];
	    if (game.user == userID) {
		send("You already have a game in progress. Use ```g!stop``` to cancel it.");
		return;
	    }
	}
	var arg = "1000000";
	function help() {
	    send("```Usage: g!start [max number (>= 1) (default " + arg + ")]```");
	};
	var args = message.substring(8).split(" ");
	if (args.length != 1) {
	    help();
	    return;
	}
        arg = (args[0] == "")? arg: args[0];
        arg = parseInt(arg);
        if (isNaN(arg)) {
            help();
            return;
        }
        if (arg < 1) {
            help();
            return;
        }

	send("Beginning game with <@" + userID + "> with maximum number `" + arg + "`");
	games.push({user: userID,
		    number: Math.floor(Math.random() * arg) + 1,
		    guesses: 0,
		    timestamp: now()});




    } else if (message.substring(0, 7) == "g!guess") {
	for (var i = 0; i < games.length; i++) {
	    var game = games[i];
	    if (game.user == userID) {
		function help() {
		    send("```Usage: g!guess number```");
		};
		var args = message.substring(8).split(" ");
		if (args.length != 1) {
		    help();
		    return;
		}
		var arg = parseInt(args[0]);
		if (isNaN(arg)) {
		    help();
		    return;
		}
		game.guesses++;
		if (arg == game.number) {
		    send("You have successfully guessed " + game_report(game) + "!");
		    games.splice(i, 1);
		} else if (arg > game.number) {
		    send("The number you have guessed (`" + arg + "`) is too high");
		} else {
		    send("The number you have guessed (`" + arg  + "`)is too low");
		}
		return;
	    }
	}
	send("You have no games in progress. Start a game with ```g!start [number]```");




    } else if (message.substring(0, 6) == "g!stop") {
	for (var i = 0; i < games.length; i++) {
	    var game = games[i];
	    if (game.user == userID) {
		send("Stopping game with <@" + game.user + "> to guess " +
		     game_report(game) + ".");
		games.splice(i, 1);
		return;
	    }
	}
	send("You have no games in progress. Start a game with ```g!start [number]```");
    }
});
