module.exports = {

        trigger: "add",
        enabled: true,

        //module: "name", (this gets automatically set when its loaded, its only here for reference. This is used when you disable a module.)

        commandInitialization: function(){

            //initialize me daddy
            bot.addAlias(this, 'allow');
            bot.addAlias(this, 'unblock');

        },

        triggerCommand: function (message, args, config){

            if(message.channel.type != 'text'){ bot.reply(message, bot.L(config, 'channel', 'errorNotGuild')); return; }
            var g = message.guild;

            if(config.rooms_enabled == 0){ bot.reply(message, bot.L(config, 'channel', 'errorRoomsDisabled')); return; } 

            knex.select().from('private_rooms').where('owner', message.author.id ).then(function(data){

                if(data[0] == undefined){ bot.reply(message, bot.L(config, 'channel', 'revokeNoRoom')); return;}

                //get mentions
                var mentions = message.mentions.members.array();
                var mentionroles = message.mentions.roles.array();
                var resolvables = message.cleanContent.split(" ");

                //resolve flat names to fake mentions or explode
                for(var i = 0; i < resolvables.length; i++){

                    if(bot.findMember(resolvables[i], message.guild) != null){
                        mentions.push(bot.findMember(resolvables[i], message.guild));
                    }
                }

                mentions = mentions.concat(mentionroles);


                //if no mentions were resolved, return no changes
                if(mentions.length == 0){
                    bot.reply(message, bot.L(config, 'channel', 'roomNoAdded'))
                }else{

                    var addedstring = "";

                    for (var i = 0; i < mentions.length; i++){

                        client.channels.get(data[0].channel).overwritePermissions(mentions[i], { 'CONNECT': true, 'VIEW_CHANNEL': true })

                        addedstring += mentions[i];
                        if(i != mentions.length - 1){ addedstring += ", " };
                    }

                    bot.reply(message, bot.L(config, 'channel', 'roomUserAdded', addedstring));
                }

            });
        }
}