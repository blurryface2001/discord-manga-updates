import config from '../../config.js';
import fetch from 'node-fetch';
import sendChannelMessage from '../../sendChannelMessage.js';

export default async function getLatestPostsFromSub(client, now) {
  const URLS = JSON.parse(process.env.SUB_URLS);
  const USER_AGENT = process.env.USER_AGENT;

  try {
    let newPosts = [];

    for (const url of URLS) {
      sendChannelMessage(
        client,
        '1504536098360135964',
        `✅ Fetching from the sub: ${url.split('/')[4]}`,
      );
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        console.error(
          `💥 Error when fetch latest post from sub: ${response.status} ${response.statusText}`,
        );
        sendChannelMessage(
          client,
          '966622664800215040',
          `💥 Error when fetch latest post from sub: \n\n${response.status} ${response.statusText}`,
        );
        return [];
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
          // Useful for deduplication
          full_link: `https://reddit.com${p.permalink}`,
        });
      }

      newPosts.push(...posts);

      // Wait for 3 sec
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // filter in only the posts made in last 22 seconds
    const filteredPosts = newPosts.filter((p) => now - p.created_utc < 22);

    return filteredPosts;
  } catch (error) {
    console.error(`💥 Cannot fetch latest post from sub: \n\n${error}`);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      '966622664800215040',
      `💥 Cannot fetch latest post from sub: \n\n${error}`,
    );

    return [];
  }
}
