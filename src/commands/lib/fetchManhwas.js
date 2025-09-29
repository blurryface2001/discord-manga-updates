// import config from "../../config.js";
// import Airtable from "airtable";

// const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
//   "appg3C5IKk0o4m05d"
// );

// export default async function fetchManhwas(genre) {
//   return new Promise((resolve, reject) => {
//     const allManhwas = [];

//     base("collection")
//       .select({
//         view: "Grid view",
//         fields: ["name", "genre", "isImportant", "mangadexURL", "batoURL"],
//       })
//       .eachPage(
//         function page(records, fetchNextPage) {
//           // This function (`page`) will get called for each page of records.

//           records.forEach(function (record) {
//             if (genre === null) {
//               allManhwas.push({
//                 name: record.get("name"),
//                 genre: record.get("genre"),
//                 isImportant: Boolean(record.get("isImportant")),
//                 mangadexURL: record.get("mangadexURL"),
//                 batoURL: record.get("batoURL"),
//               });
//             } else if (record.get("genre").includes(genre)) {
//               allManhwas.push({
//                 name: record.get("name"),
//                 genre: record.get("genre"),
//                 isImportant: Boolean(record.get("isImportant")),
//                 mangadexURL: record.get("mangadexURL"),
//                 batoURL: record.get("batoURL"),
//               });
//             }
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
//             resolve(allManhwas);
//           }
//         }
//       );
//   });
// }

import config from '../../config.js';
import fetch from 'node-fetch';

const BASEROW_API_TOKEN = config.BASEROW_KEY;

export default async function fetchManhwas(genre) {
  const allManhwas = [];
  let url = `https://api.baserow.io/api/database/rows/table/688607/?user_field_names=true`;

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
      const rowGenre = row.genre || []; // handle multi-select array
      if (genre === null || rowGenre.includes(genre)) {
        allManhwas.push({
          name: row.name,
          genre: rowGenre.map((g) => g.value), // only get the values
          isImportant: Boolean(row.isImportant),
          mangadexURL: row.mangadexURL,
          batoURL: row.batoURL,
        });
      }
    });

    url = data.next; // pagination
  }

  return allManhwas;
}
