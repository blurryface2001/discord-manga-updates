import config from "../../config.js";
import Airtable from "airtable";
import sendChannelMessage from "../../sendChannelMessage.js";

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  "appkV9F4scpEvGZEM"
);

export default async function addMangaToAirTable({
  name,
  genres,
  url,
  isImportant,
  client,
}) {
  try {
    const records = await base("collection").create([
      {
        fields: {
          name,
          url,
          isImportant,
          genre: [...genres],
        },
      },
    ]);

    return records.length !== 0;
  } catch (error) {
    console.error(`💥 Cannot add manga to Airtable: \n\n${error}`);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      "966622664800215040",
      `💥 Cannot add manga to Airtable: \n\n${error}`
    );
    return false;
  }
}
