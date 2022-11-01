// TO SEE DB LAYOUT ON FIGMA:
// https://www.figma.com/file/YaQqpkp518Gkj9y4J7k3jJ/DF-Profession-DB-Layout

//PACKAGES
const express = require('express')
const parser = require('body-parser')
const { Sequelize, DataTypes, Model, Deferrable } = require('sequelize')
const sequelize = new Sequelize('postgres://conrad:password@localhost:5432/df_professions')
const pg = require('pg')
const pghstore = require('pg-hstore')
const app = express()

//SETTING UP APP
app.use(parser.urlencoded({extended: true}))

//MEAT & POTATOES
const test = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

//making tables
const Item = sequelize.define('item', {
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING }, //links to png?
    stacksTo: { type: DataTypes.INTEGER, defaultValue: 1 },
    price: { type: DataTypes.FLOAT },
    description: { type: DataTypes.STRING },
    notes: { type: DataTypes.STRING },
    itemLevelMin: { type: DataTypes.INTEGER },
    itemLevelMax: { type: DataTypes.INTEGER },
    types: { type: DataTypes.JSONB },
    //has many Materials, FinishingReagents, Recipe(s)
},{
    underscored: true
});

const Profession = sequelize.define('profession', {
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING }
    //has many Recipes, Specializations, Tools (Items), FirstAccessories (Items), SecondAccessories (Items)
},{
    underscored: true
});

const Recipe = sequelize.define('recipe', {
    name: { type: DataTypes.STRING, allowNull: false },
    numberCrafted: { type: DataTypes.INTEGER, defaultValue: 1 },
    requiredProfessionLevel: { type: DataTypes.INTEGER, defaultValue: 1 },
    category: { type: DataTypes.STRING },
    skillUpAmount: { type: DataTypes.INTEGER, defaultValue: 1 },
    difficulty: { type: DataTypes.INTEGER, defaultValue: 0 },
    requiredRenownLevel: { type: DataTypes.JSONB },
    requiredSpecializationLevel: { type: DataTypes.JSONB },
    notes: { type: DataTypes.STRING }
    //has many Materials & FinishingReagents
    //belongs to Item & Profession
},{
    underscored: true
});

const Material = sequelize.define('material', {
    quantity: { type: DataTypes.INTEGER, allowNull: false }
    //belongs to Recipe, Item
},{
    underscored: true
});

const FinishingReagent = sequelize.define('finishingReagent', {
    requiredSpecializationLevel: { type: DataTypes.JSONB }
    //belongs to Recipe, Item
},{
    underscored: true
});

const Specialization = sequelize.define('specialization', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    totalPoints: { type: DataTypes.INTEGER, allowNull: false },
    groupCrafts: { type: DataTypes.STRING },
    eachPointGives: { type: DataTypes.STRING, defaultValue: "1 Skill" }
    //has many Bonuses & Specializations
    //belongs to Profession & Specialization
},{
    underscored: true
});

const Bonus = sequelize.define('bonus', {
    level: { type: DataTypes.INTEGER, allowNull: false },
    bonus: { type: DataTypes.STRING, allowNull: false }
    //belongs to Specialization
},{
    underscored: true
});


// setting up some ORM
Profession.hasMany(Recipe);
Recipe.belongsTo(Profession);

Profession.hasMany(Specialization);
Specialization.belongsTo(Profession);

Profession.hasMany(Item, {as: 'Tools', foreignKey: 'toolsId'});
Profession.hasMany(Item, {as: 'FirstAccessory', foreignKey: 'firstAccessoryId'})
Item.belongsTo(Profession, {as: 'ProfessionEquipment'});

Item.hasMany(Recipe);
Recipe.belongsTo(Item);

Recipe.hasMany(Material);
Material.belongsTo(Recipe);

Recipe.hasMany(FinishingReagent);
FinishingReagent.belongsTo(Recipe);

Item.hasMany(Material);
Material.belongsTo(Item);

Item.hasMany(FinishingReagent);
FinishingReagent.belongsTo(Item);

Specialization.hasMany(Bonus);
Bonus.belongsTo(Specialization);

// Specialization.hasMany(Specialization));
// Specialization.belongsTo(Specialization));

const isNotNullAndUndefined = value => {
    return (value != undefined || value != null)
}

async function createProfession(name, icon){
    let profession = Profession.build({name: name});
    if(isNotNullAndUndefined(icon)){
        profession.icon = icon;
    }
    await profession.save();
    return profession;
}

async function createItem(name, stacksTo, itemLevelMin, itemLevelMax, description, notes, types, icon){
    let item = Item.build({name: name});
    let iconURL = "https://wow.zamimg.com/images/wow/icons/large/";

    if(isNotNullAndUndefined(stacksTo)){ item.stacksTo = stacksTo; }
    if(isNotNullAndUndefined(itemLevelMin)){ item.itemLevelMin = itemLevelMin; }
    if(isNotNullAndUndefined(itemLevelMax)){ item.itemLevelMax = itemLevelMax; }
    if(isNotNullAndUndefined(description)){ item.description = description; }
    if(isNotNullAndUndefined(notes)){ item.notes = notes; }
    if(isNotNullAndUndefined(types)){ item.types = types; }
    if(isNotNullAndUndefined(icon)){ item.icon = iconURL + icon + ".jpg"; }
    await item.save();
    return item;
}

async function createRecipe(name, itemMade, numberCrafted, profession, materials, requiredProfLevel, category, skillUpAmount, difficulty,
    requiredRenownLevel, requiredSpecializationLevel, notes, finishingReagents){
        let recipe = Recipe.build({name: name, itemId: itemMade.id, professionId: profession.id});


        if(isNotNullAndUndefined(numberCrafted)){ recipe.numberCrafted = numberCrafted; }
        if(isNotNullAndUndefined(requiredProfLevel)){ recipe.requiredProfLevel = requiredProfLevel; }
        if(isNotNullAndUndefined(category)){ recipe.category = category; }
        if(isNotNullAndUndefined(skillUpAmount)){ recipe.skillUpAmount = skillUpAmount; }
        if(isNotNullAndUndefined(difficulty)){ recipe.difficulty = difficulty; }
        if(isNotNullAndUndefined(requiredRenownLevel)){ recipe.requiredRenownLevel = requiredRenownLevel; }
        if(isNotNullAndUndefined(requiredSpecializationLevel)){ recipe.requiredSpecializationLevel = requiredSpecializationLevel; }
        if(isNotNullAndUndefined(notes)){ recipe.notes = notes; }
        await recipe.save();
        console.log(`${recipe.name}'s ID: ${recipe.id}`);

        //for materials, write as so:
        /*
        [
            [item, numberUsed],
            [item, numberUsed],
            etc.
        ]
        ie:
        [
            [awakenedAir, 1],
            [awakenedEarth, 1],
            [primalFlux, 10]
        ]
        */
        if(isNotNullAndUndefined(materials)){
            for(let material of materials){
                await createMaterial(material[0], material[1], recipe);
            }
        }

        //for finishing reagents, write as so:
        /*
        [
            [item, {SpecializationName: SpecializationLevel, OtherSpecializationName: SpecializationLevel, etc.}],
            etc.
        ]
        ie:
        [
            lesserIllustriousInsight, {ChemicalSynthesis: 35}
        ]
        */
        if(isNotNullAndUndefined(finishingReagents)){
            for(let freagent of finishingReagents){
                await createFinishingReagent(freagent[0], freagent[1], recipe);
            }
        }

        return recipe;
}

async function createMaterial(item, quantity, recipe){
    let material = Material.build({itemId: item.id, quantity: quantity, recipeId: recipe.id});
    await material.save();
    return material;
}

async function createFinishingReagent(item, requiredSpecializationLevel, recipe){
    let finishingReagent = FinishingReagent.build({itemId: item.id, requiredSpecializationLevel: requiredSpecializationLevel, recipeId: recipe.id})
    await finishingReagent.save();
    return finishingReagent;
}

