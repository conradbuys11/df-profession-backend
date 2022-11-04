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
    quality: { type: DataTypes.STRING }
    //has many Materials, Recipe(s)
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
    numberCrafted: { type: DataTypes.STRING, defaultValue: "1" },
    requiredProfessionLevel: { type: DataTypes.INTEGER },
    category: { type: DataTypes.STRING },
    skillUpAmount: { type: DataTypes.INTEGER, defaultValue: 1 },
    difficulty: { type: DataTypes.INTEGER, defaultValue: 0 },
    requiredRenownLevel: { type: DataTypes.JSONB },
    requiredSpecializationLevel: { type: DataTypes.JSONB },
    specialAcquisitionMethod: { type: DataTypes.STRING },
    notes: { type: DataTypes.STRING },
    requiredLocation: { type: DataTypes.STRING }
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
    reagentType: { type: DataTypes.STRING },
    requiredSpecializationLevel: { type: DataTypes.JSONB }
    //belongs to Recipe
},{
    underscored: true
});


// Specializations are too much work rn and is way better covered by wowhead, anyway.
// Maybe later. Focusing on Items & Recipes rn.


// const Specialization = sequelize.define('specialization', {
//     name: { type: DataTypes.STRING, allowNull: false },
//     description: { type: DataTypes.STRING },
//     totalPoints: { type: DataTypes.INTEGER, allowNull: false },
//     groupCrafts: { type: DataTypes.STRING },
//     eachPointGives: { type: DataTypes.STRING, defaultValue: "1 Skill" }
//     //has many Bonuses & Specializations
//     //belongs to Profession & Specialization
// },{
//     underscored: true
// });

// const Bonus = sequelize.define('bonus', {
//     level: { type: DataTypes.INTEGER, allowNull: false },
//     bonus: { type: DataTypes.STRING, allowNull: false }
//     //belongs to Specialization
// },{
//     underscored: true
// });


// setting up some ORM
Profession.hasMany(Recipe);
Recipe.belongsTo(Profession);

// Profession.hasMany(Specialization);
// Specialization.belongsTo(Profession);

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

// Specialization.hasMany(Bonus);
// Bonus.belongsTo(Specialization);

// Specialization.hasMany(Specialization));
// Specialization.belongsTo(Specialization));

const isNotNullAndUndefined = value => {
    return (value != undefined || value != null)
}

const makeIcon = fileName => {
    return `https://wow.zamimg.com/images/wow/icons/large/${fileName}.jpg`;
}

async function createProfession(name, icon){
    let profession = Profession.build({name: name});
    if(isNotNullAndUndefined(icon)){
        profession.icon = makeIcon(icon);
    }
    await profession.save();
    return profession;
}

async function createItem(name, stacksTo, itemLevelMin, itemLevelMax, description, notes, types, icon, quality){
    let item = Item.build({name: name});

    if(isNotNullAndUndefined(stacksTo)){ item.stacksTo = stacksTo; }
    if(isNotNullAndUndefined(itemLevelMin)){ item.itemLevelMin = itemLevelMin; }
    if(isNotNullAndUndefined(itemLevelMax)){ item.itemLevelMax = itemLevelMax; }
    if(isNotNullAndUndefined(description)){ item.description = description; }
    if(isNotNullAndUndefined(notes)){ item.notes = notes; }
    if(isNotNullAndUndefined(types)){ item.types = types; }
    if(isNotNullAndUndefined(icon)){ item.icon = makeIcon(icon); }
    if(isNotNullAndUndefined(quality)){ item.quality = quality; }
    await item.save();
    return item;
}

