import dotenv from "dotenv";
dotenv.config();

const {
  CLIENT_ID,
  GUILD_ID,
  DISCORD_TOKEN,
  AIRTABLE_KEY,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
} = process.env;

const config = {
  CLIENT_ID,
  GUILD_ID,
  DISCORD_TOKEN,
  AIRTABLE_KEY,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
};

export default config;
