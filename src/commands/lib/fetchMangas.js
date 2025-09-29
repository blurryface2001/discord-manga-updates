// import config from "../../config.js";
// import Airtable from "airtable";

// const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
//   "appkV9F4scpEvGZEM"
// );

// export default async function fetchMangas(genre) {
//   return new Promise((resolve, reject) => {
//     const allMangas = [];

//     base("collection")
//       .select({
//         view: "Grid view",
//         fields: ["name", "url", "genre", "isImportant"],
//       })
//       .eachPage(
//         function page(records, fetchNextPage) {
//           // This function (`page`) will get called for each page of records.

//           records.forEach(function (record) {
//             if (genre === null) {
//               allMangas.push({
//                 name: record.get("name"),
//                 url: record.get("url"),
//                 genre: record.get("genre"),
//                 isImportant: Boolean(record.get("isImportant")),
//               });
//             } else if (record.get("genre").includes(genre)) {
//               allMangas.push({
//                 name: record.get("name"),
//                 url: record.get("url"),
//                 genre: record.get("genre"),
//                 isImportant: Boolean(record.get("isImportant")),
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
//             resolve(allMangas);
//           }
//         }
//       );
//   });
// }

import config from '../../config.js';
import fetch from 'node-fetch';

const BASEROW_API_TOKEN = config.BASEROW_KEY;

export default async function fetchMangas(genre) {
  const allMangas = [];
  let url = `https://api.baserow.io/api/database/rows/table/688605/?user_field_names=true`;

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

    console.log(data);
    data.results.forEach((row) => {
      const rowGenre = row.genre || [];
      if (genre === null || rowGenre.includes(genre)) {
        allMangas.push({
          name: row.name,
          url: row.url,
          genre: rowGenre.map((g) => g.value),
          isImportant: Boolean(row.isImportant),
        });
      }
    });

    url = data.next;
  }

  return allMangas;
}
