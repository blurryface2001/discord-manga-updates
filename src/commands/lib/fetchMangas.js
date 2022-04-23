import config from "../../config.js";
import Airtable from "airtable";

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  "appkV9F4scpEvGZEM"
);

export default async function fetchMangas(genre) {
  return new Promise((resolve, reject) => {
    const allMangas = [];

    base("collection")
      .select({
        view: "Grid view",
        fields: ["name", "url", "genre", "isImportant"],
      })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.

          records.forEach(function (record) {
            if (genre === null) {
              allMangas.push({
                name: record.get("name"),
                url: record.get("url"),
                genre: record.get("genre"),
                isImportant: Boolean(record.get("isImportant")),
              });
            } else if (record.get("genre").includes(genre)) {
              allMangas.push({
                name: record.get("name"),
                url: record.get("url"),
                genre: record.get("genre"),
                isImportant: Boolean(record.get("isImportant")),
              });
            }
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
            resolve(allMangas);
          }
        }
      );
  });
}
