import dotenv from "dotenv";
dotenv.config();

const {
  CLIENT_ID,
  GUILD_ID,
  DISCORD_TOKEN,
  AIRTABLE_KEY,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
  MAX_RETRIES,
  MAX_PROXY_RETRIES
} = process.env;

const config = {
  CLIENT_ID,
  GUILD_ID,
  DISCORD_TOKEN,
  AIRTABLE_KEY,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
  MAX_RETRIES,
  MAX_PROXY_RETRIES
};

export default config;
