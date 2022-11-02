//PACKAGES
const express = require('express')
const parser = require('body-parser')
const {Sequelize,DataTypes} = require('sequelize')
const sequelize = new Sequelize('postgres://conrad:password@localhost:5432/df_professions')
const app = express()
const port = 3001;
//const port = process.env.PORT || 3001;
const internalURL = "postgres://conrad:NQTL5xEl88OV0pX33AJu1uFhO259JHWb@dpg-cda17c2rrk09hiorhi10-a/df_professions"
const externalURL = "postgres://conrad:NQTL5xEl88OV0pX33AJu1uFhO259JHWb@dpg-cda17c2rrk09hiorhi10-a.oregon-postgres.render.com/df_professions"

//SETTING UP APP
app.use(parser.urlencoded({extended: true}))

//MEAT & POTATOES

//tables
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
    numberCrafted: { type: DataTypes.INTEGER, defaultValue: 1 },
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

//some helper methods
// man i should really figure out async shenanigans more
// async function getProfessionByName(name) {
//     let profession = await(Profession.findOne({
//         where: {
//             name: name
//         }
//     }));
//     return profession;
// }

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

app.get("/professions/by_name/:professionName", async (req, res) => {
    let profession = (await(Profession.findOne({
        where: {
            name: req.params.professionName
        }
    }))).toJSON();
    res.send(profession);
})

app.get("/recipes/by_profession/:professionId", async (req, res) => {
    //getting all recipes by profession
    let recipes = (await(Recipe.findAll({
        where: {
            professionId: req.params.professionId
        }
    }))).map(recipe => recipe.toJSON());
    res.send(recipes);
});

app.get("/recipes/by_profession_name/:professionName", async (req, res) => {
    //first, gotta find profession by name
    let profession = (await(Profession.findOne({
        where: {
            name: req.params.professionName
        }
    })));

    //then, we get all recipes with that profession's id
    let recipes = (await(Recipe.findAll({
        where: {
            professionId: profession.id
        }
    }))).map(recipe => recipe.toJSON());
    res.send(recipes);
});

app.get("/recipes/:recipeId", async (req, res) => {
    //getting all recipes, then mapping them to json
    let recipe = (await(Recipe.findByPk(req.params.recipeId))).toJSON();
    res.send(recipe);
});

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