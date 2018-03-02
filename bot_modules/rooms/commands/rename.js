module.exports = {
    
    trigger: "name",
    enabled: true,
    
    //module: "name", (this gets automatically set when its loaded, its only here for reference. This is used when you disable a module.)

    commandInitialization: function(){

            //initialize me daddy
            bot.addAlias(this, 'rename');
			bot.addAlias(this, 'setname');
            bot.addAlias(this, 'nickname');

    },

    triggerCommand: function (message, args, config){

        if(message.channel.type != 'text'){ bot.reply(message, bot.L(config, 'channel', 'errorNotGuild')); return; }
        var g = message.guild;

        if(config.rooms_enabled == 0){ bot.reply(message, bot.L(config, 'channel', 'errorRoomsDisabled')); return; } 

		if(config.rooms_naming == 1){

			knex.select().from('private_rooms').where('owner', message.author.id ).then(function(data){

				if(data[0] == undefined){ bot.reply(message, bot.L(config, 'channel', 'revokeNoRoom')); return;}

				if(args[1] == ""){
					bot.reply(message, bot.L(config, 'channel', 't'));
					return;
				}

			   client.channels.get(data[0].channel).setName(args[1]).then(()=>{

					if(data[0].text != "NONE"){
						client.channels.get(data[0].text).setName(bot.dashify(args[1])).then(()=>{
							bot.reply(message, bot.L(config, 'channel', 'roomRenamed', args[1]));
						});
					}else{
						bot.reply(message, bot.L(config, 'channel', 'roomRenamed', args[1]));
					}
			   })

			});

		}else{
			bot.reply(message, bot.L(config, 'channel', 'roomRenameDisabled', args[1]));
		}
	}
}