module.exports = {

    trigger: "ping",
    enabled: true,

    //module: "name", (this gets automatically set when its loaded, its only here for reference. This is used when you disable a module.)

    commandInitialization: function(){

        bot.addAlias(this, 'test');
        bot.addAlias(this, 'alive');

    },

    triggerCommand: function (message, args, config){

        message.channel.send("Pong! ( " + Math.floor(client.ping) + "ms )");

    }


}