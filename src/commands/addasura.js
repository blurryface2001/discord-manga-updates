import { SlashCommandBuilder } from "@discordjs/builders";
import addAsuraToAirTable from "./lib/addAsuraToAirTable.js";

export const data = new SlashCommandBuilder()
  .setName("addasura")
  .setDescription("➕ Add a new Asura manhwa to your collection")
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
      .setName("asuraurl")
      .setDescription("The URL of the Asura page")
      .setRequired(true)
  );

export async function execute(interaction, client) {
  const manhwaName = interaction.options.getString("name");
  const asuraURL = interaction.options.getString("asuraurl");
  const isImportant = interaction.options.getBoolean("important");

  const addAsura = await addAsuraToAirTable({
    name: manhwaName,
    url: asuraURL,
    isImportant,
    client,
  });

  if (addAsura) {
    let message = `✅ Successfully added ${manhwaName} to your collection!`;
    message += `\n\n${asuraURL}`;
    interaction.reply(message);
  } else {
    interaction.reply("❌ Failed to add the manhwa to your collection.");
  }
}
