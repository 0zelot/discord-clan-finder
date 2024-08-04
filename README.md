# discord-clan-finder

A simple Discord Clan finder tool. Learn more about Discord Clans [here](https://support.discord.com/hc/en-us/articles/23187611406999-Guilds-FAQ) or search for `discord clans` on youtube.

![](https://i.imgur.com/7VRZhWa.png)

### How it works

Clans are currently available as an experiment. Discord API allows you to see a list of clans, but to apply you need an invitation. This tool checks for clans by guild ID using guild widget endpoint and tries to get an invite link if available.

We use proxies to bypass the widget API rate limit.

### Requirements

* Node.js 18+

### Setup

1. Clone this repository.

2. Install dependencies - `npm install`.

3. Set up `config.json`. You need Discord Account token (at your own risk - don't use account that you cannot afford to lose) and webhook url (for sending invites). You can also specify the maximum members that the clan can have (the member limit on servers with the clan feature is 200, the greatest chance of your application being approved is in smaller clans, those with more than ~185 members rarely accept new ones, but this isn't a rule).

4. Paste HTTP proxies to `proxies.txt`. You can find some [here](https://github.com/TheSpeedX/PROXY-List/blob/master/http.txt), but first check them [here](https://infatica.io/proxy-checker/) and put only ones that work. 20-30 working proxies should be enough.

5. Run `node index.js`.

6. Found clans will be sent via webhook and saved in `./data/available.json`.

