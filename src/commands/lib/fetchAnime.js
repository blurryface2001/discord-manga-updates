import config from "../../config.js";
import Airtable from "airtable";

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  "appIqQvLuJY6ybQlD"
);

export default async function fetchAnime() {
  return new Promise((resolve, reject) => {
    const animes = [];

    base("collection")
      .select({
        view: "Grid view",
        fields: ["name", "url", "isImportant", "latestEpisodeNum"],
      })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.

          records.forEach(function (record) {
            animes.push({
              id: record.getId(),
              name: record.get("name"),
              latestEpisodeNum: Number(record.get("latestEpisodeNum")),
              url: record.get("url"),
              isImportant: Boolean(record.get("isImportant")),
            });
          });

          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
          } else {
            resolve(animes);
          }
        }
      );
  });
}
