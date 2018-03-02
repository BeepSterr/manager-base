// LOAD MODULES
try{
    
    //Discord.js Base
    Discord     = require("discord.js");
    client      = new Discord.Client();
    
    //all of the yes
    chalk       = require('chalk');
    fs          = require('fs');
    request     = require('request');
    path        = require('path')

    cmds = {};
    langs = {};
    modules = {};
    bot = {};
    bot.status = "Starting";
    bot.cache = {};
    bot.cache.config=[];
    bot.stats = { uptime: 0, commandsExecuted: 0}
    bot.selfbot = false;
    bot.terminating = false;

}catch(ex){
    
    console.error(ex);
    
    console.error('\x1b[31m' + 'FATAL ERROR:');
    console.error(' Cannot load required bot modules.');
    console.error(' Try running "npm install" and try again.\x1b[0m');
    process.exit();
}

try{
    
    cfg = require('./config.json');

	knex = require('knex')({
        client: 'sqlite3',
        connection: {
          filename: "./manager.db"
        },
        useNullAsDefault: true
    });
    
}catch(ex){
    
    console.error(chalk.red('FATAL ERROR:'));
    console.error(chalk.red(' Cannot load config.json'));
    process.exit();
    
}

bot.log = function(text) {
    client.shard.send({type:"log/default", message: text })
}

bot.paniclog = function(type, text){

    if(type == "error"){
        client.shard.send({type:"dlog/error", message: text, author: null })
        return;
    }

    if(type == "feedback"){
        client.shard.send({type:"dlog/feedback", message: text, author: null })
        return;
    }

}
bot.formattime = function(input){ return input };
bot.setStatus = function(text) {

    client.shard.send({
        type:"status/update", 
        guilds: client.guilds.array().length, 
        channels: client.channels.array().length, 
        members: client.users.array().length, 
        cmds: bot.stats.commandsExecuted, 
        uptime: bot.formattime(bot.stats.uptime),
        status: text 
    })

    bot.status = text;
}
bot.setStatus("Starting...");

bot.message = function(type, message){
    if(type == 'in'){ client.shard.send({type:"log/incmsg", message: message.cleanContent }) }
}

bot.log('Starting bot...');
bot.getClient = function(){ return client }

bot.eventListeners = {}
bot.subscribeEvent = function(mod, event){
    if(bot.eventListeners[event] == undefined){
        bot.eventListeners[event] = [];
    }

    bot.eventListeners[event].push(mod.module);

};

bot.onEvent = function(event, data){

    
    if(event != '*'){
        bot.onEvent('*', data);
    }

    if(bot.eventListeners[event] == undefined){
        bot.eventListeners[event] = [];
    }

    bot.eventListeners[event].forEach(listener =>{
        modules[listener].onEvent(event, data);
    })

};

bot.L = function(config, section, value, data = null){

    var usecfg = config

    if(langs[config.lang] == undefined){ usecfg.lang = 'en_US' }

    var result = langs[usecfg.lang][section][value]

    if(result == undefined){ 
        result = langs['en_US'][section][value] 
    }
	
    var langstring = result.replace("$1", data);

    return langstring;

}

bot.commandChecks = [];
bot.addCommandCheck = function(func){

    if(func == undefined){
        bot.log(chalk.orange('Adding command check failed, No function supplied!'))
        return;
    }

    bot.commandChecks.push(func);

};

bot.handleCommandChecks = function(message, cfg, cb){

	//create copy of checks to work with.
    var checks = bot.commandChecks;
    var i = 0;

	var doLoop = function(checkFailed, i){

        if(checkFailed == true){ cb(false, message, cfg); return; }
		if(i == checks.length){ cb(true, message, cfg); return; }

		bot.commandChecks[i](message, cfg, (result)=>{
            checkFailed = !result;
            i++
			doLoop(checkFailed, i);
		})

	}

	doLoop(false, i);

};

bot.aliases = [];
bot.addAlias = function(command, alias){

    bot.aliases[alias] = command.trigger;
    //bot.log('Alias "'+alias+'" for command "' + command.trigger + '" added')

};

bot.reply = function(message, content, embed = {}){ message.channel.send(content, embed); }


