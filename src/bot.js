import config from "./config.js";
import { Client } from "discord.js";
import http from "http";
import * as commands from "./commands/index.js";
import checkForNewChap from "./notifyChapter.js";
import votePost from "./votePost.js";
import sendChannelMessage from "./sendChannelMessage.js";

export const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "DIRECT_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

client.once("ready", () => {
  console.log("🤖 Discord bot is ready!");

  // Send message to #access-logs channel
  sendChannelMessage(client, "966631308245741598", "🎉 Bot is online!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  /* 
    The command name and file name match
    so we can execute the command
    by selecting the file name
    */
  commands[commandName].execute(interaction, client);
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch(); // Partial messages are fetched
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
      return;
    }
  }

  votePost(reaction, client);
});

setInterval(async () => {
  console.log("🔃 Fetching new chapters....");
  // Send message to #access-logs channel
  sendChannelMessage(
    client,
    "966631308245741598",
    "🔃 Fetching new chapters...."
  );
  const newChap = await checkForNewChap(client);
  console.log(newChap);

  if (newChap.length > 0) {
    newChap.map((chap) => {
      let message = `${
        chap.isImportant ? "<@786569518256226325> " : ""
      }📃 New chapter of ${chap.name} is available! \nDiscussion: <${
        chap.reddit_link
      }> \n\n${chap.url}`;

      // Send message to #new-manga channel
      sendChannelMessage(client, "965269327580381304", message);
    });

    // Send message to #access-logs channel
    sendChannelMessage(client, "966631308245741598", "🎉 New chapters found!");
    console.log("🎉 New chapters found!");
  } else {
    // Send message to #access-logs channel
    sendChannelMessage(
      client,
      "966631308245741598",
      "💥 No new chapters found!"
    );
    console.log("💥 No new chapters found!");
  }
}, 600000); // Runs every 10 minutes

client.login(config.DISCORD_TOKEN);

http
  .createServer(function (req, res) {
    if (req.url === "/kill") {
      // Kill the bot, before suspending the service
      try {
        client.destroy();
        console.log("🤖 Bot is now dead!");
        res.writeHead(200, { "Content-Type": "text/plain" });
        return res.end("✅ Bot is now dead!");
      } catch (error) {
        console.log(error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        return res.end("💥 Something went wrong, could not kill the bot!");
      }
    }
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World\n");
  })
  .listen(process.env.PORT);
