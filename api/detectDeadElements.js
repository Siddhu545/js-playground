import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      name: 'detectDeadElements',
      description: 'Detect non-visible (dead) DOM elements on a webpage',
      input: {
        type: 'string',
        description: 'URL of the page to analyze',
        example: 'https://example.com'
      },
      output: {
        type: 'array',
        description: 'List of hidden elements with selector and reason',
        example: [
          {
            tag: 'div',
            selector: '#popup',
            reason: 'display: none'
          }
        ]
      }
    });
  }

  if (req.method === 'POST') {
    const { input: url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid input URL.' });
    }

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const hiddenElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('body *'));
      return elements
        .map((el) => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          const isHidden =
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0' ||
            el.hasAttribute('aria-hidden') ||
            rect.bottom < 0 ||
            rect.top > window.innerHeight;

          if (isHidden) {
            return {
              tag: el.tagName.toLowerCase(),
              selector: el.id
                ? `#${el.id}`
                : el.className
                ? `.${el.className.split(' ').join('.')}`
                : el.tagName.toLowerCase(),
              reason:
                style.display === 'none'
                  ? 'display: none'
                  : style.visibility === 'hidden'
                  ? 'visibility: hidden'
                  : style.opacity === '0'
                  ? 'opacity: 0'
                  : el.hasAttribute('aria-hidden')
                  ? 'aria-hidden'
                  : 'element is off-screen'
            };
          }
        })
        .filter(Boolean);
    });

    await browser.close();
    return res.status(200).json({ output: hiddenElements });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
