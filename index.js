//PACKAGES
const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes, Op } = require("sequelize");
const sequelize = new Sequelize(
  "postgres://conrad:password@localhost:5432/df_professions"
);
const app = express();
const port = process.env.PORT || 3001;
// const internalURL
// const externalURL

//SETTING UP APP
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//MEAT & POTATOES

//tables
const Item = sequelize.define(
  "item",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING }, //links to png?
    stacksTo: { type: DataTypes.INTEGER, defaultValue: 1 },
    price: { type: DataTypes.FLOAT },
    description: { type: DataTypes.STRING },
    notes: { type: DataTypes.STRING },
    itemLevel: { type: DataTypes.ARRAY(DataTypes.STRING) },
    bindOn: { type: DataTypes.STRING },
    quality: { type: DataTypes.STRING },
    armorWeaponType: { type: DataTypes.STRING },
    otherType: { type: DataTypes.STRING },
    slot: { type: DataTypes.STRING },
    bindOn: { type: DataTypes.STRING },
    isUniqueEquipped: { type: DataTypes.STRING },
    qualityLevels: { type: DataTypes.INTEGER, defaultValue: 1 },
    finishingReagentType: { type: DataTypes.STRING },
    primaryStats: { type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.STRING)) },
    secondaryStats: {
      type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.STRING)),
    },
    effect: { type: DataTypes.TEXT },
    onUse: { type: DataTypes.TEXT },
    requiresProfession: { type: DataTypes.JSONB }
    //has many Materials, Recipe(s)
  },
  {
    underscored: true,
  }
);

const Profession = sequelize.define(
  "profession",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING },
    //has many Recipes, Specializations, Tools (Items), FirstAccessories (Items), SecondAccessories (Items)
  },
  {
    underscored: true,
  }
);

const Recipe = sequelize.define(
  "recipe",
  {
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
    requiredLocation: { type: DataTypes.STRING },
    //has many Materials & FinishingReagents
    //belongs to Item & Profession
  },
  {
    underscored: true,
  }
);

const Material = sequelize.define(
  "material",
  {
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    //belongs to Recipe, Item
  },
  {
    underscored: true,
  }
);

const FinishingReagent = sequelize.define(
  "finishingReagent",
  {
    reagentType: { type: DataTypes.STRING },
    requiredSpecializationLevel: { type: DataTypes.JSONB },
    //belongs to Recipe
  },
  {
    underscored: true,
  }
);

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

Profession.hasMany(Item, { as: "Tools", foreignKey: "toolsId" });
Profession.hasMany(Item, {
  as: "FirstAccessory",
  foreignKey: "firstAccessoryId",
});
Item.belongsTo(Profession, { as: "ProfessionEquipment" });

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
});

app.get("/items", async (req, res) => {
  //getting all items, then mapping them to json
  let items = (await Item.findAll()).map((item) => item.toJSON());
  res.send(items);
});

app.get("/professions/by_name/:professionName", async (req, res) => {
  let profession = (
    await Profession.findOne({
      where: {
        name: req.params.professionName,
      },
    })
  ).toJSON();
  res.send(profession);
});

app.get("/recipes/by_profession/:professionId", async (req, res) => {
  //getting all recipes by profession
  let recipes = (
    await Recipe.findAll({
      where: {
        professionId: req.params.professionId,
      },
    })
  ).map((recipe) => recipe.toJSON());
  res.send(recipes);
});

app.get(
  "/recipes/by_profession/:professionId/only_trainer_recipes",
  async (req, res) => {
    //like above, but only getting only the trainer recipes (ie, where the required level is not null)
    //also going to sort by the number!
    //we also need to know the actual items included in our material list, so we need to do a few things
    //first, eagerly fetch the Materials associated with the recipe
    //then, eagerly fetch the Item asssociated with each Material (though we're only getting name & icon)
    //next, fetch the Finishing Reagents associated
    //finally, we're going to be fetching the item icon associated with this recipe

    let recipes = (
      await Recipe.findAll({
        where: {
          professionId: req.params.professionId,
          requiredProfessionLevel: {
            [Op.not]: null,
          },
        },
        order: [
          ["requiredProfessionLevel", "ASC"],
          ["name", "ASC"],
        ],
        attributes: ["id", "requiredProfessionLevel", "name", "category"],
        include: [
          {
            model: Material,
            include: [
              {
                model: Item,
                attributes: ["id", "name", "icon"],
              },
            ],
          },
          FinishingReagent,
          {
            model: Item,
            attributes: ["icon"],
          },
        ],
      })
    ).map((recipe) => recipe.toJSON());
    res.send(recipes);
  }
);

