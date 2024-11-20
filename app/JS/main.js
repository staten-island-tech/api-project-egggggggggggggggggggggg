import '../CSS/style.css';
const apiKey = import.meta.env.VITE_HYPIXEL_API_KEY;
const player_name = "Junenaah";
const DOMSelectors = 
{
    container:document.querySelector(".container"),
}
const URL_SELECTORS=
{
    uuid:`https://api.ashcon.app/mojang/v2/user/${player_name}`,
    auctions:"https://api.hypixel.net/skyblock/auctions",
    
}
const uuid =  (await getData(URL_SELECTORS.uuid)).uuid;
const example = `https://api.hypixel.net/player?uuid=${uuid}&key=${apiKey}`;
console.log(uuid)
async function getData(url)
{
    try{
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    catch(error)
    {
        console.error("PROBLEM FETCHING DATA",error);
    }
}
const fetch_skyblock_data = await getData(`https://api.hypixel.net/v2/resources/skyblock/collections`);
const test = await getData(`https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`);
const current_profile =  test.profiles.find(profile=>{if(profile.selected){return profile;}})
console.log(current_profile.profile_id);
const auction_current_profile= await getData(`https://api.hypixel.net/v2/skyblock/auction?key=${apiKey}&profile=${current_profile.profile_id}`)
console.log(auction_current_profile);