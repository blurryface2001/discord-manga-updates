import axios from "axios";

export default async function getMangaTags(url) {
  const id = url.split("/")[4];
  const data = await (
    await axios.get(`https://api.mangadex.org/manga/${id}`)
  ).data;

  const {
    data: {
      attributes: { tags },
    },
  } = data;

  return tags.map((tag) => tag.attributes.name.en);
}
