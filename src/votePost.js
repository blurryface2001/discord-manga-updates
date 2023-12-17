import config from "./config.js";
import puppeteer from "puppeteer";
import sendChannelMessage from "./sendChannelMessage.js";

export default async function votePost(reaction, client) {
  if (reaction.message.channelId !== "965269327580381304") return;
  const { name } = reaction.emoji;
  if (name !== "👍" && name !== "👎") return;

  const { content } = reaction.message;

  const title = content
    .match(/(?<=New (chapter|art|news|post) of)(.*)(?=is available!)/)[0]
    .trim();
  const url = content.match(/(?<=Discussion: <)(.*)(?=>)/)[0].trim();
  const id = url.split("https://reddit.com/r/manga/comments/")[1].split("/")[0];

  console.log("🔃 Voting for: ", title);
  sendChannelMessage(client, "966631308245741598", `🔃 Voting for: ${title}`);

  try {
    // Launch the browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Login to reddit
    await page.goto("https://old.reddit.com/login");
    await page.type("#user_login", config.REDDIT_USERNAME);
    await page.type("#passwd_login", config.REDDIT_PASSWORD);
    await page.click("form#login-form button[type=submit]");
    await page.waitForNavigation();

    // Go to the subreddit
    await page.goto(`https://old.reddit.com/${id}/`);
    if (name === "👍") {
      await page.click("div[data-event-action=upvote]");
      console.log(`👍 ${title}`);
      sendChannelMessage(
        client,
        "966631308245741598",
        `⬆️ Upvoted the manga: ${title}! \n\n${url}`
      );
    } else {
      await page.click("div[data-event-action=downvote]");
      console.log(`👎 ${title}`);
      sendChannelMessage(
        client,
        "966631308245741598",
        `⬇️ Downvoted the manga: ${title}! \n\n${url}`
      );
    }

    await browser.close();
  } catch (error) {
    console.error(error);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      "966622664800215040",
      "💥 Error while voting! \n\n" + error
    );
  }
}
