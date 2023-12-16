import config from "../../config.js";
import fetchLatestAsuraChapterNum from "../utils/fetchLatestAsuraChapter.js";
import Airtable from "airtable";
import sendChannelMessage from "../../sendChannelMessage.js";

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  "app32Vn9ScZ2IpA49"
);

export default async function addAsuraToAirTable({
  name,
  url,
  isImportant,
  client,
}) {
  try {
    const { latestChapterNum } = await fetchLatestAsuraChapterNum(url);

    const records = await base("collection").create([
      {
        fields: {
          name,
          isImportant,
          latestChapterNum,
          url,
        },
      },
    ]);

    return records.length !== 0;
  } catch (error) {
    console.error(`💥 Cannot add manhwa to Airtable: \n\n${error}`);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      "966622664800215040",
      `💥 Cannot add manhwa to Airtable: \n\n${error}`
    );
    return false;
  }
}
