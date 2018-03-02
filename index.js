try{

    var cfg = require('./config.json');

}catch(ex){

    console.error(chalk.red('FATAL ERROR:'));
    console.error(chalk.red(' Cannot load config.json'));
    process.exit();

}

// LOAD MODULES
try{

    //temporary require
    blessed             = require('blessed');
    contrib             = require('blessed-contrib')
    chalk               = require('chalk');

    //Discord.js Base
    Discord             = require("discord.js");


}catch(ex){

    console.error(ex);

    console.error('\x1b[31m' + 'FATAL ERROR:');
    console.error(' Cannot load required bot modules.');
    console.error(' Try running "npm install" and try again.\x1b[0m');
    process.exit();
}


//create layout and widgets
var screen = blessed.screen()
var grid = new contrib.grid({rows: 12, cols: 12, screen: screen})

var log = grid.set(4, 0, 8, 12, contrib.log,
    { fg: "green"
    , selectedFg: "green"
    , label: 'Server Log'})

var table = grid.set(0, 0, 4, 12, contrib.table,
            { keys: true
            , fg: 'white'
            , selectedFg: 'white'
            , selectedBg: 'blue'
            , interactive: false
            , label: 'Shards'
            , border: {type: "line", fg: "cyan"}
            , columnSpacing: 10 //in chars
            , columnWidth: [10, 10, 10, 10, 10, 10, 100] /*in chars*/ })

    var tabledata = [];
    table.setData({
        headers: ['Shard', 'Guilds', 'Channels', 'Members', 'Commands','Uptime', 'Status'],
        data: tabledata
    });



screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    manager.respawnAll(1000,5000, true);
    setTimeout(()=>{
        return process.exit(0);
    },100)
});


screen.on('resize', function() {
  log.emit('attach');
});

screen.render()

log.log(chalk.cyan(`[S] Sharding Initialized.`));
log.log(chalk.cyan(`[S] Using discord.js ` + Discord.version));

manager = new Discord.ShardingManager('./bot.js', {
    totalShards: cfg.discord.shards,
    respawn: true,
    token: cfg.discord.token
});

manager.spawn();
manager.on('shardCreate', shard => {

    log.log(chalk.cyan(`[S] Shard launched: ${shard.id}`))

    shard.on('message', message => {

        if(message.type == "log/default"){ log.log("["+shard.id+"] " + message.message); }

        if(message.type == "status/update"){

            tabledata[shard.id]     = [];
            tabledata[shard.id][0]  = shard.id;
            tabledata[shard.id][1]  = message.guilds;
            tabledata[shard.id][2]  = message.channels;
            tabledata[shard.id][3]  = message.members;
            tabledata[shard.id][4]  = message.cmds;
            tabledata[shard.id][5]  = message.uptime;
            tabledata[shard.id][6]  = message.status;

            table.setData({
                headers: ['Shard', 'Guilds', 'Channels', 'Members', 'Commands','Uptime', 'Status'],
                data: tabledata
            });

        }

        if(message.type == "action/reboot"){ manager.broadcastEval("bot.terminating = true; setTimeout(() => { process.exit(); }, 10000)"); }

        screen.render()

    });

});