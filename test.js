//IMPORT
// import { Item, Profession, Recipe, Material, FinishingReagent, Specialization, Bonus } from './models.js'

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

const makeTables = async () => {
    await sequelize.sync();
    console.log('Database synced successfully.');
            // const shieldOfTheHearth = createItem("Shield of the Hearth", 1, 382, 392);
            // const draconiumDefender = createItem("Draconium Defender", 1, 333, 343);
            // const obsidianSearedClaymore = createItem("Obsidian Seared Claymore", 1, 382, 392);
            // const obsidianSearedCrusher = createItem("Obsidian Seared Crusher", 1, 382, 392);
            // const obsidianSearedFacesmasher = createItem("Obsidian Seared Facesmasher", 1, 382, 392);
            // const obsidianSearedHalberd = createItem("Obsidian Seared Halberd", 1, 382, 392);
            // const obsidianSearedHexsword = createItem("Obsidian Seared Hexsword", 1, 382, 392);
            // const obsidianSearedInvoker = createItem("Obsidian Seared Invoker", 1, 382, 392);
            // const obsidianSearedRuneaxe = createItem("Obsidian Seared Runeaxe", 1, 382, 392);
            // const obsidianSearedSlicer = createItem("Obsidian Seared Slicer", 1, 382, 392);
            // const primalMoltenGreataxe = createItem("Primal Molten Greataxe", 1, 382, 392);
            // const primalMoltenLongsword = createItem("Primal Molten Longsword", 1, 382, 392);
            // const primalMoltenMace = createItem("Primal Molten Mace", 1, 382, 392);
            // const primalMoltenShortblade = createItem("Primal Molten Shortblade", 1, 382, 392);
            // const primalMoltenSpellblade = createItem("Primal Molten Spellblade", 1, 382, 392);
            // const primalMoltenWarglaive = createItem("Primal Molten Warglaive", 1, 382, 392);
            // const draconiumGreatMace = createItem("Draconium Great Mace", 1, 333, 343);
            // const draconiumStiletto = createItem("Draconium Stiletto", 1, 333, 343);
            // const draconiumGreatAxe = createItem("Draconium Great Axe", 1, 333, 343);
            // const draconiumKnuckles = createItem("Draconium Knuckles", 1, 333, 343);
            // const draconiumSword = createItem("Draconium Sword", 1, 333, 343);
            // const draconiumAxe = createItem("Draconium Axe", 1, 333, 343);
            // const draconiumDirk = createItem("Draconium Dirk", 1, 333, 343);
            const skillfulIllimitedDiamond = createItem("Skillful Illimited Diamond", 1000);
    console.log("Item created successfully.");
    const items = await Item.findAll();
    console.log("All Items:", JSON.stringify(items,null,2));
}

makeTables();