import config from "../../config.js";
import Airtable from "airtable";
import sendChannelMessage from "../../sendChannelMessage.js";

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  "appIqQvLuJY6ybQlD"
);

export default async function updateAnimeLatestNum({
  id,
  title,
  latestEpisodeNum,
  client,
}) {
  try {
    const records = await base("collection").update(id, {
      latestEpisodeNum,
    });

    console.log(
      `✅ Updated anime episode number in Airtable "${title}": ${latestEpisodeNum}`
    );

    sendChannelMessage(
      client,
      "966631308245741598",
      `✅ Updated anime episode number in Airtable"${title}": ${latestEpisodeNum}`
    );

    return records.length !== 0;
  } catch (error) {
    console.error(
      `💥 Cannot update anime episode number in Airtable "${title}": \n\n${error}`
    );
    console.error(error);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      "966622664800215040",
      `💥 Cannot update anime episode number in Airtable "${title}": \n\n${error}`
    );
    return false;
  }
}
