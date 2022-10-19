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
            const draconicVial = await Item.create({name: 'Draconic Vial', stacksTo: 1000, price: 10});
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
            const primalMoltenAlloy = await Item.create({name: 'Primal Molten Alloy', stacksTo: 1000});
            const frostfireAlloy = await Item.create({name: 'Frostfire Alloy', stacksTo: 1000});
            const obsidianSearedAlloy = await Item.create({name: 'Obsidian Seared Alloy', stacksTo: 1000});
            const infuriousAlloy = await Item.create({name: 'Infurious Alloy', stacksTo: 1000});
            const silkenGemdust = await Item.create({name: 'Silken Gemdust', stacksTo: 1000});
            const glossyStone = await Item.create({name: 'Glossy Stone', stacksTo: 1000});
            const framelessLens = await Item.create({name: 'Frameless Lens', stacksTo: 1000});
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
            const wilderclothBandageItem = await Item.create({name: 'Wildercloth Bandage', stacksTo: 200});
            const surveyorsClothBands = await Item.create({name: "Surveyor's Cloth Bands", itemLevelMin: 306, itemLevelMax: 316});
            const surveyorsClothTreads = await Item.create({name: "Surveyor's Cloth Treads", itemLevelMin: 306, itemLevelMax: 316});
            const surveyorsClothRobe = await Item.create({name: "Surveyor's Cloth Robe", itemLevelMin: 306, itemLevelMax: 316});
            const wilderclothBolt = await Item.create({name: 'Wildercloth Bolt', stacksTo: 1000});
            const wilderclothTailorsCoat = await Item.create({name: "Wildercloth Tailor's Coat", itemLevelMin: 317, itemLevelMax: 332});
            const surveyorsSeasonedCord = await Item.create({name: "Surveyor's Seasoned Cord", itemLevelMin: 333, itemLevelMax: 343});
            const surveyorsSeasonedGloves = await Item.create({name: "Surveyor's Seasoned Gloves", itemLevelMin: 333, itemLevelMax: 343});
            const surveyorsSeasonedHood = await Item.create({name: "Surveyor's Seasoned Hood", itemLevelMin: 333, itemLevelMax: 343});
            const surveyorsSeasonedPants = await Item.create({name: "Surveyor's Seasoned Pants", itemLevelMin: 333, itemLevelMax: 343});
            const surveyorsSeasonedShoulders = await Item.create({name: "Surveyor's Seasoned Shoulders", itemLevelMin: 333, itemLevelMax: 343});
            const surveyorsTailoredCloak = await Item.create({name: "Surveyor's Tailored Cloak", itemLevelMin: 306, itemLevelMax: 316});

    const wilderclothBandageRecipe = await Recipe.create({name: 'Wildercloth Bandage', professionId: tailoring.id, itemId: wilderclothBandageItem.id, requiredProfessionLevel: 1, category: 'Assorted Embroidery', difficulty: 100, notes: "It's a bandage." });
    console.log('Data seeded successfully.');

    const professions = await Profession.findAll();
    console.log("All professions:", JSON.stringify(professions, null, 2));
}

makeTables();