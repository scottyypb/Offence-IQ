const { chromium } = require('playwright');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  try {
    await page.goto('file://' + path.resolve('index.html'));
    await page.getByText('AVAILABLE MODULES · 9').waitFor();

    const modules = [
      { button: /Assault · s 20/, act: 'Criminal Law Consolidation Act 1935 (SA)', term: 'intentionally applies force' },
      { button: /Disorderly\/offensive conduct · s 7/, act: 'Summary Offences Act 1953 (SA)', term: 'public place' },
      { button: /Careless driving · s 45/, act: 'Road Traffic Act 1961 (SA)', term: 'reasonable consideration' },
      { button: /Driving under the influence · s 47/, act: 'Road Traffic Act 1961 (SA)', term: 'incapable of exercising effective control' },
      { button: /Prescribed concentration of alcohol · s 47B/, act: 'Road Traffic Act 1961 (SA)', term: 'category 1 offence' },
      { button: /Prescribed drug driving · s 47BA/, act: 'Road Traffic Act 1961 (SA)', term: 'prescribed drug' },
      { button: /Refusing breath test · s 47E\(3\)/, act: 'Road Traffic Act 1961 (SA)', term: 'exhale into the apparatus' },
      { button: /Reckless and dangerous driving · s 46/, act: 'Road Traffic Act 1961 (SA)', term: 'dangerous to any person' },
      { button: /Failing to stop and assist · s 43/, act: 'Road Traffic Act 1961 (SA)', term: 'give all possible assistance' }
    ];

    for (const module of modules) {
      await page.getByRole('button', { name: module.button }).click();
      await page.getByText(module.act, { exact: true }).first().waitFor();
      await page.locator('#term').fill(module.term);
      await page.getByText(/match.*highlighted in the statutory wording/i).waitFor();
      const result = page.locator('#found button[data-target]').first();
      await result.waitFor();
      await result.click();
    }

    await page.getByRole('button', { name: 'Flashcards' }).click();
    await page.getByRole('button', { name: /Reveal answer/ }).click();
    await page.getByRole('button', { name: 'Mark mastered' }).click();
    await page.getByText(/Marked mastered/).waitFor();

    await page.getByRole('button', { name: 'Knowledge test' }).click();
    await page.getByRole('button', { name: /Level 1 · Recognise the offence/ }).click();
    await page.locator('.answer').first().click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.locator('.feedback').waitFor();
    await page.getByRole('button', { name: 'Change test level' }).click();
    await page.getByRole('button', { name: /Level 2 · Recall key elements/ }).click();
    await page.locator('#recallInput').fill('I can recall the key statutory elements and the important words.');
    await page.getByRole('button', { name: 'Reveal key points' }).click();
    await page.getByRole('button', { name: 'I recalled the key points' }).click();
    await page.getByRole('button', { name: 'Change test level' }).click();
    await page.getByRole('button', { name: /Level 3 · Apply the legislation/ }).click();
    await page.locator('.answer').first().click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.locator('.feedback').waitFor();

    await page.getByRole('button', { name: 'Progress' }).click();
    await page.getByText('Progress overview').waitFor();
    await page.locator('.stat').count().then(count => { if (count < 4) throw new Error('Progress stats did not render'); });

    if (errors.length) throw new Error('Browser JavaScript errors: ' + errors.join(' | '));
    console.log('PASS: mobile layout renders; all nine modules open; search returns and jumps to matches; flashcard mastery saves; recognition, free-recall and application tests work; progress updates; no uncaught JavaScript errors.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
