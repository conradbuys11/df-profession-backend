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
//making tables
const Item = sequelize.define('item', {
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING }, //links to png?
    stacksTo: { type: DataTypes.INTEGER, defaultValue: 1 },
    price: { type: DataTypes.FLOAT },
    description: { type: DataTypes.STRING },
    itemLevelMin: { type: DataTypes.INTEGER },
    itemLevelMax: { type: DataTypes.INTEGER },
    types: { type: DataTypes.JSONB },
    bindOn: { type: DataTypes.STRING }, //should this be enum?
    isUniqueEquipped: { type: DataTypes.BOOLEAN }
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

// Specialization.hasMany(Specialization);
// Specialization.belongsTo(Specialization);

const isNotNullAndUndefined = value => {
    return (value != undefined && value != null)
}

async function createProfession(name, icon){
    let profession = Profession.build({name: name});
    if(isNotNullAndUndefined(icon)){
        profession.icon = icon;
    }
    await profession.save();
    return profession;
}

async function createItem(name, stacksTo, itemLevelMin, itemLevelMax, description, types, bindOn, isUniqueEquipped){
    let item = Item.build({name: name});
    if(isNotNullAndUndefined(stacksTo)){
        item.stacksTo = stacksTo;
    }
    if(isNotNullAndUndefined(itemLevelMin)){
        item.itemLevelMin = itemLevelMin;
    }
    if(isNotNullAndUndefined(itemLevelMax)){
        item.itemLevelMax = itemLevelMax;
    }
    if(isNotNullAndUndefined(description)){
        item.description = description;
    }
    if(isNotNullAndUndefined(types)){
        item.types = types;
    }
    if(isNotNullAndUndefined(bindOn)){
        item.bindOn = bindOn;
    }
    if(isNotNullAndUndefined(isUniqueEquipped)){
        item.isUniqueEquipped = isUniqueEquipped;
    }
    await item.save();
    console.log(item instanceof Item);
    console.log(`Item ID: ${item.id}`);
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
            //[[item.id, //item
            //  1, //quantity 
            //  recipe]]
        return recipe;
}

async function createMaterial(item, quantity, recipe){
    let material = Material.build({itemId: item.id, quantity: quantity, recipeId: recipe.id});
    await material.save();
    return material;
}

const makeTables = async () => {
    await sequelize.sync({force: true});
    console.log('Database synced successfully.');
    const jewelcrafting = await (createProfession('Jewelcrafting'));
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
    const skillfulIllimitedDiamond = await (createItem("Skillful Illimited Diamond", 1000));
    console.log(`Item is type ${typeof skillfulIllimitedDiamond}`);
    const skillfulIllimtedDiamondRecipe = await (createRecipe("Skillful Illimited Diamond", skillfulIllimitedDiamond, 1, jewelcrafting, null, 1, 'Test', 1, 100));
    console.log(`Is Recipe a Recipe? ${skillfulIllimtedDiamondRecipe instanceof Recipe}`);
    console.log(`Recipe is type ${typeof skillfulIllimtedDiamondRecipe}`);
    console.log(skillfulIllimitedDiamond);

    // console.log("All Items:", JSON.stringify(items,null,2));
}

makeTables();