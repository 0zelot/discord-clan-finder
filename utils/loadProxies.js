import { fetchers } from "proxy-master";

export default async () => {

    console.log("Loading proxies...");

    const fetcher = fetchers.combine({
        fetchers: [      
            fetchers.file({ path: "./proxies.txt" }),
        ]
    });
      
    await fetcher.fetch();

    if(!fetcher.random()) {
        console.error("Could not found any proxies in proxies.txt or all are dead");
        process.exit();
    }
    
    fetcher.refetchOnInterval(10_000);

    return fetcher;

}