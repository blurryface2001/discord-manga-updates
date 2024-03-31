import config from './config.js';
import sendChannelMessage from './sendChannelMessage.js';
import puppeteer from 'puppeteer-extra';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

export default async function votePost(reaction, client) {
  if (reaction.message.channelId !== '965269327580381304') return;
  const { name } = reaction.emoji;
  if (name !== '👍' && name !== '👎') return;

  const { content } = reaction.message;

  const title = content
    .match(/(?<=New (chapter|art|news|post) of)(.*)(?=is available!)/)[0]
    .trim();
  const url = content.match(/(?<=Discussion: <)(.*)(?=>)/)[0].trim();
  const id = url.split('https://reddit.com/r/manga/comments/')[1].split('/')[0];

  console.log('🔃 Voting for: ', title);
  sendChannelMessage(client, '966631308245741598', `🔃 Voting for: ${title}`);

  let browser;
  let page;
  try {
    // Launch the browser
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Login to reddit
    await page.goto('https://old.reddit.com/login');
    await page.type('#user_login', config.REDDIT_USERNAME);
    await page.type('#passwd_login', config.REDDIT_PASSWORD);
    await page.click('form#login-form button[type=submit]');
    await page.waitForNavigation();

    // Go to the subreddit
    await page.goto(`https://old.reddit.com/${id}/`);
    if (name === '👍') {
      await page.click('div[data-event-action=upvote]');
      console.log(`👍 ${title}`);
      sendChannelMessage(
        client,
        '966631308245741598',
        `⬆️ Upvoted the manga: ${title}! \n\n${url}`
      );
    } else {
      await page.click('div[data-event-action=downvote]');
      console.log(`👎 ${title}`);
      sendChannelMessage(
        client,
        '966631308245741598',
        `⬇️ Downvoted the manga: ${title}! \n\n${url}`
      );
    }

    await page.close();
    await browser.close();
  } catch (error) {
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
    console.error(error);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      '966622664800215040',
      '💥 Error while voting! \n\n' + error
    );
  }
}
