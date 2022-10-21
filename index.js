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