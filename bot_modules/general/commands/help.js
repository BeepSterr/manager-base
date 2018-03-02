module.exports = {

    trigger: "help",
    enabled: true,

    commandInitialization: function(){

		bot.addAlias(this, 'info');
		bot.addAlias(this, 'about');
		bot.addAlias(this, 'invite');
		bot.addAlias(this, 'config');

    },

    triggerCommand: function (message, args, config){

        if(message.channel.type != 'text'){ 
            canembed=true;
            config.prefix = "c!";
        }else{
            var canembed = message.channel.permissionsFor(message.guild.member(client.user)).has('EMBED_LINKS')
        }




		if(canembed == true){
               
			var dpcolor = 7506394;
			message.channel.send('', {embed: {
						
				color: dpcolor,
				title: "Channel Manager (selfhosted)",
				description: "Channel Manger is a bot created to bring teamspeak Temporary channels to discord. If you need help you can retrieve a list of commands below. \n**This is a selfhosted version, Not everything may work as expected!**",
				fields: [

					{
						name: "Usage",
						value: "[Command List](https://channel.managerbot.me/commands)\n[Bot Configuration](https://channel.managerbot.me/edit/"+message.guild.id+")"
					},
					{
						name: "Contribute",
						value: "[Languages & Translate](https://channel.managerbot.me/translate)"
					}

				]
			}});
				
		}else{
			bot.reply(message, 'http://channel.managerbot.me')
		}

    }


}