app.get(
  "/recipes/by_profession/:professionId/only_renown_recipes",
  async (req, res) => {
    //same as above, but only renown recipes now!
    let recipes = (
      await Recipe.findAll({
        where: {
          professionId: req.params.professionId,
          requiredRenownLevel: {
            [Op.not]: null,
          },
        },
        order: [
          ["requiredRenownLevel", "ASC"],
          ["name", "ASC"],
        ],
        attributes: ["id", "requiredRenownLevel", "name", "category"],
        include: [
          {
            model: Material,
            include: [
              {
                model: Item,
                attributes: ["id", "name", "icon"],
              },
            ],
          },
          FinishingReagent,
          {
            model: Item,
            attributes: ["icon"],
          },
        ],
      })
    ).map((recipe) => recipe.toJSON());
    res.send(recipes);
  }
);

app.get(
  "/recipes/by_profession/:professionId/only_specialization_recipes",
  async (req, res) => {
    //same as above, but only specialization recipes now!
    //to keep in mind: some recipes have a specialization level requirement, but are actually "other" recipes
    //so we need to check that both specialization is not null, and other is null!
    let recipes = (
      await Recipe.findAll({
        where: {
          professionId: req.params.professionId,
          requiredSpecializationLevel: {
            [Op.not]: null,
          },
          specialAcquisitionMethod: {
            [Op.is]: null,
          },
        },
        order: [
          ["requiredSpecializationLevel", "ASC"],
          ["name", "ASC"],
        ],
        attributes: ["id", "requiredSpecializationLevel", "name", "category"],
        include: [
          {
            model: Material,
            include: [
              {
                model: Item,
                attributes: ["id", "name", "icon"],
              },
            ],
          },
          FinishingReagent,
          {
            model: Item,
            attributes: ["icon"],
          },
        ],
      })
    ).map((recipe) => recipe.toJSON());
    res.send(recipes);
  }
);

app.get(
  "/recipes/by_profession/:professionId/only_other_recipes",
  async (req, res) => {
    //same as above, but only recipes from other sources!
    //some of these recipes have both required specialization level && special acquisition method
    //tbh, front end is gonna take care of that sorting. we're good to just do a normal search
    //we do include requiredSpecializationLevel in our attributes, though
    let recipes = (
      await Recipe.findAll({
        where: {
          professionId: req.params.professionId,
          specialAcquisitionMethod: {
            [Op.not]: null,
          },
        },
        order: [
          ["specialAcquisitionMethod", "ASC"],
          ["name", "ASC"],
        ],
        attributes: [
          "id",
          "specialAcquisitionMethod",
          "requiredSpecializationLevel",
          "name",
          "category",
        ],
        include: [
          {
            model: Material,
            include: [
              {
                model: Item,
                attributes: ["id", "name", "icon"],
              },
            ],
          },
          FinishingReagent,
          {
            model: Item,
            attributes: ["icon"],
          },
        ],
      })
    ).map((recipe) => recipe.toJSON());
    res.send(recipes);
  }
);

app.get("/recipes/by_profession_name/:professionName", async (req, res) => {
  //first, gotta find profession by name
  let profession = await Profession.findOne({
    where: {
      name: req.params.professionName,
    },
    //only getting the id, extra info is extraneous
    attributes: [id],
  });

  //then, we get all recipes with that profession's id
  let recipes = (
    await Recipe.findAll({
      where: {
        professionId: profession.id,
      },
    })
  ).map((recipe) => recipe.toJSON());
  res.send(recipes);
});

app.get("/recipes/:recipeId", async (req, res) => {
  //getting singular recipe, then mapping to json
  let recipe = (
    await Recipe.findByPk(req.params.recipeId, {
      include: [
        {
          model: Profession,
          attributes: ["name"],
        },
        {
          model: Material,
          include: [
            {
              model: Item,
              attributes: ["id", "name", "icon"],
            },
          ],
        },
        {
          model: Item,
          attributes: ["id", "name", "icon"],
        },
        FinishingReagent,
      ],
    })
  ).toJSON();
  res.send(recipe);
});

// app.get("/materials/by_recipe/:recipeId", async (req, res) => {
//     //getting all materials
//     let materials = (await(Material.findAll({
//         where: {
//             recipeId: req.params.recipeId
//         }
//     })))
// });

app.get("/items/:itemId", async (req, res) => {
  //find by primary key, convert to json - :itemId gets inserted into req.params object
  try {
    let item = (
      await Item.findByPk(req.params.itemId, {
        include: [
          {
            model: Material,
            attributes: ["id", "quantity"],
            include: [
              {
                model: Recipe,
                attributes: ["id", "name"],
                include: [
                  {
                    model: Item,
                    attributes: ["id", "icon"],
                  },
                  {
                    model: Profession,
                    attributes: ["id", "name"],
                  },
                ],
              },
            ],
          },
          {
            model: Recipe,
            attributes: ["id", "name"],
            include: [
              {
                model: Profession,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      })
    ).toJSON();
    res.send(item);
  } catch (error) {
    res.send(error);
  }
});

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
});
