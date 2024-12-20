import '../CSS/style.css';
const apiKey = import.meta.env.VITE_HYPIXEL_API_KEY;
function throwErrorMessage(message)
{
    const alert = document.querySelector(".alert")
    alert.querySelector("span").textContent = message;
    alert.classList.remove("hidden");
    setTimeout(()=>{
        alert.classList.remove("opacity-0")
        alert.classList.add("opacity-100")
    }, 100)
    setTimeout(()=>
    {
        alert.classList.remove("opacity-100");
        alert.classList.add("opacity-0");
        setTimeout(()=>{alert.classList.add("hidden")}, 2000)
    }, 2000)

}
async function getData(url)
{
    try{
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
    catch(error)
    {
        console.error("PROBLEM FETCHING DATA", error);
    }
}
let skill_data
let skyblock_collection_data;
let resources_skyblock_items;
const resource_hash_map  = {};
const itembyid_hash_map = {}
async function get_importantStuff()
{
    try{
        skill_data =  await getData('https://api.hypixel.net/v2/resources/skyblock/skills');
        skyblock_collection_data = await getData(`https://api.hypixel.net/v2/resources/skyblock/collections`);
        resources_skyblock_items =  await getData('https://api.hypixel.net/resources/skyblock/items');
    }
    catch(error)
    {
        console.error('Error fetching data', error)
    }
}
async function something()
{
    await get_importantStuff(); 
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
}
something()

async function fetchPlayerData(player_name) {
    try {
        const uuidResponse = await getData(`https://api.ashcon.app/mojang/v2/user/${player_name}`);
        if (!uuidResponse || !uuidResponse.uuid) {
            throwErrorMessage("UUID NOT FOUND FOR PLAYER/API KEY INVALID")
            throw new Error("UUID not found for the player.");
        }
        const uuid = uuidResponse.uuid.replace(/-/g, '');
        
        const profilesResponse = await getData(`https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`);
        if (!profilesResponse || !profilesResponse.profiles) {
            throwErrorMessage("PROFILE NOT FOUND FOR PLAYER")
            throw new Error("Profiles not found for the player.");
        }
        const current_profile = profilesResponse.profiles.find(profile => profile.selected);
        if (!current_profile) {
            throwErrorMessage("NO SELECTED PROFILE FOUND")
            throw new Error("No selected profile found.");
        }


        return {
            uuid,
            skill_data, 
            current_profile
        };
    } catch (error) {
        console.error("Error fetching player data:", error.message);
        return null; 
    }
}

const exceptions = ['DOUBLE_PLANT', 'LOG_2', 'LOG', 'LEAVES_2', 'LEAVES', 'STAINED_GLASS_PANE', 'STAINED_CLAY', 'STEP', 'SAPLING', 'WOOD', 'REDSTONE_TORCH_ON', 'BANNER', 'WOOD_STEP', "RAW_FISH", "RED_ROSE", "INK_SACK"];

const submit_item =  document.querySelector(".submit_item");
const main_stats =  document.querySelector(".main_stats");
function insertElements()
{
    main_stats.insertAdjacentHTML(
    "afterbegin",
    `  <div class="skills flex flex-col justify-center items-center relative">
        <h2 class="skill_header text-8xl">SKILLS</h2>
        <div class="combat"></div>
        <div class="mining"></div>
        <div class="farming"></div>
        <div class="foraging"></div>
        <div class="fishing"></div>
        <div class="enchanting"></div>
        <div class="alchemy"></div>
        <div class="taming"></div>
        <div class="dungeoneering"></div>
        <div class="carpentry"></div>
        <div class="social"></div>
        <div class="runecrafting"></div>
      </div>
      <div class="collection_items flex justify-center items-center flex-col">
        <h2 class="skill_header text-[6rem]">Farming</h2>
        <div class="FARMING collection flex flex-wrap gap-[1.6rem] justify-center items-center ">
        </div>
        <h2 class="skill_header text-[6rem]">Mining</h2>
        <div class="MINING collection flex flex-wrap gap-[1.6rem] justify-center items-center ">
        </div>
        <h2 class="skill_header text-[6rem]">Combat</h2>
        <div class="COMBAT collection flex flex-wrap gap-[1.6rem] justify-center items-center ">
        </div>
        <h2 class="skill_header text-[6rem]">Foraging</h2>
        <div class="FORAGING collection flex flex-wrap gap-[1.6rem] justify-center items-center ">
        </div>
        <h2 class="skill_header text-[6rem]">Fishing</h2>
        <div class="FISHING collection flex flex-wrap gap-[1.6rem] justify-center items-center ">
        </div>
        <h2 class="skill_header text-[6rem]">Rift</h2>
        <div class="RIFT collection flex flex-wrap gap-[1.6rem] justify-center items-center ">
        </div>
      </div>`
)
}
submit_item.addEventListener("submit",
    async function(event)
    {
        event.preventDefault();
        const new_main_stats = document.querySelector(".main_stats");
        new_main_stats.innerHTML = "";
        const input_value =  document.getElementById("playerName");
        if(!input_value.value)
        {
            throwErrorMessage("Please input something");
            return;
        }
        else{
            fetchPlayerData(input_value.value).then((result)=>
            {
                new_main_stats.innerHTML = ""
                insertElements();
                item_insertion(result.current_profile, result.uuid);
                display_skill_exp(result.current_profile, result.uuid);
            })

        }
    }
)
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
function item_insertion(current_profile, uuid)
{
    for(const[collection, data] of Object.entries(skyblock_collection_data.collections))
    {
        const collection_element =  document.querySelector(`.${collection}`)
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
                image_url =  `valid_images/minecraft_${itembyid_hash_map[item_object].name.replace(/ /g, "_").toLowerCase()}.png`;
            }
            else
            {
                image_url = `valid_images/minecraft_${item_id.toLowerCase()}.png`
            }
            const item_amount  = !current_profile.members[uuid].collection[item_object] ?  0:current_profile.members[uuid].collection[item_object]
            collection_element.insertAdjacentHTML("afterbegin", 
            `<div class="item w-[32rem] h-[32rem] flex items-center justify-center bg-[#333333E6] text-white font-sans box-border flex-col text-center">
                <h2 class="item_header text-2xl text-[3rem]">${itembyid_hash_map[item_object].name}</h2>
                <img class="item_image w-[10rem] h-[10rem]" src=${image_url} alt="${itembyid_hash_map[item_object].name}">
                <h3 class="item_amount text-[3rem]">Amount : ${abbreviateItem(item_amount)}</h3>
             </div>`
            )
        }
    }
};

