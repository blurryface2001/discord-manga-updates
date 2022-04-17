import config from "../../config.js";
import Airtable from "airtable";

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  "appkV9F4scpEvGZEM"
);

export default async function addMangaToAirTable({
  name,
  genres,
  url,
  isImportant,
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
    console.error(error);
    return false;
  }
}
