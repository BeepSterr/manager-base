module.exports = {

        trigger: "summon",
        enabled: true,

        //module: "name", (this gets automatically set when its loaded, its only here for reference. This is used when you disable a module.)

        commandInitialization: function(){

            //initialize me daddy
            bot.addAlias(this, 'create');
            bot.addAlias(this, 'make');

        },

        triggerCommand: function (message, args, config){

            modules['rooms'].doSummonRoom(config, message.guild, message.member, message);

        }
    
    }