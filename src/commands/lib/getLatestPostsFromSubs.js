import config from '../../config.js';
import fetch from 'node-fetch';
import sendChannelMessage from '../../sendChannelMessage.js';

export default async function getLatestPostsFromSub(client, now) {
  const URLS = JSON.parse(process.env.SUB_URLS);
  const url = URLS[Math.floor(Math.random() * URLS.length)].url;

  try {
    const response = await fetch(
      `${url}/latest-giveaway-posts`,
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
        '1504536098360135964',
        `💥 Backend error ${response.status} while fetching sub posts: ${response.statusText}`,
      );
      throw new Error(
        `💥 Backend error ${response.status} while fetching sub posts: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const allPosts = data.posts || data;
    const restrictedWords = JSON.parse(process.env.RESTRICTED_WORDS);

    const filteredPosts = allPosts.filter((p) => {
      const created = p.data?.created || p.created;
      const isItNew = now - created < 30;
      // filter out certain posts if contains restricted words
      const containsRestrictedWords = restrictedWords.some((word) =>
        p.data.title.toLowerCase().includes(word.toLowerCase()),
      );
      return isItNew && !containsRestrictedWords;
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
