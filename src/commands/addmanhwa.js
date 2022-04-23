import { SlashCommandBuilder } from "@discordjs/builders";
import getMangaTags from "./utils/getMangaTags.js";
import addManhwaToAirTable from "./lib/addManhwaToAirTable.js";

export const data = new SlashCommandBuilder()
  .setName("addmanhwa")
  .setDescription("➕ Add a new manhwa to your collection")
  .addStringOption((input) =>
    input.setName("name").setDescription("Name of the manhwa").setRequired(true)
  )
  .addBooleanOption((input) =>
    input
      .setName("important")
      .setDescription("Notify new chapters?")
      .setRequired(true)
  )
  .addStringOption((input) =>
    input
      .setName("mangadexurl")
      .setDescription("The URL of the manhwa's mangadex page")
      .setRequired(true)
  )
  .addStringOption((input) =>
    input.setName("batourl").setDescription("The URL of the manhwa's bato page")
  );

export async function execute(interaction, client) {
  const manhwaName = interaction.options.getString("name");
  const mangadexURL = interaction.options.getString("mangadexurl");
  const batoURL = interaction.options.getString("batourl");
  const isImportant = interaction.options.getBoolean("important");

  const tags = await getMangaTags(mangadexURL);

  const addManga = await addManhwaToAirTable({
    name: manhwaName,
    genres: tags,
    isImportant,
    mangadexURL,
    batoURL,
    client,
  });

  if (addManga) {
    let message = `✅ Successfully added ${manhwaName} to your collection!`;
    if (mangadexURL) {
      message += `\n\n${mangadexURL}`;
    }
    interaction.reply(message);
  } else {
    interaction.reply("❌ Failed to add the manhwa to your collection.");
  }
}
