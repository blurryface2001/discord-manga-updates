// import config from "../../config.js";
// import Airtable from "airtable";

// const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
//   "app32Vn9ScZ2IpA49"
// );

// export default async function fetchAsuraManhwas() {
//   return new Promise((resolve, reject) => {
//     const asuraManhwas = [];

//     base("collection")
//       .select({
//         view: "Grid view",
//         fields: ["name", "url", "isImportant", "latestChapterNum"],
//       })
//       .eachPage(
//         function page(records, fetchNextPage) {
//           // This function (`page`) will get called for each page of records.

//           records.forEach(function (record) {
//             asuraManhwas.push({
//               id: record.getId(),
//               name: record.get("name"),
//               latestChapterNum: Number(record.get("latestChapterNum")),
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
//             resolve(asuraManhwas);
//           }
//         }
//       );
//   });
// }

import config from '../../config.js';
import fetch from 'node-fetch';

const BASEROW_API_TOKEN = config.BASEROW_KEY;

export default async function fetchAsuraManhwas() {
  const asuraManhwas = [];
  let url = `https://api.baserow.io/api/database/rows/table/688612/?user_field_names=true`;

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
      asuraManhwas.push({
        id: row.id, // Baserow row ID
        name: row.name,
        latestChapterNum: Number(row.latestChapterNum),
        url: row.url,
        isImportant: Boolean(row.isImportant),
      });
    });

    url = data.next; // pagination
  }

  return asuraManhwas;
}
