import config from "../config.json" assert { type: "json" };

export default async (clans, unavailable, available) => {

    if(config.max_members) {
        clans = clans.filter(item => (item.member_count <= config.max_members));
        console.log(`Got ${clans.length} clans... (clans up to ${config.max_members} members)`);
    }

    clans = clans.filter(item => !unavailable.includes(item.id));
    console.log(`Got ${clans.length} clans... (ignored already checked clans)`);

    clans = clans.filter(item => available.find(a => a.id == item.id))
    console.log(clans.length)
    
    return clans;

}