import '../CSS/style.css';
import { Buffer, INSPECT_MAX_BYTES } from 'buffer';
import * as nbt from "prismarine-nbt";
import zlib from 'browserify-zlib';
import { decode } from 'punycode';
import { profile } from 'console';
const apiKey = import.meta.env.VITE_HYPIXEL_API_KEY;
const cache = {};
const player_name = "Junenaah";
const uuid =  ((await getData(`https://api.ashcon.app/mojang/v2/user/${player_name}`)).uuid).replace(/-/g, '');
//Get uuid and replace hyphens with ""
const DOMselectors
=
{
    dropdown:document.querySelector(`.dropdown-content`),
    dropdown_toggle:document.querySelector(`.dropdown-toggle`)
}

async function getData(url)
{
    if(cache[url])
    {
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

//Gets the auctions of a given player on thier current profile
const skyblock_collection_data = await getData(`https://api.hypixel.net/v2/resources/skyblock/collections`);
//Collection Data
const resources_skyblock_items =  await getData('https://api.hypixel.net/resources/skyblock/items');
//Skyblock Resource Items
const resource_hash_map  = {};
const itembyid_hash_map = {}
const exceptions = ['DOUBLE_PLANT', 'LOG_2', 'LOG', 'LEAVES_2', 'LEAVES', 'STAINED_GLASS_PANE', 'STAINED_CLAY', 'STEP', 'SAPLING', 'WOOD', 'REDSTONE_TORCH_ON', 'BANNER', 'WOOD_STEP', "RAW_FISH", "RED_ROSE"];
resources_skyblock_items.items.forEach(item=>
{
    const material = item.material;
    if(!resource_hash_map[material])
    {
        resource_hash_map[material] = [];
    }
    if(item.id)
    {
        itembyid_hash_map[item.id] = item;
    }

    resource_hash_map[material].push(item);
}
)
console.log(Object.keys(resource_hash_map))

console.log(itembyid_hash_map)
console.log(resource_hash_map);
//HashMap construction 
//Use new Date(epoch) to get data
function abbreviateItem(number) {
    if (number < 1000) return Math.round(number.toString());
    const units = ["k", "m", "b", "t"]; 
    const scale = Math.min(Math.floor(Math.log10(number) / 3), units.length); 
    const abbreviatedValue = number / Math.pow(1000, scale);
    return abbreviatedValue.toFixed(1) + (units[scale - 1] || "");
}
function fetchHead(Base64)
{
    Base64 =  JSON.parse(atob(Base64.replace(/\u003d/g,""))).textures.SKIN.url;
    Base64  = Base64.substring(Base64.lastIndexOf('/')+1);
    return(`https://mc-heads.net/head/${Base64}`)
}

function item_insertion()
{
    profile_collection_data;
    for(const[collection, data] of Object.entries(skyblock_collection_data.collections))
    {
        const collection_element =  document.querySelector(`.${collection}`)
         //Selects the collection element present in the html
        const items =  data.items;
        for(const item_object of Object.keys(items))
        {
            const item_id = itembyid_hash_map[item_object].material;
            let image_url;
            if(item_id == "SKULL_ITEM")
            {
                image_url = fetchHead(itembyid_hash_map[item_object].skin.value);
            }
            else if(exceptions.includes(item_id.toUpperCase()))
            {
                image_url =  `valid_images/minecraft_${itembyid_hash_map[item_object].name.replace(' ', "_").toLowerCase()}.png`;

            }
            else
            {
                image_url = `valid_images/minecraft_${item_id.toLowerCase()}.png`
            }
            const item_amount  = !profile_collection_data[item_object] ?  0:profile_collection_data[item_object]
            collection_element.insertAdjacentHTML("afterbegin", 
            `<div class="item">
                <h2 class="item_header">${itembyid_hash_map[item_object].name}</h2>
                <img class="item_image" src=${image_url}>
                <h3 class="item_amount">Amount : ${item_amount}</h3>
             </div>`
            )
            //profile collection data =  varbiable 
        }
    }
};
item_insertion();
function display_skill_exp()
{
    const skills = current_profile.members[uuid].player_data.experience;
    for(const skill_name in skills)
    {
        const skill_name_without = skill_name.replace("SKILL_","");
        const skill_element_selection = document.querySelector(`.${skill_name_without.toLowerCase()}`)
        const skill_level_requirements = skill_data.skills[skill_name_without].levels;
        const index = skill_level_requirements.findIndex(item => {
            return skills[skill_name] <= item.totalExpRequired
        });
        const current_level =  index === -1 ? skill_level_requirements.length-1:index;
        const current_progress = index === -1 ? "MAXED" : skills[skill_name] - skill_level_requirements[index-1].totalExpRequired;
        const next_level_requirements =  index === -1 ? "MAXED" : skill_level_requirements[index].totalExpRequired - skill_level_requirements[index-1].totalExpRequired;
        const progress_to_next_level = index === -1 ? "MAXED OUT": (current_progress/next_level_requirements)*100
        skill_element_selection.insertAdjacentHTML(
            "beforeend",
            `
            <h2>${skill_name_without + " " + (current_level+1)}</h2>
            <div class="skill_icon">
                <img class="skill_icon_image" src="${skill_name_without.toLowerCase()}.png">
            </div>
            <div class="slider">
                <div class="bar">
                    <h2>${abbreviateItem(current_progress)}/${abbreviateItem(next_level_requirements)}</h2>
                </div>
            </div>
            `
        )
        const bar_element = document.querySelector(`.${skill_name_without.toLowerCase()}  .slider .bar`)

        bar_element.style.width = `${progress_to_next_level}%`
        if(progress_to_next_level == "MAXED OUT")
        {
            bar_element.style.width = `100%`;
            const h2bar = skill_element_selection.querySelector(".bar h2");
            h2bar.textContent = "MAXED OUT";
        }
    } 
}
display_skill_exp()
let inventory_data = {}
// Assuming decodeData is refactored to return a Promise
function decodeData(string) {
    return new Promise((resolve, reject) => {
        const data = Buffer.from(string, 'base64');
        nbt.parse(data, (error, json) => {
            if (error) {
                reject(error);  // Reject the promise if there's an error
            } else {
                resolve(json);  // Resolve the promise with the JSON data
            }
        });
    });
}

async function decodeAndHandleNBT(base64String, category) {
    try {
        // Wait for the decoding to finish
        const json = await decodeData(base64String);
        // Modify the inventory_data[category] after decoding is complete
        inventory_data[category] = json;
    } catch (error) {
        console.error("Failed to decode and parse NBT data:", error);
    }
}
const inventory_display =  document.querySelector(".inventory_display")
async function processInventoryData() {
    const tasks = [
        decodeAndHandleNBT(current_profile.members[uuid].inventory.inv_contents.data, "inventory"),
        decodeAndHandleNBT(current_profile.members[uuid].inventory.ender_chest_contents.data, "ender_chest"),
        decodeAndHandleNBT(current_profile.members[uuid].inventory.equipment_contents.data, "equipment"),
        decodeAndHandleNBT(current_profile.members[uuid].inventory.wardrobe_contents.data, "wardrobe"),
        decodeAndHandleNBT(current_profile.members[uuid].inventory.bag_contents.talisman_bag.data, "talisman_bag"),
    ];
    for(const[original_name, current_slot] of Object.entries(current_profile.members[uuid].inventory.backpack_contents))
        {
            tasks.push(decodeAndHandleNBT(current_slot.data, `backpack_page_${original_name}`))
        }


    // Wait for all decoding tasks to complete
    await Promise.all(tasks);
    for(const [inventory_type, data] of Object.entries(inventory_data))
     {
        
        const container = inventory_type.includes("backpack_page_") ? document.querySelector(".page_container") :  inventory_display;
        const slot_info =  data.value.i.value.value
        const rows = Math.floor(slot_info.length/9)
        const remaining_slots = slot_info.length%9;
        const total_rows =  rows + Math.ceil(remaining_slots/9)
        container.insertAdjacentHTML(
            "beforeend",
            `
            <div class="${inventory_type} grid grid-cols-9 gap-2 w-[90px] p-2 rounded-md bg-black">
            </div>
            `
        );
        const inventory_type_element  = document.querySelector(`.${inventory_type}`)
        //use rows to control css thingie majingie 
        //Create a scope item within which we can then put all the inventory data within
        let slot_number=0;
        slot_info.forEach(slot=>
        {
            // let item_url = `valid_images/minecraft_${itembyid_hash_map["0"].material.replace(" ", "_").toLowerCase()}.png`;
            //Check for the items id. cross reference it to the hash_map and if its a skull_item then use fetch_head to get image
            slot_number+=1;
            let image_url = "https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png";
            if(Object.keys(slot).length == 0)
            {
            }
            else
            {   
                const id =  slot.tag.value.ExtraAttributes.value.id.value;
                if(!itembyid_hash_map[id])
                {
                    image_url = fetchHead(slot.tag.value.SkullOwner.value.Properties.value.textures.value.value[0].Value.value)
                }
                else if(itembyid_hash_map[id].material=="SKULL_ITEM")
                {
                    if(id == "SKELETON_TALISMAN")
                    {
                        image_url = `https://mc.nerothe.com/img/1.21/minecraft_skeleton_skull.png`
                    }
                    else
                    {
                        image_url = fetchHead(itembyid_hash_map[id].skin.value);
        
                    }    
                }
                else
                {
    
                    if(exceptions.includes(itembyid_hash_map[id].material))
                    {
                        image_url =  `valid_images/minecraft_${itembyid_hash_map[id].name.replace(/ /g, "_").toLowerCase()}.png`
                        console.log(itembyid_hash_map[id].name)
                    }
                    else {
                    image_url = `valid_images/minecraft_${itembyid_hash_map[id].material.replace(" ", "_").toLowerCase()}.png`
                    }
                }
            }
            inventory_type_element.insertAdjacentHTML(
                "beforeend",
                `
                <div class="slot_${slot_number}_${inventory_type.replace("page_", "")} gui_slot relative group">
                    <img class="item_image" src=${image_url}>
                    <div class="item_information w-8 h-8 .bg-black hidden absolute">
                    SOMETINHG
                    </div>
                <div>
                `
            )
        }
        )

        if(inventory_type.includes("backpack_page_"))
        {
            DOMselectors.dropdown.insertAdjacentHTML(
                "beforeend",
                `
                <li> 
                    <button class="drop_down_button_thing" id="${inventory_type.replace(/_/g, " ").toUpperCase()}"> 
                        ${inventory_type.replace(/_/g, " ").toUpperCase()}
                    </a>
                </button>
                `
            )
        }
        if(!inventory_type.includes("backpack_page_"))
            {
                    inventory_type_element.insertAdjacentHTML(
                        "beforebegin",
                        `<h2>${inventory_type}</h2>`
                    )
            }
    }
    
}
processInventoryData();
// Attach the event listener to the dropdown (parent element)
DOMselectors.dropdown.addEventListener('click', function(event) {
    if (event.target && event.target.matches('.drop_down_button_thing')) {
        event.preventDefault();
        DOMselectors.dropdown_toggle.textContent =  event.target.id;
        const page_item =  document.querySelector(`.${event.target.id.replace(/ /g, "_").toLowerCase()}`);
        const allPages = document.querySelectorAll('[class^="backpack_page_"]');
        allPages.forEach(page=>
        {
            page.style.display =  "none"
        }
        )
        page_item.style.display = "grid"
        page_item.offsetHeight; 
    }
    
});

function changecurrentpage(page_number)
{
    
}

// const actual_important_information  = json.value.i.value.value


