import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import fetchMangas from './commands/lib/fetchMangas.js';
import fetchManhwas from './commands/lib/fetchManhwas.js';
import sendChannelMessage from './sendChannelMessage.js';

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Edg/97.0.1072.55',
};

function wait(amount) {
  return new Promise((resolve) => setTimeout(resolve, amount));
}

async function checkForNewMangaChap(newChap) {
  let mangaList = await fetchMangas(null);

  const posts = await (
    await axios.get('https://www.reddit.com/r/manga/new.json?limit=10', headers)
  ).data.data.children;

  for (const post of posts) {
    const postTitle = post.data.title.toLowerCase();
    for (let manga of mangaList) {
      if (
        postTitle.toLowerCase().includes(manga.name.toLowerCase()) // &&
        // postTitle.toLowerCase().includes("disc")
      ) {
        const created = post.data.created;
        const now = new Date().getTime() / 1000;
        const diff = now - created;

        // If the manga was published in the last 10 minutes
        if (diff < 618) {
          manga = {
            ...manga,
            url: post.data.url,
            reddit_link: `https://reddit.com${post.data.permalink}`,
          };
          newChap.push(manga);
        }
      }
    }
  }
  return newChap;
}

async function checkForNewManhwaChap(newChap) {
  const manhwaList = await fetchManhwas(null);
  const chapters = [];

  const now = new Date();
  now.setMinutes(now.getMinutes() - 10);

  for (const manhwa of manhwaList) {
    const { mangadexURL, batoURL } = manhwa;

    // Get the latest chapter from mangadex
    if (mangadexURL) {
      const publishedAtSince = now
        .toISOString()
        .match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)[0];
      const id = mangadexURL.split('/')[4];
      const data = await (
        await axios.get(
          `https://api.mangadex.org/manga/${id}/feed?createdAtSince=${publishedAtSince}`
        )
      ).data.data;

      if (data.length > 0) {
        for (const chap of data) {
          if (chap.attributes.translatedLanguage !== 'en') continue;

          chapters.push({
            ...manhwa,
            url: `https://mangadex.org/chapter/${chap.id}`,
            reddit_link: "It's from MangaDex",
          });
        }
      }
      // Wait 0.3s before next request
      await wait(330);
    }

    // Get the latest chapter from bato
    if (batoURL) {
      const rssId = batoURL.split('/')[4];
      const rssFeed = `https://batotoo.com/rss/series/${rssId}.xml`;

      const data = await (await axios.get(rssFeed)).data;
      const xml = await parseStringPromise(data);
      const manhwaChapters = xml.rss.channel[0].item;

      manhwaChapters.forEach((chap) => {
        const publishedAt = new Date(chap.pubDate[0]);
        const tenMin = 10 * 60 * 1000;
        if (now - publishedAt < tenMin) {
          chapters.push({
            ...manhwa,
            url: chap.link[0],
            reddit_link: "It's from Batoto",
          });
        }
      });
    }
  }

  /* 
    If both mangadex and bato had same chapters
    we only want to send the manga once
  */
  const uniqueChapters = [];
  chapters.forEach((chap) => {
    if (!uniqueChapters.find((c) => c.name === chap.name)) {
      uniqueChapters.push(chap);
    }
  });

  newChap = [...newChap, ...uniqueChapters];

  return newChap;
}

export default async function checkForNewChap(client) {
  let newChap = [];

  try {
    newChap = await checkForNewMangaChap(newChap);
    newChap = await checkForNewManhwaChap(newChap);
  } catch (error) {
    console.log(error);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      '966622664800215040',
      `💥 Error fetching new chap :\n\n${error}`
    );
  }

  return newChap;
}
