// import config from "../../config.js";
// import Airtable from "airtable";

// const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
//   "appIqQvLuJY6ybQlD"
// );

// export default async function fetchAnime() {
//   return new Promise((resolve, reject) => {
//     const animes = [];

//     base("collection")
//       .select({
//         view: "Grid view",
//         fields: ["name", "url", "isImportant", "latestEpisodeNum"],
//       })
//       .eachPage(
//         function page(records, fetchNextPage) {
//           // This function (`page`) will get called for each page of records.

//           records.forEach(function (record) {
//             animes.push({
//               id: record.getId(),
//               name: record.get("name"),
//               latestEpisodeNum: Number(record.get("latestEpisodeNum")),
//               url: record.get("url"),
//               isImportant: Boolean(record.get("isImportant")),
//             });
//           });

//           // To fetch the next page of records, call `fetchNextPage`.
//           // If there are more records, `page` will get called again.
//           // If there are no more records, `done` will get called.
//           fetchNextPage();
//         },
//         function done(err) {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(animes);
//           }
//         }
//       );
//   });
// }

import config from '../../config.js';
import fetch from 'node-fetch';

const BASEROW_API_TOKEN = config.BASEROW_KEY;

export default async function fetchAnime() {
  const animes = [];
  let url = `https://api.baserow.io/api/database/rows/table/688614/?user_field_names=true`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Token ${BASEROW_API_TOKEN}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Baserow API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();

    data.results.forEach((row) => {
      animes.push({
        id: row.id, // Baserow row ID
        name: row.name,
        latestEpisodeNum: Number(row.latestEpisodeNum),
        url: row.url,
        isImportant: Boolean(row.isImportant),
      });
    });

    url = data.next; // pagination
  }

  return animes;
}
