import { SlashCommandBuilder } from "@discordjs/builders";
import getMangaTags from "./utils/getMangaTags.js";
import addMangaToAirTable from "./lib/addMangaToAirTable.js";

export const data = new SlashCommandBuilder()
  .setName("addmanga")
  .setDescription("➕ Add a new manga to your collection")
  .addStringOption((input) =>
    input.setName("name").setDescription("Name of the manga").setRequired(true)
  )
  .addBooleanOption((input) =>
    input
      .setName("important")
      .setDescription("Notify new chapters?")
      .setRequired(true)
  )
  .addStringOption((input) =>
    input
      .setName("url")
      .setDescription("(Optional) The URL of the manga's page")
  )
  .addStringOption((input) =>
    input
      .setName("genre")
      .setDescription("Genre of the manga")
      .addChoice("Isekai", "Isekai")
      .addChoice("Romance", "Romance")
      .addChoice("Fantasy", "Fantasy")
      .addChoice("Otome", "Otome")
  );

export async function execute(interaction, client) {
  const mangaName = interaction.options.getString("name");
  const mangaGenre = interaction.options.getString("genre");
  const mangaUrl = interaction.options.getString("url");
  const isImportant = interaction.options.getBoolean("important");

  let tags;
  if (mangaUrl) {
    tags = await getMangaTags(mangaUrl);
    if (mangaGenre !== null) {
      tags = [...tags, mangaGenre];
    }
  } else if (mangaGenre !== null) {
    tags = [mangaGenre];
  } else {
    tags = [];
  }

  const addManga = await addMangaToAirTable({
    name: mangaName,
    genres: tags,
    url: mangaUrl,
    isImportant,
    client,
  });

  if (addManga) {
    let message = `✅ Successfully added ${mangaName} to your collection!`;
    if (mangaUrl) {
      message += `\n\n${mangaUrl}`;
    }
    interaction.reply(message);
  } else {
    interaction.reply("❌ Failed to add the manga to your collection.");
  }
}
