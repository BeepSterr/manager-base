module.exports = {

        trigger: "lock",
        enabled: true,

        //module: "name", (this gets automatically set when its loaded, its only here for reference. This is used when you disable a module.)

        commandInitialization: function(){

            //initialize me daddy
            bot.addAlias(this, 'private');

        },

        triggerCommand: function (message, args, config){

            if(message.channel.type != 'text'){ bot.reply(message, bot.L(config, 'channel', 'errorNotGuild')); return; }
            var g = message.guild;

            if(config.rooms_enabled == 0){ bot.reply(message, bot.L(config, 'channel', 'errorRoomsDisabled')); return; }

            knex.select().from('private_rooms').where('owner', message.author.id ).then(function(data){

                if(data[0] == undefined){ bot.reply( bot.L(config, 'channel', 'revokeNoRoom')); return;}

                //remove connect
                client.channels.get(data[0].channel).overwritePermissions(message.guild.defaultRole, { 'CONNECT': false })
                bot.reply(message, bot.L(config, 'channel', 'roomNotPublic'));

            });
        }
}