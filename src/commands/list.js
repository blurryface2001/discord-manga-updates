import { SlashCommandBuilder } from "@discordjs/builders";
import tags from "./data/tags.js";
import listManga from "./lib/listManga.js";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("📃 List all the mangas in the collection")
  .addStringOption((input) =>
    input
      .setName("genre")
      .setDescription("Specify the genre to list")
      .addChoices(Array.from(tags))
  );

export async function execute(interaction) {
  const tag = interaction.options.getString("genre");

  let message = "";

  const mangas = await listManga(tag);

  if (mangas.length === 0) {
    message = `🚫 No manga found from the genre: ${tag}`;
  } else {
    message = `📃 List of mangas from the genre:  ${tag}\n`;
    message += mangas
      .map((manga, idx) => `${idx + 1}. ${manga.name} - ${manga.url}`)
      .join("\n");
  }

  interaction.reply(message);
}
