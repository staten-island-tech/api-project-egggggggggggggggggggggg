import '../CSS/style.css';
const apiKey = import.meta.env.VITE_HYPIXEL_API_KEY;
const cache = {};


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

const ITEM_NAME_MISCONCEPTIONS=
{
    mushroom:"red_mushroom",
    seeds:"wheat_seeds",
    sulphur:"glowstone_dust",
    mithril:""
}
const uuid =  ((await getData(URL_SELECTORS.uuid)).uuid).replace(/-/g, '');
//Get uuid and replace hyphens with ""
async function getData(url)
{
    if(cache[url])
    {
        console.log(`Cache found for ${url}`)
        return cache[url];
    }
    try{
        const response = await fetch(url);
        const data = await response.json();
        cache[url]=data; 
        return data;
    }
    catch(error)
    {
        console.error("PROBLEM FETCHING DATA",error);
    }
}
const skill_data =  await getData('https://api.hypixel.net/v2/resources/skyblock/skills');
//Fetch Skill Data and go specifically into the skills
const test = await getData(`https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`);
console.log(`https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`);//Reference link
//Fetch Player Profiles
const current_profile =  test.profiles.find(profile=>{if(profile.selected){return profile;}})
//Gives current Profile playeris on 
const profile_collection_data =  current_profile.members[uuid].collection;
//Gets current_profile's collecitons 
const auction_current_profile= await getData(`https://api.hypixel.net/v2/skyblock/auction?key=${apiKey}&profile=${current_profile.profile_id}`)
//Gets the auctions of a given player on thier current profile
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
//Use new Date(epoch) to get data
function abbreviateItem(item)
{
    const units = ["K", "M", "B", "T"]
    const numbers= [1_000, 1_000_000, 1_000_000_000, 1_000_000_000_000]
    for(let i=0; i<numbers.length;I++)
    {
        if(item>=numbers[i])
        {
            return (item/numbers[i]) +units[i];
        }
    }
}
console.log(abbreviateItem(1000000000000))
function fetchHead(Base64)
{
    Base64 =  JSON.parse(atob(Base64.replace(/\u003d/g,""))).textures.SKIN.url;
    Base64  = Base64.substring(Base64.lastIndexOf('/')+1);
    return(`https://mc-heads.net/head/${Base64}`)
}
function getImageURL(item_name)
{   
}
function insert_item_into_skill(skill, item_name)
{   
    const item_element =  document.querySelector(`.${skill}`)
    for(const material in resource_hash_map)
    {
        //Material : would be skull item if chili pepper or something 
        const itemArray =  resource_hash_map[material];
            const check_existence = itemArray.findIndex(item=> item.name === item_name)
            if(check_existence != (-1))
            {

                const actual_item_name = (item_name.length > 1) ?  `${item_name.toUpperCase().replace(/ /g,"_").replace("RAW_","")}`:`${item_name}`;
                const type = material != "SKULL_ITEM" ? `https://mc.nerothe.com/img/1.21/minecraft_${actual_item_name.toLowerCase()}.png` : `${fetchHead(itemArray[check_existence].skin.value)}`
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
for(const collection in skyblock_collection_data.collections)
{
    const temporary = skyblock_collection_data.collections[collection].items;
    for(const item_name in temporary)
    {
        insert_item_into_skill(collection , temporary[item_name].name);
    }
}
function display_skill_exp()
{
    const skills = current_profile.members[uuid].player_data.experience;
    for(const skill_name in skills)
    {
        console.log(skill_name, skills[skill_name]);
        const skill_name_without = skill_name.replace("SKILL_","");
        const skill_element_selection = document.querySelector(`.${skill_name_without.toLowerCase()}`)
        const skill_level_requirements = skill_data.skills[skill_name_without].levels;
        const index = skill_level_requirements.findIndex(item => {
            return skills[skill_name] <= item.totalExpRequired
        });
        const current_level =  index === -1 ? skill_level_requirements.length :index;


        const progress_to_next_level = index === -1 ? "MAXED OUT": (skills[skill_name] - skill_level_requirements[index-1].totalExpRequired)/(skill_level_requirements[index].totalExpRequired - skill_level_requirements[index-1].totalExpRequired) * 100;
        console.log(progress_to_next_level); 
        console.log(current_level);
        
        // skill_level_requirements.forEach(current_level=>
        // {
        //     console.log(current_level.totalExpRequired);
        // }
        // )
        // console.log(skill_data.skills[skill_name_without].maxLevel - 1);
        skill_element_selection.insertAdjacentHTML(
            "beforeend",
            `
            <h2>${skill_name_without}</h2>
            <div class="skill_icon"><img class="skill_icon_image" src="${skill_name_without.toLowerCase()}.png"> </div>
            <div class="slider">
                <div class="bar">
                <h2>${Math.round(progress_to_next_level)}</h2>
                </div>
            `
        )
        const bar_element = document.querySelector(`.${skill_name_without.toLowerCase()}  .slider .bar`)
        console.log(bar_element);
        bar_element.style.width = `${progress_to_next_level}%`
    } 
}
display_skill_exp()

function display_inventory_gui()
{
    
}
const test_data= `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`
function decodeInventoryInfo(encrypted)
{
    const temporary = atob(encrypted);
    let temporaryr = new Uint8Array(tempory.length);
    for(let i= )
}