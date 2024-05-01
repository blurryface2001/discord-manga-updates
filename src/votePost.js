import axios from 'axios';
import sendChannelMessage from './sendChannelMessage.js';

const headers = {
  'Content-Type': 'application/json',
};

export default async function votePost(reaction, client) {
  if (reaction.message.channelId !== '965269327580381304') return;
  const { name } = reaction.emoji;
  if (name !== '👍' && name !== '👎') return;

  const { content } = reaction.message;

  try {
    const title = content
      .match(/(?<=New (chapter|art|news|post) of)(.*)(?=is available!)/)[0]
      .trim();
    const postUrl = content.match(/(?<=Discussion: <)(.*)(?=>)/)[0].trim();
    const id = postUrl
      .split('https://reddit.com/r/manga/comments/')[1]
      .split('/')[0];

    console.log('🔃 Voting for: ', title);
    sendChannelMessage(client, '966631308245741598', `🔃 Voting for: ${title}`);

    const urls = JSON.parse(process.env.URLS);
    const url = urls[Math.floor(Math.random() * urls.length)];

    console.log('🔃 Using this url: ', url.name, url.url);

    if (name === '👍') {
      await axios.get(url.url + `/upvote/${id}`, {
        headers,
        timeout: 300000, // wait for atleast 5mins
      });

      console.log(`👍 ${title}`);
      sendChannelMessage(
        client,
        '966631308245741598',
        `⬆️ Upvoted the manga: ${title}! \n\n${url}`
      );
    } else {
      await axios.get(url.url + `/downvote/${id}`, {
        headers,
        timeout: 300000, // wait for atleast 5mins
      });

      console.log(`👎 ${title}`);
      sendChannelMessage(
        client,
        '966631308245741598',
        `⬇️ Downvoted the manga: ${title}! \n\n${url}`
      );
    }
  } catch (error) {
    console.error(error);

    // Send error to #error-logs channel
    sendChannelMessage(
      client,
      '966622664800215040',
      '💥 Error while voting! \n\n' + error
    );
  }
}
