import dotenv from "dotenv";
dotenv.config();

const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN, AIRTABLE_KEY } = process.env;

const config = {
  CLIENT_ID,
  GUILD_ID,
  DISCORD_TOKEN,
  AIRTABLE_KEY,
};

export default config;
