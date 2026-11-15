const base = 'https://scottyypb.github.io/Offence-IQ/';

(async () => {
  let lastError = 'The deployed page has not yet published the expected build.';
  for (let attempt = 1; attempt <= 24; attempt++) {
    try {
      const suffix = '?self-check=' + Date.now();
      const [pageResponse, swResponse] = await Promise.all([
        fetch(base + suffix, { cache: 'no-store' }),
        fetch(base + 'sw.js' + suffix, { cache: 'no-store' })
      ]);
      if (!pageResponse.ok || !swResponse.ok) {
        throw new Error('HTTP status: page ' + pageResponse.status + ', service worker ' + swResponse.status);
      }
      const [html, sw] = await Promise.all([pageResponse.text(), swResponse.text()]);
      const checks = [
        ['three-module home copy', html.includes('all four modules')],
        ['15-card progress display', html.includes('id="mastery">0/20')],
        ['third module navigation', html.includes("selectModule(\\'traffic\\')")],
        ['fourth module navigation', html.includes("selectModule(\\'dui\\')")],
        ['v13 service worker cache', sw.includes('offence-iq-v14')]
      ];
      const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);
      if (!failed.length) {
        console.log('PASS: live GitHub Pages deployment serves the expected app and service worker.');
        process.exit(0);
      }
      lastError = 'Not deployed yet or stale content: ' + failed.join(', ');
    } catch (error) {
      lastError = error.message;
    }
    console.log('Live deployment check ' + attempt + '/24: ' + lastError);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  throw new Error('Live deployment verification failed: ' + lastError);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
