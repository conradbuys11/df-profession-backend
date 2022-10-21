//PACKAGES
const express = require('express')
const parser = require('body-parser')
const {Sequelize,DataTypes} = require('sequelize')
const sequelize = new Sequelize('postgres://conrad:password@localhost:5432/df_professions')
const app = express()
const port = 3001

//SETTING UP APP
app.use(parser.urlencoded({extended: true}))

//MEAT & POTATOES
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

//actual routing
app.get("/", (req, res) => {
    //to-do
    res.send("<h1>PLACEHOLDER</h1>");
})

app.get("/items", async (req, res) => {
    //getting all items, then mapping them to json
    let items = (await Item.findAll()).map(item => item.toJSON());
    res.send(items);
})

app.get("/items/:itemId", async (req, res) => {
    //find by primary key, convert to json - :itemId gets inserted into req.params object
    try{
        let item = (await Item.findByPk(req.params.itemId)).toJSON();
        res.send(item);
    } catch(error){
        res.send(error);
    }
})

// app.get("items/names/:name", async (req, res) => {
//     //find by name, convert to json
//     //this isn't gonna work because spaces in urls is bad
//     try{
//         let item = (await Item.findOne({where: {name: req.params.name}})).toJSON();
//         res.send(item);
//     } catch(error){
//         res.send(error);
//     }
// })

app.listen(port, () => {
    console.log(`App listening on port ${port}.`);
})