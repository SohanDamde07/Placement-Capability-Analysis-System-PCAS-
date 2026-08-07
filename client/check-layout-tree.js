import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  // Switch to dark mode
  const toggleBtn = await page.$('button[title="Switch to Dark Mode"]');
  if (toggleBtn) {
    await toggleBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  const domDump = await page.evaluate(() => {
    // recursively dump the DOM and their rects
    function dumpElement(el) {
      if (!el || el.nodeType !== 1) return null;
      // Skip very deep elements to save space, stop after <main> inside AppLayout
      
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      
      const info = {
        tag: el.tagName,
        className: el.className,
        y: rect.y,
        height: rect.height,
        position: style.position,
        display: style.display,
        marginTop: style.marginTop,
        children: []
      };
      
      if (el.tagName === 'ASIDE' || el.tagName === 'HEADER' || el.tagName === 'MAIN' || el.id === 'root') {
          // just structural tags
      }

      for (let i = 0; i < el.children.length; i++) {
        info.children.push(dumpElement(el.children[i]));
      }

      return info;
    }
    
    return dumpElement(document.body);
  });

  console.log(JSON.stringify(domDump, (key, value) => {
      if (key === 'children' && Array.isArray(value)) {
          // prune empty or irrelevant deep children
          return value.slice(0, 5); 
      }
      return value;
  }, 2));

  await browser.close();
})();
