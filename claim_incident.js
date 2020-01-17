const puppeteer = require("puppeteer-extra");
const moment = require("moment");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const credential = require("./credential");
const config = require("./config");

(async () => {
  try {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      userDataDir: "./user_data"
    });

    const page = await browser.newPage();
    await page.goto(config.URL);

    const navigationPromise = page.waitForNavigation();

    // clicks on the login button
    const SIGN_IN_SELECTOR =
      "body > div > div > div > form:nth-child(3) > button";
    await page.click(SIGN_IN_SELECTOR);

    // wait for the google oauth page to open
    const chooseAccountTarget = await browser.waitForTarget(target => {
      return (
        target
          .url()
          .indexOf(
            "https://accounts.google.com/signin/oauth/oauthchooseaccount"
          ) !== -1
      );
    });
    const chooseAccountPage = await chooseAccountTarget.page();
    await chooseAccountPage.click(credential.CHOOSE_ACCOUNT_SELECTOR);
    await navigationPromise;

    await chooseAccountPage.waitFor(5000);

    // go to datadog page
    const dateQueryString = `${moment().format("L")}%2012:00%20AM`;
    let targetURL = config.URL + config.DATADOG + dateQueryString;
    await chooseAccountPage.goto(targetURL);
    await claimIncident(browser);

    // go to grafana page
    targetURL = config.URL + config.GRAFANA + dateQueryString;
    await chooseAccountPage.goto(targetURL);
    await claimIncident(browser);

    await chooseAccountPage.waitFor(5000);

    await browser.close();
  } catch (e) {
    console.log(e);
  }
})();

async function claimIncident(browser) {
  const zordonTarget = await browser.waitForTarget(target => {
    return target.url().indexOf("http://zordon.tokopedia.net/incidents") !== -1;
  });

  console.log(zordonTarget.url());

  const zordonPage = await zordonTarget.page();
  await zordonPage.waitFor(2000);

  const incidentButtons = await zordonPage.$x(
    "//button[contains(., 'Claim Incident')]"
  );

  console.log("Total Unclaimed Incident: " + incidentButtons.length);

  if (incidentButtons.length > 0) {
    await incidentButtons.map(async button => {
      await button.click();
      await zordonPage.waitFor(1000);
      console.log("Incident Claimed");
    });
  }
}
