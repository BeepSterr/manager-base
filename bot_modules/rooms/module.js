module.exports = {

	initializeModule: function(mod){

		//set name
		this.module = mod;

		//subscribe to bot events
		bot.subscribeEvent(this, 'message');
		bot.subscribeEvent(this, 'ready');

		bot.subscribeEvent(this, 'guildCreate');
		bot.subscribeEvent(this, 'guildDelete');
		bot.subscribeEvent(this, 'guildConfigUpdated');

		bot.subscribeEvent(this, 'roomExpiredCheckStart');
		bot.subscribeEvent(this, 'roomExpiredCheckFinished');

		bot.dashify = require('dashify');

	},

	onEvent: function(event, data){

		//this is where registered events will be received
		//console.log(event);
		if(event == 'guildCreate'){
			client.shard.send({type:"action/post", message: null })
		}

		if( event == 'ready' ){

			setTimeout(()=>{

				setInterval(()=>{
					this.roomExpiredCheckStart();
				}, 1000)

				setInterval(()=>{
					this.roomSummonChannelCheck();
				}, 5000)

			},1000);

		}

		if(event == "guildDelete"){
			this.cleanup(data)
		}

	},

	roomSummonChannelCheck: function(){

		//trigger the event
		bot.onEvent('roomSummonCheckStart', Math.floor(new Date() / 1000))

		//fetch all guilds
		client.guilds.forEach((key, value) =>{

			var guild = client.guilds.get(value);

			bot.getConfig(guild, '', (done, g, data, message)=>{

				if(done){

					var config = data.config;

					if(config.rooms_summon_channel == "NONE"){ return; }

					var channel = guild.channels.get(config.rooms_summon_channel);
					if(typeof channel == "undefined"){ return; }

					channel.members.forEach((key, m) =>{

						var member = guild.members.get(m);
						if(channel.id == member.voiceChannelID){
							this.doSummonRoom(config, guild, member, null)
						}

					})

				}

			})

		})


	},


	roomExpiredCheckStart: function(){

		//trigger the event
		bot.onEvent('roomExpiredCheckStart', Math.floor(new Date() / 1000))


		//fetch all rooms
		knex.select().from('private_rooms').then(function(data){

			//look trough all rooms
			for(i=0;i < data.length; i++){

				//current loop
				modules['rooms'].checkRoom(data[i]);


			}

		});



		//trigger the event
		bot.onEvent('roomExpiredCheckFinished', Math.floor(new Date() / 1000))

	},

	checkRoom: function(current){

		//Make sure we only affect channels in our shard space.
		if(client.guilds.get(current.guild)){

			//check if channel hasn't been removed without our knowledge.
			if(!client.channels.get(current.channel)){

				knex('private_rooms').where('channel', current.channel ).del().then(function(response){
					bot.log('Removed a missing channel from database.')
				})

				return;

			}


			//Get the config for the guild we're affecting.
			bot.getConfig(client.guilds.get(current.guild), '', (done, guild, data, message)=>{

				var config = data.config;

				if(config.rooms_ilimit == -1 ){ return; }
				if(config.rooms_ilimit < 1 ){ config.rooms_ilimit = 30 }

				// if channel is empty add 1 to inactive counter. otherwise set it to 0

				if(client.channels.get(current.channel) == undefined){ return; }

				if(client.channels.get(current.channel).members.filter( (mem)=>{
					if(mem.user.bot == true){ return false; }else{ return true; }
				}).array().length == 0){
					knex('private_rooms').where('channel', current.channel ).update('idle_for', current.idle_for + 1).then(function(response){ })
				}else{
					knex('private_rooms').where('channel', current.channel ).update('idle_for', 0).then(function(response){ })
				}

				//if channel is inactive for too long, bep bep delet
				if(current.idle_for > config.rooms_ilimit){

					client.channels.get(current.channel).delete().then(()=>{

						if(current.text != "NONE"){
							client.channels.get(current.text).delete().then(()=>{ 
								bot.log('Revoked inactive text channel')
							});
						}

						knex('private_rooms').where('channel', current.channel ).del().then(function(response){
							bot.log('Revoked inactive channel')
						});

						if(config.rooms_notify == 1){
							client.users.get(current.owner).send(bot.L(config, 'channel', 'roomRevokedInactive', config.prefix + 'summon'))
						}

					}).catch( err => {
						bot.log('Failed to delete channel: ' + current.channel);
						bot.log(err);
					});

				}

			});

		}

	},

	doSummonRoom: function(config, guild, member, message){

		if(message == null){
			// This is a no-command summon
			noreply = true;
		}else{
			noreply = false;
		}


		// Make sure we're allowed to summon before we do anything else.
		if(config.rooms_enabled == 0){ 

			if(!noreply){
				bot.reply(message, bot.L(config, 'channel', 'errorRoomsDisabled'));
			}

			return; 
		} 

        //check for required role
        if(config.rooms_required_role != "NONE"){

            if(!member.roles.get(config.rooms_required_role)){

				if(!noreply){
					bot.reply(message, bot.L(config, 'channel', 'roomErrorNotAllowed'));
				}

                return;
            }
		}
		
		//Check for required permissions
		var err_string = "Cannot summon room, Missing permissions: ";
		if( guild.me.hasPermission( 'MANAGE_ROLES' ) == false ) { err_string = err_string + "`Manage Roles` "; var has_perm = false;  }
		if( guild.me.hasPermission( 'MANAGE_CHANNELS' ) == false ) { err_string = err_string + "`Manage Channels` "; var has_perm = false;  }
		if( guild.me.hasPermission( 'MANAGE_GUILD' ) == false ) { err_string = err_string + "`Manage Guild`"; var has_perm = false;  }

		if(has_perm == false){
			if(!noreply){
				message.channel.send(err_string);
				return;
			}else{
				member.setVoiceChannel(guild.afkChannel)
				member.user.send(err_string);
				return;
			}

		}

		//Find any existing rooms for the member.
		knex.select().from('private_rooms').where('owner', member.id ).then(function(data){

			//if room exists tell them or show them.
			if(typeof data[0] != 'undefined'){ 

				if(!noreply){
					bot.reply(message, bot.L(config, 'channel', 'roomAlreadyExists')); 
				}else{
					member.setVoiceChannel(data[0].channel)
				}

				return;
			}

			//Fetch the category we're about to use
			var category = guild.channels.get(config.rooms_category);
			var channel_name = config.rooms_naming_pattern;
			var channel_name = channel_name.replace("{user}", member.displayName);

			//Create the voice channel.
			guild.channels.create(
				channel_name, 
				{ 
					type: 'voice', 
					parent: category, 
					reason: "Created private room for user " + member.user.username, 
					overwrites: [{ deny: ['CONNECT', 'VIEW_CHANNEL'], id: guild.defaultRole }] 
				}).then(voice_channel =>{

					knex('private_rooms').where('owner', member.id ).insert({

						channel: voice_channel.id,
						text: undefined,
						owner: member.id,
						idle_for: 0,
						guild: guild.id

					}).then(function(data){

						//Add Basic Overwrites
						voice_channel.overwritePermissions(member, { 'CONNECT': true, 'VIEW_CHANNEL': true })
                        voice_channel.overwritePermissions(client.user, { 'CONNECT': true, 'MANAGE_CHANNELS': true, 'VIEW_CHANNEL': true })

						//Add Moderators
						if(config.adminrole != "NONE"){
							voice_channel.overwritePermissions(config.adminrole, { 'CONNECT': true, 'VIEW_CHANNEL': true })
						}

						//Add bots (if enabled)
						if(config.rooms_auto_bots == 1){

							var mems = guild.members.array()
							for(var i=0; i < mems.length; i++) {

								if(mems[i].user.bot == true){
									voice_channel.overwritePermissions(mems[i], { 'CONNECT': true, 'VIEW_CHANNEL': true })
								}

							}
						}
                                    
                        //check room visibility
                        if(config.rooms_visible == 1){
                            voice_channel.overwritePermissions(guild.defaultRole, { 'VIEW_CHANNEL': true })
						}
							 
						//Try and send them to the channel
						member.setVoiceChannel(voice_channel)

						//Send them a message their channel are done
						if(!noreply){
							bot.reply(message, bot.L(config, 'channel', 'roomCreated'))
						}


					});

				});
			
		});

	},
	
	
	cleanup: function(guildid){
		
		knex('private_rooms').where('guild', guildid ).del();
		
	}
	
}