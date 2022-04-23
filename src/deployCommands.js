import config from "./config.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import * as commandsModule from "./commands/index.js";

const commands = [];

Object.values(commandsModule).forEach((command) => commands.push(command.data));

const rest = new REST({ version: "9" }).setToken(config.DISCORD_TOKEN);

rest
  .put(Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), {
    body: commands,
  })
  .then(() => console.log("✅ Successfully registered application commands."))
  .catch(console.error);
