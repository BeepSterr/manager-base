# Sourceping
A Quick and simple selfhostable variant of manager (Channel Manager)

### Includes
Only includes private rooms for now.

### How to install
1. Download and extract the files.
2. Run `npm install` via your prefered CLI
3. Edit `config.json` with your token & prefered settings
4. run `node index` to start the bot

Don't forget you'll need your own discord application (/w bot) to use this!
You can create one [Here](https://discordapp.com/developers/applications/me)

### Config Values
`prefix` -- `string` ( ! )
`lang` -- `string` ( ! )
`adminrole` -- `Role Snowflake` ( 345612130122334209 )
`rooms_enabled` -- `Integer bool` ( 1 )
`rooms_visible` -- `Integer Bool` ( 0 )
`rooms_category` -- `Category Snowflake` ( 404406416552755200 )
`rooms_ilimit` -- `Integer` ( 60 )
`rooms_notify` -- `Integer Bool` ( 1 )
`rooms_required_role` -- `Role Snowflake` ( 404406416552755200 )
`rooms_auto_bots` -- `Integer Bool` ( 0 )
`rooms_naming` -- `Integer Bool` ( 0 )
`rooms_naming_pattern` -- `String` ( Private room [{user}] )