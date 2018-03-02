module.exports = {
	
	initializeModule: function(mod){

		//set name
		this.module = mod;

        //subscribe to bot events
		bot.subscribeEvent(this, 'ready');


		//Backporting find functions
		bot.findMember = function(userid, guild = null){

			userid = userid.toLowerCase();

			//test discord username
			var val = client.users.find( (item)=> { try{  return item.username.toLowerCase() === userid }catch(ex){ return null }});
			if( val != null) { return val }

			//test discord tag.
			var val = client.users.find( (item)=> { try{  return item.tag.toLowerCase() === userid }catch(ex){ return null }});
			if( val != null) { return val }

			//If in a guild, test for current nickname
			if(guild){

				var val = guild.members.find( (item)=> { try{  return item.nickname.toLowerCase() === userid }catch(ex){ return null }});
				if( val != null) { return val }

				var val = guild.members.find(val => val.displayName.includes(userid));
				if( val != null) { if(val.array().length == 1){ return val; } }

			}
		}

	},

	onEvent: function(event, data){

		if(event == "ready"){

			//This is how to define command checks.
			//If false is returned to any of these checks, the command will not be executed.


		}

	}

}