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
    itemLevelMin: { type: DataTypes.INTEGER },
    itemLevelMax: { type: DataTypes.INTEGER }
    //has many Materials, FinishingReagents, has one Recipe
},{
    underscored: true
});

// TO-DO: CREATE TOOL

// TO-DO: CREATE ACCESSORY


const Profession = sequelize.define('profession', {
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING }
    // tool: { type: DataTypes.INTEGER },
    // //add references: { model: Tool, key: 'id' }
    // firstAccessory: { type: DataTypes.INTEGER },
    // //add references: { model: Accessory, key: 'id' }
    // secondAccessory: { type: DataTypes.INTEGER }
    // //add references: { model: Accessory, key: 'id' }
    //has many Recipes, Specializations, SubSpecializations, & SubSubSpecializations
},{
    underscored: true
});

const Recipe = sequelize.define('recipe', {
    // item: { type: DataTypes.INTEGER, allowNull: false, references: { model: Item, key: 'id' } },
    name: { type: DataTypes.STRING, allowNull: false },
    numberCrafted: { type: DataTypes.INTEGER, defaultValue: 1 },
    // profession: { type: DataTypes.INTEGER, allowNull: false, references: { model: Profession, key: 'id' } },
    requiredProfessionLevel: { type: DataTypes.INTEGER, defaultValue: 1 },
    category: { type: DataTypes.STRING },
    skillUpAmount: { type: DataTypes.INTEGER, defaultValue: 1 },
    difficulty: { type: DataTypes.INTEGER, defaultValue: 0 },
    requiredRenownLevel: { type: DataTypes.JSONB },
    requiredSpecializationLevel: { type: DataTypes.JSONB },
    notes: { type: DataTypes.STRING }
    //has many Materials & FinishingReagents
},{
    underscored: true
});

const Material = sequelize.define('material', {
    // recipe: { type: DataTypes.INTEGER, allowNull: false, references: { model: Recipe, key: 'id' } },
    // item: { type: DataTypes.INTEGER, allowNull: false, references: { model: Item, key: id } },
    quantity: { type: DataTypes.INTEGER, allowNull: false }
},{
    underscored: true
});

const FinishingReagent = sequelize.define('finishingReagent', {
    // recipe: { type: DataTypes.INTEGER, allowNull: false, references: { model: Recipe, key: 'id' } },
    // item: { type: DataTypes.INTEGER, allowNull: false, references: { model: Item, key: id } },
    requiredSpecializationLevel: { type: DataTypes.JSONB }
},{
    underscored: true
});

const Specialization = sequelize.define('specialization', {
    name: { type: DataTypes.STRING, allowNull: false },
    // profession: { type: DataTypes.INTEGER, allowNull: false, references: { model: Profession, key: 'id' } },
    // subSpecializationOf: { type: DataTypes.INTEGER, references: { model: Specialization, key: 'id' } },
    description: { type: DataTypes.STRING },
    totalPoints: { type: DataTypes.INTEGER, allowNull: false },
    groupCrafts: { type: DataTypes.STRING },
    eachPointGives: { type: DataTypes.STRING, defaultValue: "1 Skill" }
    //has many Bonuses & Specializations
},{
    underscored: true
});

const Bonus = sequelize.define('bonus', {
    // specialization: { type: DataTypes.INTEGER, allowNull: false, references: { model: Specialization, key: 'id' } },
    level: { type: DataTypes.INTEGER, allowNull: false },
    bonus: { type: DataTypes.STRING, allowNull: false }
},{
    underscored: true
});


// setting up some ORM
Profession.hasMany(Recipe);
Recipe.belongsTo(Profession);

Profession.hasMany(Specialization);
Specialization.belongsTo(Profession);

Item.hasOne(Recipe);
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

// Specialization.hasMany(Specialization);
// Specialization.belongsTo(Specialization);

// async function createItem(name){
//     let item = await Item.create({name: name});
//     return item;
// }

// async function createItem(name, stacksTo){
//     let item = await Item.create({name: name, stacksTo: stacksTo});
//     return item;
// }

// async function createItem(name, minIlvl, maxIlvl){
//     let item = await Item.create({name: name, itemLevelMin: minIlvl, itemLevelMax: maxIlvl});
//     return item;
// }

const isNotNullAndUndefined = value => {
    return (value != undefined && value != null)
}

async function createItem(name, stacksTo, itemLevelMin, itemLevelMax){
    let item = Item.build({name: name});
    if(isNotNullAndUndefined(stacksTo)){
        item.stacksTo = stacksTo;
    }
    if(isNotNullAndUndefined(itemLevelMin)){
        item.itemLevelMin = itemLevelMin;
    }
    if(isNotNullAndUndefined(itemLevelMax)){
        item.itemLevelMax = itemLevelMax
    }
    await item.save();
    return item;
}


