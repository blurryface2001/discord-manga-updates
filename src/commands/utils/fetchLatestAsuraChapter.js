import { load } from 'cheerio';
import puppeteer from 'puppeteer-extra';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

export default async function fetchLatestAsuraChapter(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(false);
  const manhwaPage = await page.goto(url);
  try {
    await page.waitForXPath('//*[@id="chapterlist"]', { timeout: 10000 });
  } catch (e) {
    // send the error along with page status
    throw new Error(`Error: ${e} \n\nPage status: ${manhwaPage.status()}`);
  }
  const html = await page.content();
  await page.close();
  await browser.close();

  const $ = load(html);
  const chapterList = $('#chapterlist');
  const latestChapter = chapterList.children().find('li:first');
  const latestChapterURL = latestChapter.find('a').attr('href');
  const latestChapterNum = Number(
    latestChapter.find('.chapternum').text().trim().split(' ')[1]
  );
  return { latestChapterURL, latestChapterNum };
}
