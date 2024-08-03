import { writeFile } from "fs/promises";

export default async (unavailable) => {

    await writeFile("./data/unavailable.json", JSON.stringify(unavailable, null, 2));
    
    console.log("Results have been saved.");

}