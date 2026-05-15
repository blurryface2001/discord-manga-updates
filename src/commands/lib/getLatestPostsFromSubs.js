import config from '../../config.js';
import fetch from 'node-fetch';
import sendChannelMessage from '../../sendChannelMessage.js';

export default async function getLatestPostsFromSub(client, now) {
  const URLS = JSON.parse(process.env.SUB_URLS);
  const USER_AGENT = process.env.USER_AGENT;

  try {
    let newPosts = [];

    for (const url of URLS) {
      const subName = url.split('/')[4];

      sendChannelMessage(
        client,
        '1504536098360135964',
        `✅ Fetching from r/${subName}`,
      );

      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      });

      // Better rate limit handling
      if (response.status === 429) {
        console.log(`⚠️ Rate limited on r/${subName}`);
        sendChannelMessage(
          client,
          '966622664800215040',
          `⚠️ Rate limited on r/${subName} - Slowing down`,
        );
        await new Promise((r) => setTimeout(r, 3000)); // wait longer
        continue;
      }

      if (!response.ok) {
        console.error(`💥 Error ${response.status} on r/${subName}`);
        sendChannelMessage(
          client,
          '966622664800215040',
          `💥 Error when fetch latest post from r/${subName}: ${response.status} ${response.statusText}`,
        );
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      const json = await response.json();
      const posts = [];

      for (const child of json.data.children) {
        const p = child.data;
        posts.push({
          title: p.title,
          url: p.url,
          permalink: `https://reddit.com${p.permalink}`,
          author: p.author,
          created_utc: p.created_utc,
          score: p.score,
          id: p.id,
          full_link: `https://reddit.com${p.permalink}`,
          subreddit: p.subreddit,
        });
      }

      newPosts.push(...posts);

      // Delay between subreddits
      if (url !== URLS[URLS.length - 1]) {
        await new Promise((resolve) => setTimeout(resolve, 3500)); // 3.5 seconds
      }
    }

    const filteredPosts = newPosts.filter((p) => now - p.created_utc < 22);

    return filteredPosts;
  } catch (error) {
    console.error(`💥 Cannot fetch latest post from sub: \n\n${error}`);

    sendChannelMessage(
      client,
      '966622664800215040',
      `💥 Cannot fetch latest post from sub: \n\n${error.message || error}`,
    );

    return [];
  }
}
