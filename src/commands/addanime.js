import { SlashCommandBuilder } from "@discordjs/builders";
import addAnimeToAirTable from "./lib/addAnimeToAirTable.js";

export const data = new SlashCommandBuilder()
  .setName("addanime")
  .setDescription("➕ Add a new anime to your collection")
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
      .setName("animeaurl")
      .setDescription("The URL of the anime page")
      .setRequired(true)
  );

export async function execute(interaction, client) {
  await interaction.deferReply();
  const animeName = interaction.options.getString("name");
  const animeaurlURL = interaction.options.getString("animeaurl");
  const isImportant = interaction.options.getBoolean("important");

  const addAnime = await addAnimeToAirTable({
    name: animeName,
    url: animeaurlURL,
    isImportant,
    client,
  });

  if (addAnime) {
    let message = `✅ Successfully added ${animeName} to your collection!`;
    message += `\n\n${animeaurlURL}`;
    await interaction.editReply(message);
  } else {
    await interaction.editReply("❌ Failed to add the anime to your collection.");
  }
}
