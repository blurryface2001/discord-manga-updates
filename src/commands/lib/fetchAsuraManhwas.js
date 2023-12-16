import config from "../../config.js";
import Airtable from "airtable";

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  "app32Vn9ScZ2IpA49"
);

export default async function fetchAsuraManhwas() {
  return new Promise((resolve, reject) => {
    const asuraManhwas = [];

    base("collection")
      .select({
        view: "Grid view",
        fields: ["name", "url", "isImportant", "latestChapterNum"],
      })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.

          records.forEach(function (record) {
            asuraManhwas.push({
              id: record.getId(),
              name: record.get("name"),
              latestChapterNum: Number(record.get("latestChapterNum")),
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
            resolve(asuraManhwas);
          }
        }
      );
  });
}
