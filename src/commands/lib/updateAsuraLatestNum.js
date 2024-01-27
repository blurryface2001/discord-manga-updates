import config from "../../config.js";
import Airtable from "airtable";
import sendChannelMessage from "../../sendChannelMessage.js";

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  "app32Vn9ScZ2IpA49"
);

export default async function updateAsuraLatestNum({
  id,
  title,
  latestChapterNum,
  client,
}) {
  try {
    const records = await base("collection").update(id, {
      latestChapterNum,
    });

    console.log(
      `✅ Updated asura chapter number in Airtable "${title}": ${latestChapterNum}`
    );

    sendChannelMessage(
      client,
      "966631308245741598",
      `✅ Updated asura chapter number in Airtable "${title}": ${latestChapterNum}`
    );

    return records.length !== 0;
  } catch (error) {
    console.error(
      `💥 Cannot update asura chapter number in Airtable "${title}": \n\n${error}`
    );
    console.error(error);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      "966622664800215040",
      `💥 Cannot update asura chapter number in Airtable "${title}": \n\n${error}`
    );
    return false;
  }
}
