import '../CSS/style.css';
const apiKey = import.meta.env.VITE_HYPIXEL_API_KEY;
const player_name = "Junenaah";
const DOMSelectors = 
{
    inputted_username:document.querySelector(".search_thingie"),
    skyblock_levels:document.querySelector(".skyblock_levels"),
    player_name:document.querySelector(".player_name")
}
const URL_SELECTORS=
{
    uuid:`https://api.ashcon.app/mojang/v2/user/${player_name}`,
    auctions:"https://api.hypixel.net/skyblock/auctions",
    
}
const uuid =  ((await getData(URL_SELECTORS.uuid)).uuid).replace(/-/g, '');
//Get uuid and replace hyphens with ""
const example = `https://api.hypixel.net/player?uuid=${uuid}&key=${apiKey}`;
//Test
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

const test = await getData(`https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`);
//Fetch Player Profiles
const current_profile =  test.profiles.find(profile=>{if(profile.selected){return profile;}})
//Gives current Profile playeris on 
console.log(current_profile.members[uuid]);

const auction_current_profile= await getData(`https://api.hypixel.net/v2/skyblock/auction?key=${apiKey}&profile=${current_profile.profile_id}`)
//Gets the auctions of a given player on thier current profile
DOMSelectors.player_name.textContent=player_name;


const skyblock_collection_data = await getData(`https://api.hypixel.net/v2/resources/skyblock/collections`);
console.log(skyblock_collection_data.collections.COMBAT.items);
//Collection Data


const temporary = new Date(1732232136417)
//Use new Date(epoch) to get data

const collection_names =  Object.keys(skyblock_collection_data.collections);

for(let i = 0; i < collection_names.length; i++)
    {
        const current_items_skill =  skyblock_collection_data.collections[collection_names[i]].items;
        Object.keys(current_items_skill).forEach(item=>{
            const current_item = current_items_skill[item];
            Object.keys(current_item).forEach(value=>
                {
                    console.log(value);
                }
            )
        });
    }
function current_tier_amount(items)
{
    
}