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
    stacksTo: { type: DataTypes.INTEGER, defaultValue: 1 }
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
    // seeding items & recipes
    //

    // SEEDING: ITEMS
    

    const wilderclothBandageItem = await Item.create({name: 'Wildercloth Bandage', stacksTo: 200});
    const wilderclothBandageRecipe = await Recipe.create({name: 'Wildercloth Bandage', professionId: tailoring.id, itemId: wilderclothBandageItem.id, requiredProfessionLevel: 1, category: 'Assorted Embroidery', difficulty: 100, notes: "It's a bandage." });
    console.log('Data seeded successfully.');

    const professions = await Profession.findAll();
    console.log("All professions:", JSON.stringify(professions, null, 2));
}

makeTables();