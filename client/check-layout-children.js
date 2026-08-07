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

  const nodes = await page.evaluate(() => {
    const layoutWrapper = document.querySelector('.ml-72');
    if (!layoutWrapper) return null;
    
    // get immediate children of layoutWrapper
    const children = Array.from(layoutWrapper.children).map(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return {
            tag: el.tagName,
            className: el.className,
            y: rect.y,
            height: rect.height,
            position: style.position,
            display: style.display,
            marginTop: style.marginTop
        }
    });

    return {
        wrapper: {
            y: layoutWrapper.getBoundingClientRect().y,
            height: layoutWrapper.getBoundingClientRect().height,
            marginTop: window.getComputedStyle(layoutWrapper).marginTop,
            position: window.getComputedStyle(layoutWrapper).position,
            display: window.getComputedStyle(layoutWrapper).display
        },
        children
    };
  });

  console.log(JSON.stringify(nodes, null, 2));
  await browser.close();
})();
