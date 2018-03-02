module.exports = {

        trigger: "revoke",
        enabled: true,

        //module: "name", (this gets automatically set when its loaded, its only here for reference. This is used when you disable a module.)

        commandInitialization: function(){

            //initialize me daddy
            bot.addAlias(this, 'remove');
            bot.addAlias(this, 'delete');
            bot.addAlias(this, 'desummon');

        },

        triggerCommand: function (message, args, config){

            if(message.channel.type != 'text'){ bot.reply(message, bot.L(config, 'channel', 'revokeNotGuild')); return; }
            var g   = message.guild;
            var id  = message.author.id

            if(config.rooms_enabled == 0){ bot.reply(message, bot.L(config, 'channel', 'errorRoomsDisabled')); return; }

            knex.select().from('private_rooms').where('owner', message.author.id ).then(function(data){

                //if room no exists yell at them
                if(typeof data == 'undefined'){ bot.reply(message, bot.L(config, 'channel', 'revokeNoRoom')); return }

                for (var i = 0; i < data.length; i++) {

                    var item = data[i];

                    if(item.text != "NONE"){
                        client.channels.get(item.text).delete().then(()=>{ });
                    }
                    
                    client.channels.get(item.channel).delete().then(()=>{


                        knex('private_rooms').where('channel', item.channel ).del().then(function(response){
                            bot.reply(message, bot.L(config, 'channel', 'revokeComplete'));
                        })

                    })
                    .catch( err =>{
                        bot.reply(message, bot.L(config, 'channel', 'revokeError'));
                        if(err == "DiscordAPIError: Missing Access"){ bot.reply(message, "Insufficient permission to remove room.") }
                    })

                }
            });

        }

    }