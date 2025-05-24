// ...existing imports
import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

// --- Exported handler function ---
export const detectDeadElements = async (req, res) => {
  const { input: url } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).send({ error: 'Invalid or missing URL.' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const result = await page.evaluate(() => {
      const isOffscreen = (el) => {
        const rect = el.getBoundingClientRect();
        return (
          rect.bottom < 0 ||
          rect.right < 0 ||
          rect.top > window.innerHeight ||
          rect.left > window.innerWidth
        );
      };

      const hiddenElements = [];

      const elements = document.querySelectorAll('body *');
      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const selector =
          el.id
            ? `#${el.id}`
            : el.className && typeof el.className === 'string'
            ? `.${el.className.trim().split(/\s+/).join('.')}`
            : el.tagName.toLowerCase();

        if (style.display === 'none') {
          hiddenElements.push({ selector, reason: 'display: none' });
        } else if (style.visibility === 'hidden') {
          hiddenElements.push({ selector, reason: 'visibility: hidden' });
        } else if (parseFloat(style.opacity) === 0) {
          hiddenElements.push({ selector, reason: 'opacity: 0' });
        } else if (isOffscreen(el)) {
          hiddenElements.push({ selector, reason: 'element is off-screen' });
        } else if (el.getAttribute('aria-hidden') === 'true') {
          hiddenElements.push({ selector, reason: 'aria-hidden: true' });
        }
      });

      return hiddenElements;
    });

    await browser.close();
    res.send({ output: result });
  } catch (error) {
    console.error('Error in detectDeadElements:', error);
    res.status(500).send({ error: 'Failed to analyze the page' });
  }
};

// --- Route setup (still needed for real server)
app.get('/functions/detectDeadElements', (req, res) => {
  res.send({
    name: "detectDeadElements",
    description: "Returns DOM elements on a webpage that are hidden (via CSS or ARIA). Useful for audits, cleanup, and accessibility.",
    input: {
      type: "string",
      description: "The full URL of the page you want to check.",
      example: "https://example.com"
    },
    output: {
      type: "array",
      description: "List of selectors and reasons why elements are considered hidden or dead.",
      example: [
        { selector: "#popup", reason: "display: none" },
        { selector: ".offscreen", reason: "element is off-screen" },
        { selector: "SPAN.hidden", reason: "aria-hidden: true" }
      ]
    }
  });
});

app.post('/functions/detectDeadElements', detectDeadElements);

app.listen(PORT, () => {
  console.log(`detectDeadElements listening at http://localhost:${PORT}`);
});
