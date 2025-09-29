// import config from "../../config.js";
// import Airtable from "airtable";
// import sendChannelMessage from "../../sendChannelMessage.js";

// const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
//   "appkV9F4scpEvGZEM"
// );

// export default async function addMangaToAirTable({
//   name,
//   genres,
//   url,
//   isImportant,
//   client,
// }) {
//   try {
//     const records = await base("collection").create([
//       {
//         fields: {
//           name,
//           url,
//           isImportant,
//           genre: [...genres],
//         },
//       },
//     ]);

//     return records.length !== 0;
//   } catch (error) {
//     console.error(`💥 Cannot add manga to Airtable: \n\n${error}`);
//     console.error(error);

//     // Send error to #error-logs channel
//     sendChannelMessage(
//       client,
//       "966622664800215040",
//       `💥 Cannot add manga to Airtable: \n\n${error}`
//     );
//     return false;
//   }
// }


import config from '../../config.js';
import fetch from 'node-fetch';
import sendChannelMessage from '../../sendChannelMessage.js';

const BASEROW_API_TOKEN = config.BASEROW_KEY;

export default async function addMangaToBaserow({
  name,
  genres,
  url,
  isImportant,
  client,
}) {
  try {
    const res = await fetch(
      `https://api.baserow.io/api/database/rows/table/688605/?user_field_names=true `,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${BASEROW_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          url,
          isImportant,
          genre: genres,
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Baserow API error: ${res.status} ${await res.text()}`);
    }

    const newRow = await res.json();
    return !!newRow.id; // true if row created successfully
  } catch (error) {
    console.error(`💥 Cannot add manga to Baserow: \n\n${error}`);

    sendChannelMessage(
      client,
      '966622664800215040',
      `💥 Cannot add manga to Baserow: \n\n${error}`
    );

    return false;
  }
}
