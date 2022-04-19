import { SlashCommandBuilder } from "@discordjs/builders";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("🎱 Replies with pong");

export function execute(interaction, client) {
  console.log("🎱 pong");
  interaction.reply("🎱 pong");
}
