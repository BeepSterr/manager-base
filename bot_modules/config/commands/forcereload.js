module.exports = {

    trigger: "flush",
    enabled: true,

    commandInitialization: function(){


    },

    triggerCommand: function (message, args, config){

        if(message.member.hasPermission('BAN_MEMBERS')){

            bot.cache.config[message.guild.id] = undefined;
            bot.reply(message, "Cache for " + message.guild.name + " cleared.")

        }else{
            bot.reply(message, "Cache for " + message.guild.name + " cleared.")
        }

    }


}