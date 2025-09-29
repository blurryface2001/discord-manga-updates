// import config from "../../config.js";
// import Airtable from "airtable";
// import sendChannelMessage from "../../sendChannelMessage.js";

// const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
//   "appIqQvLuJY6ybQlD"
// );

// export default async function updateAnimeLatestNum({
//   id,
//   title,
//   latestEpisodeNum,
//   client,
// }) {
//   try {
//     const records = await base("collection").update(id, {
//       latestEpisodeNum,
//     });

//     console.log(
//       `✅ Updated anime episode number in Airtable "${title}": ${latestEpisodeNum}`
//     );

//     sendChannelMessage(
//       client,
//       "966631308245741598",
//       `✅ Updated anime episode number in Airtable"${title}": ${latestEpisodeNum}`
//     );

//     return records.length !== 0;
//   } catch (error) {
//     console.error(
//       `💥 Cannot update anime episode number in Airtable "${title}": \n\n${error}`
//     );
//     console.error(error);

//     // Send error to #error-logs channel
//     sendChannelMessage(
//       client,
//       "966622664800215040",
//       `💥 Cannot update anime episode number in Airtable "${title}": \n\n${error}`
//     );
//     return false;
//   }
// }

import config from '../../config.js';
import fetch from 'node-fetch';
import sendChannelMessage from '../../sendChannelMessage.js';

const BASEROW_API_TOKEN = config.BASEROW_KEY;

export default async function updateAnimeLatestNum({
  id,
  title,
  latestEpisodeNum,
  client,
}) {
  try {
    const res = await fetch(
      `https://api.baserow.io/api/database/rows/table/688614/${id}/?user_field_names=true`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Token ${BASEROW_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latestEpisodeNum }),
      }
    );

    if (!res.ok) {
      throw new Error(`Baserow API error: ${res.status} ${await res.text()}`);
    }

    const updatedRow = await res.json();

    console.log(
      `✅ Updated anime episode number in Baserow "${title}": ${latestEpisodeNum}`
    );

    sendChannelMessage(
      client,
      '966631308245741598',
      `✅ Updated anime episode number in Baserow "${title}": ${latestEpisodeNum}`
    );

    return !!updatedRow.id; // return true if updated
  } catch (error) {
    console.error(
      `💥 Cannot update anime episode number in Baserow "${title}": \n\n${error}`
    );

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      '966622664800215040',
      `💥 Cannot update anime episode number in Baserow "${title}": \n\n${error}`
    );
    return false;
  }
}
