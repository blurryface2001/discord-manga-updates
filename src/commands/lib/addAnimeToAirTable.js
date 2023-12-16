import config from "../../config.js";
import Airtable from "airtable";
import sendChannelMessage from "../../sendChannelMessage.js";
import scrapeTotalAnimeEpisode from "../utils/scrapeTotalAnimeEpisode.js";

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  "appIqQvLuJY6ybQlD"
);

export default async function addAnimeToAirTable({
  name,
  url,
  isImportant,
  client,
}) {
  try {
    const animeId = url.split("/").pop();
    const { latestEpisodeNum } = await scrapeTotalAnimeEpisode(animeId);

    const records = await base("collection").create([
      {
        fields: {
          name,
          isImportant,
          latestEpisodeNum,
          url,
        },
      },
    ]);

    return records.length !== 0;
  } catch (error) {
    console.error(`💥 Cannot add anime to Airtable: \n\n${error}`);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      "966622664800215040",
      `💥 Cannot add anime to Airtable: \n\n${error}`
    );
    return false;
  }
}
