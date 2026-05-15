import config from "./config.js";
import { Client } from "discord.js";
import http from "http";
import * as commands from "./commands/index.js";
import checkForNewChap from "./notifyChapter.js";
import votePost from "./votePost.js";
import sendChannelMessage from "./sendChannelMessage.js";
import getLatestPostsFromSub from "./commands/lib/getLatestPostsFromSubs.js";

console.log("🤖 Starting bot...");

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
  console.log("🤖 Ready as: ", client.user.tag);

  // Send message to #access-logs channel
  sendChannelMessage(client, "966631308245741598", "🎉 Bot is online!");

  setInterval(runJob, 600000); // Runs every 10 minutes
  setInterval(getLatestPosts, 20000); // Runs every 20 sec
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

client.on("debug", msg => console.log("[DEBUG]", msg));
client.on("warn", msg => console.warn("[WARN]", msg));
client.on("error", err => console.error("[ERROR]", err));
client.on("shardError", err => console.error("[SHARD]", err));

async function runJob() {
  console.log("🔃 Fetching new chapters & animes....");
  // Send message to #access-logs channel
  sendChannelMessage(
    client,
    "966631308245741598",
    "🔃 Fetching new chapters & animes...."
  );
  const { newChap, newAnime } = await checkForNewChap(client);
  console.log({ newChap, newAnime });

  if (newChap.length > 0) {
    newChap.map((chap) => {
      // Personalize message according post type (disc, art, news)
      const postTitle = chap.postTitle.toLowerCase();
      let message = `${
        chap.isImportant && postTitle.includes("disc")
          ? "<@786569518256226325> "
          : ""
      }${
        (postTitle.includes("disc") && "📃") ||
        (postTitle.includes("art") && "🎨") ||
        (postTitle.includes("news") && "📰") ||
        "📝"
      } New ${
        (postTitle.includes("disc") && "chapter") ||
        (postTitle.includes("art") && "art") ||
        (postTitle.includes("news") && "news") ||
        "post"
      } of ${chap.name} is available! \nTitle: ${
        chap.postTitle
      } \nDiscussion: <${chap.reddit_link}> \n\n${chap.url}`;

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

  if (newAnime.length > 0) {
    newAnime.map((anime) => {
      let message = `${
        anime.isImportant ? "<@786569518256226325> " : ""
      }📺 New episode of ${anime.name} is available!\n Episode no.: ${
        anime.number
      } \n\n${anime.url}`;

      // Send message to #new-anime channel
      sendChannelMessage(client, "1185688766061490176", message);
    });

    // Send message to #access-logs channel
    sendChannelMessage(client, "966631308245741598", "🎉 New anime episodes found!");
    console.log("🎉 New anime episodes found!");
  } else {
    // Send message to #access-logs channel
    sendChannelMessage(
      client,
      "966631308245741598",
      "💥 No new anime episodes found!"
    );
    console.log("💥 No new anime episodes found!");
  }
}

async function getLatestPosts() {
  try {
    sendChannelMessage(client, "1504536098360135964", "🔃 Getting latest posts from sub");
    const now = new Date().getTime() / 1000;
    const newPosts = await getLatestPostsFromSub(client, now);
    newPosts.forEach(async (post) => {
      const postTitle = post.title;
      const postUrl = post.permalink;

      const message = `<@786569518256226325> ⭐ New post Title: ${ 
        postTitle
      } \nDiscussion: <${postUrl}> \n\n${post.url}`

      // Send message to channel
      sendChannelMessage(client, "1504522179939664114", message);
      // Wait for 3 sec
      await new Promise((resolve) => setTimeout(resolve, 3000));
    })
    sendChannelMessage(client, "1504536098360135964", `🎉 Latest posts fetched! No. of posts: ${newPosts.length}`);
  } catch (error) {
    console.error("💥 Error when getting latest posts: ", error);
    sendChannelMessage(
      client,
      "966622664800215040",
      `💥 Error when getting latest posts: \n\n${error}`
    );
  }
}

client.login(config.DISCORD_TOKEN).catch((error) => console.log(`💥 Error while logging in: ${error}`));

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

