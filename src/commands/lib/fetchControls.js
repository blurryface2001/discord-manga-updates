import config from '../../config.js';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: config.AIRTABLE_KEY }).base(
  'appwmWHs7HvwwZAnH'
);

export default async function fetchControls() {
  return new Promise((resolve, reject) => {
    const media = {};

    base('collection')
      .select({
        view: 'Grid view',
        fields: ['media', 'shouldFetch'],
      })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.

          records.forEach(function (record) {
            media[record.get('media')] = Boolean(record.get('shouldFetch'));
          });

          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
          } else {
            resolve(media);
          }
        }
      );
  });
}
