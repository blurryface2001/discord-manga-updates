import { SlashCommandBuilder } from "@discordjs/builders";
import sendChannelMessage from "../sendChannelMessage.js";
import fetchAsuraManhwas from "./lib/fetchAsuraManhwas.js";

export const data = new SlashCommandBuilder()
  .setName("listasura")
  .setDescription("📃 List all the asura manhwas");

function formatMessage(manhwas) {
  const messages = [];

  let message = "";

  manhwas.forEach((manhwa, idx) => {
    message += `${idx + 1}. ${manhwa.name}\n URL: <${
      manhwa.url
    }> \n Latest chapter: ${manhwa.latestChapterNum}`;

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
  let manhwas;
  try {
    manhwas = await fetchAsuraManhwas();
  } catch (err) {
    manhwas = [];

    sendChannelMessage(
      client,
      "966631308245741598",
      `💥 Couldn't fetch asura manhwas: \n${err}`
    );
  }

  // Discord doesn't allow messages with more than 2000 characters
  // so we need to split the messages into multiple messages
  const formattedManhwas = formatMessage(manhwas);

  if (manhwas.length === 0) {
    interaction.reply(`🚫 No manhwa found`);
  } else {
    interaction.reply(`📃 List of manhwas in Asura`);
  }

  formattedManhwas.forEach((message) => {
    sendChannelMessage(client, interaction.channel.id, message);
  });
}
