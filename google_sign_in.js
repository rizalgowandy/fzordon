const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const credential = require("./credential");
const config = require("./config");

(async () => {
  try {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true
    });

    const page = await browser.newPage();
    await page.goto(config.URL);
    const navigationPromise = page.waitForNavigation();

    // clicks on the login button
    const SIGN_IN_SELECTOR =
      "body > div > div > div > form:nth-child(3) > button";
    await page.click(SIGN_IN_SELECTOR);

    // wait for the google oauth page to open
    const googleOAuthTarget = await browser.waitForTarget(target => {
      return (
        target
          .url()
          .indexOf("https://accounts.google.com/signin/oauth/identifier") !== -1
      );
    });
    const googleOAuthPage = await googleOAuthTarget.page();
    await googleOAuthPage.waitForSelector("#identifierId");
    await googleOAuthPage.type("#identifierId", credential.EMAIL, {
      delay: 5
    });
    await googleOAuthPage.click("#identifierNext");
    await googleOAuthPage.waitForSelector('input[type="password"]', {
      visible: true
    });
    await googleOAuthPage.type('input[type="password"]', credential.PASSWORD);
    await googleOAuthPage.waitForSelector("#passwordNext", { visible: true });
    await googleOAuthPage.click("#passwordNext");
    await navigationPromise;

    await page.waitFor(10000);

    await browser.close();
  } catch (e) {
    console.log(e);
  }
})();
