import dotenv from 'dotenv';
dotenv.config();

const {
  CLIENT_ID,
  GUILD_ID,
  DISCORD_TOKEN,
  AIRTABLE_KEY,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
  MAX_RETRIES,
  MAX_PROXY_RETRIES,
  BASEROW_KEY,
} = process.env;

const config = {
  CLIENT_ID,
  GUILD_ID,
  DISCORD_TOKEN,
  AIRTABLE_KEY,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
  MAX_RETRIES,
  MAX_PROXY_RETRIES,
  BASEROW_KEY,
};

export default config;