//load all language files
bot.loadLang = function(){
	fs.readdir(__dirname + '/lang/', (err, files) => {
		files.forEach(file => {
			try{

				bot.log('Loading Language: ' + file);

				tempJS  = fs.readFileSync(__dirname + '/lang/' + file);
				temp    = JSON.parse(tempJS);

				if(temp.lang_version == cfg.discord.lang_ver){
					langs[temp.lang_short] = temp
				}else{
					bot.log(chalk.red('Skipped Language ' + file + " (Incorrect Version)"));
				}


			}catch(ex){
				bot.log(chalk.red('Language ' + file + " failed: ") + ex);
			}
		});
	})
}

bot.loadLang();

// Config & Node-Modules loaded
// Lets start identifying bot modules.
var botModules = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory()) //thx @pravdomil
var modulesInit = botModules(__dirname + '/bot_modules/');

modulesInit.forEach(mod =>{

    bot.log('Loading Module: ' + mod);

    //module 'mod' is about to be loaded.
    modules[mod] = require(__dirname + '/bot_modules/' + mod + '/module.js');
    modules[mod].initializeModule(mod);

    //now lets get the commands from said module
    fs.readdir(__dirname + '/bot_modules/' + mod + '/commands/', (err, files) => {
        files.forEach(file => {
            try{

                //bot.log('Loading Command: ' + file);

                temp = require(__dirname + '/bot_modules/' + mod + '/commands/' + file);
                cmds[temp.trigger] = temp
                cmds[temp.trigger].module = mod;
                cmds[temp.trigger].commandInitialization(temp.trigger);
            }catch(ex){
                bot.log(chalk.red('Loading Command ' + temp + " failed: ") + ex);
                console.log(ex);
            }



        });
    })

})

bot.onEvent('prelogin', null);

// if someone reads this please dont yell at me for this i didn't know better ok?
client.on('message',                            evnt            => { bot.onEvent('message', evnt);});
client.on('messageDelete',                      evnt            => { bot.onEvent('messageDelete', evnt);});
client.on('messageUpdate',                      (evnt, newm)            => { bot.onEvent('messageUpdate', {old: evnt, new: newm});});

client.on('presenceUpdate',                     (evnt, newm)            => { bot.onEvent('presenceUpdate', {evnt, newm});});
client.on('userUpdate',                      	(evnt, newm)            => { bot.onEvent('userUpdate', {evnt, newm});});
client.on('warn',                      			evnt            => { bot.onEvent('warn', evnt);});

client.on('channelCreate',                      evnt            => { bot.onEvent('channelCreate', evnt);});
client.on('channelDelete',                      evnt            => { bot.onEvent('channelDelete', evnt);});``
client.on('channelPinsUpdate',                  (channel, time)    => { bot.onEvent('channelPinsUpdate', {channel, time});});
client.on('channelUpdate',                      (old, neww)     => { bot.onEvent('channelUpdate', {old, neww});});

client.on('clientUserGuildSettingsUpdate',      evnt            => { bot.onEvent('clientUserGuildSettingsUpdate', evnt);});
client.on('clientUserSettingsUpdate',           evnt            => { bot.onEvent('clientUserSettingsUpdate', evnt);});

client.on('emojiCreate',                        evnt            => { bot.onEvent('emojiCreate', evnt);});
client.on('emojiDelete',                        evnt            => { bot.onEvent('emojiDelete', evnt);});
client.on('emojiUpdate',                        (old, neww)     => { bot.onEvent('emojiUpdate', {old: old, neww: neww});});

client.on('roleCreate',                         evnt            => { bot.onEvent('roleCreate', evnt);});
client.on('roleDelete',                         evnt            => { bot.onEvent('roleDelete', evnt);});
client.on('roleUpdate',                         (old, neww)      => { bot.onEvent('roleUpdate', {old: old, neww: neww});});

client.on('messageReactionAdd',                 (msg, usr)      => { bot.onEvent('messageReactionAdd', {msg, user});});
client.on('messageReactionRemove',              (msg, usr)      => { bot.onEvent('messageReactionRemove', {msg, user});});
client.on('messageReactionRemoveAll',           (msg, usr)      => { bot.onEvent('messageReactionRemoveAll', {msg, user});});

client.on('error',                              evnt            => { bot.onEvent('error', evnt);});
client.on('disconnect',                         evnt            => { bot.onEvent('disconnect', evnt);});
client.on('ready',                              ()              => { bot.onEvent('ready', null); });

client.on('guildBanAdd',                        (evnt, user)    => { bot.onEvent('guildBanAdd', {evnt, user});});
client.on('guildBanRemove',                     (evnt, user)    => { bot.onEvent('guildBanRemove', {evnt, user});});

