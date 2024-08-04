import { ProxyAgent } from "undici";

import { writeFile } from "fs/promises";
import { setTimeout as wait } from "node:timers/promises";

import loadProxies from "./utils/loadProxies.js";
import loadData from "./utils/loadData.js";
import filterClans from "./utils/filterClans.js";
import saveUnavailableClans from "./utils/saveUnavailableClans.js";

import config from "./config.json" assert { type: "json" };

(async () => {

    const fetcher = await loadProxies();

    let ratelimit = 0;

    const { available, unavailable } = await loadData();

    const res = await fetch("https://discord.com/api/v9/discovery/games/all", {
        headers: {
            "Authorization": config.token
        }
    });

    const body = await res.json();
    let clans = body.clans;

    if(!clans) return console.error("Could not found any clans!", body);

    console.log(`Got ${clans.length} clans...`);

    clans = await filterClans(clans, unavailable, available);

    console.log("Starting checking...");

    setInterval(async () => await saveUnavailableClans(unavailable), config.save_interval * 1000);

    for(const clan of clans) {

        await wait(config.cooldown * 1000);

        const proxy = fetcher.random();
        const displayProxy = `${proxy[0].host}:${proxy[0].port}`;

        try {

            const clanData = await fetch(`https://discord.com/api/guilds/${clan.id}/widget.json`, {
                dispatcher: new ProxyAgent(`http://${displayProxy}`)
            });
    
            if(clanData.status == 403) {
                console.log(`[${clan.id}] [${clan.tag}] [${displayProxy}] The widget feature is disabled`);
                unavailable.push(clan.id);
                continue;
            }

            else if(clanData.status == 429) {
                ratelimit++;
                console.log(`[${clan.id}] [${clan.tag}] [${displayProxy}] Too many requests (${ratelimit}/${config.max_ratelimit_attempts})`);
                if(ratelimit >= config.max_ratelimit_attempts) return process.exit();
                continue;
            }
    
            else if(clanData.status !== 200) {
                console.log(`[${clan.id}] [${clan.tag}] [${displayProxy}] Could not fetch widget data - ${clanData.status}`, clanData);
                continue;
            };

            if(ratelimit > 0) ratelimit = 0;
    
            const clanBody = await clanData.json();
    
            if(!clanBody.instant_invite) {
                console.log(`[${clan.id}] [${clan.tag}] [${displayProxy}] Could not found public invite`);
                unavailable.push(clan.id);
                continue;
            }

            const saved = available.find(item => item.id == clan.id);

            if(saved && saved.messageId) {

                await fetch(`${config.webhook}/messages/${saved.messageId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        content: `# [${clan.tag}] ${clan.name}\n\n_${clan.description.slice(0, 1600)}_\n\n${clanBody.instant_invite}\n\n-# ${clan.id}`
                    })
                });

                console.log(`[${clan.id}] [${clan.tag}] [${displayProxy}] Updated old clan [${clan.name}] - ${clanBody.instant_invite}`);

                continue;

            }
    
            const webhook = await fetch(`${config.webhook}?wait=true`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: `# [${clan.tag}] ${clan.name}\n\n_${clan.description.slice(0, 1600)}_\n\n${clanBody.instant_invite}\n\n-# ${clan.id}`
                })
            });

            const webhookData = await webhook.json();

            available.push({ id: clan.id, name: clan.name, tag: clan.tag, invite: clanBody.instant_invite, messageId: webhookData.id, foundAt: Date.now() });
            await writeFile("./data/available.json", JSON.stringify(available, null, 2));
    
            console.log(`[${clan.id}] [${clan.tag}] [${displayProxy}] Found new clan [${clan.name}] - ${clanBody.instant_invite}`);

        } catch(err) {
            console.log(`[${clan.id}] [${clan.tag}] [${displayProxy}] An unknown error occured:`, err.message);
        }

    }

    await saveUnavailableClans(unavailable);

    process.exit();

})();