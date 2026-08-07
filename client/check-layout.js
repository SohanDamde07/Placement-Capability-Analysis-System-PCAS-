import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  const layoutInfo = await page.evaluate(() => {
    const layoutWrapper = document.querySelector('.ml-72');
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    
    return {
      layoutWrapper: layoutWrapper ? { y: layoutWrapper.getBoundingClientRect().y, height: layoutWrapper.getBoundingClientRect().height } : null,
      header: header ? { y: header.getBoundingClientRect().y } : null,
      main: main ? { y: main.getBoundingClientRect().y } : null,
      gap: (main && header) ? (main.getBoundingClientRect().y - header.getBoundingClientRect().bottom) : null
    };
  });
  
  console.log('Light Mode:', JSON.stringify(layoutInfo, null, 2));

  const toggleBtn = await page.$('button[title="Switch to Dark Mode"]');
  if (toggleBtn) {
    await toggleBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    
    const darkInfo = await page.evaluate(() => {
      const layoutWrapper = document.querySelector('.ml-72');
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      
      return {
        layoutWrapper: layoutWrapper ? { y: layoutWrapper.getBoundingClientRect().y, height: layoutWrapper.getBoundingClientRect().height } : null,
        header: header ? { y: header.getBoundingClientRect().y } : null,
        main: main ? { y: main.getBoundingClientRect().y } : null,
        gap: (main && header) ? (main.getBoundingClientRect().y - header.getBoundingClientRect().bottom) : null
      };
    });
    console.log('Dark Mode:', JSON.stringify(darkInfo, null, 2));
  }

  await browser.close();
})();
