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
// console.log(`https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`);//Reference link
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
console.log(abbreviateItem(10000))
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
                <h2>1000</h2>
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