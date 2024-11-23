import { ssrModuleExportsKey } from 'vite/runtime';
import '../CSS/style.css';
const apiKey = import.meta.env.VITE_HYPIXEL_API_KEY;
const player_name = "DeathStreeks";
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
// console.log(`https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`);//Reference link
//Fetch Player Profiles
const current_profile =  test.profiles.find(profile=>{if(profile.selected){return profile;}})
//Gives current Profile playeris on 
const profile_collection_data =  current_profile.members[uuid].collection;

const auction_current_profile= await getData(`https://api.hypixel.net/v2/skyblock/auction?key=${apiKey}&profile=${current_profile.profile_id}`)
//Gets the auctions of a given player on thier current profile
DOMSelectors.player_name.textContent=player_name;


const skyblock_collection_data = await getData(`https://api.hypixel.net/v2/resources/skyblock/collections`);
//Collection Data

const resources_skyblock_items =  await getData('https://api.hypixel.net/resources/skyblock/items');
//Skyblock Resource Items
const resource_hash_map  = {};
resources_skyblock_items.items.forEach(item=>
{
    const material = item.material;
    if(!resource_hash_map[material])
    {
        resource_hash_map[material] = [];
    }
    resource_hash_map[material].push(item);
}
)
//HashMap construction 

const temporary = new Date(1732232136417)
//Use new Date(epoch) to get data

const collection_names =  Object.keys(skyblock_collection_data.collections);
console.log(skyblock_collection_data.collections);



function temporary_storage(Base64)
{
    Base64 =  JSON.parse(atob(Base64.replace(/\u003d/g,""))).textures.SKIN.url;
    Base64  = Base64.substring(Base64.lastIndexOf('/')+1);
    return(`https://mc-heads.net/head/${Base64}`)
}
const testrun = temporary_storage("eyJ0aW1lc3RhbXAiOjE1MTgyMDY2MTI4MDgsInByb2ZpbGVJZCI6ImMxZWQ5N2Q0ZDE2NzQyYzI5OGI1ODFiZmRiODhhMjFmIiwicHJvZmlsZU5hbWUiOiJ5b2xvX21hdGlzIiwic2lnbmF0dXJlUmVxdWlyZWQiOnRydWUsInRleHR1cmVzIjp7IlNLSU4iOnsidXJsIjoiaHR0cDovL3RleHR1cmVzLm1pbmVjcmFmdC5uZXQvdGV4dHVyZS9iY2IyZjEyY2Y0ZjM0YThhZGZlM2Q3NWI3ZmY0ODliOTFhYmEzYzhiMTk5NTIxM2ZhNDYxZDY4NDkwYTUxIn19fQ==")
console.log(profile_collection_data)
function insert_item_into_skill(skill, item_name)
{   
    const item_element =  document.querySelector(`.${skill}`)
    for(const material in resource_hash_map)
    {
        //Material : would be skull item if chili pepper or something 
        const itemArray =  resource_hash_map[material];
        if(Array.isArray(itemArray))
        {
            const check_existence = itemArray.findIndex(item=> item.name === item_name)
            if(check_existence != (-1))
            {
                const actual_item_name = (item_name.length > 1) ?  `${item_name.toUpperCase().replace(/ /g,"_")}`:`${item_name}`;
                const type = material!= "SKULL_ITEM" ? `https://mc.nerothe.com/img/1.21/minecraft_${actual_item_name.toLowerCase()}.png` : `${temporary_storage(itemArray[check_existence].skin.value)}`
                console.log(type);
                const item_amount  = profile_collection_data[material] || profile_collection_data[actual_item_name]; 
                item_element.insertAdjacentHTML("afterbegin",
                    `<div class="item">
                        <h2 class="item_header">${item_name}</h2>
                        <img class="item_image" src=${type}>
                        <h3 class="item_amount">Amount:${item_amount}</h3>
                     </div>
                    `
                )
            }
        }
    }
}
for(const collection in skyblock_collection_data.collections)
{
    console.log(collection, skyblock_collection_data.collections[collection].items)
    const temporary = skyblock_collection_data.collections[collection].items;
    for(const item_name in temporary)
    {
        console.log(collection, temporary[item_name].name);
        insert_item_into_skill(collection , temporary[item_name].name);
    }
}

//Object.keys() = access the name of the items within the object
//Object.values() = access the value or thing assigned to the item witihn the object
//Sulfur = Gunpowder

// pokemon.forEach(stats=>
//     {
//         DOMSelectors.container.insertAdjacentHTML(
//             "afterbegin",
//             `<div class="card" id="${stats["name"]}">
//               <h2 class="card_header">${stats["name"]}</h2>
//               <img src="${stats["photos"]}" alt="${stats["name"]}" class="card_img">
//               <h2 class="card_header">Type : ${stats["type"]}</h2>
//               <h2 class="card_header">Evolution : ${stats["evolution"]}</h2> 
//               <h2 class="card_header">Weight : ${stats["weight"]} kg</h2> 
//             </div>`
//         );
//     }
//   )

//Get item name and cross refernce it with api.hypixel.net/resources/skyblock/items and search for the item's material. This allows us to pull up the image for the item 
//Use https://mc.nerothe.com/ for reference images