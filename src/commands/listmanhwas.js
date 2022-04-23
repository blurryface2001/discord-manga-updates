import { SlashCommandBuilder } from "@discordjs/builders";
import sendChannelMessage from "../sendChannelMessage.js";
import tags from "./data/tags.js";
import fetchManhwas from "./lib/fetchManhwas.js";

export const data = new SlashCommandBuilder()
  .setName("listmanhwas")
  .setDescription("📃 List all the manhwas in the collection")
  .addStringOption((input) =>
    input
      .setName("genre")
      .setDescription("Specify the genre to list")
      .addChoices(Array.from(tags))
  );

function formatMessage(manhwas) {
  const messages = [];

  let message = "";

  manhwas.forEach((manhwa, idx) => {
    message += `${idx + 1}. ${manhwa.name}\n Managedx: <${
      manhwa.mangadexURL
    }>\n Bato: <${manhwa.batoURL}> \n\n`;

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

  const manhwas = await fetchManhwas(tag);

  // Discord doesn't allow messages with more than 2000 characters
  // so we need to split the messages into multiple messages
  const formattedMangas = formatMessage(manhwas);

  if (manhwas.length === 0) {
    interaction.reply(
      `🚫 No manhwa found from the genre: ${tag !== null ? tag : "all"}`
    );
  } else {
    interaction.reply(
      `📃 List of manhwas from the genre: ${tag !== null ? tag : "all"}`
    );
  }

  formattedMangas.forEach((message) => {
    sendChannelMessage(client, interaction.channel.id, message);
  });
}
