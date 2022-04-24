import { SlashCommandBuilder } from "@discordjs/builders";
import sendChannelMessage from "../sendChannelMessage.js";
import tags from "./data/tags.js";
import fetchMangas from "./lib/fetchMangas.js";

export const data = new SlashCommandBuilder()
  .setName("listmangas")
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
    message += `${idx + 1}. ${manga.name} - <${manga.url}>\n\n`;

    // Split messages before they exceed 2000 characters
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

  let mangas;
  try {
    mangas = await fetchMangas(tag);
  } catch (err) {
    console.error(`💥 Cannot fetch mangas from Airtable: \n\n${error}`);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      "966622664800215040",
      `💥 Cannot fetch mangas from Airtable: \n\n${error}`
    );
  }

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
    sendChannelMessage(client, interaction.channel.id, message);
  });
}