function display_skill_exp(current_profile, uuid)
{
    const skills = current_profile.members[uuid].player_data.experience;
    for(const skill_name in skills)
    {
        if(skill_name=="SKILL_DUNGEONEERING")
        {
            continue;
        }
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
            <h2 class="text-center text-[2rem]">${skill_name_without + " " + (current_level+1)}</h2>
            <div class="skill_icon bg-[rgb(0,0,0)] opacity-100 w-[6rem] h-[6rem] items-center flex justify-center absolute z-10 p-[auto] rounded-[2rem]">
                <img class="skill_icon_image w-[5rem] h-[5rem]" src="${skill_name_without.toLowerCase()}.png" alt="${skill_name_without.toLowerCase()}">
            </div>
            <div class="slider w-[80rem] h-[6rem] rounded-[2rem] bg-black z-0 relative rounded-[20rem]">
                <h2 class="bar_text text-center text-[white] relative z-[2] text-[2rem]">${abbreviateItem(current_progress)}/${abbreviateItem(next_level_requirements)}</h2>
                <div class="bar w-full h-full z-[1] text-base text-[white] rounded-[20rem] flex justify-center items-center absolute rounded-[20rem] bg-green-500 mt-[-3rem]">
                </div>
            </div>
            `
        )
        const bar_element = document.querySelector(`.${skill_name_without.toLowerCase()}  .slider .bar`)

        bar_element.style.width = `${progress_to_next_level}%`
        if(progress_to_next_level == "MAXED OUT")
        {
            bar_element.style.width = `100%`;
            const h2bar = skill_element_selection.querySelector(".slider h2");
            h2bar.textContent = "MAXED OUT";
        }
    } 
}