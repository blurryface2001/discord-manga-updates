import axios from "axios";
import { load } from "cheerio";

export default async function scrapeTotalAnimeEpisode(animeId) {
  return new Promise(async (resolve, reject) => {
    const res = {
      latestEpisodeNum: 0,
      episode: {},
    };

    try {
      const episodesAjax = await axios.get(
        `https://aniwatch.to/ajax/v2/episode/list/${animeId.split("-").pop()}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4692.71 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            Referer: `https://aniwatch.to/watch/${animeId}`,
          },
        }
      );

      const $ = load(episodesAjax.data.html);

      res.latestEpisodeNum = Number($(".detail-infor-content .ss-list a").length);

      $(".detail-infor-content .ss-list a").each((i, el) => {
        if (Number($(el).attr("data-number")) === res.latestEpisodeNum) {
          res.episode = {
            title: $(el)?.attr("title")?.trim() || null,
            episodeURL: `https://aniwatch.to/watch/${$(el)?.attr("href")?.split("/")?.pop()}` || null,
            number: Number($(el).attr("data-number")),
          };
        }
      });

      resolve(res);
    } catch (err) {
      reject(err);
    }
  });
}
