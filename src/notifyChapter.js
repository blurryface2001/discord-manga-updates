import axios from "axios";
import listManga from "./commands/lib/listManga.js";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36 Edg/97.0.1072.55",
};

export default async function checkForNewChap() {
  const posts = await (
    await axios.get("https://www.reddit.com/r/manga/new.json?limit=10", headers)
  ).data.data.children;

  const newChap = [];
  let mangaList = await listManga(null);
  for (const post of posts) {
    const postTitle = post.data.title.toLowerCase();
    for (let manga of mangaList) {
      if (
        postTitle.toLowerCase().includes(manga.name.toLowerCase()) &&
        postTitle.toLowerCase().includes("disc")
      ) {
        const created = post.data.created;
        if (new Date().getTime() / 1000 - created < 58) {
          manga = { ...manga, url: post.data.url };
          newChap.push(manga);
        }
      }
    }
  }

  return newChap;
}

checkForNewChap();