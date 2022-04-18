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

function formatMessage(mangas) {
  const messages = [];

  let message = "";

  mangas.forEach((manga, idx) => {
    message += `${idx + 1}. ${manga.name} - ${manga.url}\n`;
    if (message.length > 1700) {
      messages.push(message);
      message = "";
    }
  });

  if (message.length > 0) {
    messages.push(message);
  }

  return messages;
}

export async function execute(interaction, client) {
  const tag = interaction.options.getString("genre");

  const mangas = await listManga(tag);

  // Discord doesn't allow messages with more than 2000 characters
  // so we need to split the messages into multiple messages
  const formattedMangas = formatMessage(mangas);

  if (mangas.length === 0) {
    interaction.reply(
      `🚫 No manga found from the genre: ${tag !== null ? tag : "all"}`
    );
  } else {
    interaction.reply(
      `📃 List of mangas from the genre: ${tag !== null ? tag : "all"}`
    );
  }

  formattedMangas.forEach((message) => {
    client.channels.cache.get(interaction.channel.id).send(message);
  });
}
