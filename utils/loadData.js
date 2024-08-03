import { readFile } from "fs/promises";

export default async () => {

    const available = JSON.parse(await readFile("./data/available.json"));
    const unavailable = JSON.parse(await readFile("./data/unavailable.json"));

    console.log(`Loaded ${available.length} available and ${unavailable.length} unavailable saved clans.`);

    return { available, unavailable }

}