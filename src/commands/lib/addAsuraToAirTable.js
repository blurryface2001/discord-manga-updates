// import config from "../../config.js";
// import fetchLatestAsuraChapterNum from "../utils/fetchLatestAsuraChapter.js";
// import Airtable from "airtable";
// import sendChannelMessage from "../../sendChannelMessage.js";

// const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
//   "app32Vn9ScZ2IpA49"
// );

// export default async function addAsuraToAirTable({
//   name,
//   url,
//   isImportant,
//   client,
// }) {
//   try {
//     const { latestChapterNum } = await fetchLatestAsuraChapterNum(url);

//     const records = await base("collection").create([
//       {
//         fields: {
//           name,
//           isImportant,
//           latestChapterNum,
//           url,
//         },
//       },
//     ]);

//     return records.length !== 0;
//   } catch (error) {
//     console.error(`💥 Cannot add manhwa to Airtable: \n\n${error}`);
//     console.error(error);

//     // Send error to #error-logs channel
//     sendChannelMessage(
//       client,
//       "966622664800215040",
//       `💥 Cannot add manhwa to Airtable: \n\n${error}`
//     );
//     return false;
//   }
// }

import config from '../../config.js';
import fetchLatestAsuraChapterNum from '../utils/fetchLatestAsuraChapter.js';
import fetch from 'node-fetch';
import sendChannelMessage from '../../sendChannelMessage.js';

const BASEROW_API_TOKEN = config.BASEROW_KEY;

export default async function addAsuraToBaserow({
  name,
  url,
  isImportant,
  client,
}) {
  try {
    const { latestChapterNum } = await fetchLatestAsuraChapterNum(url);

    const res = await fetch(
      `https://api.baserow.io/api/database/rows/table/688612/?user_field_names=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${BASEROW_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          isImportant,
          latestChapterNum,
          url,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Baserow API error: ${res.status} ${await res.text()}`);
    }

    const newRow = await res.json();
    return !!newRow.id; // true if row created successfully
  } catch (error) {
    console.error(`💥 Cannot add Asura manhwa to Baserow: \n\n${error}`);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      '966622664800215040',
      `💥 Cannot add Asura manhwa to Baserow: \n\n${error}`
    );

    return false;
  }
}
