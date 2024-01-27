import config from "../../config.js";
import Airtable from "airtable";
import sendChannelMessage from "../../sendChannelMessage.js";

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  "appg3C5IKk0o4m05d"
);

export default async function addManhwaToAirTable({
  name,
  genres,
  isImportant,
  mangadexURL,
  batoURL,
  client,
}) {
  try {
    const records = await base("collection").create([
      {
        fields: {
          name,
          genre: [...genres],
          isImportant,
          mangadexURL,
          batoURL,
        },
      },
    ]);

    return records.length !== 0;
  } catch (error) {
    console.error(`💥 Cannot add manhwa to Airtable: \n\n${error}`);
    console.error(error);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      "966622664800215040",
      `💥 Cannot add manhwa to Airtable: \n\n${error}`
    );
    return false;
  }
}
