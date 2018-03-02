module.exports = {

        trigger: "unlock",
        enabled: true,

        //module: "name", (this gets automatically set when its loaded, its only here for reference. This is used when you disable a module.)

        commandInitialization: function(){

            //initialize me daddy

        },

        triggerCommand: function (message, args, config){

            if(message.channel.type != 'text'){ bot.reply(message, bot.L(config, 'channel', 'errorNotGuild')); return; }
            var g = message.guild;

            if(config.rooms_enabled == 0){ bot.reply(message, bot.L(config, 'channel', 'errorRoomsDisabled')); return; }

            knex.select().from('private_rooms').where('owner', message.author.id ).then(function(data){

                if(data[0] == undefined){ bot.reply( bot.L(config, 'channel', 'revokeNoRoom')); return;}

                //add connect and view to @everyone
                client.channels.get(data[0].channel).overwritePermissions(message.guild.defaultRole, { 'CONNECT': true, 'VIEW_CHANNEL': true })

                if(data[0].text != "NONE"){
                    client.channels.get(data[0].text).overwritePermissions(message.guild.defaultRole, { 'SEND_M ESSAGES': true, 'VIEW_CHANNEL': true })
                }

                bot.reply(message, bot.L(config, 'channel', 'roomMadePublic'));

            });
        }
}