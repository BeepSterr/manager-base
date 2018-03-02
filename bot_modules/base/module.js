module.exports = {
	
	initializeModule: function(mod){

		//set name
		this.module = mod;

        //subscribe to bot events
		bot.subscribeEvent(this, 'ready');
		bot.subscribeEvent(this, 'message');
		
		
	},

	onEvent: function(event, data){

		//this is where registered events will be received
        if(event == 'ready'){

			bot.log(chalk.cyan("Logged in as " + client.user.tag));
			bot.log(chalk.cyan(`Using discord.js ` + Discord.version));
			
			bot.setStatus("Ready");

			if(!client.user.bot){
				bot.selfbot = true;
				bot.log(chalk.yellow('This token belongs to a user account, Activating selfbot mode.'))
			}

			bot.cfg = cfg;

	
			bot.addCommandCheck( function(message, cfg, result){	
				
				//Prevent selfbots from doing the not smart.
				if(bot.selfbot == true && message.author !== client.user){ result(false); }
				result(true);

			});

			bot.addCommandCheck( function(message, cfg, result){

				// Make sure the message is not from a bot.
				if ( message.author.bot ){ result(false);  }
				result(true);

			});

			bot.addCommandCheck( function(message, cfg, result){

				// Make sure the bot isn't shutting down
				if ( bot.terminating ){

					bot.reply(message, bot.L(config, 'shared', 'errorShutdownGrace'));
					result(false);

				}else{
					result(true);
				}

			});


		}

	}
	
}