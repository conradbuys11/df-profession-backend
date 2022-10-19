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
    description: { type: DataTypes.STRING }
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
            //should draconic vial be part of alchemy items?
            //const draconicVial = await Item.create({name: 'Draconic Vial', stacksTo: 1000, price: 10});
            const primalFlux = await Item.create({name: 'Primal Flux', stacksTo: 1000, price: 15});
            const smudgedLens = await Item.create({name: 'Smudged Lens', stacksTo: 1000, price: 32.5});
            const enchantingVellum = await Item.create({name: 'Enchanting Vellum', stacksTo: 1000, price: 0.1});
            const glitteringParchment = await Item.create({name: 'Glittering Parchment', stacksTo: 1000, price: 1});
            const iridescentWater = await Item.create({name: 'Iridescent Water', stacksTo: 1000, price: 1});
            const misshapedFiligree = await Item.create({name: 'Misshapen Filigree', stacksTo: 1000, price: 0.5});
            const draconicStopper = await Item.create({name: 'Draconic Stopper', stacksTo: 1000, price: 5});
            const threeCheeseBlend = await Item.create({name: 'Three-Cheese Blend', stacksTo: 1000, price: 0.3});
            const pastryPackets = await Item.create({name: 'Pastry Packets', stacksTo: 1000, price: 0.5});
            const convenientlyPackagedIngredients = await Item.create({name: 'Conveniently Packaged Ingredients', stacksTo: 1000, price: 1.25});
            const thaldraszianCocoaPowder = await Item.create({name: 'Thaldraszian Cocoa Powder', stacksTo: 1000, price: 3});

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

    const wilderclothBandageItem = await Item.create({name: 'Wildercloth Bandage', stacksTo: 200});
    const wilderclothBandageRecipe = await Recipe.create({name: 'Wildercloth Bandage', professionId: tailoring.id, itemId: wilderclothBandageItem.id, requiredProfessionLevel: 1, category: 'Assorted Embroidery', difficulty: 100, notes: "It's a bandage." });
    console.log('Data seeded successfully.');

    const professions = await Profession.findAll();
    console.log("All professions:", JSON.stringify(professions, null, 2));
}

makeTables();