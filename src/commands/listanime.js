import { SlashCommandBuilder } from "@discordjs/builders";
import sendChannelMessage from "../sendChannelMessage.js";
import fetchAsuraManhwas from "./lib/fetchAsuraManhwas.js";
import fetchAnime from "./lib/fetchAnime.js";

export const data = new SlashCommandBuilder()
  .setName("listanime")
  .setDescription("📃 List all the animes");

function formatMessage(animes) {
  const messages = [];

  let message = "";

  animes.forEach((anime, idx) => {
    message += `${idx + 1}. ${anime.name}\n URL: <${
      anime.url
    }> \n Latest episode: ${anime.latestEpisodeNum}`;

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
  let animes;
  try {
    animes = await fetchAnime();
  } catch (err) {
    animes = [];

    sendChannelMessage(
      client,
      "966631308245741598",
      `💥 Couldn't fetch animes: \n${err}`
    );
  }

  // Discord doesn't allow messages with more than 2000 characters
  // so we need to split the messages into multiple messages
  const formattedManhwas = formatMessage(animes);

  if (animes.length === 0) {
    interaction.reply(`🚫 No anime found`);
  } else {
    interaction.reply(`📃 List of animes`);
  }

  formattedManhwas.forEach((message) => {
    sendChannelMessage(client, interaction.channel.id, message);
  });
}
