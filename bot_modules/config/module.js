module.exports = {

	initializeModule: function(mod){

		//set name
		this.module = mod;

        //subscribe to bot events
		bot.subscribeEvent(this, 'ready');
		bot.subscribeEvent(this, 'guildCreate');

		//Config Func
		bot.cache.config = {};
		bot.getConfig = function(guild, pass, cb){
			try{

				var g 	= 	guild.id;
				var t 	= 	Math.floor(Date.now() / 1000);
				var cfg	= 	bot.cfg;

				if(bot.cache.config[g] != undefined){

					if(bot.cache.config[g].expires > t){
						cb(true, g, bot.cache.config[g], pass);
						return;
					}
				}

					// Normally this is where i fetch the config from the DB
					// I'll clean up this mess sometime. It "works" for now.

					bot.cache.config[g] = {
						config: cfg.localConfig, // Just pushing the config from file into the cached config directly.
						expires: t+60
					}

					cb(true, g, bot.cache.config[g], pass);

			}catch(ex){

				//bot.log(chalk.red('ConfigFunction returned an error!'));
				//console.log(chalk.red(ex.stack));
			}
		}

		bot.hasMod = function(guild, member, config){

			if(config.manager_roles_moderator != "NONE"){

				if(member.roles.get(config.manager_roles_moderator)){ 
					return true; 
				}else{
					return false;
				}

			}else{
				
				if(member.hasPermission('KICK_MEMBERS')){ 
					return true; 
				}else{
					return false;
				}

			}

		}

		bot.hasAdmin = function(guild, member, config){

			bot.log("CheckAdmin")
			
			if(config.manager_roles_admin != "NONE"){

				if(member.roles.get(config.manager_roles_admin)){ 
					return true; 
				}else{
					return false;
				}

			}else{
				
				if(member.hasPermission('MANAGE_GUILD')){ 
					return true; 
				}else{
					return false;
				}

			}

		}

	},

	onEvent: function(event, data){

		if(event == "ready"){

			var clarr = client.guilds.array();
			bot.log("Starting server config validator for " + clarr.length + " guilds");
			clarr.forEach((item, key)=>{

				this.doUpdateConfig(item);

			})

			//Make sure a command comes from a server and not DM
			bot.addCommandCheck( function(message, cfg, result){

				if(message.channel.type == "text"){ result(true); }else{ result(false) }

			});

			//Define config loading function checkback
			bot.addCommandCheck( function(message, cfg, result){

				bot.getConfig(message.guild, message, (done, g, config, pass)=>{

					var message = pass;
					if(done == false){ result(false) };

					if( message.member.roles.get(config.config.manager_roles_blocked) ){ return(false); }

					if(message.content.startsWith(config.config.prefix)){ result(true) }else{ result(false) }

				});

			});

		}

		if(event == "guildCreate"){
			this.doUpdateConfig(data);
		}

	},

	doUpdateConfig: function(guild){

		// USed to fill the db with configs, Not needed here as we use a single file based one.
		return;
		
	}

}