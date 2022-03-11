const Discord = require('discord.js');
const axios = require("axios");
const moment = require('moment');
const Akinator = require('discord.js-akinator');
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_PRESENCES
    ]
});

const { token, prefix, devID, founderID } = require('./config.json');

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  setInterval(async () => {
    const statuses = [`${prefix}help`, `Staff Members`]

    client.user.setActivity(statuses[Math.floor(Math.random() * statuses.length)], { type: "LISTENING" })
  }, 10000)
});

client.on('messageUpdate', function(oldMessage, newMessage) {
  let guild = client.guilds.cache.get('937136649022877696');
  let logs = guild.channels.cache.get('946552919287820368');

  if (oldMessage.author.bot) return;

  let logsEmbed = new Discord.MessageEmbed()
    .setAuthor(guild.name, guild.iconURL())
    .setColor('#CD393B')
    .setDescription(`Message edited in <#${oldMessage.channel.id}>`)
    .addField('Message Author', `<@${oldMessage.author.id}> (${oldMessage.author.tag})`)
    .addField('Message Content', `Old Message: ${oldMessage.content}\n\nNew Message: ${newMessage.content}`)

  logs.send(logsEmbed);
});

client.on('messageDelete', async (message) => {
  let guild = client.guilds.cache.get('937136649022877696');
  let logs = guild.channels.cache.get('946552919287820368');

  if (message.channel.id === logs.id) return;
  if (message.author.bot) return;
  if (message.content.startsWith('uh!')) return;
  if (message.content === null) return;

  let logsEmbed = new Discord.MessageEmbed()
    .setAuthor(guild.name, guild.iconURL())
    .setColor('#CD393B')
    .setDescription(message.content)
    .setFooter(`Message deleted | Sent by ${message.author.tag}`)

  logs.send(logsEmbed);
});