// MAKING TABLES
// TIME TO SYNC
const makeTables = async () => {
    await sequelize.sync({ force: true })
    console.log('Database synced successfully.')



    //
    // SEEDING PROFESSIONS
    //

        const vendor = createProfession('Vendor');
        const worldDropAndGathering = createProfession('World Drop & Gathering');
        const tailoring = createProfession('Tailoring');
        const enchanting = createProfession('Enchanting');
        const engineering = createProfession('Engineering');
        const alchemy = createProfession('Alchemy');
        const inscription = createProfession('Inscription');
        const jewelcrafting = createProfession('Jewelcrafting');
        const blacksmithing = createProfession('Blacksmithing');
        const leatherworking = createProfession('Leatherworking');
        const herbalism = createProfession('Herbalism');
        const mining = createProfession('Mining');
        const skinning = createProfession('Skinning');
        const cooking = createProfession('Cooking');
        const fishing = createProfession('Fishing');
        const archaeology = createProfession('Archaeology');



    //
    // SEEDING ITEMS
    //

        //vendor items
        const primalFlux = await(createItem("Primal Flux", 1000, null, null, "Used for removing impurities from metal. Sold by Blacksmithing vendors.", "Blacksmithing Reagent, bought from vendors.", {otherType: "craftingReagent"}, "inv_herbalism_70_starlightrosedust"));
        const smudgedLens = await(createItem("Smudged Lens", 1000, null, null, null, "Reagent for Engineering goggles, bought from vendors."));
        const enchantingVellum = await(createItem("Enchanting Vellum", 1000, null, null, null, "Makes enchantments tradeable, bought from vendors."));
        const glitteringParchment = await(createItem("Glittering Parchment", 1000, null, null, null, "Inscription Reagent, bought from vendors."));
        const iridescentWater = await(createItem("Iridescent Water", 1000, null, null, null, "Inscription Reagent used to make inks, bought from vendors."));
        const misshapedFiligree = await(createItem("Misshaped Filigree", 1000, null, null, null, "Jewelcrafting Reagent, bought from vendors."));
        const draconicStopper = await(createItem("Draconic Stopper", 1000, null, null, null, "Reagent used for making Draconic Vials w/ Jewelcrafting. Bought from vendors."));

        //dropped items
        const sparkOfIngenuity = await(createItem("Spark of Ingenuity", 1000, null, null, null, "Made with the Engine of Innovation in Valdrakken. More info later."));
        const artisansMettle = await(createItem("Artisans Mettle", 1000, null, null, null, "Received for first crafts, profession daily quests, and some other sources. Can be used to buy recipes from the Artisan's Consortium, make Illustrious Insight, or make higher level Profession Equipment."));
        const primalChaos = await(createItem("Primal Chaos", 1000, null, null, null, "Reagent received from... dungeon & raid bosses? More info later."));
        const rousingAir = await(createItem("Rousing Air", 1000, null, null, null, "Received mostly from air elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened."));
        const rousingEarth = await(createItem("Rousing Earth", 1000, null, null, null, "Received mostly from earth elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened."));
        const rousingFire = await(createItem("Rousing Fire", 1000, null, null, null, "Received mostly from fire elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened."));
        const rousingFrost = await(createItem("Rousing Frost", 1000, null, null, null, "Received mostly from ice elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened."));
        const rousingIre = await(createItem("Rousing Ire", 1000, null, null, null, "Received from pvp kills? I think? Lesser reagent. 10 Rousing can combine into 1 Awakened."));
        const rousingDecay = await(createItem("Rousing Decay", 1000, null, null, null, "Received mostly from decayed mobs. Lesser reagent. 10 Rousing can combine into 1 Awakened."));
        const rousingOrder = await(createItem("Rousing Order", 1000, null, null, null, "Received mostly from titan-touched gathering nodes. Lesser reagent. 10 Rousing can combine into 1 Awakened."));
        const awakenedAir = await(createItem("Awakened Air", 1000, null, null, null, "Received mostly from air elementals. Greater reagent. 1 Awakened can split into 10 Rousing."));
        const awakenedEarth = await(createItem("Awakened Earth", 1000, null, null, null, "Received mostly from earth elementals. Greater reagent. 1 Awakened can split into 10 Rousing."));
        const awakenedFire = await(createItem("Awakened Fire", 1000, null, null, null, "Received mostly from fire elementals. Greater reagent. 1 Awakened can split into 10 Rousing."));
        const awakenedFrost = await(createItem("Awakened Frost", 1000, null, null, null, "Received mostly from ice elementals. Greater reagent. 1 Awakened can split into 10 Rousing."));
        const awakenedIre = await(createItem("Awakened Ire", 1000, null, null, null, "Received from pvp kills? I think? Greater reagent. 1 Awakened can split into 10 Rousing."));
        const awakenedDecay = await(createItem("Awakened Decay", 1000, null, null, null, "Received mostly from decayed mobs. Greater reagent. 1 Awakened can split into 10 Rousing."));
        const awakenedOrder = await(createItem("Awakened Order", 1000, null, null, null, "Received mostly from titan-touched gathering nodes. Greater reagent. 1 Awakened can split into 10 Rousing."));
        const airySoul = await(createItem("Airy Soul", 1000, null, null, null, "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on an air elemental."));
        const fierySoul = await(createItem("Fiery Soul", 1000, null, null, null, "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on a fire elemental."));
        const frostySoul = await(createItem("Frosty Soul", 1000, null, null, null, "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on an ice elemental."));
        const earthenSoul = await(createItem("Earthen Soul", 1000, null, null, null, "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on an earth elemental."));
        const centaursTrophyNecklace = await(createItem("Centaur's Trophy Necklace", 1000, null, null, null, "Received from Centaur Wild Hunts?"));
        const titanTrainingMatrixOne = await(createItem("Titan Training Matrix I", 200, null, null, null, "Sets ilvl of crafted piece to 333-343, binds on pickup, and requires Level 64."));
        const titanTrainingMatrixTwo = await(createItem("Titan Training Matrix II", 200, null, null, null, "Sets ilvl of crafted piece to 346-356, binds on pickup, and requires Level 70."));
        const titanTrainingMatrixThree = await(createItem("Titan Training Matrix III", 200, null, null, null, "Sets ilvl of crafted piece to 359-369, binds on pickup, and requires Level 70."));
        const titanTrainingMatrixFour = await(createItem("Titan Training Matrix IV", 200, null, null, null, "Sets ilvl of crafted piece to 372-382, binds on pickup, and requires level 70."));
        const illustriousInsight = await(createItem("Illustrious Insight", 200, null, null, null, "Optional Reagent that increases Skill when crafting a bigger item by 30. Made with Artisan's Mettle by all professions. 1 Illustrious Insight can break down into 5 Lesser Illustrious Insight."));
        const lesserIllustriousInsight = await(createItem("Lesser Illustrious Insight", 200, null, null, null, "Optional Reagent that increases Skill when crafting a smaller item by 30. Made with Artisan's Mettle by all professions. 5 Lesser Illustrious Insight can combine into 1 Illustrious Insight."));

        //tailoring drops & items
        const tatteredWildercloth = await(createItem("Tattered Wildercloth", 1000, null, null, null, "Lesser cloth for Tailors. 5 of them can be spun into Spool(s) of Wilderthread."));
        const wildercloth = await(createItem("Wildercloth", 1000, null, null, null, "Standard cloth for Tailors. Can be spun into Spools, but this is the only dropped cloth that can actually be used in recipes, so I wouldn't."));
        const decayedWildercloth = await(createItem("Decayed Wildercloth", 1000, null, null, null, "Cloth infused with decay. 5 of them can be spun into Spools of Wilderthread."));
        const frostbittenWildercloth = await(createItem("Frostbitten Wildercloth", 1000, null, null, null, "Cloth infused with frost. 5 of them can be spun into Spools of Wilderthread."));
        const singedWildercloth = await(createItem("Singed Wildercloth", 1000, null, null, null, "Cloth infused with fire. 5 of them can be spun into Spools of Wilderthread."));
        const spoolOfWilderthread = await(createItem("Spool of Wilderthread", 1000, null, null, null, "Tailoring reagent, used by spinning 5 cloth together."));
        const chronoclothBolt = await(createItem("Chronocloth Bolt", 1000, null, null, null, "Specialty cloth for Tailors used to craft high-end cloth pieces. Has a CD on crafting."));
        const azureweaveBolt = await(createItem("Azureweave Bolt", 1000, null, null, null, "Specialty cloth for Tailors used to craft high-end cloth pieces. Has a CD on crafting."));

        //LW & skinning drops & items
        const contouredFowlfeather = await(createItem("Contoured Fowlfeather", 1000));
        const resilientLeather = await(createItem("Resilient Leather", 1000));
        const adamantScales = await(createItem("Adamant Scales", 1000));
        const denseHide = await(createItem("Dense Hide", 1000));
        const lustrousScaledHide = await(createItem("Lustrous Scaled Hide", 1000));
        
        const crystalspineFur = await(createItem("Crystalspine Fur", 1000));
        const salamantherScales = await(createItem("Salamanther Scales", 1000));
        const cacophonousThunderscale = await(createItem("Cacophonous Thunderscale", 1000));
        const fireInfusedHide = await(createItem("Fire-Infused Hide", 1000));
        const rockfangLeather = await(createItem("Rockfang Leather", 1000));
        const pristineVorquinHorn = await(createItem("Pristine Vorquin Horn", 1000));
        const windsongPlumage = await(createItem("Windsong Plumage", 1000));
        const flawlessProtoDragonScale = await(createItem("Flawless Proto Dragon Scale", 1000));

        //mining, BS, & JC drops & items
        const sereviteOre = await(createItem("Serevite Ore", 1000));
        const draconiumOre = await(createItem("Draconium Ore", 1000));
        const khazgoriteOre = await(createItem("Khaz'gorite Ore", 1000));

        //herb, alch, & inscription drops & items
        const hochenblume = await(createItem("Hochenblume", 1000));
        const saxifrage = await(createItem("Saxifrage", 1000));
        const bubblePoppy = await(createItem("Bubble Poppy", 1000));
        const writhebark = await(createItem("Writhebark", 1000));
        const primalConvergent = await(createItem("Primal Convergent", 1000));
        const omniumDraconis = await(createItem("Omnium Draconis", 1000));

        //cooking & fishing drops & items
        const maybeMeat = await(createItem("Maybe Meat", 1000));
        const ribbedMolluskMeat = await(createItem("Ribbed Mollusk Meat", 1000));
        const waterfowlFilet = await(createItem("Waterfowl Filet", 1000));
        const hornswogHunk = await(createItem("Hornswog Hunk", 1000));
        const basiliskEggs = await(createItem("Basilisk Eggs", 1000));
        const bruffalonFlank = await(createItem("Bruffalon Flank", 1000));
        const mightyMammothRibs = await(createItem("Mighty Mammoth Ribs", 1000));
        const burlyBearHaunch = await(createItem("Burly Bear Haunch", 1000));
        const saltDeposit = await(createItem("Salt Deposit", 1000));
        const lavaBeetle = await(createItem("Lava Beetle", 1000));
        const scalebellyMackerel = await(createItem("Scalebelly Mackerel", 1000));
        const thousandbitePiranha = await(createItem("Thousandbite Piranha", 1000));
        const aileronSeamoth = await(createItem("Aileron Seamoth", 1000));
        const ceruleanSpinefish = await(createItem("Cerulean Spinefish", 1000));
        const temporalDragonhead = await(createItem("Temporal Dragonhead", 1000));
        const islefinDorado = await(createItem("Islefin Dorado", 1000));
        const magmaThresher = await(createItem("Magma Thresher", 1000));
        const prismaticLeaper = await(createItem("Prismatic Leaper", 1000));
        const frostedRimefinTuna = await(createItem("Frosted Rimefin Tuna", 1000));
        const snowball = await(createItem("Snowball", 1000));
        const hornOMead = await(createItem("Horn O' Mead", 1000));
        const buttermilk = await(createItem("Buttermilk", 1000));
        const ohnahranPotato = await(createItem("Ohn'ahran Potato", 1000));
        const threeCheeseBlend = await(createItem("Three-Cheese Blend", 1000));
        const pastryPackets = await(createItem("Pastry Packets", 1000));
        const convenientlyPackagedIngredients = await(createItem("Conveniently Packaged Ingredients", 1000));
        const thaldraszianCocoaPowder = await(createItem("Thaldraszian Cocoa Powder", 1000));

        // MADE WITH PROFESSIONS
        


        //tailoring items
        const wilderclothBandage = await(createItem("Wildercloth Bandage", 1000));
        const surveyorsClothBands = await(createItem("Surveyor's Cloth Bands", 1, 306, 316));
        const surveyorsClothTreads = await(createItem("Surveyor's Cloth Treads", 1, 306, 316));
        const surveyorsClothRobe = await(createItem("Surveyor's Cloth Robe", 1, 306, 316));
        const wilderclothBolt = await(createItem("Wildercloth Bolt", 1000));
        const surveyorsSeasonedCord = await(createItem("Surveyor's Seasoned Cord", 1, 333, 343));
        const surveyorsSeasonedGloves = await(createItem("Surveyor's Seasoned Gloves", 1, 333, 343));
        const surveyorsSeasonedHood = await(createItem("Surveyor's Seasoned Hood", 1, 333, 343));
        const surveyorsSeasonedPants = await(createItem("Surveyor's Seasoned Pants", 1, 333, 343));
        const surveyorsSeasonedShoulders = await(createItem("Surveyor's Seasoned Shoulders", 1, 333, 343));
        const surveyorsTailoredCloak = await(createItem("Surveyor's Tailored Cloak", 1, 333, 343));
        const vibrantWilderclothBolt = await(createItem("Vibrant Wildercloth Bolt", 1000));
        const infuriousWilderclothBolt = await(createItem("Infurious Wildercloth Bolt", 1000));
        const blueSilkenLining = await(createItem("Blue Silken Lining", 1000));
        const bronzedGripWrappings = await(createItem("Bronzed Grip Wrappings", 1000));
        const abrasivePolishingCloth = await(createItem("Abrasive Polishing Cloth", 1000));
        const vibrantPolishingCloth = await(createItem("Vibrant Polishing Cloth", 1000));
        const chromaticEmbroideryThread = await(createItem("Chromatic Embroidery Thread", 1000));
        const shimmeringEmbroideryThread = await(createItem("Shimmering Embroidery Thread", 1000));
        const blazingEmbroideryThread = await(createItem("Blazing Embroidery Thread", 1000));
        const vibrantWilderclothGirdle = await(createItem("Vibrant Wildercloth Girdle", 1, 382, 392));
        const vibrantWilderclothHandwraps = await(createItem("Vibrant Wildercloth Handwraps", 1, 382, 392));
        const vibrantWilderclothHeadcover = await(createItem("Vibrant Wildercloth Headcover", 1, 382, 392));
        const vibrantWilderclothShawl = await(createItem("Vibrant Wildercloth Shawl", 1, 382, 392));
        const vibrantWilderclothShoulderspikes = await(createItem("Vibrant Wildercloth Shoulderspikes", 1, 382, 392));
        const vibrantWilderclothSlacks = await(createItem("Vibrant Wildercloth Slacks", 1, 382, 392));
        const vibrantWilderclothSlippers = await(createItem("Vibrant Wildercloth Slippers", 1, 382, 392));
        const vibrantWilderclothVestments = await(createItem("Vibrant Wildercloth Vestments", 1, 382, 392));
        const vibrantWilderclothWristwraps = await(createItem("Vibrant Wildercloth Wristwraps", 1, 382, 392));
        //need to put pvp ilvls for the next set
        const crimsonCombatantsWilderclothBands = await(createItem("Crimson Combatant's Wildercloth Bands", 1, 333, 343));
        const crimsonCombatantsWilderclothCloak = await(createItem("Crimson Combatant's Wildercloth Cloak", 1, 333, 343));
        const crimsonCombatantsWilderclothGloves = await(createItem("Crimson Combatant's Wildercloth Gloves", 1, 333, 343));
        const crimsonCombatantsWilderclothHood = await(createItem("Crimson Combatant's Wildercloth Hood", 1, 333, 343));
        const crimsonCombatantsWilderclothLeggings = await(createItem("Crimson Combatant's Wildercloth Leggings", 1, 333, 343));
        const crimsonCombatantsWilderclothSash = await(createItem("Crimson Combatant's Wildercloth Sash", 1, 333, 343));
        const crimsonCombatantsWilderclothShoulderpads = await(createItem("Crimson Combatant's Wildercloth Shoulderpads", 1, 333, 343));
        const crimsonCombatantsWilderclothTreads = await(createItem("Crimson Combatant's Wildercloth Treads", 1, 333, 343));
        const crimsonCombatantsWilderclothTunic = await(createItem("Crimson Combatant's Wildercloth Tunic", 1, 333, 343));
        //pvp done
        const amiceOfTheBlue = await(createItem("Amice of the Blue", 1, 382, 392));
        const azureweaveMantle = await(createItem("Azureweave Mantle", 1, 382, 392));
        const azureweaveRobe = await(createItem("Azureweave Robe", 1, 382, 392));
        const azureweaveSlippers = await(createItem("Azureweave Slippers", 1, 382, 392));
        const blueDragonSoles = await(createItem("Blue Dragon Soles", 1, 382, 392));
        //below item needs pvp ilvl
        const infuriousBindingOfGesticulation = await(createItem("Infurious Binding of Gesticulation", 1, 382, 392));
        const alliedWristguardsOfTimeDilation = await(createItem("Allied Wristguards of Time Dilation", 1, 382, 392));
        const chronoclothGloves = await(createItem("Chronocloth Gloves", 1, 382, 392));
        const chronoclothLeggings = await(createItem("Chronocloth Leggings", 1, 382, 392));
        const chronoclothSash = await(createItem("Chronocloth Sash", 1, 382, 392));
        const hoodOfSurgingTime = await(createItem("Hood of Surging Time", 1, 382, 392));
        //below item needs pvp ilvl
        const infuriousLegwrapsOfPossibility = await(createItem("Infurious Legwraps of Possibility", 1, 382, 392));
        const dragonclothTailoringVestments = await(createItem("Dragoncloth Tailoring Vestments", 1, 382, 397));
        const mastersWilderclothAlchemistsRobe = await(createItem("Master's Wildercloth Alchemist's Robe", 1, 356, 371));
        const mastersWilderclothChefsHat = await(createItem("Master's Wildercloth Chef's Hat", 1, 356, 371));
        const mastersWilderclothEnchantersHat = await(createItem("Master's Wildercloth Enchanter's Hat", 1, 356, 371));
        const mastersWilderclothFishingCap = await(createItem("Master's Wildercloth Fishing Cap", 1, 356, 371));
        const mastersWilderclothGardeningHat = await(createItem("Master's Wildercloth Gardening Hat", 1, 356, 371));
        const wilderclothEnchantersHat = await(createItem("Wildercloth Enchanter's Hat", 1, 317, 332));
        const wilderclothAlchemistsRobe = await(createItem("Wildercloth Alchemist's Robe", 1, 317, 332));
        const wilderclothFishingCap = await(createItem("Wildercloth Fishing Cap", 1, 317, 332));
        const wilderclothChefsHat = await(createItem("Wildercloth Chef's Hat", 1, 317, 332));
        const wilderclothGardeningHat = await(createItem("Wildercloth Gardening Hat", 1, 317, 332));
        const wilderclothTailorsCoat = await(createItem("Wildercloth Tailor's Coat", 1, 317, 332));
        const frozenSpellthread = await(createItem("Frozen Spellthread", 1000));
        const temporalSpellthread = await(createItem("Temporal Spellthread", 1000));
        const vibrantSpellthread = await(createItem("Vibrant Spellthread", 1000));
        const azureweaveExpeditionPack = await(createItem("Azureweave Expedition Pack"));
        const chronoclothReagentBag = await(createItem("Chronocloth Reagent Bag"));
        const wilderclothBag = await(createItem("Wildercloth Bag"));
        const simplyStitchedReagentBag = await(createItem("Simply Stitched Reagent Bag"));
        const explorersBannerOfGeology = await(createItem("Explorer's Banner of Geology"));
        const explorersBannerOfHerbology = await(createItem("Explorer's Banner of Herbology"));
        const duckStuffedDuckLovie = await(createItem("Duck-Stuffed Duck Lovie"));
        const forlornFuneralPall = await(createItem("Forlorn Funeral Pall"));
        const dragonscaleExpeditionsExpeditionTent = await(createItem("Dragonscale Expedition's Expedition Tent"));
        const coldCushion = await(createItem("Cold Cushion"));
        const cushionOfTimeTravel = await(createItem("Cushion of Time Travel"));
        const marketTent = await(createItem("Market Tent"));



        //engineering items
        const reinforcedMachineChassis = await(createItem("Reinforced Machine Chassis", 1000));
        const arclightCapacitor = await(createItem("Arclight Capacitor", 1000));
        const assortedSafetyFuses = await(createItem("Assorted Safety Fuses", 1000));
        const everburningBlastingPowder = await(createItem("Everburning Blasting Powder", 1000));
        const greasedUpGears = await(createItem("Greased-Up Gears", 1000));
        const shockSpringCoil = await(createItem("Shock-Spring Coil", 1000));
        const handfulOfSereviteBolts = await(createItem("Handful of Serevite Bolts", 1000));
        const overchargedOverclocker = await(createItem("Overcharged Overclocker", 1000));
        const haphazardlyTetheredWires = await(createItem("Haphazardly Tethered Wires", 1000));
        const calibratedSafetySwitch = await(createItem("Calibrated Safety Switch", 1000));
        const criticalFailurePreventionUnit = await(createItem("Critical Failure Prevention Unit", 1000));
        const magazineOfHealingDarts = await(createItem("Magazine of Healing Darts", 1000));
        const springLoadedCapacitorCasing = await(createItem("Spring-Loaded Capacitor Casing", 1000));
        const tinkerAlarmOTurret = await(createItem("Tinker: Alarm-O-Turret", 1000));
        const tinkerArclightVitalCorrectors = await(createItem("Tinker: Arclight Vital Correctors", 1000));
        const tinkerPolarityAmplifier = await(createItem("Tinker: Polarity Amplifier", 1000));
        const tinkerSupercollideOTron = await(createItem("Tinker: Supercollide-O-Tron", 1000));
        const tinkerGroundedCircuitry = await(createItem("Tinker: Grounded Circuitry", 1000));
        const tinkerBreathOfNeltharion = await(createItem("Tinker: Breath of Neltharion", 1000));
        const tinkerPlaneDisplacer = await(createItem("Tinker: Place Displacer", 1000));
        const battleReadyBinoculars = await(createItem("Battle-Ready Binoculars", 1, 382, 392));
        const lightweightOcularLenses = await(createItem("Lightweight Ocular Lenses", 1, 382, 392));
        const oscillatingWildernessOpticals = await(createItem("Oscillating Wilderness Opticals", 1, 382, 392));
        const peripheralVisionProjectors = await(createItem("Peripheral Vision Projectors", 1, 382, 392));
        const deadlineDeadeyes = await(createItem("Deadline Deadeyes", 1, 306, 316));
        const milestoneMagnifiers = await(createItem("Milestone Magnifiers", 1, 306, 316));
        const qualityAssuredOptics = await(createItem("Quality-Assured Optics", 1, 306, 316));
        const sentrysStabilizedSpecs = await(createItem("Sentry's Stabilized Specs", 1, 306, 316));
        const complicatedCuffs = await(createItem("Complicated Cuffs", 1, 382, 392));
        const difficultWristProtectors = await(createItem("Difficult Wrist Protectors", 1, 382, 392));
        const needlesslyComplexWristguards = await(createItem("Needlessly Complex Wristguards", 1, 382, 392));
        const overengineeredSleeveExtenders = await(createItem("Overengineered Sleeve Extenders", 1, 382, 392));
        const sophisticatedProblemSolver = await(createItem("Sophisticated Problem Solver", 1, 382, 392));
        const pewTwo = await(createItem("P.E.W. x2", 1, 333, 343));
        const meticulouslyTunedGear = await(createItem("Meticulously-Tuned Gear", 1000));
        const oneSizeFitsAllGear = await(createItem("One-Size-Fits-All Gear", 1000));
        const rapidlyTickingGear = await(createItem("Rapidly Ticking Gear", 1000));
        const razorSharpGear = await(createItem("Razor-Sharp Gear", 1000));
        const highIntensityThermalScanner = await(createItem("High Intensity Thermal Scanner", 1000));
        const projectilePropulsionPinion = await(createItem("Projectile Propulsion Pinion", 1000));
        const completelySafeRockets = await(createItem("Completely Safe Rockets", 1000));
        const endlessStackOfNeedles = await(createItem("Endless Stack of Needles", 1000));
        const gyroscopicKaleidoscope = await(createItem("Gyroscopic Kaleidoscope", 1000));
        const blackFireflight = await(createItem("Black Fireflight", 1000));
        const blueFireflight = await(createItem("Blue Fireflight", 1000));
        const bundleOfFireworks = await(createItem("Bundle of Fireworks", 1000));
        const greenFireflight = await(createItem("Green Fireflight", 1000));
        const redFireflight = await(createItem("Red Fireflight", 1000));
        const bronzeFireflight = await(createItem("Bronze Fireflight", 1000));
        const suspiciouslySilentCrate = await(createItem("Suspiciously Silent Crate", 1000));
        const suspiciouslyTickingCrate = await(createItem("Suspiciously Ticking Crate", 1000));
        const iwinButtonMkTen = await(createItem("I.W.I.N. Button Mk10", 1000));
        const ezThroGreaseGrenade = await(createItem("EZ-Thro Grease Grenade", 1000));
        const ezThroCreatureCombustionCanister = await(createItem("EZ-Thro Creature Combustion Canister", 1000));
        const ezThroGravitationalDisplacer = await(createItem("EZ-Thro Gravitational Displacer", 1000));
        const ezThroPrimalDeconstructionCharge = await(createItem("EZ-Thro Primal Deconstruction Charge", 1000));
        const stickyWarpGrenade = await(createItem("Sticky Warp Grenade", 1000));
        const greaseGrenade = await(createItem("Grease Grenade", 1000));
        const gravitationalDisplacer = await(createItem("Gravitational Displacer", 1000));
        const primalDeconstructionCharge = await(createItem("Primal Deconstruction Charge", 1000));
        const creatureCombustionCanister = await(createItem("Creature Combustion Canister", 1000));
        const savior = await(createItem("S.A.V.I.O.R.", 1000));
        const zapthrottleSoulInhaler = await(createItem("Zapthrottle Soul Inhaler"));
        const cartomancyCannon = await(createItem("Cartomancy Cannon"));
        const centralizedPrecipitationEmitter = await(createItem("Centralized Precipitation Emitter"));
        const elementInfusedRocketHelmet = await(createItem("Element-Infused Rocket Helmet"));
        const environmentalEmulator = await(createItem("Environmental Emulator"));
        const giggleGoggles = await(createItem("Giggle Goggles"));
        const help = await(createItem("H.E.L.P."));
        const expeditionMultiToolbox = await(createItem("Expedition Multi-Toolbox"));
        const tinkerRemovalKit = await(createItem("Tinker Removal Kit"));
        const wyrmholeGenerator = await(createItem("Wyrmhole Generator"));
        const portableAlchemistsLabBench = await(createItem("Portable Alchemist's Lab Bench"));
        const portableTinkersWorkbench = await(createItem("Portable Tinker's Workbench"));
        const neuralSilencerMkThree = await(createItem("Neural Silencer Mk3", 1000));
        const khazgoriteBrainwaveAmplifier = await(createItem("Khaz'gorite Brainwave Amplifier", 1, 356, 371));
        const khazgoriteDelversHelmet = await(createItem("Khaz'gorite Delver's Helmet", 1, 356, 371));
        const khazgoriteEncasedSamophlange = await(createItem("Khaz'gorite Encased Samophlange", 1, 356, 371));
        const khazgoriteFisherfriend = await(createItem("Khaz'gorite Fisherfriend", 1, 356, 371));
        const lapidarysKhazgoriteClamps = await(createItem("Lapidary's Khaz'gorite Clamps", 1, 356, 371));
        const springLoadedKhazgoriteFabricCutters = await(createItem("Spring-Loaded Khaz'gorite Fabric Cutters", 1, 356, 371));
        const bottomlessMireslushOreSatchel = await(createItem("Bottomless Mireslush Ore Satchel", 1, 356, 371));
        const bottomlessStonecrustOreSatchel = await(createItem("Bottomless Stonecrust Ore Satchel", 1, 317, 332));
        const draconiumBrainwaveAmplifier = await(createItem("Draconium Brainwave Amplifier", 1, 317, 332));
        const draconiumDelversHelmet = await(createItem("Draconium Delver's Helmet", 1, 317, 332));
        const draconiumEncasedSamophlange = await(createItem("Draconium Encased Samophlange", 1, 317, 332));
        const draconiumFisherfriend = await(createItem("Draconium Fisherfriend", 1, 317, 332));
        const lapidarysDraconiumClamps = await(createItem("Lapidary's Draconium Clamps", 1, 317, 332));
        const springLoadedDraconiumFabricCutters = await(createItem("Spring-Loaded Draconium Fabric Cutters", 1, 317, 332));
        const quackE = await(createItem("Quack-E"));
        const duckoy = await(createItem("D.U.C.K.O.Y.", 1000));



        //enchanting items
        const chromaticDust = await(createItem("Chromatic Dust", 1000, null, null, "Gathered by players with the Enchanting skill by disenchanting items. Can be bought and sold on the auction house.", "Received from DEing green items."));
        const vibrantShard = await(createItem("Vibrant Shard", 1000));
        const resonantCrystal = await(createItem("Resonant Crystal", 1000));
        const gracefulAvoidance = await(createItem("Graceful Avoidance"));
        const homeboundSpeed = await(createItem("Homebound Speed"));
        const regenerativeLeech = await(createItem("Regenerative Leech"));
        const writOfAvoidanceCloak = await(createItem("Writ of Avoidance (Cloak)"));
        const writOfLeechCloak = await(createItem("Writ of Leech (Cloak)"));
        const writOfSpeedCloak = await(createItem("Writ of Speed (Cloak)"));
        const acceleratedAgility = await(createItem("Accelerated Agility"));
        const reserveOfIntellect = await(createItem("Reserve of Intellect"));
        const sustainedStrength = await(createItem("Sustained Strength"));
        const wakingStats = await(createItem("Waking Stats"));
        const devotionOfAvoidance = await(createItem("Devotion of Avoidance"));
        const devotionOfLeech = await(createItem("Devotion of Leech"));
        const devotionOfSpeed = await(createItem("Devotion of Speed"));
        const writOfAvoidanceBracer = await(createItem("Writ of Avoidance (Bracer)"));
        const writOfLeechBracer = await(createItem("Writ of Leech (Bracer)"));
        const writOfSpeedBracer = await(createItem("Writ of Speed (Bracer)"));
        const plainsrunnersBreeze = await(createItem("Plainsrunner's Breeze"));
        const ridersReassurance = await(createItem("Rider's Reassurance"));
        const watchersLoam = await(createItem("Watcher's Loam"));
        const devotionOfCriticalStrike = await(createItem("Devotion of Critical Strike"));
        const devotionOfHaste = await(createItem("Devotion of Haste"));
        const devotionOfMastery = await(createItem("Devotion of Mastery"));
        const devotionOfVersatility = await(createItem("Devotion of Versatility"));
        const writOfCriticalStrike = await(createItem("Writ of Critical Strike"));
        const writOfHaste = await(createItem("Writ of Haste"));
        const writOfMastery = await(createItem("Writ of Mastery"));
        const writOfVersatility = await(createItem("Writ of Versatility"));
        const burningDevotion = await(createItem("Burning Devotion"));
        const earthenDevotion = await(createItem("Earthen Devotion"));
        const frozenDevotion = await(createItem("Frozen Devotion"));
        const sophicDevotion = await(createItem("Sophic Devotion"));
        const waftingDevotion = await(createItem("Wafting Devotion"));
        const burningWrit = await(createItem("Burning Writ"));
        const earthenWrit = await(createItem("Earthen Writ"));
        const frozenWrit = await(createItem("Frozen Writ"));
        const sophicWrit = await(createItem("Sophic Writ"));
        const waftingWrit = await(createItem("Wafting Writ"));
        const draconicDeftness = await(createItem("Draconic Deftness"));
        const draconicFinesse = await(createItem("Draconic Finesse"));
        const draconicInspiration = await(createItem("Draconic Inspiration"));
        const draconicPerception = await(createItem("Draconic Perception"));
        const draconicResourcefulness = await(createItem("Draconic Resourcefulness"));
        const torchOfPrimalAwakening = await(createItem("Torch of Primal Awakening", 1, 382, 392));
        const runedKhazgoriteRod = await(createItem("Runed Khaz'gorite Rod", 1, 356, 371));
        const runedDraconiumRod = await(createItem("Runed Draconium Rod", 1, 317, 332));
        const enchantedWrithebarkWand = await(createItem("Enchanted Writhebark Wand", 1, 333, 343));
        const runedSereviteRod = await(createItem("Runed Serevite Rod", 1, 270, 285));
        const illusionPrimalAir = await(createItem("Illusion: Primal Air"));
        const illusionPrimalEarth = await(createItem("Illusion: Primal Earth"));
        const illusionPrimalFire = await(createItem("Illusion: Primal Fire"));
        const illusionPrimalFrost = await(createItem("Illusion: Primal Frost"));
        const illusionPrimalMastery = await(createItem("Illusion: Primal Mastery"));
        const primalInvocationExtract = await(createItem("Primal Invocation Extract"));
        const khadgarsDisenchantingRod = await(createItem("Khadgar's Disenchanting Rod"));
        const illusoryAdornmentOrder = await(createItem("Illusory Adornment: Order"));
        const illusoryAdornmentAir = await(createItem("Illusory Adornment: Air"));
        const illusoryAdornmentEarth = await(createItem("Illusory Adornment: Earth"));
        const illusoryAdornmentFire = await(createItem("Illusory Adornment: Fire"));
        const illusoryAdornmentFrost = await(createItem("Illusory Adornment: Frost"));
        const scepterOfSpectacleOrder = await(createItem("Scepter of Spectacle: Order"));
        const scepterOfSpectacleAir = await(createItem("Scepter of Spectacle: Air"));
        const scepterOfSpectacleFrost = await(createItem("Scepter of Spectacle: Frost"));
        const scepterOfSpectacleEarth = await(createItem("Scepter of Spectacle: Earth"));
        const scepterOfSpectacleFire = await(createItem("Scepter of Spectacle: Fire"));
        const sophicAmalgamation = await(createItem("Sophic Amalgamation"));
        const crystalMagicalLockpick = await(createItem("Crystal Magical Lockpick", 1000));


        
        //alchemy items
        const dragonsAlchemicalSolution = await(createItem("Dragon's Alchemical Solution", 1000));
        const residualNeuralChannelingAgent = await(createItem("Residual Neural Channeling Agent", 1000));
        const bottledPutrescence = await(createItem("Bottled Putrescence", 1000));
        const potionOfGusts = await(createItem("Potion of Gusts", 1000));
        const potionOfShockingDisclosure = await(createItem("Potion of Shocking Disclosure", 1000));
        const potionOfTheHushedZephyr = await(createItem("Potion of the Hushed Zephyr", 1000));
        const aeratedManaPotion = await(createItem("Aerated Mana Potion", 1000));
        const potionOfChilledClarity = await(createItem("Potion of Chilled Clarity", 1000));
        const delicateSuspensionOfSpores = await(createItem("Delicate Suspension of Spores", 1000));
        const potionOfFrozenFocus = await(createItem("Potion of Frozen Focus", 1000));
        const potionOfWitheringVitality = await(createItem("Potion of Withering Vitality", 1000));
        const potionOfFrozenFatality = await(createItem("Potion of Frozen Fatality", 1000));
        const refreshingHealingPotion = await(createItem("Refreshing Healing Potion", 1000));
        const potionCauldronOfUltimatePower = await(createItem("Potion Cauldron of Ultimate Power", 1000));
        const potionCauldronOfPower = await(createItem("Potion Cauldron of Power", 1000));
        const cauldronOfThePooka = await(createItem("Cauldron of the Pooka", 1000));
        const elementalPotionOfUltimatePower = await(createItem("Elemental Potion of Ultimate Power", 1000));
        const elementalPotionOfPower = await(createItem("Elemental Potion of Power", 1000));
        const phialOfElementalChaos = await(createItem("Phial of Elemental Chaos", 1000));
        const phialOfChargedIsolation = await(createItem("Phial of Charged Isolation", 1000));
        const phialOfStaticEmpowerment = await(createItem("Phial of Static Empowerment", 1000));
        const phialOfStillAir = await(createItem("Phial of Still Air", 1000));
        const phialOfTheEyeInTheStorm = await(createItem("Phial of the Eye in the Storm", 1000));
        const aeratedPhialOfDeftness = await(createItem("Aerated Phial of Deftness", 1000));
        const chargedPhialOfAlacrity = await(createItem("Charged Phial of Alacrity", 1000));
        const aeratedPhialOfQuickHands = await(createItem("Aerated Phial of Quick Hands", 1000));
        const phialOfIcyPreservation = await(createItem("Phial of Icy Preservation", 1000));
        const icedPhialOfCorruptingRage = await(createItem("Iced Phial of Corrupting Rage", 1000));
        const phialOfGlacialFury = await(createItem("Phial of Glacial Fury", 1000));
        const steamingPhialOfFinesse = await(createItem("Steaming Phial of Finesse", 1000));
        const crystallinePhialOfPerception = await(createItem("Crystalline Phial of Perception", 1000));
        const phialOfTepidVersatility = await(createItem("Phial of Tepid Versatility", 1000));
        //next 2 aren't really items
        const transmuteDecayToElements = await(createItem("Transmute: Decay to Elements"));
        const transmuteOrderToElements = await(createItem("Transmute: Order to Elements"));
        //back to actual items
        const potionAbsorptionInhibitor = await(createItem("Potion Absorption Inhibitor", 1000));
        const writhefireOil = await(createItem("Writhefire Oil", 1000));
        const broodSalt = await(createItem("Brood Salt", 1000));
        const stableFluidicDraconium = await(createItem("Stable Fluidic Draconium", 1000));
        const agitatingPotionAugmentation = await(createItem("Agitating Potion Augmentation", 1000));
        const reactivePhialEmbellishment = await(createItem("Reactive Phial Embellishment", 1000));
        const sagaciousIncense = await(createItem("Sagacious Incense", 1000));
        const exultantIncense = await(createItem("Exultant Incense", 1000));
        const fervidIncense = await(createItem("Fervid Incense", 1000));
        const somniferousIncense = await(createItem("Somniferous Incense", 1000));
        const alacritousAlchemistStone = await(createItem("Alacritous Alchemist Stone", 1, 382, 392));
        const sustainingAlchemistStone = await(createItem("Sustaining Alchemist Stone", 1, 382, 392));



        //inscription items
        // const dragonIslesMilling = await(createItem("Dragon Isles Milling")); //not a real item
        const shimmeringPigment = await(createItem("Shimmering Pigment", 1000));
        const serenePigment = await(createItem("Serene Pigment", 1000));
        const flourishingPigment = await(createItem("Flourishing Pigment", 1000));
        const blazingPigment = await(createItem("Blazing Pigment", 1000));
        const cosmicInk = await(createItem("Cosmic Ink", 1000));
        const burnishedInk = await(createItem("Burnished Ink", 1000));
        const blazingInk = await(createItem("Blazing Ink", 1000));
        const flourishingInk = await(createItem("Flourishing Ink", 1000));
        const sereneInk = await(createItem("Serene Ink", 1000));
        const runedWrithebark = await(createItem("Runed Writhebark", 1000));
        const chilledRune = await(createItem("Chilled Rune", 1000));
        const draconicMissiveOfTheAurora = await(createItem("Draconic Missive of the Aurora", 1000));
        const draconicMissiveOfTheFeverflare = await(createItem("Draconic Missive of the Feverflare", 1000));
        const draconicMissiveOfTheFireflash = await(createItem("Draconic Missive of the Fireflash", 1000));
        const draconicMissiveOfTheHarmonious = await(createItem("Draconic Missive of the Harmonious", 1000));
        const draconicMissiveOfThePeerless = await(createItem("Draconic Missive of the Peerless", 1000));
        const draconicMissiveOfTheQuickblade = await(createItem("Draconic Missive of the Quickblade", 1000));
        const draconicMissiveOfCraftingSpeed = await(createItem("Draconic Missive of Crafting Speed", 1000));
        const draconicMissiveOfInspiration = await(createItem("Draconic Missive of Inspiration", 1000));
        const draconicMissiveOfMulticraft = await(createItem("Draconic Missive of Multicraft", 1000));
        const draconicMissiveOfResourcefulness = await(createItem("Draconic Missive of Resourcefulness", 1000));
        const draconicMissiveOfDeftness = await(createItem("Draconic Missive of Deftness", 1000));
        const draconicMissiveOfFinesse = await(createItem("Draconic Missive of Finesse", 1000));
        const draconicMissiveOfPerception = await(createItem("Draconic Missive of Perception", 1000));
        const darkmoonDeckBoxDance = await(createItem("Darkmoon Deck Box: Dance", 1, 382, 392));
        const darkmoonDeckBoxInferno = await(createItem("Darkmoon Deck Box: Inferno", 1, 382, 392));
        const darkmoonDeckBoxRime = await(createItem("Darkmoon Deck Box: Rime", 1, 382, 392));
        const darkmoonDeckBoxWatcher = await(createItem("Darkmoon Deck Box: Watcher", 1, 382, 392));
        const crackingCodexOfTheIsles = await(createItem("Cracking Codex of the Isles", 1, 382, 392));
        const illuminatingPillarOfTheIsles = await(createItem("Illuminating Pillar of the Isles", 1, 382, 392));
        const weatheredExplorersStave = await(createItem("Weathered Explorer's Stave", 1, 382, 392));
        const coreExplorersCompendium = await(createItem("Core Explorer's Compendium", 1, 333, 343));
        const overseersWrithebarkStave = await(createItem("Overseer's Writhebark Stave", 1, 333, 343));
        const pioneersWrithebarkStave = await(createItem("Pioneer's Writhebark Stave", 1, 333, 343));
        const emberscaleSigil = await(createItem("Emberscale Sigil", 1000));
        const jetscaleSigil = await(createItem("Jetscale Sigil", 1000));
        const sagescaleSigil = await(createItem("Sagescale Sigil", 1000));
        const azurescaleSigil = await(createItem("Azurescale Sigil", 1000));
        const bronzescaleSigil = await(createItem("Bronzescale Sigil", 1000));
        const vantusRuneVaultOfTheIncarnates = await(createItem("Vantus Rune: Vault of the Incarnates", 1000));
        const buzzingRune = await(createItem("Buzzing Rune", 1000));
        const chirpingRune = await(createItem("Chirping Rune", 1000));
        const howlingRune = await(createItem("Howling Rune", 1000));
        const alchemistsBrilliantMixingRod = await(createItem("Alchemist's Brilliant Mixing Rod", 1, 356, 371));
        const chefsSplendidRollingPin = await(createItem("Chef's Splendid Rolling Pin", 1, 356, 371));
        const scribesResplendentQuill = await(createItem("Scribe's Resplendent Quill", 1, 356, 371));
        const alchemistsSturdyMixingRod = await(createItem("Alchemist's Sturdy Mixing Rod", 1, 317, 332));
        const chefsSmoothRollingPin = await(createItem("Chef's Smooth Rolling Pin", 1, 317, 332));
        const scribesFastenedQuill = await(createItem("Scribe's Fastened Quill", 1, 317, 332));
        const illusionParchmentWhirlingBreeze = await(createItem("Illusion Parchment: Whirling Breeze", 1000));
        const illusionParchmentAquaTorrent = await(createItem("Illusion Parchment: Aqua Torrent", 1000));
        const illusionParchmentArcaneBurst = await(createItem("Illusion Parchment: Arcane Burst", 1000));
        const illusionParchmentChillingWind = await(createItem("Illusion Parchment: Chilling Wind", 1000));
        const illusionParchmentLoveCharm = await(createItem("Illusion Parchment: Love Charm", 1000));
        const illusionParchmentMagmaMissile = await(createItem("Illusion Parchment: Magma Missile", 1000));
        const illusionParchmentShadowOrb = await(createItem("Illusion Parchment: Shadow Orb", 1000));
        const illusionParchmentSpellShield = await(createItem("Illusion Parchment: Spell Shield", 1000));
        const scrollOfSales = await(createItem("Scroll of Sales", 1000));
        const bundleOCardsDragonIsles = await(createItem("Bundle O' Cards: Dragon Isles"));
        const fatedFortuneCard = await(createItem("Fated Fortune Card", 1000));
        //4 extractions of awakened elements, but like, they just yield awakened elements...
        const contractIskaaraTuskarr = await(createItem("Contract: Iskaara Tuskarr", 1000));
        const contractArtisansConsortium = await(createItem("Contract: Artisan's Consortium", 1000));
        const contractDragonscaleExpedition = await(createItem("Contract: Dragonscale Expedition", 1000));
        const contractMaruukCentaur = await(createItem("Contract: Maruuk Centaur", 1000));
        const contractValdrakkenAccord = await(createItem("Contract: Valdrakken Accord", 1000));
        const draconicTreatiseOnAlchemy = await(createItem("Draconic Treatise on Alchemy", 1000));
        const draconicTreatiseOnBlacksmithing = await(createItem("Draconic Treatise on Blacksmithing", 1000));
        const draconicTreatiseOnEnchanting = await(createItem("Draconic Treatise on Enchanting", 1000));
        const draconicTreatiseOnEngineering = await(createItem("Draconic Treatise on Engineering", 1000));
        const draconicTreatiseOnHerbalism = await(createItem("Draconic Treatise on Herbalism", 1000));
        const draconicTreatiseOnInscription = await(createItem("Draconic Treatise on Inscription", 1000));
        const draconicTreatiseOnJewelcrafting = await(createItem("Draconic Treatise on Jewelcrafting", 1000));
        const draconicTreatiseOnLeatherworking = await(createItem("Draconic Treatise on Leatherworking", 1000));
        const draconicTreatiseOnMining = await(createItem("Draconic Treatise on Mining", 1000));
        const draconicTreatiseOnSkinning = await(createItem("Draconic Treatise on Skinning", 1000));
        const draconicTreatiseOnTailoring = await(createItem("Draconic Treatise on Tailoring", 1000));
        const renewedProtoDrakeSilverAndBlueArmor = await(createItem("Renewed Proto-Drake: Silver and Blue Armor"));
        const renewedProtoDrakeSteelAndYellowArmor = await(createItem("Renewed Proto-Drake: Steel and Yellow Armor"));
        const renewedProtoDrakeBovineHorns = await(createItem("Renewed Proto-Drake: Bovine Horns"));
        const renewedProtoDrakePredatorPattern = await(createItem("Renewed Proto-Drake: Predator Pattern"));
        const renewedProtoDrakeSpinedCrest = await(createItem("Renewed Proto-Drake: Spined Crest"));
        const windborneVelocidrakeSilverAndBlueArmor = await(createItem("Windborne Velocidrake: Silver and Blue Armor"));
        const windborneVelocidrakeSteelAndOrangeArmor = await(createItem("Windborne Velocidrake: Steel and Orange Armor"));
        const windborneVelocidrakeBlackHair = await(createItem("Windborne Velocidrake: Black Hair"));
        const windborneVelocidrakeSpinedHead = await(createItem("Windborne Velocidrake: Spined Head"));
        const windborneVelocidrakeWindsweptPattern = await(createItem("Windborne Velocidrake: Windswept Pattern"));
        const highlandDrakeSilverAndBlueArmor = await(createItem("Highland Drake: Silver and Blue Armor"));
        const highlandDrakeSteelAndYellowArmor = await(createItem("Highland Drake: Steel and Yellow Armor"));
        const highlandDrakeBlackHair = await(createItem("Highland Drake: Black Hair"));
        const highlandDrakeSpinedCrest = await(createItem("Highland Drake: Spined Crest"));
        const highlandDrakeSpinedThroat = await(createItem("Highland Drake: Spined Throat"));
        const cliffsideWylderdrakeSilverAndBlueArmor = await(createItem("Cliffside Wylderdrake: Silver and Blue Armor"));
        const cliffsideWylderdrakeSteelAndYellowArmor = await(createItem("Cliffside Wylderdrake: Steel and Yellow Armor"));
        const cliffsideWylderdrakeConicalHead = await(createItem("Cliffside Wylderdrake: Conical Head"));
        const cliffsideWylderdrakeRedHair = await(createItem("Cliffside Wylderdrake: Red Hair"));
        const cliffsideWylderdrakeTripleHeadHorns = await(createItem("Cliffside Wylderdrake: Triple Head Horns"));



        //jewelcrafting items
        const silkenGemdust = await(createItem('Silken Gemdust', 1000));
        const queensRuby = await(createItem("Queen's Ruby", 1000));
        const mysticSapphire = await(createItem('Mystic Sapphire', 1000));
        const vibrantEmerald = await(createItem('Vibrant Emerald', 1000));
        const sunderedOnyx = await(createItem('Sundered Onyx', 1000));
        const eternityAmber = await(createItem('Eternity Amber', 1000));
        const alexstraszite = await(createItem('Alexstraszite', 1000));
        const malygite = await(createItem('Malygite', 1000));
        const ysemerald = await(createItem('Ysemerald', 1000));
        const neltharite = await(createItem('Neltharite', 1000));
        const nozdorite = await(createItem('Nozdorite', 1000));
        const illimitedDiamond = await(createItem('Illimited Diamond', 1000));
        const elementalHarmony = await(createItem("Elemental Harmony", 1000));
        const blottingSand = await(createItem("Blotting Sand", 1000));
        const pounce = await(createItem("Pounce", 1000));
        const emptySoulCage = await(createItem("Empty Soul Cage", 1000));
        const draconicVial = await(createItem("Draconic Vial", 1000));
        const framelessLens = await(createItem("Frameless Lens", 1000));
        const glossyStone = await(createItem({name: 'Glossy Stone', stacksTo: 1000}));
        const shimmeringClasp = await(createItem("Shimmering Clasp", 1000));
        const energizedVibrantEmerald = await(createItem("Energized Vibrant Emerald", 1000));
        const zenMysticSapphire = await(createItem("Zen Mystic Sapphire", 1000));
        const craftyQueensRuby = await(createItem("Crafy Queen's Ruby", 1000));
        const senseisSunderedOnyx = await(createItem("Sensei's Sundered Onyx", 1000));
        const solidEternityAmber = await(createItem("Solid Eternity Amber", 1000));
        const quickYsemerald = await(createItem("Quick Ysemerald", 1000));
        const craftyAlexstraszite = await(createItem("Crafty Alexstraszite", 1000));
        const energizedMalygite = await(createItem("Energized Malygite", 1000));
        const forcefulNozdorite = await(createItem("Forceful Nozdorite", 1000));
        const keenNeltharite = await(createItem("Keen Neltharite", 1000));
        const puissantNozdorite = await(createItem("Puissant Nozdorite", 1000));
        const fracturedNeltharite = await(createItem("Fractured Neltharite", 1000));
        const keenYsemerald = await(createItem("Keen Ysemerald", 1000));
        const senseisAlexstraszite = await(createItem("Sensei's Alexstraszite", 1000));
        const zenMalygite = await(createItem("Zen Malygite", 1000));
        const radiantMalygite = await(createItem("Radiant Malygite", 1000));
        const craftyYsemerald = await(createItem("Crafty Ysemerald", 1000));
        const deadlyAlexstraszite = await(createItem("Deadly Alexstraszite", 1000));
        const jaggedNozdorite = await(createItem("Jagged Nozdorite", 1000));
        const senseisNeltharite = await(createItem("Sensei's Neltharite", 1000));
        const energizedYsemerald = await(createItem("Energized Ysemerald", 1000));
        const radiantAlexstraszite = await(createItem("Radiant Alexstraszite", 1000));
        const steadyNozdorite = await(createItem("Steady Nozdorite", 1000));
        const stormyMalygite = await(createItem("Stormy Malygite", 1000));
        const zenNeltharite = await(createItem("Zen Neltharite", 1000));
        const fierceIllimitedDiamond = await(createItem("Fierce Illimited Diamond", 1000));
        const inscribedIllimitedDiamond = await(createItem("Inscribed Illimited Diamond", 1000));
        const resplendentIllimitedDiamond = await(createItem("Resplendent Illimited Diamond", 1000));
        const skillfulIllimitedDiamond = await(createItem("Skillful Illimited Diamond", 1000));
        const tieredMedallionSetting = await(createItem("Tiered Medallion Setting", 1000));
        const idolOfTheDreamer = await(createItem("Idol of the Dreamer", 1, 382, 392));
        const idolOfTheEarthWarder = await(createItem("Idol of the Earth Warder", 1, 382, 392));
        const idolOfTheLifebinder = await(createItem("Idol of the Lifebinder", 1, 382, 392));
        const idolOfTheSpellWeaver = await(createItem("Idol of the Spell-Weaver", 1, 382, 392));
        const chokerOfShielding = await(createItem("Choker of Shielding", 1, 382, 392));
        const elementalLariat = await(createItem("Elemental Lariat", 1, 382, 392));
        const ringBoundHourglass = await(createItem("Ring-Bound Hourglass", 1, 382, 392));
        const signetOfTitanicInsight = await(createItem("Signet of Titanic Insight", 1, 382, 392));
        const torcOfPassedTime = await(createItem("Torc of Passed Time", 1, 382, 392));
        //next 2 need pvp ilvls
        const crimsonCombatantsJeweledAmulet = await(createItem("Crimson Combatant's Jeweled Amulet", 1, 333, 343));
        const crimsonCombatantsJeweledSignet = await(createItem("Crimson Combatant's Jeweled Signet", 1, 333, 343));
        const bandOfNewBeginnings = await(createItem("Band of New Beginnings", 1, 306, 316));
        const pendantOfImpendingPerils = await(createItem("Pendant of Impending Perils", 1, 306, 316));
        const djaradinsPinata = await(createItem(`Djaradin's "Pinata"`, 1000));
        const narcissistsSculpture = await(createItem("Narcissist's Sculpture", 1000));
        const kaluakFigurine = await(createItem("Kalu'ak Figurine", 1000));
        const statueOfTyrsHerald = await(createItem("Statue of Tyr's Herald", 1000));
        const revitalizingRedCarving = await(createItem("Revitalizing Red Carving", 1000));
        const jeweledAmberWhelpling = await(createItem("Jeweled Amber Whelpling"));
        const jeweledEmeraldWhelpling = await(createItem("Jeweled Emerald Whelpling"));
        const jeweledOnyxWhelpling = await(createItem("Jeweled Onyx Whelpling"));
        const jeweledRubyWhelpling = await(createItem("Jeweled Ruby Whelpling"));
        const jeweledSapphireWhelpling = await(createItem("Jeweled Sapphire Whelpling"));
        const convergentPrism = await(createItem("Convergent Prism"));
        const jeweledOffering = await(createItem("Jeweled Offering"));
        const projectionPrism = await(createItem("Projection Prism", 1000));
        const rhinestoneSunglasses = await(createItem('"Rhinestone" Sunglasses'));
        const splitLensSpecs = await(createItem("Split-Lens Specs"));
        const alexstrasziteLoupes = await(createItem("Alexstraszite Loupes", 1, 356, 371));
        const finePrintTrifocals = await(createItem("Fine-Print Trifocals", 1, 356, 371));
        const magnificentMarginMagnifier = await(createItem("Magnificent Margin Magnifier", 1, 356, 371));
        const resonantFocus = await(createItem("Resonant Focus", 1, 356, 371));
        const boldPrintBifocals = await(createItem("Bold-Print Bifocals", 1, 317, 332));
        const chromaticFocus = await(createItem("Chromatic Focus", 1, 317, 332));
        const leftHandedMagnifyingGlass = await(createItem("Left-Handed Magnifying Glass", 1, 317, 332));
        const sunderedOnyxLoupes = await(createItem("Sundered Onyx Loupes", 1, 317, 332));
        const jeweledDragonsHeart = await(createItem("Jeweled Dragon's Heart"));
        const dreamersVision = await(createItem("Dreamer's Vision"));
        const earthwardensPrize = await(createItem("Earthwarden's Prize"));
        const keepersGlory = await(createItem("Keeper's Glory"));
        const queensGift = await(createItem("Queen's Gift"));
        const timewatchersPatience = await(createItem("Timewatcher's Patience"));



        //blacksmithing items
        const obsidianSearedAlloy = await(createItem("Obsidian Seared Alloy", 1000));
        const frostfireAlloy = await(createItem("Frostfire Alloy", 1000));
        const infuriousAlloy = await(createItem("Infurious Alloy", 1000));
        const primalMoltenAlloy = await(createItem("Primal Molten Alloy", 1000));
        const armorSpikes = await(createItem("Armor Spikes", 1000));
        const alliedChestplateOfGenerosity = await(createItem("Allied Chestplate of Generosity", 1, 382, 392));
        const alliedWristguardOfCompanionship = await(createItem("Allied Wristguard of Companionship", 1, 382, 392));
        const frostfireLegguardsOfPreparation = await(createItem("Frostfire Legguards of Preparation", 1, 382, 392));
        //next two items need pvp ilvl
        const infuriousHelmOfVengeance = await(createItem("Infurious Helm of Vengeance", 1, 382, 392));
        const infuriousWarbootsOfImpunity = await(createItem("Infurious Warboots of Impunity", 1, 382, 392));
        const primalMoltenBreastplate = await(createItem("Primal Molten Breastplate", 1, 382, 392));
        const primalMoltenGauntlets = await(createItem("Primal Molten Gauntlets", 1, 382, 392));
        const primalMoltenGreatbelt = await(createItem("Primal Molten Greatbelt", 1, 382, 392));
        const primalMoltenHelm = await(createItem("Primal Molten Helm", 1, 382, 392));
        const primalMoltenLegplates = await(createItem("Primal Molten Legplates", 1, 382, 392));
        const primalMoltenPauldrons = await(createItem("Primal Molten Pauldrons", 1, 382, 392));
        const primalMoltenSabatons = await(createItem("Primal Molten Sabatons", 1, 382, 392));
        const primalMoltenVambraces = await(createItem("Primal Molten Vambraces", 1, 382, 392));
        const unstableFrostfireBelt = await(createItem("Unstable Frostfire Belt", 1, 382, 392));
        const explorersExpertHelm = await(createItem("Explorer's Expert Helm", 1, 333, 343));
        const explorersExpertSpaulders = await(createItem("Explorer's Expert Spaulders", 1, 333, 343));
        const explorersExpertGauntlets = await(createItem("Explorer's Expert Gauntlets", 1, 333, 343));
        const explorersExpertGreaves = await(createItem("Explorer's Expert Greaves", 1, 333, 343));
        const explorersExpertClasp = await(createItem("Explorer's Expert Clasp", 1, 333, 343));
        const explorersPlateChestguard = await(createItem("Explorer's Plate Chestguard", 1, 306, 316));
        const explorersPlateBoots = await(createItem("Explorer's Plate Boots", 1, 306, 316));
        const explorersPlateBracers = await(createItem("Explorer's Plate Bracers", 1, 306, 316));
        //all of the next bunch need pvp ilvls
        const crimsonCombatantsDraconiumArmguards = await(createItem("Crimson Combatant's Draconium Armguards", 1, 333, 343));
        const crimsonCombatantsDraconiumBreastplate = await(createItem("Crimson Combatant's Draconium Breastplate", 1, 333, 343));
        const crimsonCombatantsDraconiumGauntlets = await(createItem("Crimson Combatant's Draconium Gauntlets", 1, 333, 343));
        const crimsonCombatantsDraconiumGreaves = await(createItem("Crimson Combatant's Draconium Greaves", 1, 333, 343));
        const crimsonCombatantsDraconiumHelm = await(createItem("Crimson Combatant's Draconium Helm", 1, 333, 343));
        const crimsonCombatantsDraconiumPauldrons = await(createItem("Crimson Combatant's Draconium Pauldrons", 1, 333, 343));
        const crimsonCombatantsDraconiumSabatons = await(createItem("Crimson Combatant's Draconium Sabatons", 1, 333, 343));
        const crimsonCombatantsDraconiumWaistguard = await(createItem("Crimson Combatant's Draconium Waistguard", 1, 333, 343));
        //end of pvp block
        const primalMoltenDefender = await(createItem("Primal Molten Defender", 1, 382, 392));
        const shieldOfTheHearth = await(createItem("Shield of the Hearth", 1, 382, 392));
        const draconiumDefender = await(createItem("Draconium Defender", 1, 333, 343));
        const obsidianSearedClaymore = await(createItem("Obsidian Seared Claymore", 1, 382, 392));
        const obsidianSearedCrusher = await(createItem("Obsidian Seared Crusher", 1, 382, 392));
        const obsidianSearedFacesmasher = await(createItem("Obsidian Seared Facesmasher", 1, 382, 392));
        const obsidianSearedHalberd = await(createItem("Obsidian Seared Halberd", 1, 382, 392));
        const obsidianSearedHexsword = await(createItem("Obsidian Seared Hexsword", 1, 382, 392));
        const obsidianSearedInvoker = await(createItem("Obsidian Seared Invoker", 1, 382, 392));
        const obsidianSearedRuneaxe = await(createItem("Obsidian Seared Runeaxe", 1, 382, 392));
        const obsidianSearedSlicer = await(createItem("Obsidian Seared Slicer", 1, 382, 392));
        const primalMoltenGreataxe = await(createItem("Primal Molten Greataxe", 1, 382, 392));
        const primalMoltenLongsword = await(createItem("Primal Molten Longsword", 1, 382, 392));
        const primalMoltenMace = await(createItem("Primal Molten Mace", 1, 382, 392));
        const primalMoltenShortblade = await(createItem("Primal Molten Shortblade", 1, 382, 392));
        const primalMoltenSpellblade = await(createItem("Primal Molten Spellblade", 1, 382, 392));
        const primalMoltenWarglaive = await(createItem("Primal Molten Warglaive", 1, 382, 392));
        const draconiumGreatMace = await(createItem("Draconium Great Mace", 1, 333, 343));
        const draconiumStiletto = await(createItem("Draconium Stiletto", 1, 333, 343));
        const draconiumGreatAxe = await(createItem("Draconium Great Axe", 1, 333, 343));
        const draconiumKnuckles = await(createItem("Draconium Knuckles", 1, 333, 343));
        const draconiumSword = await(createItem("Draconium Sword", 1, 333, 343));
        const draconiumAxe = await(createItem("Draconium Axe", 1, 333, 343));
        const draconiumDirk = await(createItem("Draconium Dirk", 1, 333, 343));
        const blackDragonTouchedHammer = await(createItem("Black Dragon Touched Hammer", 1, 382, 397));
        const khazgoriteBlacksmithsHammer = await(createItem("Khaz'gorite Blacksmith's Hammer", 1, 356, 371));
        const khazgoriteBlacksmithsToolbox = await(createItem("Khaz'gorite Blacksmith's Toolbox", 1, 356, 371));
        const khazgoriteLeatherworkersKnife = await(createItem("Khaz'gorite Leatherworker's Knife", 1, 356, 371));
        const khazgoriteLeatherworkersToolset = await(createItem("Khaz'gorite Leatherworker's Toolset", 1, 356, 371));
        const khazgoriteNeedleSet = await(createItem("Khaz'gorite Needle Set", 1, 356, 371));
        const khazgoritePickaxe = await(createItem("Khaz'gorite Pickaxe", 1, 356, 371));
        const khazgoriteSickle = await(createItem("Khaz'gorite Sickle", 1, 356, 371));
        const khazgoriteSkinningKnife = await(createItem("Khaz'gorite Skinning Knife", 1, 356, 371));
        const draconiumNeedleSet = await(createItem("Draconium Needle Set", 1, 317, 332));
        const draconiumLeatherworkersKnife = await(createItem("Draconium Leatherworker's Knife", 1, 317, 332));
        const draconiumLeatherworkersToolset = await(createItem("Draconium Leatherworker's Toolset", 1, 317, 332));
        const draconiumBlacksmithsToolbox = await(createItem("Draconium Blacksmith's Toolbox", 1, 317, 332));
        const draconiumBlacksmithsHammer = await(createItem("Draconium Blacksmith's Hammer", 1, 317, 332));
        const draconiumSkinningKnife = await(createItem("Draconium Skinning Knife", 1, 317, 332));
        const draconiumSickle = await(createItem("Draconium Sickle", 1, 317, 332));
        const draconiumPickaxe = await(createItem("Draconium Pickaxe", 1, 317, 332));
        const mastersHammer = await(createItem("Master's Hammer"));
        const sturdyExpeditionShovel = await(createItem("Sturdy Expedition Shovel", 1000));
        const sereviteRepairHammer = await(createItem("Serevite Repair Hammer", 1000));
        const sereviteSkeletonKey = await(createItem("Serevite Skeleton Key", 1000));
        const primalRazorstone = await(createItem("Primal Razorstone", 1000));
        const primalWhetstone = await(createItem("Primal Whetstone", 1000));
        const primalWeightstone = await(createItem("Primal Weightstone", 1000));
        const alvinTheAnvil = await(createItem("Alvin the Anvil"));
        const prototypeExplorersBardingFramework = await(createItem("Prototype Explorer's Barding Framework"));
        const prototypeRegalBardingFramework = await(createItem("Prototype Regal Barding Framework"));



        //leatherworking items
        const lifeBoundBelt = await(createItem("Life-Bound Belt", 1, 382, 392));
        const lifeBoundBindings = await(createItem("Life-Bound Bindings", 1, 382, 392));
        const lifeBoundBoots = await(createItem("Life-Bound Boots", 1, 382, 392));
        const lifeBoundCap = await(createItem("Life-Bound Cap", 1, 382, 392));
        const lifeBoundChestpiece = await(createItem("Life-Bound Chestpiece", 1, 382, 392));
        const lifeBoundGloves = await(createItem("Life-Bound Gloves", 1, 382, 392));
        const lifeBoundShoulderpads = await(createItem("Life-Bound Shoulderpads", 1, 382, 392));
        const lifeBoundTrousers = await(createItem("Life-Bound Trousers", 1, 382, 392));
        const pioneersPracticedCowl = await(createItem("Pioneer's Practiced Cowl", 1, 333, 343));
        const pioneersPracticedLeggings = await(createItem("Pioneer's Practiced Leggings", 1, 333, 343));
        const pioneersPracticedShoulders = await(createItem("Pioneer's Practiced Shoulders", 1, 333, 343));
        const pioneersPracticedGloves = await(createItem("Pioneer's Practiced Gloves", 1, 333, 343));
        const pioneersPracticedBelt = await(createItem("Pioneer's Practiced Belt", 1, 333, 343));
        const pioneersLeatherTunic = await(createItem("Pioneer's Leather Tunic", 1, 306, 316));
        const pioneersLeatherBoots = await(createItem("Pioneer's Leather Boots", 1, 306, 316));
        const pioneersLeatherWristguards = await(createItem("Pioneer's Leather Wristguards", 1, 306, 316));
        const flameTouchedChain = await(createItem("Flame-Touched Chain", 1, 382, 392));
        const flameTouchedChainmail = await(createItem("Flame-Touched Chainmail", 1, 382, 392));
        const flameTouchedCuffs = await(createItem("Flame-Touched Cuffs", 1, 382, 392));
        const flameTouchedHandguards = await(createItem("Flame-Touched Handguards", 1, 382, 392));
        const flameTouchedHelmet = await(createItem("Flame-Touched Helmet", 1, 382, 392));
        const flameTouchedLegguards = await(createItem("Flame-Touched Legguards", 1, 382, 392));
        const flameTouchedSpaulders = await(createItem("Flame-Touched Spaulders", 1, 382, 392));
        const flameTouchedTreads = await(createItem("Flame-Touched Treads", 1, 382, 392));
        const trailblazersToughenedCoif = await(createItem("Trailblazer's Toughened Coif", 1, 333, 343));
        const trailblazersToughenedLegguards = await(createItem("Trailblazer's Toughened Legguards", 1, 333, 343));
        const trailblazersToughenedSpikes = await(createItem("Trailblazer's Toughened Spikes", 1, 333, 343));
        const trailblazersToughenedChainbelt = await(createItem("Trailblazer's Toughened Chainbelt", 1, 333, 343));
        const trailblazersScaleVest = await(createItem("Trailblazer's Scale Vest", 1, 306, 316));
        const trailblazersScaleBoots = await(createItem("Trailblazer's Scale Boots", 1, 306, 316));
        const trailblazersScaleBracers = await(createItem("Trailblazer's Scale Bracers", 1, 306, 316));
        const expertAlchemistsHat = await(createItem("Expert Alchemist's Hat", 1, 356, 371));
        const expertSkinnersCap = await(createItem("Expert Skinner's Cap", 1, 356, 371));
        const flameproofApron = await(createItem("Flameproof Apron", 1, 356, 371));
        const lavishFloralPack = await(createItem("Lavish Floral Pack", 1, 356, 371));
        const masterworkSmock = await(createItem("Masterwork Smock", 1, 356, 371));
        const reinforcedPack = await(createItem("Reinforced Pack", 1, 356, 371));
        const resplendentCover = await(createItem("Resplendent Cover", 1, 356, 371));
        const shockproofGloves = await(createItem("Shockproof Gloves", 1, 356, 371));
        const alchemistsHat = await(createItem("Alchemist's Hat", 1, 317, 332));
        const smithingApron = await(createItem("Smithing Apron", 1, 317, 332));
        const jewelersCover = await(createItem("Jeweler's Cover", 1, 317, 332));
        const protectiveGloves = await(createItem("Protective Gloves", 1, 317, 332));
        const durablePack = await(createItem("Durable Pack", 1, 317, 332));
        const floralBasket = await(createItem("Floral Basket", 1, 317, 332));
        const skinnersCap = await(createItem("Skinner's Cap", 1, 317, 332));
        const resilientSmock = await(createItem("Resilient Smock", 1, 317, 332));
        const bonewroughtCrossbow = await(createItem("Bonewrought Crossbow", 1, 317, 332));
        const ancestorsDewDrippers = await(createItem("Ancestor's Dew Drippers", 1, 382, 392));
        const flaringCowl = await(createItem("Flaring Cowl", 1, 382, 392));
        const oldSpiritsWristwraps = await(createItem("Old Spirit's Wristwraps", 1, 382, 392));
        const scaleReinGrips = await(createItem("Scale Rein Grips", 1, 382, 392));
        const snowballMakers = await(createItem("Snowball Makers", 1, 382, 392));
        const stringOfSpiritualKnickKnacks = await(createItem("String of Spiritual Knick-Knacks", 1, 382, 392));
        const windSpiritsLasso = await(createItem("Wind Spirit's Lasso", 1, 382, 392));
        const alliedHeartwarmingFurCoat = await(createItem("Allied Heartwarming Fur Coat", 1, 382, 392));
        const alliedLegguardsOfSansokKhan = await(createItem("Allied Legguards of Sansok Khan", 1, 382, 392));
        const bowOfTheDragonHunters = await(createItem("Bow of the Dragon Hunters", 1, 382, 392));
        //this block below need pvp ilvls
        const infuriousBootsOfReprieve = await(createItem("Infurious Boots of Reprieve", 1, 382, 392));
        const infuriousChainhelmProtector = await(createItem("Infurious Chainhelm Protector", 1, 382, 392));
        const infuriousFootwrapsOfIndemnity = await(createItem("Infurious Footwraps of Indemnity", 1, 382, 392));
        const infuriousSpiritsHood = await(createItem("Infurious Spirit's Hood", 1, 382, 392));
        const crimsonCombatantsAdamantChainmail = await(createItem("Crimson Combatant's Adamant Chainmail", 1, 333, 343));
        const crimsonCombatantsAdamantCowl = await(createItem("Crimson Combatant's Adamant Cowl", 1, 333, 343));
        const crimsonCombatantsAdamantCuffs = await(createItem("Crimson Combatant's Adamant Cuffs", 1, 333, 343));
        const crimsonCombatantsAdamantEpaulettes = await(createItem("Crimson Combatant's Adamant Epaulettes", 1, 333, 343));
        const crimsonCombatantsAdamantGauntlets = await(createItem("Crimson Combatant's Adamant Gauntlets", 1, 333, 343));
        const crimsonCombatantsAdamantGirdle = await(createItem("Crimson Combatant's Adamant Girdle", 1, 333, 343));
        const crimsonCombatantsAdamantLeggings = await(createItem("Crimson Combatant's Adamant Leggings", 1, 333, 343));
        const crimsonCombatantsAdamantTreads = await(createItem("Crimson Combatant's Adamant Treads", 1, 333, 343));
        const crimsonCombatantsResilientBelt = await(createItem("Crimson Combatant's Resilient Belt", 1, 333, 343));
        const crimsonCombatantsResilientBoots = await(createItem("Crimson Combatant's Resilient Boots", 1, 333, 343));
        const crimsonCombatantsResilientChestpiece = await(createItem("Crimson Combatant's Resilient Chestpiece", 1, 333, 343));
        const crimsonCombatantsResilientGloves = await(createItem("Crimson Combatant's Resilient Gloves", 1, 333, 343));
        const crimsonCombatantsResilientMask = await(createItem("Crimson Combatant's Resilient Mask", 1, 333, 343));
        const crimsonCombatantsResilientShoulderpads = await(createItem("Crimson Combatant's Resilient Shoulderpads", 1, 333, 343));
        const crimsonCombatantsResilientTrousers = await(createItem("Crimson Combatant's Resilient Trousers", 1, 333, 343));
        const crimsonCombatantsResilientWristwraps = await(createItem("Crimson Combatant's Resilient Wristwraps", 1, 333, 343));
        const acidicHailstoneTreads = await(createItem("Acidic Hailstone Treads", 1, 382, 392));
        const slimyExpulsionBoots = await(createItem("Slimy Expulsion Boots", 1, 382, 392));
        const toxicThornFootwraps = await(createItem("Toxic Thorn Footwraps", 1, 382, 392));
        const venomSteepedStompers = await(createItem("Venom-Steeped Stompers", 1, 382, 392));
        const witherrotTome = await(createItem("Witherrot Tome", 1, 382, 392));
        const finishedPrototypeExplorersBarding = await(createItem("Finished Prototype Explorer's Barding"));
        const finishedPrototypeRegalBarding = await(createItem("Finished Prototype Regal Barding"));
        const earthshineScales = await(createItem("Earthshine Scales", 1000));
        const frostbiteScales = await(createItem("Frostbite Scales", 1000));
        const infuriousHide = await(createItem("Infurious Hide", 1000));
        const infuriousScales = await(createItem("Infurious Scales", 1000));
        const mireslushHide = await(createItem("Mireslush Hide", 1000));
        const stonecrustHide = await(createItem("Stonecrust Hide", 1000));
        const fangAdornments = await(createItem("Fang Adornments", 1000));
        const toxifiedArmorPatch = await(createItem("Toxified Armor Patch", 1000));
        const frostedArmorKit = await(createItem("Frosted Armor Kit", 1000));
        const reinforcedArmorKit = await(createItem("Reinforced Armor Kit", 1000));
        const feralHideDrums = await(createItem("Feral Hide Drums", 1000));
        const artisansSign = await(createItem("Artisan's Sign"));
        const gnollTent = await(createItem("Gnoll Tent"));
        const tuskarrBeanBag = await(createItem("Tuskarr Bean Bag"));


        
        //cooking items
        const ooeyGooeyChocolate = await(createItem("Ooey-Gooey Chocolate", 1000));
        const impossiblySharpCuttingKnife = await(createItem("Impossibly Sharp Cutting Knife", 1000));
        const saladOnTheSide = await(createItem("Salad on the Side", 1000));
        const assortedExoticSpices = await(createItem("Assorted Exotic Spices", 1000));
        const pebbledRockSalts = await(createItem("Pebbled Rock Salts", 1000));
        const breakfastOfDraconicChampions = await(createItem("Breakfast of Draconic Champions", 1000));
        const sweetAndSourClamChowder = await(createItem("Sweet and Sour Clam Chowder", 1000));
        const probablyProtein = await(createItem("Probably Protein", 1000));
        const cheeseAndQuackers = await(createItem("Cheese and Quackers", 1000));
        const mackerelSnackerel = await(createItem("Mackerel Snackerel", 1000));
        const twiceBakedPotato = await(createItem("Twice-Baked Potato", 1000));
        const deliciousDragonSpittle = await(createItem("Delicious Dragon Spittle", 1000));
        const churnbellyTea = await(createItem("Churnbelly Tea", 1000));
        const zestyWater = await(createItem("Zesty Water", 1000));
        const fatedFortuneCookie = await(createItem("Fated Fortune Cookie", 1000));
        const blubberyMuffin = await(createItem("Blubbery Muffin", 1000));
        const celebratoryCake = await(createItem("Celebratory Cake", 1000));
        const snowInACone = await(createItem("Snow in a Cone", 1000));
        const tastyHatchlingsTreat = await(createItem("Tasty Hatchling's Treat", 1000));
        const braisedBruffalonBrisket = await(createItem("Braised Bruffalon Brisket", 1000));
        const charredHornswogSteaks = await(createItem("Charred Hornswog Steaks", 1000));
        const hopefullyHealthy = await(createItem("Hopefully Healthy", 1000));
        const riversidePicnic = await(createItem("Riverside Picnic", 1000));
        const roastDuckDelight = await(createItem("Roast Duck Delight", 1000));
        const saltedMeatMash = await(createItem("Salted Meat Mash", 1000));
        const scrambledBasiliskEggs = await(createItem("Scrambled Basilisk Eggs", 1000));
        const thriceSpicedMammothKabob = await(createItem("Thrice-Spiced Mammoth Kabob", 1000));
        const filetOfFangs = await(createItem("Filet of Fangs", 1000));
        const saltBakedFishcake = await(createItem("Salt-Baked Fishcake", 1000));
        const seamothSurprise = await(createItem("Seamoth Surprise", 1000));
        const timelyDemise = await(createItem("Timely Demise", 1000));
        const aromaticSeafoodPlatter = await(createItem("Aromatic Seafood Platter", 1000));
        const feistyFishSticks = await(createItem("Feisty Fish Sticks", 1000));
        const greatCeruleanSea = await(createItem("Great Cerulean Sea", 1000));
        const revengeServedCold = await(createItem("Revenge, Served Cold", 1000));
        const sizzlingSeafoodMedley = await(createItem("Sizzling Seafood Medley", 1000));
        const thousandboneTongueslicer = await(createItem("Thousandbone Tongueslicer", 1000));
        const grandBanquetOfTheKaluak = await(createItem("Grand Banquet of the Kalu'ak", 1000));
        const hoardOfDraconicDelicacies = await(createItem("Hoard of Draconic Delicacies", 1000));
        const yusasHeartyStew = await(createItem("Yusa's Hearty Stew", 1000));



    //
    // SEEDING RECIPES
    //

        /*base recipe method to copy/paste, and an example:
        
        */

        //alchemy recipes
        const primalConvergentRecipe = createRecipe("Primal Convergent", primalConvergent, 2, alchemy, [ [awakenedEarth, 1], [awakenedFire, 1], [awakenedAir, 1], [awakenedFrost, 1], [awakenedOrder, 1] ], 20, "Reagents", 1, 275, null, null, null, );

        // const dragonIslesUnraveling

    // const wilderclothBandageRecipe = await Recipe.create({name: 'Wildercloth Bandage', professionId: tailoring.id, itemId: wilderclothBandage.id, requiredProfessionLevel: 1, category: 'Assorted Embroidery', difficulty: 100, notes: "It's a bandage." }));
    // console.log('Data seeded successfully.'));

    // const professions = await Profession.findAll());
    // console.log("All professions:", JSON.stringify(professions, null, 2));
}

makeTables();