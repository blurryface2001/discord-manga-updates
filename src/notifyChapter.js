import axios from "axios";
import { parseStringPromise } from "xml2js";
import fetchMangas from "./commands/lib/fetchMangas.js";
import fetchManhwas from "./commands/lib/fetchManhwas.js";
import fetchAsuraManhwas from "./commands/lib/fetchAsuraManhwas.js";
import sendChannelMessage from "./sendChannelMessage.js";
import fetchLatestAsuraChapterNum from "./commands/utils/fetchLatestAsuraChapter.js";
import updateAsuraLatestNum from "./commands/lib/updateAsuraLatestNum.js";
import fetchAnime from "./commands/lib/fetchAnime.js";
import scrapeTotalAnimeEpisode from "./commands/utils/scrapeTotalAnimeEpisode.js";
import updateAnimeLatestNum from "./commands/lib/updateAnimeLatestNum.js";
import fetchControls from './commands/lib/fetchControls.js';
import config from "./config.js";

const headers = {
  "Content-Type": "application/json",
};

function wait(amount) {
  return new Promise((resolve) => setTimeout(resolve, amount));
}

const previousIndexes = [];

async function checkForNewMangaChap(newChap, client) {
  let maxNumbers = Number(config.MAX_RETRIES);

  while (maxNumbers > 0) {
    try {
      const urls = JSON.parse(process.env.URLS);

      console.log("Manga: these are the urls: ");
      console.log(urls);

      let randomIndex;

      do {
        randomIndex = Math.floor(Math.random() * urls.length);
      } while (previousIndexes.includes(randomIndex)); // Repeat until a different element is chosen
      
      previousIndexes.push(randomIndex);
      if (previousIndexes.length > 2) {
        // Keep only the last 2 selected elements
        previousIndexes.shift();
      }

      const url = urls[randomIndex];

      console.log(`🔃 Manga: Using this url ${url.name}: ${url.url}`);
      sendChannelMessage(
        client,
        "966631308245741598",
        `🔃 Manga: Using this url: ${url.url}`
      );
      
      let mangaList = await fetchMangas(null);

      const posts = await (
        await axios.get(
          url.url + "/latestposts",
          {
            headers,
            timeout: 300000 // wait for atleast 5mins
          }
        )
      ).data;

      console.log(`🔃 Manga: Got the posts!!: ${url.url}`);
      sendChannelMessage(
        client,
        "966631308245741598",
        `🔃 Manga: got the posts!!: ${url.url}`
      );

      for (const post of posts) {
        const postTitle = post.data.title.toLowerCase();
        for (let manga of mangaList) {
          if (postTitle.toLowerCase().includes(manga.name.toLowerCase())) {
            const created = post.data.created;
            const now = new Date().getTime() / 1000;
            const diff = now - created;

            // If the manga was published in the last 10 minutes
            if (diff < 618) {
              manga = {
                ...manga,
                url: post.data.url,
                reddit_link: `https://reddit.com${post.data.permalink}`,
                postTitle: post.data.title,
              };
              newChap.push(manga);
            }
          }
        }
      }
      return newChap;
    } catch (e) {
      // Send error to #error-logs channel
      sendChannelMessage(client, "966622664800215040", `💥 Error fetching manga chap :\n\n${e}`);
      sendChannelMessage(
        client,
        "966622664800215040",
        `💥 Manga: Retrying getting mangas: ${6 - maxNumbers}`
      );
      console.error(e);
      console.error(`💥 Manga: Retrying getting mangas: ${6 - maxNumbers}`);
      await wait(1000 * (5 - maxNumbers));
      maxNumbers--;
    }
  }

  return [];
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
      const id = mangadexURL.split("/")[4];
      const data = await (
        await axios.get(
          `https://api.mangadex.org/manga/${id}/feed?createdAtSince=${publishedAtSince}`
        )
      ).data.data;

      if (data.length > 0) {
        for (const chap of data) {
          if (chap.attributes.translatedLanguage !== "en") continue;

          chapters.push({
            ...manhwa,
            url: `https://mangadex.org/chapter/${chap.id}`,
            reddit_link: "It's from MangaDex",
            postTitle: "[DISC] It's from MangaDex",
          });
        }
      }
      // Wait 0.3s before next request
      await wait(330);
    }

    // Get the latest chapter from bato
    if (batoURL) {
      const rssId = batoURL.split("/")[4];
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
            postTitle: "[DISC] It's from Batoto",
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

async function checkForNewAsuraManhwas(newChap, client) {
  const asurList = await fetchAsuraManhwas();

  for (const manhwa of asurList) {
    try {
      const { url } = manhwa;

      const { latestChapterURL, latestChapterNum } =
        await fetchLatestAsuraChapterNum(url);

      if (latestChapterNum > manhwa.latestChapterNum) {
        newChap.push({
          ...manhwa,
          url: latestChapterURL,
          reddit_link: "It's from Asura",
          postTitle: "[DISC] It's from Asura",
        });
        await updateAsuraLatestNum({ id: manhwa.id, title: manhwa.name, latestChapterNum, client });
      }
    } catch (e) {
      const { url } = manhwa;
      console.error(`Asura error for "${url}": ${e}`);
      console.error(e);

      // Send error to #error-logs channel
      sendChannelMessage(
        client,
        '966622664800215040',
        `💥 Error fetching asura chap for "${url}":\n\n${e}`
      );
    }

    await wait(330);
  }

  return newChap;
}

async function checkForNewAnime(newAnime, client) {
  const animeList = await fetchAnime();

  for (const anime of animeList) {
    try {
      const { url } = anime;
      const animeId = url.split('/').pop();
      const { episode, latestEpisodeNum } = await scrapeTotalAnimeEpisode(
        animeId
      );

      if (latestEpisodeNum > anime.latestEpisodeNum) {
        newAnime.push({
          ...anime,
          url: episode.episodeURL,
          number: episode.number,
        });
        await updateAnimeLatestNum({
          id: anime.id,
          title: anime.name,
          latestEpisodeNum,
          client,
        });
      }
    } catch (e) {
      const { url } = anime;
      console.error(`Anime error for "${url}": ${e}`);
      console.error(e);

      // Send error to #error-logs channel
      sendChannelMessage(
        client,
        '966622664800215040',
        `💥 Error fetching anime episode for "${url}":\n\n${e}`
      );
    }

    await wait(330);
  }

  return newAnime;
}

export default async function checkForNewChap(client) {
  let newChap = [];
  let newAnime = [];

  try {
    const controls = await fetchControls();
    console.log(controls);

    if (controls['manga'] !== null && controls['manga']) {
      newChap = await checkForNewMangaChap(newChap, client);
    } else {
      // Send message to #access-logs channel
      sendChannelMessage(
        client,
        '966631308245741598',
        '🚫 Manga updates are currently disabled, skipping...'
      );
      console.log('🚫 Manga updates are currently disabled, skipping...');
    }
    if (controls['manhwa'] !== null && controls['manhwa']) {
      newChap = await checkForNewManhwaChap(newChap);
    } else {
      // Send message to #access-logs channel
      sendChannelMessage(
        client,
        '966631308245741598',
        '🚫 Manhwa updates are currently disabled, skipping...'
      );
      console.log('🚫 Manhwa updates are currently disabled, skipping...');
    }
    if (controls['asura'] !== null && controls['asura']) {
      newChap = await checkForNewAsuraManhwas(newChap, client);
    } else {
      // Send message to #access-logs channel
      sendChannelMessage(
        client,
        '966631308245741598',
        '🚫 Asura updates are currently disabled, skipping...'
      );
      console.log('🚫 Asura updates are currently disabled, skipping...');
    }
    if (controls['anime'] !== null && controls['anime']) {
      newAnime = await checkForNewAnime(newAnime, client);
    } else {
      // Send message to #access-logs channel
      sendChannelMessage(
        client,
        '966631308245741598',
        '🚫 Anime updates are currently disabled, skipping...'
      );
      console.log('🚫 Anime updates are currently disabled, skipping...');
    }
  } catch (error) {
    console.error(error);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      '966622664800215040',
      `💥 Error fetching new chap :\n\n${error}`
    );
  }

  return { newChap, newAnime };
}

