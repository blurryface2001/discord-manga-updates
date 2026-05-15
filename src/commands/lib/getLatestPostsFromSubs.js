import config from '../../config.js';
import fetch from 'node-fetch';
import sendChannelMessage from '../../sendChannelMessage.js';

export default async function getLatestPostsFromSub(client, now) {
  const URLS = JSON.parse(process.env.SUB_URLS);
  const url = URLS[Math.floor(Math.random() * URLS.length)].url;

  try {
    sendChannelMessage(
      client,
      '1504536098360135964',
      `✅ Requesting latest sub posts from backend...`,
    );

    const response = await fetch(
      url,
      {
        headers: {
          Accept: 'application/json',
        },
      },
      {
        timeout: 10000,
      },
    );

    if (!response.ok) {
      console.error(
        `💥 Backend error ${response.status} while fetching sub posts: ${response.statusText}`,
      );
      sendChannelMessage(
        client,
        '966622664800215040',
        `💥 Backend error ${response.status} while fetching sub posts: ${response.statusText}`,
      );
    }

    const json = await response.json();
    const allPosts = data.posts || data;

    const filteredPosts = allPosts.filter((p) => {
      const created = p.created_utc || p.data?.created || p.created;
      return now - created < 12;
    });

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
