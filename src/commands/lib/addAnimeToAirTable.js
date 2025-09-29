// import config from "../../config.js";
// import Airtable from "airtable";
// import sendChannelMessage from "../../sendChannelMessage.js";
// import scrapeTotalAnimeEpisode from "../utils/scrapeTotalAnimeEpisode.js";

// const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
//   "appIqQvLuJY6ybQlD"
// );

// export default async function addAnimeToAirTable({
//   name,
//   url,
//   isImportant,
//   client,
// }) {
//   try {
//     const animeId = url.split("/").pop();
//     const { latestEpisodeNum } = await scrapeTotalAnimeEpisode(animeId);

//     const records = await base("collection").create([
//       {
//         fields: {
//           name,
//           isImportant,
//           latestEpisodeNum,
//           url,
//         },
//       },
//     ]);

//     return records.length !== 0;
//   } catch (error) {
//     console.error(`💥 Cannot add anime to Airtable: \n\n${error}`);
//     console.error(error);

//     // Send error to #error-logs channel
//     sendChannelMessage(
//       client,
//       "966622664800215040",
//       `💥 Cannot add anime to Airtable: \n\n${error}`
//     );
//     return false;
//   }
// }

import config from '../../config.js';
import fetch from 'node-fetch';
import sendChannelMessage from '../../sendChannelMessage.js';
import scrapeTotalAnimeEpisode from '../utils/scrapeTotalAnimeEpisode.js';

const BASEROW_API_TOKEN = config.BASEROW_KEY;

export default async function addAnimeToBaserow({
  name,
  url,
  isImportant,
  client,
}) {
  try {
    const animeId = url.split('/').pop();
    const { latestEpisodeNum } = await scrapeTotalAnimeEpisode(animeId);

    const res = await fetch(
      `https://api.baserow.io/api/database/rows/table/688614/?user_field_names=true`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${BASEROW_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          isImportant,
          latestEpisodeNum,
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
    console.error(`💥 Cannot add anime to Baserow: \n\n${error}`);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      '966622664800215040',
      `💥 Cannot add anime to Baserow: \n\n${error}`
    );

    return false;
  }
}