client.on("message", async (message) => {
    if (message.author.bot || message.content.indexOf(prefix) !== 0) return;
    if (message.channel.type === 'dm') return message.reply('Commands can only be executed on the Server!');

    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g)
    const command = args.shift().toLowerCase();

    if (command === "help") {
      let helpEmbed = new Discord.MessageEmbed()
        .setAuthor(message.guild.name, message.guild.iconURL())
        .setColor("#2C8FB2")
        .setDescription("Here you can see all of the Bots Commands\n\n[] = Required\n<> = Optional")
        .addField(`Public Commands`, `${prefix}help\n${prefix}userinfo <@User>\n${prefix}updates\n${prefix}akinator | Alias: aki`)
        .addField(`Staff Commands`, `${prefix}say [Message]\n${prefix}dm [User ID] [Message]\n${prefix}clear [1-99]`)
        .addField(`WIP Commands`, `-`)
        .setTimestamp()
        .setFooter(message.author.username, message.author.displayAvatarURL())

      message.channel.send(helpEmbed);
    }

    /*
    -- Public Commands --
    */

    if (command === 'userinfo') {
      const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
      if (!member) return message.channel.send('Mention a user you want to get information about');

      const userRoles = member.roles.cache.filter((roles) => roles.id !== message.guild.id).map((role) => role.toString());
      const activities = [];
      let customStatus;
      let HypeSquadHouse;

      if (member.user.flags.equals('HOUSE_BALANCE')) {
        HypeSquadHouse = 'House of Balance';
      } else if (member.user.flags.equals('HOUSE_BRAVERY')) {
        HypeSquadHouse = 'House of Bravery';
      } else if (member.user.flags.equals('HOUSE_BRILLIANCE')) {
        HypeSquadHouse = 'House of Brilliance';
      } else if (member.user.flags.equals('HYPESQUAD_EVENTS')) {
        HypeSquadHouse = 'HypeSquad Event Team';
      } else {
        HypeSquadHouse = 'None'
      }

      let userIsBot;
      
      if (member.user.bot) {
          userIsBot = 'User is a Bot'
      } else {
          userIsBot = 'User is not a Bot'
      }

      for (const activity of member.presence.activities.values()) {
          switch (activity.type) {
              case 'PLAYING':
                  activities.push(`Playing **${activity.name}**`);
                  break;
              case 'LISTENING':
                  if (member.user.bot) activities.push(`Listening to **${activity.name}**`);
                  else activities.push(`Listening to **${activity.details}** by **${activity.state}**`);
                  break;
              case 'WATCHING':
                  activities.push(`Watching **${activity.name}**`);
                  break;
              case 'STREAMING':
                  activities.push(`Streaming **${activity.name}**`);
                  break;
              case 'CUSTOM_STATUS':
                  customStatus = activity.state;
                  break;
          }
      }

      const uiEmbed = new Discord.MessageEmbed()
          .setTitle(`Information about ${member.displayName}`)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .addField('User', member, true)
          .addField('Discriminator', `${member.user.discriminator}`, true)
          .addField('ID', member.id, true)
          .addField('HypeSquad', HypeSquadHouse, true)
          .addField('Status', member.presence.status, true)
          .addField('Bot', userIsBot, true)
          .addField('Roles', userRoles, true)
          .addField('Color Role', member.roles.color || '`None`', true)
          .addField('Highest Role', member.roles.highest, true)
          .addField('Joined Server on', `${moment(member.joinedAt).format('MMM DD YYYY')}`, true)
          .addField('Created Discord Account on',`${moment(member.user.createdAt).format('MMMM DD YYYY')}`, true)
          .setTimestamp()
          .setColor(member.displayHexColor)
          .setFooter(message.author.username, message.author.displayAvatarURL())
      
      if (activities.length > 0) uiEmbed.setDescription(activities.join('\n'));
      if (customStatus) uiEmbed.spliceFields(0, 0, { name: 'Custom Status', value: customStatus });

      message.channel.send(uiEmbed);
    }

    if (command === 'updates') {
      const updateEmbed = new Discord.MessageEmbed()
        .setAuthor(client.user.tag, client.user.displayAvatarURL())
        .addField('Latest Updates', `Akinator has been implemented into the Bot!\n${prefix}akinator / ${prefix}aki`)
        .addField('Previous Updates', 'Bot now sends you an message when you try to execute an Command via DM')
        .setTimestamp()
        .setColor('#2C8FB2')
        .setFooter(message.author.username, message.author.displayAvatarURL())

      message.channel.send(updateEmbed);
    }

    if (command === 'akinator' || command === 'aki') {
      Akinator(message, client, 'en')
    }

    /*
    -- Staff Only Commands --
    */

    if (command === "say") {
      if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.delete();

      const toSay = args.join(' ');

      message.delete().catch(O_o => { });

      message.channel.send(toSay);
    }

    if (command === 'dm') {
      if (!message.member.hasPermission('MANAGE_MESSAGES')) return;

      let dmUser = args.shift();
      if (!dmUser) return message.channel.send('Invalid User');

      let dmMsg = args.join(' ');
      if (dmMsg.length < 1) return message.channel.send('Message cannot be empty');

      let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setDescription(dmMsg)
        .setColor('#38AC45')
        .setTimestamp()
        .setFooter(`Sent from ${message.guild.name}`)

      client.users.cache.get(dmUser).send(embed);
      message.react('✅');
      message.author.send('Your DM has been sent!');
    }

    if (command === 'clear') {
      if (!message.member.hasPermission('MANAGE_MESSAGES')) return;
      if (!args[0]) return message.channel.send('Please specify a number of messages to delete (1-99)');
      if (isNaN(args[0])) return message.channel.send('Only numbers are allowed');
      if (parseInt(args[0]) > 99) return message.channel.send('Max amount of messages I can delete is 99');
      
      await message.channel.bulkDelete(parseInt(args[0]) + 1)
        .catch(err => console.log(err))
      message.channel.send(`Successfully deleted ${args[0]} messages`).then(msg => msg.delete({
        timeout: 5000,
        reason: '-'
      }));
    }

    /*
    -- Bot Developer Only Commands --
    */

    if (command === "eval") {
      if (message.author.id !== devID) return;

      const clean = async (text) => {
        if (text && text.constructor.name == "Promise")
        text = await text;

        if (typeof text !== "string")
        text = require("util").inspect(text, { depth: 1 });

        text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));

        return text;
      }

      try {
        const toEval = args.join(' ');
        const evaled = eval(toEval);

        const cleaned = await clean(evaled);

        const evalEmbed = new Discord.MessageEmbed()
          .setAuthor(`${client.user.username} | Eval`, client.user.displayAvatarURL())
          .setColor('#38AC45')
          .addFields(
            { name: 'Input', value: toEval },
            { name: 'Output', value: cleaned },
          )
          .setFooter('Successfully evaled')
        message.channel.send(evalEmbed);
      } catch (err) {
        const errorEmbed = new Discord.MessageEmbed()
          .setAuthor(`${client.user.username} | Eval`, client.user.displayAvatarURL())
          .setColor('#CD393B')
          .setDescription('I wasn\'t able to eval the provided code!')
          .setFooter('Eval failed')
        message.channel.send(errorEmbed)
      }
    }

    /*
    -- WIP Commands --
    */
});

client.login(token); 