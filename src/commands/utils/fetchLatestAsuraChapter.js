import axios from "axios";
import { load } from "cheerio";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export default async function fetchLatestAsuraChapter(url) {
  const data = await axios.get(url, { headers });
  const $ = load(data.data);
  const chapterList = $("#chapterlist");
  const latestChapter = chapterList.children().find("li:first");
  const latestChapterURL = latestChapter.find("a").attr("href");
  const latestChapterNum = Number(
    latestChapter.find(".chapternum").text().trim().split(" ")[1]
  );

  return { latestChapterURL, latestChapterNum };
}