async function createRecipe(name, itemMade, numberCrafted, profession, materials, requiredProfLevel, category, skillUpAmount, difficulty,
    requiredRenownLevel, requiredSpecializationLevel, specialAcquisitionMethod, requiredLocation, notes, finishingReagents){
        let recipe = Recipe.build({itemId: itemMade.id, professionId: profession.id});

        if(isNotNullAndUndefined(name)){ recipe.name = name; } else { recipe.name = itemMade.name; } //item already has the name, right? easy
        if(isNotNullAndUndefined(numberCrafted)){ recipe.numberCrafted = numberCrafted.toString(); }
        if(isNotNullAndUndefined(requiredProfLevel)){ recipe.requiredProfessionLevel = requiredProfLevel; }
        if(isNotNullAndUndefined(category)){ recipe.category = category; }
        if(isNotNullAndUndefined(skillUpAmount)){ recipe.skillUpAmount = skillUpAmount; }
        if(isNotNullAndUndefined(difficulty)){ recipe.difficulty = difficulty; }
        if(isNotNullAndUndefined(requiredRenownLevel)){ recipe.requiredRenownLevel = requiredRenownLevel; }
        if(isNotNullAndUndefined(requiredSpecializationLevel)){ recipe.requiredSpecializationLevel = requiredSpecializationLevel; }
        if(isNotNullAndUndefined(specialAcquisitionMethod)){ recipe.specialAcquisitionMethod = specialAcquisitionMethod; }
        if(isNotNullAndUndefined(requiredLocation)){ recipe.requiredLocation = requiredLocation; }
        if(isNotNullAndUndefined(notes)){ recipe.notes = notes; }
        await recipe.save();
        // console.log(`${recipe.name}'s ID: ${recipe.id}`);

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
            ["Reagent Type", {SpecializationName: SpecializationLevel, OtherSpecializationName: SpecializationLevel, etc.}],
            etc.
        ]
        ie:
        [
            ["Lesser Illustrious Insight", {ChemicalSynthesis: 35}],
            ["Alchemical Catalyst", {PotionMastery: 30}]
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

async function createFinishingReagent(reagentType, requiredSpecializationLevel, recipe){
    let finishingReagent = FinishingReagent.build({reagentType: reagentType, requiredSpecializationLevel: requiredSpecializationLevel, recipeId: recipe.id})
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

        // const vendor = await(createProfession('Vendor'));
        // const worldDropAndGathering = await(createProfession('World Drop & Gathering'));
        const tailoring = await(createProfession('Tailoring', 'ui_profession_tailoring'));
        const enchanting = await(createProfession('Enchanting', 'ui_profession_enchanting'));
        const engineering = await(createProfession('Engineering', 'ui_profession_engineering'));
        const alchemy = await(createProfession('Alchemy', 'ui_profession_alchemy'));
        const inscription = await(createProfession('Inscription', 'ui_profession_inscription'));
        const jewelcrafting = await(createProfession('Jewelcrafting', 'ui_profession_jewelcrafting'));
        const blacksmithing = await(createProfession('Blacksmithing', 'ui_profession_blacksmithing'));
        const leatherworking = await(createProfession('Leatherworking', 'ui_profession_leatherworking'));
        const herbalism = await(createProfession('Herbalism', 'ui_profession_herbalism'));
        const mining = await(createProfession('Mining', 'ui_profession_mining'));
        const skinning = await(createProfession('Skinning', 'ui_profession_skinning'));
        const cooking = await(createProfession('Cooking', 'ui_profession_cooking'));
        const fishing = await(createProfession('Fishing', 'ui_profession_fishing'));
        const archaeology = await(createProfession('Archaeology', 'ui_profession_archaeology'));



    //
    // SEEDING ITEMS
    //

        //vendor items
        const primalFlux = await(createItem("Primal Flux", 1000, null, null, "Used for removing impurities from metal. Sold by Blacksmithing vendors.", "Blacksmithing Reagent, bought from vendors.", {otherType: "Crafting Reagent"}, "inv_herbalism_70_starlightrosedust", "Common"));
        const smudgedLens = await(createItem("Smudged Lens", 1000, null, null, "A misshapen piece of glass that is sufficient for use in the creation of goggles, assuming clear vision isn't a necessity. Can be purchased from Engineering suppliers across the Dragon Isles.", "Reagent for Engineering goggles, bought from vendors.", {otherType: "Crafting Reagent"}, "inv_misc_orb_yellow", "Common"));
        const enchantingVellum = await(createItem("Enchanting Vellum", 1000, null, null, "Enchanters can use vellum in place of a weapon or armor to store an enchantment for later use.", "Makes enchantments tradeable, bought from vendors.", null, "inv_inscription_armorscroll01", "Common"));
        const glitteringParchment = await(createItem("Glittering Parchment", 1000, null, null, "A sparkling parchment frequently used by Scribes. Can be purchased from vendors.", "Inscription Reagent, bought from vendors.", {otherType: "Crafting Reagent"}, "inv_inscription_parchmentvar06", "Common"));
        const iridescentWater = await(createItem("Iridescent Water", 1000, null, null, "A light and bubbly liquid frequently used by Scribes. Can be purchased from vendors.", "Inscription Reagent used to make inks, bought from vendors.", {otherType: "Crafting Reagent"}, "shaman_pvp_ripplingwaters", "Common"));
        const misshapenFiligree = await(createItem("Misshapen Filigree", 1000, null, null, "Purchased from Jewelcrafting vendors across the Dragon Isles. Can be bought and sold on the auction house.", "Jewelcrafting Reagent, bought from vendors.", {otherType: "Crafting Reagent"}, "inv_misc_primitive_ring29", "Common"));
        const draconicStopper = await(createItem("Draconic Stopper", 1000, null, null, null, "Reagent used for making Draconic Vials w/ Jewelcrafting. Bought from vendors.", {otherType: "Crafting Reagent"}, "trade_archaeology_vrykul_runestick", "Common"));
        const sereviteRod = await(createItem("Serevite Rod", 1, null, null, "Needed by an Enchanter to make a runed enchanting rod.", "A reagent for the most basic Enchanting tool.", {otherType: "Crafting Reagent"}, "inv_rod_platinum", "Common"));

        //dropped items
        const sparkOfIngenuity = await(createItem("Spark of Ingenuity", 1000, null, null, "Created by the Engine of Innovation in Valdrakken, this unique crafting material can help an item achieve expertise beyond that of mortal ability.", "Made with the Engine of Innovation in Valdrakken. More info later.", {otherType: "Crafting Reagent"}, "inv_10_misc_titansspark_color1", "Epic"));
        const artisansMettle = await(createItem("Artisans Mettle", 1000, null, null, "A mystery of the Dragon Isles, this reagent coalesces each time you gain more profession Knowledge. It has myriad uses, including for recrafting Dragon Isles crafted equipment.", "Received for first crafts, profession daily quests, and some other sources. Can be used to buy recipes from the Artisan's Consortium, make Illustrious Insight, or make higher level Profession Equipment.", {otherType: "Crafting Reagent"}, "inv_10_gearcraft_artisansmettle_color4", "Rare"));
        const primalChaos = await(createItem("Primal Chaos", 1000, null, null, "Formed from untamed elements attracted by the mightiest inhabitants of the Dragon Isles, it is essential for crafting powerful items and equipment.", "Reagent received from... dungeon & raid bosses? More info later.", {otherType: "Crafting Reagent"}, "inv_10_gearcraft_primalchaos_color1", "Epic"));
        const rousingAir = await(createItem("Rousing Air", 1000, null, null, null, "Received mostly from air elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened.", {otherType: "Crafting Reagent", onUse: "Turn ten Rousing Air into Awakened Air."}, "inv_10_elementalshardfoozles_air", "Rare"));
        const rousingEarth = await(createItem("Rousing Earth", 1000, null, null, null, "Received mostly from earth elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened.", {otherType: "Crafting Reagent", onUse: "Turn ten Rousing Earth into Awakened Earth."}, "inv_10_elementalshardfoozles_earth", "Rare"));
        const rousingFire = await(createItem("Rousing Fire", 1000, null, null, null, "Received mostly from fire elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened.", {otherType: "Crafting Reagent", onUse: "Turn ten Rousing Fire into Awakened Fire."}, "inv_10_elementalshardfoozles_fire", "Rare"));
        const rousingFrost = await(createItem("Rousing Frost", 1000, null, null, null, "Received mostly from ice elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened.", {otherType: "Crafting Reagent", onUse: "Turn ten Rousing Frost into Awakened Frost."}, "inv_10_elementalshardfoozles_frost", "Rare"));
        const rousingIre = await(createItem("Rousing Ire", 1000, null, null, "Gathered from various sources throughout the Dragon Isles while engaging in War Mode or from participating in instanced PvP.", "Received from pvp kills? I think? Lesser reagent. 10 Rousing can combine into 1 Awakened.", {otherType: "Crafting Reagent", onUse: "Turn ten Rousing Ire into Awakened Ire."}, "inv_10_elementalshardfoozles_blood", "Rare"));
        const rousingDecay = await(createItem("Rousing Decay", 1000, null, null, null, "Received mostly from decayed mobs. Lesser reagent. 10 Rousing can combine into 1 Awakened.", {otherType: "Crafting Reagent", onUse: "Turn ten Rousing Decay into Awakened Decay."}, "inv_10_elementalshardfoozles_decay", "Rare"));
        const rousingOrder = await(createItem("Rousing Order", 1000, null, null, null, "Received mostly from titan-touched gathering nodes. Lesser reagent. 10 Rousing can combine into 1 Awakened.", {otherType: "Crafting Reagent", onUse: "Turn ten Rousing Order into Awakened Order."}, "inv_10_elementalshardfoozles_titan", "Rare"));
        const awakenedAir = await(createItem("Awakened Air", 1000, null, null, null, "Received mostly from air elementals. Greater reagent. 1 Awakened can split into 10 Rousing.", {otherType: "Crafting Reagent", onUse: "Turn Awakened Air into ten Rousing Air."}, "inv_10_elementalcombinedfoozles_air", "Rare"));
        const awakenedEarth = await(createItem("Awakened Earth", 1000, null, null, null, "Received mostly from earth elementals. Greater reagent. 1 Awakened can split into 10 Rousing.", {otherType: "Crafting Reagent", onUse: "Turn Awakened Earth into ten Rousing Earth."}, "inv_10_elementalcombinedfoozles_earth", "Rare"));
        const awakenedFire = await(createItem("Awakened Fire", 1000, null, null, null, "Received mostly from fire elementals. Greater reagent. 1 Awakened can split into 10 Rousing.", {otherType: "Crafting Reagent", onUse: "Turn Awakened Fire into ten Rousing Fire."}, "inv_10_elementalcombinedfoozles_fire", "Rare"));
        const awakenedFrost = await(createItem("Awakened Frost", 1000, null, null, null, "Received mostly from ice elementals. Greater reagent. 1 Awakened can split into 10 Rousing.", {otherType: "Crafting Reagent", onUse: "Turn Awakened Frost into ten Rousing Frost."}, "inv_10_elementalcombinedfoozles_frost", "Rare"));
        const awakenedIre = await(createItem("Awakened Ire", 1000, null, null, "Gathered from various sources throughout the Dragon Isles while engaging in War Mode or from participating in instanced PvP.", "Received from pvp kills? I think? Greater reagent. 1 Awakened can split into 10 Rousing.", {otherType: "Crafting Reagent", onUse: "Turn Awakened Ire into ten Rousing Ire."}, "inv_10_elementalcombinedfoozles_blood", "Rare"));
        const awakenedDecay = await(createItem("Awakened Decay", 1000, null, null, null, "Received mostly from decayed mobs. Greater reagent. 1 Awakened can split into 10 Rousing.", {otherType: "Crafting Reagent", onUse: "Turn Awakened Decay into ten Rousing Decay."}, "inv_10_elementalcombinedfoozles_decay", "Rare"));
        const awakenedOrder = await(createItem("Awakened Order", 1000, null, null, null, "Received mostly from titan-touched gathering nodes. Greater reagent. 1 Awakened can split into 10 Rousing.", {otherType: "Crafting Reagent", onUse: "Turn Awakened Order into ten Rousing Order."}, "inv_10_elementalcombinedfoozles_titan", "Rare"));
        const airySoul = await(createItem("Airy Soul", 1000, null, null, "A wispy soul captured from a powerful elemental foe with a Zapthrottle Soul Inhaler, crafted by Engineers.", "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on an air elemental.", {otherType: "Crafting Reagent", bindOn: "pickup"}, "inv_elementalspiritfoozles_air", "Rare"));
        const fierySoul = await(createItem("Fiery Soul", 1000, null, null, "A smoldering soul captured from a powerful elemental foe with a Zapthrottle Soul Inhaler, crafted by Engineers.", "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on a fire elemental.", {otherType: "Crafting Reagent", bindOn: "pickup"}, "inv_elementalspiritfoozles_fire", "Rare"));
        const frostySoul = await(createItem("Frosty Soul", 1000, null, null, "A glacial soul captured from a powerful elemental foe with a Zapthrottle Soul Inhaler, crafted by Engineers.", "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on an ice elemental.", {otherType: "Crafting Reagent", bindOn: "pickup"}, "inv_elementalspiritfoozles_frost", "Rare"));
        const earthenSoul = await(createItem("Earthen Soul", 1000, null, null, "A terraceous soul captured from a powerful elemental foe with a Zapthrottle Soul Inhaler, crafted by Engineers.", "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on an earth elemental.", {otherType: "Crafting Reagent", bindOn: "pickup"}, "inv_elementalspiritfoozles_earth", "Rare"));
        const centaursTrophyNecklace = await(createItem("Centaur's Trophy Necklace", 1000, null, null, "A decorative necklace to show one's prowess while hunting as a group. Received rarely when participating in Centaur Hunts.", "Received from Centaur Wild Hunts?", {otherType: "Crafting Reagent", bindOn: "pickup"}, "inv_misc_necklace_feather10", "Rare"));
        const titanTrainingMatrixOne = await(createItem("Titan Training Matrix I", 200, null, null, "Unfortunately, nobody can be told what the Titan Matrix is. You have to see it for yourself.", "Sets ilvl of crafted piece to 333-343, binds on pickup, and requires Level 64.", {otherType: "Optional Crafting Reagent", bindOn: "pickup", effect: "Set Item Level based on Crafting Quality (333 - 343), add Soulbound and Required Level 64."}, "achievement_dungeon_ulduar77_10man", "Rare"));
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
        const contouredFowlfeather = await(createItem("Contoured Fowlfeather", 1000, null, null, null, null, null, "inv_feather_10"));
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

        //other?
        const tuftOfPrimalWool = await(createItem("Tuft of Primal Wool", 1000));
        const glowingTitanOrb = await(createItem("Glowing Titan Orb", 200));
        const aquaticMaw = await(createItem("Aquatic Maw", 1000));
        const largeSturdyFemur = await(createItem("Large Sturdy Femur", 1000));
        const primalBearSpine = await(createItem("Primal Bear Spine", 1000));
        const mastodonTusk = await(createItem("Mastodon Tusk", 1000));
        const iridescentPlume = await(createItem("Iridescent Plume", 1000));
        const markOfHonor = await(createItem("Mark of Honor", 1000));
        const quackEQuackModulator = await(createItem("Quack-E Quack Modulator", 1));

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
        const pieceOfScrap = await(createItem("Piece of Scrap", 1000));
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
        const glossyStone = await(createItem('Glossy Stone', 1000));
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
        await(createRecipe("Name", itemName, amountMade, profession, material array, profSkill, "Category", skillUpAmount, difficulty, requiredRenown, requiredSpecialization, notes, finishing reagent array)
        material array: [ [item, amount needed], [item, amount needed], etc. ]
        required renown (if not null): {NameOfRep: "Renown Needed"}
        required specialization (if not null): {NameOfSpecialization: Level}
        finishing reagent array: [ [item, {SpecializationNeeded: Level}], [item, {SpecializationNeeded: Level}], etc. ]
        */

        //alchemy recipes - 56 total
        //advancedPhialExperimentation
        //advancedPotionExperimentation
        //basicPhialExperimentation
        //basicPotionExperimentation
        //reclaimConcoctions
        const primalConvergentRecipe = await(createRecipe("Primal Convergent", primalConvergent, 2, alchemy, [[awakenedEarth, 1], [awakenedFire, 1], [awakenedAir, 1], [awakenedFrost, 1], [awakenedOrder, 1]], 20, "Reagents", 1, 275, null, null, null, "Alchemist's Lab Bench", null, [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const omniumDraconisRecipe = await(createRecipe("Omnium Draconis", omniumDraconis, 1, alchemy, [[writhebark, 1], [saxifrage, 1], [hochenblume, 5], [bubblePoppy, 1]], 10, "Reagents", 1, 325, null, null, null, "Alchemist's Lab Bench", null, [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const residualNeuralChannelingAgentRecipe = await(createRecipe("Residual Neural Channeling Agent", residualNeuralChannelingAgent, 5, alchemy, [[awakenedAir, 1], [awakenedEarth, 1], [draconicVial, 5], [saxifrage, 10]], null, "Air Potions", 1, 400, null, null, "Potion Experimentation", "Alchemist's Lab Bench", "Learned via Potion Experimentation.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {PotionLore: 25, AirFormulatedPotions: 30}]]));
        const bottledPutrescenceRecipe = await(createRecipe("Bottled Putrescence", bottledPutrescence, 5, alchemy, [[awakenedAir, 1], [awakenedDecay, 2], [draconicVial, 5], [hochenblume, 30]], null, "Air Potions", 3, 450, null, {Decayology: 0}, "Potion Experimentation", "Altar of Decay", "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {PotionLore: 25, AirFormulatedPotions: 30}]]));
        const potionOfGustsRecipe = await(createRecipe("Potion of Gusts", potionOfGusts, 5, alchemy, [[awakenedAir, 1], [draconicVial, 5], [saxifrage, 5], [hochenblume, 20]], null, "Air Potions", 3, 150, null, null, "Potion Experimentation", "Alchemist's Lab Bench", "Learned via Potion Experimentation.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {PotionLore: 25, AirFormulatedPotions: 30}]]));
        const potionOfShockingDisclosureRecipe = await(createRecipe("Potion of Shocking Disclosure", potionOfShockingDisclosure, 5, alchemy, [[awakenedAir, 1], [awakenedEarth, 1], [draconicVial, 5], [hochenblume, 10]], null, "Air Potions", 3, 150, null, null, "Potion Experimentation", "Alchemist's Lab Bench", "Learned via Potion Experimentation.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {PotionLore: 25, AirFormulatedPotions: 30}]]));
        const potionOfTheHushedZephyrRecipe = await(createRecipe("Potion of Shocking Disclosure", potionOfShockingDisclosure, 5, alchemy, [[awakenedAir, 1], [draconicVial, 5], [hochenblume, 20], [saxifrage, 8]], null, "Air Potions", 3, 150, null, null, "Potion Experimentation", "Alchemist's Lab Bench", "Learned via Potion Experimentation.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {PotionLore: 25, AirFormulatedPotions: 30}]]));
        const aeratedManaPotionRecipe = await(createRecipe("Aerated Mana Potion", aeratedManaPotion, 5, alchemy, [[rousingAir, 1], [draconicVial, 5], [hochenblume, 15]], 5, "Air Potions", 3, 60, null, null, null, null, null, [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {PotionLore: 25, AirFormulatedPotions: 30}]]));
        const potionOfChilledClarityRecipe = await(createRecipe("Potion of Chilled Clairty", potionOfChilledClarity, 5, alchemy, [[awakenedFrost, 1], [awakenedDecay, 1], [draconicVial, 5], [bubblePoppy, 10]], null, "Frost Potions", 1, 450, null, {Decayology: 0}, "Potion Experimentation", "Altar of Decay", "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25}]]));
        const delicateSuspensionOfSporesRecipe = await(createRecipe("Delicate Suspension of Spores", delicateSuspensionOfSpores, 5, alchemy, [[awakenedFrost, 1], [awakenedDecay, 1], [draconicVial, 5], [bubblePoppy, 10]], null, "Frost Potions", 1, 450, null, {Decayology: 0}, "Potion Experimentation", "Altar of Decay", "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25}]]));
        const potionOfFrozenFocusRecipe = await(createRecipe("Potion of Frozen Focus", potionOfFrozenFocus, 5, alchemy, [[awakenedFrost, 1], [draconicVial, 5], [hochenblume, 20], [saxifrage, 8]], null, "Frost Potions", 1, 400, null, null, "Potion Experimentation", "Alchemist's Lab Bench", "Learned via Potion Experimentation.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25}]]));
        const potionOfWitheringVitalityRecipe = await(createRecipe("Potion of Withering Vitality", potionOfWitheringVitality, 5, alchemy, [[awakenedFrost, 1], [awakenedDecay, 1], [draconicVial, 5], [writhebark, 10]], null, "Frost Potions", 1, 450, null, {Decayology: 0}, "Potion Experimentation", "Altar of Decay", "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25}]]));
        const potionOfFrozenFatalityRecipe = await(createRecipe("Potion of Frozen Fatality", potionOfFrozenFatality, 5, alchemy, [[awakenedFrost, 1], [draconicVial, 5], [writhebark, 5], [hochenblume, 20]], null, "Frost Potions", 3, 200, null, null, "Potion Experimentation", "Alchemist's Lab Bench", "Learned via Potion Experimentation.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25}]]));
        const refreshingHealingPotionRecipe = await(createRecipe("Refreshing Healing Potion", refreshingHealingPotion, 5, alchemy, [[rousingFrost, 1], [draconicVial, 5], [hochenblume, 8]], 1, "Frost Potions", 3, 40, null, null, null, null, null, [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25}]]));
        const potionCauldronOfUltimatePowerRecipe = await(createRecipe("Potion Cauldron of Ultimate Power", potionCauldronOfUltimatePower, 1, alchemy, [[elementalPotionOfPower, 150], [omniumDraconis, 20]], null, "Cauldrons", 2, 450, null, null, "Raid Drop", "Alchemist's Lab Bench", "Learned from Elemental Codex of Ultimate Power, which drops from Vault of the Incarnates bosses on Heroic & Mythic.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25, AirFormulatedPotions: 30}]]));
        const potionCauldronOfPowerRecipe = await(createRecipe("Potion Cauldron of Power", potionCauldronOfPower, 1, alchemy, [[elementalPotionOfPower, 100], [omniumDraconis, 10]], null, "Cauldrons", 2, 425, null, {BatchProduction: 10}, null, "Alchemist's Lab Bench", null, [["Alchemical Catalyst", {PotionMastery: 30}], ["Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25, AirFormulatedPotions: 30}]]));
        const cauldronOfThePookaRecipe = await(createRecipe("Cauldron of the Pooka", cauldronOfThePooka, 2, alchemy, [[tuftOfPrimalWool, 1], [omniumDraconis, 1], [primalConvergent, 2]], null, "Cauldrons", 1, 300, null, null, "World Drop", "Alchemist's Lab Bench", "Drops from Draconic Recipe in a Bottle.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25, AirFormulatedPotions: 30}]]));
        const elementalPotionOfUltimatePowerRecipe = await(createRecipe("Elemental Potion of Ultimate Power", elementalPotionOfUltimatePower, 20, alchemy, [[primalChaos, 20], [awakenedOrder, 2], [elementalPotionOfPower, 30]], null, "Elemental Phials and Potions", 1, 450, null, null, "Raid Drop", "Alchemist's Lab Bench", "Learned from Elemental Codex of Ultimate Power, which drops from Vault of the Incarnates bosses on Heroic & Mythic.", [["Alchemical Catalyst", {PotionMastery: 30}], ["Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25, AirFormulatedPotions: 30}]]));
        const elementalPotionOfPowerRecipe = await(createRecipe("Elemental Potion of Power", elementalPotionOfPower, 5, alchemy, [[draconicVial, 5], [omniumDraconis, 3], [primalConvergent, 1]], 50, "Elemental Phials and Potions", 3, 425, null, null, null, "Alchemist's Lab Bench", null, [["Alchemical Catalyst", {PotionMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPotions: 30, PotionLore: 25, AirFormulatedPotions: 30}]]));
        const phialOfElementalChaosRecipe = await(createRecipe("Phial of Elemental Chaos", phialOfElementalChaos, 2, alchemy, [[draconicVial, 2], [primalConvergent, 1], [omniumDraconis, 2]], null, "Elemental Phials and Potions", 1, 450, null, null, "Phial Experimentation", "Alchemist's Lab Bench", "Learned via Phial Experimentation.", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPhials: 30, PhialLore: 25, AirFormulatedPhials: 30}]]));
        const phialOfChargedIsolationRecipe = await(createRecipe("Phial of Charged Isolation", phialOfChargedIsolation, 2, alchemy, [[awakenedAir, 1], [awakenedEarth, 1], [draconicVial, 2], [saxifrage, 9]], null, "Air Phials", 1, 400, null, null, "Phial Experimentation", "Alchemist's Lab Bench", "Learned via Phial Experimentation", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {PhialLore: 25, AirFormulatedPhials: 30}]]));
        const phialOfStaticEmpowermentRecipe = await(createRecipe("Phial of Static Empowerment", phialOfStaticEmpowerment, 2, alchemy, [[awakenedAir, 1], [awakenedEarth, 1], [draconicVial, 2], [bubblePoppy, 5]], null, "Air Phials", 1, 400, null, null, "Phial Experimentation", "Alchemist's Lab Bench", "Learned via Phial Experimentation", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {PhialLore: 25, AirFormulatedPhials: 30}]]));
        const phialOfStillAirRecipe = await(createRecipe("Phial of Still Air", phialOfStillAir, 2, alchemy, [[awakenedAir, 1], [draconicVial, 2], [bubblePoppy, 10], [saxifrage, 5]], null, "Air Phials", 1, 400, null, null, "Phial Experimentation", "Alchemist's Lab Bench", "Learned via Phial Experimentation", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {PhialLore: 25, AirFormulatedPhials: 30}]]));
        const phialOfTheEyeInTheStormRecipe = await(createRecipe("Phial of the Eye in the Storm", phialOfTheEyeInTheStorm, 2, alchemy, [[awakenedAir, 1], [draconicVial, 2], [bubblePoppy, 5], [saxifrage, 10]], null, "Air Phials", 1, 400, null, null, "Phial Experimentation", "Alchemist's Lab Bench", "Learned via Phial Experimentation", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {PhialLore: 25, AirFormulatedPhials: 30}]]));
        const aeratedPhialOfDeftnessRecipe = await(createRecipe("Aerated Phial of Deftness", aeratedPhialOfDeftness, 10, alchemy, [[artisansMettle, 10], [awakenedAir, 2], [draconicVial, 10], [saxifrage, 10]], null, "Air Phials", 2, 400, null, null, "Phial Experimentation", "Alchemist's Lab Bench", "Learned via Phial Experimentation", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {PhialLore: 25, AirFormulatedPhials: 30}]]));
        const chargedPhialOfAlacrityRecipe = await(createRecipe("Charged Phial of Alacrity", chargedPhialOfAlacrity, 2, alchemy, [[awakenedAir, 1], [awakenedEarth, 1], [draconicVial, 2], [writhebark, 4]], null, "Air Phials", 1, 200, null, null, "Phial Experimentation", "Alchemist's Lab Bench", "Learned via Phial Experimentation", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {PhialLore: 25, AirFormulatedPhials: 30}]]));
        const aeratedPhialOfQuickHandsRecipe = await(createRecipe("Aerated Phial of Quick Hands", aeratedPhialOfQuickHands, 2, alchemy, [[rousingAir, 4], [draconicVial, 2], [hochenblume, 8]], null, "Air Phials", 2, 200, {ArtisansConsortium: "Respected"}, null, null, "Alchemist's Lab Bench", null, [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {PhialLore: 25, AirFormulatedPhials: 30}]]));
        const phialOfIcyPreservationRecipe = await(createRecipe("Phial of Icy Preservation", phialOfIcyPreservation, 2, alchemy, [[awakenedDecay, 1], [awakenedFrost, 1], [draconicVial, 2], [saxifrage, 9]], null, "Frost Phials", 1, 450, null, {Decayology: 0}, "Phial Experimentation", "Altar of Decay", "Learned via Phial Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPhials: 30, PhialLore: 25}]]));
        const icedPhialOfCorruptingRageRecipe = await(createRecipe("Iced Phial of Corrupting Rage", icedPhialOfCorruptingRage, 2, alchemy, [[awakenedDecay, 1], [awakenedFrost, 1], [draconicVial, 2], [writhebark, 9]], null, "Frost Phials", 1, 450, null, {Decayology: 0}, "Phial Experimentation", "Altar of Decay", "Learned via Phial Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPhials: 30, PhialLore: 25}]]));
        const phialOfGlacialFuryRecipe = await(createRecipe("Phial of Glacial Fury", phialOfGlacialFury, 2, alchemy, [[awakenedFrost, 1], [draconicVial, 2], [writhebark, 5], [bubblePoppy, 10]], null, "Frost Phials", 1, 400, null, null, "Phial Experimentation", "Alchemist's Lab Bench", "Learned via Phial Experimentation.", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPhials: 30, PhialLore: 25}]]));
        const steamingPhialOfFinesseRecipe = await(createRecipe("Steaming Phial of Finesse", steamingPhialOfFinesse, 10, alchemy, [[artisansMettle, 10], [awakenedFrost, 1], [awakenedFire, 1], [draconicVial, 10], [writhebark, 8]], null, "Frost Phials", 2, 400, null, null, "Phial Experimentation", "Alchemist's Lab Bench", "Learned via Phial Experimentation.", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPhials: 30, PhialLore: 25}]]));
        const crystallinePhialOfPerceptionRecipe = await(createRecipe("Crystalline Phial of Perception", crystallinePhialOfPerception, 10, alchemy, [[artisansMettle, 10], [awakenedFrost, 2], [draconicVial, 10], [bubblePoppy, 10]], null, "Frost Phials", 2, 400, null, null, "Phial Experimentation", "Alchemist's Lab Bench", "Learned via Phial Experimentation.", [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPhials: 30, PhialLore: 25}]]));
        const phialOfTepidVersatilityRecipe = await(createRecipe("Phial of Tepid Versatility", phialOfTepidVersatility, 2, alchemy, [[awakenedFrost, 2], [draconicVial, 2], [hochenblume, 16]], 25, "Frost Phials", 1, 300, null, null, null, null, null, [["Alchemical Catalyst", {PhialMastery: 30}], ["Lesser Illustrious Insight", {FrostFormulatedPhials: 30, PhialLore: 25}]]));
        // const transmuteDecayToElementsRecipe = await(createRecipe("Transmute: Decay to Elements", transmuteDecayToElements, 1, alchemy, [[awakenedDecay, 1]], null, "Transmutations", 1, null, null, {Decayology: 20}, null, "Alchemist's Lab Bench", "Recover an 'assortment' of Rousing Elements. Has a CD."));
        // const transmuteOrderToElementsRecipe = await(createRecipe("Transmute: Order to Elements", transmuteOrderToElements, 1, alchemy, [[awakenedOrder, 1]], null, "Transmutations", 1, null, null, {Transmutation: 10}, null, "Alchemist's Lab Bench", "Creates one Awakened Air, Earth, Fire, & Frost. Has a CD."));
        const transmuteAwakenedAir = await(createRecipe("Transmute: Awakened Air", awakenedAir, 2, alchemy, [[awakenedFrost, 1], [awakenedFire, 1]], 15, "Transmutations", 1, null, null, null, null, "Alchemist's Lab Bench", "Has a CD."));
        const transmuteAwakenedEarth = await(createRecipe("Transmute: Awakened Earth", awakenedEarth, 2, alchemy, [[awakenedFrost, 1], [awakenedFire, 1]], 15, "Transmutations", 1, null, null, null, null, "Alchemist's Lab Bench", "Has a CD."));
        const transmuteAwakenedFire = await(createRecipe("Transmute: Awakened Fire", awakenedFire, 2, alchemy, [[awakenedEarth, 1], [awakenedAir, 1]], 15, "Transmutations", 1, null, null, null, null, "Alchemist's Lab Bench", "Has a CD."));
        const transmuteAwakenedFrost = await(createRecipe("Transmute: Awakened Frost", awakenedFrost, 2, alchemy, [[awakenedEarth, 1], [awakenedAir, 1]], 15, "Transmutations", 1, null, null, null, null, "Alchemist's Lab Bench", "Has a CD."));
        const potionAbsorptionInhibitorRecipe = await(createRecipe("Potion Absorption Inhibitor", potionAbsorptionInhibitor, 1, alchemy, [[saxifrage, 10], [hochenblume, 20], [bubblePoppy, 10], [primalConvergent, 4]], null, "Optional Reagents", 1, 325, null, null, "Raid Drop", "Alchemist's Lab Bench", "Drops from 'bosses in Vault of the Incarnates'.", [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const illustriousInsightRecipeAlchemy = await(createRecipe("Illustrious Insight", illustriousInsight, 1, alchemy, [[artisansMettle, 50]], null, "Finishing Reagents", 1, null, null, null, "Various Specializations", "Alchemist's Lab Bench"));
        const writhefireOilRecipe = await(createRecipe("Writhefire Oil", writhefireOil, 2, alchemy, [[awakenedFire, 1], [writhebark, 1], [hochenblume, 2]], 35, "Finishing Reagents", 1, 60, null, null, null, "Alchemist's Lab Bench", null, [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const broodSaltRecipe = await(createRecipe("Brood Salt", broodSalt, 2, alchemy, [[awakenedFrost, 1], [saxifrage, 6], [hochenblume, 12]], null, "Finishing Reagents", 1, 300, null, {ChemicalSynthesis: 20}, null, "Alchemist's Lab Bench", null, [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const stableFluidicDraconiumRecipe = await(createRecipe("Stable Fluidic Draconium", stableFluidicDraconium, 2, alchemy, [[awakenedAir, 1], [draconiumOre, 3], [writhebark, 3]], null, "Finishing Reagents", 1, 300, {ArtisansConsortium: "Respected"}, null, null, "Alchemist's Lab Bench", null, [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const agitatingPotionAugmentationRecipe = await(createRecipe("Agitating Potion Augmentation", agitatingPotionAugmentation, 2, alchemy, [[saxifrage, 5], [hochenblume, 12], [bubblePoppy, 6]], null, "Finishing Reagents", 1, 300, {ArtisansConsortium: "Valued"}, null, null, "Alchemist's Lab Bench", null, [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const reactivePhialEmbellishmentRecipe = await(createRecipe("Reactive Phial Embellishment", reactivePhialEmbellishment, 2, alchemy, [[writhebark, 6], [hochenblume, 12], [bubblePoppy, 6]], null, "Finishing Reagents", 1, 300, {ArtisansConsortium: "Valued"}, null, null, "Alchemist's Lab Bench", null, [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const sagaciousIncenseRecipe = await(createRecipe("Sagacious Incense", sagaciousIncense, 2, alchemy, [[primalConvergent, 1], [saxifrage, 5]], null, "Incense", 1, 300, {ArtisansConsortium: "Valued"}, null, null, "Alchemist's Lab Bench", null, [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const exultantIncenseRecipe = await(createRecipe("Exultant Incense", exultantIncense, 2, alchemy, [[saxifrage, 6], [hochenblume, 6]], null, "Incense", 1, 250, {MaruukCentaur: 22}, null, null, "Alchemist's Lab Bench", null, [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const fervidIncenseRecipe = await(createRecipe("Fervid Incense", fervidIncense, 2, alchemy, [[writhebark, 6], [hochenblume, 6]], null, "Incense", 1, 150, null, null, "World Drop", "Alchemist's Lab Bench", "Drops from Draconic Recipe in a Bottle.", [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const somniferousIncenseRecipe = await(createRecipe("Somniferous Incense", somniferousIncense, 2, alchemy, [[bubblePoppy, 6], [hochenblume, 6]], null, "Incense", 1, 250, null, null, "World Drop", "Alchemist's Lab Bench", "Drops from Draconic Recipe in a Bottle.", [["Lesser Illustrious Insight", {ChemicalSynthesis: 35}]]));
        const alacritousAlchemistStoneRecipe = await(createRecipe("Alacritous Alchemist Stone", alacritousAlchemistStone, 1, alchemy, [[sparkOfIngenuity, 1], [primalChaos, 60], [glowingTitanOrb, 1], [omniumDraconis, 15], [elementalPotionOfPower, 12], [potionOfFrozenFocus, 12]], null, "Alchemist Stones", 1, 275, {MaruukCentaur: 13}, null, null, "Alchemist's Lab Bench", null, [["Primal Infusion", {}], ["Alchemical Catalyst", {PotionMastery: 30}], ["Illustrious Insight", {PotionLore: 25}]]));
        const sustainingAlchemistStoneRecipe = await(createRecipe("Sustaining Alchemist Stone", sustainingAlchemistStone, 1, alchemy, [[sparkOfIngenuity, 1], [primalChaos, 60], [glowingTitanOrb, 1], [primalConvergent, 4], [phialOfTepidVersatility, 6], [phialOfElementalChaos, 6]], 1, "Alchemist Stones", 1, 275, {ValdrakkenAccord: 14}, null, null, "Alchemist's Lab Bench", null, [["Primal Infusion", {}], ["Alchemical Catalyst", {PhialMastery: 30}], ["Illustrious Insight", {PhialLore: 25}]]));



        //blacksmithing recipes - 86 total
        const obsidianSearedAlloyRecipe = await(createRecipe("Obsidian Seared Alloy", obsidianSearedAlloy, 2, blacksmithing, [[awakenedOrder, 1], [awakenedFire, 1], [primalFlux, 6], [draconiumOre, 10], [khazgoriteOre, 8]], null, "Smelting", 1, 325, null, null, "Quest", "Earth-Warder's Forge", "Unlocked via 'A Head For Metal' quest in the Waking Shores.", [["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const frostfireAlloyRecipe = await(createRecipe("Frostfire Alloy", frostfireAlloy, 2, blacksmithing, [[awakenedFire, 1], [awakenedFrost, 1], [primalFlux, 4], [draconiumOre, 5], [khazgoriteOre, 4]], 25, "Smelting", 1, 325, null, null, null, "Forge", null, [["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const infuriousAlloyRecipe = await(createRecipe("Infurious Alloy", infuriousAlloy, 2, blacksmithing, [[awakenedIre, 2], [primalFlux, 3], [draconiumOre, 4], [khazgoriteOre, 2]], null, "Smelting", 1, 200, null, null, "PvP Victory", "Forge", "Received from Arena, BGs, or WM?", [["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const primalMoltenAlloyRecipe = await(createRecipe("Primal Molten Alloy", primalMoltenAlloy, 2, blacksmithing, [[awakenedEarth, 1], [awakenedFire, 1], [primalFlux, 4], [draconiumOre, 5], [khazgoriteOre, 4]], 25, "Smelting", 1, 325, null, null, null, "Forge", null, [["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const illustriousInsightRecipeBlacksmithing = await(createRecipe("Illustrious Insight", illustriousInsight, 1, blacksmithing, [[artisansMettle, 50]], null, "Finishing Reagents", 1, null, null, null, "Various Specializations", "Anvil"));
        const armorSpikesRecipe = await(createRecipe("Armor Spikes", armorSpikes, 1, blacksmithing, [[awakenedFire, 3], [aquaticMaw, 2], [sereviteOre, 30], [khazgoriteOre, 15]], null, "Optional Reagents", 1, 325, {ArtisansConsortium: "Respected"}, null, null, "Anvil", null, [["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const alliedChestplateOfGenerosityRecipe = await(createRecipe("Allied Chestplate of Generosity", alliedChestplateOfGenerosity, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 50], [centaursTrophyNecklace, 1], [obsidianSearedAlloy, 10]], null, "Armor", 1, 325, null, null, "Raid Drop", "Anvil", "Drops from bosses in Vault of the Incarnates.", [["Primal Infusion", {Armorsmithing: 0}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Illustrious Insight", {Breastplates: 20}]]));
        const alliedWristguardOfCompanionshipRecipe = await(createRecipe("Allied Wristguard of Companionship", alliedWristguardOfCompanionship, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 30], [centaursTrophyNecklace, 1], [obsidianSearedAlloy, 8]], null, "Armor", 1, 325, null, null, "Raid Drop", "Anvil", "Drops from bosses in Vault of the Incarnates.", [["Primal Infusion", {Armorsmithing: 0}], ["Quenching Fluid", {FineArmor: 30}], ["Illustrious Insight", {Vambraces: 20}]]));
        const frostfireLegguardsOfPreparationRecipe = await(createRecipe("Frostfire Legguards of Preparation", frostfireLegguardsOfPreparation, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 50], [frostySoul, 1], [fierySoul, 1], [frostfireAlloy, 16]], null, "Armor", 1, 325, null, null, "Dungeon Drop", "Anvil", "Drops from Algeth'ar Academy & The Azure Vault.", [["Primal Infusion", {Armorsmithing: 0}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Illustrious Insight", {Greaves: 20}]]));
        const infuriousHelmOfVengeanceRecipe = await(createRecipe("Infurious Helm of Vengeance", infuriousHelmOfVengeance, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 50], [obsidianSearedAlloy, 2], [infuriousAlloy, 20]], null, "Armor", 1, 325, null, null, "PvP Victory", "Anvil", "Received from Arena, BGs, or WM?", [["Primal Infusion", {Armorsmithing: 0}], ["Quenching Fluid", {SculptedArmor: 30}], ["Illustrious Insight", {Helms: 20}]]));
        const infuriousWarbootsOfImpunityRecipe = await(createRecipe("Infurious Warboots of Impunity", infuriousWarbootsOfImpunity, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 40], [largeSturdyFemur, 2], [obsidianSearedAlloy, 2], [infuriousAlloy, 16]], null, "Armor", 1, 325, null, null, "PvP Victory", "Anvil", "Received from Arena, BGs, or WM?", [["Primal Infusion", {Armorsmithing: 0}], ["Quenching Fluid", {SculptedArmor: 30}], ["Illustrious Insight", {Sabatons: 20}]]));
        const primalMoltenBreastplateRecipe = await(createRecipe("Primal Molten Breastplate", primalMoltenBreastplate, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 50], [primalMoltenAlloy, 16]], null, "Armor", 1, 280, null, {Breastplates: 0}, null, "Anvil", null, [["Primal Infusion", {Armorsmithing: 0}], ["Missive", {LargePlateArmor: 0}], ["Embellishment", {}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Illustrious Insight", {Breastplates: 20}]]));
        const primalMoltenGauntletsRecipe = await(createRecipe("Primal Molten Gauntlets", primalMoltenGauntlets, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 40], [primalMoltenAlloy, 14]], null, "Armor", 1, 280, null, {Gauntlets: 0}, null, "Anvil", null, [["Primal Infusion", {Armorsmithing: 0}], ["Missive", {FineArmor: 0}], ["Embellishment", {}], ["Quenching Fluid", {FineArmor: 30}], ["Illustrious Insight", {Gauntlets: 20}]]));
        const primalMoltenGreatbeltRecipe = await(createRecipe("Primal Molten Greatbelt", primalMoltenGreatbelt, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 40], [primalMoltenAlloy, 13]], null, "Armor", 1, 280, null, {Belts: 0}, null, "Anvil", null, [["Primal Infusion", {Armorsmithing: 0}], ["Missive", {FineArmor: 0}], ["Embellishment", {}], ["Quenching Fluid", {FineArmor: 30}], ["Illustrious Insight", {Belts: 20}]]));
        const primalMoltenHelmRecipe = await(createRecipe("Primal Molten Helm", primalMoltenHelm, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 50], [primalMoltenAlloy, 16]], null, "Armor", 1, 280, null, {Helms: 0}, null, "Anvil", null, [["Primal Infusion", {Armorsmithing: 0}], ["Missive", {SculptedArmor: 0}], ["Embellishment", {}], ["Quenching Fluid", {SculptedArmor: 30}], ["Illustrious Insight", {Helms: 20}]]));
        const primalMoltenLegplatesRecipe = await(createRecipe("Primal Molten Legplates", primalMoltenLegplates, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 50], [primalMoltenAlloy, 16]], null, "Armor", 1, 280, null, {Greaves: 0}, null, "Anvil", null, [["Primal Infusion", {Armorsmithing: 0}], ["Missive", {LargePlateArmor: 0}], ["Embellishment", {}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Illustrious Insight", {Greaves: 20}]]));
        const primalMoltenPauldronsRecipe = await(createRecipe("Primal Molten Pauldrons", primalMoltenPauldrons, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 40], [primalMoltenAlloy, 15]], null, "Armor", 1, 280, null, {Pauldrons: 0}, null, "Anvil", null, [["Primal Infusion", {Armorsmithing: 0}], ["Missive", {SculptedArmor: 0}], ["Embellishment", {}], ["Quenching Fluid", {SculptedArmor: 30}], ["Illustrious Insight", {Pauldrons: 20}]]));
        const primalMoltenSabatonsRecipe = await(createRecipe("Primal Molten Sabatons", primalMoltenSabatons, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 40], [primalMoltenAlloy, 14]], null, "Armor", 1, 280, null, {Sabatons: 0}, null, "Anvil", null, [["Primal Infusion", {Armorsmithing: 0}], ["Missive", {SculptedArmor: 0}], ["Embellishment", {}], ["Quenching Fluid", {SculptedArmor: 30}], ["Illustrious Insight", {Sabatons: 20}]]));
        const primalMoltenVambracesRecipe = await(createRecipe("Primal Molten Vambraces", primalMoltenVambraces, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 30], [primalMoltenAlloy, 14]], null, "Armor", 1, 280, null, {Vambraces: 0}, null, "Anvil", null, [["Primal Infusion", {Armorsmithing: 0}], ["Missive", {FineArmor: 0}], ["Embellishment", {}], ["Quenching Fluid", {FineArmor: 30}], ["Illustrious Insight", {Vambraces: 20}]]));
        const unstableFrostfireBeltRecipe = await(createRecipe("Unstable Frostfire Belt", unstableFrostfireBelt, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 40], [frostySoul, 1], [fierySoul, 1], [frostfireAlloy, 13]], null, "Armor", 1, 325, null, null, "Dungeon Drop", "Anvil", "Drops from Algeth'ar Academy & The Azure Vault.", [["Primal Infusion", {Armorsmithing: 0}], ["Quenching Fluid", {FineArmor: 30}], ["Illustrious Insight", {Belts: 20}]]));
        const explorersExpertHelmRecipe = await(createRecipe("Explorer's Expert Helm", explorersExpertHelm, 1, blacksmithing, [[primalFlux, 2], [draconiumOre, 7], [sereviteOre, 14]], 50, "Armor", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {SculptedArmor: 0}], ["Quenching Fluid", {SculptedArmor: 30}], ["Lesser Illustrious Insight", {Helms: 20}]]));
        const explorersExpertSpauldersRecipe = await(createRecipe("Explorer's Expert Spaulders", explorersExpertSpaulders, 1, blacksmithing, [[primalFlux, 2], [draconiumOre, 6], [sereviteOre, 12]], 45, "Armor", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {SculptedArmor: 0}], ["Quenching Fluid", {SculptedArmor: 30}], ["Lesser Illustrious Insight", {Pauldrons: 20}]]));
        const explorersExpertGauntletsRecipe = await(createRecipe("Explorer's Expert Gauntlets", explorersExpertGauntlets, 1, blacksmithing, [[primalFlux, 2], [draconiumOre, 6], [sereviteOre, 12]], 40, "Armor", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {FineArmor: 0}], ["Quenching Fluid", {FineArmor: 30}], ["Lesser Illustrious Insight", {Gauntlets: 20}]]));
        const crimsonCombatantsDraconiumArmguardsRecipe = await(createRecipe("Crimson Combatant's Draconium Armguards", crimsonCombatantsDraconiumArmguards, 1, blacksmithing, [[infuriousAlloy, 2]], null, "Armor", 2, 120, null, null, "PvP Victory", "Anvil", "Received from Arena, BGs, or WM?", [["Missive", {FineArmor: 0}], ["Quenching Fluid", {FineArmor: 30}], ["Lesser Illustrious Insight", {Vambraces: 20}]]));
        const crimsonCombatantsDraconiumBreastplateRecipe = await(createRecipe("Crimson Combatant's Draconium Breastplate", crimsonCombatantsDraconiumBreastplate, 1, blacksmithing, [[infuriousAlloy, 2]], null, "Armor", 2, 120, null, null, "PvP Victory", "Anvil", "Received from Arena, BGs, or WM?", [["Missive", {LargePlateArmor: 0}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Lesser Illustrious Insight", {Breastplates: 20}]]));
        const crimsonCombatantsDraconiumGauntletsRecipe = await(createRecipe("Crimson Combatant's Draconium Gauntlets", crimsonCombatantsDraconiumGauntlets, 1, blacksmithing, [[infuriousAlloy, 2]], null, "Armor", 2, 120, null, null, "PvP Victory", "Anvil", "Received from Arena, BGs, or WM?", [["Missive", {FineArmor: 0}], ["Quenching Fluid", {FineArmor: 30}], ["Lesser Illustrious Insight", {Gauntlets: 20}]]));
        const crimsonCombatantsDraconiumGreavesRecipe = await(createRecipe("Crimson Combatant's Draconium Greaves", crimsonCombatantsDraconiumGreaves, 1, blacksmithing, [[infuriousAlloy, 2]], null, "Armor", 2, 120, null, null, "PvP Victory", "Anvil", "Received from Arena, BGs, or WM?", [["Missive", {LargePlateArmor: 0}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Lesser Illustrious Insight", {Greaves: 20}]]));
        const crimsonCombatantsDraconiumHelmRecipe = await(createRecipe("Crimson Combatant's Draconium Helm", crimsonCombatantsDraconiumHelm, 1, blacksmithing, [[infuriousAlloy, 2]], null, "Armor", 2, 120, null, null, "PvP Victory", "Anvil", "Received from Arena, BGs, or WM?", [["Missive", {SculptedArmor: 0}], ["Quenching Fluid", {SculptedArmor: 30}], ["Lesser Illustrious Insight", {Helms: 20}]]));
        const crimsonCombatantsDraconiumPauldronsRecipe = await(createRecipe("Crimson Combatant's Draconium Pauldrons", crimsonCombatantsDraconiumPauldrons, 1, blacksmithing, [[infuriousAlloy, 2]], null, "Armor", 2, 120, null, null, "PvP Victory", "Anvil", "Received from Arena, BGs, or WM?", [["Missive", {SculptedArmor: 0}], ["Quenching Fluid", {SculptedArmor: 30}], ["Lesser Illustrious Insight", {Pauldrons: 20}]]));
        const crimsonCombatantsDraconiumSabatonsRecipe = await(createRecipe("Crimson Combatant's Draconium Sabatons", crimsonCombatantsDraconiumSabatons, 1, blacksmithing, [[infuriousAlloy, 2]], null, "Armor", 2, 120, null, null, "PvP Victory", "Anvil", "Received from Arena, BGs, or WM?", [["Missive", {SculptedArmor: 0}], ["Quenching Fluid", {SculptedArmor: 30}], ["Lesser Illustrious Insight", {Sabatons: 20}]]));
        const crimsonCombatantsDraconiumWaistguardRecipe = await(createRecipe("Crimson Combatant's Draconium Waistguard", crimsonCombatantsDraconiumWaistguard, 1, blacksmithing, [[infuriousAlloy, 2]], null, "Armor", 2, 120, null, null, "PvP Victory", "Anvil", "Received from Arena, BGs, or WM?", [["Missive", {FineArmor: 0}], ["Quenching Fluid", {FineArmor: 30}], ["Lesser Illustrious Insight", {Belts: 20}]]));
        const explorersExpertGreavesRecipe = await(createRecipe("Explorer's Expert Greaves", explorersExpertGreaves, 1, blacksmithing, [[primalFlux, 2], [draconiumOre, 7], [sereviteOre, 14]], 35, "Armor", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {LargePlateArmor: 0}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Lesser Illustrious Insight", {Greaves: 20}]]));
        const explorersExpertClaspRecipe = await(createRecipe("Explorer's Expert Clasp", explorersExpertClasp, 1, blacksmithing, [[primalFlux, 2], [draconiumOre, 4], [sereviteOre, 10]], 30, "Armor", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {FineArmor: 0}], ["Quenching Fluid", {FineArmor: 30}], ["Lesser Illustrious Insight", {Belts: 20}]]));
        const explorersPlateChestguardRecipe = await(createRecipe("Explorer's Plate Chestguard", explorersPlateChestguard, 1, blacksmithing, [[primalFlux, 2], [draconiumOre, 3], [sereviteOre, 10]], 10, "Armor", 3, 40, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {LargePlateArmor: 0}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Lesser Illustrious Insight", {Breastplates: 20}]]));
        const explorersPlateBootsRecipe = await(createRecipe("Explorer's Plate Boots", explorersPlateBoots, 1, blacksmithing, [[primalFlux, 2], [draconiumOre, 3], [sereviteOre, 10]], 5, "Armor", 3, 40, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {SculptedArmor: 0}], ["Quenching Fluid", {SculptedArmor: 30}], ["Lesser Illustrious Insight", {Sabatons: 20}]]));
        const explorersPlateBracersRecipe = await(createRecipe("Explorer's Plate Bracers", explorersPlateBracers, 1, blacksmithing, [[primalFlux, 2], [draconiumOre, 3], [sereviteOre, 8]], 1, "Armor", 3, 40, null, null, null, "Anvil", "Learned by default.", [["Training Matrix", {}], ["Missive", {FineArmor: 0}], ["Quenching Fluid", {FineArmor: 30}], ["Lesser Illustrious Insight", {Vambraces: 20}]]));
        const primalMoltenDefenderRecipe = await(createRecipe("Primal Molten Defender", primalMoltenDefender, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 40], [primalMoltenAlloy, 15]], null, "Shields", 1, 280, null, {Shields: 0}, null, "Anvil", null, [["Primal Infusion", {Armorsmithing: 0}], ["Missive", {LargePlateArmor: 0}], ["Embellishment", {}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Illustrious Insight", {Shields: 20}]]));
        const shieldOfTheHearthRecipe = await(createRecipe("Shield of the Hearth", shieldOfTheHearth, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 40], [earthenSoul, 1], [glowingTitanOrb, 1], [primalMoltenAlloy, 16]], null, "Shields", 1, 325, null, null, "World Drop", "Anvil", "Apparently is 'stashed within the Dragon Isles'?", [["Primal Infusion", {Armorsmithing: 0}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Illustrious Insight", {Shields: 20}]]));
        const draconiumDefenderRecipe = await(createRecipe("Draconium Defender", draconiumDefender, 1, blacksmithing, [[primalFlux, 5], [draconiumOre, 6], [sereviteOre, 12]], 20, "Shields", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {LargePlateArmor: 0}], ["Quenching Fluid", {LargePlateArmor: 30}], ["Lesser Illustrious Insight", {Shields: 20}]]));
        const obsidianSearedClaymoreRecipe = await(createRecipe("Obsidian Seared Claymore", obsidianSearedClaymore, 1, blacksmithing, [[sparkOfIngenuity, 2], [primalChaos, 160], [obsidianSearedAlloy, 8], [primalMoltenAlloy, 5]], null, "Weapons", 1, 300, {ValdrakkenAccord: 14}, null, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Blades: 0}], ["Embellishment", {}], ["Quenching Fluid", {Blades: 30}], ["Illustrious Insight", {LongBlades: 25}]]));
        const obsidianSearedCrusherRecipe = await(createRecipe("Obsidian Seared Crusher", obsidianSearedCrusher, 1, blacksmithing, [[sparkOfIngenuity, 2], [primalChaos, 160], [obsidianSearedAlloy, 7], [primalMoltenAlloy, 7]], null, "Weapons", 1, 300, null, null, "World Drop", "Anvil", "Drops from mobs in the Obsidian Citadel.", [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Hafted: 0}], ["Embellishment", {}], ["Quenching Fluid", {Hafted: 30}], ["Illustrious Insight", {MacesAndHammers: 25}]]));
        const obsidianSearedFacesmasherRecipe = await(createRecipe("Obsidian Seared Facesmasher", obsidianSearedFacesmasher, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 80], [obsidianSearedAlloy, 6], [primalMoltenAlloy, 6]], null, "Weapons", 1, 300, {MaruukCentaur: 13}, null, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Blades: 0}], ["Embellishment", {}], ["Quenching Fluid", {Blades: 30}], ["Illustrious Insight", {ShortBlades: 25}]]));
        const obsidianSearedHalberdRecipe = await(createRecipe("Obsidian Seared Halberd", obsidianSearedHalberd, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 160], [obsidianSearedAlloy, 6], [primalMoltenAlloy, 8]], null, "Weapons", 1, 300, {MaruukCentaur: 13}, null, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Hafted: 0}], ["Embellishment", {}], ["Quenching Fluid", {Hafted: 30}], ["Illustrious Insight", {AxesPicksAndPolearms: 25}]]));
        const obsidianSearedHexswordRecipe = await(createRecipe("Obsidian Seared Hexsword", obsidianSearedHexsword, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 120], [obsidianSearedAlloy, 6], [primalMoltenAlloy, 6]], null, "Weapons", 1, 300, null, null, "World Drop", "Anvil", "Drops from mobs in the Obsidian Citadel.", [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Blades: 0}], ["Embellishment", {}], ["Quenching Fluid", {Blades: 30}], ["Illustrious Insight", {LongBlades: 25}]]));
        const obsidianSearedInvokerRecipe = await(createRecipe("Obsidian Seared Invoker", obsidianSearedInvoker, 1, blacksmithing, [[sparkOfIngenuity, 2], [primalChaos, 160], [obsidianSearedAlloy, 7], [primalMoltenAlloy, 5]], null, "Weapons", 1, 300, {ValdrakkenAccord: 14}, null, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Hafted: 0}], ["Embellishment", {}], ["Quenching Fluid", {Hafted: 30}], ["Illustrious Insight", {MacesAndHammers: 25}]]));
        const obsidianSearedRuneaxeRecipe = await(createRecipe("Obsidian Seared Runeaxe", obsidianSearedRuneaxe, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 120], [obsidianSearedAlloy, 6], [primalMoltenAlloy, 6]], null, "Weapons", 1, 300, {MaruukCentaur: 13}, null, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Hafted: 0}], ["Embellishment", {}], ["Quenching Fluid", {Hafted: 30}], ["Illustrious Insight", {AxesPicksAndPolearms: 25}]]));
        const obsidianSearedSlicerRecipe = await(createRecipe("Obsidian Seared Slicer", obsidianSearedSlicer, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 80], [obsidianSearedAlloy, 5], [primalMoltenAlloy, 8]], null, "Weapons", 1, 300, null, null, "World Drop", "Anvil", "Drops from mobs in the Obsidian Citadel.", [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Hafted: 0}], ["Embellishment", {}], ["Quenching Fluid", {Hafted: 30}], ["Illustrious Insight", {AxesPicksAndPolearms: 25}]]));
        const primalMoltenGreataxeRecipe = await(createRecipe("Primal Molten Greataxe", primalMoltenGreataxe, 1, blacksmithing, [[sparkOfIngenuity, 2], [primalChaos, 160], [primalMoltenAlloy, 20]], null, "Weapons", 1, 300, null, {AxesPicksAndPolearms: 0}, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Hafted: 0}], ["Embellishment", {}], ["Quenching Fluid", {Hafted: 30}], ["Illustrious Insight", {AxesPicksAndPolearms: 25}]]));
        const primalMoltenLongswordRecipe = await(createRecipe("Primal Molten Longsword", primalMoltenLongsword, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 80], [primalMoltenAlloy, 17]], null, "Weapons", 1, 300, null, {LongBlades: 0}, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Blades: 0}], ["Embellishment", {}], ["Quenching Fluid", {Blades: 30}], ["Illustrious Insight", {LongBlades: 25}]]));
        const primalMoltenMaceRecipe = await(createRecipe("Primal Molten Mace", primalMoltenMace, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 80], [primalMoltenAlloy, 17]], null, "Weapons", 1, 300, null, {MacesAndHammers: 0}, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Hafted: 0}], ["Embellishment", {}], ["Quenching Fluid", {Hafted: 30}], ["Illustrious Insight", {MacesAndHammers: 25}]]));
        const primalMoltenShortbladeRecipe = await(createRecipe("Primal Molten Shortblade", primalMoltenShortblade, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 80], [primalMoltenAlloy, 17]], null, "Weapons", 1, 300, null, {ShortBlades: 0}, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Blades: 0}], ["Embellishment", {}], ["Quenching Fluid", {Blades: 30}], ["Illustrious Insight", {ShortBlades: 25}]]));
        const primalMoltenSpellbladeRecipe = await(createRecipe("Primal Molten Spellblade", primalMoltenSpellblade, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 120], [primalMoltenAlloy, 17]], null, "Weapons", 1, 300, null, {ShortBlades: 5}, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Blades: 0}], ["Embellishment", {}], ["Quenching Fluid", {Blades: 30}], ["Illustrious Insight", {ShortBlades: 25}]]));
        const primalMoltenWarglaiveRecipe = await(createRecipe("Primal Molten Warglaive", primalMoltenWarglaive, 1, blacksmithing, [[sparkOfIngenuity, 1], [primalChaos, 80], [primalMoltenAlloy, 17]], null, "Weapons", 1, 300, null, {LongBlades: 5}, null, "Anvil", null, [["Primal Infusion", {Weaponsmithing: 0}], ["Missive", {Blades: 0}], ["Embellishment", {}], ["Quenching Fluid", {Blades: 30}], ["Illustrious Insight", {LongBlades: 25}]]));
        const draconiumGreatMaceRecipe = await(createRecipe("Draconium Great Mace", draconiumGreatMace, 1, blacksmithing, [[primalFlux, 6], [draconiumOre, 10], [sereviteOre, 20]], 50, "Weapons", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {Hafted: 0}], ["Quenching Fluid", {Hafted: 30}], ["Lesser Illustrious Insight", {MacesAndHammers: 25}]]));
        const draconiumStilettoRecipe = await(createRecipe("Draconium Stiletto", draconiumStiletto, 1, blacksmithing, [[primalFlux, 6], [draconiumOre, 6], [sereviteOre, 12]], 45, "Weapons", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {Blades: 0}], ["Quenching Fluid", {Blades: 30}], ["Lesser Illustrious Insight", {ShortBlades: 25}]]));
        const draconiumGreatAxeRecipe = await(createRecipe("Draconium Great Axe", draconiumGreatAxe, 1, blacksmithing, [[primalFlux, 6], [draconiumOre, 10], [sereviteOre, 20]], 40, "Weapons", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {Hafted: 0}], ["Quenching Fluid", {Hafted: 30}], ["Lesser Illustrious Insight", {AxesPicksAndPolearms: 25}]]));
        const draconiumKnucklesRecipe = await(createRecipe("Draconium Knuckles", draconiumKnuckles, 1, blacksmithing, [[primalFlux, 6], [draconiumOre, 6], [sereviteOre, 12]], 30, "Weapons", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {Blades: 0}], ["Quenching Fluid", {Blades: 30}], ["Lesser Illustrious Insight", {ShortBlades: 25}]]));
        const draconiumSwordRecipe = await(createRecipe("Draconium Sword", draconiumSword, 1, blacksmithing, [[primalFlux, 5], [draconiumOre, 6], [sereviteOre, 12]], 30, "Weapons", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {Blades: 0}], ["Quenching Fluid", {Blades: 30}], ["Lesser Illustrious Insight", {LongBlades: 25}]]));
        const draconiumAxeRecipe = await(createRecipe("Draconium Axe", draconiumAxe, 1, blacksmithing, [[primalFlux, 5], [draconiumOre, 6], [sereviteOre, 12]], 25, "Weapons", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {Hafted: 0}], ["Quenching Fluid", {Hafted: 30}], ["Lesser Illustrious Insight", {AxesPicksAndPolearms: 25}]]));
        const draconiumDirkRecipe = await(createRecipe("Draconium Dirk", draconiumDirk, 1, blacksmithing, [[primalFlux, 6], [draconiumOre, 6], [sereviteOre, 12]], 20, "Weapons", 2, 60, null, null, null, "Anvil", null, [["Training Matrix", {}], ["Missive", {Blades: 0}], ["Quenching Fluid", {Blades: 30}], ["Lesser Illustrious Insight", {ShortBlades: 25}]]));
        const blackDragonTouchedHammerRecipe = await(createRecipe("Black Dragon Touched Hammer", blackDragonTouchedHammer, 1, blacksmithing, [[artisansMettle, 400], [earthenSoul, 1], [obsidianSearedAlloy, 7]], null, "Profession Tools and Accessories", 1, 450, null, null, "World Drop", "Earth-Warder's Forge", "Dropped from Rohzor Forgesmash in the Waking Shores.", [["Missive", {}], ["Quenching Fluid", {Hafted: 30, Toolsmithing: 30}], ["Illustrious Insight", {MacesAndHammers: 25, SpecialtySmithing: 40}]]));
        const khazgoriteBlacksmithsHammerRecipe = await(createRecipe("Khaz'gorite Blacksmith's Hammer", khazgoriteBlacksmithsHammer, 1, blacksmithing, [[artisansMettle, 225], [primalFlux, 15], [khazgoriteOre, 40], [sereviteOre, 100]], null, "Profession Tools and Accessories", 1, 425, null, {MacesAndHammers: 10}, null, "Anvil", null, [["Missive", {}], ["Quenching Fluid", {Hafted: 30, Toolsmithing: 30}], ["Illustrious Insight", {MacesAndHammers: 25, SpecialtySmithing: 40}]]));
        const khazgoriteBlacksmithsToolboxRecipe = await(createRecipe("Khaz'gorite Blacksmith's Toolbox", khazgoriteBlacksmithsToolbox, 1, blacksmithing, [[artisansMettle, 225], [primalFlux, 12], [khazgoriteOre, 40], [sereviteOre, 100]], null, "Profession Tools and Accessories", 1, 400, null, {Toolsmithing: 10}, null, "Anvil", null, [["Quenching Fluid", {Toolsmithing: 30}], ["Illustrious Insight", {SpecialtySmithing: 40}]]));
        const khazgoriteLeatherworkersKnifeRecipe = await(createRecipe("Khaz'gorite Leatherworker's Knife", khazgoriteLeatherworkersKnife, 1, blacksmithing, [[artisansMettle, 225], [primalFlux, 15], [khazgoriteOre, 40], [sereviteOre, 100]], null, "Profession Tools and Accessories", 1, 425, {MaruukCentaur: 18}, null, null, "Anvil", null, [["Missive", {}], ["Quenching Fluid", {Blades: 30, Toolsmithing: 30}], ["Illustrious Insight", {ShortBlades: 25, SpecialtySmithing: 40}]]));
        const khazgoriteLeatherworkersToolsetRecipe = await(createRecipe("Khaz'gorite Leatherworker's Toolset", khazgoriteLeatherworkersToolset, 1, blacksmithing, [[artisansMettle, 300], [primalFlux, 12], [khazgoriteOre, 40], [sereviteOre, 100]], null, "Profession Tools and Accessories", 1, 400, {ValdrakkenAccord: 19}, null, null, "Anvil", null, [["Quenching Fluid", {Toolsmithing: 30}], ["Illustrious Insight", {SpecialtySmithing: 40}]]));
        const khazgoriteNeedleSetRecipe = await(createRecipe("Khaz'gorite Needle Set", khazgoriteNeedleSet, 1, blacksmithing, [[artisansMettle, 300], [primalFlux, 12], [khazgoriteOre, 35], [sereviteOre, 100]], null, "Profession Tools and Accessories", 1, 400, {ValdrakkenAccord: 19}, null, null, "Anvil", null, [["Quenching Fluid", {Toolsmithing: 30}], ["Illustrious Insight", {SpecialtySmithing: 40}]]));
        const khazgoritePickaxeRecipe = await(createRecipe("Khaz'gorite Pickaxe", khazgoritePickaxe, 1, blacksmithing, [[artisansMettle, 300], [primalFlux, 15], [khazgoriteOre, 45], [sereviteOre, 100]], null, "Profession Tools and Accessories", 1, 425, null, {AxesPicksAndPolearms: 10}, null, "Anvil", null, [["Missive", {}], ["Quenching Fluid", {Hafted: 30, Toolsmithing: 30}], ["Illustrious Insight", {AxesPicksAndPolearms: 25, SpecialtySmithing: 40}]]));
        const khazgoriteSickleRecipe = await(createRecipe("Khaz'gorite Sickle", khazgoriteSickle, 1, blacksmithing, [[artisansMettle, 300], [primalFlux, 15], [khazgoriteOre, 40], [sereviteOre, 100]], null, "Profession Tools and Accessories", 1, 425, {ValdrakkenAccord: 19}, null, null, "Anvil", null, [["Missive", {}], ["Quenching Fluid", {Blades: 30, Toolsmithing: 30}], ["Illustrious Insight", {LongBlades: 25, SpecialtySmithing: 40}]]));
        const khazgoriteSkinningKnifeRecipe = await(createRecipe("Khaz'gorite Skinning Knife", khazgoriteSkinningKnife, 1, blacksmithing, [[artisansMettle, 300], [primalFlux, 15], [khazgoriteOre, 40], [sereviteOre, 100]], null, "Profession Tools and Accessories", 1, 425, {MaruukCentaur: 18}, null, null, "Anvil", null, [["Missive", {}], ["Quenching Fluid", {Blades: 30, Toolsmithing: 30}], ["Illustrious Insight", {ShortBlades: 25, SpecialtySmithing: 40}]]));
        const draconiumNeedleSetRecipe = await(createRecipe("Draconium Needle Set", draconiumNeedleSet, 1, blacksmithing, [[primalFlux, 3], [draconiumOre, 4], [sereviteOre, 10]], 30, "Profession Tools and Accessories", 2, 80, null, null, null, "Anvil", null, [["Quenching Fluid", {Toolsmithing: 30}], ["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const draconiumLeatherworkersToolsetRecipe = await(createRecipe("Draconium Leatherworker's Toolset", draconiumLeatherworkersToolset, 1, blacksmithing, [[primalFlux, 3], [sereviteOre, 12], [draconiumOre, 3]], 25, "Profession Tools and Accessories", 3, 80, null, null, null, "Anvil", null, [["Quenching Fluid", {Toolsmithing: 30}], ["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const draconiumLeatherworkersKnifeRecipe = await(createRecipe("Draconium Leatherworker's Knife", draconiumLeatherworkersKnife, 1, blacksmithing, [[primalFlux, 4], [draconiumOre, 3], [sereviteOre, 12]], 20, "Profession Tools and Accessories", 3, 80, null, null, null, "Anvil", null, [["Missive", {}], ["Quenching Fluid", {Blades: 30, Toolsmithing: 30}], ["Lesser Illustrious Insight", {ShortBlades: 25, SpecialtySmithing: 40}]]));
        const draconiumBlacksmithsToolboxRecipe = await(createRecipe("Draconium Blacksmith's Toolbox", draconiumBlacksmithsToolbox, 1, blacksmithing, [[primalFlux, 3], [sereviteOre, 12], [draconiumOre, 3]], 15, "Profession Tools and Accessories", 3, 80, null, null, null, "Anvil", null, [["Quenching Fluid", {Toolsmithing: 30}], ["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const draconiumSkinningKnifeRecipe = await(createRecipe("Draconium Skinning Knife", draconiumSkinningKnife, 1, blacksmithing, [[primalFlux, 4], [draconiumOre, 3], [sereviteOre, 10]], 15, "Profession Tools and Accessories", 3, 80, null, null, null, "Anvil", null, [["Missive", {}], ["Quenching Fluid", {Blades: 30, Toolsmithing: 30}], ["Lesser Illustrious Insight", {ShortBlades: 25, SpecialtySmithing: 40}]]));
        const draconiumSickleRecipe = await(createRecipe("Draconium Sickle", draconiumSickle, 1, blacksmithing, [[primalFlux, 4], [draconiumOre, 2], [sereviteOre, 10]], 10, "Profession Tools and Accessories", 3, 80, null, null, null, "Anvil", null, [["Missive", {}], ["Quenching Fluid", {Blades: 30, Toolsmithing: 30}], ["Lesser Illustrious Insight", {LongBlades: 25, SpecialtySmithing: 40}]]));
        const draconiumPickaxeRecipe = await(createRecipe("Draconium Pickaxe", draconiumPickaxe, 1, blacksmithing, [[primalFlux, 4], [draconiumOre, 2], [sereviteOre, 10]], 5, "Profession Tools and Accessories", 3, 80, null, null, null, "Anvil", null, [["Missive", {}], ["Quenching Fluid", {Hafted: 30, Toolsmithing: 30}], ["Lesser Illustrious Insight", {AxesPicksAndPolearms: 25, SpecialtySmithing: 40}]]));
        const draconiumBlacksmithsHammerRecipe = await(createRecipe("Draconium Blacksmith's Hammer", draconiumBlacksmithsHammer, 1, blacksmithing, [[primalFlux, 4], [draconiumOre, 2], [sereviteOre, 10]], 1, "Profession Tools and Accessories", 3, 80, null, null, null, "Anvil", "Learned by default.", [["Missive", {}], ["Quenching Fluid", {Hafted: 30, Toolsmithing: 30}], ["Lesser Illustrious Insight", {MacesAndHammers: 25, SpecialtySmithing: 40}]]));
        const mastersHammerRecipe = await(createRecipe("Master's Hammer", mastersHammer, 1, blacksmithing, [[primalFlux, 10], [obsidianSearedAlloy, 1], [primalMoltenAlloy, 2], [frostfireAlloy, 2]], null, "Consumable Tools", 1, null, null, null, "Various Specializations", "Anvil", "Similar to Illustrious Insight - any Specialization rank that mentions Master's Hammer gives you this recipe."));
        const sturdyExpeditionShovelRecipe = await(createRecipe("Sturdy Expedition Shovel", sturdyExpeditionShovel, 2, blacksmithing, [[primalFlux, 2], [sereviteOre, 10]], null, "Consumable Tools", 1, null, {DragonscaleExpedition: "?"}, null, null, "Anvil", null, [["Quenching Fluid", {Toolsmithing: 30}]]));
        const sereviteRepairHammerRecipe = await(createRecipe("Serevite Repair Hammer", sereviteRepairHammer, 1, blacksmithing, [[primalFlux, 3], [sereviteOre, 8]], 15, "Consumable Tools", 1, null, null, null, null, "Anvil", null, [["Quenching Fluid", {Toolsmithing: 30}]]));
        const sereviteSkeletonKeyRecipe = await(createRecipe("Serevite Skeleton Key", sereviteSkeletonKey, 5, blacksmithing, [[primalFlux, 3], [sereviteOre, 20]], 5, "Consumable Tools", 1, null, null, null, null, "Anvil", null, [["Quenching Fluid", {Toolsmithing: 30}]]));
        const primalRazorstoneRecipe = await(createRecipe("Primal Razorstone", primalRazorstone, 5, blacksmithing, [[glossyStone, 4], [silkenGemdust, 1]], null, "Stonework", 1, 325, {ArtisansConsortium: "Valued"}, null, null, null, null, [["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const primalWhetstoneRecipe = await(createRecipe("Primal Whetstone", primalWhetstone, 5, blacksmithing, [[awakenedFire, 1], [glossyStone, 4]], 35, "Stonework", 1, 325, null, null, null, null, null, [["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const primalWeightstoneRecipe = await(createRecipe("Primal Weightstone", primalWeightstone, 5, blacksmithing, [[awakenedEarth, 1], [glossyStone, 4]], 30, "Stonework", 1, 325, null, null, null, null, null, [["Lesser Illustrious Insight", {SpecialtySmithing: 40}]]));
        const alvinTheAnvilRecipe = await(createRecipe("Alvin the Anvil", alvinTheAnvil, 1, blacksmithing, [[earthenSoul, 1], [primalMoltenAlloy, 6], [frostfireAlloy, 6], [infuriousAlloy, 6]], null, "Pets", 1, null, null, null, "World Drop", "Anvil", "Drops from 'Powerful Blacksmiths'?"));
        const prototypeExplorersBardingFrameworkRecipe = await(createRecipe("Prototype Explorer's Barding Framework", prototypeExplorersBardingFramework, 1, blacksmithing, [[primalFlux, 5], [primalBearSpine, 3], [sereviteOre, 20], [primalMoltenAlloy, 1], [obsidianSearedAlloy, 2]], null, "Dragon Riding", 1, null, {MaruukCentaur: 22}, null, null, "Anvil"));
        const prototypeRegalBardingFrameworkRecipe = await(createRecipe("Prototype Regal Barding Framework", prototypeRegalBardingFramework, 1, blacksmithing, [[primalFlux, 5], [mastodonTusk, 3], [sereviteOre, 20], [frostfireAlloy, 1], [obsidianSearedAlloy, 2]], null, "Dragon Riding", 1, null, null, null, "World Drop", "Anvil", "Drops from Draconic Recipe in a Bottle."));



        //enchanting recipes - 68 total
        const illustriousInsightRecipeEnchanting = await(createRecipe("Illustrious Insight", illustriousInsight, 1, enchanting, [[artisansMettle, 50]], null, "Finishing Reagents", 1, null, null, null, "Various Specializations", "Enchanter's Lectern"));
        const gracefulAvoidanceRecipe = await(createRecipe("Graceful Avoidance", gracefulAvoidance, 1, enchanting, [[chromaticDust, 8], [vibrantShard, 3]], null, "Cloak Enchantments", 1, 400, {DragonscaleExpedition: 9}, null, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const homeboundSpeedRecipe = await(createRecipe("Homebound Speed", homeboundSpeed, 1, enchanting, [[chromaticDust, 8], [vibrantShard, 3]], null, "Cloak Enchantments", 1, 400, {ValdrakkenAccord: 11}, null, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const regenerativeLeechRecipe = await(createRecipe("Regenerative Leech", regenerativeLeech, 1, enchanting, [[chromaticDust, 8], [vibrantShard, 3]], null, "Cloak Enchantments", 1, 400, {IskaaraTuskarr: 10}, null, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const writOfAvoidanceCloakRecipe = await(createRecipe("Writ of Avoidance", writOfAvoidanceCloak, 1, enchanting, [[chromaticDust, 12]], 25, "Cloak Enchantments", 1, 200, null, null, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const writOfLeechCloakRecipe = await(createRecipe("Writ of Leech", writOfLeechCloak, 1, enchanting, [[chromaticDust, 12]], 25, "Cloak Enchantments", 1, 200, null, null, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const writOfSpeedCloakRecipe = await(createRecipe("Writ of Speed", writOfSpeedCloak, 1, enchanting, [[chromaticDust, 12]], 25, "Cloak Enchantments", 1, 200, null, null, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const acceleratedAgilityRecipe = await(createRecipe("Accelerated Agility", acceleratedAgility, 1, enchanting, [[vibrantShard, 3], [resonantCrystal, 2]], null, "Chest Enchantments", 1, 400, {IskaaraTuskarr: 10}, null, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const reserveOfIntellectRecipe = await(createRecipe("Reserve of Intellect", reserveOfIntellect, 1, enchanting, [[vibrantShard, 4], [resonantCrystal, 1]], null, "Chest Enchantments", 1, 400, null, {MagicalReinforcement: 20}, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const sustainedStrengthRecipe = await(createRecipe("Sustained Strength", sustainedStrength, 1, enchanting, [[vibrantShard, 4], [resonantCrystal, 2]], null, "Chest Enchantments", 1, 400, {MaruukCentaur: 8}, null, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const wakingStatsRecipe = await(createRecipe("Waking Stats", wakingStats, 1, enchanting, [[chromaticDust, 8], [vibrantShard, 3]], null, "Chest Enchantments", 1, 350, null, {MagicalReinforcement: 0}, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const devotionOfAvoidanceRecipe = await(createRecipe("Devotion of Avoidance", devotionOfAvoidance, 1, enchanting, [[chromaticDust, 5], [vibrantShard, 4]], null, "Bracer Enchantments", 1, 425, null, {Adaptive: 0}, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const devotionOfLeechRecipe = await(createRecipe("Devotion of Leech", devotionOfLeech, 1, enchanting, [[chromaticDust, 5], [vibrantShard, 4]], null, "Bracer Enchantments", 1, 425, null, {Adaptive: 10}, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const devotionOfSpeedRecipe = await(createRecipe("Devotion of Speed", devotionOfSpeed, 1, enchanting, [[chromaticDust, 5], [vibrantShard, 4]], null, "Bracer Enchantments", 1, 425, null, {Adaptive: 20}, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const writOfAvoidanceBracerRecipe = await(createRecipe("Writ of Avoidance", writOfAvoidanceBracer, 1, enchanting, [[vibrantShard, 1]], 15, "Bracer Enchantments", 1, 60, null, null, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const writOfLeechBracerRecipe = await(createRecipe("Writ of Leech", writOfLeechBracer, 1, enchanting, [[vibrantShard, 1]], 15, "Bracer Enchantments", 1, 60, null, null, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const writOfSpeedBracerRecipe = await(createRecipe("Writ of Speed", writOfSpeedBracer, 1, enchanting, [[vibrantShard, 1]], 15, "Bracer Enchantments", 1, 60, null, null, null, null, null, [["Lesser Illustrious Insight", {Adaptive: 30}]]));
        const plainsrunnersBreezeRecipe = await(createRecipe("Plainsrunner's Breeze", plainsrunnersBreeze, 1, enchanting, [[vibrantShard, 4], [awakenedAir, 1], [awakenedEarth, 1]], null, "Boot Enchantments", 1, 450, {MaruukCentaur: 8}, null, null, null, null, [["Lesser Illustrious Insight", {Earthen: 10, Wafting: 10}]]));
        const ridersReassuranceRecipe = await(createRecipe("Rider's Reassurance", ridersReassurance, 1, enchanting, [[vibrantShard, 4], [awakenedAir, 1], [awakenedEarth, 1]], null, "Boot Enchantments", 1, 450, {DragonscaleExpedition: 9}, null, null, null, null, [["Lesser Illustrious Insight", {Earthen: 10, Wafting: 10}]]));
        const watchersLoamRecipe = await(createRecipe("Watcher's Loam", watchersLoam, 1, enchanting, [[vibrantShard, 4], [awakenedAir, 1], [awakenedEarth, 1]], null, "Boot Enchantments", 1, 450, {ValdrakkenAccord: 11}, null, null, null, null, [["Lesser Illustrious Insight", {Earthen: 10, Wafting: 10}]]));
        const devotionOfCriticalStrikeRecipe = await(createRecipe("Devotion of Critical Strike", devotionOfCriticalStrike, 1, enchanting, [[chromaticDust, 5], [vibrantShard, 3]], 35, "Ring Enchantments", 1, 425, null, null, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const devotionOfHasteRecipe = await(createRecipe("Devotion of Haste", devotionOfHaste, 1, enchanting, [[chromaticDust, 5], [vibrantShard, 3]], 35, "Ring Enchantments", 1, 425, null, null, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const devotionOfMasteryRecipe = await(createRecipe("Devotion of Mastery", devotionOfMastery, 1, enchanting, [[chromaticDust, 5], [vibrantShard, 3]], 35, "Ring Enchantments", 1, 425, null, null, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const devotionOfVersatilityRecipe = await(createRecipe("Devotion of Versatility", devotionOfVersatility, 1, enchanting, [[chromaticDust, 5], [vibrantShard, 3]], 30, "Ring Enchantments", 1, 425, null, null, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const writOfCriticalStrikeRecipe = await(createRecipe("Writ of Critical Strike", writOfCriticalStrike, 1, enchanting, [[chromaticDust, 3]], 5, "Ring Enchantments", 1, 40, null, null, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const writOfHasteRecipe = await(createRecipe("Writ of Haste", writOfHaste, 1, enchanting, [[chromaticDust, 3]], 5, "Ring Enchantments", 1, 40, null, null, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const writOfMasteryRecipe = await(createRecipe("Writ of Mastery", writOfMastery, 1, enchanting, [[chromaticDust, 3]], 5, "Ring Enchantments", 1, 40, null, null, null, null, null, [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const writOfVersatilityRecipe = await(createRecipe("Writ of Versatility", writOfHaste, 1, enchanting, [[chromaticDust, 3]], 1, "Ring Enchantments", 1, 40, null, null, null, null, "Learned by default.", [["Lesser Illustrious Insight", {MagicalReinforcement: 30}]]));
        const burningDevotionRecipe = await(createRecipe("Burning Devotion", burningDevotion, 1, enchanting, [[vibrantShard, 5], [resonantCrystal, 4], [awakenedFire, 6], [glowingTitanOrb, 3]], null, "Weapon Enchantments", 1, 425, null, {Burning: 0}, null, null, null, [["Illustrious Insight", {Burning: 10}]]));
        const earthenDevotionRecipe = await(createRecipe("Earthen Devotion", earthenDevotion, 1, enchanting, [[vibrantShard, 5], [resonantCrystal, 4], [awakenedEarth, 6], [glowingTitanOrb, 3]], null, "Weapon Enchantments", 1, 425, null, {Earthen: 0}, null, null, null, [["Illustrious Insight", {Earthen: 10}]]));
        const frozenDevotionRecipe = await(createRecipe("Frozen Devotion", frozenDevotion, 1, enchanting, [[vibrantShard, 5], [resonantCrystal, 4], [awakenedFrost, 6], [glowingTitanOrb, 3]], null, "Weapon Enchantments", 1, 425, null, {Frozen: 0}, null, null, null, [["Illustrious Insight", {Frozen: 10}]]));
        const sophicDevotionRecipe = await(createRecipe("Sophic Devotion", sophicDevotion, 1, enchanting, [[vibrantShard, 5], [resonantCrystal, 4], [awakenedOrder, 4], [glowingTitanOrb, 3]], null, "Weapon Enchantments", 1, 425, null, {Sophic: 0}, null, null, null, [["Illustrious Insight", {Sophic: 10}]]));
        const waftingDevotionRecipe = await(createRecipe("Wafting Devotion", waftingDevotion, 1, enchanting, [[vibrantShard, 5], [resonantCrystal, 4], [awakenedAir, 6], [glowingTitanOrb, 3]], null, "Weapon Enchantments", 1, 425, null, {Wafting: 0}, null, null, null, [["Illustrious Insight", {Wafting: 10}]]));
        const burningWritRecipe = await(createRecipe("Burning Writ", burningWrit, 1, enchanting, [[chromaticDust, 15], [resonantCrystal, 2], [awakenedFire, 4]], 50, "Weapon Enchantments", 1, 300, null, null, null, null, null, [["Illustrious Insight", {Burning: 10}]]));
        const earthenWritRecipe = await(createRecipe("Earthen Writ", earthenWrit, 1, enchanting, [[chromaticDust, 15], [resonantCrystal, 2], [awakenedEarth, 4]], 50, "Weapon Enchantments", 1, 300, null, null, null, null, null, [["Illustrious Insight", {Earthen: 10}]]));
        const frozenWritRecipe = await(createRecipe("Frozen Writ", frozenWrit, 1, enchanting, [[chromaticDust, 15], [resonantCrystal, 2], [awakenedFrost, 4]], 50, "Weapon Enchantments", 1, 300, null, null, null, null, null, [["Illustrious Insight", {Frozen: 10}]]));
        const sophicWritRecipe = await(createRecipe("Sophic Writ", sophicWrit, 1, enchanting, [[chromaticDust, 15], [resonantCrystal, 2], [awakenedOrder, 3]], 50, "Weapon Enchantments", 1, 300, null, null, null, null, null, [["Illustrious Insight", {Sophic: 10}]]));
        const waftingWritRecipe = await(createRecipe("Wafting Writ", waftingWrit, 1, enchanting, [[chromaticDust, 15], [resonantCrystal, 2], [awakenedAir, 4]], 50, "Weapon Enchantments", 1, 300, null, null, null, null, null, [["Illustrious Insight", {Wafting: 10}]]));
        const draconicDeftnessRecipe = await(createRecipe("Draconic Deftness", draconicDeftness, 1, enchanting, [[vibrantShard, 4], [resonantCrystal, 2], [iridescentPlume, 3]], null, "Profession Tool Enchantments", 1, 400, {ArtisansConsortium: "Valued"}, null, null, null, null, [["Illustrious Insight", {Artistry: 30}]]));
        const draconicFinesseRecipe = await(createRecipe("Draconic Finesse", draconicFinesse, 1, enchanting, [[vibrantShard, 4], [resonantCrystal, 2], [iridescentPlume, 3]], null, "Profession Tool Enchantments", 1, 400, {ArtisansConsortium: "Valued"}, null, null, null, null, [["Illustrious Insight", {Artistry: 30}]]));
        const draconicInspirationRecipe = await(createRecipe("Draconic Inspiration", draconicInspiration, 1, enchanting, [[vibrantShard, 4], [resonantCrystal, 2], [iridescentPlume, 3]], null, "Profession Tool Enchantments", 1, 400, null, {Artistry: 0}, null, null, null, [["Illustrious Insight", {Artistry: 30}]]));
        const draconicPerceptionRecipe = await(createRecipe("Draconic Perception", draconicPerception, 1, enchanting, [[vibrantShard, 4], [resonantCrystal, 2], [iridescentPlume, 3]], null, "Profession Tool Enchantments", 1, 400, {ArtisansConsortium: "Valued"}, null, null, null, null, [["Illustrious Insight", {Artistry: 30}]]));
        const draconicResourcefulnessRecipe = await(createRecipe("Draconic Resourcefulness", draconicResourcefulness, 1, enchanting, [[vibrantShard, 4], [resonantCrystal, 2], [iridescentPlume, 3]], null, "Profession Tool Enchantments", 1, 400, null, {Artistry: 15}, null, null, null, [["Illustrious Insight", {Artistry: 30}]]));
        const torchOfPrimalAwakeningRecipe = await(createRecipe("Torch of Primal Awakening", torchOfPrimalAwakening, 1, enchanting, [[sparkOfIngenuity, 1], [primalChaos, 120], [vibrantShard, 2], [resonantCrystal, 3], [runedWrithebark, 2], [primalMoltenAlloy, 2]], null, "Rods and Wands", 1, 265, null, {RodsAndWands: 30}, null, "Enchanter's Lectern", null, [["Missive", {RodsAndWands: 0}], ["Primal Infusion", {RodsAndWands: 20}], ["Embellishment", {}], ["Illustrious Insight", {RodsAndWands: 45}]]));
        const runedKhazgoriteRodRecipe = await(createRecipe("Runed Khaz'gorite Rod", runedKhazgoriteRod, 1, enchanting, [[artisansMettle, 300], [vibrantShard, 5], [resonantCrystal, 1], [khazgoriteOre, 4], [runedWrithebark, 2]], null, "Rods and Wands", 1, 350, null, {RodsAndWands: 10}, null, "Enchanter's Lectern", null, [["Missive", {}], ["Illustrious Insight", {RodsAndWands: 45}]]));
        const runedDraconiumRodRecipe = await(createRecipe("Runed Draconium Rod", runedDraconiumRod, 1, enchanting, [[chromaticDust, 4], [draconiumOre, 3], [writhebark, 2]], 10, "Rods and Wands", 3, 80, null, null, null, "Enchanter's Lectern", null, [["Missive", {}], ["Lesser Illustrious Insight", {RodsAndWands: 45}]]));
        const enchantedWrithebarkWandRecipe = await(createRecipe("Enchanted Writhebark Wand", enchantedWrithebarkWand, 1, enchanting, [[chromaticDust, 6], [writhebark, 2]], 5, "Rods and Wands", 3, 60, null, null, null, "Enchanter's Lectern", null, [["Training Matrix", {}], ["Missive", {RodsAndWands: 0}], ["Lesser Illustrious Insight", {RodsAndWands: 45}]]));
        const runedSereviteRodRecipe = await(createRecipe("Runed Serevite Rod", runedSereviteRod, 1, enchanting, [[chromaticDust, 3], [sereviteRod, 1]], 1, "Rods and Wands", 1, 40, null, null, null, "Enchanter's Lectern", "Learned by default.", [["Missive", {}], ["Lesser Illustrious Insight", {RodsAndWands: 45}]]));
        const illusionPrimalAirRecipe = await(createRecipe("Illusion: Primal Air", illusionPrimalAir, 1, enchanting, [[resonantCrystal, 2], [awakenedAir, 20]], null, "Illusory Goods", 1, null, null, null, "World Drop", "Enchanter's Lectern", "Drops during Primal Storms."));
        const illusionPrimalEarthRecipe = await(createRecipe("Illusion: Primal Earth", illusionPrimalEarth, 1, enchanting, [[resonantCrystal, 2], [awakenedEarth, 20]], null, "Illusory Goods", 1, null, null, null, "World Drop", "Enchanter's Lectern", "Drops during Primal Storms."));
        const illusionPrimalFireRecipe = await(createRecipe("Illusion: Primal Fire", illusionPrimalFire, 1, enchanting, [[resonantCrystal, 2], [awakenedFire, 20]], null, "Illusory Goods", 1, null, null, null, "World Drop", "Enchanter's Lectern", "Drops during Primal Storms."));
        const illusionPrimalFrostRecipe = await(createRecipe("Illusion: Primal Frost", illusionPrimalFrost, 1, enchanting, [[resonantCrystal, 2], [awakenedFrost, 20]], null, "Illusory Goods", 1, null, null, null, "World Drop", "Enchanter's Lectern", "Drops during Primal Storms."));
        const illusionPrimalMasteryRecipe = await(createRecipe("Illusion: Primal Mastery", illusionPrimalMastery, 1, enchanting, [[resonantCrystal, 5], [awakenedAir, 5], [awakenedEarth, 5], [awakenedFire, 5], [awakenedFrost, 5]], null, "Illusory Goods", 1, null, null, null, "Raid Drop", "Enchanter's Lectern", "Drops from Kurog Grimtotem in Vault of the Incarnates."));
        const primalInvocationExtractRecipe = await(createRecipe("Primal Invocation Extract", primalInvocationExtract, 1, enchanting, [[awakenedAir, 1], [awakenedEarth, 1], [awakenedFire, 1], [awakenedFrost, 1], [awakenedOrder, 1]], null, "Illusory Goods", 1, 300, null, null, "Other", "Enchanter's Lectern", "Received from 'Primal Extraction - Glimmers of Insight'?", [["Lesser Illustrious Insight", {Burning: 10, Earthen: 10, Sophic: 10, Frozen: 10, Wafting: 10}]]));
        const khadgarsDisenchantingRodRecipe = await(createRecipe("Khadgar's Disenchanting Rod", khadgarsDisenchantingRod, 1, enchanting, [[chromaticDust, 12], [vibrantShard, 6], [resonantCrystal, 3]], null, "Illusory Goods", 1, null, null, {IllusoryGoods: 30}, null, "Enchanter's Lectern"));
        const illusoryAdornmentOrderRecipe = await(createRecipe("Illusory Adornment: Order", illusoryAdornmentOrder, 1, enchanting, [[chromaticDust, 2], [rousingOrder, 2]], null, "Illusory Goods", 1, 275, null, {IllusoryGoods: 20}, null, null, null, [["Lesser Illustrious Insight", {Sophic: 10}]]));
        const illusoryAdornmentAirRecipe = await(createRecipe("Illusory Adornment: Air", illusoryAdornmentAir, 1, enchanting, [[chromaticDust, 2], [rousingAir, 2]], 40, "Illusory Goods", 1, 275, null, null, null, null, null, [["Lesser Illustrious Insight", {Wafting: 10}]]));
        const illusoryAdornmentEarthRecipe = await(createRecipe("Illusory Adornment: Earth", illusoryAdornmentEarth, 1, enchanting, [[chromaticDust, 2], [rousingEarth, 2]], 40, "Illusory Goods", 1, 275, null, null, null, null, null, [["Lesser Illustrious Insight", {Earthen: 10}]]));
        const illusoryAdornmentFireRecipe = await(createRecipe("Illusory Adornment: Fire", illusoryAdornmentFire, 1, enchanting, [[chromaticDust, 2], [rousingFire, 2]], 40, "Illusory Goods", 1, 275, null, null, null, null, null, [["Lesser Illustrious Insight", {Burning: 10}]]));
        const illusoryAdornmentFrostRecipe = await(createRecipe("Illusory Adornment: Frost", illusoryAdornmentFrost, 1, enchanting, [[chromaticDust, 2], [rousingFrost, 2]], 40, "Illusory Goods", 1, 275, null, null, null, null, null, [["Lesser Illustrious Insight", {Frozen: 10}]]));
        const scepterOfSpectacleOrderRecipe = await(createRecipe("Scepter of Spectacle: Order", scepterOfSpectacleOrder, 1, enchanting, [[chromaticDust, 1], [rousingOrder, 3], [writhebark, 1]], null, "Illusory Goods", 1, null, null, {IllusoryGoods: 10}, null, "Enchanter's Lectern"));
        const scepterOfSpectacleAirRecipe = await(createRecipe("Scepter of Spectacle: Air", scepterOfSpectacleAir, 1, enchanting, [[chromaticDust, 1], [rousingAir, 3], [writhebark, 1]], 20, "Illusory Goods", 1, null, null, null, null, "Enchanter's Lectern"));
        const scepterOfSpectacleFrostRecipe = await(createRecipe("Scepter of Spectacle: Frost", scepterOfSpectacleFrost, 1, enchanting, [[chromaticDust, 1], [rousingFrost, 3], [writhebark, 1]], 20, "Illusory Goods", 1, null, null, null, null, "Enchanter's Lectern"));
        const scepterOfSpectacleEarthRecipe = await(createRecipe("Scepter of Spectacle: Earth", scepterOfSpectacleEarth, 1, enchanting, [[chromaticDust, 1], [rousingEarth, 3], [writhebark, 1]], 1, "Illusory Goods", 1, null, null, null, null, "Enchanter's Lectern", "Learned by default."));
        const scepterOfSpectacleFireRecipe = await(createRecipe("Scepter of Spectacle: Fire", scepterOfSpectacleFire, 1, enchanting, [[chromaticDust, 1], [rousingFire, 3], [writhebark, 1]], 1, "Illusory Goods", 1, null, null, null, null, "Enchanter's Lectern", "Learned by default."));
        const crystallineShatterResonantCrystal = await(createRecipe("Crystalline Shatter", vibrantShard, 3, enchanting, [[resonantCrystal, 1]], null, "Shatters", 0, null, null, {DraconicDisenchantment: 10}));
        const crystallineShatterVibrantShard = await(createRecipe("Crystalline Shatter", chromaticDust, 3, enchanting, [[vibrantShard, 1]], null, "Shatters", 0, null, null, {DraconicDisenchantment: 10}));
        // const elementalShatter = await(createRecipe("Elemental Shatter", null, 1, enchanting, [[awakenedAir, 1]], null, "Shatters", 0, null, null, {PrimalExtraction: 10}, null, null, "Gain an element's power for 10 minutes."));
        const sophicAmalgamationRecipe = await(createRecipe("Sophic Amalgamation", sophicAmalgamation, 1, enchanting, [[resonantCrystal, 3], [awakenedOrder, 3]], null, "Magical Merchandise", 1, null, null, {PrimalExtraction: 20}, null, "Enchanter's Lectern"));



        //engineering recipes - # total
        const arclightCapacitorRecipe = await(createRecipe("Arclight Capacitor", arclightCapacitor, 1, engineering, [[awakenedOrder, 1], [shockSpringCoil, 2], [greasedUpGears, 1], [khazgoriteOre, 2]], 20, "Parts", 2, 350, null, null, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {PiecesParts: 15}], ["Spare Parts", {PiecesParts: 0}]]));
        const reinforcedMachineChassisRecipe = await(createRecipe("Reinforced Machine Chassis", reinforcedMachineChassis, 1, engineering, [[awakenedEarth, 1], [handfulOfSereviteBolts, 4], [shockSpringCoil, 1], [greasedUpGears, 2]], 20, "Parts", 1, 300, null, null, null, null, null, [["Lesser Illustrious Insight", {PiecesParts: 15}], ["Spare Parts", {PiecesParts: 0}]]));
        const assortedSafetyFusesRecipe = await(createRecipe("Assorted Safety Fuses", assortedSafetyFuses, "2-3", engineering, [[wildercloth, 3], [handfulOfSereviteBolts, 3], [shockSpringCoil, 1], [greasedUpGears, 1]], null, "Parts", 1, 250, null, {EZThro: 0}, null, null, null, [["Lesser Illustrious Insight", {PiecesParts: 15}], ["Spare Parts", {PiecesParts: 0}]]));
        const everburningBlastingPowderRecipe = await(createRecipe("Everburning Blasting Powder", everburningBlastingPowder, "1-2", engineering, [[rousingFire, 2], [rousingEarth, 1], [draconiumOre, 1]], 15, "Parts", 1, 200, null, null, null, null, null, [["Lesser Illustrious Insight", {PiecesParts: 15}], ["Spare Parts", {PiecesParts: 0}]]));
        const greasedUpGearsRecipe = await(createRecipe("Greased-Up Gears", greasedUpGears, "1-2", engineering, [[rousingFire, 3], [handfulOfSereviteBolts, 2], [draconiumOre, 4]], 10, "Parts", 1, 250, null, null, null, null, null, [["Lesser Illustrious Insight", {PiecesParts: 15}], ["Spare Parts", {PiecesParts: 0}]]));
        const shockSpringCoilRecipe = await(createRecipe("Shock-Spring Coil", shockSpringCoil, "1-2", engineering, [[rousingEarth, 2], [handfulOfSereviteBolts, 6]], 5, "Parts", 1, 150, null, null, null, null, null, [["Lesser Illustrious Insight", {PiecesParts: 15}], ["Spare Parts", {PiecesParts: 0}]]));
        const handfulOfSereviteBoltsRecipe = await(createRecipe("Handful of Serevite Bolts", handfulOfSereviteBolts, "2-3", engineering, [[sereviteOre, 4]], 1, "Parts", 1, 50, null, null, null, null, "Learned by default.", [["Lesser Illustrious Insight", {PiecesParts: 15}], ["Spare Parts", {PiecesParts: 0}]]));
        // const rummageThroughScrap = await(createRecipe("Rummage Through Scrap", null, 1, engineering, [[pieceOfScrap, 5]], null, "Parts", 0, null, null, {Scrapper: 0}, null, null, "Need more info"));
        const overchargedOverclockerRecipe = await(createRecipe("Overcharged Overclocker", overchargedOverclocker, 2, engineering, [[rousingFire, 5], [handfulOfSereviteBolts, 2], [shockSpringCoil, 3]], 40, "Finishing Reagents", 1, 425, null, null, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const illustriousInsightRecipeEngineering = await(createRecipe("Illustrious Insight", illustriousInsight, 1, engineering, [[artisansMettle, 50]], null, "Finishing Reagents", 1, null, null, null, "Various Specializations", "Tinker's Workbench"));
        const haphazardlyTetheredWiresRecipe = await(createRecipe("Haphazardly Tethered Wires", haphazardlyTetheredWires, 2, engineering, [[rousingEarth, 4], [handfulOfSereviteBolts, 3]], 25, "Finishing Reagents", 1, 250, null, null, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const calibratedSafetySwitchRecipe = await(createRecipe("Calibrated Safety Switch", calibratedSafetySwitch, 1, engineering, [[arclightCapacitor, 1], [shockSpringCoil, 2], [greasedUpGears, 1], [reinforcedMachineChassis, 1]], null, "Optional Reagents", 1, 425, null, {GearsForGear: 20}, "Tinker Malfunction", "Tinker's Workbench", "Chance to get from a tinker malfunction while having Gears For Gear 20.", [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const criticalFailurePreventionUnitRecipe = await(createRecipe("Critical Failure Prevention Unit", criticalFailurePreventionUnit, 1, engineering, [[arclightCapacitor, 1], [primalDeconstructionCharge, 2], [shockSpringCoil, 3], [reinforcedMachineChassis, 1]], null, "Optional Reagents", 1, 425, null, {GearsForGear: 20}, "Tinker Malfunction", "Tinker's Workbench", "Chance to get from a tinker malfunction while having Gears For Gear 20.", [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const magazineOfHealingDartsRecipe = await(createRecipe("Magazine of Healing Darts", magazineOfHealingDarts, 1, engineering, [[arclightCapacitor, 1], [refreshingHealingPotion, 10], [everburningBlastingPowder, 3], [reinforcedMachineChassis, 1]], null, "Optional Reagents", 1, 425, null, {GearsForGear: 10}, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const springLoadedCapacitorCasingRecipe = await(createRecipe("Spring-Loaded Capacitor Casing", springLoadedCapacitorCasing, 1, engineering, [[arclightCapacitor, 1], [shockSpringCoil, 2], [handfulOfSereviteBolts, 10], [reinforcedMachineChassis, 1]], null, "Optional Reagents", 1, 425, null, {GearsForGear: 20}, "Tinker Malfunction", "Tinker's Workbench", "Chance to get from a tinker malfunction while having Gears For Gear 20.", [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const tinkerAlarmOTurretRecipe = await(createRecipe(null, tinkerAlarmOTurret, 1, engineering, [[awakenedIre, 2], [reinforcedMachineChassis, 1], [arclightCapacitor, 1], [greasedUpGears, 3], [shockSpringCoil, 3]], null, "Tinkers", 1, 425, null, null, "PvP Victory", "Tinker's Workbench", "Received from Arena, BGs, or WM?", [["Lesser Illustrious Insight", {MechanicalMind: 30}], ["Spare Parts", {MechanicalMind: 15}]]));
        const tinkerArclightVitalCorrectorsRecipe = await(createRecipe(null, tinkerArclightVitalCorrectors, 1, engineering, [[awakenedOrder, 2], [reinforcedMachineChassis, 1], [arclightCapacitor, 2], [greasedUpGears, 4], [shockSpringCoil, 3]], null, "Tinkers", 1, 425, null, {Inventions: 20}, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {MechanicalMind: 30}], ["Spare Parts", {MechanicalMind: 15}]]));
        const tinkerPolarityAmplifierRecipe = await(createRecipe(null, tinkerPolarityAmplifier, 1, engineering, [[awakenedIre, 1], [reinforcedMachineChassis, 1], [greasedUpGears, 3], [arclightCapacitor, 1], [handfulOfSereviteBolts, 8]], null, "Tinkers", 1, 425, null, null, "PvP Victory", "Tinker's Workbench", "Received from Arena, BGs, or WM?", [["Lesser Illustrious Insight", {MechanicalMind: 30}], ["Spare Parts", {MechanicalMind: 15}]]));
        const tinkerSupercollideOTronRecipe = await(createRecipe(null, tinkerSupercollideOTron, 1, engineering, [[awakenedFire, 5], [awakenedOrder, 3], [shockSpringCoil, 3], [greasedUpGears, 10], [reinforcedMachineChassis, 1], [arclightCapacitor, 3]], null, "Tinkers", 1, 425, null, {Inventions: 40}, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {MechanicalMind: 30}], ["Spare Parts", {MechanicalMind: 15}]]));
        const tinkerGroundedCircuitryRecipe = await(createRecipe(null, tinkerGroundedCircuitry, 1, engineering, [[reinforcedMachineChassis, 1], [handfulOfSereviteBolts, 4], [arclightCapacitor, 2], [greasedUpGears, 2]], null, "Tinkers", 1, 425, {ValdrakkenAccord: 11}, null, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {MechanicalMind: 30}], ["Spare Parts", {MechanicalMind: 15}]]));
        const tinkerBreathOfNeltharionRecipe = await(createRecipe(null, tinkerBreathOfNeltharion, 1, engineering, [[awakenedFire, 3], [reinforcedMachineChassis, 1], [everburningBlastingPowder, 8], [handfulOfSereviteBolts, 5], [greasedUpGears, 4]], null, "Tinkers", 1, 425, null, null, "Dungeon Drop", "Tinker's Workbench", "Drops from 'Crumpled Schematic' in Neltharus.", [["Lesser Illustrious Insight", {MechanicalMind: 30}], ["Spare Parts", {MechanicalMind: 15}]]));
        const tinkerPlaneDisplacerRecipe = await(createRecipe(null, tinkerPlaneDisplacer, 1, engineering, [[shockSpringCoil, 1], [reinforcedMachineChassis, 1], [potionOfTheHushedZephyr, 1]], 25, "Tinkers", 1, 425, null, null, null, null, null, [["Lesser Illustrious Insight", {MechanicalMind: 30}], ["Spare Parts", {MechanicalMind: 15}]]));
        const battleReadyBinocularsRecipe = await(createRecipe(null, battleReadyBinoculars, 1, engineering, [[sparkOfIngenuity, 1], [primalChaos, 50], [awakenedOrder, 2], [framelessLens, 2], [obsidianSearedAlloy, 2], [arclightCapacitor, 2], [reinforcedMachineChassis, 1]], 50, "Goggles", 1, 320, null, null, null, "Tinker's Workbench", null, [["Primal Infusion", {Gear: 10}], ["Cogwheel", {}], ["Safety Components", {GearsForGear: 20}], ["Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const lightweightOcularLensesRecipe = await(createRecipe(null, lightweightOcularLenses, 1, engineering, [[sparkOfIngenuity, 1], [primalChaos, 50], [awakenedOrder, 2], [framelessLens, 2], [vibrantWilderclothBolt, 2], [arclightCapacitor, 2], [reinforcedMachineChassis, 1]], 50, "Goggles", 1, 320, null, null, null, "Tinker's Workbench", null, [["Primal Infusion", {Gear: 10}], ["Cogwheel", {}], ["Safety Components", {GearsForGear: 20}], ["Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const oscillatingWildernessOpticalsRecipe = await(createRecipe(null, oscillatingWildernessOpticals, 1, engineering, [[sparkOfIngenuity, 1], [primalChaos, 50], [awakenedOrder, 2], [framelessLens, 2], [frostbiteScales, 4], [arclightCapacitor, 2], [reinforcedMachineChassis, 1]], 50, "Goggles", 1, 320, null, null, null, "Tinker's Workbench", null, [["Primal Infusion", {Gear: 10}], ["Cogwheel", {}], ["Safety Components", {GearsForGear: 20}], ["Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const peripheralVisionProjectorsRecipe = await(createRecipe(null, peripheralVisionProjectors, 1, engineering, [[sparkOfIngenuity, 1], [primalChaos, 50], [awakenedOrder, 2], [framelessLens, 2], [stonecrustHide, 4], [arclightCapacitor, 2], [reinforcedMachineChassis, 1]], 50, "Goggles", 1, 320, null, null, null, "Tinker's Workbench", null, [["Primal Infusion", {Gear: 10}], ["Cogwheel", {}], ["Safety Components", {GearsForGear: 20}], ["Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const deadlineDeadeyesRecipe = await(createRecipe(null, deadlineDeadeyes, 1, engineering, [[smudgedLens, 2], [shockSpringCoil, 2], [handfulOfSereviteBolts, 2], [greasedUpGears, 1]], 15, "Goggles", 2, 40, null, null, null, null, null, [["Training Matrix", {}], ["Lesser Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const milestoneMagnifiersRecipe = await(createRecipe(null, milestoneMagnifiers, 1, engineering, [[smudgedLens, 2], [shockSpringCoil, 2], [handfulOfSereviteBolts, 2], [greasedUpGears, 1]], 15, "Goggles", 2, 40, null, null, null, null, null, [["Training Matrix", {}], ["Lesser Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const qualityAssuredOpticsRecipe = await(createRecipe(null, qualityAssuredOptics, 1, engineering, [[smudgedLens, 2], [shockSpringCoil, 2], [handfulOfSereviteBolts, 2], [greasedUpGears, 1]], 15, "Goggles", 2, 40, null, null, null, null, null, [["Training Matrix", {}], ["Lesser Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const sentrysStabilizedSpecsRecipe = await(createRecipe(null, sentrysStabilizedSpecs, 1, engineering, [[smudgedLens, 2], [shockSpringCoil, 2], [handfulOfSereviteBolts, 2], [greasedUpGears, 1]], 15, "Goggles", 2, 40, null, null, null, null, null, [["Training Matrix", {}], ["Lesser Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const complicatedCuffsRecipe = await(createRecipe(null, complicatedCuffs, 1, engineering, [[sparkOfIngenuity, 1], [primalChaos, 30], [lustrousScaledHide, 5], [reinforcedMachineChassis, 1], [greasedUpGears, 3], [arclightCapacitor, 3]], null, "Armor", 1, 320, null, {Gear: 0}, "Crafting Goggles/Guns/Bracers", "Tinker's Workbench", "Random chance to learn when crafting other gear pieces while having Gear 0.", [["Primal Infusion", {Gear: 10}], ["Cogwheel", {GearsForGear: 30}], ["Safety Components", {GearsForGear: 20}], ["Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const difficultWristProtectorsRecipe = await(createRecipe(null, difficultWristProtectors, 1, engineering, [[sparkOfIngenuity, 1], [primalChaos, 30], [obsidianSearedAlloy, 2], [reinforcedMachineChassis, 1], [greasedUpGears, 3], [arclightCapacitor, 3]], null, "Armor", 1, 320, null, {Gear: 0}, "Crafting Goggles/Guns/Bracers", "Tinker's Workbench", "Random chance to learn when crafting other gear pieces while having Gear 0.", [["Primal Infusion", {Gear: 10}], ["Cogwheel", {GearsForGear: 30}], ["Safety Components", {GearsForGear: 20}], ["Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const needlesslyComplexWristguardsRecipe = await(createRecipe(null, needlesslyComplexWristguards, 1, engineering, [[sparkOfIngenuity, 1], [primalChaos, 30], [denseHide, 5], [reinforcedMachineChassis, 1], [greasedUpGears, 3], [arclightCapacitor, 3]], null, "Armor", 1, 320, null, {Gear: 0}, "Crafting Goggles/Guns/Bracers", "Tinker's Workbench", "Random chance to learn when crafting other gear pieces while having Gear 0.", [["Primal Infusion", {Gear: 10}], ["Cogwheel", {GearsForGear: 30}], ["Safety Components", {GearsForGear: 20}], ["Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const overengineeredSleeveExtendersRecipe = await(createRecipe(null, overengineeredSleeveExtenders, 1, engineering, [[sparkOfIngenuity, 1], [primalChaos, 30], [vibrantWilderclothBolt, 4], [reinforcedMachineChassis, 1], [greasedUpGears, 3], [arclightCapacitor, 3]], null, "Armor", 1, 320, null, {Gear: 0}, "Crafting Goggles/Guns/Bracers", "Tinker's Workbench", "Random chance to learn when crafting other gear pieces while having Gear 0.", [["Primal Infusion", {Gear: 10}], ["Cogwheel", {GearsForGear: 30}], ["Safety Components", {GearsForGear: 20}], ["Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const sophisticatedProblemSolverRecipe = await(createRecipe(null, sophisticatedProblemSolver, 1, engineering, [[sparkOfIngenuity, 1], [primalChaos, 160], [obsidianSearedAlloy, 4], [reinforcedMachineChassis, 1], [everburningBlastingPowder, 8], [arclightCapacitor, 2]], null, "Weapons", 1, 320, null, null, "Raid Drop", "Tinker's Workbench", "Dropped from bosses in Vault of the Incarnates.", [["Primal Infusion", {Gear: 10}], ["Missive", {Gear: 20}], ["Embellishment", {Gear: 35}], ["Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const pewTwoRecipe = await(createRecipe(null, pewTwo, 1, engineering, [[rousingFire, 1], [handfulOfSereviteBolts, 5], [everburningBlastingPowder, 5], [sereviteOre, 5]], 45, "Weapons", 3, 60, null, null, null, null, null, [["Training Matrix", {}], ["Missive", {Gear: 20}], ["Lesser Illustrious Insight", {Gear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const meticulouslyTunedGearRecipe = await(createRecipe(null, meticulouslyTunedGear, 1, engineering, [[handfulOfSereviteBolts, 4], [greasedUpGears, 1], [sunderedOnyx, 1]], null, "Cogwheels", 1, 425, null, {GearsForGear: 0}, "Crafting Greased-Up Gears", "Tinker's Workbench", "Random chance when crafting Greased-Up Gears while having Gears for Gear 0.", [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const oneSizeFitsAllGearRecipe = await(createRecipe(null, oneSizeFitsAllGear, 1, engineering, [[handfulOfSereviteBolts, 4], [greasedUpGears, 1], [mysticSapphire, 1]], null, "Cogwheels", 1, 425, null, {GearsForGear: 0}, "Crafting Greased-Up Gears", "Tinker's Workbench", "Random chance when crafting Greased-Up Gears while having Gears for Gear 0.", [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const rapidlyTickingGearRecipe = await(createRecipe(null, rapidlyTickingGear, 1, engineering, [[handfulOfSereviteBolts, 4], [greasedUpGears, 1], [vibrantEmerald, 1]], null, "Cogwheels", 1, 425, null, {GearsForGear: 0}, "Crafting Greased-Up Gears", "Tinker's Workbench", "Random chance when crafting Greased-Up Gears while having Gears for Gear 0.", [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const razorSharpGearRecipe = await(createRecipe(null, meticulouslyTunedGear, 1, engineering, [[handfulOfSereviteBolts, 4], [greasedUpGears, 1], [queensRuby, 1]], null, "Cogwheels", 1, 425, null, {GearsForGear: 0}, "Crafting Greased-Up Gears", "Tinker's Workbench", "Random chance when crafting Greased-Up Gears while having Gears for Gear 0.", [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const highIntensityThermalScannerRecipe = await(createRecipe(null, highIntensityThermalScanner, 1, engineering, [[framelessLens, 1], [greasedUpGears, 3], [arclightCapacitor, 2], [reinforcedMachineChassis, 1]], null, "Scopes & Ammo", 1, 425, null, {Utility: 20}, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {Utility: 30}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const projectilePropulsionPinionRecipe = await(createRecipe(null, projectilePropulsionPinion, 1, engineering, [[framelessLens, 1], [greasedUpGears, 3], [arclightCapacitor, 2], [reinforcedMachineChassis, 1]], null, "Scopes & Ammo", 1, 425, null, null, "World Drop", "Tinker's Workbench", "Drops from Djaradin Cache on the Waking SHores.", [["Lesser Illustrious Insight", {Utility: 30}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const completelySafeRocketsRecipe = await(createRecipe(null, completelySafeRockets, 2, engineering, [[handfulOfSereviteBolts, 2], [everburningBlastingPowder, 4]], null, "Scopes & Ammo", 1, 425, null, {Utility: 0}, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {Utility: 30}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const endlessStackOfNeedlesRecipe = await(createRecipe(null, endlessStackOfNeedles, 2, engineering, [[handfulOfSereviteBolts, 2], [shockSpringCoil, 1], [greasedUpGears, 1]], null, "Scopes & Ammo", 1, 425, null, {Utility: 10}, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {Utility: 30}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const gyroscopicKaleidoscopeRecipe = await(createRecipe(null, gyroscopicKaleidoscope, 1, engineering, [[framelessLens, 1], [handfulOfSereviteBolts, 2], [greasedUpGears, 6], [arclightCapacitor, 2]], 30, "Scopes & Ammo", 1, 425, null, null, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {Utility: 30}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const blackFireflightRecipe = await(createRecipe(null, blackFireflight, "2-3", engineering, [[wildercloth, 1], [everburningBlastingPowder, 2]], null, "Fireworks", 1, null, {ArtisansConsortium: "Valued"}, null, null, "Tinker's Workbench"));
        const blueFireflightRecipe = await(createRecipe(null, blueFireflight, "2-3", engineering, [[wildercloth, 1], [everburningBlastingPowder, 2]], null, "Fireworks", 1, null, {ArtisansConsortium: "Respected"}, null, null, "Tinker's Workbench"));
        const bundleOfFireworksRecipe = await(createRecipe(null, blackFireflight, 1, engineering, [[rousingFire, 3], [everburningBlastingPowder, 2], [stonecrustHide, 1]], null, "Fireworks", 1, null, null, null, "World Drop", "Tinker's Workbench", "Drops from Draconic Recipe in a Bottle."));
        const greenFireflightRecipe = await(createRecipe(null, greenFireflight, "2-3", engineering, [[everburningBlastingPowder, 2], [adamantScales, 1]], null, "Fireworks", 1, null, {ArtisansConsortium: "Esteemed"}, null, null, "Tinker's Workbench"));
        const redFireflightRecipe = await(createRecipe(null, redFireflight, "2-3", engineering, [[resilientLeather, 1], [everburningBlastingPowder, 2]], null, "Fireworks", 1, null, {ArtisansConsortium: "Preferred"}, null, null, "Tinker's Workbench"));
        const bronzeFireflightRecipe = await(createRecipe(null, blueFireflight, "2-3", engineering, [[everburningBlastingPowder, 2], [eternityAmber, 1]], 15, "Fireworks", 1));
        const suspiciouslySilentCrateRecipe = await(createRecipe(null, suspiciouslySilentCrate, 1, engineering, [[awakenedFire, 1], [everburningBlastingPowder, 10], [shockSpringCoil, 1], [handfulOfSereviteBolts, 3], [assortedSafetyFuses, 2]], null, "Explosives", 1, 450, null, {EZThro: 30}, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {EZThro: 15}], ["Spare Parts", {Creation: 30}]]));
        const suspiciouslyTickingCrateRecipe = await(createRecipe(null, suspiciouslyTickingCrate, 1, engineering, [[awakenedFire, 1], [everburningBlastingPowder, 10], [shockSpringCoil, 1], [handfulOfSereviteBolts, 3]], null, "Explosives", 1, 450, null, {ShortFuse: 30}, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {ShortFuse: 15}], ["Spare Parts", {Creation: 30}]]));
        const iwinButtonMkTenRecipe = await(createRecipe(null, iwinButtonMkTen, "1-2", engineering, [[handfulOfSereviteBolts, 1], [arclightCapacitor, 1], [shockSpringCoil, 1], [primalDeconstructionCharge, 1]], null, "Explosives", 1, 300, null, {Explosives: 40}, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {ShortFuse: 15}], ["Spare Parts", {Creation: 30}]]));
        const ezThroCreatureCombustionCanisterRecipe = await(createRecipe(null, ezThroCreatureCombustionCanister, "2-3", engineering, [[everburningBlastingPowder, 6], [shockSpringCoil, 1], [handfulOfSereviteBolts, 4], [assortedSafetyFuses, 1]], null, "Explosives", 1, 250, null, {EZThro: 0}, "Crafting Explosives", "Tinker's Workbench", "Can be learned when crafting Creature Combustion Canister while having EZ-Thro 0.", [["Lesser Illustrious Insight", {EZThro: 15}], ["Spare Parts", {Creation: 30}]]));
        const ezThroGravitationalDisplacerRecipe = await(createRecipe(null, ezThroGravitationalDisplacer, "2-3", engineering, [[rousingDecay, 1], [everburningBlastingPowder, 4], [shockSpringCoil, 1], [handfulOfSereviteBolts, 2], [potionOfGusts, 1], [assortedSafetyFuses, 1]], null, "Explosives", 1, 350, null, {EZThro: 0}, "Crafting Explosives", "Tinker's Workbench", "Can be learned when crafting Gravitational Displacer while having EZ-Thro 0.", [["Lesser Illustrious Insight", {EZThro: 15}], ["Spare Parts", {Creation: 30}]]));
        const ezThroGreaseGrenadeRecipe = await(createRecipe(null, ezThroGreaseGrenade, "2-3", engineering, [[rousingDecay, 1], [everburningBlastingPowder, 6], [handfulOfSereviteBolts, 4], [assortedSafetyFuses, 1]], null, "Explosives", 1, 300, null, {EZThro: 0}, "Crafting Explosives", "Tinker's Workbench", "Can be learned when crafting Grease Grenade while having EZ-Thro 0.", [["Lesser Illustrious Insight", {EZThro: 15}], ["Spare Parts", {Creation: 30}]]));
        const ezThroPrimalDeconstructionChargeRecipe = await(createRecipe(null, ezThroPrimalDeconstructionCharge, "2-3", engineering, [[rousingFire, 1], [everburningBlastingPowder, 4], [shockSpringCoil, 1], [handfulOfSereviteBolts, 4], [assortedSafetyFuses, 1]], null, "Explosives", 1, 250, null, {EZThro: 0}, "Crafting Explosives", "Tinker's Workbench", "Can be learned when crafting Primal Deconstruction Charge while having EZ-Thro 0.", [["Lesser Illustrious Insight", {EZThro: 15}], ["Spare Parts", {Creation: 30}]]));
        const gravitationalDisplacerRecipe = await(createRecipe(null, gravitationalDisplacer, "2-3", engineering, [[everburningBlastingPowder, 4], [shockSpringCoil, 1], [handfulOfSereviteBolts, 2], [potionOfGusts, 1]], null, "Explosives", 1, 350, {DragonscaleExpedition: 9}, null, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {ShortFuse: 15}], ["Spare Parts", {Creation: 30}]]));
        const greaseGrenadeRecipe = await(createRecipe(null, greaseGrenade, "2-3", engineering, [[rousingDecay, 1], [everburningBlastingPowder, 6], [handfulOfSereviteBolts, 4]], null, "Explosives", 1, 300, null, null, "World Drop", "Tinker's Workbench", "Drops from Draconic Recipe in a Bottle.", [["Lesser Illustrious Insight", {ShortFuse: 15}], ["Spare Parts", {Creation: 30}]]));
        const stickyWarpGrenadeRecipe = await(createRecipe(null, stickyWarpGrenade, "2-3", engineering, [[rousingDecay, 1], [everburningBlastingPowder, 3], [shockSpringCoil, 2], [handfulOfSereviteBolts, 6]], null, "Explosives", 1, 450, null, null, "PvP Victory", "Tinker's Workbench", "Received from Arena, BGs, or WM?", [["Lesser Illustrious Insight", {ShortFuse: 15}], ["Spare Parts", {Creation: 30}]]));
        const primalDeconstructionChargeRecipe = await(createRecipe(null, primalDeconstructionCharge, "2-3", engineering, [[awakenedFire, 1], [everburningBlastingPowder, 4], [shockSpringCoil, 1], [handfulOfSereviteBolts, 4]], null, "Explosives", 1, 250, {DragonscaleExpedition: 9}, null, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {ShortFuse: 15}], ["Spare Parts", {Creation: 30}]]));
        const creatureCombustionCanisterRecipe = await(createRecipe(null, creatureCombustionCanister, "2-3", engineering, [[everburningBlastingPowder, 6], [shockSpringCoil, 1], [handfulOfSereviteBolts, 4]], 25, "Explosives", 1, 250, null, null, null, null, null, [["Lesser Illustrious Insight", {ShortFuse: 15}], ["Spare Parts", {Creation: 30}]]));
        const zapthrottleSoulInhalerRecipe = await(createRecipe(null, zapthrottleSoulInhaler, 1, engineering, [[everburningBlastingPowder, 3], [arclightCapacitor, 1], [reinforcedMachineChassis, 1], [handfulOfSereviteBolts, 6], [shockSpringCoil, 2], [greasedUpGears, 3]], null, "Devices", 1, null, null, {Scrapper: 20}, null, "Tinker's Workbench"));
        const saviorRecipe = await(createRecipe(null, savior, 2, engineering, [[awakenedOrder, 1], [handfulOfSereviteBolts, 20], [arclightCapacitor, 1], [shockSpringCoil, 3], [greasedUpGears, 2]], null, "Devices", 1, 350, null, {MechanicalMind: 40}, null, "Tinker's Workbench", null, [["Lesser Illustrious Insight", {MechanicalMind: 30}], ["Spare Parts", {MechanicalMind: 15}]]));
        const cartomancyCannonRecipe = await(createRecipe(null, cartomancyCannon, 1, engineering, [[handfulOfSereviteBolts, 20], [shockSpringCoil, 6], [everburningBlastingPowder, 12], [reinforcedMachineChassis, 1], [arclightCapacitor, 2], [greasedUpGears, 4]], null, "Devices", 1, null, null, {Novelties: 10}, null, "Tinker's Workbench"));
        const centralizedPrecipitationEmitterRecipe = await(createRecipe(null, centralizedPrecipitationEmitter, 1, engineering, [[frostySoul, 3], [airySoul, 3], [handfulOfSereviteBolts, 20], [shockSpringCoil, 3], [reinforcedMachineChassis, 1], [arclightCapacitor, 4], [elementalHarmony, 1]], null, "Devices", 1, null, null, {Novelties: 5}, null, "Tinker's Workbench"));
        const elementInfusedRocketHelmetRecipe = await(createRecipe(null, elementInfusedRocketHelmet, 1, engineering, [[awakenedFire, 10], [awakenedAir, 5], [gravitationalDisplacer, 15], [everburningBlastingPowder, 20], [reinforcedMachineChassis, 1], [arclightCapacitor, 2], [handfulOfSereviteBolts, 5]], null, "Devices", 1, null, null, {Novelties: 15}, null, "Tinker's Workbench"));
        const environmentalEmulatorRecipe = await(createRecipe(null, environmentalEmulator, 1, engineering, [[fierySoul, 3], [earthenSoul, 3], [handfulOfSereviteBolts, 20], [shockSpringCoil, 3], [reinforcedMachineChassis, 1], [arclightCapacitor, 4], [elementalHarmony, 1]], null, "Devices", 1, null, null, {Novelties: 25}, null, "Tinker's Workbench"));
        const giggleGogglesRecipe = await(createRecipe(null, giggleGoggles, 1, engineering, [[framelessLens, 2], [shockSpringCoil, 3], [reinforcedMachineChassis, 1], [arclightCapacitor, 2], [handfulOfSereviteBolts, 6], [neltharite, 2]], null, "Devices", 1, null, null, {Novelties: 20}, null, "Tinker's Workbench"));
        const helpRecipe = await(createRecipe(null, help, 1, engineering, [[awakenedIre, 3], [markOfHonor, 15], [reinforcedMachineChassis, 1], [everburningBlastingPowder, 4], [handfulOfSereviteBolts, 6]], null, "Devices", 1, null, null, null, "PvP Victory", "Tinker's Workbench", "Received from Arena, BGs, or WM?"));
        const tinkerRemovalKitRecipe = await(createRecipe(null, tinkerRemovalKit, 1, engineering, [[handfulOfSereviteBolts, 3], [shockSpringCoil, 2], [draconiumOre, 2]], 40, "Devices", 1, null, null, null, null, "Tinker's Workbench"));
        const wyrmholeGeneratorRecipe = await(createRecipe(null, wyrmholeGenerator, 1, engineering, [[awakenedOrder, 3], [handfulOfSereviteBolts, 2], [shockSpringCoil, 1], [greasedUpGears, 2], [reinforcedMachineChassis, 1], [arclightCapacitor, 3]], null, "Devices", 1, null, null, {MechanicalMind: 0}, null, "Tinker's Workbench"));
        const portableAlchemistsLabBenchRecipe = await(createRecipe(null, portableAlchemistsLabBench, 1, engineering, [[rousingAir, 1], [rousingFrost, 1], [greasedUpGears, 1], [handfulOfSereviteBolts, 3], [omniumDraconis, 3], [draconicVial, 5]], null, "Devices", 1, null, {ArtisansConsortium: "Respected"}, null, null, "Tinker's Workbench"));
        const portableTinkersWorkbenchRecipe = await(createRecipe(null, portableTinkersWorkbench, 1, engineering, [[handfulOfSereviteBolts, 2], [framelessLens, 1], [greasedUpGears, 1], [shockSpringCoil, 1]], null, "Devices", 1, null, {ArtisansConsortium: "Respected"}, null, null, "Tinker's Workbench"));
        const neuralSilencerMkThreeRecipe = await(createRecipe(null, neuralSilencerMkThree, "2-3", engineering, [[wildercloth, 1], [handfulOfSereviteBolts, 4], [shockSpringCoil, 2], [greasedUpGears, 1]], 15, "Devices", 1));
        const khazgoriteBrainwaveAmplifierRecipe = await(createRecipe(null, khazgoriteBrainwaveAmplifier, 1, engineering, [[artisansMettle, 225], [framelessLens, 2], [khazgoriteOre, 10], [shockSpringCoil, 2], [greasedUpGears, 3], [arclightCapacitor, 4]], null, "Profession Equipment", 1, 425, {ArtisansConsortium: "Valued"}, null, null, "Tinker's Workbench", null, [["Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const khazgoriteDelversHelmetRecipe = await(createRecipe(null, khazgoriteDelversHelmet, 1, engineering, [[artisansMettle, 225], [framelessLens, 1], [obsidianSearedAlloy, 4], [arclightCapacitor, 2]], null, "Profession Equipment", 1, 425, {ValdrakkenAccord: 19}, null, null, "Tinker's Workbench", null, [["Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const khazgoriteEncasedSamophlangeRecipe = await(createRecipe(null, khazgoriteEncasedSamophlange, 1, engineering, [[artisansMettle, 300], [khazgoriteOre, 10], [shockSpringCoil, 2], [greasedUpGears, 3], [arclightCapacitor, 5]], null, "Profession Equipment", 1, 400, {ArtisansConsortium: "Valued"}, null, null, "Tinker's Workbench", null, [["Missive", {}], ["Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const khazgoriteFisherfriendRecipe = await(createRecipe(null, khazgoriteFisherfriend, 1, engineering, [[khazgoriteOre, 10], [greasedUpGears, 4], [arclightCapacitor, 2], [reinforcedMachineChassis, 1]], null, "Profession Equipment", 1, 425, null, null, "World Drop", "Tinker's Workbench", "Drops from the 'Immaculate Sac of Swog Treasures' from 'The Great Swog'???", [["Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const lapidarysKhazgoriteClampsRecipe = await(createRecipe(null, lapidarysKhazgoriteClamps, 1, engineering, [[artisansMettle, 300], [khazgoriteOre, 10], [shockSpringCoil, 2], [greasedUpGears, 5]], null, "Profession Equipment", 1, 400, {ValdrakkenAccord: 19}, null, null, "Tinker's Workbench", null, [["Missive", {}], ["Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const springLoadedKhazgoriteFabricCuttersRecipe = await(createRecipe(null, springLoadedKhazgoriteFabricCutters, 1, engineering, [[artisansMettle, 300], [obsidianSearedAlloy, 4], [arclightCapacitor, 2], [shockSpringCoil, 2]], null, "Profession Equipment", 1, 400, {DragonscaleExpedition: 15}, null, null, "Tinker's Workbench", null, [["Missive", {}], ["Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const bottomlessMireslushOreSatchelRecipe = await(createRecipe(null, bottomlessMireslushOreSatchel, 1, engineering, [[artisansMettle, 225], [mireslushHide, 6], [frostfireAlloy, 5]], null, "Profession Equipment", 1, 425, {DragonscaleExpedition: 15}, null, null, "Tinker's Workbench", null, [["Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const bottomlessStonecrustOreSatchelRecipe = await(createRecipe(null, bottomlessStonecrustOreSatchel, 1, engineering, [[stonecrustHide, 1], [handfulOfSereviteBolts, 2]], 20, "Profession Equipment", 2, 80, null, null, null, null, null, [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const draconiumBrainwaveAmplifierRecipe = await(createRecipe(null, draconiumBrainwaveAmplifier, 1, engineering, [[framelessLens, 1], [handfulOfSereviteBolts, 2], [shockSpringCoil, 2], [draconiumOre, 2]], 25, "Profession Equipment", 2, 80, null, null, null, null, null, [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const draconiumDelversHelmetRecipe = await(createRecipe(null, draconiumDelversHelmet, 1, engineering, [[smudgedLens, 1], [handfulOfSereviteBolts, 2], [draconiumOre, 2]], 20, "Profession Equipment", 2, 80, null, null, null, null, null, [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const draconiumEncasedSamophlangeRecipe = await(createRecipe(null, draconiumEncasedSamophlange, 1, engineering, [[handfulOfSereviteBolts, 2], [shockSpringCoil, 2], [greasedUpGears, 1], [draconiumOre, 2]], 20, "Profession Equipment", 2, 80, null, null, null, null, null, [["Missive", {}], ["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const draconiumFisherfriendRecipe = await(createRecipe(null, draconiumFisherfriend, 1, engineering, [[handfulOfSereviteBolts, 2], [greasedUpGears, 1], [shockSpringCoil, 2], [draconiumOre, 3]], 35, "Profession Equipment", 2, 80, null, null, null, null, null, [["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const lapidarysDraconiumClampsRecipe = await(createRecipe(null, lapidarysDraconiumClamps, 1, engineering, [[handfulOfSereviteBolts, 2], [greasedUpGears, 1], [draconiumOre, 3]], 20, "Profession Equipment", 2, 80, null, null, null, null, null, [["Missive", {}], ["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const springLoadedDraconiumFabricCuttersRecipe = await(createRecipe(null, springLoadedDraconiumFabricCutters, 1, engineering, [[handfulOfSereviteBolts, 3], [shockSpringCoil, 3], [draconiumOre, 4]], 25, "Profession Equipment", 2, 80, null, null, null, null, null, [["Missive", {}], ["Lesser Illustrious Insight", {GearsForGear: 15}], ["Spare Parts", {FunctionOverForm: 10}]]));
        const quackERecipe = await(createRecipe(null, quackE, 1, engineering, [[contouredFowlfeather, 60], [quackEQuackModulator, 1], [reinforcedMachineChassis, 1], [malygite, 2], [greasedUpGears, 2], [shockSpringCoil, 1], [handfulOfSereviteBolts, 4]], null, "Robotics", 1, null, {DragonscaleExpedition: 21}, null, null, "Tinker's Workbench"));
        const duckoyRecipe = await(createRecipe(null, duckoy, 1, engineering, [[contouredFowlfeather, 6], [resilientLeather, 1], [handfulOfSereviteBolts, 1], [everburningBlastingPowder, 2]], null, "Robotics", 1, 350, null, null, "World Drop", "Tinker's Workbench", "Drops from Draconic Message in a Bottle.", [["Lesser Illustrious Insight", {MechanicalMind: 30}], ["Spare Parts", {MechanicalMind: 15}]]));



    // console.log('Data seeded successfully.'));

    // const professions = await Profession.findAll());
    // console.log("All professions:", JSON.stringify(professions, null, 2));
}

makeTables();