// MAKING TABLES
// TIME TO SYNC
const makeTables = async () => {
    await sequelize.sync({ force: true })
    console.log('Database synced successfully.')

    const vendor = await Profession.create({name: "Vendor"});
    const gathering = await Profession.create({name: "Gathering"});
    const tailoring = await Profession.create({name: "Tailoring"});

    //
    // SEEDING: ITEMS
    //

        //vendor items
            const primalFlux = await Item.create({name: 'Primal Flux', stacksTo: 1000, price: 15});
            const smudgedLens = await Item.create({name: 'Smudged Lens', stacksTo: 1000, price: 32.5});
            const enchantingVellum = await Item.create({name: 'Enchanting Vellum', stacksTo: 1000, price: 0.1});
            const glitteringParchment = await Item.create({name: 'Glittering Parchment', stacksTo: 1000, price: 1});
            const iridescentWater = await Item.create({name: 'Iridescent Water', stacksTo: 1000, price: 1});
            const misshapedFiligree = await Item.create({name: 'Misshapen Filigree', stacksTo: 1000, price: 0.5});
            const draconicStopper = await Item.create({name: 'Draconic Stopper', stacksTo: 1000, price: 5});

        //dropped items
            const sparkOfIngenuity = await Item.create({name: 'Spark of Ingenuity', stacksTo: 1000});
            const artisansMettle = await Item.create({name: "Artisan's Mettle", stacksTo: 1000});
            const primalChaos = await Item.create({name: 'Primal Chaos', stacksTo: 1000});
            const rousingAir = await Item.create({name: 'Rousing Air', stacksTo: 1000});
            const rousingEarth = await Item.create({name: 'Rousing Earth', stacksTo: 1000});
            const rousingFire = await Item.create({name: 'Rousing Fire', stacksTo: 1000});
            const rousingFrost = await Item.create({name: 'Rousing Frost', stacksTo: 1000});
            const rousingIre = await Item.create({name: 'Rousing Ire', stacksTo: 1000});
            const rousingDecay = await Item.create({name: 'Rousing Decay', stacksTo: 1000});
            const rousingOrder = await Item.create({name: 'Rousing Order', stacksTo: 1000});
            const awakenedAir = await Item.create({name: 'Awakened Air', stacksTo: 1000});
            const awakenedEarth = await Item.create({name: 'Awakened Earth', stacksTo: 1000});
            const awakenedFire = await Item.create({name: 'Awakened Fire', stacksTo: 1000});
            const awakenedFrost = await Item.create({name: 'Awakened Frost', stacksTo: 1000});
            const awakenedIre = await Item.create({name: 'Awakened Ire', stacksTo: 1000});
            const awakenedDecay = await Item.create({name: 'Awakened Decay', stacksTo: 1000});
            const awakenedOrder = await Item.create({name: 'Awakened Order', stacksTo: 1000});
            const airySoul = await Item.create({name: 'Airy Soul', stacksTo: 1000});
            const fierySoul = await Item.create({name: 'Fiery Soul', stacksTo: 1000});
            const frostySoul = await Item.create({name: 'Frosty Soul', stacksTo: 1000});
            const earthenSoul = await Item.create({name: 'Earthen Soul', stacksTo: 1000});
            const centaursTrophyNecklace = await Item.create({name: "Centaur's Trophy Necklace", stacksTo: 1000});
            const titanTrainingMatrixOne = await Item.create({name: 'Titan Training Matrix I', stacksTo: 1000});
            const titanTrainingMatrixTwo = await Item.create({name: 'Titan Training Matrix II', stacksTo: 1000});
            const titanTrainingMatrixThree = await Item.create({name: 'Titan Training Matrix III', stacksTo: 1000});
            const titanTrainingMatrixFour = await Item.create({name: 'Titan Training Matrix IV', stacksTo: 1000});
            const illustriousInsight = await Item.create({name: "Illustrious Insight", stacksTo: 1000});

            //tailoring drops & items
            const tatteredWildercloth = await Item.create({name: 'Tattered Wildercloth', stacksTo: 1000});
            const wildercloth = await Item.create({name: 'Wildercloth', stacksTo: 1000});
            const decayedWildercloth = await Item.create({name: 'Decayed Wildercloth', stacksTo: 1000});
            const frostbittenWildercloth = await Item.create({name: 'Frostbitten Wildercloth', stacksTo: 1000});
            const singedWildercloth = await Item.create({name: 'Singed Wildercloth', stacksTo: 1000});
            const spoolOfWilderthread = await Item.create({name: 'Spool of Wilderthread', stacksTo: 1000});
            const chronoclothBolt = await Item.create({name: 'Chronocloth Bolt', stacksTo: 1000});
            const azureweaveBolt = await Item.create({name: 'Azureweave Bolt', stacksTo: 1000});

            //LW & skinning drops & items
            const contouredFowlfeather = await Item.create({name: 'Contoured Fowlfeather', stacksTo: 1000});
            const resilientLeather = await Item.create({name: 'Resilient Leather', stacksTo: 1000});
            const adamantScales = await Item.create({name: 'Adamant Scales', stacksTo: 1000});
            const denseHide = await Item.create({name: 'Dense Hide', stacksTo: 1000});
            const stonecrustHide = await Item.create({name: 'Stonecrust Hide', stacksTo: 1000});
            const lustrousScaledHide = await Item.create({name: 'Lustrous Scaled Hide', stacksTo: 1000});
            const frostbiteScales = await Item.create({name: 'Frostbite Scales', stacksTo: 1000});
            const crystalspineFur = await Item.create({name: 'Crystalspine Fur', stacksTo: 1000});
            const salamantherScales = await Item.create({name: 'Salamanther Scales', stacksTo: 1000});
            const cacophonousThunderscale = await Item.create({name: 'Cacophonous Thunderscale', stacksTo: 1000});
            const fireInfusedHide = await Item.create({name: 'Fire-Infused Hide', stacksTo: 1000});
            const rockfangLeather = await Item.create({name: 'Rockfang Leather', stacksTo: 1000});
            const pristineVorquinHorn = await Item.create({name: 'Pristine Vorquin Horn', stacksTo: 1000});
            const windsongPlumage = await Item.create({name: 'Windsong Plumage', stacksTo: 1000});
            const flawlessProtoDragonScale = await Item.create({name: 'Flawless Proto Dragon Scale', stacksTo: 1000});

            //mining, BS, & JC drops & items
            const sereviteOre = await Item.create({name: 'Serevite Ore', stacksTo: 1000});
            const draconiumOre = await Item.create({name: 'Draconium Ore', stacksTo: 1000});
            const khazgoriteOre = await Item.create({name: "Khaz'gorite Ore", stacksTo: 1000});

            //herb, alch, & inscription drops & items
            const hochenblume = await Item.create({name: 'Hochenblume', stacksTo: 1000});
            const saxifrage = await Item.create({name: 'Saxifrage', stacksTo: 1000});
            const bubblePoppy = await Item.create({name: 'Bubble Poppy', stacksTo: 1000});
            const writhebark = await Item.create({name: 'Writhebark', stacksTo: 1000});
            const primalConvergent = await Item.create({name: 'Primal Convergent', stacksTo: 1000});
            const omniumDraconis = await Item.create({name: 'Omnium Draconis', stacksTo: 1000});

            //cooking & fishing drops & items
            const maybeMeat = await Item.create({name: 'Maybe Meat', stacksTo: 1000});
            const ribbedMolluskMeat = await Item.create({name: 'Ribbed Mollusk Meat', stacksTo: 1000});
            const waterfowlFilet = await Item.create({name: 'Waterfowl Filet', stacksTo: 1000});
            const hornswogHunk = await Item.create({name: 'Hornswog Hunk', stacksTo: 1000});
            const basiliskEggs = await Item.create({name: 'Basilisk Eggs', stacksTo: 1000});
            const bruffalonFlank = await Item.create({name: 'Bruffalon Flank', stacksTo: 1000});
            const mightyMammothRibs = await Item.create({name: 'Mighty Mammoth Ribs', stacksTo: 1000});
            const burlyBearHaunch = await Item.create({name: 'Burly Bear Haunch', stacksTo: 1000});
            const saltDeposit = await Item.create({name: 'Salt Deposit', stacksTo: 1000});
            const lavaBeetle = await Item.create({name: 'Lava Beetle', stacksTo: 1000});
            const scalebellyMackerel = await Item.create({name: 'Scalebelly Mackerel', stacksTo: 1000});
            const thousandbitePiranha = await Item.create({name: 'Thousandbite Piranha', stacksTo: 1000});
            const aileronSeamoth = await Item.create({name: 'Aileron Seamoth', stacksTo: 1000});
            const ceruleanSpinefish = await Item.create({name: 'Cerulean Spinefish', stacksTo: 1000});
            const temporalDragonhead = await Item.create({name: 'Temporal Dragonhead', stacksTo: 1000});
            const islefinDorado = await Item.create({name: 'Islefin Dorado', stacksTo: 1000});
            const magmaThresher = await Item.create({name: 'Magma Thresher', stacksTo: 1000});
            const prismaticLeaper = await Item.create({name: 'Prismatic Leaper', stacksTo: 1000});
            const frostedRimefinTuna = await Item.create({name: 'Frosted Rimefin Tuna', stacksTo: 1000});
            const snowball = await Item.create({name: 'Snowball', stacksTo: 1000});
            const hornOMead = await Item.create({name: "Horn o' Mead", stacksTo: 1000});
            const buttermilk = await Item.create({name: 'Buttermilk', stacksTo: 1000});
            const ohnahranPotato = await Item.create({name: "Ohn'ahran Potato", stacksTo: 1000});
            const threeCheeseBlend = await Item.create({name: 'Three-Cheese Blend', stacksTo: 1000, price: 0.3});
            const pastryPackets = await Item.create({name: 'Pastry Packets', stacksTo: 1000, price: 0.5});
            const convenientlyPackagedIngredients = await Item.create({name: 'Conveniently Packaged Ingredients', stacksTo: 1000, price: 1.25});
            const thaldraszianCocoaPowder = await Item.create({name: 'Thaldraszian Cocoa Powder', stacksTo: 1000, price: 3});

        // MADE WITH PROFESSIONS
            
            //tailoring items
            const wilderclothBandage = await Item.create({name: 'Wildercloth Bandage', stacksTo: 200});
            const surveyorsClothBands = await Item.create({name: "Surveyor's Cloth Bands", itemLevelMin: 306, itemLevelMax: 316});
            const surveyorsClothTreads = await Item.create({name: "Surveyor's Cloth Treads", itemLevelMin: 306, itemLevelMax: 316});
            const surveyorsClothRobe = await Item.create({name: "Surveyor's Cloth Robe", itemLevelMin: 306, itemLevelMax: 316});
            const wilderclothBolt = await Item.create({name: 'Wildercloth Bolt', stacksTo: 1000});
            const surveyorsSeasonedCord = await Item.create({name: "Surveyor's Seasoned Cord", itemLevelMin: 333, itemLevelMax: 343});
            const surveyorsSeasonedGloves = await Item.create({name: "Surveyor's Seasoned Gloves", itemLevelMin: 333, itemLevelMax: 343});
            const surveyorsSeasonedHood = await Item.create({name: "Surveyor's Seasoned Hood", itemLevelMin: 333, itemLevelMax: 343});
            const surveyorsSeasonedPants = await Item.create({name: "Surveyor's Seasoned Pants", itemLevelMin: 333, itemLevelMax: 343});
            const surveyorsSeasonedShoulders = await Item.create({name: "Surveyor's Seasoned Shoulders", itemLevelMin: 333, itemLevelMax: 343});
            const surveyorsTailoredCloak = await Item.create({name: "Surveyor's Tailored Cloak", itemLevelMin: 306, itemLevelMax: 316});
            const vibrantWilderclothBolt = await Item.create({name: "Vibrant Wildercloth Bolt", stacksTo: 1000});
            const infuriousWilderclothBolt = await Item.create({name: "Infurious Wildercloth Bolt", stacksTo: 1000});
            const blueSilkenLining = await Item.create({name: "Blue Silken Lining", stacksTo: 1000});
            const bronzedGripWrappings = await Item.create({name: "Bronzed Grip Wrappings", stacksTo: 1000});
            const abrasivePolishingCloth = await Item.create({name: "Abrasive Polishing Cloth", stacksTo: 1000});
            const vibrantPolishingCloth = await Item.create({name: "Vibrant Polishing Cloth", stacksTo: 1000});
            const chromaticEmbroideryThread = await Item.create({name: "Chromatic Embroidery Thread", stacksTo: 1000});
            const shimmeringEmbroideryThread = await Item.create({name: "Shimmering Embroidery Thread", stacksTo: 1000});
            const blazingEmbroideryThread = await Item.create({name: "Blazing Embroidery Thread", stacksTo: 1000});
            const vibrantWilderclothGirdle = await Item.create({name: "Vibrant Wildercloth Girdle", itemLevelMin: 382, itemLevelMax: 392});
            const vibrantWilderclothHandwraps = await Item.create({name: "Vibrant Wildercloth Handwraps", itemLevelMin: 382, itemLevelMax: 392});
            const vibrantWilderclothHeadcover = await Item.create({name: "Vibrant Wildercloth Headcover", itemLevelMin: 382, itemLevelMax: 392});
            const vibrantWilderclothShawl = await Item.create({name: "Vibrant Wildercloth Shawl", itemLevelMin: 382, itemLevelMax: 392});
            const vibrantWilderclothShoulderspikes = await Item.create({name: "Vibrant Wildercloth Shoulderspikes", itemLevelMin: 382, itemLevelMax: 392});
            const vibrantWilderclothSlacks = await Item.create({name: "Vibrant Wildercloth Slacks", itemLevelMin: 382, itemLevelMax: 392});
            const vibrantWilderclothSlippers = await Item.create({name: "Vibrant Wildercloth Slippers", itemLevelMin: 382, itemLevelMax: 392});
            const vibrantWilderclothVestments = await Item.create({name: "Vibrant Wildercloth Vestments", itemLevelMin: 382, itemLevelMax: 392});
            const vibrantWilderclothWristwraps = await Item.create({name: "Vibrant Wildercloth Wristwraps", itemLevelMin: 382, itemLevelMax: 392});
            //need to put pvp ilvls for the next set
            const crimsonCombatantsWilderclothBands = await Item.create({name: "Crimson Combatant's Wildercloth Bands", itemLevelMin: 333, itemLevelMax: 343});
            const crimsonCombatantsWilderclothCloak = await Item.create({name: "Crimson Combatant's Wildercloth Cloak", itemLevelMin: 333, itemLevelMax: 343});
            const crimsonCombatantsWilderclothGloves = await Item.create({name: "Crimson Combatant's Wildercloth Gloves", itemLevelMin: 333, itemLevelMax: 343});
            const crimsonCombatantsWilderclothHood = await Item.create({name: "Crimson Combatant's Wildercloth Hood", itemLevelMin: 333, itemLevelMax: 343});
            const crimsonCombatantsWilderclothLeggings = await Item.create({name: "Crimson Combatant's Wildercloth Leggings", itemLevelMin: 333, itemLevelMax: 343});
            const crimsonCombatantsWilderclothSash = await Item.create({name: "Crimson Combatant's Wildercloth Sash", itemLevelMin: 333, itemLevelMax: 343});
            const crimsonCombatantsWilderclothShoulderpads = await Item.create({name: "Crimson Combatant's Wildercloth Shoulderpads", itemLevelMin: 333, itemLevelMax: 343});
            const crimsonCombatantsWilderclothTreads = await Item.create({name: "Crimson Combatant's Wildercloth Treads", itemLevelMin: 333, itemLevelMax: 343});
            const crimsonCombatantsWilderclothTunic = await Item.create({name: "Crimson Combatant's Wildercloth Tunic", itemLevelMin: 333, itemLevelMax: 343});
            //pvp done
            const amiceOfTheBlue = await Item.create({name: "Amice of the Blue", itemLevelMin: 382, itemLevelMax: 392});
            const azureweaveMantle = await Item.create({name: "Azureweave Mantle", itemLevelMin: 382, itemLevelMax: 392});
            const azureweaveRobe = await Item.create({name: "Azureweave Robe", itemLevelMin: 382, itemLevelMax: 392});
            const azureweaveSlippers = await Item.create({name: "Azureweave Slippers", itemLevelMin: 382, itemLevelMax: 392});
            const blueDragonSoles = await Item.create({name: "Blue Dragon Soles", itemLevelMin: 382, itemLevelMax: 392});
            //below item needs pvp ilvl
            const infuriousBindingOfGesticulation = await Item.create({name: "Infurious Binding of Gesticulation", itemLevelMin: 382, itemLevelMax: 392});
            const alliedWristguardsOfTimeDilation = await Item.create({name: "Allied Wristguards of Time Dilation", itemLevelMin: 382, itemLevelMax: 392});
            const chronoclothGloves = await Item.create({name: "Chronocloth Gloves", itemLevelMin: 382, itemLevelMax: 392});
            const chronoclothLeggings = await Item.create({name: "Chronocloth Leggings", itemLevelMin: 382, itemLevelMax: 392});
            const chronoclothSash = await Item.create({name: "Chronocloth Sash", itemLevelMin: 382, itemLevelMax: 392});
            const hoodOfSurgingTime = await Item.create({name: "Hood of Surging Time", itemLevelMin: 382, itemLevelMax: 392});
            //below item needs pvp ilvl
            const infuriousLegwrapsOfPossibility = await Item.create({name: "Infurious Legwraps of Possibility", itemLevelMin: 382, itemLevelMax: 392});
            const dragonclothTailoringVestments = await Item.create({name: "Dragoncloth Tailoring Vestments", itemLevelMin: 382, itemLevelMax: 397});
            const mastersWilderclothAlchemistsRobe = await Item.create({name: "Master's Wildercloth Alchemist's Robe", itemLevelMin: 356, itemLevelMax: 371});
            const mastersWilderclothChefsHat = await Item.create({name: "Master's Wildercloth Chef's Hat", itemLevelMin: 356, itemLevelMax: 371});
            const mastersWilderclothEnchantersHat = await Item.create({name: "Master's Wildercloth Enchanter's Hat", itemLevelMin: 356, itemLevelMax: 371});
            const mastersWilderclothFishingCap = await Item.create({name: "Master's Wildercloth Fishing Cap", itemLevelMin: 356, itemLevelMax: 371});
            const mastersWilderclothGardeningHat = await Item.create({name: "Master's Wildercloth Gardening Hat", itemLevelMin: 356, itemLevelMax: 371});
            const wilderclothEnchantersHat = await Item.create({name: "Wildercloth Enchanter's Hat", itemLevelMin: 317, itemLevelMax: 332});
            const wilderclothAlchemistsRobe = await Item.create({name: "Wildercloth Alchemist's Robe", itemLevelMin: 317, itemLevelMax: 332});
            const wilderclothFishingCap = await Item.create({name: "Wildercloth Fishing Cap", itemLevelMin: 317, itemLevelMax: 332});
            const wilderclothChefsHat = await Item.create({name: "Wildercloth Chef's Hat", itemLevelMin: 317, itemLevelMax: 332});
            const wilderclothGardeningHat = await Item.create({name: "Wildercloth Gardening Hat", itemLevelMin: 317, itemLevelMax: 332});
            const wilderclothTailorsCoat = await Item.create({name: "Wildercloth Tailor's Coat", itemLevelMin: 317, itemLevelMax: 332});
            const frozenSpellthread = await Item.create({name: "Frozen Spellthread", stacksTo: 1000});
            const temporalSpellthread = await Item.create({name: "Temporal Spellthread", stacksTo: 1000});
            const vibrantSpellthread = await Item.create({name: "Vibrant Spellthread", stacksTo: 1000});
            const azureweaveExpeditionPack = await Item.create({name: "Azureweave Expedition Pack"});
            const chronoclothReagentBag = await Item.create({name: "Chronocloth Reagent Bag"});
            const wilderclothBag = await Item.create({name: "Wildercloth Bag"});
            const simplyStitchedReagentBag = await Item.create({name: "Simply Stitched Reagent Bag"});
            const explorersBannerOfGeology = await Item.create({name: "Explorer's Banner of Geology"});
            const explorersBannerOfHerbology = await Item.create({name: "Explorer's Banner of Herbology"});
            const duckStuffedDuckLovie = await Item.create({name: "Duck-Stuffed Duck Lovie"});
            const forlornFuneralPall = await Item.create({name: "Forlorn Funeral Pall"});
            const dragonscaleExpeditionsExpeditionTent = await Item.create({name: "Dragonscale Expedition's Expedition Tent"});
            const coldCushion = await Item.create({name: "Cold Cushion"});
            const cushionOfTimeTravel = await Item.create({name: "Cushion of Time Travel"});
            const marketTent = await Item.create({name: "Market Tent"});

            //engineering items
            const arclightCapacitor = await Item.create({name: "Arclight Capacitor", stacksTo: 1000});
            const reinforcedMachineChassis = await Item.create({name: "Reinforced Machine Chassis", stacksTo: 1000});
            const assortedSafetyFuses = await Item.create({name: "Assorted Safety Fuses", stacksTo: 1000});
            const everburningBlastingPowder = await Item.create({name: "Everburning Blasting Powder", stacksTo: 1000});
            const greasedUpGears = await Item.create({name: "Greased-Up Gears", stacksTo: 1000});
            const shockSpringCoil = await Item.create({name: "Shock-Spring Coil", stacksTo: 1000});
            const handfulOfSereviteBolts = await Item.create({name: "Handful of Serevite Bolts", stacksTo: 1000});
            const overchargedOverclocker = await Item.create({name: "Overcharged Overclocker", stacksTo: 1000});
            const haphazardlyTetheredWires = await Item.create({name: "Haphazardly Tethered Wires", stacksTo: 1000});
            const calibratedSafetySwitch = await Item.create({name: "Calibrated Safety Switch", stacksTo: 1000});
            const criticalFailurePreventionUnit = await Item.create({name: "Critical Failure Prevention Unit", stacksTo: 1000});
            const magazineOfHealingDarts = await Item.create({name: "Magazine of Healing Darts", stacksTo: 1000});
            const springLoadedCapacitorCasing = await Item.create({name: "Spring-Loaded Capacitor Casing", stacksTo: 1000});
            const tinkerAlarmOTurret = await Item.create({name: "Tinker: Alarm-O-Turret", stacksTo: 1000});
            const tinkerArclightVitalCorrectors = await Item.create({name: "Tinker: Arclight Vital Correctors", stacksTo: 1000});
            const tinkerPolarityAmplifier = await Item.create({name: "Tinker: Polarity Amplifier", stacksTo: 1000});
            const tinkerSupercollideOTron = await Item.create({name: "Tinker: Supercollide-O-Tron", stacksTo: 1000});
            const tinkerGroundedCircuitry = await Item.create({name: "Tinker: Grounded Circuitry", stacksTo: 1000});
            const tinkerBreathOfNeltharion = await Item.create({name: "Tinker: Breath of Neltharion", stacksTo: 1000});
            const tinkerPlaneDisplacer = await Item.create({name: "Tinker: Plane Displacer", stacksTo: 1000});
            const battleReadyBinoculars = await Item.create({name: "Battle-Ready Binoculars", itemLevelMin: 382, itemLevelMax: 392});
            const lightweightOcularLenses = await Item.create({name: "Lightweight Ocular Lenses", itemLevelMin: 382, itemLevelMax: 392});
            const oscillatingWildernessOpticals = await Item.create({name: "Oscillating Wilderness Opticals", itemLevelMin: 382, itemLevelMax: 392});
            const peripheralVisionProjectors = await Item.create({name: "Peripheral Vision Projectors", itemLevelMin: 382, itemLevelMax: 392});
            const deadlineDeadeyes = await Item.create({name: "Deadline Deadeyes", itemLevelMin: 306, itemLevelMax: 316});
            const milestoneMagnifiers = await Item.create({name: "Milestone Magnifiers", itemLevelMin: 306, itemLevelMax: 316});
            const qualityAssuredOptics = await Item.create({name: "Quality-Assured Optics", itemLevelMin: 306, itemLevelMax: 316});
            const sentrysStabilizedSpecs = await Item.create({name: "Sentry's Stabilized Specs", itemLevelMin: 306, itemLevelMax: 316});
            const complicatedCuffs = await Item.create({name: "Complicated Cuffs", itemLevelMin: 382, itemLevelMax: 392});
            const difficultWristProtectors = await Item.create({name: "Difficult Wrist Protectors", itemLevelMin: 382, itemLevelMax: 392});
            const needlesslyComplexWristguards = await Item.create({name: "Needlessly Complex Wristguards", itemLevelMin: 382, itemLevelMax: 392});
            const overengineeredSleeveExtenders = await Item.create({name: "Overengineered Sleeve Extenders", itemLevelMin: 382, itemLevelMax: 392});
            const sophisticatedProblemSolver = await Item.create({name: "Sophisticated Problem Solver", itemLevelMin: 382, itemLevelMax: 392});
            const pewTwo = await Item.create({name: "P.E.W. x2", itemLevelMin: 333, itemLevelMax: 343});
            const meticulouslyTunedGear = await Item.create({name: "Meticulously-Tuned Gear", stacksTo: 1000});
            const oneSizeFitsAllGear = await Item.create({name: "One-Size-Fits-All Gear", stacksTo: 1000});
            const rapidlyTickingGear = await Item.create({name: "Rapidly Ticking Gear", stacksTo: 1000});
            const razorSharpGear = await Item.create({name: "Razor-Sharp Gear", stacksTo: 1000});
            const highIntensityThermalScanner = await Item.create({name: "High Intensity Thermal Scanner", stacksTo: 1000});
            const projectilePropulsionPinion = await Item.create({name: "Projectile Propulsion Pinion", stacksTo: 1000});
            const completelySafeRockets = await Item.create({name: "Completely Safe Rockets", stacksTo: 1000});
            const endlessStackOfNeedles = await Item.create({name: "Endless Stack of Needles", stacksTo: 1000});
            const gyroscopicKaleidoscope = await Item.create({name: "Gyroscopic Kaleidoscope", stacksTo: 1000});
            const blackFireflight = await Item.create({name: "Black Fireflight", stacksTo: 1000});
            const blueFireflight = await Item.create({name: "Blue Fireflight", stacksTo: 1000});
            const bundleOfFireworks = await Item.create({name: "Bundle of Fireworks", stacksTo: 1000});
            const greenFireflight = await Item.create({name: "Green Fireflight", stacksTo: 1000});
            const redFireflight = await Item.create({name: "Red Fireflight", stacksTo: 1000});
            const bronzeFireflight = await Item.create({name: "Bronze Fireflight", stacksTo: 1000});
            const suspiciouslySilentCrate = await Item.create({name: "Suspiciously Silent Crate"});
            const suspiciouslyTickingCrate = await Item.create({name: "Suspiciously Ticking Crate"});
            const iwinButtonMkTen = await Item.create({name: "I.W.I.N. Button Mk10", stacksTo: 1000});
            const ezThroGreaseGrenade = await Item.create({name: "EZ-Thro Grease Grenade", stacksTo: 1000});
            const ezThroCreatureCombustionCanister = await Item.create({name: "EZ-Thro Creature Combustion Canister", stacksTo: 1000});
            const ezThroGravitationalDisplacer = await Item.create({name: "EZ-Thro Gravitational Displacer", stacksTo: 1000});
            const ezThroPrimalDeconstructionCharge = await Item.create({name: "EZ-Thro Primal Deconstruction Charge", stacksTo: 1000});
            const stickyWarpGrenade = await Item.create({name: "Sticky Warp Grenade", stacksTo: 1000});
            const greaseGrenade = await Item.create({name: "Grease Grenade", stacksTo: 1000});
            const gravitationalDisplacer = await Item.create({name: "Gravitational Displacer", stacksTo: 1000});
            const primalDeconstructionCharge = await Item.create({name: "Primal Deconstruction Charge", stacksTo: 1000});
            const creatureCombustionCanister = await Item.create({name: "Creature Combustion Canister", stacksTo: 1000});
            const savior = await Item.create({name: "S.A.V.I.O.R.", stacksTo: 1000});
            const zapthrottleSoulInhaler = await Item.create({name: "Zapthrottle Soul Inhaler"});
            const cartomancyCannon = await Item.create({name: "Cartomancy Cannon"});
            const centralizedPrecipitationEmitter = await Item.create({name: "Centralized Precipitation Emitter"});
            const elementInfusedRocketHelmet = await Item.create({name: "Element-Infused Rocket Helmet"});
            const environmentalEmulator = await Item.create({name: "Environmental Emulator"});
            const help = await Item.create({name: "H.E.L.P."});
            const expeditionMultiToolbox = await Item.create({name: "Expedition Multi-Toolbox"});
            const tinkerRemovalKit = await Item.create({name: "Tinker Removal Kit"});
            const wyrmholeGenerator = await Item.create({name: "Wyrmhole Generator"});
            const portableAlchemistsLabBench = await Item.create({name: "Portable Alchemist's Lab Bench"});
            const portableTinkersWorkbench = await Item.create({name: "Portable Tinker's Workbench"});
            const neuralSilencerMkThree = await Item.create({name: "Neural Silencer Mk3", stacksTo: 1000});
            const khazgoriteBrainwaveAmplifier = await Item.create({name: "Khaz'gorite Brainwave Amplifier", itemLevelMin: 356, itemLevelMax: 371});
            const khazgoriteDelversHelmet = await Item.create({name: "Khaz'gorite Delver's Helmet", itemLevelMin: 356, itemLevelMax: 371});
            const khazgoriteEncasedSamophlange = await Item.create({name: "Khaz'gorite Encased Samophlange", itemLevelMin: 356, itemLevelMax: 371});
            const khazgoriteFisherfriend = await Item.create({name: "Khaz'gorite Fisherfriend", itemLevelMin: 356, itemLevelMax: 371});
            const lapidarysKhazgoriteClamps = await Item.create({name: "Lapidary's Khaz'gorite Clamps", itemLevelMin: 356, itemLevelMax: 371});
            const springLoadedKhazgoriteFabricCutters = await Item.create({name: "Spring-Loaded Khaz'gorite Fabric Cutters", itemLevelMin: 356, itemLevelMax: 371});
            const bottomlessMireslushOreSatchel = await Item.create({name: "Bottomless Mireslush Ore Satchel", itemLevelMin: 356, itemLevelMax: 371});
            const bottomlessStonecrustOreSatchel = await Item.create({name: "", itemLevelMin: 317, itemLevelMax: 332});
            const draconiumBrainwaveAmplifier = await Item.create({name: "Draconium Brainwave Amplifier", itemLevelMin: 317, itemLevelMax: 332});
            const draconiumDelversHelmet = await Item.create({name: "Draconium Delver's Helmet", itemLevelMin: 317, itemLevelMax: 332});
            const draconiumEncasedSamophlange = await Item.create({name: "Draconium Encased Samophlange", itemLevelMin: 317, itemLevelMax: 332});
            const draconiumFisherfriend = await Item.create({name: "Draconium Fisherfriend", itemLevelMin: 317, itemLevelMax: 332});
            const lapidarysDraconiumClamps = await Item.create({name: "Lapidary's Draconium Clamps", itemLevelMin: 317, itemLevelMax: 332});
            const springLoadedDraconiumFabricCutters = await Item.create({name: "Spring-Loaded Draconium Fabric Cutters", itemLevelMin: 317, itemLevelMax: 332});
            const quackE = await Item.create({name: "Quack-E"});
            const duckoy = await Item.create({name: "D.U.C.K.O.Y.", stacksTo: 1000});

            //enchanting items
            const chromaticDust = await Item.create({name: "Chromatic Dust", stacksTo: 1000});
            const vibrantShard = await Item.create({name: "Vibrant Shard", stacksTo: 1000});
            const resonantCrystal = await Item.create({name: "Resonant Crystal", stacksTo: 1000});
            const gracefulAvoidance = await Item.create({name: "Graceful Avoidance"});
            const homeboundSpeed = await Item.create({name: "Homebound Speed"});
            const regenerativeLeech = await Item.create({name: "Regenerative Leech"});
            const writOfAvoidanceCloak = await Item.create({name: "Writ of Avoidance (Cloak)"});
            const writOfLeechCloak = await Item.create({name: "Writ of Leech (Cloak)"});
            const writOfSpeedCloack = await Item.create({name: "Writ of Speed (Cloak)"});
            const acceleratedAgility = await Item.create({name: "Accelerated Agility"});
            const reserveOfIntellect = await Item.create({name: "Reserve of Intellect"});
            const sustainedStrength = await Item.create({name: "Sustained Strength"});
            const wakingStats = await Item.create({name: "Waking Stats"});
            const devotionOfAvoidance = await Item.create({name: "Devotion of Avoidance"});
            const devotionOfLeech = await Item.create({name: "Devotion of Leech"});
            const devotionOfSpeed = await Item.create({name: "Devotion of Speed"});
            const writOfAvoidanceBracer = await Item.create({name: "Writ of Avoidance (Bracer)"});
            const writOfLeechBracer = await Item.create({name: "Writ of Leech (Bracer)"});
            const writOfSpeedBracer = await Item.create({name: "Writ of Speed (Bracer)"});
            const plainsrunnersBreeze = await Item.create({name: "Plainsrunner's Breeze"});
            const ridersReassurance = await Item.create({name: "Rider's Reassurance"});
            const watchersLoam = await Item.create({name: "Watcher's Loam"});
            const devotionOfCriticalStrike = await Item.create({name: "Devotion of Critical Strike"});
            const devotionOfHaste = await Item.create({name: "Devotion of Haste"});
            const devotionOfMastery = await Item.create({name: "Devotion of Mastery"});
            const devotionOfVersatility = await Item.create({name: "Devotion of Versatility"});
            const writOfCriticalStrike = await Item.create({name: "Writ of Critical Strike"});
            const writOfHaste = await Item.create({name: "Writ of Haste"});
            const writOfMastery = await Item.create({name: "Writ of Mastery"});
            const writOfVersatility = await Item.create({name: "Writ of Versatility"});
            const burningDevotion = await Item.create({name: "Burning Devotion"});
            const earthenDevotion = await Item.create({name: "Earthen Devotion"});
            const frozenDevotion = await Item.create({name: "Frozen Devotion"});
            const sophicDevotion = await Item.create({name: "Sophic Devotion"});
            const waftingDevotion = await Item.create({name: "Wafting Devotion"});
            const burningWrit = await Item.create({name: "Burning Writ"});
            const earthenWrit = await Item.create({name: "Earthen Writ"});
            const frozenWrit = await Item.create({name: "Frozen Writ"});
            const sophicWrit = await Item.create({name: "Sophic Writ"});
            const waftingWrit = await Item.create({name: "Wafting Writ"});
            const draconicDeftness = await Item.create({name: "Draconic Deftness"});
            const draconicFinesse = await Item.create({name: "Draconic Finesse"});
            const draconicInspiration = await Item.create({name: "Draconic Inspiration"});
            const draconicPerception = await Item.create({name: "Draconic Perception"});
            const draconicResourcefulness = await Item.create({name: "Draconic Resourcefulness"});
            const torchOfPrimalAwakening = await Item.create({name: "Torch of Primal Awakening", minIlvl: 382, maxIlvl: 392});
            const runedKhazgoriteRod = await Item.create({name: "Runed Khaz'gorite Rod", minIlvl: 356, maxIlvl: 371});
            const runedDraconiumRod = await Item.create({name: "Runed Draconium Rod", minIlvl: 317, maxIlvl: 332});
            const enchantedWrithebarkWand = await Item.create({name: "Enchanted Writhebark Wand", minIlvl: 333, maxIlvl: 343});
            const runedSereviteRod = await Item.create({name: "Runed Serevite Rod", minIlvl: 270, maxIlvl: 285});
            const illusionPrimalAir = await Item.create({name: "Illusion: Primal Air"});
            const illusionPrimalEarth = await Item.create({name: "Illusion: Primal Earth"});
            const illusionPrimalFire = await Item.create({name: "Illusion: Primal Fire"});
            const illusionPrimalFrost = await Item.create({name: "Illusion: Primal Frost"});
            const illusionPrimalMastery = await Item.create({name: "Illusion: Primal Mastery"});
            const primalInvocationExtract = await Item.create({name: "Primal Invocation Extract"});
            const khadgarsDisenchantingRod = await Item.create({name: "Khadgar's Disenchanting Rod"});
            const illusoryAdornmentOrder = await Item.create({name: "Illusory Adornment: Order"});
            const illusoryAdornmentAir = await Item.create({name: "Illusory Adornment: Air"});
            const illusoryAdornmentEarth = await Item.create({name: "Illusory Adornment: Earth"});
            const illusoryAdornmentFire = await Item.create({name: "Illusory Adornment: Fire"});
            const illusoryAdornmentFrost = await Item.create({name: "Illusory Adornment: Frost"});
            const scepterOfSpectacleOrder = await Item.create({name: "Scepter of Spectacle: Order"});
            const scepterOfSpectacleAir = await Item.create({name: "Scepter of Spectacle: Air"});
            const scepterOfSpectacleFrost = await Item.create({name: "Scepter of Spectacle: Frost"});
            const scepterOfSpectacleEarth = await Item.create({name: "Scepter of Spectacle: Earth"});
            const scepterOfSpectacleFire = await Item.create({name: "Scepter of Spectacle: Fire"});
            //are these next two really items?
            // const crystallineShatter = await Item.create({name: "Crystalline Shatter"});
            // const elementalShatter = await Item.create({name: "Elemental Shatter"});
            //idk. maybe comment the two above.
            const sophicAmalgamation = await Item.create({name: "Sophic Amalgamation"});
            const crystalMagicalLockpick = await Item.create({name: "Crystal Magical Lockpick", stacksTo: 1000});

            //alchemy items
            //the next five are not really items...
            const advancedPhialExperimentation = await Item.create({name: "Advanced Phial Alchemical Experimentation"});
            const advancedPotionExperimentation = await Item.create({name: "Advanced Potion Alchemical Experimentation"});
            const basicPhialExperimentation = await Item.create({name: "Basic Phial Alchemical Experimentation"});
            const basicPotionExperimentation = await Item.create({name: "Basic Potion Alchemical Experimentation"});
            // const reclaimConcoctions = await Item.create({name: "Reclaim Concoctions"});
            //back to actual items
            const dragonsAlchemicalSolution = await Item.create({name: "Dragon's Alchemical Solution", stacksTo: 1000});
            const residualNeuralChannelingAgent = await Item.create({name: "Residual Neural Channeling Agent", stacksTo: 1000});
            const bottledPutrescence = await Item.create({name: "Bottled Putrescence", stacksTo: 1000});
            const potionOfGusts = await Item.create({name: "Potion of Gusts", stacksTo: 1000});
            const potionOfShockingDisclosure = await Item.create({name: "Potion of Shocking Disclosure", stacksTo: 1000});
            const potionOfTheHushedZephyr = await Item.create({name: "Potion of the Hushed Zephyr", stacksTo: 1000});
            const aeratedManaPotion = await Item.create({name: "Aerated Mana Potion", stacksTo: 1000});
            const potionOfChilledClarity = await Item.create({name: "Potion of Chilled Clarity", stacksTo: 1000});
            const delicateSuspensionOfSpores = await Item.create({name: "Delicate Suspension of Spores", stacksTo: 1000});
            const potionOfFrozenFocus = await Item.create({name: "Potion of Frozen Focus", stacksTo: 1000});
            const potionOfWitheringVitality = await Item.create({name: "Potion of Withering Vitality", stacksTo: 1000});
            const potionOfFrozenFatality = await Item.create({name: "Potion of Frozen Fatality", stacksTo: 1000});
            const refreshingHealingPotion = await Item.create({name: "Refreshing Healing Potion", stacksTo: 1000});
            const potionCauldronOfUltimatePower = await Item.create({name: "Potion Cauldron of Ultimate Power", stacksTo: 1000});
            const potionCauldronOfPower = await Item.create({name: "Potion Cauldron of Power", stacksTo: 1000});
            const cauldronOfThePooka = await Item.create({name: "Cauldron of the Pooka", stacksTo: 1000});
            const elementalPotionOfUltimatePower = await Item.create({name: "Elemental Potion of Ultimate Power", stacksTo: 1000});
            const elementalPotionOfPower = await Item.create({name: "Elemental Potion of Power", stacksTo: 1000});
            const phialOfElementalChaos = await Item.create({name: "Phial of Elemental Chaos", stacksTo: 1000});
            const phialOfChargedIsolation = await Item.create({name: "Phial of Charged Isolation", stacksTo: 1000});
            const phialOfStaticEmpowerment = await Item.create({name: "Phial of Static Empowerment", stacksTo: 1000});
            const phialOfStillAir = await Item.create({name: "Phial of Still Air", stacksTo: 1000});
            const phialOfTheEyeInTheStorm = await Item.create({name: "Phial of the Eye in the Storm", stacksTo: 1000});
            const aeratedPhialOfDeftness = await Item.create({name: "Aerated Phial of Deftness", stacksTo: 1000});
            const chargedPhialOfAlacrity = await Item.create({name: "Charged Phial of Alacrity", stacksTo: 1000});
            const aeratedPhialOfQuickHands = await Item.create({name: "Aerated Phial of Quick Hands", stacksTo: 1000});
            const phialOfIcyPreservation = await Item.create({name: "Phial of Icy Preservation", stacksTo: 1000});
            const icedPhialOfCorruptingRage = await Item.create({name: "Iced Phial of Corrupting Rage", stacksTo: 1000});
            const phialOfGlacialFury = await Item.create({name: "Phial of Glacial Fury", stacksTo: 1000});
            const steamingPhialOfFinesse = await Item.create({name: "Steaming Phial of Finesse", stacksTo: 1000});
            const crystallinePhialOfPerception = await Item.create({name: "Crystalline Phial of Perception", stacksTo: 1000});
            const phialOfTepidVersatility = await Item.create({name: "Phial of Tepid Versatility", stacksTo: 1000});
            //next 6 aren't really items either...
            const transmuteDecayToElements = await Item.create({name: "Transmute: Decay to Elements"});
            const transmuteOrderToElements = await Item.create({name: "Transmute: Order to Elements"});
            const transmuteAwakenedAir = await Item.create({name: "Transmute: Awakened Air"});
            const transmuteAwakenedEarth = await Item.create({name: "Transmute: Awakened Earth"});
            const transmuteAwakenedFire = await Item.create({name: "Transmute: Awakened Fire"});
            const transmuteAwakenedFrost = await Item.create({name: "Transmute: Awakened Frost"});
            //back to actual items
            const potionAbsorptionInhibitor = await Item.create({name: "Potion Absorption Inhibitor", stacksTo: 1000});
            const writhefireOil = await Item.create({name: "Writhefire Oil", stacksTo: 1000});
            const broodSalt = await Item.create({name: "Brood Salt", stacksTo: 1000});
            const stableFluidicDraconium = await Item.create({name: "Stable Fluidic Draconium", stacksTo: 1000});
            const agitatingPotionAugmentation = await Item.create({name: "Agitating Potion Augmentation", stacksTo: 1000});
            const reactivePhialEmbellishment = createItem("Reactive Phial Embellishment", 1000);
            const sagaciousIncense = createItem("Sagacious Incense", 1000);
            const exultantIncense = createItem("Exultant Incense", 1000);
            const fervidIncense = createItem("Fervid Incense", 1000);
            const somniferousIncense = createItem("Somniferous Incense", 1000);
            const alacritousAlchemistStone = createItem("Alacritous Alchemist Stone", 1, 382, 392);
            const sustainingAlchemistStone = createItem("Sustaining Alchemist Stone", 1, 382, 392);

            //inscription items
            // const dragonIslesMilling = createItem("Dragon Isles Milling"); //not a real item
            const shimmeringPigment = createItem("Shimmering Pigment", 1000);
            const serenePigment = createItem("Serene Pigment", 1000);
            const flourishingPigment = createItem("Flourishing Pigment", 1000);
            const blazingPigment = createItem("Blazing Pigment", 1000);
            const cosmicInk = createItem("Cosmic Ink", 1000);
            const burnishedInk = createItem("Burnished Ink", 1000);
            const blazingInk = createItem("Blazing Ink", 1000);
            const flourishingInk = createItem("Flourishing Ink", 1000);
            const sereneInk = createItem("Serene Ink", 1000);
            const runedWrithebark = createItem("Runed Writhebark", 1000);
            const chilledRune = createItem("Chilled Rune", 1000);
            const draconicMissiveOfTheAurora = createItem("Draconic Missive of the Aurora", 1000);
            const draconicMissiveOfTheFeverflare = createItem("Draconic Missive of the Feverflare", 1000);
            const draconicMissiveOfTheFireflash = createItem("Draconic Missive of the Fireflash", 1000);
            const draconicMissiveOfTheHarmonious = createItem("Draconic Missive of the Harmonious", 1000);
            const draconicMissiveOfThePeerless = createItem("Draconic Missive of the Peerless", 1000);
            const draconicMissiveOfTheQuickblade = createItem("Draconic Missive of the Quickblade", 1000);
            const draconicMissiveOfCraftingSpeed = createItem("Draconic Missive of Crafting Speed", 1000);
            const draconicMissiveOfInspiration = createItem("Draconic Missive of Inspiration", 1000);
            const draconicMissiveOfMulticraft = createItem("Draconic Missive of Multicraft", 1000);
            const draconicMissiveOfResourcefulness = createItem("Draconic Missive of Resourcefulness", 1000);
            const draconicMissiveOfDeftness = createItem("Draconic Missive of Deftness", 1000);
            const draconicMissiveOfFinesse = createItem("Draconic Missive of Finesse", 1000);
            const draconicMissiveOfPerception = createItem("Draconic Missive of Perception", 1000);
            const darkmoonDeckBoxDance = createItem("Darkmoon Deck Box: Dance", 1, 382, 392);
            const darkmoonDeckBoxInferno = createItem("Darkmoon Deck Box: Inferno", 1, 382, 392);
            const darkmoonDeckBoxRime = createItem("Darkmoon Deck Box: Rime", 1, 382, 392);
            const darkmoonDeckBoxWatcher = createItem("Darkmoon Deck Box: Watcher", 1, 382, 392);
            const crackingCodexOfTheIsles = createItem("Cracking Codex of the Isles", 1, 382, 392);
            const illuminatingPillarOfTheIsles = createItem("Illuminating Pillar of the Isles", 1, 382, 392);
            const weatheredExplorersStave = createItem("Weathered Explorer's Stave", 1, 382, 392);
            const coreExplorersCompendium = createItem("Core Explorer's Compendium", 1, 333, 343);
            const overseersWrithebarkStave = createItem("Overseer's Writhebark Stave", 1, 333, 343);
            const pioneersWrithebarkStave = createItem("Pioneer's Writhebark Stave", 1, 333, 343);
            const emberscaleSigil = createItem("Emberscale Sigil", 1000);
            const jetscaleSigil = createItem("Jetscale Sigil", 1000);
            const sagescaleSigil = createItem("Sagescale Sigil", 1000);
            const azurescaleSigil = createItem("Azurescale Sigil", 1000);
            const bronzescaleSigil = createItem("Bronzescale Sigil", 1000);
            const vantusRuneVaultOfTheIncarnates = createItem("Vantus Rune: Vault of the Incarnates", 1000);
            const buzzingRune = createItem("Buzzing Rune", 1000);
            const chirpingRune = createItem("Chirping Rune", 1000);
            const howlingRune = createItem("Howling Rune", 1000);
            const alchemistsBrilliantMixingRod = createItem("Alchemist's Brilliant Mixing Rod", 1, 356, 371);
            const chefsSplendidRollingPin = createItem("Chef's Splendid Rolling Pin", 1, 356, 371);
            const scribesResplendentQuill = createItem("Scribe's Resplendent Quill", 1, 356, 371);
            const alchemistsSturdyMixingRod = createItem("Alchemist's Sturdy Mixing Rod", 1, 317, 332);
            const chefsSmoothRollingPin = createItem("Chef's Smooth Rolling Pin", 1, 317, 332);
            const scribesFastenedQuill = createItem("Scribe's Fastened Quill", 1, 317, 332);
            const illusionParchmentWhirlingBreeze = createItem("Illusion Parchment: Whirling Breeze", 1000);
            const illusionParchmentAquaTorrent = createItem("Illusion Parchment: Aqua Torrent", 1000);
            const illusionParchmentArcaneBurst = createItem("Illusion Parchment: Arcane Burst", 1000);
            const illusionParchmentChillingWind = createItem("Illusion Parchment: Chilling Wind", 1000);
            const illusionParchmentLoveCharm = createItem("Illusion Parchment: Love Charm", 1000);
            const illusionParchmentMagmaMissile = createItem("Illusion Parchment: Magma Missile", 1000);
            const illusionParchmentShadowOrb = createItem("Illusion Parchment: Shadow Orb", 1000);
            const illusionParchmentSpellShield = createItem("Illusion Parchment: Spell Shield", 1000);
            const scrollOfSales = createItem("Scroll of Sales", 1000);
            const bundleOCardsDragonIsles = createItem("Bundle O' Cards: Dragon Isles");
            const fatedFortuneCard = createItem("Fated Fortune Card", 1000);
            //4 extractions of awakened elements, but like, they just yield awakened elements...
            const contractIskaaraTuskarr = createItem("Contract: Iskaara Tuskarr", 1000);
            const contractArtisansConsortium = createItem("Contract: Artisan's Consortium", 1000);
            const contractDragonscaleExpedition = createItem("Contract: Dragonscale Expedition", 1000);
            const contractMaruukCentaur = createItem("Contract: Maruuk Centaur", 1000);
            const contractValdrakkenAccord = createItem("Contract: Valdrakken Accord", 1000);
            const draconicTreatiseOnAlchemy = createItem("Draconic Treatise on Alchemy", 1000);
            const draconicTreatiseOnBlacksmithing = createItem("Draconic Treatise on Blacksmithing", 1000);
            const draconicTreatiseOnEnchanting = createItem("Draconic Treatise on Enchanting", 1000);
            const draconicTreatiseOnEngineering = createItem("Draconic Treatise on Engineering", 1000);
            const draconicTreatiseOnHerbalism = createItem("Draconic Treatise on Herbalism", 1000);
            const draconicTreatiseOnInscription = createItem("Draconic Treatise on Inscription", 1000);
            const draconicTreatiseOnJewelcrafting = createItem("Draconic Treatise on Jewelcrafting", 1000);
            const draconicTreatiseOnLeatherworking = createItem("Draconic Treatise on Leatherworking", 1000);
            const draconicTreatiseOnMining = createItem("Draconic Treatise on Mining", 1000);
            const draconicTreatiseOnSkinning = createItem("Draconic Treatise on Skinning", 1000);
            const draconicTreatiseOnTailoring = createItem("Draconic Treatise on Tailoring", 1000);
            const renewedProtoDrakeSilverAndBlueArmor = createItem("Renewed Proto-Drake: Silver and Blue Armor");
            const renewedProtoDrakeSteelAndYellowArmor = createItem("Renewed Proto-Drake: Steel and Yellow Armor");
            const renewedProtoDrakeBovineHorns = createItem("Renewed Proto-Drake: Bovine Horns");
            const renewedProtoDrakePredatorPattern = createItem("Renewed Proto-Drake: Predator Pattern");
            const renewedProtoDrakeSpinedCrest = createItem("Renewed Proto-Drake: Spined Crest");
            const windborneVelocidrakeSilverAndBlueArmor = createItem("Windborne Velocidrake: Silver and Blue Armor");
            const windborneVelocidrakeSteelAndOrangeArmor = createItem("Windborne Velocidrake: Steel and Orange Armor");
            const windborneVelocidrakeBlackHair = createItem("Windborne Velocidrake: Black Hair");
            const windborneVelocidrakeSpinedHead = createItem("Windborne Velocidrake: Spined Head");
            const windborneVelocidrakeWindsweptPattern = createItem("Windborne Velocidrake: Windswept Pattern");
            const highlandDrakeSilverAndBlueArmor = createItem("Highland Drake: Silver and Blue Armor");
            const highlandDrakeSteelAndYellowArmor = createItem("Highland Drake: Steel and Yellow Armor");
            const highlandDrakeBlackHair = createItem("Highland Drake: Black Hair");
            const highlandDrakeSpinedCrest = createItem("Highland Drake: Spined Crest");
            const highlandDrakeSpinedThroat = createItem("Highland Drake: Spined Throat");
            const cliffsideWylderdrakeSilverAndBlueArmor = createItem("Cliffside Wylderdrake: Silver and Blue Armor");
            const cliffsideWylderdrakeSteelAndYellowArmor = createItem("Cliffside Wylderdrake: Steel and Yellow Armor");
            const cliffsideWylderdrakeConicalHead = createItem("Cliffside Wylderdrake: Conical Head");
            const cliffsideWylderdrakeRedHair = createItem("Cliffside Wylderdrake: Red Hair");
            const cliffsideWylderdrakeTripleHeadHorns = createItem("Cliffside Wylderdrake: Triple Head Horns");

            //jewelcrafting items
            //dragon isles crushing
            //dragon isles prospecting
            const silkenGemdust = await Item.create({name: 'Silken Gemdust', stacksTo: 1000});
            const queensRuby = await Item.create({name: "Queen's Ruby", stacksTo: 1000});
            const mysticSapphire = await Item.create({name: 'Mystic Sapphire', stacksTo: 1000});
            const vibrantEmerald = await Item.create({name: 'Vibrant Emerald', stacksTo: 1000});
            const sunderedOnyx = await Item.create({name: 'Sundered Onyx', stacksTo: 1000});
            const eternityAmber = await Item.create({name: 'Eternity Amber', stacksTo: 1000});
            const alexstraszite = await Item.create({name: 'Alexstraszite', stacksTo: 1000});
            const malygite = await Item.create({name: 'Malygite', stacksTo: 1000});
            const ysemerald = await Item.create({name: 'Ysemerald', stacksTo: 1000});
            const neltharite = await Item.create({name: 'Neltharite', stacksTo: 1000});
            const nozdorite = await Item.create({name: 'Nozdorite', stacksTo: 1000});
            const illimitedDiamond = await Item.create({name: 'Illimited Diamond', stacksTo: 1000});
            const elementalHarmony = createItem("Elemental Harmony", 1000);
            const blottingSand = createItem("Blotting Sand", 1000);
            const pounce = createItem("Pounce", 1000);
            const emptySoulCage = createItem("Empty Soul Cage", 1000);
            const draconicVial = createItem("Draconic Vial", 1000);
            const framelessLens = createItem("Frameless Lens", 1000);
            const glossyStone = await Item.create({name: 'Glossy Stone', stacksTo: 1000});
            const shimmeringClasp = createItem("Shimmering Clasp", 1000);
            const energizedVibrantEmerald = createItem("Energized Vibrant Emerald", 1000);
            const zenMysticSapphire = createItem("Zen Mystic Sapphire", 1000);
            const craftyQueensRuby = createItem("Crafy Queen's Ruby", 1000);
            const senseisSunderedOnyx = createItem("Sensei's Sundered Onyx", 1000);
            const solidEternityAmber = createItem("Solid Eternity Amber", 1000);
            const quickYsemerald = createItem("Quick Ysemerald", 1000);
            const craftyAlexstraszite = createItem("Crafty Alexstraszite", 1000);
            const energizedMalygite = createItem("Energized Malygite", 1000);
            const forcefulNozdorite = createItem("Forceful Nozdorite", 1000);
            const keenNeltharite = createItem("Keen Neltharite", 1000);
            const puissantNozdorite = createItem("Puissant Nozdorite", 1000);
            const fracturedNeltharite = createItem("Fractured Neltharite", 1000);
            const keenYsemerald = createItem("Keen Ysemerald", 1000);
            const senseisAlexstraszite = createItem("Sensei's Alexstraszite", 1000);
            const zenMalygite = createItem("Zen Malygite", 1000);
            const radiantMalygite = createItem("Radiant Malygite", 1000);
            const craftyYsemerald = createItem("Crafty Ysemerald", 1000);
            const deadlyAlexstraszite = createItem("Deadly Alexstraszite", 1000);
            const jaggedNozdorite = createItem("Jagged Nozdorite", 1000);
            const senseisNeltharite = createItem("Sensei's Neltharite", 1000);
            const energizedYsemerald = createItem("Energized Ysemerald", 1000);
            const radiantAlexstraszite = createItem("Radiant Alexstraszite", 1000);
            const steadyNozdorite = createItem("Steady Nozdorite", 1000);
            const stormyMalygite = createItem("Stormy Malygite", 1000);
            const zenNeltharite = createItem("Zen Neltharite", 1000);
            const fierceIllimitedDiamond = createItem("Fierce Illimited Diamond", 1000);
            const inscribedIllimitedDiamond = createItem("Inscribed Illimited Diamond", 1000);
            const resplendentIllimitedDiamond = createItem("Resplendent Illimited Diamond", 1000);
            const skillfulIllimitedDiamond = createItem("Skillful Illimited Diamond", 1000);
            const tieredMedallionSetting = createItem("Tiered Medallion Setting", 1000);
            const idolOfTheDreamer = createItem("Idol of the Dreamer", 1, 382, 392);
            const idolOfTheEarthWarder = createItem("Idol of the Earth Warder", 1, 382, 392);
            const idolOfTheLifebinder = createItem("Idol of the Lifebinder", 1, 382, 392);
            const idolOfTheSpellWeaver = createItem("Idol of the Spell-Weaver", 1, 382, 392);
            const chokerOfShielding = createItem("Choker of Shielding", 1, 382, 392);
            const elementalLariat = createItem("Elemental Lariat", 1, 382, 392);
            const ringBoundHourglass = createItem("Ring-Bound Hourglass", 1, 382, 392);
            const signetOfTitanicInsight = createItem("Signet of Titanic Insight", 1, 382, 392);
            const torcOfPassedTime = createItem("Torc of Passed Time", 1, 382, 392);
            //next 2 need pvp ilvls
            const crimsonCombatantsJeweledAmulet = createItem("Crimson Combatant's Jeweled Amulet", 1, 333, 343);
            const crimsonCombatantsJeweledSignet = createItem("Crimson Combatant's Jeweled Signet", 1, 333, 343);
            const bandOfNewBeginnings = createItem("Band of New Beginnings", 1, 306, 316);
            const pendantOfImpendingPerils = createItem("Pendant of Impending Perils", 1, 306, 316);
            const djaradinsPinata = createItem(`Djaradin's "Pinata"`, 1000);
            const narcissistsSculpture = createItem("Narcissist's Sculpture", 1000);
            const kaluakFigurine = createItem("Kalu'ak Figurine", 1000);
            const statueOfTyrsHerald = createItem("Statue of Tyr's Herald", 1000);
            const revitalizingRedCarving = createItem("Revitalizing Red Carving", 1000);
            const jeweledAmberWhelpling = createItem("Jeweled Amber Whelpling");
            const jeweledEmeraldWhelpling = createItem("Jeweled Emerald Whelpling");
            const jeweledOnyxWhelpling = createItem("Jeweled Onyx Whelpling");
            const jeweledRubyWhelpling = createItem("Jeweled Ruby Whelpling");
            const jeweledSapphireWhelpling = createItem("Jeweled Sapphire Whelpling");
            const convergentPrism = createItem("Convergent Prism");
            const jeweledOffering = createItem("Jeweled Offering");
            const projectionPrism = createItem("Projection Prism", 1000);
            const rhinestoneSunglasses = createItem('"Rhinestone" Sunglasses');
            const splitLensSpecs = createItem("Split-Lens Specs");
            const alexstrasziteLoupes = createItem("Alexstraszite Loupes", 1, 356, 371);
            const finePrintTrifocals = createItem("Fine-Print Trifocals", 1, 356, 371);
            const magnificentMarginMagnifier = createItem("Magnificent Margin Magnifier", 1, 356, 371);
            const resonantFocus = createItem("Resonant Focus", 1, 356, 371);
            const boldPrintBifocals = createItem("Bold-Print Bifocals", 1, 317, 332);
            const chromaticFocus = createItem("Chromatic Focus", 1, 317, 332);
            const leftHandedMagnifyingGlass = createItem("Left-Handed Magnifying Glass", 1, 317, 332);
            const sunderedOnyxLoupes = createItem("Sundered Onyx Loupes", 1, 317, 332);
            const jeweledDragonsHeart = createItem("Jeweled Dragon's Heart");
            const dreamersVision = createItem("Dreamer's Vision");
            const earthwardensPrize = createItem("Earthwarden's Prize");
            const keepersGlory = createItem("Keeper's Glory");
            const queensGift = createItem("Queen's Gift");
            const timewatchersPatience = createItem("Timewatcher's Patience");

            //blacksmithing items
            const obsidianSearedAlloy = createItem("Obsidian Seared Alloy", 1000);
            const frostfireAlloy = createItem("Frostfire Alloy", 1000);
            const infuriousAlloy = createItem("Infurious Alloy", 1000);
            const primalMoltenAlloy = createItem("Primal Molten Alloy", 1000);
            const armorSpikes = createItem("Armor Spikes", 1000);
            const alliedChestplateOfGenerosity = createItem("Allied Chestplate of Generosity", 1, 382, 392);
            const alliedWristguardOfCompanionship = createItem("Allied Wristguard of Companionship", 1, 382, 392);
            const frostfireLegguardsOfPreparation = createItem("Frostfire Legguards of Preparation", 1, 382, 392);
            //next two items need pvp ilvl
            const infuriousHelmOfVengeance = createItem("Infurious Helm of Vengeance", 1, 382, 392);
            const infuriousWarbootsOfImpunity = createItem("Infurious Warboots of Impunity", 1, 382, 392);
            const primalMoltenBreastplate = createItem("Primal Molten Breastplate", 1, 382, 392);
            const primalMoltenGauntlets = createItem("Primal Molten Gauntlets", 1, 382, 392);
            const primalMoltenGreatbelt = createItem("Primal Molten Greatbelt", 1, 382, 392);
            const primalMoltenHelm = createItem("Primal Molten Helm", 1, 382, 392);
            const primalMoltenLegplates = createItem("Primal Molten Legplates", 1, 382, 392);
            const primalMoltenPauldrons = createItem("Primal Molten Pauldrons", 1, 382, 392);
            const primalMoltenSabatons = createItem("Primal Molten Sabatons", 1, 382, 392);
            const primalMoltenVambraces = createItem("Primal Molten Vambraces", 1, 382, 392);
            const unstableFrostfireBelt = createItem("Unstable Frostfire Belt", 1, 382, 392);
            const explorersExpertHelm = createItem("Explorer's Expert Helm", 1, 333, 343);
            const explorersExpertSpaulders = createItem("Explorer's Expert Spaulders", 1, 333, 343);
            const explorersExpertGauntlets = createItem("Explorer's Expert Gauntlets", 1, 333, 343);
            const explorersExpertGreaves = createItem("Explorer's Expert Greaves", 1, 333, 343);
            const explorersExpertClasp = createItem("Explorer's Expert Clasp", 1, 333, 343);
            const explorersPlateChestguard = createItem("Explorer's Plate Chestguard", 1, 306, 316);
            const explorersPlateBoots = createItem("Explorer's Plate Boots", 1, 306, 316);
            const explorersPlateBracers = createItem("Explorer's Plate Bracers", 1, 306, 316);
            //all of the next bunch need pvp ilvls
            const crimsonCombatantsDraconiumArmguards = createItem("Crimson Combatant's Draconium Armguards", 1, 333, 343);
            const crimsonCombatantsDraconiumBreastplate = createItem("Crimson Combatant's Draconium Breastplate", 1, 333, 343);
            const crimsonCombatantsDraconiumGauntlets = createItem("Crimson Combatant's Draconium Gauntlets", 1, 333, 343);
            const crimsonCombatantsDraconiumGreaves = createItem("Crimson Combatant's Draconium Greaves", 1, 333, 343);
            const crimsonCombatantsDraconiumHelm = createItem("Crimson Combatant's Draconium Helm", 1, 333, 343);
            const crimsonCombatantsDraconiumPauldrons = createItem("Crimson Combatant's Draconium Pauldrons", 1, 333, 343);
            const crimsonCombatantsDraconiumSabatons = createItem("Crimson Combatant's Draconium Sabatons", 1, 333, 343);
            const crimsonCombatantsDraconiumWaistguard = createItem("Crimson Combatant's Draconium Waistguard", 1, 333, 343);
            //end of pvp block
            const primalMoltenDefender = createItem("Primal Molten Defender", 1, 382, 392);
            const shieldOfTheHearth = createItem("Shield of the Hearth", 1, 382, 392);
            const draconiumDefender = createItem("Draconium Defender", 1, 333, 343);
            const obsidianSearedClaymore = createItem("Obsidian Seared Claymore", 1, 382, 392);
            const obsidianSearedCrusher = createItem("Obsidian Seared Crusher", 1, 382, 392);
            const obsidianSearedFacesmasher = createItem("Obsidian Seared Facesmasher", 1, 382, 392);
            const obsidianSearedHalberd = createItem("Obsidian Seared Halberd", 1, 382, 392);
            const obsidianSearedHexsword = createItem("Obsidian Seared Hexsword", 1, 382, 392);
            const obsidianSearedInvoker = createItem("Obsidian Seared Invoker", 1, 382, 392);
            const obsidianSearedRuneaxe = createItem("Obsidian Seared Runeaxe", 1, 382, 392);
            const obsidianSearedSlicer = createItem("Obsidian Seared Slicer", 1, 382, 392);
            const primalMoltenGreataxe = createItem("Primal Molten Greataxe", 1, 382, 392);
            const primalMoltenLongsword = createItem("Primal Molten Longsword", 1, 382, 392);
            const primalMoltenMace = createItem("Primal Molten Mace", 1, 382, 392);
            const primalMoltenShortblade = createItem("Primal Molten Shortblade", 1, 382, 392);
            const primalMoltenSpellblade = createItem("Primal Molten Spellblade", 1, 382, 392);
            const primalMoltenWarglaive = createItem("Primal Molten Warglaive", 1, 382, 392);
            const draconiumGreatMace = createItem("Draconium Great Mace", 1, 333, 343);
            const draconiumStiletto = createItem("Draconium Stiletto", 1, 333, 343);
            const draconiumGreatAxe = createItem("Draconium Great Axe", 1, 333, 343);
            const draconiumKnuckles = createItem("Draconium Knuckles", 1, 333, 343);
            const draconiumSword = createItem("Draconium Sword", 1, 333, 343);
            const draconiumAxe = createItem("Draconium Axe", 1, 333, 343);
            const draconiumDirk = createItem("Draconium Dirk", 1, 333, 343);
            const blackDragonTouchedHammer = createItem("Black Dragon Touched Hammer", 1, 382, 397);
            const khazgoriteBlacksmithsHammer = createItem("Khaz'gorite Blacksmith's Hammer", 1, 356, 371);
            const khazgoriteBlacksmithsToolbox = createItem("Khaz'gorite Blacksmith's Toolbox", 1, 356, 371);
            const khazgoriteLeatherworkersKnife = createItem("Khaz'gorite Leatherworker's Knife", 1, 356, 371);
            const khazgoriteLeatherworkersToolset = createItem("Khaz'gorite Leatherworker's Toolset", 1, 356, 371);
            const khazgoriteNeedleSet = createItem("Khaz'gorite Needle Set", 1, 356, 371);
            const khazgoritePickaxe = createItem("Khaz'gorite Pickaxe", 1, 356, 371);
            const khazgoriteSickle = createItem("Khaz'gorite Sickle", 1, 356, 371);
            const khazgoriteSkinningKnife = createItem("Khaz'gorite Skinning Knife", 1, 356, 371);
            const draconiumNeedleSet = createItem("Draconium Needle Set", 1, 317, 332);
            const draconiumLeatherworkersKnife = createItem("Draconium Leatherworker's Knife", 1, 317, 332);
            const draconiumLeatherworkersToolset = createItem("Draconium Leatherworker's Toolset", 1, 317, 332);
            const draconiumBlacksmithsToolbox = createItem("Draconium Blacksmith's Toolbox", 1, 317, 332);
            const draconiumBlacksmithsHammer = createItem("Draconium Blacksmith's Hammer", 1, 317, 332);
            const draconiumSkinningKnife = createItem("Draconium Skinning Knife", 1, 317, 332);
            const draconiumSickle = createItem("Draconium Sickle", 1, 317, 332);
            const draconiumPickaxe = createItem("Draconium Pickaxe", 1, 317, 332);
            const mastersHammer = createItem("Master's Hammer");
            const sturdyExpeditionShovel = createItem("Sturdy Expedition Shovel", 1000);
            const sereviteRepairHammer = createItem("Serevite Repair Hammer", 1000);
            const sereviteSkeletonKey = createItem("Serevite Skeleton Key", 1000);
            const primalRazorstone = createItem("Primal Razorstone", 1000);
            const primalWhetstone = createItem("Primal Whetstone", 1000);
            const primalWeightstone = createItem("Primal Weightstone", 1000);
            const alvinTheAnvil = createItem("Alvin the Anvil");
            const prototypeExplorersBardingFramework = createItem("Prototype Explorer's Barding Framework");
            const prototypeRegalBardingFramework = createItem("Prototype Regal Barding Framework");

            //leatherworking items

    const wilderclothBandageRecipe = await Recipe.create({name: 'Wildercloth Bandage', professionId: tailoring.id, itemId: wilderclothBandage.id, requiredProfessionLevel: 1, category: 'Assorted Embroidery', difficulty: 100, notes: "It's a bandage." });
    console.log('Data seeded successfully.');

    const professions = await Profession.findAll();
    console.log("All professions:", JSON.stringify(professions, null, 2));
}

makeTables();