client.on('guildMemberAdd',                     evnt   			=> { bot.onEvent('guildMemberAdd', evnt);});
client.on('guildMemberRemove',                  evnt   			=> { bot.onEvent('guildMemberRemove', evnt);});
client.on('guildMemberUpdate',                  (old, neww)   	=> { bot.onEvent('guildMemberUpdate', {old, neww});});

client.on('guildCreate',                        (evnt)          => { bot.onEvent('guildCreate', evnt);});
client.on('guildDelete',                        (evnt)          => { bot.onEvent('guildDelete', evnt);});
client.on('guildUpdate',                        (old, neww)     => { bot.onEvent('guildUpdate', {old, neww});});

//debug info
client.on('debug', info => {
    if(cfg.debug == true){
        client.shard.send({type:"log/debug", message: info })
    }
});

//command processing
client.on('message', msg => {


    msg.cmds = cmds;

    //Handle command checks
	bot.handleCommandChecks(msg, cfg, (checkResult, message, cfg)=>{
        try{
                var cmds = message.cmds

                if(message.channel.type == "text"){
                    var g    = message.guild.id
                }else{
                    var g    = message.channel.id
                }

                if(!checkResult){ return; }

                //get prefix
                var prefix      = bot.cache.config[g].config.prefix;

                //remove prefix from string
                message.content = message.content.replace(prefix, '');

                //create arguments
                message.arguments =  message.content.trim().split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);

                var config  = bot.cache.config[g].config;

                //check if alias exists
                if(typeof bot.aliases[message.arguments[0]] == 'string'){

                    //run alias
                    message.cmds[bot.aliases[message.arguments[0]]].triggerCommand(message, message.arguments, config);
                    bot.log('Executed aliased command ' + message.arguments[0] + ' for user ' + message.author.tag);
                    bot.stats.commandsExecuted++;
                    return;

                }

                //check if command exists
                if(typeof message.cmds[message.arguments[0]] == 'object'){

                    //Direct Command
                    message.cmds[message.arguments[0]].triggerCommand(message, message.arguments, config);
                    bot.log('Executed command ' + message.arguments[0] + ' for user ' + message.author.tag);
                    bot.stats.commandsExecuted++;
                    return;

                }

        }catch(ex){

            bot.log(chalk.red('CommandExecution returned an error!'));
            console.log(chalk.red(ex.stack));

        }

	})


});

client.options.disabledEvents = ['TYPING_START']
client.login(cfg.discord.token);

process.on('uncaughtException', function(error) {

    bot.log(chalk.red("Shard going down due to an error!"));
    bot.log(chalk.red(error.message));

    fs.writeFile("./err.log", error.stack, function(err) {

        process.stderr.write('', function () {
            process.exit(1);
        });

    });

});

bot.formattime = function(time){
    if(time < 60){
        return time + " Seconds"
    }

    if(time < 3600){
        return Math.round(time/60) + " Minutes"
    }

    return Math.round(time/60/60) + " Hours"
}

bot.getString = function( l, a){

    if(l == "verificationLevel"){
        if(a == 0){ return "None"; }
        else if(a == 1){ return "Low"; }
        else if(a == 2){ return "Medium"; }
        else if(a == 3){ return "High ((╯°□°）╯︵ ┻━┻)"; }
        else if(a == 4){ return "Extreme (┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻)"; }
        else { return "Unknown verificationLevel ("+ a +")" }
    }

    if(l == "contentFilter"){
        if(a == 0){ return "Don't scan any messages."; }
        else if(a == 1){ return "Scan Messages from members without a role."; }
        else if(a == 2){ return "Scan messages sent by all members."; }
        else { return "Unknown contentFilter ("+ a +")" }
    }

}

setInterval(()=>{
    bot.stats.uptime++;
    bot.setStatus(bot.status);
},1000)

process.on('unhandledRejection', (reason, p) => {

    bot.log(chalk.red( 'Promise Error: ' + reason ))

    fs.writeFile("./err.log", reason.stack, function(err) {

    });

 });


bot.getChannel = function(input, guild){

	var ch = guild.channels.find( (item)=> { try{ return item.name.toLowerCase() === input.toLowerCase() }catch(ex){ return null }});
	if( ch != null && typeof ch != undefined) { return ch }


    var ch = guild.channels.get(input);
    if(typeof ch != null && typeof ch != undefined){ return ch; }

    return input;

}
