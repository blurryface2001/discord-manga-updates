export default async function sendChannelMessage(client, channelId, message) {
  client.channels.cache.get(channelId).send(message);
}
