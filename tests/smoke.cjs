const { chromium } = require('playwright');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  try {
    await page.goto('file://' + path.resolve('index.html'));
    await page.getByText('AVAILABLE MODULES · 3').waitFor();

    await page.getByRole('button', { name: /Careless driving · s 45/ }).click();
    await page.getByText('Road Traffic Act 1961 (SA)').waitFor();

    await page.locator('#term').fill('reasonable consideration');
    await page.getByText(/match.*highlighted in the statutory wording/i).waitFor();

    if (errors.length) throw new Error('Browser JavaScript errors: ' + errors.join(' | '));
    console.log('PASS: app renders, Road Traffic module opens, and statutory search returns results.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
