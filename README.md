# Automatic Acknowledge Incident Bot

Having to acknowledge incident manually is painful. 
Let the bot do the job.
To fight against bot, we need a bot.

## How to Use
The biggest problem right now is Google has a 2FA activated for user's account. Therefore, you need to pass the 2FA first before running the bot smoothly.

Steps:
* Sign in in normal browser, until you reach the choose Google Account Page
* Inspect element on your wanted to use account and copy the selector value
* Replace the `CHOOSE_ACCOUNT_SELECTOR` constant on `claim_incident.js`
* Sign in for the bot by running
    ```shell script
    node google_sign_in.js
    ```
* Pass the 2FA manually, you've got 10 secs
* Claim incident by running
    ```shell script
    node claim_incident.js
    ```
