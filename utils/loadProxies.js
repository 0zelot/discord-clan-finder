import { fetchers } from "proxy-master";

export default async () => {

    console.log("Loading proxies...");

    const fetcher = fetchers.combine({
        fetchers: [      
            fetchers.file({ path: "./proxies.txt" }),
        ]
    });
      
    await fetcher.fetch();
    
    fetcher.refetchOnInterval(10_000);

    return fetcher;

}