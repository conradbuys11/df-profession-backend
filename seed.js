// TO SEE DB LAYOUT ON FIGMA:
// https://www.figma.com/file/YaQqpkp518Gkj9y4J7k3jJ/DF-Profession-DB-Layout

//PACKAGES
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
  "postgres://conrad:password@localhost:5432/df_professions"
);
const app = express();

//SETTING UP APP
app.use(express.urlencoded({ extended: true }));

//MEAT & POTATOES
// const test = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("Connection has been established successfully.");
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// };

//making tables
const Item = sequelize.define(
  "item",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    icon: { type: DataTypes.STRING }, //links to png?
    stacksTo: { type: DataTypes.INTEGER, defaultValue: 1 },
    price: { type: DataTypes.FLOAT },
    description: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT },
    itemLevel: { type: DataTypes.ARRAY(DataTypes.STRING) },
    bindOn: { type: DataTypes.STRING },
    quality: { type: DataTypes.STRING },
    armorWeaponType: { type: DataTypes.STRING },
    otherType: { type: DataTypes.STRING },
    slot: { type: DataTypes.STRING },
    bindOn: { type: DataTypes.STRING },
    isUniqueEquipped: { type: DataTypes.STRING },
    qualityLevels: { type: DataTypes.INTEGER, defaultValue: 1 },
    finishingReagentType: { type: DataTypes.ARRAY(DataTypes.STRING) },
    primaryStats: { type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.STRING)) },
    secondaryStats: {
      type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.STRING)),
    },
    effect: { type: DataTypes.TEXT },
    onUse: { type: DataTypes.TEXT },
    requiresProfession: { type: DataTypes.JSONB },
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
    isPrimaryProfession: { type: DataTypes.BOOLEAN, defaultValue: true },
    isCraftingProfession: { type: DataTypes.BOOLEAN, defaultValue: true },
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
    icon: { type: DataTypes.STRING },
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

const isNotNullAndUndefined = (value) => {
  return value != undefined || value != null;
};

const makeIcon = (fileName) => {
  return `https://wow.zamimg.com/images/wow/icons/large/${fileName}.jpg`;
};

async function createProfession(
  name,
  icon,
  isPrimaryProfession,
  isCraftingProfession
) {
  let profession = Profession.build({ name: name });
  if (isNotNullAndUndefined(icon)) {
    profession.icon = makeIcon(icon);
  }
  if (isNotNullAndUndefined(isPrimaryProfession)) {
    profession.isPrimaryProfession = isPrimaryProfession;
  }
  if (isNotNullAndUndefined(isCraftingProfession)) {
    profession.isCraftingProfession = isCraftingProfession;
  }
  await profession.save();
  return profession;
}

async function createItem(
  name,
  icon,
  bindOn,
  stacksTo,
  description,
  notes,
  quality,
  otherType,
  qualityLevels,
  finishingReagentType,
  effect,
  onUse,
  armorWeaponType,
  slot,
  isUniqueEquipped,
  itemLevel,
  primaryStats,
  secondaryStats,
  requiresProfession
) {
  let item = Item.build({ name: name });

  if (isNotNullAndUndefined(icon)) {
    item.icon = makeIcon(icon);
  }
  if (isNotNullAndUndefined(bindOn)) {
    item.bindOn = bindOn;
  }
  if (isNotNullAndUndefined(stacksTo)) {
    item.stacksTo = stacksTo;
  }
  if (isNotNullAndUndefined(description)) {
    item.description = description;
  }
  if (isNotNullAndUndefined(notes)) {
    item.notes = notes;
  }
  if (isNotNullAndUndefined(quality)) {
    item.quality = quality;
  }
  if (isNotNullAndUndefined(otherType)) {
    item.otherType = otherType;
  }
  if (isNotNullAndUndefined(qualityLevels)) {
    item.qualityLevels = qualityLevels;
  }
  if (isNotNullAndUndefined(finishingReagentType)) {
    item.finishingReagentType = finishingReagentType;
  }
  if (isNotNullAndUndefined(effect)) {
    item.effect = effect;
  }
  if (isNotNullAndUndefined(onUse)) {
    item.onUse = onUse;
  }
  if (isNotNullAndUndefined(armorWeaponType)) {
    //Cloth, Leather, Mail, Plate, Axe, Sword, Mace,
    //Dagger, Fist Weapon, Warglaives, Staff, Wand,
    //Shield, Tool, Accessory
    item.armorWeaponType = armorWeaponType;
  }
  if (isNotNullAndUndefined(slot)) {
    //Head, Neck, Shoulder, Back, Chest, Wrist, Hands,
    //Waist, Legs, Feet, Finger, Trinket, Two Hand, One Hand,
    //Off Hand, Toolkit, Focus, Magnifying Glass
    item.slot = slot;
  }
  if (isNotNullAndUndefined(isUniqueEquipped)) {
    item.isUniqueEquipped = isUniqueEquipped;
  }
  if (isNotNullAndUndefined(itemLevel)) {
    //this is an array of numbers
    //first element is min item level, last element is max
    item.itemLevel = itemLevel;
  }
  if (isNotNullAndUndefined(primaryStats)) {
    //this is an array of arrays
    //first array has the name of the stats
    //second array has each item level possible
    item.primaryStats = primaryStats;
  }
  if (isNotNullAndUndefined(secondaryStats)) {
    //this is an array of arrays
    //each array starts with the stat name at index 0
    //then each possible amount as the remaining elements
    item.secondaryStats = secondaryStats;
  }
  if (isNotNullAndUndefined(requiresProfession)) {
    //do we need a certain prof/level to use this?
    //it's an obj, so an example will look like this:
    //{Engineering: 1}
    //which will become "Requires Dragon Isles Engineering (1)" on the front end
    item.requiresProfession = requiresProfession;
  }
  await item.save().catch((e) => {
    throw new Error("The item in question is " + item.name);
  });
  return item;
}

async function createRecipe(
  name,
  itemMade,
  numberCrafted,
  profession,
  materials,
  requiredProfLevel,
  category,
  skillUpAmount,
  difficulty,
  requiredRenownLevel,
  requiredSpecializationLevel,
  specialAcquisitionMethod,
  requiredLocation,
  notes,
  finishingReagents,
  icon
) {
  let recipe = Recipe.build({
    itemId: itemMade.id,
    professionId: profession.id,
  });

  if (isNotNullAndUndefined(name)) {
    recipe.name = "Recipe: " + name;
  } else {
    recipe.name = "Recipe: " + itemMade.name;
  } //item already has the name, right? easy
  if (isNotNullAndUndefined(numberCrafted)) {
    recipe.numberCrafted = numberCrafted.toString();
  }
  if (isNotNullAndUndefined(requiredProfLevel)) {
    recipe.requiredProfessionLevel = requiredProfLevel;
  }
  if (isNotNullAndUndefined(category)) {
    recipe.category = category;
  }
  if (isNotNullAndUndefined(skillUpAmount)) {
    recipe.skillUpAmount = skillUpAmount;
  }
  if (isNotNullAndUndefined(difficulty)) {
    recipe.difficulty = difficulty;
  }
  if (isNotNullAndUndefined(requiredRenownLevel)) {
    recipe.requiredRenownLevel = requiredRenownLevel;
  }
  if (isNotNullAndUndefined(requiredSpecializationLevel)) {
    recipe.requiredSpecializationLevel = requiredSpecializationLevel;
  }
  if (isNotNullAndUndefined(specialAcquisitionMethod)) {
    recipe.specialAcquisitionMethod = specialAcquisitionMethod;
  }
  if (isNotNullAndUndefined(requiredLocation)) {
    recipe.requiredLocation = requiredLocation;
  }
  if (isNotNullAndUndefined(notes)) {
    recipe.notes = notes;
  }
  if (isNotNullAndUndefined(icon)) {
    recipe.icon = icon;
  } else if (itemMade.icon) {
    recipe.icon = itemMade.icon;
  }
  await recipe.save();
  // console.log(`${recipe.name}'s ID: ${recipe.id}`);

  //for materials, write as so:
  /*
        [
            [item, numberUsed],
            [item, numberUsed],
            etc.
        ]
        ie:
        [
            [awakenedAir, 1],
            [awakenedEarth, 1],
            [primalFlux, 10]
        ]
        */
  if (isNotNullAndUndefined(materials)) {
    for (let material of materials) {
      await createMaterial(material[0], material[1], recipe);
    }
  }

  //for finishing reagents, write as so:
  /*
        [
            ["Reagent Type", {SpecializationName: SpecializationLevel, OtherSpecializationName: SpecializationLevel, etc.}],
            etc.
        ]
        ie:
        [
            ["Lesser Illustrious Insight", {ChemicalSynthesis: 35}],
            ["Alchemical Catalyst", {PotionMastery: 30}]
        ]
        */
  if (isNotNullAndUndefined(finishingReagents)) {
    for (let freagent of finishingReagents) {
      await createFinishingReagent(freagent[0], freagent[1], recipe);
    }
  }

  return recipe;
}

async function createMaterial(item, quantity, recipe) {
  let material = Material.build({
    itemId: item.id,
    quantity: quantity,
    recipeId: recipe.id,
  });
  await material.save();
  return material;
}

async function createFinishingReagent(
  reagentType,
  requiredSpecializationLevel,
  recipe
) {
  let finishingReagent = FinishingReagent.build({
    reagentType: reagentType,
    requiredSpecializationLevel: requiredSpecializationLevel,
    recipeId: recipe.id,
  });
  await finishingReagent.save();
  return finishingReagent;
}

const primaryStatArrayEpic = (sizeOfItem) => {
  // this function is for 382-392 pieces
  // small (back & wrist), large (head, chest, legs), or medium (everything else)
  // also, 1h for a one handed weapon (str or agi), 1h-int for one handed int weapon, 2h-int for two handed int weapon
  switch (sizeOfItem.toLowerCase()) {
    case "small":
      return [195, 198, "?", 208, 214];
    case "medium":
      return [260, 265, "?", 277, 285];
    case "large":
      return [346, 353, "?", 370, 380];
    case "1h":
      return [173, 176, "?", 185, 190];
    case "1h-int":
      return [845, "?", "?", "?", 1107];
    case "2h-int":
      return [1539, "?", "?", 1644, 1690];
    default:
      return ["?", "?", "?", "?", "?"];
  }
};

const secondaryStatArrayEpic = (nameOfStat, sizeOfItem) => {
  // this function is for 382-392 pieces
  // if it's stamina, we do something different
  // small (back & wrist), large (head, chest, legs), or medium (everything else)
  // also, 1h for a one handed weapon!
  // jewelry for jewelry
  if (nameOfStat.toLowerCase() === "stamina") {
    switch (sizeOfItem) {
      case "small":
        return ["Stamina", 446, 458, 470, 490, 509];
      case "medium":
        return ["Stamina", 594, 610, "?", 653, 679];
      case "large":
        return ["Stamina", 793, 814, "?", 871, 905];
      case "1h":
        return ["Stamina", 396, 407, "?", 436, 453];
      case "jewelry":
        //same as small
        return ["Stamina", 446, 458, 470, 490, 509];
      default:
        return ["Stamina", "?", "?", "?", "?", "?"];
    }
  } else {
    switch (sizeOfItem) {
      case "small":
        return [nameOfStat, 176, 178, "?", "?", 187];
      case "medium":
        return [nameOfStat, 235, 238, "?", "?", 249];
      case "large":
        return [nameOfStat, 313, 317, "?", "?", 332];
      case "1h":
        return [nameOfStat, 156, 158, "?", 163, 166];
      case "jewelry":
        return [nameOfStat, 438, "?", 455, 468, 481];
      default:
        return [nameOfStat, "?", "?", "?", "?", "?"];
    }
  }
};

const primaryStatArrayRare = (sizeOfItem) => {
  // this function is for 333-343 pieces
  // small (back & wrist), large (head, chest, legs), or medium (everything else)
  // also, 1h for a one handed weapon (str or agi), 1h-int for one handed int weapon, 2h-int for two handed int weapon
  switch (sizeOfItem.toLowerCase()) {
    case "small":
      return [123, 126, "?", "?", 135];
    case "medium":
      return [165, 168, "?", "?", 181];
    case "large":
      return [219, 223, "?", "?", 241];
    case "1h":
      return [110, 112, "?", "?", 120];
    case "1h-int":
      return [651, "?", "?", "?", 701];
    case "2h-int":
      return [975, "?", "?", "?", 1071];
    default:
      return ["?", "?", "?", "?", "?"];
  }
};

const secondaryStatArrayRare = (nameOfStat, sizeOfItem) => {
  // this function is for 333-343 pieces
  // if it's stamina, we do something different
  // small (back & wrist), large (head, chest, legs), or medium (everything else)
  // also, 1h for a one handed weapon!
  // jewelry for jewelry
  if (nameOfStat.toLowerCase() === "stamina") {
    switch (sizeOfItem) {
      case "small":
        return ["Stamina", 271, 273, "?", "?", 280];
      case "medium":
        return ["Stamina", 362, 364, "?", "?", 374];
      case "large":
        return ["Stamina", 483, 486, "?", "?", 498];
      case "1h":
        return ["Stamina", 241, 243, "?", "?", 249];
      case "jewelry":
        //same as small
        return ["Stamina", 271, 273, "?", "?", 280];
      default:
        return ["Stamina", "?", "?", "?", "?", "?"];
    }
  } else {
    switch (sizeOfItem) {
      case "small":
        return [nameOfStat, 104, 110, "?", "?", 134];
      case "medium":
        return [nameOfStat, 138, 146, "?", "?", 179];
      case "large":
        return [nameOfStat, 184, 195, "?", "?", 239];
      case "1h":
        return [nameOfStat, 92, 97, "?", "?", 119];
      case "jewelry":
        return [nameOfStat, "?", "?", "?", "?", 271];
      default:
        return [nameOfStat, "?", "?", "?", "?", "?"];
    }
  }
};

const primaryStatArrayBaby = (sizeOfItem) => {
  // this function is for 306-316 pieces
  // small (back & wrist), large (head, chest, legs), or medium (everything else)
  switch (sizeOfItem.toLowerCase()) {
    case "small":
      return [96, 98, "?", "?", 105];
    case "medium":
      return [128, 130, "?", "?", 140];
    case "large":
      return [171, 174, "?", "?", 187];
    default:
      return ["?", "?", "?", "?", "?"];
  }
};

const secondaryStatArrayBaby = (nameOfStat, sizeOfItem) => {
  // this function is for 306-316 pieces
  // if it's stamina, we do something different
  // small (back & wrist), large (head, chest, legs), or medium (everything else)
  // jewelry for jewelry
  if (nameOfStat.toLowerCase() === "stamina") {
    switch (sizeOfItem) {
      case "small":
        return ["Stamina", 240, 245, "?", "?", 257];
      case "medium":
        return ["Stamina", 319, 327, "?", "?", 342];
      case "large":
        return ["Stamina", 426, 435, "?", "?", 456];
      case "jewelry":
        //same as small
        return ["Stamina", 240, 245, "?", "?", 257];
      default:
        return ["Stamina", "?", "?", "?", "?", "?"];
    }
  } else {
    switch (sizeOfItem) {
      case "small":
        return [nameOfStat, 55, 56, "?", "?", 65];
      case "medium":
        return [nameOfStat, 74, 74, "?", "?", 86];
      case "large":
        return [nameOfStat, 98, 99, "?", "?", 115];
      case "jewelry":
        return [nameOfStat, 172, "?", "?", "?", 189];
      default:
        return [nameOfStat, "?", "?", "?", "?", "?"];
    }
  }
};

const statArrayProfToolAccessory = (
  nameOfStat,
  typeOfToolOrAccessory,
  quality
) => {
  //hoo boy we're basically recreating all of the above methods but in ONE
  //for profession tools & accessories
  //this method is a clusterfuck and desperately needs to be split up
  let arr = [];
  if (typeOfToolOrAccessory.match(/(Tool$)/g)) {
    /* (Tool$) is the entire word Tool, then end of string */
    if (nameOfStat.toLowerCase() === "skill") {
      arr = [["Skill", "", "", "", ""]];
      quality.toLowerCase() === "large"
        ? arr.push([10, 10, 10, 10, 10])
        : quality.toLowerCase() === "medium"
        ? arr.push([6, 6, 6, 6, 6])
        : arr.push([4, 4, 4, 4, 4]);
      return arr;
    } else {
      arr = [nameOfStat];
      quality.toLowerCase() === "large"
        ? arr.push(79, 86, 92, 101, 110)
        : quality.toLowerCase() === "medium"
        ? arr.push(58, 62, 67, 101, 110)
        : arr.push(31, "?", "?", "?", 43);
      return arr;
    }
  } else if (typeOfToolOrAccessory.match(/(Toolkit)/g)) {
    if (nameOfStat.toLowerCase() === "skill") {
      arr = [
        ["Skill", "", "", "", ""],
        [6, 6, 6, 6, 6],
      ];
      return arr;
    } else {
      arr = [nameOfStat];
      quality.toLowerCase() === "large"
        ? arr.push(32, 34, "?", 40, 44)
        : quality.toLowerCase() === "medium"
        ? arr.push(23, 25, "?", "?", 32)
        : arr.push("?", "?", "?", "?", "?");
      return arr;
    }
  }
  return arr;
  //can do more later, but chests & heads are inconsistent with their secondary stats
};

// MAKING TABLES
// TIME TO SYNC
const makeTables = async () => {
  await sequelize.drop();
  console.log("Tables dropped successfully.");
  await sequelize.sync();
  console.log("Tables synced successfully.");
  //
  // SEEDING PROFESSIONS
  //

  // const vendor = await(createProfession('Vendor'));
  // const worldDropAndGathering = await(createProfession('World Drop & Gathering'));
  const tailoring = await createProfession(
    "Tailoring",
    "ui_profession_tailoring",
    true,
    true
  );
  const enchanting = await createProfession(
    "Enchanting",
    "ui_profession_enchanting",
    true,
    true
  );
  const engineering = await createProfession(
    "Engineering",
    "ui_profession_engineering",
    true,
    true
  );
  const alchemy = await createProfession(
    "Alchemy",
    "ui_profession_alchemy",
    true,
    true
  );
  const inscription = await createProfession(
    "Inscription",
    "ui_profession_inscription",
    true,
    true
  );
  const jewelcrafting = await createProfession(
    "Jewelcrafting",
    "ui_profession_jewelcrafting",
    true,
    true
  );
  const blacksmithing = await createProfession(
    "Blacksmithing",
    "ui_profession_blacksmithing",
    true,
    true
  );
  const leatherworking = await createProfession(
    "Leatherworking",
    "ui_profession_leatherworking",
    true,
    true
  );
  const herbalism = await createProfession(
    "Herbalism",
    "ui_profession_herbalism",
    true,
    false
  );
  const mining = await createProfession(
    "Mining",
    "ui_profession_mining",
    true,
    false
  );
  const skinning = await createProfession(
    "Skinning",
    "ui_profession_skinning",
    true,
    false
  );
  const cooking = await createProfession(
    "Cooking",
    "ui_profession_cooking",
    false,
    true
  );
  const fishing = await createProfession(
    "Fishing",
    "ui_profession_fishing",
    false,
    false
  );
  const archaeology = await createProfession(
    "Archaeology",
    "ui_profession_archaeology",
    false,
    false
  );

  //
  // SEEDING ITEMS
  //

  //vendor items
  const primalFlux = await createItem(
    "Primal Flux",
    "inv_herbalism_70_starlightrosedust",
    null,
    1000,
    "Used for removing impurities from metal. Sold by Blacksmithing vendors.",
    "Blacksmithing Reagent, bought from vendors.",
    "Common",
    "Crafting Reagent"
  );
  const smudgedLens = await createItem(
    "Smudged Lens",
    "inv_misc_orb_yellow",
    null,
    1000,
    "A misshapen piece of glass that is sufficient for use in the creation of goggles, assuming clear vision isn't a necessity. Can be purchased from Engineering suppliers across the Dragon Isles.",
    "Reagent for Engineering goggles, bought from vendors.",
    "Common",
    "Crafting Reagent"
  );
  const enchantingVellum = await createItem(
    "Enchanting Vellum",
    "inv_inscription_armorscroll01",
    null,
    1000,
    "Enchanters can use vellum in place of a weapon or armor to store an enchantment for later use.",
    "Makes enchantments tradeable, bought from vendors.",
    "Common"
  );
  const glitteringParchment = await createItem(
    "Glittering Parchment",
    "inv_inscription_parchmentvar06",
    null,
    1000,
    "A sparkling parchment frequently used by Scribes. Can be purchased from vendors.",
    "Inscription Reagent, bought from vendors.",
    "Common",
    "Crafting Reagent"
  );
  const iridescentWater = await createItem(
    "Iridescent Water",
    "shaman_pvp_ripplingwaters",
    null,
    1000,
    "A light and bubbly liquid frequently used by Scribes. Can be purchased from vendors.",
    "Inscription Reagent used to make inks, bought from vendors.",
    "Common",
    "Crafting Reagent"
  );
  const misshapenFiligree = await createItem(
    "Misshapen Filigree",
    "inv_misc_primitive_ring29",
    null,
    1000,
    "Purchased from Jewelcrafting vendors across the Dragon Isles. Can be bought and sold on the auction house.",
    "Jewelcrafting Reagent, bought from vendors.",
    "Common",
    "Crafting Reagent"
  );
  const draconicStopper = await createItem(
    "Draconic Stopper",
    "trade_archaeology_vrykul_runestick",
    null,
    1000,
    null,
    "Reagent used for making Draconic Vials w/ Jewelcrafting. Bought from vendors.",
    "Common",
    "Crafting Reagent"
  );
  const sereviteRod = await createItem(
    "Serevite Rod",
    "inv_rod_platinum",
    null,
    1,
    "Needed by an Enchanter to make a runed enchanting rod.",
    "A reagent for the most basic Enchanting tool.",
    "Common",
    "Crafting Reagent"
  );

  //dropped items
  const sparkOfIngenuity = await createItem(
    "Spark of Ingenuity",
    "inv_10_misc_titansspark_color1",
    null,
    1000,
    "Created by the Engine of Innovation in Valdrakken, this unique crafting material can help an item achieve expertise beyond that of mortal ability.",
    "Made with the Engine of Innovation in Valdrakken. More info later.",
    "Epic",
    "Crafting Reagent"
  );
  const artisansMettle = await createItem(
    "Artisans Mettle",
    "inv_10_gearcraft_artisansmettle_color4",
    null,
    1000,
    "A mystery of the Dragon Isles, this reagent coalesces each time you gain more profession Knowledge. It has myriad uses, including for recrafting Dragon Isles crafted equipment.",
    "Received for first crafts, profession daily quests, and some other sources. Can be used to buy recipes from the Artisan's Consortium, make Illustrious Insight, or make higher level Profession Equipment.",
    "Rare",
    "Crafting Reagent"
  );
  const primalChaos = await createItem(
    "Primal Chaos",
    "inv_10_gearcraft_primalchaos_color1",
    null,
    1000,
    "Formed from untamed elements attracted by the mightiest inhabitants of the Dragon Isles, it is essential for crafting powerful items and equipment.",
    "Reagent received from... dungeon & raid bosses? More info later.",
    "Epic",
    "Crafting Reagent"
  );
  const rousingAir = await createItem(
    "Rousing Air",
    "inv_10_elementalshardfoozles_air",
    null,
    1000,
    null,
    "Received mostly from air elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn ten Rousing Air into Awakened Air."
  );
  const rousingEarth = await createItem(
    "Rousing Earth",
    "inv_10_elementalshardfoozles_earth",
    null,
    1000,
    null,
    "Received mostly from earth elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn ten Rousing Earth into Awakened Earth."
  );
  const rousingFire = await createItem(
    "Rousing Fire",
    "inv_10_elementalshardfoozles_fire",
    null,
    1000,
    null,
    "Received mostly from fire elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn ten Rousing Fire into Awakened Fire."
  );
  const rousingFrost = await createItem(
    "Rousing Frost",
    "inv_10_elementalshardfoozles_frost",
    null,
    1000,
    null,
    "Received mostly from ice elementals. Lesser reagent. 10 Rousing can combine into 1 Awakened.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn ten Rousing Frost into Awakened Frost."
  );
  const rousingIre = await createItem(
    "Rousing Ire",
    "inv_10_elementalshardfoozles_blood",
    null,
    1000,
    "Gathered from various sources throughout the Dragon Isles while engaging in War Mode or from participating in instanced PvP.",
    "Received from pvp kills? I think? Lesser reagent. 10 Rousing can combine into 1 Awakened.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn ten Rousing Ire into Awakened Ire."
  );
  const rousingDecay = await createItem(
    "Rousing Decay",
    "inv_10_elementalshardfoozles_decay",
    null,
    1000,
    null,
    "Received mostly from decayed mobs. Lesser reagent. 10 Rousing can combine into 1 Awakened.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn ten Rousing Decay into Awakened Decay."
  );
  const rousingOrder = await createItem(
    "Rousing Order",
    "inv_10_elementalshardfoozles_titan",
    null,
    1000,
    null,
    "Received mostly from titan-touched gathering nodes. Lesser reagent. 10 Rousing can combine into 1 Awakened.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn ten Rousing Order into Awakened Order."
  );
  const awakenedAir = await createItem(
    "Awakened Air",
    "inv_10_elementalcombinedfoozles_air",
    null,
    1000,
    null,
    "Received mostly from air elementals. Greater reagent. 1 Awakened can split into 10 Rousing.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn Awakened Air into ten Rousing Air."
  );
  const awakenedEarth = await createItem(
    "Awakened Earth",
    "inv_10_elementalcombinedfoozles_earth",
    null,
    1000,
    null,
    "Received mostly from earth elementals. Greater reagent. 1 Awakened can split into 10 Rousing.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn Awakened Earth into ten Rousing Earth."
  );
  const awakenedFire = await createItem(
    "Awakened Fire",
    "inv_10_elementalcombinedfoozles_fire",
    null,
    1000,
    null,
    "Received mostly from fire elementals. Greater reagent. 1 Awakened can split into 10 Rousing.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn Awakened Fire into ten Rousing Fire."
  );
  const awakenedFrost = await createItem(
    "Awakened Frost",
    "inv_10_elementalcombinedfoozles_frost",
    null,
    1000,
    null,
    "Received mostly from ice elementals. Greater reagent. 1 Awakened can split into 10 Rousing.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn Awakened Frost into ten Rousing Frost."
  );
  const awakenedIre = await createItem(
    "Awakened Ire",
    "inv_10_elementalcombinedfoozles_blood",
    null,
    1000,
    "Gathered from various sources throughout the Dragon Isles while engaging in War Mode or from participating in instanced PvP.",
    "Received from pvp kills? I think? Greater reagent. 1 Awakened can split into 10 Rousing.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn Awakened Ire into ten Rousing Ire."
  );
  const awakenedDecay = await createItem(
    "Awakened Decay",
    "inv_10_elementalcombinedfoozles_decay",
    null,
    1000,
    null,
    "Received mostly from decayed mobs. Greater reagent. 1 Awakened can split into 10 Rousing.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn Awakened Decay into ten Rousing Decay."
  );
  const awakenedOrder = await createItem(
    "Awakened Order",
    "inv_10_elementalcombinedfoozles_titan",
    null,
    1000,
    null,
    "Received mostly from titan-touched gathering nodes. Greater reagent. 1 Awakened can split into 10 Rousing.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    null,
    "Turn Awakened Order into ten Rousing Order."
  );
  const airySoul = await createItem(
    "Airy Soul",
    "inv_10_elementalspiritfoozles_air",
    "Pickup",
    1000,
    "A wispy soul captured from a powerful elemental foe with a Zapthrottle Soul Inhaler, crafted by Engineers.",
    "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on an air elemental.",
    "Rare",
    "Crafting Reagent"
  );
  const fierySoul = await createItem(
    "Fiery Soul",
    "inv_10_elementalspiritfoozles_fire",
    "Pickup",
    1000,
    "A smoldering soul captured from a powerful elemental foe with a Zapthrottle Soul Inhaler, crafted by Engineers.",
    "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on a fire elemental.",
    "Rare",
    "Crafting Reagent"
  );
  const frostySoul = await createItem(
    "Frosty Soul",
    "inv_10_elementalspiritfoozles_frost",
    "Pickup",
    1000,
    "A glacial soul captured from a powerful elemental foe with a Zapthrottle Soul Inhaler, crafted by Engineers.",
    "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on an ice elemental.",
    "Rare",
    "Crafting Reagent"
  );
  const earthenSoul = await createItem(
    "Earthen Soul",
    "inv_10_elementalspiritfoozles_earth",
    "Pickup",
    1000,
    "A terraceous soul captured from a powerful elemental foe with a Zapthrottle Soul Inhaler, crafted by Engineers.",
    "Received from using a Zapthrottle Soul Inhaler (Engineering) & Empty Soul Cage (Jewelcrafting) on an earth elemental.",
    "Rare",
    "Crafting Reagent"
  );
  const centaursTrophyNecklace = await createItem(
    "Centaur's Trophy Necklace",
    "inv_misc_necklace_feather10",
    "Pickup",
    1000,
    "A decorative necklace to show one's prowess while hunting as a group. Received rarely when participating in Centaur Hunts.",
    "Received from Centaur Wild Hunts?",
    "Rare",
    "Crafting Reagent"
  );
  const titanTrainingMatrixOne = await createItem(
    "Titan Training Matrix I",
    "achievement_dungeon_ulduar77_10man",
    "Pickup",
    200,
    "Unfortunately, nobody can be told what the Titan Matrix is. You have to see it for yourself.",
    "Like the Crafter's Marks in Shadowlands. Drops from rares in the open world.",
    "Rare",
    "Optional Crafting Reagent",
    null,
    ["Training Matrix"],
    "+20 Recipe Difficulty. Set Item Level based on Crafting Quality (333 - 343), add Soulbound and Required Level 64."
  );
  const titanTrainingMatrixTwo = await createItem(
    "Titan Training Matrix II",
    "achievement_dungeon_ulduar77_25man",
    "Pickup",
    200,
    "Unfortunately, nobody can be told what the Titan Matrix is. You have to see it for yourself.",
    "Like the Crafter's Marks in Shadowlands. Drops from bosses in Normal dungeons.",
    "Rare",
    "Optional Crafting Reagent",
    null,
    ["Training Matrix"],
    "+40 Recipe Difficulty. Set Item Level based on Crafting Quality (346 - 356), add Soulbound and Required Level 70."
  );
  const titanTrainingMatrixThree = await createItem(
    "Titan Training Matrix III",
    "achievement_dungeon_ulduar77_normal",
    "Pickup",
    200,
    "Unfortunately, nobody can be told what the Titan Matrix is. You have to see it for yourself.",
    "Like the Crafter's Marks in Shadowlands. Drops from bosses in Heroic dungeons.",
    "Rare",
    "Optional Crafting Reagent",
    null,
    ["Training Matrix"],
    "+60 Recipe Difficulty. Set Item Level based on Crafting Quality (359 - 369), add Soulbound and Required Level 70."
  );
  const titanTrainingMatrixFour = await createItem(
    "Titan Training Matrix IV",
    "achievement_dungeon_ulduar77_heroic",
    "Pickup",
    200,
    "Unfortunately, nobody can be told what the Titan Matrix is. You have to see it for yourself.",
    "Like the Crafter's Marks in Shadowlands. Enhances the ilvl of Rare crafted gear. Drops from bosses in Mythic dungeons.",
    "Epic",
    "Optional Crafting Reagent",
    null,
    ["Training Matrix"],
    "+150 Recipe Difficulty. Set Item Level based on Crafting Quality (372 - 382), add Soulbound and Required Level 70."
  );
  const primalInfusion = await createItem(
    "Primal Infusion",
    "inv_10_gearcraft_primalinfusion_color1",
    "Pickup",
    200,
    "This mysterious object crackles with elemental energies.",
    "Like the Crafter's Marks in Shadowlands. Enhances the ilvl Epic crafted gear. Made by combining 10 Primal Focus & 100 Primal Chaos.",
    "Epic",
    "Optional Crafting Reagent",
    1,
    ["Primal Infusion"],
    "+30 Recipe Difficulty. Set Item level based on Crafting Quality (395 - 405)."
  );
  const concentratedPrimalInfusion = await createItem(
    "Concentrated Primal Infusion",
    "inv_10_gearcraft_distilledprimalinfusion_color1",
    "Pickup",
    200,
    "It radiates barely contained elemental energy.",
    "Like the Crafter's Marks in Shadowlands. Enhances the ilvl Epic crafted gear. Made by combining 10 Concentrated Primal Focus & 150 Primal Chaos.",
    "Epic",
    "Optional Crafting Reagent",
    1,
    ["Primal Infusion"],
    "+50 Recipe Difficulty. Set Item level based on Crafting Quality (408 - 418)."
  );
  const primalFocus = await createItem(
    "Primal Focus",
    "inv_10_misc_dragonorb_color1",
    "Pickup",
    1000,
    "Used to make an Optional Reagent for crafting heroically powerful equipment.",
    "Unsure where this drops from - maybe Heroic Vault bosses? Makes Primal Infusion, the second best 'Crafter's Mark' in Dragonflight.",
    "Epic",
    "Crafting Reagent",
    1,
    null,
    null,
    "Combine 10 Primal Focus with 100 Primal Chaos to create a Primal Infusion."
  );
  const concentratedPrimalFocus = await createItem(
    "Concentrated Primal Focus",
    "inv_10_misc_dragonorb_color2",
    "Pickup",
    1000,
    "Used to make an Optional Reagent for crafting mythically powerful equipment.",
    "Unsure where this drops from - maybe Mythic Vault bosses? Makes Concentrated Primal Infusion, the best 'Crafter's Mark' in Dragonflight.",
    "Epic",
    "Crafting Reagent",
    1,
    null,
    null,
    "Combine 10 Concentrated Primal Focus with 150 Primal Chaos to create a Concentrated Primal Infusion."
  );
  const illustriousInsight = await createItem(
    "Illustrious Insight",
    "inv_10_blacksmithing_specialcraftersfinishingreagent_color1",
    "Pickup",
    200,
    null,
    "Optional Reagent that increases Skill when crafting a more complex item by 30. Made with Artisan's Mettle by all professions.",
    "Rare",
    "Finishing Crafting Reagent",
    null,
    ["Illustrious Insight"],
    "When crafting: Increases Skill by 30.",
    "Break into 5 Lesser Illustrious Insight."
  );
  const lesserIllustriousInsight = await createItem(
    "Illustrious Insight",
    "inv_10_blacksmithing_consumable_smallspecialcraftersfinishingreagent_color1",
    "Pickup",
    200,
    null,
    "Optional Reagent that increases Skill when crafting a less complex item by 30. Made by shattering Illustrious Insight.",
    "Rare",
    "Finishing Crafting Reagent",
    null,
    ["Lesser Illustrious Insight"],
    "When crafting: Increases Skill by 30.",
    "Combine 5 Lesser Illustrious Insight into a full Illustrious Insight."
  );

  //tailoring drops & items
  const tatteredWildercloth = await createItem(
    "Tattered Wildercloth",
    "inv_10_tailoring_clothcommon_color2",
    null,
    1000,
    "A worn cloth found on humanoids throughout the Dragon Isles. It is useful to Tailors.",
    "Lesser cloth for Tailors. 5 of them can be spun into Spool(s) of Wilderthread.",
    "Common",
    "Crafting Reagent"
  );
  const wildercloth = await createItem(
    "Wildercloth",
    "inv_10_tailoring_clothrare_color3",
    null,
    1000,
    "A well kept cloth found on the most powerful and rare humanoids in the Dragon Isles. It is useful to Tailors.",
    "Standard cloth for Tailors. Can be spun into Spools, but this is the only dropped cloth that can actually be used in recipes, so I wouldn't.",
    "Uncommon",
    "Crafting Reagent"
  );
  const decayedWildercloth = await createItem(
    "Decayed Wildercloth",
    "inv_10_tailoring_clothcommon_color3",
    null,
    1000,
    "Cloth touched by the decay of Brackenhide Hollow. It is useful to Tailors.",
    "Cloth infused with decay. 5 of them can be spun into Spools of Wilderthread. Can give elements while spinning with certain specialization levels!",
    "Uncommon",
    "Crafting Reagent"
  );
  const frostbittenWildercloth = await createItem(
    "Decayed Wildercloth",
    "inv_10_tailoring_clothcommon_color1",
    null,
    1000,
    "Cloth frozen by the surging frost elements of the Dragon Isles. It is useful to Tailors.",
    "Cloth infused with frost. 5 of them can be spun into Spools of Wilderthread. Can give elements while spinning with certain specialization levels!",
    "Uncommon",
    "Crafting Reagent"
  );
  const singedWildercloth = await createItem(
    "Singed Wildercloth",
    "inv_10_tailoring_clothcommon_color4",
    null,
    1000,
    "Cloth burned by flames and found on some humanoids of the Dragon Isles. It is useful to Tailors.",
    "Cloth infused with fire. 5 of them can be spun into Spools of Wilderthread. Can give elements while spinning with certain specialization levels!",
    "Uncommon",
    "Crafting Reagent"
  );
  const spoolOfWilderthread = await createItem(
    "Spool of Wilderthread",
    "inv_10_tailoring_tailoringconsumable_color2",
    null,
    1000,
    "A simple thread created by unraveling any type of Wildercloth.",
    "Tailoring reagent, used by spinning 5 cloth together.",
    "Common",
    "Crafting Reagent",
    3
  );
  const chronoclothBolt = await createItem(
    "Chronocloth Bolt",
    "inv_10_tailoring_wovenbolt_fire",
    null,
    1000,
    "A spectacular bolt of cloth created with the magic of the Bronze Dragons. Can be bought and sold on the auction house.",
    "Specialty cloth for Tailors used to craft high-end cloth pieces. Has a CD on crafting.",
    "Epic",
    "Crafting Reagent",
    3
  );
  const azureweaveBolt = await createItem(
    "Azureweave Bolt",
    "inv_10_tailoring_wovenbolt_frost",
    null,
    1000,
    "This bolt of cloth is effervescent with the magic of the Blue Dragons. Can be bought and sold on the auction house.",
    "Specialty cloth for Tailors used to craft high-end cloth pieces. Has a CD on crafting.",
    "Epic",
    "Crafting Reagent",
    3
  );

  //LW & skinning drops & items
  const contouredFowlfeather = await createItem(
    "Contoured Fowlfeather",
    "inv_feather_10",
    null,
    1000,
    "A versatile feather gathered from ducks near rivers and ponds across the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const resilientLeather = await createItem(
    "Resilient Leather",
    "inv_10_skinning_leather_basicleather_color1",
    null,
    1000,
    "Gathered by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent",
    3
  );
  const adamantScales = await createItem(
    "Adamant Scales",
    "inv_10_skinning_skinning_scales_black",
    null,
    1000,
    "Gathered by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent",
    3
  );
  const denseHide = await createItem(
    "Dense Hide",
    "inv_10_skinning_leather_rarehide_color_1",
    null,
    1000,
    "Gathered by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const lustrousScaledHide = await createItem(
    "Lustrous Scaled Hide",
    null /* TODO: wowhead link was broken, try again */,
    null,
    1000,
    "Gathered by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );

  const crystalspineFur = await createItem(
    "Crystalspine Fur",
    "inv_misc_nativebeastfur",
    null,
    1000,
    "A rare, species-specific material gathered from Crystalspines by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent"
  );
  const salamantherScales = await createItem(
    "Salamanther Scales",
    "inv_misc_monsterscales_20",
    null,
    1000,
    "A rare, species-specific material gathered from Salamanthers by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent"
  );
  const cacophonousThunderscale = await createItem(
    "Cacophonous Thunderscale",
    "inv_misc_rubysanctum1",
    null,
    1000,
    "A rare, species-specific material gathered from Thunder Lizards by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent"
  );
  const fireInfusedHide = await createItem(
    "Fire-Infused Hide",
    null /* TODO: wowhead link was broken, try again */,
    null,
    1000,
    "A rare, species-specific material gathered from fiery creatures by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent"
  );
  const rockfangLeather = await createItem(
    "Rockfang Leather",
    "inv_misc_pelt_04",
    null,
    1000,
    "A rare, species-specific material gathered from Rockfangs by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent"
  );
  const pristineVorquinHorn = await createItem(
    "Pristine Vorquin Horn",
    "inv_10_specialization_leatherworking_pristinevorquinhorn_color2",
    null,
    1000,
    "A rare, species-specific material gathered from Vorquin by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent"
  );
  const windsongPlumage = await createItem(
    "Windsong Plumage",
    "inv_misc_feather01a",
    null,
    1000,
    "A rare, species-specific material gathered from Ohuna by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent"
  );
  const flawlessProtoDragonScale = await createItem(
    "Flawless Proto Dragon Scale",
    "inv_misc_scales_dragonpaleviolet01",
    null,
    1000,
    "A rare, species-specific material gathered from Proto Dragons by players with the Skinning skill. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent"
  );
  const tallstriderSinew = await createItem(
    "Tallstrider Sinew",
    "inv_leatherworking_90_sinew",
    null,
    1000,
    "A bit of fibrous tissue gathered from the tallstriders of the Dragon Isles.",
    null,
    "Common",
    "Crafting Reagent"
  );

  //mining, BS, & JC drops & items
  const sereviteOre = await createItem(
    "Serevite Ore",
    "inv_ore_tyrivite",
    null,
    1000,
    "Gathered by players with the Mining skill. Can be bought and sold on the auction house.",
    "The most common DF Ore. Found in every zone.",
    "Common",
    "Crafting Reagent",
    3
  );
  const draconiumOre = await createItem(
    "Draconium Ore",
    "inv_ore_draconium",
    null,
    1000,
    "Gathered by players with the Mining skill. Can be bought and sold on the auction house.",
    "Uncommon DF Ore. Found in every zone.",
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const khazgoriteOre = await createItem(
    "Khaz'gorite Ore",
    "inv_10_mining_traceore_color3",
    null,
    1000,
    "Gathered by players with the Mining skill. Can be bought and sold on the auction house.",
    "The rarest DF Ore. Found in every zone.",
    "Rare",
    "Crafting Reagent",
    3
  );
  const fracturedGlass = await createItem(
    "Fractured Glass",
    "inv_10_jewelcrafting2_glassshards_color1",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    "Common material received as a byproduct of prospecting.",
    "Common",
    "Crafting Reagent"
  );
  const crumbledStone = await createItem(
    "Crumbled Stone",
    "inv_10_jewelcrafting_stones_color1",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    "Common material received as a byproduct of prospecting.",
    "Common",
    "Crafting Reagent"
  );

  //herb, alch, & inscription drops & items
  const hochenblume = await createItem(
    "Hochenblume",
    "inv_misc_herb_dragonsbreath",
    null,
    1000,
    "Gathered by players with the Herbalism skill. Can be bought and sold on the auction house.",
    "The most common DF Herb. Found in every zone.",
    "Common",
    "Crafting Reagent",
    3
  );
  const saxifrage = await createItem(
    "Saxifrage",
    "inv_misc_herb_saxifrage",
    null,
    1000,
    "Gathered by players with the Herbalism skill. Can be bought and sold on the auction house.",
    "An uncommon DF Herb. Found mostly near 'mountains, cliffs, open plains, or scarcely within volcanic regions.'",
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const bubblePoppy = await createItem(
    "Bubble Poppy",
    "inv_misc_herb_bubblepoppy",
    null,
    1000,
    "Gathered by players with the Herbalism skill. Can be bought and sold on the auction house.",
    "An uncommon DF Herb. Found mostly near 'rivers, coasts, & damp caves.'",
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const writhebark = await createItem(
    "Writhebark",
    "inv_misc_herb_writhebark",
    null,
    1000,
    "Gathered by players with the Herbalism skill. Can be bought and sold on the auction house.",
    "An uncommon DF Herb. Found mostly near 'an abundance of trees or foliage.'",
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const primalConvergent = await createItem(
    "Primal Convergent",
    "inv_10_elementalshardfoozles_primordial",
    null,
    1000,
    "Created by Alchemists by combining the four fundamental elements with Order.",
    null,
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const omniumDraconis = await createItem(
    "Omnium Draconis",
    "inv_misc_herb_chamlotus",
    null,
    1000,
    "Created by Alchemists by combining the herbs of the Dragon Isles.",
    null,
    "Uncommon",
    "Crafting Reagent",
    3
  );

  //cooking & fishing drops & items
  const maybeMeat = await createItem(
    "Maybe Meat",
    "inv_misc_food_132_meat",
    null,
    1000,
    "A meat from various creatures on the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const ribbedMolluskMeat = await createItem(
    "Ribbed Mollusk Meat",
    "inv_misc_food_52",
    null,
    1000,
    "Meat commonly found within clams fished up on the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const waterfowlFilet = await createItem(
    "Waterfowl Filet",
    "inv_cooking_100_duckmeat",
    null,
    1000,
    "A meat from ducks, which are commonly found across the Dragon Isles near rivers and ponds. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const hornswogHunk = await createItem(
    "Hornswog Hunk",
    "inv_misc_food_134_meat",
    null,
    1000,
    "A meat from hornswog, which are commonly found across the Dragon Isles near water, caves, or areas with volcanic activity. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const basiliskEggs = await createItem(
    "Basilisk Eggs",
    "inv_falcosauregg_purple",
    null,
    1000,
    "An ingredient from basilisks, which are commonly found in the Waking Shores. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const bruffalonFlank = await createItem(
    "Bruffalon Flank",
    "inv_misc_food_98_talbuk",
    null,
    1000,
    "A meat from bruffalon, which are commonly found in the Azure Span. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const mightyMammothRibs = await createItem(
    "Mighty Mammoth Ribs",
    "inv_misc_food_meat_oxribs_color02",
    null,
    1000,
    "A meat from mammoths, which are commonly found in the Ohn'ahran Plains. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const burlyBearHaunch = await createItem(
    "Burly Bear Haunch",
    "inv_misc_food_133_meat",
    null,
    1000,
    "A meat from bears, which are commonly found in the Azure Span and Thaldraszus. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const saltDeposit = await createItem(
    "Salt Deposit",
    "inv_ore_platinum_01",
    null,
    1000,
    "A common reagent acquired by miners and often refined for use by chefs in Dragon Isles cuisine. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const lavaBeetle = await createItem(
    "Lava Beetle",
    "inv_inscription_pigment_bug04",
    null,
    1000,
    "A common reagent acquired by herbalists and often refined for use by chefs in Dragon Isles cuisine. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent"
  );
  const scalebellyMackerel = await createItem(
    "Scalebelly Mackerel",
    "inv_fish_silvermackerelred",
    null,
    1000,
    "A common fish found across the dragon isles. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent",
    1,
    null,
    null,
    "Throw the fish back into the water to gain 5 Fishing for 30 sec. Throwing multiple fish can extend this buff up to 5 min."
  );
  const thousandbitePiranha = await createItem(
    "Thousandbite Piranha",
    "inv_10_fishing_fishdragon_bronze",
    null,
    1000,
    "A common fish native to freshwater around the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const aileronSeamoth = await createItem(
    "Aileron Seamoth",
    "inv_fishpterois_orange",
    null,
    1000,
    "A common fish native to saltwater around the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const ceruleanSpinefish = await createItem(
    "Cerulean Spinefish",
    "inv_fishpterois_blue",
    null,
    1000,
    "A common fish native to saltwater around the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const temporalDragonhead = await createItem(
    "Temporal Dragonhead",
    "inv_10_fishing_fishdragon_blue",
    null,
    1000,
    "A common fish native to freshwater around the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const islefinDorado = await createItem(
    "Islefin Dorado",
    "inv_10_fishing_fishice_color2",
    null,
    1000,
    "An elusive fish native to the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent"
  );
  const magmaThresher = await createItem(
    "Magma Thresher",
    "inv_10_fishing_fishlava_color1",
    null,
    1000,
    "The outer shell consists of hardened magma. Aside from its Cooking properties, this fish looks to be Prospectable.",
    "You can literally prospect this fish w/ Jewelcrafting.",
    "Rare",
    "Crafting Reagent"
  );
  const prismaticLeaper = await createItem(
    "Prismatic Leaper",
    "inv_misc_fish_92",
    null,
    200,
    "The scales shimmer in multiple colors. Aside from its Cooking properties, this fish looks to be Millable.",
    "You can literally mill this fish w/ Inscription.",
    "Rare",
    "Crafting Reagent"
  );
  const rimefinTuna = await createItem(
    "Rimefin Tuna",
    "inv_10_fishing_fishice_color3",
    "Pickup",
    1,
    "The protective frosted shell has been brushed off. Don't let it spoil!",
    "Received from dusting off a Frosted Rimefin Tuna.",
    "Rare",
    "Crafting Reagent",
    null,
    null,
    "Duration: 1 hour (real time)"
  );
  const snowball = await createItem(
    "Snowball",
    "inv_ammo_snowball",
    null,
    20,
    null,
    null,
    "Common",
    null,
    null,
    null,
    null,
    "Throw me!"
  );
  const hornOMead = await createItem(
    "Horn O' Mead",
    "inv_misc_archaeology_vrykuldrinkinghorn",
    null,
    20,
    null,
    null,
    "Common",
    null,
    null,
    null,
    null,
    "Restores 62500 mana over 20 sec. Must remain seated while drinking."
  );
  const buttermilk = await createItem(
    "Buttermilk",
    "inv_drink_milk_04",
    null,
    20,
    null,
    null,
    "Common",
    null,
    null,
    null,
    null,
    "Restores 225,000 mana over 20 sec. Must remain seated while drinking."
  );
  const ohnahranPotato = await createItem(
    "Ohn'ahran Potato",
    "inv_cooking_80_brownpotato",
    null,
    1000,
    "A common ingredient often sold by cooking vendors on the Dragon Isles. Can be bought and sold on the auction house.",
    "Cooking reagent bought from most vendors.",
    "Common",
    "Crafting Reagent"
  );
  const threeCheeseBlend = await createItem(
    "Three-Cheese Blend",
    "inv_misc_food_100_hardcheese",
    null,
    1000,
    "A common ingredient often sold by cooking vendors on the Dragon Isles. Can be bought and sold on the auction house.",
    "Cooking reagent bought from most vendors.",
    "Common",
    "Crafting Reagent"
  );
  const pastryPackets = await createItem(
    "Pastry Packets",
    "inv_misc_food_cooked_springrolls",
    null,
    1000,
    "A common ingredient often sold by cooking vendors on the Dragon Isles. Can be bought and sold on the auction house.",
    "Cooking reagent bought from most vendors.",
    "Common",
    "Crafting Reagent"
  );
  const convenientlyPackagedIngredients = await createItem(
    "Conveniently Packaged Ingredients",
    "inv_misc_food_cooked_greatpabanquet_steamer",
    null,
    1000,
    "A common ingredient often sold by cooking vendors on the Dragon Isles. Can be bought and sold on the auction house.",
    "Cooking reagent bought from most vendors.",
    "Common",
    "Crafting Reagent"
  );
  const thaldraszianCocoaPowder = await createItem(
    "Thaldraszian Cocoa Powder",
    "inv_holiday_tow_spicebowl",
    null,
    1000,
    "A common ingredient often sold by cooking vendors on the Dragon Isles. Can be bought and sold on the auction house.",
    "Cooking reagent bought from most vendors.",
    "Common",
    "Crafting Reagent"
  );

  //other?
  const tuftOfPrimalWool = await createItem(
    "Tuft of Primal Wool",
    "inv_misc_pelt_10",
    null,
    1000,
    "A tuft of fuzzy wool from the argali and musken that live on the Dragon Isles.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const glowingTitanOrb = await createItem(
    "Glowing Titan Orb",
    "item_enchantedpearl",
    null,
    1000,
    "A mysterious orb thrumming with energy found in possession of a titan watcher on the Dragon Isles.",
    "Literally no idea where to get this.",
    "Common",
    "Crafting Reagent",
    1
  );
  const aquaticMaw = await createItem(
    "Aquatic Maw",
    "trade_archaeology_shark-jaws",
    null,
    1000,
    "A massive, toothy jaw obtained from large fish native to the Dragon Isles.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const largeSturdyFemur = await createItem(
    "Large Sturdy Femur",
    "inv_leatherworking_90_bone",
    null,
    1000,
    "A hefty thigh bone retrieved from the bruffalon native to the Dragon Isles.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const primalBearSpine = await createItem(
    "Primal Bear Spine",
    "inv_skeletonspinepet_green",
    null,
    1000,
    "A hulking spine from the bears of the Dragon Isles.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const mastodonTusk = await createItem(
    "Mastodon Tusk",
    "achievement_reputation_tuskarr",
    null,
    1000,
    "A durable tusk taken from the mammoths of the Dragon Isles.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const iridescentPlume = await createItem(
    "Iridescent Plume",
    "inv_icon_feather05d",
    null,
    1000,
    "A brilliant feather plucked from the harpies and large birds of the Dragon Isles.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const markOfHonor = await createItem(
    "Mark of Honor",
    "ability_pvp_gladiatormedallion",
    "Account",
    1000,
    "Exchanged for legacy weapons and armor at Player vs. Player vendors.",
    null,
    "Rare"
  );
  const quackEQuackModulator = await createItem(
    "Quack-E Quack Modulator",
    "inv_engineering_sonicenvironmentenhancer",
    "Pickup",
    1,
    "Members of the Dragonscale Expedition have been oddly preoccupied with mimicking the sounds of the local waterfowl.",
    "Bought from Dragonscale Expedition rep vendor?",
    "Uncommon",
    "Crafting Reagent"
  );
  const pentagoldSeal = await createItem(
    "Pentagold Seal",
    "inv_qirajidol_sun",
    "Pickup",
    1000,
    "This stamp marks a scroll with the Artisan's Consortium seal of quality.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const rainbowPearl = await createItem(
    "Rainbow Pearl",
    "inv_misc_gem_pearl_13",
    null,
    1000,
    "Shines with a prismatic hue.",
    null,
    "Rare",
    "Crafting Reagent"
  );
  const artisanalBerryJuice = await createItem(
    "Artisanal Berry Juice",
    "inv_drink_33_bloodredale",
    null,
    20,
    null,
    "Bought in some random spots in Thaldraszus, Azure Span, & Waking Shores.",
    "Common",
    null,
    null,
    null,
    null,
    "Restores 62500 mana over 20 sec. Must remain seated while drinking."
  );
  const refreshingSpringWater = await createItem(
    "Refreshing Spring Water",
    "inv_drink_07",
    null,
    20,
    null,
    null,
    "Common",
    null,
    null,
    null,
    null,
    "Restores 180 mana over 20 sec. Must remain seated while drinking."
  );

  // MADE WITH PROFESSIONS

  //tailoring items
  const wilderclothBandage = await createItem(
    "Wildercloth Bandage",
    "inv_tailoring_heavybandage",
    null,
    200,
    null,
    "Only bandage currently available!",
    "Common",
    null,
    3,
    null,
    null,
    "Heals 33977/39603/46153 damage (based on quality) over 8 seconds."
  );
  const surveyorsClothBands = await createItem(
    "Surveyor's Cloth Bands",
    "inv_cloth_dragonquest_b_01_bracer",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Wrist",
    null,
    [306, 308, 310, 313, 316],
    [["Intellect", "", "", "", ""], primaryStatArrayBaby("small")],
    [
      secondaryStatArrayBaby("stamina", "small"),
      secondaryStatArrayBaby("Random Stat 1", "small"),
      secondaryStatArrayBaby("Random Stat 2", "small"),
    ]
  );
  const surveyorsClothTreads = await createItem(
    "Surveyor's Cloth Treads",
    "inv_cloth_dragonquest_b_01_boot",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Feet",
    null,
    [306, 308, 310, 313, 316],
    [["Intellect", "", "", "", ""], primaryStatArrayBaby("medium")],
    [
      secondaryStatArrayBaby("stamina", "medium"),
      secondaryStatArrayBaby("Random Stat 1", "medium"),
      secondaryStatArrayBaby("Random Stat 2", "medium"),
    ]
  );
  const surveyorsClothRobe = await createItem(
    "Surveyor's Cloth Robe",
    "inv_cloth_dragonquest_b_01_torso",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Chest",
    null,
    [306, 308, 310, 313, 316],
    [["Intellect", "", "", "", ""], primaryStatArrayBaby("large")],
    [
      secondaryStatArrayBaby("stamina", "large"),
      secondaryStatArrayBaby("Random Stat 1", "large"),
      secondaryStatArrayBaby("Random Stat 2", "large"),
    ]
  );
  const wilderclothBolt = await createItem(
    "Wildercloth Bolt",
    "inv_10_tailoring_wovenbolt_basic",
    null,
    1000,
    "Created by players with the Tailoring skill. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const surveyorsSeasonedCord = await createItem(
    "Surveyor's Seasoned Cord",
    "inv_cloth_dragonquest_b_01_belt",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Waist",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const surveyorsSeasonedGloves = await createItem(
    "Surveyor's Seasoned Gloves",
    "inv_cloth_dragonquest_b_01_glove",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Hands",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const surveyorsSeasonedHood = await createItem(
    "Surveyor's Seasoned Hood",
    "inv_cloth_dragonquest_b_01_helmet",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Head",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const surveyorsSeasonedPants = await createItem(
    "Surveyor's Seasoned Pants",
    "inv_cloth_dragonquest_b_01_pant",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Legs",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const surveyorsSeasonedShoulders = await createItem(
    "Surveyor's Seasoned Shoulders",
    "inv_cloth_dragonquest_b_01_shoulder",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Chest",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const surveyorsTailoredCloak = await createItem(
    "Surveyor's Tailored Cloak",
    "inv_cloth_dragonquest_b_01_cape",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    null,
    "Back",
    null,
    [306, 308, 310, 313, 316],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      primaryStatArrayBaby("small"),
    ],
    [
      secondaryStatArrayBaby("stamina", "small"),
      secondaryStatArrayBaby("Random Stat 1", "small"),
      secondaryStatArrayBaby("Random Stat 2", "small"),
    ]
  );
  const vibrantWilderclothBolt = await createItem(
    "Vibrant Wildercloth Bolt",
    "inv_10_tailoring_wovenbolt_earth",
    null,
    1000,
    "A vivid bolt of cloth crafted by skilled Tailors. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const infuriousWilderclothBolt = await createItem(
    "Infurious Wildercloth Bolt",
    "inv_10_tailoring_wovenbolt_blood",
    null,
    1000,
    "This Wildercloth has been steeped in Awakened Ire, granting it new properties. Can be bought and sold on the auction house.",
    "Used for PvP recipes.",
    "Rare",
    "Crafting Reagent",
    3
  );
  const blueSilkenLining = await createItem(
    "Blue Silken Lining",
    "inv_10_tailoring_silkrare_color1",
    null,
    200,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Embellishment"],
    "While above 90% health, gain Mastery. Also add Unique-Equipped: Embellished (2)."
  );
  const bronzedGripWrappings = await createItem(
    "Bronzed Grip Wrappings",
    "inv_holiday_tow_spicebandage",
    null,
    200,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Embellishment"],
    "Your spells sometimes cause a ripple in time. Also add Unique-Equipped: Embellished (2)."
  );
  const abrasivePolishingCloth = await createItem(
    "Abrasive Polishing Cloth",
    "inv_10_tailoring_polishingcloth_color4",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Polishing Cloth"],
    "When crafting: You are 9-15% (based on quality) more likely to improve at Jewelcrafting, but Recipe Difficulty is increased by 18-30."
  );
  const vibrantPolishingCloth = await createItem(
    "Vibrant Polishing Cloth",
    "inv_10_tailoring_polishingcloth_color2",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Polishing Cloth"],
    "When crafting: Increases bonus Skill from Inspiration by 7-12% (based on quality) and Inspiration by 30-50."
  );
  const chromaticEmbroideryThread = await createItem(
    "Chromatic Embroidery Thread",
    "inv_10_tailoring_embroiderythread_color3",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Embroidery Thread"],
    "When crafting: Increases bonus Skill from Inspiration by 7-12% (based on quality) and Crafting Speed by 12-20%."
  );
  const shimmeringEmbroideryThread = await createItem(
    "Shimmering Embroidery Thread",
    "inv_10_tailoring_embroiderythread_color4",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Embroidery Thread"],
    "When crafting: Increases reagents saved from Resourcefulness by 15-25%. (based on quality)"
  );
  const blazingEmbroideryThread = await createItem(
    "Blazing Embroidery Thread",
    "inv_10_tailoring_embroiderythread_color1",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Embroidery Thread"],
    "When crafting: You are 9-15% (based on quality) more likely to improve at Tailoring, but Recipe Difficulty is increased by 18-30."
  );
  const vibrantWilderclothGirdle = await createItem(
    "Vibrant Wildercloth Girdle",
    "inv_cloth_dragonpvp_d_01_belt",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Waist",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const vibrantWilderclothHandwraps = await createItem(
    "Vibrant Wildercloth Handwraps",
    "inv_cloth_dragonpvp_d_01_glove",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Hands",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const vibrantWilderclothHeadcover = await createItem(
    "Vibrant Wildercloth Headcover",
    "inv_cloth_dragonpvp_d_01_helm",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Head",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const vibrantWilderclothShawl = await createItem(
    "Vibrant Wildercloth Shawl",
    "inv_cloth_dragonpvp_d_01_cape",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    null,
    "Back",
    null,
    [382, 384, 386, 389, 392],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      primaryStatArrayEpic("small"),
    ],
    [
      secondaryStatArrayEpic("stamina", "small"),
      secondaryStatArrayEpic("Random Stat 1", "small"),
      secondaryStatArrayEpic("Random Stat 2", "small"),
    ]
  );
  const vibrantWilderclothShoulderspikes = await createItem(
    "Vibrant Wildercloth Shoulderspikes",
    "inv_cloth_dragonpvp_d_01_shoulder",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Shoulder",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const vibrantWilderclothSlacks = await createItem(
    "Vibrant Wildercloth Slacks",
    "inv_cloth_dragonpvp_d_01_pant",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Legs",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const vibrantWilderclothSlippers = await createItem(
    "Vibrant Wildercloth Slippers",
    "inv_cloth_dragonpvp_d_01_boot",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Feet",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const vibrantWilderclothVestments = await createItem(
    "Vibrant Wildercloth Vestments",
    "inv_cloth_dragonpvp_d_01_robe",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Chest",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const vibrantWilderclothWristwraps = await createItem(
    "Vibrant Wildercloth Wristwraps",
    "inv_cloth_dragonpvp_d_01_bracer",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Wrist",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("stamina", "small"),
      secondaryStatArrayEpic("Random Stat 1", "small"),
      secondaryStatArrayEpic("Random Stat 2", "small"),
    ]
  );

  const crimsonCombatantsWilderclothBands = await createItem(
    "Crimson Combatant's Wildercloth Bands",
    "inv_cloth_dragonquest_b_01_bracer",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Cloth",
    "Wrist",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("small")],
    [
      secondaryStatArrayRare("stamina", "small"),
      secondaryStatArrayRare("Random Stat 1", "small"),
      secondaryStatArrayRare("Random Stat 2", "small"),
    ]
  );
  const crimsonCombatantsWilderclothCloak = await createItem(
    "Crimson Combatant's Wildercloth Cloak",
    "inv_cloth_dragonquest_b_01_cape",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    null,
    "Back",
    null,
    [333, 335, 337, 340, 343],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      primaryStatArrayRare("small"),
    ],
    [
      secondaryStatArrayRare("stamina", "small"),
      secondaryStatArrayRare("Random Stat 1", "small"),
      secondaryStatArrayRare("Random Stat 2", "small"),
    ]
  );
  const crimsonCombatantsWilderclothGloves = await createItem(
    "Crimson Combatant's Wildercloth Gloves",
    "inv_cloth_dragonquest_b_01_glove",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Cloth",
    "Hands",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsWilderclothHood = await createItem(
    "Crimson Combatant's Wildercloth Hood",
    "inv_cloth_dragonquest_b_01_helmet",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Cloth",
    "Head",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const crimsonCombatantsWilderclothLeggings = await createItem(
    "Crimson Combatant's Wildercloth Leggings",
    "inv_cloth_dragonquest_b_01_pant",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Cloth",
    "Legs",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const crimsonCombatantsWilderclothSash = await createItem(
    "Crimson Combatant's Wildercloth Sash",
    "inv_cloth_dragonquest_b_01_belt",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Cloth",
    "Waist",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsWilderclothShoulderpads = await createItem(
    "Crimson Combatant's Wildercloth Shoulderpads",
    "inv_cloth_dragonquest_b_01_shoulder",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Cloth",
    "Shoulder",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsWilderclothTreads = await createItem(
    "Crimson Combatant's Wildercloth Treads",
    "inv_cloth_dragonquest_b_01_boot",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Cloth",
    "Feet",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsWilderclothTunic = await createItem(
    "Crimson Combatant's Wildercloth Tunic",
    "inv_cloth_dragonquest_b_01_torso",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Cloth",
    "Chest",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );

  const amiceOfTheBlue = await createItem(
    "Amice of the Blue",
    "inv_shoulder_cloth_dragondungeon_c_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Your damaging spells and abilities have a chance to trigger a burst of Arcane energy at the target's location, dealing 11389-14178 Arcane damage (based on quality) split between nearby enemies.",
    null,
    "Cloth",
    "Shoulder",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      ["Critical Strike", 194, "?", "?", "?", 206],
      ["Mastery", 275, "?", "?", "?", 292],
    ]
  );
  const azureweaveMantle = await createItem(
    "Azureweave Mantle",
    "inv_cloth_dragonquest_b_01_shoulder",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Azureweave Vestments set (Azureweave Robe, Azureweave Slippers, Azureweave Mantle). 2 Set: Dealing damage has a chance to grant Piercing Azureweave, increasing Intellect for 8 sec. Healing has a chance to grant Flowing Azureweave, reducing the Mana cost of spells for 8 sec.",
    null,
    "Cloth",
    "Shoulder",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      ["Haste", 174, "?", "?", "?", 185],
      ["Mastery", 295, "?", "?", "?", 313],
    ]
  );
  const azureweaveRobe = await createItem(
    "Azureweave Robe",
    "inv_cloth_dragonquest_b_01_torso",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Azureweave Vestments set (Azureweave Robe, Azureweave Slippers, Azureweave Mantle). 2 Set: Dealing damage has a chance to grant Piercing Azureweave, increasing Intellect for 8 sec. Healing has a chance to grant Flowing Azureweave, reducing the Mana cost of spells for 8 sec.",
    null,
    "Cloth",
    "Chest",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      ["Versatility", 197, "?", "?", "?", 209],
      ["Mastery", 429, "?", "?", "?", 455],
    ]
  );
  const azureweaveSlippers = await createItem(
    "Azureweave Slippers",
    "inv_cloth_dragonquest_b_01_boot",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Azureweave Vestments set (Azureweave Robe, Azureweave Slippers, Azureweave Mantle). 2 Set: Dealing damage has a chance to grant Piercing Azureweave, increasing Intellect for 8 sec. Healing has a chance to grant Flowing Azureweave, reducing the Mana cost of spells for 8 sec.",
    null,
    "Cloth",
    "Feet",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      ["Critical Strike", 188, "?", "?", "?", 199],
      ["Mastery", 282, "?", "?", "?", 299],
    ]
  );
  const blueDragonSoles = await createItem(
    "Blue Dragon Soles",
    "inv_cloth_dragonquest_b_01_boot",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Every 2 seconds you spend moving increases your Intellect by 169-185 (based on quality), stacking up to 5 times. Casting a spell will consume all stacks of Intellect.",
    null,
    "Cloth",
    "Feet",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      ["Versatility", 218, "?", "?", "?", 231],
      ["Mastery", 251, "?", "?", "?", 267],
    ]
  );

  const infuriousBindingOfGesticulation = await createItem(
    "Infurious Binding of Gesticulation",
    "inv_cloth_dragonpvp_d_01_belt",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Gladiator's Distinction reduces the duration of incoming crowd control effects by an additional 5%. Increases item level to 424 in Arenas and Battlegrounds.",
    null,
    "Cloth",
    "Waist",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      ["Versatility", 302, "?", "?", "?", 320],
      ["Mastery", 168, "?", "?", "?", 178],
    ]
  );
  const alliedWristguardsOfTimeDilation = await createItem(
    "Allied Wristguards of Time Dilation",
    "inv_cloth_raidmageprimalist_d_01_bracer",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to rally you and your 4 closest allies withing 30 yards to victory for 10 sec, increasing Versatility by 191/?/?/205/211. (based on quality)",
    null,
    "Cloth",
    "Wrist",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("stamina", "small"),
      ["Versatility", 181, "?", "?", "?", 192],
      ["Mastery", 171, "?", "?", "?", 181],
    ]
  );
  const chronoclothGloves = await createItem(
    "Chronocloth Gloves",
    "inv_cloth_dragonquest_b_01_glove",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Woven Chronocloth set (Chronocloth Gloves, Chronocloth Leggings, Chronocloth Sash). 2 Set: Your spells and abilities have a chance to store away moments of time. Upon reaching 20 stacks, release your stored time and gain a burst of Haste.",
    null,
    "Cloth",
    "Hands",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      ["Haste", 282, "?", "?", "?", 299],
      ["Versatility", 188, "?", "?", "?", 199],
    ]
  );
  const chronoclothLeggings = await createItem(
    "Chronocloth Leggings",
    "inv_cloth_dragonquest_b_01_pant",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Woven Chronocloth set (Chronocloth Gloves, Chronocloth Leggings, Chronocloth Sash). 2 Set: Your spells and abilities have a chance to store away moments of time. Upon reaching 20 stacks, release your stored time and gain a burst of Haste.",
    null,
    "Cloth",
    "Legs",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      ["Critical Strike", 201, "?", "?", 210, 213],
      ["Haste", 4255, "?", "?", 443, 451],
    ]
  );
  const chronoclothSash = await createItem(
    "Chronocloth Sash",
    "inv_cloth_dragonquest_b_01_belt",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Woven Chronocloth set (Chronocloth Gloves, Chronocloth Leggings, Chronocloth Sash). 2 Set: Your spells and abilities have a chance to store away moments of time. Upon reaching 20 stacks, release your stored time and gain a burst of Haste.",
    null,
    "Cloth",
    "Waist",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      ["Haste", "?", "?", "?", 318, 324],
      ["Mastery", "?", "?", "?", 171, 174],
    ]
  );
  const hoodOfSurgingTime = await createItem(
    "Hood of Surging Time",
    "inv_helm_cloth_dragondungeon_c_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Damaging a new enemy grants you 165-183 Haste (based on quality) for 10 sec, up to 5 stacks.",
    null,
    "Cloth",
    "Head",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      ["Haste", 317, "?", "?", 331, 337],
      ["Versatility", 308, "?", "?", 322, 327],
    ]
  );

  const infuriousLegwrapsOfPossibility = await createItem(
    "Infurious Legwraps of Possibility",
    "inv_cloth_dragonpvp_d_01_pant",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "After recovering from a loss of control effect, you become empowered with possibility, increasing your Haste by 517-548 (based on quality) for 10 sec. This effect may only occur once every 30 sec. Increase item level to 424 in Arenas and Battlegrounds.",
    null,
    "Cloth",
    "Legs",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      ["Haste", 188, "?", "?", 196, 199],
      ["Versatility", 438, "?", "?", 457, 465],
    ]
  );
  const dragonclothTailoringVestments = await createItem(
    "Dragoncloth Tailoring Vestments",
    "inv_chest_armor_tailoringrobe_b_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "You have a chance to occasionally find cloth on Dragonkin in the Dragon Isles.",
    null,
    "Tailoring Accessory",
    "Chest",
    "Chest (1)",
    [372, 378, 384, 391, 398],
    [
      ["Skill", "", "", "", ""],
      [10, 10, 10, 10, 10],
    ],
    [
      ["Inspiration", 53, "?", "?", 67, 73],
      ["Multicraft", 35, "?", "?", 44, 49],
    ]
  );
  const mastersWilderclothAlchemistsRobe = await createItem(
    "Master's Wildercloth Alchemist's Robe",
    "inv_armor_alchemy_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Alchemy Accessory",
    "Chest",
    "Chest (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Resourcefulness", 25, "?", "?", 32, "?"],
      ["Crafting Speed", 38, "?", "?", 48, "?"],
    ]
  );
  const mastersWilderclothChefsHat = await createItem(
    "Master's Wildercloth Chef's Hat",
    "inv_helm_armor_chefhat_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cooking Accessory",
    "Head",
    "Head (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [4, 4, 4, 4, 4],
    ],
    [
      ["Crafting Speed", 38, "?", "?", 48, "?"],
      ["Multicraft", 25, "?", "?", 32, "?"],
    ]
  );
  const mastersWilderclothEnchantersHat = await createItem(
    "Master's Wildercloth Enchanter's Hat",
    "inv_helm_armor_enchantinghat_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Enchanting Accessory",
    "Head",
    "Head (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Inspiration", 45, "?", "?", 56, "?"],
      ["Resourcefulness", 19, "?", "?", 24, "?"],
    ]
  );
  const mastersWilderclothFishingCap = await createItem(
    "Master's Wildercloth Fishing Cap",
    "inv_helm_armor_fishing_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Fishing Accessory",
    "Head",
    null,
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ]
  );
  const mastersWilderclothGardeningHat = await createItem(
    "Master's Wildercloth Gardening Hat",
    "inv_helm_armor_herbalism_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Herbalism Accessory",
    "Head",
    "Head (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Deftness", 32, 34, "?", 40, 44],
      ["Perception", 32, 34, "?", 40, 44],
    ]
  );
  const wilderclothEnchantersHat = await createItem(
    "Wildercloth Enchanter's Hat",
    "inv_helm_armor_enchantinghat_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Enchanting Accessory",
    "Head",
    "Head (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Inspiration", 32, "?", "?", "?", 45],
      ["Resourcefulness", 14, "?", "?", "?", 19],
    ]
  );
  const wilderclothAlchemistsRobe = await createItem(
    "Wildercloth Alchemist's Robe",
    "inv_armor_alchemy_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Alchemy Accessory",
    "Chest",
    "Chest (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Resourcefulness", 18, "?", "?", "?", 25],
      ["Crafting Speed", 28, "?", "?", "?", 38],
    ]
  );
  const wilderclothFishingCap = await createItem(
    "Wildercloth Fishing Cap",
    "inv_helm_armor_fishing_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Fishing Accessory",
    "Head",
    null,
    [320, 326, 332, 339, 346],
    [
      ["Skill", "", "", "", ""],
      [4, 4, 4, 4, 4],
    ]
  );
  const wilderclothChefsHat = await createItem(
    "Wildercloth Chef's Hat",
    "inv_helm_armor_chefhat_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Cooking Accessory",
    "Head",
    "Head (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Crafting Speed", 28, "?", "?", "?", 38],
      ["Multicraft", 18, "?", "?", "?", 25],
    ]
  );
  const wilderclothGardeningHat = await createItem(
    "Wildercloth Gardening Hat",
    "inv_helm_armor_herbalism_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Herbalism Accessory",
    "Head",
    "Head (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Deftness", 23, 25, "?", "?", 32],
      ["Perception", 23, 25, "?", "?", 32],
    ]
  );
  const wilderclothTailorsCoat = await createItem(
    "Wildercloth Tailor's Coat",
    "inv_chest_armor_tailoringrobe_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Tailoring Accessory",
    "Chest",
    "Chest (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Inspiration", 28, "?", "?", "?", 38],
      ["Multicraft", 18, "?", "?", "?", 25],
    ]
  );
  const frozenSpellthread = await createItem(
    "Frozen Spellthread",
    "inv_10_tailoring_craftingoptionalreagent_enhancedspellthread_color2",
    null,
    50,
    null,
    "Spellthread = Leg enchant for Int users.",
    "Epic",
    "Crafting Reagent",
    3,
    null,
    null,
    "Apply Frozen Spellthread to your leggings, permanently increasing its Intellect by 99/121/142 (based on quality) and stamina by 74/90/106."
  );
  const temporalSpellthread = await createItem(
    "Temporal Spellthread",
    "inv_10_tailoring_craftingoptionalreagent_enhancedspellthread_color1",
    null,
    50,
    null,
    "Spellthread = Leg enchant for Int users.",
    "Epic",
    "Crafting Reagent",
    3,
    null,
    null,
    "Apply Temporal Spellthread to your leggings, permanently increasing its Intellect by 99/121/142 (based on quality) and mana by 3%/4%/5%."
  );
  const vibrantSpellthread = await createItem(
    "Vibrant Spellthread",
    "inv_10_tailoring_craftingoptionalreagent_enhancedspellthread_color3",
    null,
    1000,
    null,
    "Spellthread = Leg enchant for Int users.",
    "Rare",
    "Crafting Reagent",
    3,
    null,
    null,
    "Apply Vibrant Spellthread to your leggings, permanently increasing its Intellect by 59/72/85. (based on quality)"
  );
  const azureweaveExpeditionPack = await createItem(
    "Azureweave Expedition Pack",
    "inv_10_tailoring_bag2_color2",
    "Equip",
    1,
    "34 Slot Bag",
    null,
    "Rare"
  );
  const chronoclothReagentBag = await createItem(
    "Chronocloth Reagent Bag",
    "inv_10_tailoring_bag1_color4",
    "Equip",
    1,
    "36 Slot Reagent Bag",
    null,
    "Rare"
  );
  const wilderclothBag = await createItem(
    "Wildercloth Bag",
    "inv_misc_bag_35",
    "Equip",
    1,
    "32 Slot Bag",
    null,
    "Uncommon"
  );
  const simplyStitchedReagentBag = await createItem(
    "Simply Stitched Reagent Bag",
    "inv_10_tailoring_bag2_color2",
    "Equip",
    1,
    "32 Slot Reagent Bag",
    null,
    "Rare"
  );
  const explorersBannerOfGeology = await createItem(
    "Explorer's Banner of Geology",
    "inv_10_tailoring2_banner_red",
    "Use",
    1,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Place a banner that increases damage done to all Earth and Fire Elementals within 100 yards by 50%/75%/100% (based on quality). Also grants 18/24/30 Deftness and Finesse to Miners. Lasts 10 min. Only usable in the Dragon Isles. (10 Min Cooldown)",
    null,
    null,
    null,
    null,
    null,
    null,
    { Mining: 1 }
  );
  const explorersBannerOfHerbology = await createItem(
    "Explorer's Banner of Herbology",
    "inv_10_tailoring2_banner_green",
    "Use",
    1,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Place a banner that increases damage done to all Air and Frost Elementals within 100 yards by 50%/75%/100% (based on quality). Also grants 18/24/30 Deftness and Finesse to Herbalists. Lasts 10 min. Only usable in the Dragon Isles. (10 Min Cooldown)",
    null,
    null,
    null,
    null,
    null,
    null,
    { Herbalism: 1 }
  );
  const duckStuffedDuckLovie = await createItem(
    "Duck-Stuffed Duck Lovie",
    "inv_duckbaby_white",
    null,
    1,
    null,
    null,
    "Rare",
    "Toy",
    null,
    null,
    null,
    "Adds this toy to your Toy Box. Take a nap with your favorite duckie. (10 Min Cooldown)"
  );
  const forlornFuneralPall = await createItem(
    "Forlorn Funeral Pall",
    "item_embercloth",
    null,
    1,
    "A small token of respect for the recently deceased.",
    null,
    "Rare",
    "Toy",
    null,
    null,
    null,
    "Adds this toy to your Toy Box. Cover the recently deceased in a mourning cloth. (10 Min Cooldown)"
  );
  const dragonscaleExpeditionsExpeditionTent = await createItem(
    "Dragonscale Expedition's Expedition Tent",
    "inv_10_tailoring2_tent_color5",
    null,
    1,
    null,
    null,
    "Rare",
    "Toy",
    null,
    null,
    null,
    "Adds this toy to your Toy Box. Place a Dragonscale Expedition's Expedition Tent to excel on every expedition. (10 Min Cooldown)"
  );
  const coldCushion = await createItem(
    "Cold Cushion",
    "inv_10_tailoring2_pillow_blue",
    null,
    1,
    "Use after rough wipes.",
    null,
    "Rare",
    "Toy",
    null,
    null,
    null,
    "Adds this toy to your Toy Box. Place a cooling cushion to soothe a rough wipe. (6 Hr Cooldown)"
  );
  const cushionOfTimeTravel = await createItem(
    "Cushion of Time Travel",
    "inv_10_tailoring2_pillow_yellow",
    null,
    1,
    "It only goes forward. Slowly.",
    null,
    "Rare",
    "Toy",
    null,
    null,
    null,
    "Adds this toy to your Toy Box. Place a time-traveling cushion that can be sat on and moves through time for 5 min. (6 Hrs Cooldown)"
  );
  const marketTent = await createItem(
    "Market Tent",
    "inv_10_tailoring2_tent_color1",
    null,
    1,
    "Set up shop to peddle your wares, or just relax under the awning.",
    null,
    "Rare",
    "Toy",
    null,
    null,
    null,
    "Adds this toy to your Toy Box. Place a market tent to shop and relax under. (10 Min Cooldown)"
  );

  //engineering items
  const reinforcedMachineChassis = await createItem(
    "Reinforced Machine Chassis",
    "inv_10_engineering_manufacturedparts_mechanicalparts_color3",
    null,
    1000,
    "A critical component for the most advanced Engineering devices. Can be bought and sold on the auction house.",
    "Rarest Engi material. Requires a lot of stuff to craft.",
    "Common",
    "Crafting Reagent",
    3
  );
  const arclightCapacitor = await createItem(
    "Arclight Capacitor",
    "inv_10_engineering_manufacturedparts_electricalparts_color1",
    null,
    1000,
    "A critical component for the most advanced Engineering devices. Can be bought and sold on the auction house.",
    "Rarer Engi material. Requires Greased-Up Gears & Shock-Spring Coils to craft.",
    "Common",
    "Crafting Reagent",
    3
  );
  const assortedSafetyFuses = await createItem(
    "Assorted Safety Fuses",
    "inv_10_engineering_manufacturedparts_electricalparts_color4",
    null,
    1000,
    "A critical component when creating Engineering bombs intended for people with careless hands. Can be bought and sold on the auction house.",
    "Material used to craft EZ-Thro Bombs (bombs that can be used by non-engineers)",
    "Common",
    "Crafting Reagent",
    3
  );
  const everburningBlastingPowder = await createItem(
    "Everburning Blasting Powder",
    "inv_10_enchanting_dust_color1",
    null,
    1000,
    "A commonly used part primarily for explosive Engineering crafts. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent",
    3
  );
  const greasedUpGears = await createItem(
    "Greased-Up Gears",
    "inv_10_engineering_manufacturedparts_gear_uprez",
    null,
    1000,
    "A commonly used part for many complicated Engineering devices. Can be bought and sold on the auction house.",
    "Common engineering material.",
    "Common",
    "Crafting Reagent",
    3
  );
  const shockSpringCoil = await createItem(
    "Shock-Spring Coil",
    "inv_10_engineering_manufacturedparts_spring_uprez",
    null,
    1000,
    "A commonly used part for a variety of Engineering crafts. Can be bought and sold on the auction house.",
    "Common engineering material.",
    "Common",
    "Crafting Reagent",
    3
  );
  const handfulOfSereviteBolts = await createItem(
    "Handful of Serevite Bolts",
    "inv_10_engineering_manufacturedparts_gizmo_fireironbolts_blue",
    null,
    1000,
    "A commonly used part for a variety of Engineering crafts. Can be bought and sold on the auction house.",
    "The most basic engineering material. Used to make just about everything else.",
    "Common",
    "Crafting Reagent",
    3
  );
  const pieceOfScrap = await createItem(
    "Piece of Scrap",
    "inv_misc_wartornscrap_plate",
    "Pickup",
    1000,
    "Specialized engineers can sometimes recover a Piece of Scrap when using bombs or tinkers. They can sift through piles of these in search of usable materials or other goodies. Unique (25)",
    "Received when 'Rummaging Through Scrap' (learned through a specialization)",
    "Common"
  );
  const overchargedOverclocker = await createItem(
    "Overcharged Overclocker",
    "inv_engineering_90_lightningbox",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Spare Parts"],
    "When crafting: Increases your Resourcefulness by 33/44/55 (based on quality) and Inspiration by 30/40/50."
  );
  const haphazardlyTetheredWires = await createItem(
    "Haphazardly Tethered Wires",
    "inv_10_engineering_manufacturedparts_spring_frost",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Spare Parts"],
    "When crafting: When crafting: You are 9/12/15% more likely (based on quality) to improve at Engineering, but Recipe Difficulty is increased by 18/24/30."
  );
  const calibratedSafetySwitch = await createItem(
    "Calibrated Safety Switch",
    "inv_eng_metalblingronear",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Safety Components"],
    "+20/15/10 Recipe Difficulty (based on quality). Provides the following property: Reduces the likelihood of this device's tinker malfunctioning by 15%."
  );
  const criticalFailurePreventionUnit = await createItem(
    "Critical Failure Prevention Unit",
    "inv_eng_superchargedengine",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Safety Components"],
    "+20/15/10 Recipe Difficulty (based on quality). Provides the following property: Tinkers slotted into this device can no longer catastrophically malfunction."
  );
  const magazineOfHealingDarts = await createItem(
    "Magazine of Healing Darts",
    "inv_gizmo_runichealthinjector",
    null,
    200,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Embellishment"],
    "+35/30/25 Recipe Difficulty (based on quality). When you heal you sometimes fire a Healing Dart. Also add Unique-Equipped: Embellished (2)."
  );
  const springLoadedCapacitorCasing = await createItem(
    "Spring-Loaded Capacitor Casing",
    "inv_eng_superchargedengine",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Safety Components"],
    "+20/15/10 Recipe Difficulty (based on quality). The tinker slotted within this device will sometimes dislodge the battery instead of malfunctioning."
  );
  const tinkerAlarmOTurret = await createItem(
    "Tinker: Alarm-O-Turret",
    "inv_10_engineering2_tinkermodules_color1",
    null,
    200,
    null,
    null,
    "Rare",
    "Tinker Module",
    3,
    ["Tinker"],
    "Place a hidden Alarm-O-Turret on a nearby targeted location. If an enemy player enters its detection radius, it will alert you of their presence and attempt to defend the area for 30 sec or until destroyed."
  );
  const tinkerArclightVitalCorrectors = await createItem(
    "Tinker: Arclight Vital Correctors",
    "inv_10_engineering_device_gadget1_color2",
    null,
    200,
    null,
    "Battle Rez Tinker!",
    "Rare",
    "Tinker Module",
    3,
    ["Tinker"],
    "Carelessly cross a few frayed wires within the vicinity of a fallen ally in a desperate attempt to jolt them back to life with 60% health and 20% mana. Castable in combat. What could possibly go wrong?Cannot be used by players higher than level 70."
  );
  const tinkerPolarityAmplifier = await createItem(
    "Tinker: Polarity Amplifier",
    "inv_10_engineering2_tinkermodules_color4",
    null,
    200,
    null,
    null,
    "Rare",
    "Tinker Module",
    3,
    ["Tinker"],
    "Grants a magnetic charge that changes periodically. Aim a magnet toward an enemy player. If your polarities are opposite, you both will be rooted for 6 sec. If they are identical, you both will be repelled away from each other. Your target must have also have a magnetic charge."
  );
  const tinkerSupercollideOTron = await createItem(
    "Tinker: Supercollide-O-Tron",
    "inv_10_engineering2_tinkermodules_color5",
    null,
    200,
    null,
    null,
    "Rare",
    "Tinker Module",
    3,
    ["Tinker"],
    "Lock on to a distant enemy target, up to 12 to 60 yds away. After 1.5 sec, if your path remains unobstructed, you will charge toward them at the speed of sound. Both you and your target will be stunned for 1.5 sec upon collision."
  );
  const tinkerGroundedCircuitry = await createItem(
    "Tinker: Grounded Circuitry",
    "inv_10_engineering2_tinkermodules_color2",
    null,
    200,
    null,
    null,
    "Rare",
    "Tinker Module",
    3,
    ["Tinker"],
    "Guarantees the next slotted Tinker use to succeed. The cooldown of this effect is reduced at higher qualities."
  );
  const tinkerBreathOfNeltharion = await createItem(
    "Tinker: Breath of Neltharion",
    "inv_10_engineering2_tinkermodules_color3",
    null,
    200,
    null,
    null,
    "Rare",
    "Tinker Module",
    3,
    ["Tinker"],
    "Reveal a flamethrower to deal 69,335 Fire damage in a cone in front of you for 6 sec."
  );
  const tinkerPlaneDisplacer = await createItem(
    "Tinker: Plane Displacer",
    "inv_10_engineering2_tinkermodules_color6",
    null,
    200,
    null,
    null,
    "Rare",
    "Tinker Module",
    3,
    ["Tinker"],
    "Grants the user invisibility for 12-18 sec."
  );
  const battleReadyBinoculars = await createItem(
    "Battle-Ready Binoculars",
    "inv_helm_armor_engineering_b_02_goblin",
    "Pickup",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Head",
    null,
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      ["Random Stat 1", 616, 633, "?", "?", 664],
      ["Tinker Socket", null, null, null, null, null],
    ],
    { Engineering: 1 }
  );
  const lightweightOcularLenses = await createItem(
    "Lightweight Ocular Lenses",
    "inv_helm_armor_engineering_b_02_goblin",
    "Pickup",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Head",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      ["Random Stat 1", 616, 633, "?", "?", 664],
      ["Tinker Socket", null, null, null, null, null],
    ],
    { Engineering: 1 }
  );
  const oscillatingWildernessOpticals = await createItem(
    "Oscillating Wilderness Opticals",
    "inv_helm_armor_engineering_b_02_goblin",
    "Pickup",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Head",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      ["Random Stat 1", 616, 633, "?", "?", 664],
      ["Tinker Socket", null, null, null, null, null],
    ],
    { Engineering: 1 }
  );
  const peripheralVisionProjectors = await createItem(
    "Peripheral Vision Projectors",
    "inv_helm_armor_engineering_b_02_goblin",
    "Pickup",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Head",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      ["Random Stat 1", 616, 633, "?", "?", 664],
      ["Tinker Socket", null, null, null, null, null],
    ],
    { Engineering: 1 }
  );
  const deadlineDeadeyes = await createItem(
    "Deadline Deadeyes",
    "inv_helm_armor_engineering_b_02_gnome",
    "Equip",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Head",
    null,
    [306, 308, 310, 313, 316],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayBaby("large")],
    [
      secondaryStatArrayBaby("stamina", "large"),
      ["Haste", 111, "?", "?", "?", 130],
      ["Mastery", 86, "?", "?", "?", 100],
      ["Tinker Socket", null, null, null, null, null],
    ],
    { Engineering: 1 }
  );
  const milestoneMagnifiers = await createItem(
    "Milestone Magnifiers",
    "inv_helm_armor_engineering_b_02_gnome",
    "Equip",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Head",
    null,
    [306, 308, 310, 313, 316],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayBaby("large")],
    [
      secondaryStatArrayBaby("stamina", "large"),
      ["Critical Strike", 111, "?", "?", "?", 130],
      ["Versatility", 86, "?", "?", "?", 100],
      ["Tinker Socket", null, null, null, null, null],
    ],
    { Engineering: 1 }
  );
  const qualityAssuredOptics = await createItem(
    "Quality-Assured Optics",
    "inv_helm_armor_engineering_b_02_gnome",
    "Equip",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cloth",
    "Head",
    null,
    [306, 308, 310, 313, 316],
    [["Intellect", "", "", "", ""], primaryStatArrayBaby("large")],
    [
      secondaryStatArrayBaby("stamina", "large"),
      ["Haste", 102, "?", "?", "?", 120],
      ["Mastery", 94, "?", "?", "?", 110],
      ["Tinker Socket", null, null, null, null, null],
    ],
    { Engineering: 1 }
  );
  const sentrysStabilizedSpecs = await createItem(
    "Sentry's Stabilized Specs",
    "inv_helm_armor_engineering_b_02_gnome",
    "Equip",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Head",
    null,
    [306, 308, 310, 313, 316],
    [["Intellect", "Strength", "", "", ""], primaryStatArrayBaby("large")],
    [
      secondaryStatArrayBaby("stamina", "large"),
      ["Critical Strike", 111, "?", "?", "?", 130],
      ["Mastery", 86, "?", "?", "?", 100],
      ["Tinker Socket", null, null, null, null, null],
    ],
    { Engineering: 1 }
  );
  const complicatedCuffs = await createItem(
    "Complicated Cuffs",
    "inv_mail_dragonquest_b_01_bracer",
    "Pickup",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Wrist",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("stamina", "small"),
      ["Random Stat 1", 352, 356, "?", "?", 373],
      ["Tinker Socket", null, null, null, null, null],
    ]
  );
  const difficultWristProtectors = await createItem(
    "Difficult Wrist Protectors",
    "inv_bracer_plate_dragonquest_b_01",
    "Pickup",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Wrist",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "Strength", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("stamina", "small"),
      ["Random Stat 1", 352, 356, "?", "?", 373],
      ["Tinker Socket", null, null, null, null, null],
    ]
  );
  const needlesslyComplexWristguards = await createItem(
    "Needlessly Complex Wristguards",
    "inv_leather_dragonquest_b_01_bracer",
    "Pickup",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Wrist",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("stamina", "small"),
      ["Random Stat 1", 352, 356, "?", "?", 373],
      ["Tinker Socket", null, null, null, null, null],
    ]
  );
  const overengineeredSleeveExtenders = await createItem(
    "Overengineered Sleeve Extenders",
    "inv_cloth_dragonquest_b_01_bracer",
    "Pickup",
    1,
    null,
    "IF YOU HAVE GEAR 0: Crafting this may give you a recipe for Bracers.",
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Wrist",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("stamina", "small"),
      ["Random Stat 1", 352, 356, "?", "?", 373],
      ["Tinker Socket", null, null, null, null, null],
    ]
  );
  const sophisticatedProblemSolver = await createItem(
    "Sophisticated Problem Solver",
    "inv_firearm_2h_engineering_c_01_orange",
    "Pickup",
    1,
    null,
    "Crafting this may give you a recipe for Bracers.",
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Gun",
    "Ranged",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const pewTwo = await createItem(
    "P.E.W. x2",
    "inv_firearm_2h_engineering_c_01_blue",
    "Pickup",
    1,
    null,
    "Crafting this may give you a recipe for Bracers.",
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Gun",
    "Ranged",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const meticulouslyTunedGear = await createItem(
    "Meticulously-Tuned Gear",
    "inv_10_engineering_purchasedparts_color2",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Cogwheel"],
    "+35/25/15 Recipe Difficulty (based on quality.) Provides the following property: Allocate the secondary stats of Engineering crafted goggles or bracers to Mastery."
  );
  const oneSizeFitsAllGear = await createItem(
    "One-Size-Fits-All Gear",
    "inv_10_engineering_purchasedparts_color4",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Cogwheel"],
    "+35/25/15 Recipe Difficulty (based on quality.) Provides the following property: Allocate the secondary stats of Engineering crafted goggles or bracers to Versatility."
  );
  const rapidlyTickingGear = await createItem(
    "Rapidly Ticking Gear",
    "inv_10_engineering_purchasedparts_color3",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Cogwheel"],
    "+35/25/15 Recipe Difficulty (based on quality.) Provides the following property: Allocate the secondary stats of Engineering crafted goggles or bracers to Haste."
  );
  const razorSharpGear = await createItem(
    "Razor-Sharp Gear",
    "inv_10_engineering_purchasedparts_color5",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Cogwheel"],
    "+35/25/15 Recipe Difficulty (based on quality.) Provides the following property: Allocate the secondary stats of Engineering crafted goggles or bracers to Critical Strike."
  );
  const highIntensityThermalScanner = await createItem(
    "High Intensity Thermal Scanner",
    "inv_10_engineering_scope_color4",
    null,
    200,
    null,
    "Weapon enchantment for Bow/Crossbow/Gun.",
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants a ranged weapon to sometimes increase a secondary stat by 1,220-1,559 (based on quality) based upon the type of creature you are attacking."
  );
  const projectilePropulsionPinion = await createItem(
    "Projectile Propulsion Pinion",
    "inv_10_engineering_scope_color3",
    null,
    200,
    null,
    "Weapon enchantment for Bow/Crossbow/Gun.",
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants a ranged weapon to grant 255/382/545 (based on quality) split between your highest and lowest secondary stats after you stand still for 5 sec. (based on quality)"
  );
  const completelySafeRockets = await createItem(
    "Completely Safe Rockets",
    "inv_ammo_bullet_04",
    null,
    200,
    null,
    "Ammo - 60 minute consumable for Hunters. Kinda like a Phial/Flask. Unsure if it goes away on death.",
    "Uncommon",
    null,
    3,
    null,
    null,
    "Throw in a seemingly endless supply of tiny rockets into your quiver. Your auto-attacks have a chance to fire one of these rockets which explodes on impact to deal 2350/2866/3358 (based on quality) Fire damage in a small radius around the target. Lasts 60 min."
  );
  const endlessStackOfNeedles = await createItem(
    "Endless Stack of Needles",
    "inv_ammo_bullet_04",
    null,
    200,
    null,
    "Ammo - 60 minute consumable for Hunters. Kinda like a Phial/Flask. Unsure if it goes away on death.",
    "Uncommon",
    null,
    3,
    null,
    null,
    "Replace your traditional ammunition with sharp needles that cause your auto-attacks to also apply a bleed to the target which deals 564/687/806 (based on quality) Physical damage every 2 sec. Lasts 60 min."
  );
  const gyroscopicKaleidoscope = await createItem(
    "Gyroscopic Kaleidoscope",
    "inv_10_engineering_scope_color2",
    null,
    200,
    null,
    "Weapon enchantment for Bow/Crossbow/Gun.",
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchant a ranged weapon with a whimsical scope that grants you 290/304/371 (based on quality) of a random secondary stat for 30 sec every time you jump."
  );
  const blackFireflight = await createItem(
    "Black Fireflight",
    "inv_misc_missilelarge_purple",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Shoot a set of fireworks honoring the Black Dragonflight."
  );
  const blueFireflight = await createItem(
    "Blue Fireflight",
    "inv_misc_missilelarge_blue",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Shoot a set of fireworks honoring the Blue Dragonflight."
  );
  const bundleOfFireworks = await createItem(
    "Bundle of Fireworks",
    "inv_enchanting_wod_crystalbundle",
    "Pickup",
    1,
    "Contains an assortment of fireworks across many eras and from many cultures.",
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Right Click to Open"
  );
  const greenFireflight = await createItem(
    "Green Fireflight",
    "inv_misc_missilelarge_green",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Shoot a set of fireworks honoring the Green Dragonflight."
  );
  const redFireflight = await createItem(
    "Red Fireflight",
    "inv_misc_missilelarge_red",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Shoot a set of fireworks honoring the Red Dragonflight."
  );
  const bronzeFireflight = await createItem(
    "Bronze Fireflight",
    "inv_misc_missilelarge_yellow",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Shoot a set of fireworks honoring the Bronze Dragonflight."
  );
  const suspiciouslySilentCrate = await createItem(
    "Suspiciously Silent Crate",
    "inv_10_engineering2_boxofbombs_friendly_color3",
    "Pickup",
    1,
    "Contains an assortment of Ez-Thro Bombs.",
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Right Click to Open"
  );
  const suspiciouslyTickingCrate = await createItem(
    "Suspiciously Ticking Crate",
    "inv_10_engineering2_boxofbombs_dangerous_color1",
    "Pickup",
    1,
    "Contains an assortment of dangerous bombs.",
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Right Click to Open"
  );
  const iwinButtonMkTen = await createItem(
    "I.W.I.N. Button Mk10",
    "inv_10_engineering_device_gadget1_color1",
    "Pickup",
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Press the button to call in an air strike at the designated location, dealing 152,608/177,878/207,295 (based on quality) Fire damage to all enemies in the strike zone. Only usable outdoors.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Engineering: 1 }
  );
  const ezThroGreaseGrenade = await createItem(
    "EZ-Thro Grease Grenade",
    "inv_10_engineering_explosives_1_color3",
    null,
    200,
    "So EZ that even non-Engineers can use it!",
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Launch a concealed grenade toward the target location, dealing 8645/10170/11696 (based on quality) Nature damage and coating the ground in a sticky substance for 6 sec that slows enemy units within by 75%. (5 Min Cooldown)"
  );
  const ezThroCreatureCombustionCanister = await createItem(
    "EZ-Thro Creature Combustion Canister",
    "inv_10_engineering_explosives_1_color1",
    null,
    200,
    "So EZ that even non-Engineers can use it!",
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Throw the canister, exploding the nearest meaty corpse into chunks of meat. Only usable outdoors. (5 Min Cooldown)"
  );
  const ezThroGravitationalDisplacer = await createItem(
    "EZ-Thro Gravitational Displacer",
    "inv_10_engineering_device_gadget2_color3",
    null,
    200,
    "So EZ that even non-Engineers can use it!",
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Throw the displacer and activate it after 2 sec, pulling all enemies within 10/15/20 yards (based on quality) to its location. Only usable outdoors. (5 Min Cooldown)"
  );
  const ezThroPrimalDeconstructionCharge = await createItem(
    "EZ-Thro Primal Deconstruction Charge",
    "inv_10_engineering_explosives_2_color1",
    null,
    200,
    "So EZ that even non-Engineers can use it!",
    "I'm not sure what 'moderate siege damage' entails.",
    "Uncommon",
    null,
    3,
    null,
    null,
    "Inflicts 15337/17876/20833 Fire damage (based on quality) to enemies in a 8 yard radius. This explosion is powerful enough to cause moderate siege damage. (5 Min Cooldown)"
  );
  const stickyWarpGrenade = await createItem(
    "Sticky Warp Grenade",
    "inv_10_engineering_explosives_1_color1",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Throw at a location, attaching itself to the surface or a nearby enemy. Detonates after 3 sec, swapping your position with itself and any attached enemy. Item quality affects the distance this can be thrown. Only usable outdoors. (5 Min Cooldown)",
    null,
    null,
    null,
    null,
    null,
    null,
    { Engineering: 1 }
  );
  const greaseGrenade = await createItem(
    "Grease Grenade",
    "inv_10_engineering_explosives_1_color3",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Launch a concealed grenade toward the target location, dealing 8645/10170/11696 (based on quality) Nature damage and coating the ground in a sticky substance for 6 sec that slows enemy units within by 75%. (5 Min Cooldown)",
    null,
    null,
    null,
    null,
    null,
    null,
    { Engineering: 1 }
  );
  const gravitationalDisplacer = await createItem(
    "Gravitational Displacer",
    "inv_10_engineering_device_gadget2_color3",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Throw the displacer and activate it after 2 sec, pulling all enemies within 10/15/20 yards (based on quality) to its location. Only usable outdoors. (5 Min Cooldown)",
    null,
    null,
    null,
    null,
    null,
    null,
    { Engineering: 1 }
  );
  const primalDeconstructionCharge = await createItem(
    "Primal Deconstruction Charge",
    "inv_10_engineering_explosives_2_color1",
    null,
    200,
    null,
    "I'm not sure what 'moderate siege damage' entails.",
    "Uncommon",
    null,
    3,
    null,
    null,
    "Inflicts 15337/17876/20833 Fire damage (based on quality) to enemies in a 8 yard radius. This explosion is powerful enough to cause moderate siege damage. (5 Min Cooldown)",
    null,
    null,
    null,
    null,
    null,
    null,
    { Engineering: 1 }
  );
  const creatureCombustionCanister = await createItem(
    "Creature Combustion Canister",
    "inv_10_engineering_explosives_1_color1",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Throw the canister, exploding the nearest meaty corpse into chunks of meat. Only usable outdoors. (5 Min Cooldown)",
    null,
    null,
    null,
    null,
    null,
    null,
    { Engineering: 1 }
  );
  const savior = await createItem(
    "S.A.V.I.O.R.",
    "inv_10_engineering_device_gadget1_color3",
    "Pickup",
    200,
    null,
    "Wipe protection bot.",
    "Epic",
    null,
    3,
    null,
    null,
    "Place a friendly mechanical construct on the ground nearby which will offer moral support as your companions fall around you. It will resurrect all party or raid members within a reasonable distance after combat has ended. Cast time is reduced by quality. Does not work on players whose spirits have been released, are above level 70, or have angered the robot. (5 Min Cooldown)",
    null,
    null,
    null,
    null,
    null,
    null,
    { Engineering: 1 }
  );
  const zapthrottleSoulInhaler = await createItem(
    "Zapthrottle Soul Inhaler",
    "inv_10_engineering_device_flamethrower_air",
    "Use",
    1,
    "Empty Soul Cages not included.",
    "Device used to get Elemental Souls. Requires Empty Soul Cages (from Jewelcrafters) as 'ammo'.",
    "Rare",
    null,
    1,
    null,
    null,
    "Begin draining the essence of a particularly powerful elemental. If your target dies while being drained, you will capture its soul. The device's engine will need to cool for 15 min after a successful capture. Only one player can attempt to drain an elemental's soul at a time. (30 Sec Cooldown)"
  );
  const cartomancyCannon = await createItem(
    "Cartomancy Cannon",
    "inv_weapon_rifle_19",
    "Use",
    1,
    null,
    "Requires a Fated Fortune Card (made by inscriptionists) to use.",
    "Rare",
    null,
    1,
    null,
    null,
    "Load your Cartomancy Cannon with a Fated Fortune Card and fire it toward a friendly player. Wish them luck! (30 Sec Cooldown)"
  );
  const centralizedPrecipitationEmitter = await createItem(
    "Centralized Precipitation Emitter",
    "inv_10_engineering_device_gadget3_color1",
    "Use",
    1,
    null,
    null,
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your toy box. Place down a Centralized Precipitation Emitter for up to 2 hrs that allows you to experience the fury of nature, by choice! A cloaking device attached to this machine ensures that only members of your party or raid can see the machine and its effects. Can only be used outside. (2 Hrs Cooldown)"
  );
  const elementInfusedRocketHelmet = await createItem(
    "Element-Infused Rocket Helmet",
    "ability_mount_rocketmount",
    "Use",
    1,
    null,
    null,
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your toy box. Guaranteed to propel yourself to a safe height above your surroundings! (1 Day Cooldown)"
  );
  const environmentalEmulator = await createItem(
    "Environmental Emulator",
    "inv_10_engineering_device_gadget2_color1",
    "Use",
    1,
    null,
    "Can somehow acquire environments to choose from. Wowhead shows - Icecrown, Felstorm, Twisting Nether, Peaceful Day, Calm Cyclone, Burning Skies. More info later.",
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your toy box. Place down an Environmental Emulator for up to 2 hrs that allows you to view the world from a different perspective. A cloaking device attached to this machine ensures that only members of your party or raid can see the machine and its effects. Can only be used outside. (2 Hrs Cooldown)"
  );
  const giggleGoggles = await createItem(
    "Giggle Goggles",
    "inv_gizmo_newgoggles",
    "Use",
    1,
    null,
    null,
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your toy box. Perceive the world as though it were ruled by gnolls. (1 Hour Cooldown)"
  );
  const help = await createItem(
    "H.E.L.P.",
    "inv_10_engineering2_pvpflaregun_color1",
    "Pickup",
    1,
    null,
    "Battleground signal flare??",
    "Rare",
    null,
    1,
    null,
    null,
    "Fires a signal flare to alert nearby allies of incoming danger. Can only be used in battlegrounds. Signal flares cannot be fired in a given area more than once every 3 min. (2 Min Cooldown)"
  );
  const tinkerRemovalKit = await createItem(
    "Tinker Removal Kit",
    "inv_misc_enggizmos_37",
    "Use",
    1,
    "It's just a screwdriver... Good luck!",
    null,
    "Rare",
    null,
    1,
    null,
    null,
    "Recklessly, but nonetheless effectively, remove a Tinker module from its socket for later use."
  );
  // const expeditionMultiToolbox = await createItem("Expedition Multi-Toolbox"); /* this might have been removed */
  const wyrmholeGenerator = await createItem(
    "Wyrmhole Generator",
    "inv_10_engineering_device_gadget3_color3",
    "Use",
    1,
    null,
    "While this has a 2 Hr CD (up from 15 min in SL) & teleports you to a random location now, you can improve it w/ Specializations - Mechanical Mind 20 halves the CD, & Novelties 30 allows you to find 'Signal Transmitters' across the isles, allowing you to choose where to teleport.",
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your toy box. Open a wormhole that allows the user to quickly travel to a random location in the Dragon Isles. Engineers that specialize into triangulation can learn to warp to specific locations. (2 Hrs Cooldown)",
    null,
    null,
    null,
    null,
    null,
    null,
    { Engineering: 1 }
  );
  const portableAlchemistsLabBench = await createItem(
    "Portable Alchemist's Lab Bench",
    "inv_misc_5potionbag_special",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Place down a Portable Alchemist's Lab Bench to enable nearby alchemists to practice their trade for 5 min. It probably will not explode. (5 Min Cooldown)"
  );
  const portableTinkersWorkbench = await createItem(
    "Portable Tinker's Workbench",
    "inv_engineering_sonicenvironmentenhancer",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Place down a Portable Tinker's Workbench to enable nearby engineers to practice their trade for 5 min. It probably will not explode. (5 Min Cooldown)"
  );
  const neuralSilencerMkThree = await createItem(
    "Neural Silencer Mk3",
    "inv_10_engineering_manufacturedparts_mechanicalparts_color1",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Makes you immune to some annoyances. Persists through death. Lasts 12 hrs."
  );
  const khazgoriteBrainwaveAmplifier = await createItem(
    "Khaz'gorite Brainwave Amplifier",
    "inv_helm_armor_engineering_b_01_orange",
    "Pickup",
    1,
    "WARNING: Thinking too hard may cause mindblowing effects.",
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Engineering Accessory",
    "Head",
    "Head (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [["Inspiration", 38, 41, "?", 48, 48]]
  );
  const khazgoriteDelversHelmet = await createItem(
    "Khaz'gorite Delver's Helmet",
    "inv_helm_armor_mining_a_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mining Accessory",
    "Head",
    "Head (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Deftness", 32, 34, "?", 40, 44],
      ["Perception", 32, 34, "?", 40, 44],
    ]
  );
  const khazgoriteEncasedSamophlange = await createItem(
    "Khaz'gorite Encased Samophlange",
    "inv_misc_1h_engineeringmultitool_b_01_orange",
    "Pickup",
    1,
    "A needlessly complicated omnitool coveted by any Engineer worth their bolts",
    null,
    "Rare",
    null,
    5,
    null,
    null,
    "Recklessly, but nonetheless effectively, remove a Tinker module from its socket for later use.",
    "Engineering Tool",
    null,
    null,
    [346, 352, 358, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const khazgoriteFisherfriend = await createItem(
    "Khaz'gorite Fisherfriend",
    "inv_misc_2h_fishingpole_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Fishing Tool",
    null,
    null,
    [346, 352, 358, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Perception", "Tool", "large")]
  );
  const lapidarysKhazgoriteClamps = await createItem(
    "Lapidary's Khaz'gorite Clamps",
    "inv_misc_1h_jewelerschisel_a_01",
    "Pickup",
    1,
    "Provides all the necessary tools for jewelcrafting in one convenient package.",
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Jewelcrafting Tool",
    null,
    null,
    [346, 352, 358, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const springLoadedKhazgoriteFabricCutters = await createItem(
    "Spring-Loaded Khaz'gorite Fabric Cutters",
    "inv_sword_1h_tailoring_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Tailoring Tool",
    null,
    null,
    [346, 352, 358, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const bottomlessMireslushOreSatchel = await createItem(
    "Bottomless Mireslush Ore Satchel",
    "inv_cape_special_mining_c_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mining Accessory",
    "Back",
    "Back (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [["Finesse", 64, 69, "?", 81, 88]]
  );
  const bottomlessStonecrustOreSatchel = await createItem(
    "Bottomless Stonecrust Ore Satchel",
    "inv_cape_special_mining_c_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Mining Accessory",
    "Back",
    "Back (1)",
    [320, 326, 332, 339, 346],
    null,
    [["Finesse", 46, "?", "?", "?", 64]]
  );
  const draconiumBrainwaveAmplifier = await createItem(
    "Draconium Brainwave Amplifier",
    "inv_helm_armor_engineering_b_01_orange",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Engineering Accessory",
    "Head",
    "Head (1)",
    [320, 326, 332, 339, 346],
    null,
    [["Inspiration", 28, 30, "?", "?", 38]]
  );
  const draconiumDelversHelmet = await createItem(
    "Draconium Delver's Helmet",
    "inv_helm_armor_mining_a_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Mining Accessory",
    "Head",
    "Head (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Deftness", 23, 25, "?", "?", 32],
      ["Perception", 23, 25, "?", "?", 32],
    ]
  );
  const draconiumEncasedSamophlange = await createItem(
    "Draconium Encased Samophlange",
    "inv_misc_1h_engineeringmultitool_b_01_orange",
    "Equip",
    1,
    "A needlessly complicated omnitool coveted by any Engineer worth their bolts",
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    "Recklessly, but nonetheless effectively, remove a Tinker module from its socket for later use.",
    "Engineering Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const draconiumFisherfriend = await createItem(
    "Draconium Fisherfriend",
    "inv_misc_2h_fishingpole_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Fishing Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Perception", "Tool", "medium")]
  );
  const lapidarysDraconiumClamps = await createItem(
    "Lapidary's Draconium Clamps",
    "inv_misc_1h_jewelerschisel_a_01",
    "Equip",
    1,
    "Provides all the necessary tools for jewelcrafting in one convenient package.",
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Jewelcrafting Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const springLoadedDraconiumFabricCutters = await createItem(
    "Spring-Loaded Draconium Fabric Cutters",
    "inv_sword_1h_tailoring_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Tailoring Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const quackE = await createItem(
    "Quack-E",
    "inv_duckbaby_mech",
    "Pickup",
    1,
    null,
    "Battle pet - This duck is SO cute ;_;",
    "Rare",
    null,
    1,
    null,
    null,
    "Teaches you how to summon and dismiss this companion."
  );
  const duckoy = await createItem(
    "D.U.C.K.O.Y.",
    "inv_duckbaby_mech",
    "Pickup",
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Activate a robotic duckling that wanders around, annoying your enemies before self-destructing for 20449/23835/27777 (based on quality) Fire damage split between all nearby enemies. Damage is increased for each enemy struck, up to 5 enemies. (5 Min Cooldown)",
    null,
    null,
    null,
    null,
    null,
    null,
    { Engineering: 1 }
  );

  // //enchanting items
  const chromaticDust = await createItem(
    "Chromatic Dust",
    "inv_10_enchanting_dust_color5",
    null,
    1000,
    "Gathered by players with the Enchanting skill by disenchanting items. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const vibrantShard = await createItem(
    "Vibrant Shard",
    "inv_10_enchanting_shard_color4",
    null,
    1000,
    "Gathered by players with the Enchanting skill by disenchanting items. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent"
  );
  const resonantCrystal = await createItem(
    "Resonant Crystal",
    "inv_10_enchanting_crystal_color2",
    null,
    1000,
    "Gathered by players with the Enchanting skill by disenchanting items. Can be bought and sold on the auction house.",
    null,
    "Epic",
    "Crafting Reagent"
  );
  const gracefulAvoidance = await createItem(
    "Enchant Cloak - Graceful Avoidance",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a cloak to increase your Avoidance by 200/267/334 (based on quality) and reduce fall damage by 10%/15%/20% (based on quality.)"
  );
  const homeboundSpeed = await createItem(
    "Enchant Cloak - Homebound Speed",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a cloak to increase your Speed by 200/267/334 (based on quality) and reduce the cooldown of your Hearthstone by 3/4/5 minutes (based on quality) while in the Dragon Isles."
  );
  const regenerativeLeech = await createItem(
    "Enchant Cloak - Regenerative Leech",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a cloak to increase your Leech by 200/267/334 (based on quality) and heal for ?/10006/11674 (based on quality) every 5 sec while out of combat."
  );
  const writOfAvoidanceCloak = await createItem(
    "Enchant Cloak - Writ of Avoidance",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants a cloak to increase your Avoidance by 200/267/334 (based on quality.)"
  );
  const writOfLeechCloak = await createItem(
    "Enchant Cloak - Writ of Leech",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants a cloak to increase your Leech by 200/267/334 (based on quality.)"
  );
  const writOfSpeedCloak = await createItem(
    "Enchant Cloak - Writ of Speed",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants a cloak to increase your Speed by 200/267/334 (based on quality.)"
  );
  const acceleratedAgility = await createItem(
    "Enchant Chest - Accelerated Agility",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a chestpiece to increase your Agility by 205/251/296 (based on quality) and Speed by 534/600/667 (based on quality.)"
  );
  const reserveOfIntellect = await createItem(
    "Enchant Chest - Reserve of Intellect",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a chestpiece to increase your Intellect by 205/251/296 (based on quality) and mana pool by 3%/4%/5% (based on quality.)"
  );
  const sustainedStrength = await createItem(
    "Enchant Chest - Sustained Strength",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a chestpiece to increase your Strength by 205/251/296 (based on quality) and Stamina by 248/302/335 (based on quality.)"
  );
  const wakingStats = await createItem(
    "Enchant Chest - Waking Stats",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a chestpiece to increase your primary stats by 280/339/400 (based on quality.)"
  );
  const devotionOfAvoidance = await createItem(
    "Enchant Bracer - Devotion of Avoidance",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants bracers to increase your Avoidance by 400/467/534 (based on quality.)"
  );
  const devotionOfLeech = await createItem(
    "Enchant Bracer - Devotion of Leech",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants bracers to increase your Leech by 400/467/534 (based on quality.)"
  );
  const devotionOfSpeed = await createItem(
    "Enchant Bracer - Devotion of Speed",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants bracers to increase your Speed by 400/467/534 (based on quality.)"
  );
  const writOfAvoidanceBracer = await createItem(
    "Enchant Bracer - Writ of Avoidance",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants bracers to increase your Avoidance by 200/267/334 (based on quality.)"
  );
  const writOfLeechBracer = await createItem(
    "Enchant Bracer - Writ of Leech",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants bracers to increase your Leech by 200/267/334 (based on quality.)"
  );
  const writOfSpeedBracer = await createItem(
    "Enchant Bracer - Writ of Speed",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants bracers to increase your Speed by 200/267/334 (based on quality.)"
  );
  const plainsrunnersBreeze = await createItem(
    "Enchant Boots - Plainsrunner's Breeze",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants boots to increase your Speed by 534/600/667 (based on quality.)"
  );
  const ridersReassurance = await createItem(
    "Enchant Boots - Rider's Reassurance",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants boots to increase your mounted speed by 6%/8%/10% (based on quality.)"
  );
  const watchersLoam = await createItem(
    "Enchant Boots - Watcher's Loam",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants boots to increase your Stamina by 374/454/534 (based on quality.)"
  );
  const devotionOfCriticalStrike = await createItem(
    "Enchant Ring - Devotion of Critical Strike",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a ring to increase your Critical Strike by 171/195/219 (based on quality.)"
  );
  const devotionOfHaste = await createItem(
    "Enchant Ring - Devotion of Haste",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a ring to increase your Haste by 171/195/219 (based on quality.)"
  );
  const devotionOfMastery = await createItem(
    "Enchant Ring - Devotion of Mastery",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a ring to increase your Mastery by 171/195/219 (based on quality.)"
  );
  const devotionOfVersatility = await createItem(
    "Enchant Ring - Devotion of Versatility",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a ring to increase your Versatility by 171/195/219 (based on quality.)"
  );
  const writOfCriticalStrike = await createItem(
    "Enchant Ring - Writ of Critical Strike",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants a ring to increase your Critical Strike by 93/120/147 (based on quality.)"
  );
  const writOfHaste = await createItem(
    "Enchant Ring - Writ of Haste",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants a ring to increase your Haste by 93/120/147 (based on quality.)"
  );
  const writOfMastery = await createItem(
    "Enchant Ring - Writ of Mastery",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants a ring to increase your Mastery by 93/120/147 (based on quality.)"
  );
  const writOfVersatility = await createItem(
    "Enchant Ring - Writ of Versatility",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Permanently enchants a ring to increase your Versatility by 93/120/147 (based on quality.)"
  );
  const burningDevotion = await createItem(
    "Enchant Weapon - Burning Devotion",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Epic",
    null,
    3,
    null,
    null,
    "Permanently enchants a weapon to sometimes ignite, causing your next heal to additionally cauterize an ally's wounds, healing for 16926/18535/20150 (based on quality.)"
  );
  const earthenDevotion = await createItem(
    "Enchant Weapon - Earthen Devotion",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Epic",
    null,
    3,
    null,
    null,
    "Permanently enchants a weapon to sometimes ground yourself, increasing your Armor by 1904/2084/2266 (based on quality) for 15 sec."
  );
  const frozenDevotion = await createItem(
    "Enchant Weapon - Frozen Devotion",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Epic",
    null,
    3,
    null,
    null,
    "Permanently enchants a weapon to sometimes radiate ice, dealing 9403/10298/11194 Frost damage (based on quality) split between enemies in front of you. Damagee is increased for each enemy struck, up to 5 enemies."
  );
  const sophicDevotion = await createItem(
    "Enchant Weapon - Sophic Devotion",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Epic",
    null,
    3,
    null,
    null,
    "Permanently enchants a weapon to sometimes harness Order, increasing your primary stat by 783/857/932 (based on quality) for 15 sec."
  );
  const waftingDevotion = await createItem(
    "Enchant Weapon - Wafting Devotion",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Epic",
    null,
    3,
    null,
    null,
    "Permanently enchants a weapon to sometimes sway the winds, increasing your Haste by 1465/1603/1743 (based on quality) and Speed by 466/511/555 (based on quality) for 15 sec."
  );
  const burningWrit = await createItem(
    "Enchant Weapon - Burning Writ",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a weapon to sometimes incite flames, increasing your Critical Strike by 1185/1290/1394 (based on quality) for 15 sec."
  );
  const earthenWrit = await createItem(
    "Enchant Weapon - Earthen Writ",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a weapon to sometimes rumble the earth, increasing your Mastery by 1185/1290/1394 (based on quality) for 15 sec."
  );
  const frozenWrit = await createItem(
    "Enchant Weapon - Frozen Writ",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a weapon to sometimes chill your veins, increasing your Versatility by 1185/1290/1394 (based on quality) for 15 sec."
  );
  const sophicWrit = await createItem(
    "Enchant Weapon - Sophic Writ",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a weapon to sometimes beckon Order, increasing your primary stat by 634/689/746 (based on quality) for 15 sec."
  );
  const waftingWrit = await createItem(
    "Enchant Weapon - Wafting Writ",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a weapon to sometimes draw a breeze, increasing your Haste by 1185/1290/1394 (based on quality) for 15 sec."
  );
  const draconicDeftness = await createItem(
    "Enchant Tool - Draconic Deftness",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a gathering tool to increase your Deftness by 64/85/107 (based on quality.)"
  );
  const draconicFinesse = await createItem(
    "Enchant Tool - Draconic Finesse",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a gathering tool to increase your Finesse by 64/85/107 (based on quality.)"
  );
  const draconicInspiration = await createItem(
    "Enchant Tool - Draconic Inspiration",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a crafting tool to increase your Inspiration by 64/85/107 (based on quality.)"
  );
  const draconicPerception = await createItem(
    "Enchant Tool - Draconic Perception",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a gathering or fishing tool to increase your Perception by 64/85/107 (based on quality.)"
  );
  const draconicResourcefulness = await createItem(
    "Enchant Tool - Draconic Resourcefulness",
    "ui_profession_enchanting",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    3,
    null,
    null,
    "Permanently enchants a crafting or cooking tool to increase your Resourcefulness by 72/96/120 (based on quality.)"
  );
  const torchOfPrimalAwakening = await createItem(
    "Torch of Primal Awakening",
    "inv_wand_1h_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Wand",
    "Ranged",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("1h-int")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const runedKhazgoriteRod = await createItem(
    "Runed Khaz'gorite Rod",
    "inv_misc_1h_enchantingrod_b_01",
    "Pickup",
    1,
    "Serves as a runed enchanting rod.",
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Enchanting Tool",
    null,
    null,
    [346, 352, 358, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const runedDraconiumRod = await createItem(
    "Runed Draconium Rod",
    "inv_misc_1h_enchantingrod_b_01",
    "Equip",
    1,
    "Serves as a runed enchanting rod.",
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Enchanting Tool",
    null,
    null,
    [320, 326, 332, 339, 342],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const enchantedWrithebarkWand = await createItem(
    "Enchanted Writhebark Wand",
    "inv_wand_1h_kultirasquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Wand",
    "Ranged",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("1h-int")],
    [
      secondaryStatArrayRare("stamina", "1h"),
      secondaryStatArrayRare("Random Stat 1", "1h"),
      secondaryStatArrayRare("Random Stat 2", "1h"),
    ]
  );
  const runedSereviteRod = await createItem(
    "Runed Serevite Rod",
    "inv_misc_enchantedpyriumrod",
    "Equip",
    1,
    "Serves as a runed enchanting rod.",
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Enchanting Tool",
    null,
    null,
    [270, 276, 282, 289, 296],
    statArrayProfToolAccessory("Skill", "Tool", "small"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "small")]
  );
  const illusionPrimalAir = await createItem(
    "Illusion: Primal Air",
    "inv_inscription_weaponscroll03",
    null,
    1,
    null,
    null,
    "Rare",
    null,
    1,
    null,
    null,
    "Collect the weapon enchantment appearance of Primal Air."
  );
  const illusionPrimalEarth = await createItem(
    "Illusion: Primal Earth",
    "inv_inscription_weaponscroll03",
    null,
    1,
    null,
    null,
    "Rare",
    null,
    1,
    null,
    null,
    "Collect the weapon enchantment appearance of Primal Earth."
  );
  const illusionPrimalFire = await createItem(
    "Illusion: Primal Fire",
    "inv_inscription_weaponscroll03",
    null,
    1,
    null,
    null,
    "Rare",
    null,
    1,
    null,
    null,
    "Collect the weapon enchantment appearance of Primal Fire."
  );
  const illusionPrimalFrost = await createItem(
    "Illusion: Primal Frost",
    "inv_inscription_weaponscroll03",
    null,
    1,
    null,
    null,
    "Rare",
    null,
    1,
    null,
    null,
    "Collect the weapon enchantment appearance of Primal Frost."
  );
  const illusionPrimalMastery = await createItem(
    "Illusion: Primal Mastery",
    "inv_inscription_weaponscroll03",
    null,
    1,
    null,
    null,
    "Epic",
    null,
    1,
    null,
    null,
    "Collect the weapon enchantment appearance of Primal Mastery."
  );
  const primalInvocationExtract = await createItem(
    "Primal Invocation Extract",
    "inv_10_enchanting2_elementalswirl_color1",
    null,
    1,
    null,
    "Received from 'Primal Extraction - Glimmers of Insight' - guessing this is a proc after getting Primal Extraction (specialization) 30?",
    "Rare",
    null,
    3,
    null,
    null,
    "Perform an elemental invocation, transforming into the elemental summoned for 10/15/20 min (based on quality). (1 Hr Cooldown)"
  );
  const khadgarsDisenchantingRod = await createItem(
    "Khadgar's Disenchanting Rod",
    "inv_enchanting_70_toy_leyshocker",
    null,
    1,
    "I'm trying something new!",
    "I really want to try this out lmao",
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your Toy Box. Disenchant a player. (5 Min Cooldown)"
  );
  const illusoryAdornmentOrder = await createItem(
    "Illusory Adornment: Order",
    "inv_10_enchanting_enchantingoils_color2",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Temporarily imbues shoulders with an illusion of Order for 1200/2400/3600 (based on quality... but what do these numbers mean??)"
  );
  const illusoryAdornmentAir = await createItem(
    "Illusory Adornment: Air",
    "inv_10_enchanting_enchantingoils_color4",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Temporarily imbues shoulders with a windswept illusion for 1200/2400/3600 (based on quality... but what do these numbers mean??)"
  );
  const illusoryAdornmentEarth = await createItem(
    "Illusory Adornment: Earth",
    "inv_10_enchanting_enchantingoils_color5",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Temporarily imbues shoulders with an earthen illusion for 1200/2400/3600 (based on quality... but what do these numbers mean??)"
  );
  const illusoryAdornmentFire = await createItem(
    "Illusory Adornment: Fire",
    "inv_10_enchanting_enchantingoils_color1",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Temporarily imbues shoulders with a fiery illusion for 1200/2400/3600 (based on quality... but what do these numbers mean??)"
  );
  const illusoryAdornmentFrost = await createItem(
    "Illusory Adornment: Frost",
    "inv_10_enchanting_enchantingoils_color4",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Temporarily imbues shoulders with a frosted illusion for 1200/2400/3600 (based on quality... but what do these numbers mean??)"
  );
  const scepterOfSpectacleOrder = await createItem(
    "Scepter of Spectacle: Order",
    "inv_wand_32",
    null,
    1,
    "50 Charges",
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Wave the scepter, projecting an illusory orb of Order in front of you.",
    null,
    "Main Hand",
    null,
    [5, 5, 5, 5, 5]
  );
  const scepterOfSpectacleAir = await createItem(
    "Scepter of Spectacle: Air",
    "inv_wand_04",
    null,
    1,
    "50 Charges",
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Wave the scepter, projecting an illusory orb of air in front of you.",
    null,
    "Main Hand",
    null,
    [5, 5, 5, 5, 5]
  );
  const scepterOfSpectacleFrost = await createItem(
    "Scepter of Spectacle: Frost",
    "inv_wand_05",
    null,
    1,
    "50 Charges",
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Wave the scepter, projecting an illusory orb of frost in front of you.",
    null,
    "Main Hand",
    null,
    [5, 5, 5, 5, 5]
  );
  const scepterOfSpectacleEarth = await createItem(
    "Scepter of Spectacle: Earth",
    "inv_wand_1h_warfrontshorde_c_01",
    null,
    1,
    "50 Charges",
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Wave the scepter, projecting an illusory orb of earth in front of you.",
    null,
    "Main Hand",
    null,
    [5, 5, 5, 5, 5]
  );
  const scepterOfSpectacleFire = await createItem(
    "Scepter of Spectacle: Fire",
    "inv_wand_06",
    null,
    1,
    "50 Charges",
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Wave the scepter, projecting an illusory orb of fire in front of you.",
    null,
    "Main Hand",
    null,
    [5, 5, 5, 5, 5]
  );
  const sophicAmalgamation = await createItem(
    "Sophic Amalgamation",
    "inv_10_elementalcombinedfoozles_titan",
    null,
    1,
    null,
    null,
    "Rare",
    "Pet",
    1,
    null,
    null,
    "Teaches you how to summon this companion."
  );

  const elementalShatterAir = await createItem(
    "Elemental Shatter: Air",
    "inv_10_elementalcombinedfoozles_air",
    "Pickup",
    1,
    "The shattered essence envelops you, increasing your Haste by 281 for 10 min.",
    "I'm assuming this is not actually an item, but instead a buff from Elemental Shatter w/ Awakened Air."
  );

  const elementalShatterEarth = await createItem(
    "Elemental Shatter: Earth",
    "inv_10_elementalcombinedfoozles_earth",
    "Pickup",
    1,
    "The shattered essence envelops you, increasing your Mastery by 281 for 10 min.",
    "I'm assuming this is not actually an item, but instead a buff from Elemental Shatter w/ Awakened Earth."
  );

  const elementalShatterFire = await createItem(
    "Elemental Shatter: Fire",
    "inv_10_elementalcombinedfoozles_fire",
    "Pickup",
    1,
    "The shattered essence envelops you, increasing your Critical Strike by 281 for 10 min.",
    "I'm assuming this is not actually an item, but instead a buff from Elemental Shatter w/ Awakened Fire."
  );

  const elementalShatterFrost = await createItem(
    "Elemental Shatter: Frost",
    "inv_10_elementalcombinedfoozles_frost",
    "Pickup",
    1,
    "The shattered essence envelops you, increasing your Versatility by 281 for 10 min.",
    "I'm assuming this is not actually an item, but instead a buff from Elemental Shatter w/ Awakened Frost."
  );

  const elementalShatterOrder = await createItem(
    "Elemental Shatter: Order",
    "inv_10_elementalcombinedfoozles_titan",
    "Pickup",
    1,
    "The shattered essence envelops you, increasing your primary stat by 211 for 10 min.",
    "I'm assuming this is not actually an item, but instead a buff from Elemental Shatter w/ Awakened Order."
  );

  //guess this doesn't exist anymore?
  // const crystalMagicalLockpick = await createItem(
  //   "Crystal Magical Lockpick",
  //   1000
  // );

  // //alchemy items
  const dragonsAlchemicalSolution = await createItem(
    "Dragon's Alchemical Solution",
    "inv_10_alchemy2_quenchingfluid_color1",
    "Pickup",
    1000,
    "Acquired as a byproduct from reclaiming excess concoctions.",
    "Item used in Potion/Phial Experimentation - how you're going to get a bulk of your Potion & Phial recipes.",
    "Rare",
    "Crafting Reagent"
  );
  const residualNeuralChannelingAgent = await createItem(
    "Residual Neural Channeling Agent",
    "inv_10_alchemy_bottle_shape1_yellow",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "While dead, assault your enemy's consciousness with what remains of your own, dealing 82405/96050/111,935 Nature damage (based on quality) over 18 sec to your target. Should you be revived, the remaining damage will be dealt instantly. Releasing your spirit will return your consciousness to you and cancel the effect. Shares a cooldown with combat potions. (5 Min Cooldown)"
  );
  const bottledPutrescence = await createItem(
    "Bottled Putrescence",
    "inv_10_alchemy_bottle_shape1_black",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Throw to spread rot and decay, dealing 70199/81822/95354 Nature damage (based on quality) to enemies over 10 sec. Shares a cooldown with combat potions. (5 Min Cooldown)"
  );
  const potionOfGusts = await createItem(
    "Potion of Gusts",
    "inv_10_alchemy_bottle_shape1_green",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Drink to be propelled forward a short distance, momentarily weightless. (5 Min Cooldown)"
  );
  const potionOfShockingDisclosure = await createItem(
    "Potion of Shocking Disclosure",
    "inv_10_alchemy_bottle_shape1_violet",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Envelops you in a field of static for 30 sec, discharging every 5 sec to deal 6685/7793/9081 damage (based on quality) and reveal nearby enemies. Enemies struck by this effect are unable to enter stealth or invisibility for 6 sec. (5 Min Cooldown)"
  );
  const potionOfTheHushedZephyr = await createItem(
    "Potion of the Hushed Zephyr",
    "inv_10_alchemy_bottle_shape1_white",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Drink to gain invisibility for 12/15/18 seconds (based on quality). (5 Min Cooldown)"
  );
  const aeratedManaPotion = await createItem(
    "Aerated Mana Potion",
    "inv_10_alchemy_bottle_shape1_blue",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Restores 20869/24000/27600 mana. (5 Min Cooldown)"
  );
  const potionOfChilledClarity = await createItem(
    "Potion of Chilled Clarity",
    "inv_10_alchemy_bottle_shape4_green",
    null,
    200,
    null,
    null,
    "Common",
    "Toxic",
    3,
    null,
    null,
    "Reduces the mana cost of all spells by 100% but also increases cast time by 40% for 15/12/9 seconds (based on quality). (5 Min Cooldown)"
  );
  const delicateSuspensionOfSpores = await createItem(
    "Delicate Suspension of Spores",
    "inv_10_alchemy_bottle_shape4_yellow",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Use upon a fallen ally within 10 yds to spread restorative spores nearby for 12 sec. These spores cling to allies and heal them for 27486/31609/36351 (based on quality) over 6 sec. Usable on yourself while dead. Shares a cooldown with combat potions. (5 Min Cooldown)"
  );
  const potionOfFrozenFocus = await createItem(
    "Potion of Frozen Focus",
    "inv_10_alchemy_bottle_shape4_blue",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Drink to chill your body but elevate your focus, allowing you to restore 36521/42000/48300 mana (based on quality) over 10 sec, but you are defenseless until your focus is broken. (5 Min Cooldown)"
  );
  const potionOfWitheringVitality = await createItem(
    "Potion of Withering Vitality",
    "inv_10_alchemy_bottle_shape4_orange",
    null,
    200,
    null,
    null,
    "Common",
    "Toxic",
    3,
    null,
    null,
    "Consume this vile concoction to instantly heal yourself for 137,347/160,090/186,565 (based on quality), but suffer that same amount as Plague damage over 15 sec. (5 Min Cooldown)"
  );
  const potionOfFrozenFatality = await createItem(
    "Potion of Frozen Fatality",
    "inv_10_alchemy_bottle_shape4_black",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Drink to collapse to the ground, frozen in a state of near-death for 5/15/30 min (based on quality), tricking enemies into ignoring you. Cannot be used while in combat. (2 Min Cooldown)"
  );
  const refreshingHealingPotion = await createItem(
    "Refreshing Healing Potion",
    "inv_10_alchemy_bottle_shape4_red",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Restores 68650/80950/93250 health (based on quality). (5 Min Cooldown)"
  );
  const potionCauldronOfUltimatePower = await createItem(
    "Potion Cauldron of Ultimate Power",
    "inv_misc_cauldron_shadow",
    "Account",
    200,
    null,
    "The strongest cauldron available. Requires everyone to pitch in Primal Chaos.",
    "Common",
    null,
    3,
    null,
    null,
    "Creates a cauldron that raid members can use to exchange 5 Primal Chaos for 5 Fleeting Elemental Potions of Ultimate Power. When consumed, their primary stat is increased by 669/770/886 (based on quality) for 30 sec. The cauldron lasts for 20 min. (3 Min Cooldown)"
  );
  const potionCauldronOfPower = await createItem(
    "Potion Cauldron of Power",
    "inv_misc_cauldron_frost",
    "Account",
    200,
    null,
    "The less strong cauldron available. But you don't need to give up your own materials!",
    "Common",
    null,
    3,
    null,
    null,
    "Creates a cauldron that raid members can use to acquire Fleeting Elemental Potions of Power. When consumed, their primary stat is increased by 502/577/664 (based on quality) for 30 sec. Cauldron has 120 uses and each provides 5 potions. The cauldron lasts for 20 min. (3 Min Cooldown)"
  );
  const cauldronOfThePooka = await createItem(
    "Cauldron of the Pooka",
    "archaeology_5_0_pandarenteaset",
    "Account",
    200,
    null,
    "The meme cauldron.",
    "Common",
    null,
    3,
    null,
    null,
    "Set out a Cauldron of the Pooka for 3 min. Allies can take a sample of the suspiciously fuzzy liquid as a refreshing drink to restore 60/70/80% mana (based on quality) over 25 sec. Each sip has a chance to transform them into a cute and cuddly creature! (3 Min Cooldown)"
  );
  const elementalPotionOfUltimatePower = await createItem(
    "Elemental Potion of Ultimate Power",
    "trade_alchemy_dpotion_b20",
    "Pickup",
    200,
    null,
    "Strongest pure-stat potion available.",
    "Common",
    null,
    3,
    null,
    null,
    "Drink to increase your primary stat by 669/770/886 (based on quality) for 30 sec. (5 Min Cooldown)"
  );
  const elementalPotionOfPower = await createItem(
    "Elemental Potion of Power",
    "trade_alchemy_dpotion_b10",
    null,
    200,
    null,
    "The less strong pure-stat potion. But it's not BoP!",
    "Common",
    null,
    3,
    null,
    null,
    "Drink to increase your primary stat by 502/577/664 (based on quality) for 30 sec. (5 Min Cooldown)"
  );
  const phialOfElementalChaos = await createItem(
    "Phial of Elemental Chaos",
    "inv_10_alchemy_bottle_shape2_orange",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Infuse yourself with the power of the elements, granting you a random elemental boon that changes every 60 sec. Each boon increases a secondary stat by 552/602/652 (based on quality) and grants a bonus effect. Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const phialOfChargedIsolation = await createItem(
    "Phial of Charged Isolation",
    "inv_10_alchemy_bottle_shape3_white",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Your Primary Stat is increased by 452/520/598 (based on quality) while at least 10 yds from allies. You will retain 75% of this stat for 2.5 sec after being near an ally. Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const phialOfStaticEmpowerment = await createItem(
    "Phial of Static Empowerment",
    "inv_10_alchemy_bottle_shape3_violet",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Remaining stationary will increase your Primary Stat up to 471/541/623 (based on quality) over 5 sec. Movement consumes the effect, granting up to 629/686/743 Speed (based on quality) for 5 sec. Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const phialOfStillAir = await createItem(
    "Phial of Still Air",
    "inv_10_alchemy_bottle_shape3_green",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "After performing actions other than healing for 5 seconds, your next heal triggers a Surging Breeze on the target which heals them for 10450/12181/14195 (based on quality). Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const phialOfTheEyeInTheStorm = await createItem(
    "Phial of the Eye in the Storm",
    "inv_10_alchemy_bottle_shape3_blue",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Your Primary Stat is increased by 113/130/150 (based on quality) for each enemy that has recently struck you, stacking up to 5 times. Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const aeratedPhialOfDeftness = await createItem(
    "Aerated Phial of Deftness",
    "inv_10_alchemy_bottle_shape3_orange",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Increases your Deftness by 30/40/50 (based on quality). Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const chargedPhialOfAlacrity = await createItem(
    "Charged Phial of Alacrity",
    "inv_10_alchemy_bottle_shape3_yellow",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Increases your Speed by 629/686/743 (based on quality). Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const aeratedPhialOfQuickHands = await createItem(
    "Aerated Phial of Quick Hands",
    "inv_10_alchemy_bottle_shape3_red",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Increases the speed you craft Dragon Isles recipes by 18%/24%/30% (based on quality). Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const phialOfIcyPreservation = await createItem(
    "Phial of Icy Preservation",
    "inv_10_alchemy_bottle_shape2_blue",
    null,
    200,
    null,
    null,
    "Common",
    "Toxic",
    3,
    null,
    null,
    "Damage taken is decreased by 4%/5%/6% (based on quality) while over 50% health, but increased by 4%/5%/6% (based on quality) while under 50% health. Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const icedPhialOfCorruptingRage = await createItem(
    "Iced Phial of Corrupting Rage",
    "inv_10_alchemy_bottle_shape2_red",
    null,
    200,
    null,
    null,
    "Common",
    "Toxic",
    3,
    null,
    null,
    "Gain Corrupting Rage which grants 947/1032/1118 Critical Strike rating (based on quality). After suffering 100% of your health in damage, you are afflicted with Overwhelming Rage instead which causes you to take 25% of your health as Nature damage over 15 sec, after which the cycle begins anew. Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const phialOfGlacialFury = await createItem(
    "Phial of Glacial Fury",
    "inv_10_alchemy_bottle_shape2_blue",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Whenever you first attack a target, gain a stack of Glacial Fury for 15 sec, up to 5 stacks. Dealing damage has a chance to unleash a blast of 4727/5509/6420 Frost damage (based on quality) upon the target which is split among nearby enemies. This effect is increased by 15% per stack. Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const steamingPhialOfFinesse = await createItem(
    "Steaming Phial of Finesse",
    "inv_10_alchemy_bottle_shape2_violet",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Increases your Finesse by 30/40/50 (based on quality). Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const crystallinePhialOfPerception = await createItem(
    "Crystalline Phial of Perception",
    "inv_10_alchemy_bottle_shape2_yellow",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Increases your Perception by 30/40/50 (based on quality). Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const phialOfTepidVersatility = await createItem(
    "Phial of Tepid Versatility",
    "inv_10_alchemy_bottle_shape2_black",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Increases your Versatility by 631/688/745 (based on quality). Lasts 30 min and through death. Consuming an identical phial will add another 30 min. (1 Sec Cooldown)"
  );
  const potionAbsorptionInhibitor = await createItem(
    "Potion Absorption Inhibitor",
    "inv_misc_food_legion_gooamber_drop",
    null,
    200,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Embellishment"],
    "+35/30/25 Recipe Difficulty (based on quality). Provides the following property: Increase the duration of Dragon Isles potions by 50% and add Unique-Equipped: Embellished (2)."
  );
  const writhefireOil = await createItem(
    "Writhefire Oil",
    "inv_10_alchemy_engineersgrease_color4",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Curing Agent", "Chain Oil", "Quenching Fluid"],
    "When crafting: You are 9%/12%/15% (based on difficulty) more likely to improve at your profession, but Recipe Difficulty is increased by 18/24/30 (based on quality.)"
  );
  const broodSalt = await createItem(
    "Brood Salt",
    "inv_10_alchemy_curingagent_color4",
    null,
    200,
    null,
    "Is both a Curing Agent & Alchemical Catalyst??",
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    [
      "Curing Agent",
      "Alchemical Catalyst - Potion",
      "Alchemical Catalyst - Phial",
    ],
    "When crafting: Increases Inspiration by 30/40/50 (based on quality) and Crafting Speed by 12/16/20% (based on quality.)"
  );
  const stableFluidicDraconium = await createItem(
    "Stable Fluidic Draconium",
    "inv_10_alchemy_curingagent_color2",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Chain Oil", "Quenching Fluid"],
    "When crafting: Increases bonus Skill from Inspiration by 15%/20%/25% (based on quality)."
  );
  const agitatingPotionAugmentation = await createItem(
    "Agitating Potion Augmentation",
    "inv_10_alchemy2_catalyst_color1",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Alchemical Catalyst - Potion"],
    "When crafting: Increases Inspiration by 30/36/45 (based on quality) and Multicraft by 27/36/45 (based on quality.)"
  );
  const reactivePhialEmbellishment = await createItem(
    "Reactive Phial Embellishment",
    "inv_10_alchemy2_expensivepurchasablereagent_color3",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Alchemical Catalyst - Phial"],
    "When crafting: Increases Inspiration by 30/36/45 (based on quality) and Multicraft by 27/36/45 (based on quality.)"
  );
  const sagaciousIncense = await createItem(
    "Sagacious Incense",
    "inv_10_alchemy_incenseholder_color4",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Place down a pleasant incense that soothes the mind of everyone nearby, granting 20 Inspiration for 10/20/30 minutes (based on quality). (30 Sec Cooldown)"
  );
  const exultantIncense = await createItem(
    "Exultant Incense",
    "inv_10_alchemy_incenseholder_color1",
    null,
    200,
    null,
    "A Quality 3 one of these is used in a quest chain to get the Divine Kiss of Ohn'ahra mount.",
    "Common",
    null,
    3,
    null,
    null,
    "Light a celebratory incense sure to invigorate everyone's mood. The incense will burn for 1/3/8 min (based on quality). (1/3/8 Min Cooldown)"
  );
  const fervidIncense = await createItem(
    "Fervid Incense",
    "inv_10_alchemy_incenseholder_color3",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Light an agitating incense sure to incite intense emotions. The incense will burn for 1/3/8 min (based on quality). (1/3/8 Min Cooldown)"
  );
  const somniferousIncense = await createItem(
    "Somniferous Incense",
    "inv_10_alchemy_incenseholder_color2",
    null,
    200,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Light a soothing incense intended to induce a peaceful slumber. The incense will burn for 1/3/8 min (based on quality). (1/3/8 Min Cooldown)"
  );
  const alacritousAlchemistStone = await createItem(
    "Alacritous Alchemist Stone",
    "inv_10_alchemy_alchemystone_color1",
    "Pickup",
    1,
    "Can be used for transmutations in place of a Philosopher's Stone.",
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to increase your Primary Stat by 573/?/?/824/957 (based on quality) for 10 sec and reduce the cooldown of your combat potions by 10 sec.",
    null,
    null,
    "Trinket",
    "Alchemist Stone (1)",
    [382, 384, 386, 389, 392],
    null,
    [["Haste", 360, "?", 458, 466, 510]]
  );
  const sustainingAlchemistStone = await createItem(
    "Sustaining Alchemist Stone",
    "inv_10_alchemy_alchemystone_color1",
    "Pickup",
    1,
    "Can be used for transmutations in place of a Philosopher's Stone.",
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to increase your Primary Stat by 687/?/960/988/? (based on quality) for 10 sec and extend the duration of your active phial by 60 sec.",
    null,
    null,
    "Trinket",
    "Alchemist Stone (1)",
    [382, 384, 386, 389, 392],
    null,
    [["Versatility", 360, "?", 458, 466, 510]]
  );

  // //inscription items
  const shimmeringPigment = await createItem(
    "Shimmering Pigment",
    "inv_10_inscription3_pigments_black",
    null,
    1000,
    "A common pigment radiating with possibilities. Milled by players with the Inscription skill. Can be bought and sold on the auction house.",
    "Most common pigment, received from milling Hochenblume.",
    "Common",
    "Crafting Reagent",
    3
  );
  const serenePigment = await createItem(
    "Serene Pigment",
    "inv_10_inscription3_pigments_blue",
    null,
    1000,
    "A relaxing cerulean pigment milled by players with the Inscription skill. Can be bought and sold on the auction house.",
    "Common pigment, received from milling Bubble Poppy.",
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const flourishingPigment = await createItem(
    "Flourishing Pigment",
    "inv_10_inscription3_pigments_green",
    null,
    1000,
    "A viridescent pigment milled by players with the Inscription skill. Can be bought and sold on the auction house.",
    "Common pigment, received from milling Writhebark.",
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const blazingPigment = await createItem(
    "Blazing Pigment",
    "inv_10_inscription3_pigments_red",
    null,
    1000,
    "A fiery pigment milled by players with the Inscription skill. Can be bought and sold on the auction house.",
    "Common pigment, received from milling Saxifrage.",
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const cosmicInk = await createItem(
    "Cosmic Ink",
    "inv_10_inscription_ink_color3",
    null,
    1000,
    "A deep black ink crafted by players with the Inscription skill. Can be bought and sold on the auction house.",
    "Most complex ink. Requires Frost, Runed Writhebark, Burnished Ink, & Serene Ink to craft.",
    "Rare",
    "Crafting Reagent",
    3
  );
  const burnishedInk = await createItem(
    "Burnished Ink",
    "inv_10_inscription_ink_color4",
    null,
    1000,
    "A metallic ink crafted by players with the Inscription skill. Can be bought and sold on the auction house.",
    "A complex ink. Crafted by combining the three basic inks.",
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const blazingInk = await createItem(
    "Blazing Ink",
    "inv_10_inscription_ink_color5",
    null,
    1000,
    "A fiery ink crafted by players with the Inscription skill. Can be bought and sold on the auction house.",
    "A basic ink. Made with pigments from Hochenblume & Saxifrage.",
    "Common",
    "Crafting Reagent",
    3
  );
  const flourishingInk = await createItem(
    "Flourishing Ink",
    "inv_10_inscription_ink_color6",
    null,
    1000,
    "A viridescent ink crafted by players with the Inscription skill. Can be bought and sold on the auction house.",
    "A basic ink. Made with pigments from Hochenblume & Writhebark.",
    "Common",
    "Crafting Reagent",
    3
  );
  const sereneInk = await createItem(
    "Serene Ink",
    "inv_10_inscription_ink_color2",
    null,
    1000,
    "A relaxing cerulean ink crafted by players with the Inscription skill. Can be bought and sold on the auction house.",
    "A basic ink. Made with pigments from Hochenblume & Bubble Poppy.",
    "Common",
    "Crafting Reagent",
    3
  );
  const runedWrithebark = await createItem(
    "Runed Writhebark",
    "inv_10_inscription_runedwrithebark_color1",
    null,
    1000,
    "A sturdy piece of Writhebark fastened with a frosted rune. Crafted by players with the Inscription skill. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const chilledRune = await createItem(
    "Chilled Rune",
    "inv_misc_rune_10",
    null,
    1000,
    "A frosted rune crafted by players with the Inscription skill. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const draconicMissiveOfTheAurora = await createItem(
    "Draconic Missive of the Aurora",
    "inv_10_inscription2_repcontracts_80_scroll_uprez_color2",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Combat"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Versatility and Haste."
  );
  const draconicMissiveOfTheFeverflare = await createItem(
    "Draconic Missive of the Feverflare",
    "inv_10_inscription2_repcontracts_80_scroll_uprez",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Combat"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Mastery and Haste."
  );
  const draconicMissiveOfTheFireflash = await createItem(
    "Draconic Missive of the Fireflash",
    "inv_10_inscription2_repcontracts_80_scroll_uprez_color3",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Combat"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Critical Strike and Haste."
  );
  const draconicMissiveOfTheHarmonious = await createItem(
    "Draconic Missive of the Harmonious",
    "inv_10_inscription2_repcontracts_80_scroll_uprez_color1",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Combat"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Versatility and Mastery."
  );
  const draconicMissiveOfThePeerless = await createItem(
    "Draconic Missive of the Peerless",
    "inv_10_inscription2_repcontracts_80_scroll_uprez_color4",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Combat"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Critical Strike and Mastery."
  );
  const draconicMissiveOfTheQuickblade = await createItem(
    "Draconic Missive of the Quickblade",
    "inv_10_inscription2_repcontracts_80_scroll_uprez_color5",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Combat"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Versatility and Critical Strike."
  );
  const draconicMissiveOfCraftingSpeed = await createItem(
    "Draconic Missive of Crafting Speed",
    "inv_10_inscription2_scroll3_color1",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Crafting"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Crafting Speed."
  );
  const draconicMissiveOfInspiration = await createItem(
    "Draconic Missive of Inspiration",
    "inv_10_inscription2_scroll3_color5",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Crafting"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Inspiration."
  );
  const draconicMissiveOfMulticraft = await createItem(
    "Draconic Missive of Multicraft",
    "inv_10_inscription2_scroll3_color4",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Crafting"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Multicraft."
  );
  const draconicMissiveOfResourcefulness = await createItem(
    "Draconic Missive of Resourcefulness",
    "inv_10_inscription2_scroll3_color3",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Crafting"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Resourcefulness."
  );
  const draconicMissiveOfDeftness = await createItem(
    "Draconic Missive of Deftness",
    "inv_10_inscription_vellum_color4",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Gathering"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Deftness."
  );
  const draconicMissiveOfFinesse = await createItem(
    "Draconic Missive of Finesse",
    "inv_10_inscription_vellum_color1",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Gathering"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Finesse."
  );
  const draconicMissiveOfPerception = await createItem(
    "Draconic Missive of Perception",
    "inv_10_inscription_vellum_color2",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Optional Crafting Reagent",
    3,
    ["Missive - Gathering"],
    "+25/20/15 Recipe Difficulty (based on quality). Provides the following property: Guarantee Perception."
  );
  const darkmoonDeckDance = await createItem(
    "Darkmoon Deck: Dance",
    "inv_10_inscription_darkmooncards_air_blank",
    "Equip",
    1,
    null,
    "Formed from combining the Ace through 8 of Air.",
    "Epic",
    null,
    1,
    null,
    "Periodically shuffle the deck while in combat.",
    "Call a Refreshing Dance that bounces 5-12 times between friends and foes within 25 yards dealing 10034 Nature damage or 4701 healing. The number of bounces is determined by the top-most card of the deck. (1 Min, 30 Sec Cooldown)",
    null,
    "Trinket",
    "Darkmoon Deck (1)",
    [372, null, null, null, null],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      ["300", null, null, null, null],
    ]
  );
  const darkmoonDeckInferno = await createItem(
    "Darkmoon Deck: Inferno",
    "inv_10_inscription_darkmooncards_fire_blank",
    "Equip",
    1,
    null,
    "Formed from combining the Ace through 8 of Fire.",
    "Epic",
    null,
    1,
    null,
    "Periodically shuffle the deck while in combat.",
    "Hurl a Smoldering Inferno at the target that deals between 23295-77651 Fire damage. Damage dealt is determined by the top-most card of the deck. (1 Min, 30 Sec Cooldown)",
    null,
    "Trinket",
    "Darkmoon Deck (1)",
    [372, null, null, null, null],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      ["300", null, null, null, null],
    ]
  );
  const darkmoonDeckRime = await createItem(
    "Darkmoon Deck: Rime",
    "inv_10_inscription_darkmooncards_frost_blank",
    "Equip",
    1,
    null,
    "Formed from combining the Ace through 8 of Frost.",
    "Epic",
    null,
    1,
    null,
    "Periodically shuffle the deck while in combat.",
    "Deal 16711 Frost damage and apply Awakening Rime to your target for 4-12s. If the target dies while Awakening Rime is active, it explodes for 41777 Frost damage split between enemies in a 10 yard radius. Duration is determined by the top-most card of the deck. (1 Min, 30 Sec Cooldown)",
    null,
    "Trinket",
    "Darkmoon Deck (1)",
    [372, null, null, null, null],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      ["300", null, null, null, null],
    ]
  );
  const darkmoonDeckWatcher = await createItem(
    "Darkmoon Deck: Watcher",
    "inv_10_inscription_darkmooncards_earth_blank",
    "Equip",
    1,
    null,
    "Formed from combining the Ace through 8 of Earth.",
    "Epic",
    null,
    1,
    null,
    "Periodically shuffle the deck while in combat.",
    "Grants the Watcher's Blessing for 5-12s and an absorb shield for 62837 damage. If the shield depletes while Watcher's Blessing is active, gain 1511 Versatility for the same duration. Duration is determined by the top-most card of the deck. (1 Min, 30 Sec Cooldown)",
    null,
    "Trinket",
    "Darkmoon Deck (1)",
    [372, null, null, null, null],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      ["300", null, null, null, null],
    ]
  );
  const darkmoonDeckBoxDance = await createItem(
    "Darkmoon Deck Box: Dance",
    "inv_10_inscription_darkmooncards_air_blank",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Periodically shuffle the deck while in combat.",
    "Call a Refreshing Dance that bounces 5-12 times between friends and foes within 25 yards dealing 10318/?/?/?/11489 Nature damage (based on quality) or 5207/?/?/?/5767 healing (based on quality). The number of bounces is determined by the top-most card of the deck. (1 Min, 30 Sec Cooldown)",
    null,
    "Trinket",
    "Darkmoon Deck (1)",
    [382, 384, 386, 389, 392],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      [329, "?", "?", "?", 361],
    ]
  );
  const darkmoonDeckBoxInferno = await createItem(
    "Darkmoon Deck Box: Inferno",
    "inv_10_inscription_darkmooncards_fire_blank",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Periodically shuffle the deck while in combat.",
    "Hurl a Smoldering Inferno at the target that deals between 25803/?/?/?/28580 - 86013/?/?/?/95267 Fire damage (based on quality). Damage dealt is determined by the top-most card of the deck. (1 Min, 30 Sec Cooldown)",
    null,
    "Trinket",
    "Darkmoon Deck (1)",
    [382, 384, 386, 389, 392],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      [329, "?", "?", "?", 361],
    ]
  );
  const darkmoonDeckBoxRime = await createItem(
    "Darkmoon Deck Box: Rime",
    "inv_10_inscription_darkmooncards_frost_blank",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Periodically shuffle the deck while in combat.",
    "Deal 17184/?/?/?/19134 Frost damage (based on quality) and apply Awakening Rime to your target for 4-12s. If the target dies while Awakening Rime is active, it explodes for 42961/?/?/?/47836 Frost damage (based on quality) split between enemies in a 10 yard radius. Duration is determined by the top-most card of the deck. (1 Min, 30 Sec Cooldown)",
    null,
    "Trinket",
    "Darkmoon Deck (1)",
    [382, 384, 386, 389, 392],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      [329, "?", "?", "?", 361],
    ]
  );
  const darkmoonDeckBoxWatcher = await createItem(
    "Darkmoon Deck Box: Watcher",
    "inv_10_inscription_darkmooncards_earth_blank",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Periodically shuffle the deck while in combat.",
    "Grants the Watcher's Blessing for 5-12s and an absorb shield for 93651/?/?/?/99355 damage (based on quality). If the shield depletes while Watcher's Blessing is active, gain 1609/?/?/?/1707 Versatility for the same duration. Duration is determined by the top-most card of the deck. (1 Min, 30 Sec Cooldown)",
    null,
    "Trinket",
    "Darkmoon Deck (1)",
    [382, 384, 386, 389, 392],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      [329, "?", "?", "?", 361],
    ]
  );
  const cracklingCodexOfTheIsles = await createItem(
    "Crackling Codex of the Isles",
    "inv_offhand_1h_dragonquest_b_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    null,
    "Off Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("1h")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const illuminatingPillarOfTheIsles = await createItem(
    "Illuminating Pillar of the Isles",
    "inv_staff_2h_inscription_c_01_blue",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Staff",
    "Two Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("2h-int")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const kineticPillarOfTheIsles = await createItem(
    "Kinetic Pillar of the Isles",
    "inv_staff_2h_inscription_c_01_green",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Staff",
    "Two-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const weatheredExplorersStave = await createItem(
    "Weathered Explorer's Stave",
    "inv_staff_2h_inscription_c_01_red",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Dealing damage has a chance to fill you with a surge of familiar energy, increasing Haste by ?/?/?/1161/? (based on quality) for 10 sec.",
    null,
    "Staff",
    "Two-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("2h-int")],
    [secondaryStatArrayEpic("stamina", "large")]
  );
  const coreExplorersCompendium = await createItem(
    "Core Explorer's Compendium",
    "inv_10_inscription2_book2_color3",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    null,
    "Off Hand",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("1h")],
    [
      secondaryStatArrayRare("stamina", "1h"),
      secondaryStatArrayRare("Random Stat 1", "1h"),
      secondaryStatArrayRare("Random Stat 2", "1h"),
    ]
  );
  const overseersWrithebarkStave = await createItem(
    "Overseer's Writhebark Stave",
    "inv_staff_2h_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Staff",
    "Two-Hand",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("2h-int")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const pioneersWrithebarkStave = await createItem(
    "Pioneer's Writhebark Stave",
    "inv_staff_2h_dragonquest_b_02",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Staff",
    "Two-Hand",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const emberscaleSigil = await createItem(
    "Emberscale Sigil",
    "spell_fire_rune",
    null,
    1000,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Darkmoon Sigil"],
    "+20/15/10 Recipe Difficulty (based on quality). Provides the following property: Your Darkmoon Deck no longer has Even cards."
  );
  const jetscaleSigil = await createItem(
    "Jetscale Sigil",
    "spell_shadow_rune",
    null,
    1000,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Darkmoon Sigil"],
    "+20/15/10 Recipe Difficulty (based on quality). Provides the following property: Your Darkmoon Deck no longer shuffles when the Ace is drawn."
  );
  const sagescaleSigil = await createItem(
    "Sagescale Sigil",
    "spell_nature_rune",
    null,
    1000,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Darkmoon Sigil"],
    "+20/15/10 Recipe Difficulty (based on quality). Provides the following property: Your Darkmoon Deck only shuffles when you jump."
  );
  const azurescaleSigil = await createItem(
    "Azurescale Sigil",
    "spell_ice_rune",
    null,
    1000,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Darkmoon Sigil"],
    "+20/15/10 Recipe Difficulty (based on quality). Provides the following property: Your Darkmoon Deck now shuffles from greatest to least."
  );
  const bronzescaleSigil = await createItem(
    "Bronzescale Sigil",
    "spell_holy_rune",
    null,
    1000,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Darkmoon Sigil"],
    "+20/15/10 Recipe Difficulty (based on quality). Provides the following property: Your Darkmoon Deck shuffles faster."
  );
  const vantusRuneVaultOfTheIncarnates = await createItem(
    "Vantus Rune: Vault of the Incarnates",
    "inv_10_inscription_vantusrune_color4",
    null,
    20,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Attune yourself to the energies of the targeted Vault of the Incarnates raid boss, increasing your Versatility by ?/359/399 (based on quality) when fighting that boss. This effect lasts for an entire week. You can only use one Vantus Rune per week."
  );
  const buzzingRune = await createItem(
    "Buzzing Rune",
    "inv_misc_rune_08",
    null,
    20,
    "A droning sound emanates from the carving.",
    "Might be the new weapon oil?",
    "Uncommon",
    "Crafting Reagent",
    3,
    null,
    null,
    "Imbue your weapon with the energy of a Dragonfly, increasing Critical Strike Rating by 579/707/827 (based on quality) for 2 hours."
  );
  const chirpingRune = await createItem(
    "Chirping Rune",
    "inv_misc_rune_09",
    null,
    20,
    "You hear a faint chirping.",
    "Might be the new weapon oil?",
    "Uncommon",
    "Crafting Reagent",
    3,
    null,
    null,
    "Imbue your weapon with the energy of an Ohuna. Your healing spells have a high chance to heal your target for an additional 5025/6125/7987 healing (based on quality) for 2 hours."
  );
  const howlingRune = await createItem(
    "Howling Rune",
    "inv_misc_rune_05",
    null,
    20,
    "You hear a Bakar howl in the distance.",
    "Might be the new weapon oil?",
    "Uncommon",
    "Crafting Reagent",
    3,
    null,
    null,
    "Imbue your weapon with the energy of a Bakar, increasing Haste by 579/707/827 (based on quality) for 2 hours."
  );
  const alchemistsBrilliantMixingRod = await createItem(
    "Alchemist's Brilliant Mixing Rod",
    "inv_staff_2h_alchemy_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Alchemy Tool",
    null,
    null,
    [346, 352, 358, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const chefsSplendidRollingPin = await createItem(
    "Chef's Splendid Rolling Pin",
    "inv_misc_1h_rollingpin_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Cooking Tool",
    null,
    null,
    [346, 352, 358, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [
      ["Resourcefulness", 32, "?", "?", 40, 44],
      ["Crafting Speed", 48, "?", "?", 60, 66],
    ]
  );
  const scribesResplendentQuill = await createItem(
    "Scribe's Resplendent Quill",
    "inv_misc_1h_scribesquill_b_01_gold",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Inscription Tool",
    null,
    null,
    [346, 352, 358, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const alchemistsSturdyMixingRod = await createItem(
    "Alchemist's Sturdy Mixing Rod",
    "inv_staff_2h_alchemy_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Alchemy Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const chefsSmoothRollingPin = await createItem(
    "Chef's Smooth Rolling Pin",
    "inv_misc_1h_rollingpin_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Cooking Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "small"),
    [
      ["Resourcefulness", 23, "?", "?", "?", 32],
      ["Crafting Speed", 35, "?", "?", "?", 48],
    ]
  );
  const scribesFastenedQuill = await createItem(
    "Scribe's Fastened Quill",
    "inv_misc_1h_scribesquill_b_01_gold",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Inscription Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const illusionParchmentWhirlingBreeze = await createItem(
    "Illusion Parchment: Whirling Breeze",
    "inv_10_inscription_illusoryspellscrolls_color1",
    null,
    1000,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Cast a Whirling Breeze Illusion at another player! Cannot be used in Arenas, Battlegrounds, or while in combat."
  );
  const illusionParchmentAquaTorrent = await createItem(
    "Illusion Parchment: Aqua Torrent",
    "inv_10_inscription_illusoryspellscrolls_color2",
    null,
    1000,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Cast an Aqua Torrent Illusion at another player! Cannot be used in Arenas, Battlegrounds, or while in combat."
  );
  const illusionParchmentArcaneBurst = await createItem(
    "Illusion Parchment: Arcane Burst",
    "inv_10_inscription_illusoryspellscrolls_color5",
    null,
    1000,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Cast an Arcane Burst Illusion at another player! Cannot be used in Arenas, Battlegrounds, or while in combat."
  );
  const illusionParchmentChillingWind = await createItem(
    "Illusion Parchment: Chilling Wind",
    "inv_10_inscription_illusoryspellscrolls_color8",
    null,
    1000,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Cast a Chilling Wind Illusion at another player! Cannot be used in Arenas, Battlegrounds, or while in combat."
  );
  const illusionParchmentLoveCharm = await createItem(
    "Illusion Parchment: Love Charm",
    "inv_10_inscription_illusoryspellscrolls_color4",
    null,
    1000,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Cast a Love Charm Illusion at another player in your party! Cannot be used in Arenas, Battlegrounds, or while in combat."
  );
  const illusionParchmentMagmaMissile = await createItem(
    "Illusion Parchment: Magma Missile",
    "inv_10_inscription_illusoryspellscrolls_color10",
    null,
    1000,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Cast a Magma Missile Illusion at another player! Cannot be used in Arenas, Battlegrounds, or while in combat."
  );
  const illusionParchmentShadowOrb = await createItem(
    "Illusion Parchment: Shadow Orb",
    "inv_10_inscription_illusoryspellscrolls_color3",
    null,
    1000,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Cast a Shadow Orb Illusion at another player! Cannot be used in Arenas, Battlegrounds, or while in combat."
  );
  const illusionParchmentSpellShield = await createItem(
    "Illusion Parchment: Spell Shield",
    "inv_10_inscription_illusoryspellscrolls_color6",
    null,
    1000,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Prevent all Illusory Parchment spells from being cast on you for 30 min."
  );
  const scrollOfSales = await createItem(
    "Scroll of Sales",
    "inv_enchant_formulaepic_01",
    "Pickup",
    200,
    "Contractually demands the presence of an independent merchant.",
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Summons a vendor of general goods for 5 min. Supplies vary with the scroll's quality. (6 Hrs Cooldown)"
  );
  const bundleOCardsDragonIsles = await createItem(
    "Bundle O' Cards: Dragon Isles",
    "inv_10_inscription_darkmooncards2_darkmoonboosterpack_color1",
    null,
    1000,
    null,
    null,
    "Rare",
    null,
    1,
    null,
    null,
    "Tear open for some Darkmoon Cards! Contains cards only native to the Dragon Isles."
  );
  const fatedFortuneCard = await createItem(
    "Fated Fortune Card",
    "inv_10_specialization_inscription_fortunecard_front_color1",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Flip a card to see your fortune."
  );
  //4 extractions of awakened elements, but like, they just yield awakened elements...
  const contractIskaaraTuskarr = await createItem(
    "Contract: Iskaara Tuskarr",
    "inv_10_inscription2_repcontracts_70_professions_scroll_02_uprez_color1",
    null,
    20,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Enter a contract with the Iskaara Tuskarr that allows you to gain 10/12/15 reputation (based on quality) with them every time you complete a world quest in the Dragon Isles."
  );
  const contractArtisansConsortium = await createItem(
    "Contract: Artisan's Consortium",
    "inv_10_inscription2_repcontracts_70_professions_scroll_02_uprez",
    null,
    20,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Enter a contract with the Artisan's Consortium that allows you to gain 10/12/15 reputation (based on quality) with them every time you complete a world quest in the Dragon Isles."
  );
  const contractDragonscaleExpedition = await createItem(
    "Contract: Dragonscale Expedition",
    "inv_10_inscription2_repcontracts_70_professions_scroll_02_uprez_color4",
    null,
    20,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Enter a contract with the Dragonscale Expedition that allows you to gain 10/12/15 reputation (based on quality) with them every time you complete a world quest in the Dragon Isles."
  );
  const contractMaruukCentaur = await createItem(
    "Contract: Maruuk Centaur",
    "inv_10_inscription2_repcontracts_70_professions_scroll_02_uprez_color3",
    null,
    20,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Enter a contract with the Maruuk Centaur that allows you to gain 10/12/15 reputation (based on quality) with them every time you complete a world quest in the Dragon Isles."
  );
  const contractValdrakkenAccord = await createItem(
    "Contract: Valdrakken Accord",
    "inv_10_inscription2_repcontracts_70_professions_scroll_02_uprez_color2",
    null,
    20,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Enter a contract with the Valdrakken Accord that allows you to gain 10/12/15 reputation (based on quality) with them every time you complete a world quest in the Dragon Isles."
  );
  const draconicTreatiseOnAlchemy = await createItem(
    "Draconic Treatise on Alchemy",
    "inv_misc_profession_book_alchemy",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Alchemists. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Alchemy Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Alchemy: 25 }
  );
  const draconicTreatiseOnBlacksmithing = await createItem(
    "Draconic Treatise on Blacksmithing",
    "inv_misc_profession_book_blacksmithing",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Blacksmiths. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Blacksmithing Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Blacksmithing: 25 }
  );
  const draconicTreatiseOnEnchanting = await createItem(
    "Draconic Treatise on Enchanting",
    "inv_misc_profession_book_enchanting",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Enchanters. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Enchanting Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Enchanting: 25 }
  );
  const draconicTreatiseOnEngineering = await createItem(
    "Draconic Treatise on Engineering",
    "inv_misc_profession_book_engineering_color1",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Engineers. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Engineering Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Engineering: 25 }
  );
  const draconicTreatiseOnHerbalism = await createItem(
    "Draconic Treatise on Herbalism",
    "inv_misc_profession_book_herbalism",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Herbalists. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Herbalism Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Herbalism: 25 }
  );
  const draconicTreatiseOnInscription = await createItem(
    "Draconic Treatise on Inscription",
    "inv_misc_profession_book_inscription",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Scribes. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Inscription Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Inscription: 25 }
  );
  const draconicTreatiseOnJewelcrafting = await createItem(
    "Draconic Treatise on Jewelcrafting",
    "inv_misc_profession_book_jewelcrafting",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Jewelcrafters. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Jewelcrafting Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Jewelcrafting: 25 }
  );
  const draconicTreatiseOnLeatherworking = await createItem(
    "Draconic Treatise on Leatherworking",
    "inv_misc_profession_book_leatherworking",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Leatherworkers. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Leatherworking Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Leatherworking: 25 }
  );
  const draconicTreatiseOnMining = await createItem(
    "Draconic Treatise on Mining",
    "inv_misc_profession_book_mining",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Miners. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Mining Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Mining: 25 }
  );
  const draconicTreatiseOnSkinning = await createItem(
    "Draconic Treatise on Skinning",
    "inv_misc_profession_book_skinning_color1",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Skinners. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Skinning Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Skinning: 25 }
  );
  const draconicTreatiseOnTailoring = await createItem(
    "Draconic Treatise on Tailoring",
    "inv_misc_profession_book_tailoring",
    "Pickup",
    200,
    "Contains notes on various tricks of the trade used by Tailors. Can only be studied once a week.",
    "'Once a week' resets on your weekly reset day.",
    "Rare",
    null,
    1,
    null,
    null,
    "Study to increase your Dragon Isles Tailoring Knowledge by 1.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Tailoring: 25 }
  );

  const makeDragonInscriptionItem = async (
    drakeName,
    customizationName,
    iconName
  ) => {
    return await createItem(
      `${drakeName}: ${customizationName}`,
      iconName,
      "Pickup",
      1,
      null,
      null,
      "Rare",
      "Drakewatcher Manuscript",
      1,
      null,
      null,
      `Unlocks this customization option for the ${drakeName} at the Rostrum of Transformation.`
    );
  };

  const renewedProtoDrakeSilverAndBlueArmor = await makeDragonInscriptionItem(
    "Renewed Proto-Drake",
    "Silver and Blue Armor",
    "inv_glyph_majordeathknight"
  );
  const renewedProtoDrakeSteelAndYellowArmor = await makeDragonInscriptionItem(
    "Renewed Proto-Drake",
    "Steel and Yellow Armor",
    "inv_glyph_majordeathknight"
  );
  const renewedProtoDrakeBovineHorns = await makeDragonInscriptionItem(
    "Renewed Proto-Drake",
    "Bovine Horns",
    "inv_glyph_minordeathknight"
  );
  const renewedProtoDrakePredatorPattern = await makeDragonInscriptionItem(
    "Renewed Proto-Drake",
    "Predator Pattern",
    "inv_glyph_majordeathknight"
  );
  const renewedProtoDrakeSpinedCrest = await makeDragonInscriptionItem(
    "Renewed Proto-Drake",
    "Spined Crest",
    "inv_glyph_minordeathknight"
  );
  const windborneVelocidrakeSilverAndBlueArmor =
    await makeDragonInscriptionItem(
      "Windborne Velocidrake",
      "Silver and Blue Armor",
      "inv_glyph_majorhunter"
    );
  const windborneVelocidrakeSteelAndOrangeArmor =
    await makeDragonInscriptionItem(
      "Windborne Velocidrake",
      "Steel and Orange Armor",
      "inv_glyph_majorhunter"
    );
  const windborneVelocidrakeBlackFur = await makeDragonInscriptionItem(
    "Windborne Velocidrake",
    "Black Fur",
    "inv_glyph_minorhunter"
  );
  const windborneVelocidrakeSpinedHead = await makeDragonInscriptionItem(
    "Windborne Velocidrake",
    "Spined Head",
    "inv_glyph_minorhunter"
  );
  const windborneVelocidrakeWindsweptPattern = await makeDragonInscriptionItem(
    "Windborne Velocidrake",
    "Windswept Pattern",
    "inv_glyph_majorhunter"
  );
  const highlandDrakeSilverAndBlueArmor = await makeDragonInscriptionItem(
    "Highland Drake",
    "Silver and Blue Armor",
    "inv_glyph_majormage"
  );
  const highlandDrakeSteelAndYellowArmor = await makeDragonInscriptionItem(
    "Highland Drake",
    "Steel and Yellow Armor",
    "inv_glyph_majormage"
  );
  const highlandDrakeBlackHair = await makeDragonInscriptionItem(
    "Highland Drake",
    "Black Hair",
    "inv_glyph_minormage"
  );
  const highlandDrakeSpinedCrest = await makeDragonInscriptionItem(
    "Highland Drake",
    "Spined Crest",
    "inv_glyph_minormage"
  );
  const highlandDrakeSpinedThroat = await makeDragonInscriptionItem(
    "Highland Drake",
    "Spined Throat",
    "inv_glyph_minormage"
  );
  const cliffsideWylderdrakeSilverAndBlueArmor =
    await makeDragonInscriptionItem(
      "Cliffside Wylderdrake",
      "Silver and Blue Armor",
      "inv_glyph_majordruid"
    );
  const cliffsideWylderdrakeSteelAndYellowArmor =
    await makeDragonInscriptionItem(
      "Cliffside Wylderdrake",
      "Steel and Yellow Armor",
      "inv_glyph_majordruid"
    );
  const cliffsideWylderdrakeConicalHead = await makeDragonInscriptionItem(
    "Cliffside Wylderdrake",
    "Conical Head",
    "inv_glyph_minordruid"
  );
  const cliffsideWylderdrakeRedHair = await makeDragonInscriptionItem(
    "Cliffside Wylderdrake",
    "Red Hair",
    "inv_glyph_minordruid"
  );
  const cliffsideWylderdrakeTripleHeadHorns = await makeDragonInscriptionItem(
    "Cliffside Wylderdrake",
    "Triple Head Horns",
    "inv_glyph_minordruid"
  );

  // //jewelcrafting items
  const silkenGemdust = await createItem(
    "Silken Gemdust",
    "inv_enchanting_wod_dust4",
    null,
    1000,
    "Acquired by Jewelcrafters by crushing gems from the Dragon Isles. Can be bought and sold on the auction house.",
    "Crushing gems is like prospecting, but instead of ore, you destroy 5 gems.",
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const queensRuby = await createItem(
    "Queen's Ruby",
    "inv_10_jewelcrafting_gem1leveling_uncut_red",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const mysticSapphire = await createItem(
    "Mystic Sapphire",
    "inv_10_jewelcrafting_gem1leveling_uncut_blue",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const vibrantEmerald = await createItem(
    "Vibrant Emerald",
    "inv_10_jewelcrafting_gem1leveling_uncut_green",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const sunderedOnyx = await createItem(
    "Sundered Onyx",
    "inv_10_jewelcrafting_gem1leveling_uncut_black",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const eternityAmber = await createItem(
    "Eternity Amber",
    "inv_10_jewelcrafting_gem1leveling_uncut_bronze",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Uncommon",
    "Crafting Reagent",
    3
  );
  const alexstraszite = await createItem(
    "Alexstraszite",
    "inv_10_jewelcrafting_gem2standard_uncut_red",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const malygite = await createItem(
    "Malygite",
    "inv_10_jewelcrafting_gem2standard_uncut_blue",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const ysemerald = await createItem(
    "Ysemerald",
    "inv_10_jewelcrafting_gem2standard_uncut_green",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const neltharite = await createItem(
    "Neltharite",
    "inv_10_jewelcrafting_gem2standard_uncut_black",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const nozdorite = await createItem(
    "Nozdorite",
    "inv_10_jewelcrafting_gem2standard_uncut_bronze",
    null,
    1000,
    "Acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const illimitedDiamond = await createItem(
    "Illimited Diamond",
    "inv_10_jewelcrafting_gem3primal_uncut_transparent",
    null,
    1000,
    "This highly desirable diamond is acquired by Jewelcrafters when prospecting ore from the Dragon Isles. Can be bought and sold on the auction house.",
    null,
    "Epic",
    "Crafting Reagent",
    3
  );
  const elementalHarmony = await createItem(
    "Elemental Harmony",
    "inv_10_elementalcombinedfoozles_primordial",
    null,
    1000,
    "A harmonious union between the gems of the Dragon Isles with Awakened Elements, crafted by jewelcrafters with the assistance of alchemists. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const blottingSand = await createItem(
    "Blotting Sand",
    "inv_10_jewelcrafting_blottedsand_color2",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Blotting Sand"],
    "When crafting: You are 9/12/15% (based on quality) more likely to improve at Inscription, but Recipe Difficulty is increased by 18/24/30 (based on quality.)"
  );
  const pounce = await createItem(
    "Pounce",
    "inv_10_jewelcrafting_blottedsand_color4",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    3,
    ["Blotting Sand"],
    "When crafting: Increases bonus Skill from Inspiration by 7%/10%/12% (based on quality) and Inspiration by 30/40/50 (based on quality.)"
  );
  const emptySoulCage = await createItem(
    "Empty Soul Cage",
    "inv_10_jewelcrafting3_soulcage_empty",
    null,
    1000,
    "Crafted by Jewelcrafters to be used with the Zapthrottle Soul Inhaler, created by Engineers. Elemental souls can be captured with this for use in many powerful crafts, or shattered as a cruel way to acquire awakened essences.",
    "'Ammo' for the Zapthrottle Soul Inhaler. Needed to get Elemental Souls.",
    "Rare"
  );
  const draconicVial = await createItem(
    "Draconic Vial",
    "inv_10_alchemy_bottle_shape1_empty",
    null,
    1000,
    "Purchased from tradeskill vendors. Jewelcrafters can also craft this item at equal or higher qualities. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent",
    3
  );
  const framelessLens = await createItem(
    "Frameless Lens",
    "inv_10_jewelcrafting2_glasslens_color1",
    null,
    1000,
    "A basic reagent that Jewelcrafters make. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent",
    3
  );
  const glossyStone = await createItem(
    "Glossy Stone",
    "inv_stone_sharpeningstone_05",
    null,
    1000,
    "A basic reagent that Jewelcrafters make. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent",
    3
  );
  const shimmeringClasp = await createItem(
    "Shimmering Clasp",
    "inv_10_jewelcrafting2_gemsetting_color1",
    null,
    1000,
    "A basic reagent that Jewelcrafters make. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent",
    3
  );
  const energizedVibrantEmerald = await createItem(
    "Energized Vibrant Emerald",
    "inv_10_jewelcrafting_gem1leveling_cut_green",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    "+48/59/69 Haste (based on quality) & +48/59/69 Versatility (based on quality)"
  );
  const zenMysticSapphire = await createItem(
    "Zen Mystic Sapphire",
    "inv_10_jewelcrafting_gem1leveling_cut_blue",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    "+48/59/69 Versatility (based on quality) & +48/59/69 Mastery (based on quality)"
  );
  const craftyQueensRuby = await createItem(
    "Crafy Queen's Ruby",
    "inv_10_jewelcrafting_gem1leveling_cut_red",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    "+48/59/69 Critical Strike (based on quality) & +48/59/69 Haste (based on quality)"
  );
  const senseisSunderedOnyx = await createItem(
    "Sensei's Sundered Onyx",
    "inv_10_jewelcrafting_gem1leveling_cut_black",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    "+48/59/69 Mastery (based on quality) & +48/59/69 Critical Strike (based on quality)"
  );
  const solidEternityAmber = await createItem(
    "Solid Eternity Amber",
    "inv_10_jewelcrafting_gem1leveling_cut_green",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    "+61/?/88 Stamina (based on quality)"
  );
  const quickYsemerald = await createItem(
    "Quick Ysemerald",
    "inv_10_jewelcrafting_gem2standard_air_cut_green",
    null,
    200,
    null,
    null,
    "Rare",
    "Air Emerald",
    3,
    null,
    "+165/200/235 Haste (based on quality)"
  );
  const craftyAlexstraszite = await createItem(
    "Crafty Alexstraszite",
    "inv_10_jewelcrafting_gem2standard_air_cut_red",
    null,
    200,
    null,
    null,
    "Rare",
    "Air Ruby",
    3,
    null,
    "+131/163/187 Critical Strike (based on quality) & +61/75/88 Haste (based on quality)"
  );
  const energizedMalygite = await createItem(
    "Energized Malygite",
    "inv_10_jewelcrafting_gem2standard_air_cut_blue",
    null,
    200,
    null,
    null,
    "Rare",
    "Air Sapphire",
    3,
    null,
    "+131/163/187 Versatility (based on quality) & +61/75/88 Haste (based on quality)"
  );
  const forcefulNozdorite = await createItem(
    "Forceful Nozdorite",
    "inv_10_jewelcrafting_gem2standard_air_cut_bronze",
    null,
    200,
    null,
    null,
    "Rare",
    "Air Amber",
    3,
    null,
    "+141/171/200 Stamina (based on quality) & +123/149/176 Haste (based on quality)"
  );
  const keenNeltharite = await createItem(
    "Keen Neltharite",
    "inv_10_jewelcrafting_gem2standard_air_cut_black",
    null,
    200,
    null,
    null,
    "Rare",
    "Air Onyx",
    3,
    null,
    "+131/163/187 Mastery (based on quality) & +61/75/88 Haste (based on quality)"
  );
  const puissantNozdorite = await createItem(
    "Puissant Nozdorite",
    "inv_10_jewelcrafting_gem2standard_earth_cut_bronze",
    null,
    200,
    null,
    null,
    "Rare",
    "Earth Amber",
    3,
    null,
    "+141/171/200 Stamina (based on quality) & +123/149/176 Mastery (based on quality)"
  );
  const fracturedNeltharite = await createItem(
    "Fractured Neltharite",
    "inv_10_jewelcrafting_gem2standard_earth_cut_black",
    null,
    200,
    null,
    null,
    "Rare",
    "Earth Onyx",
    3,
    null,
    "+165/200/235 Mastery (based on quality)"
  );
  const keenYsemerald = await createItem(
    "Keen Ysemerald",
    "inv_10_jewelcrafting_gem2standard_earth_cut_green",
    null,
    200,
    null,
    null,
    "Rare",
    "Earth Emerald",
    3,
    null,
    "+131/163/187 Haste (based on quality) & +61/75/88 Mastery (based on quality)"
  );
  const senseisAlexstraszite = await createItem(
    "Sensei's Alexstraszite",
    "inv_10_jewelcrafting_gem2standard_earth_cut_red",
    null,
    200,
    null,
    null,
    "Rare",
    "Earth Ruby",
    3,
    null,
    "+131/163/187 Critical Strike (based on quality) & +61/75/88 Mastery (based on quality)"
  );
  const zenMalygite = await createItem(
    "Zen Malygite",
    "inv_10_jewelcrafting_gem2standard_earth_cut_blue",
    null,
    200,
    null,
    null,
    "Rare",
    "Earth Sapphire",
    3,
    null,
    "+131/163/187 Versatility (based on quality) & +61/75/88 Mastery (based on quality)"
  );
  const radiantMalygite = await createItem(
    "Radiant Malygite",
    "inv_10_jewelcrafting_gem2standard_fire_cut_blue",
    null,
    200,
    null,
    null,
    "Rare",
    "Fire Sapphire",
    3,
    null,
    "+131/163/187 Versatility (based on quality) & +61/75/88 Critical Strike (based on quality)"
  );
  const craftyYsemerald = await createItem(
    "Crafty Ysemerald",
    "inv_10_jewelcrafting_gem2standard_fire_cut_green",
    null,
    200,
    null,
    null,
    "Rare",
    "Fire Emerald",
    3,
    null,
    "+131/163/187 Haste (based on quality) & +61/75/88 Critical Strike (based on quality)"
  );
  const deadlyAlexstraszite = await createItem(
    "Deadly Alexstraszite",
    "inv_10_jewelcrafting_gem2standard_fire_cut_red",
    null,
    200,
    null,
    null,
    "Rare",
    "Fire Ruby",
    3,
    null,
    "+165/200/235 Critical Strike (based on quality)"
  );
  const jaggedNozdorite = await createItem(
    "Jagged Nozdorite",
    "inv_10_jewelcrafting_gem2standard_fire_cut_bronze",
    null,
    200,
    null,
    null,
    "Rare",
    "Fire Amber",
    3,
    null,
    "+141/171/200 Stamina (based on quality) & +123/149/176 Critical Strike (based on quality)"
  );
  const senseisNeltharite = await createItem(
    "Sensei's Neltharite",
    "inv_10_jewelcrafting_gem2standard_fire_cut_black",
    null,
    200,
    null,
    null,
    "Rare",
    "Fire Onyx",
    3,
    null,
    "+131/163/187 Mastery (based on quality) & +61/75/88 Critical Strike (based on quality)"
  );
  const energizedYsemerald = await createItem(
    "Energized Ysemerald",
    "inv_10_jewelcrafting_gem2standard_frost_cut_green",
    null,
    200,
    null,
    null,
    "Rare",
    "Frost Emerald",
    3,
    null,
    "+131/163/187 Haste (based on quality) & +61/75/88 Versatility (based on quality)"
  );
  const radiantAlexstraszite = await createItem(
    "Radiant Alexstraszite",
    "inv_10_jewelcrafting_gem2standard_frost_cut_red",
    null,
    200,
    null,
    null,
    "Rare",
    "Frost Ruby",
    3,
    null,
    "+131/163/187 Critical Strike (based on quality) & +61/75/88 Versatility (based on quality)"
  );
  const steadyNozdorite = await createItem(
    "Steady Nozdorite",
    "inv_10_jewelcrafting_gem2standard_frost_cut_bronze",
    null,
    200,
    null,
    null,
    "Rare",
    "Frost Amber",
    3,
    null,
    "+141/171/200 Stamina (based on quality) & +123/149/176 Versatility (based on quality)"
  );
  const stormyMalygite = await createItem(
    "Stormy Malygite",
    "inv_10_jewelcrafting_gem2standard_frost_cut_blue",
    null,
    200,
    null,
    null,
    "Rare",
    "Frost Sapphire",
    3,
    null,
    "+165/200/235 Versatility (based on quality)"
  );
  const zenNeltharite = await createItem(
    "Zen Neltharite",
    "inv_10_jewelcrafting_gem2standard_frost_cut_black",
    null,
    200,
    null,
    null,
    "Rare",
    "Frost Onyx",
    3,
    null,
    "+131/163/187 Mastery (based on quality) & +61/75/88 Versatility (based on quality)"
  );
  const fierceIllimitedDiamond = await createItem(
    "Fierce Illimited Diamond",
    "inv_10_jewelcrafting_gem3primal_cut_green",
    "Pickup",
    200,
    null,
    null,
    "Epic",
    null,
    3,
    null,
    "+141/171/200 Primary Stat (based on quality) & +123/149/176 Haste (based on quality)",
    null,
    null,
    null,
    "Primalist Gem (1)"
  );
  const inscribedIllimitedDiamond = await createItem(
    "Inscribed Illimited Diamond",
    "inv_10_jewelcrafting_gem3primal_cut_red",
    "Pickup",
    200,
    null,
    null,
    "Epic",
    null,
    3,
    null,
    "+141/171/200 Primary Stat (based on quality) & +123/149/176 Critical Strike (based on quality)",
    null,
    null,
    null,
    "Primalist Gem (1)"
  );
  const resplendentIllimitedDiamond = await createItem(
    "Resplendent Illimited Diamond",
    "inv_10_jewelcrafting_gem3primal_cut_blue",
    "Pickup",
    200,
    null,
    null,
    "Epic",
    null,
    3,
    null,
    "+141/171/200 Primary Stat (based on quality) & +123/149/176 Versatility (based on quality)",
    null,
    null,
    null,
    "Primalist Gem (1)"
  );
  const skillfulIllimitedDiamond = await createItem(
    "Skillful Illimited Diamond",
    "inv_10_jewelcrafting_gem3primal_cut_black",
    "Pickup",
    200,
    null,
    null,
    "Epic",
    null,
    3,
    null,
    "+141/171/200 Primary Stat (based on quality) & +123/149/176 Mastery (based on quality)",
    null,
    null,
    null,
    "Primalist Gem (1)"
  );
  const tieredMedallionSetting = await createItem(
    "Tiered Medallion Setting",
    "inv_jewelcrafting_thoriumsetting",
    null,
    200,
    null,
    "Up to three sockets per neck? Yes please.",
    "Rare",
    null,
    3,
    null,
    null,
    "Add one socket to an end-game Dragonflight Necklace. A necklace can have up to three sockets. The quality of this item determines up to how many sockets it can add."
  );
  const idolOfTheDreamer = await createItem(
    "Idol of the Dreamer",
    "inv_10_jewelcrafting_trinket_stonedragon1_color2",
    "Pickup",
    1,
    "Whatever comes, I know you will face it with courage.",
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to grant 14/14/14/?/15 Haste (based on quality) per Ysemerald you have equipped. Upon reaching 15 stacks, all stacks are consumed and you gain 242/?/245/?/270 secondary stats (based on quality), split evenly for 15 sec.",
    null,
    null,
    "Trinket",
    "Idol of the Aspects (1)",
    [382, 384, 386, 389, 392],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      ["?", "?", "?", "?", 361],
    ]
  );
  const idolOfTheEarthWarder = await createItem(
    "Idol of the Earth Warder",
    "inv_10_jewelcrafting_statue_color5",
    "Pickup",
    1,
    "It is done. All have given that which must be given. I now seal the Dragon Soul forever.",
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to grant 14/14/14/?/15 Mastery (based on quality) per Neltharite you have equipped. Upon reaching 15 stacks, all stacks are consumed and you gain 242/?/245/?/270 secondary stats (based on quality), split evenly for 15 sec.",
    null,
    null,
    "Trinket",
    "Idol of the Aspects (1)",
    [382, 384, 386, 389, 392],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      ["?", "?", "?", "?", 361],
    ]
  );
  const idolOfTheLifebinder = await createItem(
    "Idol of the Lifebinder",
    "inv_10_jewelcrafting_trinket_stonedragon2_color2",
    "Pickup",
    1,
    "Tomorrow will bring you new challenges, and you must be ready to face them.",
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to grant 14/14/14/?/15 Critical Strike (based on quality) per Alexstraszite you have equipped. Upon reaching 15 stacks, all stacks are consumed and you gain 242/?/245/?/270 secondary stats (based on quality), split evenly for 15 sec.",
    null,
    null,
    "Trinket",
    "Idol of the Aspects (1)",
    [382, 384, 386, 389, 392],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      ["?", "?", "?", "?", 361],
    ]
  );
  const idolOfTheSpellWeaver = await createItem(
    "Idol of the Spell-Weaver",
    "inv_10_jewelcrafting_trinket_stonedragon3_color1",
    "Pickup",
    1,
    "I have lost much in my time, mortal, too much in fact.",
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to grant 14/14/14/?/15 Versatility (based on quality) per Malygite you have equipped. Upon reaching 15 stacks, all stacks are consumed and you gain 242/?/245/?/270 secondary stats (based on quality), split evenly for 15 sec.",
    null,
    null,
    "Trinket",
    "Idol of the Aspects (1)",
    [382, 384, 386, 389, 392],
    [
      ["Agility", "Intellect", "Strength", "", ""],
      ["?", "?", "?", "?", 361],
    ]
  );
  const chokerOfShielding = await createItem(
    "Choker of Shielding",
    "inv_10_jewelcrafting_necklace_necklace1_color1",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    "Drain the elemental energies from you and your gems, sacrificing 40/41/42/43/44 (based on quality) from each of their associated stats to shield yourself for 14478/?/15082/?/16036 (based on quality) per gem socketed for 10 sec. These stats are returned to you when the shield is broken or expires. (3 Min Cooldown)",
    null,
    "Neck",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    null,
    [
      secondaryStatArrayEpic("stamina", "jewelry"),
      secondaryStatArrayEpic("Random Stat 1", "jewelry"),
      secondaryStatArrayEpic("Random Stat 2", "jewelry"),
      ["Prismatic Socket", null, null, null, null, null],
    ]
  );
  const elementalLariat = await createItem(
    "Elemental Lariat",
    "inv_10_jewelcrafting_necklace_necklace1_color3",
    "Pickup",
    1,
    null,
    "Unsure if the associated stat is based on the gem type (ie, Alexstraszite = Crit) or element type (ie, Air = Haste)",
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to empower one of your socketed elemental gems, granting 429/?/445/?/471 of their associated stat (based on quality) for 12 sec.",
    null,
    null,
    "Neck",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    null,
    [
      secondaryStatArrayEpic("stamina", "jewelry"),
      secondaryStatArrayEpic("Random Stat 1", "jewelry"),
      secondaryStatArrayEpic("Random Stat 2", "jewelry"),
      ["Prismatic Socket", null, null, null, null, null],
    ]
  );
  const ringBoundHourglass = await createItem(
    "Ring-Bound Hourglass",
    "inv_10_jewelcrafting_rings_ring2_color1",
    "Pickup",
    1,
    null,
    "WHERE DOES IT GO??",
    "Epic",
    null,
    5,
    null,
    null,
    "Visit a place you may have long since forgotten. (20 Hr Cooldown)",
    null,
    "Ring",
    "Ring-Bound Hourglass",
    [382, 384, 386, 389, 392],
    null,
    [
      secondaryStatArrayEpic("stamina", "jewelry"),
      secondaryStatArrayEpic("Random Stat 1", "jewelry"),
      secondaryStatArrayEpic("Random Stat 2", "jewelry"),
      ["Prismatic Socket", null, null, null, null, null],
    ]
  );
  const signetOfTitanicInsight = await createItem(
    "Signet of Titanic Insight",
    "inv_10_jewelcrafting_rings_ring2_color3",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    null,
    "Ring",
    "Signet of Titanic Insight",
    [382, 384, 386, 389, 392],
    null,
    [
      secondaryStatArrayEpic("stamina", "jewelry"),
      secondaryStatArrayEpic("Random Stat 1", "jewelry"),
      secondaryStatArrayEpic("Random Stat 2", "jewelry"),
      ["Prismatic Socket", null, null, null, null, null],
    ]
  );
  const torcOfPassedTime = await createItem(
    "Torc of Passed Time",
    "inv_10_jewelcrafting_necklace_necklace1_color2",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    null,
    "Neck",
    null,
    [382, 384, 386, 389, 392],
    null,
    [
      secondaryStatArrayEpic("stamina", "jewelry"),
      secondaryStatArrayEpic("Random Stat 1", "jewelry"),
      secondaryStatArrayEpic("Random Stat 2", "jewelry"),
      ["Prismatic Socket", null, null, null, null, null],
    ]
  );
  const crimsonCombatantsJeweledAmulet = await createItem(
    "Crimson Combatant's Jeweled Amulet",
    "inv_10_jewelcrafting_necklace_necklace2_color3",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    null,
    "Neck",
    null,
    [333, 335, 337, 340, 343],
    null,
    [
      secondaryStatArrayRare("stamina", "jewelry"),
      secondaryStatArrayRare("Versatility", "jewelry"),
      secondaryStatArrayRare("Random Stat 2", "jewelry"),
      ["Prismatic Socket", null, null, null, null, null],
    ]
  );
  const crimsonCombatantsJeweledSignet = await createItem(
    "Crimson Combatant's Jeweled Signet",
    "inv_10_jewelcrafting_rings_ring3_color2",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    null,
    "Ring",
    "Crimson Combatant's Jeweled Signet",
    [333, 335, 337, 340, 343],
    null,
    [
      secondaryStatArrayRare("stamina", "jewelry"),
      secondaryStatArrayRare("Versatility", "jewelry"),
      secondaryStatArrayRare("Random Stat 2", "jewelry"),
      ["Prismatic Socket", null, null, null, null, null],
    ]
  );
  const bandOfNewBeginnings = await createItem(
    "Band of New Beginnings",
    "inv_10_jewelcrafting_rings_ring1_color1",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    null,
    "Ring",
    "Band of New Beginnings",
    [306, 308, 310, 313, 316],
    null,
    [
      secondaryStatArrayBaby("stamina", "jewelry"),
      secondaryStatArrayBaby("Random Stat 1", "jewelry"),
      secondaryStatArrayBaby("Random Stat 2", "jewelry"),
      ["Prismatic Socket", null, null, null, null, null],
    ]
  );
  const pendantOfImpendingPerils = await createItem(
    "Pendant of Impending Perils",
    "inv_10_jewelcrafting_necklace_necklace3_color1",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    null,
    "Neck",
    null,
    [306, 308, 310, 313, 316],
    null,
    [
      secondaryStatArrayBaby("stamina", "jewelry"),
      secondaryStatArrayBaby("Random Stat 1", "jewelry"),
      secondaryStatArrayBaby("Random Stat 2", "jewelry"),
      ["Prismatic Socket", null, null, null, null, null],
    ]
  );
  const djaradinsPinata = await createItem(
    `Djaradin's "Pinata"`,
    "inv_komododragon_stone",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Place an intimidating statue of a decapitated dragon onto the battlefield nearby which can be attacked by players of either faction. Once destroyed, it will drop a random battleground buff that anyone can claim. Can only be used in War Mode on the Dragon Isles and in unrated battlegrounds. (15 Min Cooldown)"
  );
  const narcissistsSculpture = await createItem(
    "Narcissist's Sculpture",
    "achievement_pvp_legion01",
    "Pickup",
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Place a luxurious statue of yourself nearby which increases your size and Primary Stat while you admire your glorious self. Try not to let it go to your head. Can only be used on the Dragon Isles. (3 Min Cooldown)"
  );
  const kaluakFigurine = await createItem(
    "Kalu'ak Figurine",
    "trade_archaeology_tuskarr_stele",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Place a pristine figurine inspired by the tuskarr culture which grants +15 Fishing Skill to everyone who stands near it for 1.5/5/10 min (based on quality). (3/5/10 Min Cooldown)"
  );
  const statueOfTyrsHerald = await createItem(
    "Statue of Tyr's Herald",
    "achievement_boss_maidenofgrief",
    "Pickup",
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Place a remarkable statue of a Titan Keeper nearby for 2 min. Players who /kneel before the statue will have their worthiness judged. A player's worthiness can only be judged once every 1 hour. Can only be used on the Dragon Isles. (3 Min Cooldown)"
  );
  const revitalizingRedCarving = await createItem(
    "Revitalizing Red Carving",
    "inv_10_jewelcrafting_statue_color4",
    "Pickup",
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Place a glorious draconic statue on the ground nearby where it will heal you for a short time before its power fades. Can only be used on the Dragon Isles. (3 Min Cooldown)"
  );
  const jeweledAmberWhelpling = await createItem(
    "Jeweled Amber Whelpling",
    "inv_dragonwhelp3_gemmed_bronze",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    "Pet",
    1,
    null,
    null,
    "Teaches you how to summon and dismiss this companion."
  );
  const jeweledEmeraldWhelpling = await createItem(
    "Jeweled Emerald Whelpling",
    "inv_dragonwhelp3_gemmed_green",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    "Pet",
    1,
    null,
    null,
    "Teaches you how to summon and dismiss this companion."
  );
  const jeweledOnyxWhelpling = await createItem(
    "Jeweled Onyx Whelpling",
    "inv_dragonwhelp3_gemmed_black",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    "Pet",
    1,
    null,
    null,
    "Teaches you how to summon and dismiss this companion."
  );
  const jeweledRubyWhelpling = await createItem(
    "Jeweled Ruby Whelpling",
    "inv_dragonwhelp3_gemmed_red",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    "Pet",
    1,
    null,
    null,
    "Teaches you how to summon and dismiss this companion."
  );
  const jeweledSapphireWhelpling = await createItem(
    "Jeweled Sapphire Whelpling",
    "inv_dragonwhelp3_gemmed_blue",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    "Pet",
    1,
    null,
    null,
    "Teaches you how to summon and dismiss this companion."
  );
  const convergentPrism = await createItem(
    "Convergent Prism",
    "inv_10_jewelcrafting3_rainbowprism_color1",
    null,
    1,
    null,
    null,
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your Toy Box. Clutch the enchanted prism in your hand to guide a beam of light to very precise locations. The beam is only visible to members of your party or raid. (5 Sec Cooldown)"
  );
  const jeweledOffering = await createItem(
    "Jeweled Offering",
    "inv_jewelry_necklace_15",
    null,
    1,
    null,
    null,
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your Toy Box. Humbly offer your most prized possession to whomever considers you worthy enough to accept it. (1 Day Cooldown)"
  );
  const projectionPrism = await createItem(
    "Projection Prism",
    "inv_10_jewelcrafting_prism_blue",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Crafting Reagent",
    3,
    null,
    null,
    "Copy the appearance of a targeted party or raid member."
  );
  const rhinestoneSunglasses = await createItem(
    '"Rhinestone" Sunglasses',
    "inv_helmet_176",
    "Equip",
    1,
    null,
    null,
    "Rare",
    "Cosmetic",
    1,
    null,
    null,
    "Add this appearance to your collection.",
    null,
    "Head"
  );
  const splitLensSpecs = await createItem(
    "Split-Lens Specs",
    "inv_helm_glasses_b_04_gold_black",
    "Equip",
    1,
    null,
    null,
    "Rare",
    "Cosmetic",
    1,
    null,
    null,
    "Add this appearance to your collection.",
    null,
    "Head"
  );
  const alexstrasziteLoupes = await createItem(
    "Alexstraszite Loupes",
    "inv_helm_armor_jewelersspecs_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Jewelcrafting Accessory",
    "Head",
    "Head (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Inspiration", 38, "?", 44, 48, "?"],
      ["Multicraft", 25, "?", 30, 32, "?"],
    ]
  );
  const finePrintTrifocals = await createItem(
    "Fine-Print Trifocals",
    "inv_helm_armor_scribesspecs_b_01_silver",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Inscription Accessory",
    "Head",
    "Head (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Inspiration", 38, "?", 44, 48, "?"],
      ["Multicraft", 25, "?", 30, 32, "?"],
    ]
  );
  const magnificentMarginMagnifier = await createItem(
    "Magnificent Margin Magnifier",
    "inv_professions_inscription_scribesmagnifyingglass_gold",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Inscription Accessory",
    "Magnifying Glass",
    "Magnifying Glass (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [["Resourcefulness", 25, "?", 30, 32, "?"]]
  );
  const resonantFocus = await createItem(
    "Resonant Focus",
    "inv_offhand_draenei_a_02",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Enchanting Accessory",
    "Focus",
    "Focus (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Resourcefulness", 19, 21, 22, "?", "?"],
      ["Crafting Speed", 45, 48, 52, "?", "?"],
    ]
  );
  const boldPrintBifocals = await createItem(
    "Bold-Print Bifocals",
    "inv_helm_armor_scribesspecs_b_01_gold",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Inscription Accessory",
    "Head",
    "Head (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Inspiration", 28, "?", 32, "?", 38],
      ["Multicraft", 18, "?", 21, "?", 25],
    ]
  );
  const chromaticFocus = await createItem(
    "Chromatic Focus",
    "inv_offhand_draenei_a_02",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Enchanting Accessory",
    "Focus",
    "Focus (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Resourcefulness", 14, "?", 16, 17, 19],
      ["Crafting Speed", 32, "?", 37, 41, 45],
    ]
  );
  const leftHandedMagnifyingGlass = await createItem(
    "Left-Handed Magnifying Glass",
    "inv_professions_inscription_scribesmagnifyingglass_silver",
    "Equip",
    1,
    "In the jeweler's quest to make the mundane seem luxurious, they somehow designed a magnifying glass that can only be held by the left hand.",
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Inscription Accessory",
    "Magnifying Glass",
    "Magnifying Glass (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Resourcefulness", 18, "?", "?", "?", 25],
      ["Crafting Speed", 28, "?", "?", "?", 38],
    ]
  );
  const sunderedOnyxLoupes = await createItem(
    "Sundered Onyx Loupes",
    "inv_helm_armor_jewelersspecs_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Jewelcrafting Accessory",
    "Head",
    "Head (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Inspiration", 28, "?", 32, 35, 38],
      ["Multicraft", 18, "?", 21, 23, 25],
    ]
  );
  const jeweledDragonsHeart = await createItem(
    "Jeweled Dragon's Heart",
    "inv_10_jewelcrafting3_rainbowgemstone_color1",
    "Pickup",
    1,
    "A marvelous although fragile gemstone, it can be cracked to reveal a small hoard of gems found across the Dragon Isles.",
    "uhhh lemme get back to you on this one",
    "Rare",
    "Crafting Reagent",
    1,
    null,
    null,
    "Right Click to Open"
  );
  const dreamersVision = await createItem(
    "Dreamer's Vision",
    "inv_jewelcrafting_immactaladite_green",
    "Pickup",
    1,
    "A marvelous although fragile gemstone, it can be cracked to reveal a small hoard of ysemeralds.",
    "Basically, convert common green gems & a few other mats into rare green gems!",
    "Rare",
    null,
    3,
    null,
    null,
    "Right Click to Open"
  );
  const earthwardensPrize = await createItem(
    "Earthwarden's Prize",
    "inv_jewelcrafting_immactaladite_purple",
    "Pickup",
    1,
    "A marvelous although fragile gemstone, it can be cracked to reveal a small hoard of neltharite.",
    "Basically, convert common black gems & a few other mats into rare black gems!",
    "Rare",
    null,
    3,
    null,
    null,
    "Right Click to Open"
  );
  const keepersGlory = await createItem(
    "Keeper's Glory",
    "inv_jewelcrafting_immactaladite_blue",
    "Pickup",
    1,
    "A marvelous although fragile gemstone, it can be cracked to reveal a small hoard of malygite.",
    "Basically, convert common blue gems & a few other mats into rare blue gems!",
    "Rare",
    null,
    3,
    null,
    null,
    "Right Click to Open"
  );
  const queensGift = await createItem(
    "Queen's Gift",
    "inv_jewelcrafting_immactaladite_red",
    "Pickup",
    1,
    "A marvelous although fragile gemstone, it can be cracked to reveal a small hoard of alexstraszite.",
    "Basically, convert common red gems & a few other mats into rare red gems!",
    "Rare",
    null,
    3,
    null,
    null,
    "Right Click to Open"
  );
  const timewatchersPatience = await createItem(
    "Timewatcher's Patience",
    "inv_jewelcrafting_immactaladite_orange",
    "Pickup",
    1,
    "A marvelous although fragile gemstone, it can be cracked to reveal a small hoard of nozdorite.",
    "Basically, convert common bronze gems & a few other mats into rare bronze gems!",
    "Rare",
    null,
    3,
    null,
    null,
    "Right Click to Open"
  );
  const glimmeringNozdoriteCluster = await createItem(
    "Glimmering Nozdorite Cluster",
    "inv_10_jewelcrafting_gem3primal_uncut_bronze",
    "Pickup",
    1000,
    "A truly remarkable collection of magical gemstones. This is a crucial component for Jewelcrafters to create a Jeweled Amber Whelpling.",
    null,
    "Rare"
  );
  const glimmeringYsemeraldCluster = await createItem(
    "Glimmering Ysemerald Cluster",
    "inv_10_jewelcrafting_gem3primal_uncut_green",
    "Pickup",
    1000,
    "A truly remarkable collection of magical gemstones. This is a crucial component for Jewelcrafters to create a Jeweled Emerald Whelpling.",
    null,
    "Rare"
  );
  const glimmeringNelthariteCluster = await createItem(
    "Glimmering Neltharite Cluster",
    "inv_10_jewelcrafting_gem3primal_uncut_black",
    "Pickup",
    1000,
    "A truly remarkable collection of magical gemstones. This is a crucial component for Jewelcrafters to create a Jeweled Onyx Whelpling.",
    null,
    "Rare"
  );
  const glimmeringAlexstrasziteCluster = await createItem(
    "Glimmering Alexstraszite Cluster",
    "inv_10_jewelcrafting_gem3primal_uncut_red",
    "Pickup",
    1000,
    "A truly remarkable collection of magical gemstones. This is a crucial component for Jewelcrafters to create a Jeweled Ruby Whelpling.",
    null,
    "Rare"
  );
  const glimmeringMalygiteCluster = await createItem(
    "Glimmering Malygite Cluster",
    "inv_10_jewelcrafting_gem3primal_uncut_blue",
    "Pickup",
    1000,
    "A truly remarkable collection of magical gemstones. This is a crucial component for Jewelcrafters to create a Jeweled Sapphire Whelpling.",
    null,
    "Rare"
  );

  // //blacksmithing items
  const obsidianSearedAlloy = await createItem(
    "Obsidian Seared Alloy",
    "inv_10_blacksmithing_craftedbar_blackdragonsearedalloy",
    null,
    1000,
    "Smelted by players with the Blacksmithing skill.",
    null,
    "Epic",
    "Crafting Reagent",
    3
  );
  const frostfireAlloy = await createItem(
    "Frostfire Alloy",
    "inv_10_blacksmithing_craftedbar_frostfirealloy",
    null,
    1000,
    "Smelted by players with the Blacksmithing skill.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const infuriousAlloy = await createItem(
    "Infurious Alloy",
    "inv_10_blacksmithing_craftedbar_bloodyalloy",
    null,
    1000,
    "Smelted by players with the Blacksmithing skill.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const primalMoltenAlloy = await createItem(
    "Primal Molten Alloy",
    "inv_10_blacksmithing_craftedbar_primalmoltenalloy",
    null,
    1000,
    "Smelted by players with the Blacksmithing skill.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const armorSpikes = await createItem(
    "Armor Spikes",
    "inv_10_blacksmithing_craftedoptional_armorspikes_color01",
    null,
    200,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Embellishment"],
    "+35/30/25 Recipe Difficulty (based on quality). Provides the following property: Adorn your armor with thick spikes and add Unique-Equipped: Embellished (2)."
  );
  const alliedChestplateOfGenerosity = await createItem(
    "Allied Chestplate of Generosity",
    "inv_chest_plate_raidwarriorprimalist_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to rally you and your 4 closest allies withing 30 yards to victory for 10 sec, increasing Versatility by 191/195/?/205/211. (based on quality)",
    null,
    "Plate",
    "Chest",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      ["Versatility", 224, 226, "?", 233, 237],
      ["Mastery", 402, 407, "?", 419, 427],
    ]
  );
  const alliedWristguardOfCompanionship = await createItem(
    "Allied Wristguard of Companionship",
    "inv_bracer_plate_raidwarriorprimalist_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Grants 46/47/?/48/49 Versatility (based on quality) for every ally in a 30 yard radius, stacking up to 4 times.",
    null,
    "Plate",
    "Wrist",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("stamina", "small"),
      ["Critical Strike", 146, 148, 150, 152, 155],
      ["Haste", 206, 209, 212, 215, 219],
    ]
  );
  const frostfireLegguardsOfPreparation = await createItem(
    "Frostfire Legguards of Preparation",
    "inv_plate_dragondungeon_c_01_pant",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Damaging a new enemy grants you 165/168/?/177/? Haste (based on quality) for 10 sec, up to 5 stacks.",
    null,
    "Plate",
    "Legs",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      ["Haste", 277, 281, "?", 289, "?"],
      ["Mastery", 349, 353, "?", 364, "?"],
    ]
  );
  const infuriousHelmOfVengeance = await createItem(
    "Infurious Helm of Vengeance",
    "inv_helm_plate_challengewarrior_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Enemies who damage you will sometimes take 7223/7264/?/7663/8043 Physical damage (based on quality) over 6 sec. Increases item level to 424 in Arenas and Battlegrounds.",
    null,
    "Plate",
    "Head",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      ["Critical Strike", 241, 244, "?", 252, 256],
      ["Versatility", 384, 389, "?", 401, 408],
    ]
  );
  const infuriousWarbootsOfImpunity = await createItem(
    "Infurious Warboots of Impunity",
    "inv_armor_revendrethcosmetic_d_02_boots",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Gladiator's Distinction reduces the duration of incoming crowd control effects by an additional 5%. Increases item level to 424 in Arenas and Battlegrounds.",
    null,
    "Plate",
    "Feet",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      ["Versatility", 335, 339, "?", 350, 356],
      ["Mastery", 134, 136, "?", 140, 142],
    ]
  );
  const primalMoltenBreastplate = await createItem(
    "Primal Molten Breastplate",
    "inv_chest_plate_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Chest",
    null,
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Ramdom Stat 2", "large"),
    ]
  );
  const primalMoltenGauntlets = await createItem(
    "Primal Molten Gauntlets",
    "inv_glove_plate_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Hands",
    null,
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Ramdom Stat 2", "medium"),
    ]
  );
  const primalMoltenGreatbelt = await createItem(
    "Primal Molten Greatbelt",
    "inv_belt_plate_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Waist",
    null,
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Ramdom Stat 2", "medium"),
    ]
  );
  const primalMoltenHelm = await createItem(
    "Primal Molten Helm",
    "inv_helm_plate_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Head",
    null,
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Ramdom Stat 2", "large"),
    ]
  );
  const primalMoltenLegplates = await createItem(
    "Primal Molten Legplates",
    "inv_pant_plate_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Legs",
    null,
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Ramdom Stat 2", "large"),
    ]
  );
  const primalMoltenPauldrons = await createItem(
    "Primal Molten Pauldrons",
    "inv_shoulder_plate_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Shoulder",
    null,
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Ramdom Stat 2", "medium"),
    ]
  );
  const primalMoltenSabatons = await createItem(
    "Primal Molten Sabatons",
    "inv_boot_plate_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Feet",
    null,
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Ramdom Stat 2", "medium"),
    ]
  );
  const primalMoltenVambraces = await createItem(
    "Primal Molten Vambraces",
    "inv_bracer_plate_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Wrist",
    null,
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("stamina", "small"),
      secondaryStatArrayEpic("Random Stat 1", "small"),
      secondaryStatArrayEpic("Ramdom Stat 2", "small"),
    ]
  );
  const unstableFrostfireBelt = await createItem(
    "Unstable Frostfire Belt",
    "inv_belt_plate_challengedeathknight_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to inflict a Lingering Frostspark, dealing 5693/5810/?/7384/? Frostfire damage (based on quality) over 10 sec. Enemies that die while under this effect will explode, leaving a cold sleet for 8 sec that slows enemies by 50%.",
    null,
    "Plate",
    "Waist",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("stamina", "medium"),
      ["Critical Strike", 335, 339, "?", 350, "?"],
      ["Mastery", 134, 136, "?", 140, "?"],
    ]
  );
  const explorersExpertHelm = await createItem(
    "Explorer's Expert Helm",
    "inv_helm_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Helm",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Ramdom Stat 2", "large"),
    ]
  );
  const explorersExpertSpaulders = await createItem(
    "Explorer's Expert Spaulders",
    "inv_shoulder_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Shoulders",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Ramdom Stat 2", "medium"),
    ]
  );
  const explorersExpertGauntlets = await createItem(
    "Explorer's Expert Gauntlets",
    "inv_glove_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Hands",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Ramdom Stat 2", "medium"),
    ]
  );
  const explorersExpertGreaves = await createItem(
    "Explorer's Expert Greaves",
    "inv_pant_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Legs",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Ramdom Stat 2", "medium"),
    ]
  );
  const explorersExpertClasp = await createItem(
    "Explorer's Expert Clasp",
    "inv_belt_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Waist",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Ramdom Stat 2", "medium"),
    ]
  );
  const explorersPlateChestguard = await createItem(
    "Explorer's Plate Chestguard",
    "inv_chest_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Chest",
    null,
    [306, 308, 310, 313, 316],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayBaby("large")],
    [
      secondaryStatArrayBaby("stamina", "large"),
      secondaryStatArrayBaby("Random Stat 1", "large"),
      secondaryStatArrayBaby("Ramdom Stat 2", "large"),
    ]
  );
  const explorersPlateBoots = await createItem(
    "Explorer's Plate Boots",
    "inv_boot_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Feet",
    null,
    [306, 308, 310, 313, 316],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayBaby("medium")],
    [
      secondaryStatArrayBaby("stamina", "medium"),
      secondaryStatArrayBaby("Random Stat 1", "medium"),
      secondaryStatArrayBaby("Ramdom Stat 2", "medium"),
    ]
  );
  const explorersPlateBracers = await createItem(
    "Explorer's Plate Bracers",
    "inv_bracer_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Plate",
    "Wrist",
    null,
    [306, 308, 310, 313, 316],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayBaby("small")],
    [
      secondaryStatArrayBaby("stamina", "small"),
      secondaryStatArrayBaby("Random Stat 1", "small"),
      secondaryStatArrayBaby("Ramdom Stat 2", "small"),
    ]
  );
  const crimsonCombatantsDraconiumArmguards = await createItem(
    "Crimson Combatant's Draconium Armguards",
    "inv_bracer_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Plate",
    "Wrist",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("small")],
    [
      secondaryStatArrayRare("stamina", "small"),
      secondaryStatArrayRare("Random Stat 1", "small"),
      secondaryStatArrayRare("Ramdom Stat 2", "small"),
    ]
  );
  const crimsonCombatantsDraconiumBreastplate = await createItem(
    "Crimson Combatant's Draconium Breastplate",
    "inv_chest_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Plate",
    "Chest",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Ramdom Stat 2", "large"),
    ]
  );
  const crimsonCombatantsDraconiumGauntlets = await createItem(
    "Crimson Combatant's Draconium Gauntlets",
    "inv_glove_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Plate",
    "Hands",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Ramdom Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsDraconiumGreaves = await createItem(
    "Crimson Combatant's Draconium Greaves",
    "inv_pant_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Plate",
    "Legs",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Ramdom Stat 2", "large"),
    ]
  );
  const crimsonCombatantsDraconiumHelm = await createItem(
    "Crimson Combatant's Draconium Helm",
    "inv_helm_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Plate",
    "Head",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Ramdom Stat 2", "large"),
    ]
  );
  const crimsonCombatantsDraconiumPauldrons = await createItem(
    "Crimson Combatant's Draconium Pauldrons",
    "inv_shoulder_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Plate",
    "Shoulder",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Ramdom Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsDraconiumSabatons = await createItem(
    "Crimson Combatant's Draconium Sabatons",
    "inv_boot_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Plate",
    "Feet",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Ramdom Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsDraconiumWaistguard = await createItem(
    "Crimson Combatant's Draconium Waistguard",
    "inv_belt_plate_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Plate",
    "Waist",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Ramdom Stat 2", "medium"),
    ]
  );

  const primalMoltenDefender = await createItem(
    "Primal Molten Defender",
    "inv_shield_1h_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Shield",
    "Off Hand",
    null,
    [382, 384, 386, 389, 392],
    [
      ["Strength", "Intellect", "", "", ""],
      ["173/531", "176/541", "?", "185/567", "190/583"],
    ],
    [
      ["Stamina", 396, 407, "?", 436, 453],
      ["Random Stat 1", 156, 158, "?", "?", 166],
      ["Random Stat 2", 156, 158, "?", "?", 166],
    ]
  );
  const shieldOfTheHearth = await createItem(
    "Shield of the Hearth",
    "creatureportrait_blackrockv2_shieldgong",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Taking damage has a chance to grant ?/?/?/326/332 Versatility (based on quality) for 15 sec.",
    null,
    "Shield",
    "Off Hand",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [
      ["Strength", "Intellect", "", "", ""],
      ["173/531", "176/541", "?", "185/567", "190/583"],
    ],
    [
      ["Stamina", 396, 407, "?", 436, 453],
      ["Critical Strike", 174, 176, "?", 182, 185],
      ["Mastery", 139, 140, "?", 144, 147],
    ]
  );
  const draconiumDefender = await createItem(
    "Draconium Defender",
    "inv_shield_1h_dragonquest_b_02",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Shield",
    "Off Hand",
    null,
    [333, 335, 337, 340, 343],
    [
      ["Strength", "Intellect", "", "", ""],
      ["110/336", "112/343", "?", "?", "120/369"],
    ],
    [
      ["Stamina", 241, 243, "?", "?", 249],
      ["Random Stat 1", 92, 97, "?", "?", 119],
      ["Random Stat 2", 92, 97, "?", "?", 119],
    ]
  );
  const obsidianSearedClaymore = await createItem(
    "Obsidian Seared Claymore",
    "inv_sword_2h_dragonpvp_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Sword",
    "Two-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Strength", "", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const obsidianSearedCrusher = await createItem(
    "Obsidian Seared Crusher",
    "inv_mace_2h_primalistraid_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mace",
    "Two-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Strength", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const obsidianSearedFacesmasher = await createItem(
    "Obsidian Seared Facesmasher",
    "inv_hand_1h_dragondungeon_c_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Fist Weapon",
    "One-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Strength", "", "", ""], primaryStatArrayEpic("1h")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const obsidianSearedHalberd = await createItem(
    "Obsidian Seared Halberd",
    "inv_polearm_2h_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Polearm",
    "Two-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Strength", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const obsidianSearedHexsword = await createItem(
    "Obsidian Seared Hexsword",
    "inv_sword_1h_dragondungeon_c_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Sword",
    "One-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("1h-int")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const obsidianSearedInvoker = await createItem(
    "Obsidian Seared Invoker",
    "inv_mace_2h_dragondungeon_c_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mace",
    "One-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("1h-int")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const obsidianSearedRuneaxe = await createItem(
    "Obsidian Seared Runeaxe",
    "inv_axe_1h_dragondungeon_c_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Axe",
    "One-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("1h-int")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const obsidianSearedSlicer = await createItem(
    "Obsidian Seared Slicer",
    "inv_axe_1h_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Axe",
    "One-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Strength", "", "", ""], primaryStatArrayEpic("1h")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const primalMoltenGreataxe = await createItem(
    "Primal Molten Greataxe",
    "inv_axe_2h_drakonoid_c_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Axe",
    "Two-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Strength", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const primalMoltenLongsword = await createItem(
    "Primal Molten Longsword",
    "inv_sword_1h_dragondungeon_c_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Sword",
    "One-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Strength", "", "", ""], primaryStatArrayEpic("1h")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const primalMoltenMace = await createItem(
    "Primal Molten Mace",
    "inv_mace_1h_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mace",
    "One-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Strength", "", "", ""], primaryStatArrayEpic("1h")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const primalMoltenShortblade = await createItem(
    "Primal Molten Shortblade",
    "inv_knife_1h_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Dagger",
    "One-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "", "", "", ""], primaryStatArrayEpic("1h")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const primalMoltenSpellblade = await createItem(
    "Primal Molten Spellblade",
    "inv_knife_1h_primalistraid_d_02",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Dagger",
    "One-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Intellect", "", "", "", ""], primaryStatArrayEpic("1h-int")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const primalMoltenWarglaive = await createItem(
    "Primal Molten Warglaive",
    "inv_glaive_1h_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Warglaives",
    "One-Hand",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Strength", "", "", ""], primaryStatArrayEpic("1h")],
    [
      secondaryStatArrayEpic("stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const draconiumGreatMace = await createItem(
    "Draconium Great Mace",
    "inv_mace_2h_dragondungeon_c_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mace",
    "Two-Hand",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("2h-int")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const draconiumStiletto = await createItem(
    "Draconium Stiletto",
    "inv_knife_1h_dragonquest_b_02",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Dagger",
    "One-Hand",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("1h-int")],
    [
      secondaryStatArrayRare("stamina", "1h"),
      secondaryStatArrayRare("Random Stat 1", "1h"),
      secondaryStatArrayRare("Random Stat 2", "1h"),
    ]
  );
  const draconiumGreatAxe = await createItem(
    "Draconium Great Axe",
    "inv_axe_2h_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Axe",
    "Two-Hand",
    null,
    [333, 335, 337, 340, 343],
    [["Strength", "", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const draconiumKnuckles = await createItem(
    "Draconium Knuckles",
    "inv_hand_1h_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Fist Weapon",
    "One-Hand",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Strength", "", "", ""], primaryStatArrayRare("1h")],
    [
      secondaryStatArrayRare("stamina", "1h"),
      secondaryStatArrayRare("Random Stat 1", "1h"),
      secondaryStatArrayRare("Random Stat 2", "1h"),
    ]
  );
  const draconiumSword = await createItem(
    "Draconium Sword",
    "inv_sword_1h_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Sword",
    "One-Hand",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Strength", "", "", ""], primaryStatArrayRare("1h")],
    [
      secondaryStatArrayRare("stamina", "1h"),
      secondaryStatArrayRare("Random Stat 1", "1h"),
      secondaryStatArrayRare("Random Stat 2", "1h"),
    ]
  );
  const draconiumAxe = await createItem(
    "Draconium Axe",
    "inv_axe_1h_dragonquest_b_02",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Axe",
    "One-Hand",
    null,
    [333, 335, 337, 340, 343],
    [["Intellect", "", "", "", ""], primaryStatArrayRare("1h-int")],
    [
      secondaryStatArrayRare("stamina", "1h"),
      secondaryStatArrayRare("Random Stat 1", "1h"),
      secondaryStatArrayRare("Random Stat 2", "1h"),
    ]
  );
  const draconiumDirk = await createItem(
    "Draconium Dirk",
    "inv_knife_1h_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Dagger",
    "One-Hand",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "", "", "", ""], primaryStatArrayRare("1h")],
    [
      secondaryStatArrayRare("stamina", "1h"),
      secondaryStatArrayRare("Random Stat 1", "1h"),
      secondaryStatArrayRare("Random Stat 2", "1h"),
    ]
  );
  const blackDragonTouchedHammer = await createItem(
    "Black Dragon Touched Hammer",
    "inv_mace_1h_blacksmithing_b_01_black",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "During crafting, increases the Skill provided when inspired by 15%.",
    null,
    "Blacksmithing Tool",
    null,
    null,
    [372, 378, 384, 391, 398],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [["Random Stat 1", 110, 118, "?", 139, 152]]
  );
  const khazgoriteBlacksmithsHammer = await createItem(
    "Khaz'gorite Blacksmith's Hammer",
    "inv_mace_1h_blacksmithing_b_01_silver",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Blacksmithing Tool",
    null,
    null,
    [346, 352, 356, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const khazgoriteBlacksmithsToolbox = await createItem(
    "Khaz'gorite Blacksmith's Toolbox",
    "inv_blacksmithing_toolbox_02",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Blacksmithing Accessory",
    "Toolkit",
    "Toolkit (1)",
    [346, 352, 356, 365, 372],
    statArrayProfToolAccessory("Skill", "Toolkit", "large"),
    [
      statArrayProfToolAccessory("Resourcefulness", "Toolkit", "large"),
      statArrayProfToolAccessory("Crafting Speed", "Toolkit", "large"),
    ]
  );
  const khazgoriteLeatherworkersKnife = await createItem(
    "Khaz'gorite Leatherworker's Knife",
    "inv_knife_1h_leatherworking_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leatherworking Tool",
    null,
    null,
    [346, 352, 356, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const khazgoriteLeatherworkersToolset = await createItem(
    "Khaz'gorite Leatherworker's Toolset",
    "inv_misc_food_lunchbox",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leatherworking Accessory",
    "Toolkit",
    "Toolkit (1)",
    [346, 352, 356, 365, 372],
    statArrayProfToolAccessory("Skill", "Toolkit", "large"),
    [
      statArrayProfToolAccessory("Resourcefulness", "Toolkit", "large"),
      statArrayProfToolAccessory("Crafting Speed", "Toolkit", "large"),
    ]
  );
  const khazgoriteNeedleSet = await createItem(
    "Khaz'gorite Needle Set",
    "inv_professions_tailoringneedleset_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Tailoring Accessory",
    "Toolkit",
    "Toolkit (1)",
    [346, 352, 356, 365, 372],
    statArrayProfToolAccessory("Skill", "Toolkit", "large"),
    [
      statArrayProfToolAccessory("Resourcefulness", "Toolkit", "large"),
      statArrayProfToolAccessory("Crafting Speed", "Toolkit", "large"),
    ]
  );
  const khazgoritePickaxe = await createItem(
    "Khaz'gorite Pickaxe",
    "inv_axe_1h_miningpick_a_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mining Tool",
    null,
    null,
    [346, 352, 356, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const khazgoriteSickle = await createItem(
    "Khaz'gorite Sickle",
    "inv_axe_1h_herbalism_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Herbalism Tool",
    null,
    null,
    [346, 352, 356, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const khazgoriteSkinningKnife = await createItem(
    "Khaz'gorite Skinning Knife",
    "inv_knife_1h_skinning_a_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Skinning Tool",
    null,
    null,
    [346, 352, 356, 365, 372],
    statArrayProfToolAccessory("Skill", "Tool", "large"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "large")]
  );
  const draconiumNeedleSet = await createItem(
    "Draconium Needle Set",
    "inv_professions_tailoringneedleset_02",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Tailoring Accessory",
    "Toolkit",
    "Toolkit (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      statArrayProfToolAccessory("Resourcefulness", "Toolkit", "medium"),
      statArrayProfToolAccessory("Crafting Speed", "Toolkit", "medium"),
    ]
  );
  const draconiumLeatherworkersKnife = await createItem(
    "Draconium Leatherworker's Knife",
    "inv_knife_1h_leatherworking_b_01",
    "Pickup",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Leatherworking Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const draconiumLeatherworkersToolset = await createItem(
    "Draconium Leatherworker's Toolset",
    "inv_misc_food_lunchbox_red",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Leatherworking Accessory",
    "Toolkit",
    "Toolkit (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      statArrayProfToolAccessory("Resourcefulness", "Toolkit", "medium"),
      statArrayProfToolAccessory("Crafting Speed", "Toolkit", "medium"),
    ]
  );
  const draconiumBlacksmithsToolbox = await createItem(
    "Draconium Blacksmith's Toolbox",
    "inv_blacksmithing_toolbox_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Blacksmithing Accessory",
    "Toolkit",
    "Toolkit (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      statArrayProfToolAccessory("Resourcefulness", "Toolkit", "medium"),
      statArrayProfToolAccessory("Crafting Speed", "Toolkit", "medium"),
    ]
  );
  const draconiumBlacksmithsHammer = await createItem(
    "Draconium Blacksmith's Hammer",
    "trade_archaeology_ogre2handedhammer",
    "Pickup",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Blacksmithing Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const draconiumSkinningKnife = await createItem(
    "Draconium Skinning Knife",
    "inv_knife_1h_skinning_a_01",
    "Pickup",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Skinning Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const draconiumSickle = await createItem(
    "Draconium Sickle",
    "inv_axe_1h_herbalism_b_01",
    "Pickup",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Herbalism Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const draconiumPickaxe = await createItem(
    "Draconium Pickaxe",
    "inv_axe_1h_miningpick_a_01",
    "Pickup",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Mining Tool",
    null,
    null,
    [320, 326, 332, 339, 346],
    statArrayProfToolAccessory("Skill", "Tool", "medium"),
    [statArrayProfToolAccessory("Random Stat 1", "Tool", "medium")]
  );
  const mastersHammer = await createItem(
    "Master's Hammer",
    "inv_10_blacksmithing_consumable_repairhammer_color2",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    1,
    null,
    null,
    "Repair a weapon or piece of plate armor you have specialized in repairing.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Blacksmithing: 25 }
  );
  const sturdyExpeditionShovel = await createItem(
    "Sturdy Expedition Shovel",
    "inv_misc_2h_farmshovel_a_01",
    null,
    1,
    null,
    null,
    "Common",
    null,
    1,
    null,
    "20 Charges",
    "Dig for treasure at Disturbed Dirt Piles."
  );
  const sereviteRepairHammer = await createItem(
    "Serevite Repair Hammer",
    "inv_10_blacksmithing_consumable_repairhammer_color1",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Fully repair a weapon or piece of plate armor (consumed on use).",
    null,
    null,
    null,
    null,
    null,
    null,
    { Blacksmithing: 25 }
  );
  const sereviteSkeletonKey = await createItem(
    "Serevite Skeleton Key",
    "inv_10_blacksmithing_consumable_key_color2",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Allows opening of locks that require up to 70 lockpicking skill.  The lockpick is consumed in the process.",
    null,
    null,
    null,
    null,
    null,
    null,
    { Blacksmithing: 1 }
  );
  const primalRazorstone = await createItem(
    "Primal Razorstone",
    "inv_10_blacksmithing_consumable_sharpeningstone_color1",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Sharpen your Mining, Herbalism, or Skinning Tool, increasing Finesse by 40/53/? (based on quality) for 2 hours."
  );
  const primalWhetstone = await createItem(
    "Primal Whetstone",
    "inv_10_blacksmithing_consumable_sharpeningstone_color2",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Sharpen your bladed weapon, increasing Attack Power by 253/307/360 (based on quality) for 1 hour."
  );
  const primalWeightstone = await createItem(
    "Primal Weightstone",
    "inv_10_blacksmithing_consumable_weightstone_color2",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    3,
    null,
    null,
    "Balances your blunt weapon, increasing Attack Power by 253/307/360 (based on quality) for 2 hours."
  );
  const alvinTheAnvil = await createItem(
    "Alvin the Anvil",
    "inv_blacksmith_anvil",
    "Pickup",
    1,
    null,
    "Might be able to be used as a portable anvil? Unsure.",
    "Rare",
    "Pet",
    1,
    null,
    null,
    "Teaches you how to summon this companion."
  );
  const prototypeExplorersBardingFramework = await createItem(
    "Prototype Explorer's Barding Framework",
    "inv_gizmo_bronzeframework_01",
    null,
    1,
    "Crafted by players with the Blacksmithing skill. Can be acquired through Crafting Orders.",
    null,
    "Rare"
  );
  const prototypeRegalBardingFramework = await createItem(
    "Prototype Regal Barding Framework",
    "inv_gizmo_adamantiteframe",
    null,
    1,
    "Crafted by players with the Blacksmithing skill. Can be acquired through Crafting Orders.",
    null,
    "Rare"
  );

  // //leatherworking items
  const lifeBoundBelt = await createItem(
    "Life-Bound Belt",
    "inv_belt_leather_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Waist",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const lifeBoundBindings = await createItem(
    "Life-Bound Bindings",
    "inv_bracer_leather_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Wrist",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("Stamina", "small"),
      secondaryStatArrayEpic("Random Stat 1", "small"),
      secondaryStatArrayEpic("Random Stat 2", "small"),
    ]
  );
  const lifeBoundBoots = await createItem(
    "Life-Bound Boots",
    "inv_boot_leather_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Feet",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const lifeBoundCap = await createItem(
    "Life-Bound Cap",
    "inv_helm_leather_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Head",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const lifeBoundChestpiece = await createItem(
    "Life-Bound Chestpiece",
    "inv_chest_leather_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Chest",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const lifeBoundGloves = await createItem(
    "Life-Bound Gloves",
    "inv_glove_leather_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Hands",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const lifeBoundShoulderpads = await createItem(
    "Life-Bound Shoulderpads",
    "inv_shoulder_leather_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Shoulder",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const lifeBoundTrousers = await createItem(
    "Life-Bound Trousers",
    "inv_pant_leather_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Legs",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const pioneersPracticedCowl = await createItem(
    "Pioneer's Practiced Cowl",
    "inv_leather_dragonquest_b_01_helm",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Head",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const pioneersPracticedLeggings = await createItem(
    "Pioneer's Practiced Leggings",
    "inv_leather_dragonquest_b_01_pant",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Legs",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const pioneersPracticedShoulders = await createItem(
    "Pioneer's Practiced Shoulders",
    "inv_leather_dragonquest_b_01_shoulder",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Shoulder",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const pioneersPracticedGloves = await createItem(
    "Pioneer's Practiced Gloves",
    "inv_leather_dragonquest_b_01_glove",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Hands",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const pioneersPracticedBelt = await createItem(
    "Pioneer's Practiced Belt",
    "inv_leather_dragonquest_b_01_belt",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Waist",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const pioneersLeatherTunic = await createItem(
    "Pioneer's Leather Tunic",
    "inv_leather_dragonquest_b_01_chest",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Shoulder",
    null,
    [306, 308, 310, 313, 316],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayBaby("large")],
    [
      secondaryStatArrayBaby("Stamina", "large"),
      secondaryStatArrayBaby("Random Stat 1", "large"),
      secondaryStatArrayBaby("Random Stat 2", "large"),
    ]
  );
  const pioneersLeatherBoots = await createItem(
    "Pioneer's Leather Boots",
    "inv_leather_dragonquest_b_01_boot",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Feet",
    null,
    [306, 308, 310, 313, 316],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayBaby("medium")],
    [
      secondaryStatArrayBaby("Stamina", "medium"),
      secondaryStatArrayBaby("Random Stat 1", "medium"),
      secondaryStatArrayBaby("Random Stat 2", "medium"),
    ]
  );
  const pioneersLeatherWristguards = await createItem(
    "Pioneer's Leather Wristguards",
    "inv_leather_dragonquest_b_01_bracer",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leather",
    "Wrist",
    null,
    [306, 308, 310, 313, 316],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayBaby("small")],
    [
      secondaryStatArrayBaby("Stamina", "small"),
      secondaryStatArrayBaby("Random Stat 1", "small"),
      secondaryStatArrayBaby("Random Stat 2", "small"),
    ]
  );
  const flameTouchedChain = await createItem(
    "Flame-Touched Chain",
    "inv_belt_mail_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Waist",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const flameTouchedChainmail = await createItem(
    "Flame-Touched Chainmail",
    "inv_chest_mail_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Chest",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const flameTouchedCuffs = await createItem(
    "Flame-Touched Cuffs",
    "inv_bracer_mail_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Wrist",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("Stamina", "small"),
      secondaryStatArrayEpic("Random Stat 1", "small"),
      secondaryStatArrayEpic("Random Stat 2", "small"),
    ]
  );
  const flameTouchedHandguards = await createItem(
    "Flame-Touched Handguards",
    "inv_glove_mail_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Hands",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const flameTouchedHelmet = await createItem(
    "Flame-Touched Helmet",
    "inv_helm_mail_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Head",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const flameTouchedLegguards = await createItem(
    "Flame-Touched Legguards",
    "inv_pant_mail_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Legs",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const flameTouchedSpaulders = await createItem(
    "Flame-Touched Spaulders",
    "inv_shoulder_mail_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Shoulder",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const flameTouchedTreads = await createItem(
    "Flame-Touched Treads",
    "inv_boot_mail_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Feet",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      secondaryStatArrayEpic("Random Stat 1", "medium"),
      secondaryStatArrayEpic("Random Stat 2", "medium"),
    ]
  );
  const trailblazersToughenedCoif = await createItem(
    "Trailblazer's Toughened Coif",
    "inv_mail_dragonquest_b_01_helm",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Head",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const trailblazersToughenedLegguards = await createItem(
    "Trailblazer's Toughened Legguards",
    "inv_mail_dragonquest_b_01_pant",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Legs",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const trailblazersToughenedSpikes = await createItem(
    "Trailblazer's Toughened Spikes",
    "inv_mail_dragonquest_b_01_shoulder",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Shoulder",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const trailblazersToughenedGrips = await createItem(
    "Trailblazer's Toughened Grips",
    "inv_mail_dragonquest_b_01_gloves",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Hands",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const trailblazersToughenedChainbelt = await createItem(
    "Trailblazer's Toughened Chainbelt",
    "inv_mail_dragonquest_b_01_belt",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Waist",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const trailblazersScaleVest = await createItem(
    "Trailblazer's Scale Vest",
    "inv_mail_dragonquest_b_01_chest",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Shoulder",
    null,
    [306, 308, 310, 313, 316],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayBaby("large")],
    [
      secondaryStatArrayBaby("Stamina", "large"),
      secondaryStatArrayBaby("Random Stat 1", "large"),
      secondaryStatArrayBaby("Random Stat 2", "large"),
    ]
  );
  const trailblazersScaleBoots = await createItem(
    "Trailblazer's Scale Boots",
    "inv_mail_dragonquest_b_01_boots",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Feet",
    null,
    [306, 308, 310, 313, 316],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayBaby("medium")],
    [
      secondaryStatArrayBaby("Stamina", "medium"),
      secondaryStatArrayBaby("Random Stat 1", "medium"),
      secondaryStatArrayBaby("Random Stat 2", "medium"),
    ]
  );
  const trailblazersScaleBracers = await createItem(
    "Trailblazer's Scale Bracers",
    "inv_mail_dragonquest_b_01_bracer",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Mail",
    "Wrist",
    null,
    [306, 308, 310, 313, 316],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayBaby("small")],
    [
      secondaryStatArrayBaby("Stamina", "small"),
      secondaryStatArrayBaby("Random Stat 1", "small"),
      secondaryStatArrayBaby("Random Stat 2", "small"),
    ]
  );
  const expertAlchemistsHat = await createItem(
    "Expert Alchemist's Hat",
    "inv_armor_helm_alchemy_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Alchemy Accessory",
    "Head",
    "Head (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Inspiration", 38, "?", "?", 48, 53],
      ["Multicraft", 25, "?", "?", 32, 35],
    ]
  );
  const expertSkinnersCap = await createItem(
    "Expert Skinner's Cap",
    "inv_helm_armor_skinning_a_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Skinning Accessory",
    "Head",
    "Head (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Inspiration", 32, "?", "?", 40, 44],
      ["Multicraft", 32, "?", "?", 40, 44],
    ]
  );
  const flameproofApron = await createItem(
    "Flameproof Apron",
    "inv_tabard_blacksmithing_b_01_black",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Blacksmithing Accessory",
    "Chest",
    "Chest (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Inspiration", 38, "?", "?", 48, 53],
      ["Multicraft", 25, "?", "?", 32, 35],
    ]
  );
  const lavishFloralPack = await createItem(
    "Lavish Floral Pack",
    "inv_cape_special_herbalism_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Herbalism Accessory",
    "Back",
    "Back (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [["Finesse", 64, "?", 74, 81, 88]]
  );
  const masterworkSmock = await createItem(
    "Masterwork Smock",
    "inv_armor_leatherworking_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Leatherworking Accessory",
    "Chest",
    "Chest (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Inspiration", 38, "?", "?", 48, 53],
      ["Multicraft", 25, "?", "?", 32, 35],
    ]
  );
  const reinforcedPack = await createItem(
    "Reinforced Pack",
    "inv_cape_special_skinning_c_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Skinning Accessory",
    "Back",
    "Back (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [["Finesse", 64, "?", 74, 81, 88]]
  );
  const resplendentCover = await createItem(
    "Resplendent Cover",
    "inv_tabard_jewelcrafting_b_01",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Jewelcrafting Accessory",
    "Chest",
    "Chest (1)",
    [346, 352, 358, 365, 372],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [
      ["Resplendent Cover", 25, "?", "?", 32, 35],
      ["Multicraft", 38, "?", "?", 48, 53],
    ]
  );
  const shockproofGloves = await createItem(
    "Shockproof Gloves",
    "inv_armor_engineering_b_01_orange",
    "Pickup",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Engineering Accessory",
    "Hands",
    "Hands (1)",
    [356, 362, 368, 375, 382],
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [["Resourcefulness", 32, "?", "?", 40, 44]]
  );
  const alchemistsHat = await createItem(
    "Alchemist's Hat",
    "inv_armor_helm_alchemy_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Alchemy Accessory",
    "Head",
    "Head (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Inspiration", 28, "?", "?", "?", 38],
      ["Multicraft", 18, "?", "?", "?", 25],
    ]
  );
  const smithingApron = await createItem(
    "Smithing Apron",
    "inv_tabard_blacksmithing_b_01_brown",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Blacksmithing Accessory",
    "Chest",
    "Chest (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Inspiration", 28, "?", "?", "?", 38],
      ["Multicraft", 18, "?", "?", "?", 25],
    ]
  );
  const jewelersCover = await createItem(
    "Jeweler's Cover",
    "inv_tabard_jewelcrafting_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Jewelcrafting Accessory",
    "Chest",
    "Chest (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Resourcefulness", 18, "?", "?", "?", 25],
      ["Crafting Speed", 28, "?", "?", "?", 38],
    ]
  );
  const protectiveGloves = await createItem(
    "Protective Gloves",
    "inv_armor_engineering_b_01_orange",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Engineering Accessory",
    "Hands",
    "Hands (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Resourcefulness", 23, "?", "?", "?", 32],
      ["Crafting Speed", 23, "?", "?", "?", 32],
    ]
  );
  const durablePack = await createItem(
    "Durable Pack",
    "inv_cape_special_skinning_c_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Skinning Accessory",
    "Back",
    "Back (1)",
    [320, 326, 332, 339, 346],
    null,
    [["Finesse", 46, "?", "?", "?", 64]]
  );
  const floralBasket = await createItem(
    "Floral Basket",
    "inv_cape_special_herbalism_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Herbalism Accessory",
    "Back",
    "Back (1)",
    [320, 326, 332, 339, 346],
    null,
    [["Finesse", 46, "?", "?", "?", 64]]
  );
  const skinnersCap = await createItem(
    "Skinner's Cap",
    "inv_helm_armor_skinning_a_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Skinning Accessory",
    "Head",
    "Head (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Deftness", 23, "?", "?", "?", 32],
      ["Perception", 23, "?", "?", "?", 32],
    ]
  );
  const resilientSmock = await createItem(
    "Resilient Smock",
    "inv_armor_leatherworking_b_01",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    null,
    null,
    "Leatherworking Accessory",
    "Chest",
    "Chest (1)",
    [320, 326, 332, 339, 346],
    null,
    [
      ["Inspiration", 28, "?", "?", "?", 38],
      ["Multicraft", 18, "?", "?", "?", 25],
    ]
  );
  const bonewroughtCrossbow = await createItem(
    "Bonewrought Crossbow",
    "inv_crossbow_2h_dragonquest_b_01",
    "Equip",
    1,
    null,
    null,
    "Rare",
    null,
    5,
    null,
    null,
    null,
    "Crossbow",
    "Ranged",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const ancestorsDewDrippers = await createItem(
    "Ancestor's Dew Drippers",
    "inv_mail_dragondungeon_c_01_shoulder",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Horizon Strider's Garments set (Wind Spirit's Lasso, Scale Rein Grips, Ancestor's Dew Drippers). 2 Set: Critical damage and healing have a chance to spur you on, granting Haste for 10 sec. This effect stacks up to 5 times.",
    null,
    "Mail",
    "Shoulder",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Haste", 268, "?", "?", "?", 285],
      ["Versatility", 201, "?", "?", "?", 213],
    ]
  );
  const flaringCowl = await createItem(
    "Flaring Cowl",
    "inv_helm_leather_legiondungeon_c_02",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "While in combat, you are wrapped in an intense heat which burns nearby foes for 611 Fire damage every 3 sec.",
    null,
    "Leather",
    "Head",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      ["Haste", 262, "?", "?", "?", 278],
      ["Mastery", 358, "?", "?", "?", 379],
    ]
  );
  const oldSpiritsWristwraps = await createItem(
    "Old Spirit's Wristwraps",
    "inv_bracer_leather_raiddemonhunterprimalist_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Playful Spirit's Fur set (Old Spirit's Wristwraps, Snowball Makers, String of Spiritual Knick-Knacks). 2 Set: Your spells and abilities have a chance to pelt your target with a magic snowball, causing enemies to take Frost damage or allies to receive healing.",
    null,
    "Leather",
    "Wrist",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("small")],
    [
      secondaryStatArrayEpic("Stamina", "small"),
      ["Critical Strike", 201, "?", "?", "?", 213],
      ["Mastery", 126, "?", "?", "?", 133],
    ]
  );
  const scaleReinGrips = await createItem(
    "Scale Rein Grips",
    "inv_mail_raidhunterprimalist_d_01_glove",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Horizon Strider's Garments set (Wind Spirit's Lasso, Scale Rein Grips, Ancestor's Dew Drippers). 2 Set: Critical damage and healing have a chance to spur you on, granting Haste for 10 sec. This effect stacks up to 5 times.",
    null,
    "Mail",
    "Shoulder",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Critical Strike", 196, "?", "?", "?", 208],
      ["Haste", 268, "?", "?", "?", 285],
    ]
  );
  const snowballMakers = await createItem(
    "Snowball Makers",
    "inv_leather_dragondungeon_c_01_glove",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Playful Spirit's Fur set (Old Spirit's Wristwraps, Snowball Makers, String of Spiritual Knick-Knacks). 2 Set: Your spells and abilities have a chance to pelt your target with a magic snowball, causing enemies to take Frost damage or allies to receive healing.",
    null,
    "Leather",
    "Hands",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Haste", 168, "?", "?", "?", 178],
      ["Mastery", 268, "?", "?", "?", 285],
    ]
  );
  const stringOfSpiritualKnickKnacks = await createItem(
    "String of Spiritual Knick-Knacks",
    "inv_belt_leather_raidrogueprimalist_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Playful Spirit's Fur set (Old Spirit's Wristwraps, Snowball Makers, String of Spiritual Knick-Knacks). 2 Set: Your spells and abilities have a chance to pelt your target with a magic snowball, causing enemies to take Frost damage or allies to receive healing.",
    null,
    "Leather",
    "Waist",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Critical Strike", 268, "?", "?", "?", 285],
      ["Haste", 168, "?", "?", "?", 178],
    ]
  );
  const windSpiritsLasso = await createItem(
    "Wind Spirit's Lasso",
    "inv_belt_mail_raidevokerprimalist_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Horizon Strider's Garments set (Wind Spirit's Lasso, Scale Rein Grips, Ancestor's Dew Drippers). 2 Set: Critical damage and healing have a chance to spur you on, granting Haste for 10 sec. This effect stacks up to 5 times.",
    null,
    "Mail",
    "Waist",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Haste", 196, "?", "?", "?", 208],
      ["Mastery", 268, "?", "?", "?", 285],
    ]
  );
  const alliedHeartwarmingFurCoat = await createItem(
    "Allied Heartwarming Fur Coat",
    "inv_leather_dragondungeon_c_01_chest",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to rally you and your 4 closest allies within 30 yards to victory for 10 sec, increasing Versatility by 191/195/?/205/211 (based on quality.)",
    null,
    "Leather",
    "Chest",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      ["Haste", 358, "?", "?", "?", 379],
      ["Versatility", 224, "?", "?", "?", 237],
    ]
  );
  const alliedLegguardsOfSansokKhan = await createItem(
    "Allied Legguards of Sansok Khan",
    "inv_mail_dragondungeon_c_01_pant",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Your spells and abilities have a chance to rally you and your 4 closest allies within 30 yards to victory for 10 sec, increasing Versatility by 191/195/?/205/211 (based on quality.)",
    null,
    "Mail",
    "Legs",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      ["Critical Strike", 358, "?", "?", "?", 379],
      ["Mastery", 262, "?", "?", "?", 278],
    ]
  );
  const bowOfTheDragonHunters = await createItem(
    "Bow of the Dragon Hunters",
    "inv_bow_1h_dragondungeon_c_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    null,
    null,
    "Bow",
    "Ranged",
    null,
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      secondaryStatArrayEpic("Random Stat 1", "large"),
      secondaryStatArrayEpic("Random Stat 2", "large"),
    ]
  );
  const infuriousBootsOfReprieve = await createItem(
    "Infurious Boots of Reprieve",
    "inv_boot_mail_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Gladiator's Distinction reduces the duration of incoming crowd control effects by an additional 5%. Increases item level to 424 in Arenas and Battlegrounds.",
    null,
    "Mail",
    "Feet",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Haste", 168, "?", "?", "?", 178],
      ["Versatility", 302, "?", "?", "?", 320],
    ]
  );
  const infuriousChainhelmProtector = await createItem(
    "Infurious Chainhelm Protector",
    "inv_helm_mail_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Whenever a player in slain within 20 yards of you, you are filled with a burst of tenacity and gain 1034/?/?/?/1097 Versatility (based on quality) for 10 sec. Increases item level to 424 in Arenas and Battlegrounds.",
    null,
    "Mail",
    "Head",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      ["Critical Strike", 224, "?", "?", "?", 237],
      ["Versatility", 402, "?", "?", "?", 427],
    ]
  );
  const infuriousFootwrapsOfIndemnity = await createItem(
    "Infurious Footwraps of Indemnity",
    "inv_boot_leather_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Gladiator's Distinction reduces the duration of incoming crowd control effects by an additional 5%. Increases item level to 424 in Arenas and Battlegrounds.",
    null,
    "Leather",
    "Feet",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Critical Strike", 168, "?", "?", "?", 178],
      ["Versatility", 302, "?", "?", "?", 320],
    ]
  );
  const infuriousSpiritsHood = await createItem(
    "Infurious Spirit's Hood",
    "inv_helm_leather_dragonpvp_d_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "The ancestral spirits assist you, causing you to deal 1% more damage to enemy players who attack you for 5 sec. Increases item level to 424 in Arenas and Battlegrounds.",
    null,
    "Leather",
    "Head",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("large")],
    [
      secondaryStatArrayEpic("Stamina", "large"),
      ["Versatility", 402, "?", "?", "?", 427],
      ["Mastery", 179, "?", "?", "?", 190],
    ]
  );
  const crimsonCombatantsAdamantChainmail = await createItem(
    "Crimson Combatant's Adamant Chainmail",
    "inv_mail_dragonquest_b_01_chest",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Mail",
    "Chest",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const crimsonCombatantsAdamantCowl = await createItem(
    "Crimson Combatant's Adamant Cowl",
    "inv_mail_dragonquest_b_01_helm",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Mail",
    "Head",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const crimsonCombatantsAdamantCuffs = await createItem(
    "Crimson Combatant's Adamant Cuffs",
    "inv_mail_dragonquest_b_01_bracer",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Mail",
    "Chest",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("small")],
    [
      secondaryStatArrayRare("Stamina", "small"),
      secondaryStatArrayRare("Random Stat 1", "small"),
      secondaryStatArrayRare("Random Stat 2", "small"),
    ]
  );
  const crimsonCombatantsAdamantEpaulettes = await createItem(
    "Crimson Combatant's Adamant Epaulettes",
    "inv_mail_dragonquest_b_01_shoulder",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Mail",
    "Shoulder",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsAdamantGauntlets = await createItem(
    "Crimson Combatant's Adamant Gauntlets",
    "inv_mail_dragonquest_b_01_gloves",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Mail",
    "Hands",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsAdamantGirdle = await createItem(
    "Crimson Combatant's Adamant Girdle",
    "inv_mail_dragonquest_b_01_belt",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Mail",
    "Waist",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsAdamantLeggings = await createItem(
    "Crimson Combatant's Adamant Leggings",
    "inv_mail_dragonquest_b_01_pants",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Mail",
    "Legs",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const crimsonCombatantsAdamantTreads = await createItem(
    "Crimson Combatant's Adamant Treads",
    "inv_mail_dragonquest_b_01_boots",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Mail",
    "Feet",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsResilientBelt = await createItem(
    "Crimson Combatant's Resilient Belt",
    "inv_leather_dragonquest_b_01_belt",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Leather",
    "Waist",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsResilientBoots = await createItem(
    "Crimson Combatant's Resilient Boots",
    "inv_leather_dragonquest_b_01_boot",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Leather",
    "Feet",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsResilientChestpiece = await createItem(
    "Crimson Combatant's Resilient Chestpiece",
    "inv_leather_dragonquest_b_01_chest",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Leather",
    "Chest",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const crimsonCombatantsResilientGloves = await createItem(
    "Crimson Combatant's Resilient Gloves",
    "inv_leather_dragonquest_b_01_glove",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Leather",
    "Hands",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsResilientMask = await createItem(
    "Crimson Combatant's Resilient Mask",
    "inv_leather_dragonquest_b_01_helm",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Leather",
    "Head",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const crimsonCombatantsResilientShoulderpads = await createItem(
    "Crimson Combatant's Resilient Shoulderpads",
    "inv_leather_dragonquest_b_01_shoulder",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Leather",
    "Shoulder",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("medium")],
    [
      secondaryStatArrayRare("Stamina", "medium"),
      secondaryStatArrayRare("Random Stat 1", "medium"),
      secondaryStatArrayRare("Random Stat 2", "medium"),
    ]
  );
  const crimsonCombatantsResilientTrousers = await createItem(
    "Crimson Combatant's Resilient Trousers",
    "inv_leather_dragonquest_b_01_pant",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Leather",
    "Legs",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("large")],
    [
      secondaryStatArrayRare("Stamina", "large"),
      secondaryStatArrayRare("Random Stat 1", "large"),
      secondaryStatArrayRare("Random Stat 2", "large"),
    ]
  );
  const crimsonCombatantsResilientWristwraps = await createItem(
    "Crimson Combatant's Resilient Wristwraps",
    "inv_leather_dragonquest_b_01_bracer",
    "Equip",
    1,
    null,
    null,
    "Uncommon",
    null,
    5,
    null,
    "Increases item level to 398 in Arenas and Battlegrounds.",
    null,
    "Leather",
    "Wrist",
    null,
    [333, 335, 337, 340, 343],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayRare("small")],
    [
      secondaryStatArrayRare("Stamina", "small"),
      secondaryStatArrayRare("Random Stat 1", "small"),
      secondaryStatArrayRare("Random Stat 2", "small"),
    ]
  );
  const acidicHailstoneTreads = await createItem(
    "Acidic Hailstone Treads",
    "inv_mail_dragondungeon_c_01_boot",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "These boots permeate a deep chill through you, causing your spells and abilities to sometimes deal an additional 3129/?/?/?/3484 Frost damage (based on quality), but permanently slow your movement speed by 10%. These effects are increased by 100% if you equip an item crafted with a Toxified Armor Patch.",
    null,
    "Mail",
    "Feet",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Critical Strike", 268, "?", "?", "?", 285],
      ["Mastery", 196, "?", "?", "?", 208],
    ]
  );
  const slimyExpulsionBoots = await createItem(
    "Slimy Expulsion Boots",
    "inv_leather_dragondungeon_c_01_boot",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "These boots ooze a toxic slime which slow your actions, reducing Haste by 85/?/?/?/90 (based on quality). Your attacks will occasionally splash slime onto your target, dealing 3129/?/?/?/3484 Nature damage (based on quality). These effects are increased by 100% if you equip an item crafted with a Toxified Armor Patch.",
    null,
    "Leather",
    "Feet",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Versatility", 168, "?", "?", "?", 178],
      ["Mastery", 268, "?", "?", "?", 285],
    ]
  );
  const toxicThornFootwraps = await createItem(
    "Toxic Thorn Footwraps",
    "inv_leather_dragondungeon_c_01_boot",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "The thorns feed off your vitality, reducing Stamina by 48/?/?/?/53 (based on quality). Your spells and abilities have a chance to launch magical thorns at your target, healing allies for 5632/?/?/?/6271 (based on quality) or striking enemies for 2503/?/?/?/2787 Nature damage (based on quality). These effects are increased by 100% if you equip an item crafted with a Toxified Armor Patch.",
    null,
    "Leather",
    "Feet",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Critical Strike", 168, "?", "?", "?", 178],
      ["Haste", 268, "?", "?", "?", 285],
    ]
  );
  const venomSteepedStompers = await createItem(
    "Venom-Steeped Stompers",
    "inv_mail_dragondungeon_c_01_boot",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Toxins course through you, occasionally triggering Potent Venom. When affected by Potent Venom, you lose 258/?/?/?/273 of your lowest secondary stat (based on quality) and gain 646/?/?/?/685 of your highest secondary stat (based on quality) for 10 sec. These effects are increased by 100% if you equip an item crafted with a Toxified Armor Patch.",
    null,
    "Mail",
    "Feet",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("medium")],
    [
      secondaryStatArrayEpic("Stamina", "medium"),
      ["Versatility", 168, "?", "?", "?", 178],
      ["Mastery", 268, "?", "?", "?", 285],
    ]
  );
  const witherrotTome = await createItem(
    "Witherrot Tome",
    "inv_offhand_1h_dragonquest_b_01",
    "Pickup",
    1,
    null,
    null,
    "Epic",
    null,
    5,
    null,
    "Dealing damage with spells and abilities has a small chance to inflict a Tome-Wrought Rot upon your target, causing them to take 1177/?/?/?/1582 Nature damage (based on quality) every 2 sec, and slowing their movement speed by 30% for 10 sec.",
    null,
    null,
    "Off-Hand",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [["Agility", "Intellect", "", "", ""], primaryStatArrayEpic("1h")],
    [
      secondaryStatArrayEpic("Stamina", "1h"),
      secondaryStatArrayEpic("Random Stat 1", "1h"),
      secondaryStatArrayEpic("Random Stat 2", "1h"),
    ]
  );
  const finishedPrototypeExplorersBarding = await createItem(
    "Finished Prototype Explorer's Barding",
    "inv_belt_41b",
    null,
    1000,
    "Crafted by players with the Leatherworking skill. Can be acquired through Crafting Orders.",
    null,
    "Epic",
    "Crafting Reagent"
  );
  const finishedPrototypeRegalBarding = await createItem(
    "Finished Prototype Regal Barding",
    "inv_belt_41c",
    null,
    1000,
    "Crafted by players with the Leatherworking skill. Can be acquired through Crafting Orders.",
    null,
    "Epic",
    "Crafting Reagent"
  );
  const earthshineScales = await createItem(
    "Earthshine Scales",
    "inv_10_skinning_dragonscales_green",
    null,
    1000,
    "Crafted by players with the Leatherworking skill. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const frostbiteScales = await createItem(
    "Frostbite Scales",
    "inv_10_skinning_dragonscales_blue",
    null,
    1000,
    "Crafted by players with the Leatherworking skill. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const infuriousHide = await createItem(
    "Infurious Hide",
    "inv_10_skinning_leather_rarehide_color4",
    null,
    1000,
    "Crafted by players with the Leatherworking skill. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const infuriousScales = await createItem(
    "Infurious Scales",
    "inv_10_skinning_dragonscales_red",
    null,
    1000,
    "Crafted by players with the Leatherworking skill. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const mireslushHide = await createItem(
    "Mireslush Hide",
    "inv_10_skinning_leather_rarehide_color2",
    null,
    1000,
    "Crafted by players with the Leatherworking skill. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );

  const stonecrustHide = await createItem(
    "Stonecrust Hide",
    "inv_10_skinning_leather_rarehide_color3",
    null,
    1000,
    "Crafted by players with the Leatherworking skill. Can be bought and sold on the auction house.",
    null,
    "Rare",
    "Crafting Reagent",
    3
  );
  const fangAdornments = await createItem(
    "Fang Adornments",
    "inv_misc_blacksaberonfang",
    null,
    200,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Embellishment"],
    "+35/30/25 Recipe Difficulty (based on quality). Provides the following property: Physical attacks sometimes deal extra physical damage. Also add Unique-Equipped: Embellished (2)."
  );
  const toxifiedArmorPatch = await createItem(
    "Toxified Armor Patch",
    "inv_misc_cataclysmarmorkit_10",
    null,
    200,
    null,
    null,
    "Rare",
    "Optional Crafting Reagent",
    3,
    ["Embellishment"],
    "+35/30/25 Recipe Difficulty (based on quality). Provides the following property: Infuses the item with the essence of decay. Also add Unique-Equipped: Embellished (2)."
  );
  const fierceArmorKit = await createItem(
    "Fierce Armor Kit",
    "inv_10_skinning_consumable_armorkit_color3",
    null,
    20,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Apply a Fierce Armor Kit to your leg armor, causing it to permanently gain 248/302/335 Stamina (based on quality), as well as 331/403/472 Agility and Strength (based on quality). (1 Sec Cooldown)"
  );
  const frostedArmorKit = await createItem(
    "Frosted Armor Kit",
    "inv_10_skinning_consumable_armorkit_color2",
    null,
    20,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Apply a Frosted Armor Kit to your leg armor, permanently increasing its armor by 264/320/376 Stamina (based on quality). Additionally, the item also gains 331/403/472 Agility and Strength (based on quality). (1 Sec Cooldown)"
  );
  const reinforcedArmorKit = await createItem(
    "Reinforced Armor Kit",
    "inv_10_skinning_consumable_armorkit_color1",
    null,
    20,
    null,
    null,
    "Common",
    null,
    3,
    null,
    null,
    "Apply a Reinforced Armor Kit to your leg armor, causing it to permanently gain 197/240/283 Agility and Strength (based on quality). (1 Sec Cooldown)"
  );
  const feralHideDrums = await createItem(
    "Feral Hide Drums",
    "inv_10_skinning_consumable_leatherdrums_color1",
    null,
    200,
    null,
    null,
    "Uncommon",
    null,
    1,
    null,
    null,
    "Increases Haste by 15% for all party and raid members. Lasts 40 sec. Allies receiving this effect will become Exhausted and be unable to benefit from Bloodlust, Heroism or Time Warp again for 10 min. (2 Min Cooldown)"
  );
  const artisansSign = await createItem(
    "Artisan's Sign",
    "inv_misc_clipboard01",
    null,
    1,
    "For sale! Discount prices! Act now!",
    null,
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your Toy Box. Place a sign so everyone can know where the best goods are sold. (1 Hr Cooldown)"
  );
  const gnollTent = await createItem(
    "Gnoll Tent",
    "inv_10_tailoring2_tent_color3",
    null,
    1,
    null,
    null,
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your Toy Box. Place a Gnoll tent to rest and relax under. (2 Min Cooldown)"
  );
  const tuskarrBeanBag = await createItem(
    "Tuskarr Bean Bag",
    "inv_misc_bag_10",
    null,
    1,
    "The finest of tuskarr leisure apparatuses.",
    null,
    "Rare",
    "Toy",
    1,
    null,
    null,
    "Adds this toy to your Toy Box. Place a beanbag that can be sat on and lasts for 2 min. (2 Min Cooldown)"
  );

  // //cooking items
  const ooeyGooeyChocolate = await createItem(
    "Ooey-Gooey Chocolate",
    "inv_misc_food_legion_goochoco_bottle",
    "Pickup",
    1,
    "Duration: 1 day",
    null,
    "Rare",
    "Finishing Crafting Reagent",
    1,
    ["Secret Ingredient"],
    "When crafting: Stuff your recipe with this delicious secret ingredient to increase the number of servings produced."
  );
  const impossiblySharpCuttingKnife = await createItem(
    "Impossibly Sharp Cutting Knife",
    "inv_knife_1h_garrison_a_01",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    1,
    ["Finishing Touches"],
    "When crafting: Precise cuts ensure perfect portions with nothing going to waste, gain 110 Resourcefulness to this recipe."
  );
  const saladOnTheSide = await createItem(
    "Salad on the Side",
    "inv_cooking_100_sidesalad",
    null,
    200,
    null,
    null,
    "Uncommon",
    "Finishing Crafting Reagent",
    1,
    ["Finishing Touches"],
    "When crafting: A healthy and filling salad ensures there will be some leftovers, gain 90 Multicraft to a dish."
  );
  const assortedExoticSpices = await createItem(
    "Assorted Exotic Spices",
    "inv_misc_food_vendor_blackpepper",
    null,
    1000,
    "A common ingredient originally sourced from herbalists. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const pebbledRockSalts = await createItem(
    "Pebbled Rock Salts",
    "inv_ore_ghostironnugget",
    null,
    1000,
    "A common ingredient originally sourced from miners. Can be bought and sold on the auction house.",
    null,
    "Common",
    "Crafting Reagent"
  );
  const breakfastOfDraconicChampions = await createItem(
    "Breakfast of Draconic Champions",
    "inv_cooking_81_sanguinatedfeast",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health and 257,142 mana over 20 sec. Must remain seated while eating."
  );
  const sweetAndSourClamChowder = await createItem(
    "Sweet and Sour Clam Chowder",
    "inv_misc_food_draenor_whiptailchowder",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health and 257,142 mana over 20 sec. Must remain seated while eating."
  );
  const probablyProtein = await createItem(
    "Probably Protein",
    "inv_misc_food_meat_rawtigersteak_color04",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 112,500 health over 20 sec. Must remain seated while eating."
  );
  const cheeseAndQuackers = await createItem(
    "Cheese and Quackers",
    "inv_misc_food_draenor_saltedskulker_color03",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 112,500 health over 20 sec. Must remain seated while eating."
  );
  const mackerelSnackerel = await createItem(
    "Mackerel Snackerel",
    "inv_cooking_80_sailorspie",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 112,500 health over 20 sec. Must remain seated while eating."
  );
  const twiceBakedPotato = await createItem(
    "Twice-Baked Potato",
    "inv_thanksgiving_sweetpotato-",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 112,500 health over 20 sec. Must remain seated while eating."
  );
  const deliciousDragonSpittle = await createItem(
    "Delicious Dragon Spittle",
    "inv_drink_32_disgustingrotgut_color01",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 257,142 mana over 20 sec. Must remain seated while drinking."
  );
  const churnbellyTea = await createItem(
    "Churnbelly Tea",
    "inv_drink_19",
    null,
    200,
    "They're still swimming...",
    "Will make you vomit after a bit.",
    "Common",
    null,
    1,
    null,
    null,
    "Restores 257,142 mana over 20 sec. Must remain seated while drinking. If you spend at least 10 seconds eating you will become regrettably well fed and gain increased swim speed and the ability to breathe underwater for 20 min... or as long as you can stomach it."
  );
  const zestyWater = await createItem(
    "Zesty Water",
    "inv_drink_21_color02",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 150,000 mana over 20 sec. Must remain seated while drinking."
  );
  const fatedFortuneCookie = await createItem(
    "Fated Fortune Cookie",
    "inv_misc_fortunecookie_color03",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 75 Primary Stat for 1 hour. Good fortune to you!"
  );
  const blubberyMuffin = await createItem(
    "Blubbery Muffin",
    "inv_misc_food_148_cupcake",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Yum...?"
  );
  const celebratoryCake = await createItem(
    "Celebratory Cake",
    "inv_misc_food_145_cake",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Set out a delightful cake to celebrate a momentous occasion! (2 Min Cooldown)"
  );
  const snowInACone = await createItem(
    "Snow in a Cone",
    "inv_misc_food_31",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Yum!"
  );
  const tastyHatchlingsTreat = await createItem(
    "inv_misc_food_145_cake",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Lure a friendly whelpling out of hiding with an uncomfortably squishy but nonetheless appealing treat."
  );
  const braisedBruffalonBrisket = await createItem(
    "Braised Bruffalon Brisket",
    "inv_misc_food_meat_cooked_06",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 32 Stamina and 39 Strength for 1 hour."
  );
  const charredHornswogSteaks = await createItem(
    "Charred Hornswog Steaks",
    "inv_cooking_81_paleosteakandpotatoes_color02",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 112,500 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 22 Stamina and 26 Strength for 1 hour."
  );
  const hopefullyHealthy = await createItem(
    "Hopefully Healthy",
    "inv_misc_food_meat_cooked_04",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 112,500 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 40 Stamina for 1 hour."
  );
  const riversidePicnic = await createItem(
    "Riverside Picnic",
    "inv_misc_food_99",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 32 Stamina and 39 Agility for 1 hour."
  );
  const roastDuckDelight = await createItem(
    "Roast Duck Delight",
    "inv_cooking_100_roastduck_color02",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 32 Stamina and 39 Intellect for 1 hour."
  );
  const saltedMeatMash = await createItem(
    "Salted Meat Mash",
    "inv_misc_food_meat_raw_01_color02",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 60 Stamina for 1 hour."
  );
  const scrambledBasiliskEggs = await createItem(
    "Scrambled Basilisk Eggs",
    "inv_thanksgiving_stuffing",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 112,500 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 22 Stamina and 26 Agility for 1 hour."
  );
  const thriceSpicedMammothKabob = await createItem(
    "Thrice-Spiced Mammoth Kabob",
    "inv_misc_food_legion_spicedribroast",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 112,500 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 22 Stamina and 26 Intellect for 1 hour."
  );
  const filetOfFangs = await createItem(
    "Filet of Fangs",
    "inv_misc_food_cooked_eternalblossomfish",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 105 Critical Strike for 1 hour."
  );
  const saltBakedFishcake = await createItem(
    "Salt-Baked Fishcake",
    "inv_misc_food_legion_deepfriedmossgill",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 105 Mastery for 1 hour."
  );
  const seamothSurprise = await createItem(
    "Seamoth Surprise",
    "inv_misc_food_159_fish_82",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 105 Versatility for 1 hour."
  );
  const timelyDemise = await createItem(
    "Timely Demise",
    "inv_misc_food_legion_seedbatteredfishplate",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 105 Haste for 1 hour."
  );
  const aromaticSeafoodPlatter = await createItem(
    "Aromatic Seafood Platter",
    "inv_misc_food_legion_drogbarstylesalmon",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 67 Haste and Versatility for 1 hour."
  );
  const feistyFishSticks = await createItem(
    "Feisty Fish Sticks",
    "inv_misc_food_164_fish_seadog",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 67 Haste and Critical Strike for 1 hour."
  );
  const greatCeruleanSea = await createItem(
    "Great Cerulean Sea",
    "inv_misc_food_159_fish_white",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 67 Versatility and Mastery for 1 hour."
  );
  const revengeServedCold = await createItem(
    "Revenge, Served Cold",
    "inv_cooking_100_revengeservedcold_color02",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 67 Critical Strike and Versatility for 1 hour."
  );
  const sizzlingSeafoodMedley = await createItem(
    "Sizzling Seafood Medley",
    "inv_misc_food_draenor_sturgeonstew",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 67 Haste and Mastery for 1 hour."
  );
  const thousandboneTongueslicer = await createItem(
    "Thousandbone Tongueslicer",
    "inv_misc_food_154_fish_77",
    null,
    200,
    null,
    null,
    "Common",
    null,
    1,
    null,
    null,
    "Restores 192,857 health over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 67 Critical Strike and Mastery for 1 hour."
  );
  const grandBanquetOfTheKaluak = await createItem(
    "Grand Banquet of the Kalu'ak",
    "inv_cooking_10_grandbanquet",
    null,
    200,
    null,
    null,
    "Rare",
    null,
    1,
    null,
    null,
    "Set out a traditional tuskarr feast that all players can partake in. Restores 50000 health and 66666 mana over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 75 primary stat for 1 hour."
  );
  const hoardOfDraconicDelicacies = await createItem(
    "Hoard of Draconic Delicacies",
    "inv_cooking_10_draconicdelicacies",
    null,
    200,
    null,
    "Everyone needs to throw stuff in to make it work? Like the pot from Shadowlands?",
    "Rare",
    null,
    1,
    null,
    null,
    "Set out a Growing Hoard of Draconic Delicacies, ready to fill with delicious prepared meals and excess ingredients. Finish it to provide a great feast for everyone to enjoy! Once complete, restores 50000 health and 66666 mana over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 75 primary stat for 1 hour. (3 Min Cooldown)"
  );
  const yusasHeartyStew = await createItem(
    "Yusa's Hearty Stew",
    "inv_cooking_10_heartystew",
    null,
    200,
    null,
    "The budget feast.",
    "Rare",
    null,
    1,
    null,
    null,
    "Set out a fresh batch of Yusa's Hearty Stew for all players to partake in. Restores 50000 health and 66666 mana over 20 sec. Must remain seated while eating. If you spend at least 10 seconds eating you will become well fed and gain 70 to your lowest secondary stat for 1 hour."
  );

  //
  // SEEDING RECIPES
  //

  //alchemy recipes - 56 total
  //advancedPhialExperimentation
  //advancedPotionExperimentation
  //basicPhialExperimentation
  //basicPotionExperimentation
  //reclaimConcoctions
  const primalConvergentRecipe = await createRecipe(
    "Primal Convergent",
    primalConvergent,
    2,
    alchemy,
    [
      [awakenedEarth, 1],
      [awakenedFire, 1],
      [awakenedAir, 1],
      [awakenedFrost, 1],
      [awakenedOrder, 1],
    ],
    20,
    "Reagents",
    1,
    275,
    null,
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const omniumDraconisRecipe = await createRecipe(
    "Omnium Draconis",
    omniumDraconis,
    1,
    alchemy,
    [
      [writhebark, 1],
      [saxifrage, 1],
      [hochenblume, 5],
      [bubblePoppy, 1],
    ],
    10,
    "Reagents",
    1,
    325,
    null,
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const residualNeuralChannelingAgentRecipe = await createRecipe(
    "Residual Neural Channeling Agent",
    residualNeuralChannelingAgent,
    5,
    alchemy,
    [
      [awakenedAir, 1],
      [awakenedEarth, 1],
      [draconicVial, 5],
      [saxifrage, 10],
    ],
    null,
    "Air Potions",
    1,
    400,
    null,
    null,
    "Potion Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Potion Experimentation.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PotionLore: 25, AirFormulatedPotions: 30 },
      ],
    ]
  );
  const bottledPutrescenceRecipe = await createRecipe(
    "Bottled Putrescence",
    bottledPutrescence,
    5,
    alchemy,
    [
      [awakenedAir, 1],
      [awakenedDecay, 2],
      [draconicVial, 5],
      [hochenblume, 30],
    ],
    null,
    "Air Potions",
    3,
    450,
    null,
    { Decayology: 0 },
    "Potion Experimentation",
    "Altar of Decay",
    "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PotionLore: 25, AirFormulatedPotions: 30 },
      ],
    ]
  );
  const potionOfGustsRecipe = await createRecipe(
    "Potion of Gusts",
    potionOfGusts,
    5,
    alchemy,
    [
      [awakenedAir, 1],
      [draconicVial, 5],
      [saxifrage, 5],
      [hochenblume, 20],
    ],
    null,
    "Air Potions",
    3,
    150,
    null,
    null,
    "Potion Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Potion Experimentation.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PotionLore: 25, AirFormulatedPotions: 30 },
      ],
    ]
  );
  const potionOfShockingDisclosureRecipe = await createRecipe(
    "Potion of Shocking Disclosure",
    potionOfShockingDisclosure,
    5,
    alchemy,
    [
      [awakenedAir, 1],
      [awakenedEarth, 1],
      [draconicVial, 5],
      [hochenblume, 10],
    ],
    null,
    "Air Potions",
    3,
    150,
    null,
    null,
    "Potion Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Potion Experimentation.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PotionLore: 25, AirFormulatedPotions: 30 },
      ],
    ]
  );
  const potionOfTheHushedZephyrRecipe = await createRecipe(
    "Potion of Shocking Disclosure",
    potionOfShockingDisclosure,
    5,
    alchemy,
    [
      [awakenedAir, 1],
      [draconicVial, 5],
      [hochenblume, 20],
      [saxifrage, 8],
    ],
    null,
    "Air Potions",
    3,
    150,
    null,
    null,
    "Potion Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Potion Experimentation.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PotionLore: 25, AirFormulatedPotions: 30 },
      ],
    ]
  );
  const aeratedManaPotionRecipe = await createRecipe(
    "Aerated Mana Potion",
    aeratedManaPotion,
    5,
    alchemy,
    [
      [rousingAir, 1],
      [draconicVial, 5],
      [hochenblume, 15],
    ],
    5,
    "Air Potions",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PotionLore: 25, AirFormulatedPotions: 30 },
      ],
    ]
  );
  const potionOfChilledClarityRecipe = await createRecipe(
    "Potion of Chilled Clairty",
    potionOfChilledClarity,
    5,
    alchemy,
    [
      [awakenedFrost, 1],
      [awakenedDecay, 1],
      [draconicVial, 5],
      [bubblePoppy, 10],
    ],
    null,
    "Frost Potions",
    1,
    450,
    null,
    { Decayology: 0 },
    "Potion Experimentation",
    "Altar of Decay",
    "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPotions: 30, PotionLore: 25 },
      ],
    ]
  );
  const delicateSuspensionOfSporesRecipe = await createRecipe(
    "Delicate Suspension of Spores",
    delicateSuspensionOfSpores,
    5,
    alchemy,
    [
      [awakenedFrost, 1],
      [awakenedDecay, 1],
      [draconicVial, 5],
      [bubblePoppy, 10],
    ],
    null,
    "Frost Potions",
    1,
    450,
    null,
    { Decayology: 0 },
    "Potion Experimentation",
    "Altar of Decay",
    "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPotions: 30, PotionLore: 25 },
      ],
    ]
  );
  const potionOfFrozenFocusRecipe = await createRecipe(
    "Potion of Frozen Focus",
    potionOfFrozenFocus,
    5,
    alchemy,
    [
      [awakenedFrost, 1],
      [draconicVial, 5],
      [hochenblume, 20],
      [saxifrage, 8],
    ],
    null,
    "Frost Potions",
    1,
    400,
    null,
    null,
    "Potion Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Potion Experimentation.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPotions: 30, PotionLore: 25 },
      ],
    ]
  );
  const potionOfWitheringVitalityRecipe = await createRecipe(
    "Potion of Withering Vitality",
    potionOfWitheringVitality,
    5,
    alchemy,
    [
      [awakenedFrost, 1],
      [awakenedDecay, 1],
      [draconicVial, 5],
      [writhebark, 10],
    ],
    null,
    "Frost Potions",
    1,
    450,
    null,
    { Decayology: 0 },
    "Potion Experimentation",
    "Altar of Decay",
    "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPotions: 30, PotionLore: 25 },
      ],
    ]
  );
  const potionOfFrozenFatalityRecipe = await createRecipe(
    "Potion of Frozen Fatality",
    potionOfFrozenFatality,
    5,
    alchemy,
    [
      [awakenedFrost, 1],
      [draconicVial, 5],
      [writhebark, 5],
      [hochenblume, 20],
    ],
    null,
    "Frost Potions",
    3,
    200,
    null,
    null,
    "Potion Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Potion Experimentation.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPotions: 30, PotionLore: 25 },
      ],
    ]
  );
  const refreshingHealingPotionRecipe = await createRecipe(
    "Refreshing Healing Potion",
    refreshingHealingPotion,
    5,
    alchemy,
    [
      [rousingFrost, 1],
      [draconicVial, 5],
      [hochenblume, 8],
    ],
    1,
    "Frost Potions",
    3,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPotions: 30, PotionLore: 25 },
      ],
    ]
  );
  const potionCauldronOfUltimatePowerRecipe = await createRecipe(
    "Potion Cauldron of Ultimate Power",
    potionCauldronOfUltimatePower,
    1,
    alchemy,
    [
      [elementalPotionOfPower, 150],
      [omniumDraconis, 20],
    ],
    null,
    "Cauldrons",
    2,
    450,
    null,
    null,
    "Raid Drop",
    "Alchemist's Lab Bench",
    "Learned from Elemental Codex of Ultimate Power, which drops from Vault of the Incarnates bosses on Heroic & Mythic.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Illustrious Insight",
        {
          FrostFormulatedPotions: 30,
          PotionLore: 25,
          AirFormulatedPotions: 30,
        },
      ],
    ]
  );
  const potionCauldronOfPowerRecipe = await createRecipe(
    "Potion Cauldron of Power",
    potionCauldronOfPower,
    1,
    alchemy,
    [
      [elementalPotionOfPower, 100],
      [omniumDraconis, 10],
    ],
    null,
    "Cauldrons",
    2,
    425,
    null,
    { BatchProduction: 10 },
    null,
    "Alchemist's Lab Bench",
    null,
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Illustrious Insight",
        {
          FrostFormulatedPotions: 30,
          PotionLore: 25,
          AirFormulatedPotions: 30,
        },
      ],
    ]
  );
  const cauldronOfThePookaRecipe = await createRecipe(
    "Cauldron of the Pooka",
    cauldronOfThePooka,
    2,
    alchemy,
    [
      [tuftOfPrimalWool, 1],
      [omniumDraconis, 1],
      [primalConvergent, 2],
    ],
    null,
    "Cauldrons",
    1,
    300,
    null,
    null,
    "World Drop",
    "Alchemist's Lab Bench",
    "Drops from Draconic Recipe in a Bottle.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        {
          FrostFormulatedPotions: 30,
          PotionLore: 25,
          AirFormulatedPotions: 30,
        },
      ],
    ]
  );
  const elementalPotionOfUltimatePowerRecipe = await createRecipe(
    "Elemental Potion of Ultimate Power",
    elementalPotionOfUltimatePower,
    20,
    alchemy,
    [
      [primalChaos, 20],
      [awakenedOrder, 2],
      [elementalPotionOfPower, 30],
    ],
    null,
    "Elemental Phials and Potions",
    1,
    450,
    null,
    null,
    "Raid Drop",
    "Alchemist's Lab Bench",
    "Learned from Elemental Codex of Ultimate Power, which drops from Vault of the Incarnates bosses on Heroic & Mythic.",
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Illustrious Insight",
        {
          FrostFormulatedPotions: 30,
          PotionLore: 25,
          AirFormulatedPotions: 30,
        },
      ],
    ]
  );
  const elementalPotionOfPowerRecipe = await createRecipe(
    "Elemental Potion of Power",
    elementalPotionOfPower,
    5,
    alchemy,
    [
      [draconicVial, 5],
      [omniumDraconis, 3],
      [primalConvergent, 1],
    ],
    50,
    "Elemental Phials and Potions",
    3,
    425,
    null,
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        {
          FrostFormulatedPotions: 30,
          PotionLore: 25,
          AirFormulatedPotions: 30,
        },
      ],
    ]
  );
  const phialOfElementalChaosRecipe = await createRecipe(
    "Phial of Elemental Chaos",
    phialOfElementalChaos,
    2,
    alchemy,
    [
      [draconicVial, 2],
      [primalConvergent, 1],
      [omniumDraconis, 2],
    ],
    null,
    "Elemental Phials and Potions",
    1,
    450,
    null,
    null,
    "Phial Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Phial Experimentation.",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPhials: 30, PhialLore: 25, AirFormulatedPhials: 30 },
      ],
    ]
  );
  const phialOfChargedIsolationRecipe = await createRecipe(
    "Phial of Charged Isolation",
    phialOfChargedIsolation,
    2,
    alchemy,
    [
      [awakenedAir, 1],
      [awakenedEarth, 1],
      [draconicVial, 2],
      [saxifrage, 9],
    ],
    null,
    "Air Phials",
    1,
    400,
    null,
    null,
    "Phial Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Phial Experimentation",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PhialLore: 25, AirFormulatedPhials: 30 },
      ],
    ]
  );
  const phialOfStaticEmpowermentRecipe = await createRecipe(
    "Phial of Static Empowerment",
    phialOfStaticEmpowerment,
    2,
    alchemy,
    [
      [awakenedAir, 1],
      [awakenedEarth, 1],
      [draconicVial, 2],
      [bubblePoppy, 5],
    ],
    null,
    "Air Phials",
    1,
    400,
    null,
    null,
    "Phial Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Phial Experimentation",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PhialLore: 25, AirFormulatedPhials: 30 },
      ],
    ]
  );
  const phialOfStillAirRecipe = await createRecipe(
    "Phial of Still Air",
    phialOfStillAir,
    2,
    alchemy,
    [
      [awakenedAir, 1],
      [draconicVial, 2],
      [bubblePoppy, 10],
      [saxifrage, 5],
    ],
    null,
    "Air Phials",
    1,
    400,
    null,
    null,
    "Phial Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Phial Experimentation",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PhialLore: 25, AirFormulatedPhials: 30 },
      ],
    ]
  );
  const phialOfTheEyeInTheStormRecipe = await createRecipe(
    "Phial of the Eye in the Storm",
    phialOfTheEyeInTheStorm,
    2,
    alchemy,
    [
      [awakenedAir, 1],
      [draconicVial, 2],
      [bubblePoppy, 5],
      [saxifrage, 10],
    ],
    null,
    "Air Phials",
    1,
    400,
    null,
    null,
    "Phial Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Phial Experimentation",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PhialLore: 25, AirFormulatedPhials: 30 },
      ],
    ]
  );
  const aeratedPhialOfDeftnessRecipe = await createRecipe(
    "Aerated Phial of Deftness",
    aeratedPhialOfDeftness,
    10,
    alchemy,
    [
      [artisansMettle, 10],
      [awakenedAir, 2],
      [draconicVial, 10],
      [saxifrage, 10],
    ],
    null,
    "Air Phials",
    2,
    400,
    null,
    null,
    "Phial Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Phial Experimentation",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PhialLore: 25, AirFormulatedPhials: 30 },
      ],
    ]
  );
  const chargedPhialOfAlacrityRecipe = await createRecipe(
    "Charged Phial of Alacrity",
    chargedPhialOfAlacrity,
    2,
    alchemy,
    [
      [awakenedAir, 1],
      [awakenedEarth, 1],
      [draconicVial, 2],
      [writhebark, 4],
    ],
    null,
    "Air Phials",
    1,
    200,
    null,
    null,
    "Phial Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Phial Experimentation",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PhialLore: 25, AirFormulatedPhials: 30 },
      ],
    ]
  );
  const aeratedPhialOfQuickHandsRecipe = await createRecipe(
    "Aerated Phial of Quick Hands",
    aeratedPhialOfQuickHands,
    2,
    alchemy,
    [
      [rousingAir, 4],
      [draconicVial, 2],
      [hochenblume, 8],
    ],
    null,
    "Air Phials",
    2,
    200,
    { ArtisansConsortium: "Respected" },
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { PhialLore: 25, AirFormulatedPhials: 30 },
      ],
    ]
  );
  const phialOfIcyPreservationRecipe = await createRecipe(
    "Phial of Icy Preservation",
    phialOfIcyPreservation,
    2,
    alchemy,
    [
      [awakenedDecay, 1],
      [awakenedFrost, 1],
      [draconicVial, 2],
      [saxifrage, 9],
    ],
    null,
    "Frost Phials",
    1,
    450,
    null,
    { Decayology: 0 },
    "Phial Experimentation",
    "Altar of Decay",
    "Learned via Phial Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPhials: 30, PhialLore: 25 },
      ],
    ]
  );
  const icedPhialOfCorruptingRageRecipe = await createRecipe(
    "Iced Phial of Corrupting Rage",
    icedPhialOfCorruptingRage,
    2,
    alchemy,
    [
      [awakenedDecay, 1],
      [awakenedFrost, 1],
      [draconicVial, 2],
      [writhebark, 9],
    ],
    null,
    "Frost Phials",
    1,
    450,
    null,
    { Decayology: 0 },
    "Phial Experimentation",
    "Altar of Decay",
    "Learned via Phial Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPhials: 30, PhialLore: 25 },
      ],
    ]
  );
  const phialOfGlacialFuryRecipe = await createRecipe(
    "Phial of Glacial Fury",
    phialOfGlacialFury,
    2,
    alchemy,
    [
      [awakenedFrost, 1],
      [draconicVial, 2],
      [writhebark, 5],
      [bubblePoppy, 10],
    ],
    null,
    "Frost Phials",
    1,
    400,
    null,
    null,
    "Phial Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Phial Experimentation.",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPhials: 30, PhialLore: 25 },
      ],
    ]
  );
  const steamingPhialOfFinesseRecipe = await createRecipe(
    "Steaming Phial of Finesse",
    steamingPhialOfFinesse,
    10,
    alchemy,
    [
      [artisansMettle, 10],
      [awakenedFrost, 1],
      [awakenedFire, 1],
      [draconicVial, 10],
      [writhebark, 8],
    ],
    null,
    "Frost Phials",
    2,
    400,
    null,
    null,
    "Phial Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Phial Experimentation.",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPhials: 30, PhialLore: 25 },
      ],
    ]
  );
  const crystallinePhialOfPerceptionRecipe = await createRecipe(
    "Crystalline Phial of Perception",
    crystallinePhialOfPerception,
    10,
    alchemy,
    [
      [artisansMettle, 10],
      [awakenedFrost, 2],
      [draconicVial, 10],
      [bubblePoppy, 10],
    ],
    null,
    "Frost Phials",
    2,
    400,
    null,
    null,
    "Phial Experimentation",
    "Alchemist's Lab Bench",
    "Learned via Phial Experimentation.",
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPhials: 30, PhialLore: 25 },
      ],
    ]
  );
  const phialOfTepidVersatilityRecipe = await createRecipe(
    "Phial of Tepid Versatility",
    phialOfTepidVersatility,
    2,
    alchemy,
    [
      [awakenedFrost, 2],
      [draconicVial, 2],
      [hochenblume, 16],
    ],
    25,
    "Frost Phials",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      [
        "Lesser Illustrious Insight",
        { FrostFormulatedPhials: 30, PhialLore: 25 },
      ],
    ]
  );
  // const transmuteDecayToElementsRecipe = await(createRecipe("Transmute: Decay to Elements", transmuteDecayToElements, 1, alchemy, [[awakenedDecay, 1]], null, "Transmutations", 1, null, null, {Decayology: 20}, null, "Alchemist's Lab Bench", "Recover an 'assortment' of Rousing Elements. Has a CD."));
  // const transmuteOrderToElementsRecipe = await(createRecipe("Transmute: Order to Elements", transmuteOrderToElements, 1, alchemy, [[awakenedOrder, 1]], null, "Transmutations", 1, null, null, {Transmutation: 10}, null, "Alchemist's Lab Bench", "Creates one Awakened Air, Earth, Fire, & Frost. Has a CD."));
  const transmuteAwakenedAir = await createRecipe(
    "Transmute: Awakened Air",
    awakenedAir,
    2,
    alchemy,
    [
      [awakenedFrost, 1],
      [awakenedFire, 1],
    ],
    15,
    "Transmutations",
    1,
    null,
    null,
    null,
    null,
    "Alchemist's Lab Bench",
    "Has a CD."
  );
  const transmuteAwakenedEarth = await createRecipe(
    "Transmute: Awakened Earth",
    awakenedEarth,
    2,
    alchemy,
    [
      [awakenedFrost, 1],
      [awakenedFire, 1],
    ],
    15,
    "Transmutations",
    1,
    null,
    null,
    null,
    null,
    "Alchemist's Lab Bench",
    "Has a CD."
  );
  const transmuteAwakenedFire = await createRecipe(
    "Transmute: Awakened Fire",
    awakenedFire,
    2,
    alchemy,
    [
      [awakenedEarth, 1],
      [awakenedAir, 1],
    ],
    15,
    "Transmutations",
    1,
    null,
    null,
    null,
    null,
    "Alchemist's Lab Bench",
    "Has a CD."
  );
  const transmuteAwakenedFrost = await createRecipe(
    "Transmute: Awakened Frost",
    awakenedFrost,
    2,
    alchemy,
    [
      [awakenedEarth, 1],
      [awakenedAir, 1],
    ],
    15,
    "Transmutations",
    1,
    null,
    null,
    null,
    null,
    "Alchemist's Lab Bench",
    "Has a CD."
  );
  const potionAbsorptionInhibitorRecipe = await createRecipe(
    "Potion Absorption Inhibitor",
    potionAbsorptionInhibitor,
    1,
    alchemy,
    [
      [saxifrage, 10],
      [hochenblume, 20],
      [bubblePoppy, 10],
      [primalConvergent, 4],
    ],
    null,
    "Optional Reagents",
    1,
    325,
    null,
    null,
    "Raid Drop",
    "Alchemist's Lab Bench",
    "Drops from 'bosses in Vault of the Incarnates'.",
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const illustriousInsightRecipeAlchemy = await createRecipe(
    "Illustrious Insight",
    illustriousInsight,
    1,
    alchemy,
    [[artisansMettle, 50]],
    null,
    "Finishing Reagents",
    1,
    null,
    null,
    null,
    "Various Specializations",
    "Alchemist's Lab Bench"
  );
  const writhefireOilRecipe = await createRecipe(
    "Writhefire Oil",
    writhefireOil,
    2,
    alchemy,
    [
      [awakenedFire, 1],
      [writhebark, 1],
      [hochenblume, 2],
    ],
    35,
    "Finishing Reagents",
    1,
    60,
    null,
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const broodSaltRecipe = await createRecipe(
    "Brood Salt",
    broodSalt,
    2,
    alchemy,
    [
      [awakenedFrost, 1],
      [saxifrage, 6],
      [hochenblume, 12],
    ],
    null,
    "Finishing Reagents",
    1,
    300,
    null,
    { ChemicalSynthesis: 20 },
    null,
    "Alchemist's Lab Bench",
    null,
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const stableFluidicDraconiumRecipe = await createRecipe(
    "Stable Fluidic Draconium",
    stableFluidicDraconium,
    2,
    alchemy,
    [
      [awakenedAir, 1],
      [draconiumOre, 3],
      [writhebark, 3],
    ],
    null,
    "Finishing Reagents",
    1,
    300,
    { ArtisansConsortium: "Respected" },
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const agitatingPotionAugmentationRecipe = await createRecipe(
    "Agitating Potion Augmentation",
    agitatingPotionAugmentation,
    2,
    alchemy,
    [
      [saxifrage, 5],
      [hochenblume, 12],
      [bubblePoppy, 6],
    ],
    null,
    "Finishing Reagents",
    1,
    300,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const reactivePhialEmbellishmentRecipe = await createRecipe(
    "Reactive Phial Embellishment",
    reactivePhialEmbellishment,
    2,
    alchemy,
    [
      [writhebark, 6],
      [hochenblume, 12],
      [bubblePoppy, 6],
    ],
    null,
    "Finishing Reagents",
    1,
    300,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const sagaciousIncenseRecipe = await createRecipe(
    "Sagacious Incense",
    sagaciousIncense,
    2,
    alchemy,
    [
      [primalConvergent, 1],
      [saxifrage, 5],
    ],
    null,
    "Incense",
    1,
    300,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const exultantIncenseRecipe = await createRecipe(
    "Exultant Incense",
    exultantIncense,
    2,
    alchemy,
    [
      [saxifrage, 6],
      [hochenblume, 6],
    ],
    null,
    "Incense",
    1,
    250,
    { MaruukCentaur: 22 },
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const fervidIncenseRecipe = await createRecipe(
    "Fervid Incense",
    fervidIncense,
    2,
    alchemy,
    [
      [writhebark, 6],
      [hochenblume, 6],
    ],
    null,
    "Incense",
    1,
    150,
    null,
    null,
    "World Drop",
    "Alchemist's Lab Bench",
    "Drops from Draconic Recipe in a Bottle.",
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const somniferousIncenseRecipe = await createRecipe(
    "Somniferous Incense",
    somniferousIncense,
    2,
    alchemy,
    [
      [bubblePoppy, 6],
      [hochenblume, 6],
    ],
    null,
    "Incense",
    1,
    250,
    null,
    null,
    "World Drop",
    "Alchemist's Lab Bench",
    "Drops from Draconic Recipe in a Bottle.",
    [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  );
  const alacritousAlchemistStoneRecipe = await createRecipe(
    "Alacritous Alchemist Stone",
    alacritousAlchemistStone,
    1,
    alchemy,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 60],
      [glowingTitanOrb, 1],
      [omniumDraconis, 15],
      [elementalPotionOfPower, 12],
      [potionOfFrozenFocus, 12],
    ],
    null,
    "Alchemist Stones",
    1,
    275,
    { MaruukCentaur: 13 },
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [
      ["Primal Infusion", {}],
      ["Alchemical Catalyst", { PotionMastery: 30 }],
      ["Illustrious Insight", { PotionLore: 25 }],
    ]
  );
  const sustainingAlchemistStoneRecipe = await createRecipe(
    "Sustaining Alchemist Stone",
    sustainingAlchemistStone,
    1,
    alchemy,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 60],
      [glowingTitanOrb, 1],
      [primalConvergent, 4],
      [phialOfTepidVersatility, 6],
      [phialOfElementalChaos, 6],
    ],
    null,
    "Alchemist Stones",
    1,
    275,
    { ValdrakkenAccord: 14 },
    null,
    null,
    "Alchemist's Lab Bench",
    null,
    [
      ["Primal Infusion", {}],
      ["Alchemical Catalyst", { PhialMastery: 30 }],
      ["Illustrious Insight", { PhialLore: 25 }],
    ]
  );

  // //blacksmithing recipes - 86 total
  const obsidianSearedAlloyRecipe = await createRecipe(
    "Obsidian Seared Alloy",
    obsidianSearedAlloy,
    2,
    blacksmithing,
    [
      [awakenedOrder, 1],
      [awakenedFire, 1],
      [primalFlux, 6],
      [draconiumOre, 10],
      [khazgoriteOre, 8],
    ],
    null,
    "Smelting",
    1,
    325,
    null,
    null,
    "Quest",
    "Earth-Warder's Forge",
    "Unlocked via 'A Head For Metal' quest in the Waking Shores.",
    [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  );
  const frostfireAlloyRecipe = await createRecipe(
    "Frostfire Alloy",
    frostfireAlloy,
    2,
    blacksmithing,
    [
      [awakenedFire, 1],
      [awakenedFrost, 1],
      [primalFlux, 4],
      [draconiumOre, 5],
      [khazgoriteOre, 4],
    ],
    25,
    "Smelting",
    1,
    325,
    null,
    null,
    null,
    "Forge",
    null,
    [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  );
  const infuriousAlloyRecipe = await createRecipe(
    "Infurious Alloy",
    infuriousAlloy,
    2,
    blacksmithing,
    [
      [awakenedIre, 2],
      [primalFlux, 3],
      [draconiumOre, 4],
      [khazgoriteOre, 2],
    ],
    null,
    "Smelting",
    1,
    200,
    null,
    null,
    "PvP Victory",
    "Forge",
    "Received from Arena, BGs, or WM?",
    [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  );
  const primalMoltenAlloyRecipe = await createRecipe(
    "Primal Molten Alloy",
    primalMoltenAlloy,
    2,
    blacksmithing,
    [
      [awakenedEarth, 1],
      [awakenedFire, 1],
      [primalFlux, 4],
      [draconiumOre, 5],
      [khazgoriteOre, 4],
    ],
    25,
    "Smelting",
    1,
    325,
    null,
    null,
    null,
    "Forge",
    null,
    [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  );
  const illustriousInsightRecipeBlacksmithing = await createRecipe(
    "Illustrious Insight",
    illustriousInsight,
    1,
    blacksmithing,
    [[artisansMettle, 50]],
    null,
    "Finishing Reagents",
    1,
    null,
    null,
    null,
    "Various Specializations",
    "Anvil"
  );
  const armorSpikesRecipe = await createRecipe(
    "Armor Spikes",
    armorSpikes,
    1,
    blacksmithing,
    [
      [awakenedFire, 3],
      [aquaticMaw, 2],
      [sereviteOre, 30],
      [khazgoriteOre, 15],
    ],
    null,
    "Optional Reagents",
    1,
    325,
    { ArtisansConsortium: "Respected" },
    null,
    null,
    "Anvil",
    null,
    [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  );
  const alliedChestplateOfGenerosityRecipe = await createRecipe(
    "Allied Chestplate of Generosity",
    alliedChestplateOfGenerosity,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [centaursTrophyNecklace, 1],
      [obsidianSearedAlloy, 10],
    ],
    null,
    "Armor",
    1,
    325,
    null,
    null,
    "Raid Drop",
    "Anvil",
    "Drops from bosses in Vault of the Incarnates.",
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Illustrious Insight", { Breastplates: 20 }],
    ]
  );
  const alliedWristguardOfCompanionshipRecipe = await createRecipe(
    "Allied Wristguard of Companionship",
    alliedWristguardOfCompanionship,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [centaursTrophyNecklace, 1],
      [obsidianSearedAlloy, 8],
    ],
    null,
    "Armor",
    1,
    325,
    null,
    null,
    "Raid Drop",
    "Anvil",
    "Drops from bosses in Vault of the Incarnates.",
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Illustrious Insight", { Vambraces: 20 }],
    ]
  );
  const frostfireLegguardsOfPreparationRecipe = await createRecipe(
    "Frostfire Legguards of Preparation",
    frostfireLegguardsOfPreparation,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [frostySoul, 1],
      [fierySoul, 1],
      [frostfireAlloy, 16],
    ],
    null,
    "Armor",
    1,
    325,
    null,
    null,
    "Dungeon Drop",
    "Anvil",
    "Drops from Algeth'ar Academy & The Azure Vault.",
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Illustrious Insight", { Greaves: 20 }],
    ]
  );
  const infuriousHelmOfVengeanceRecipe = await createRecipe(
    "Infurious Helm of Vengeance",
    infuriousHelmOfVengeance,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [obsidianSearedAlloy, 2],
      [infuriousAlloy, 20],
    ],
    null,
    "Armor",
    1,
    325,
    null,
    null,
    "PvP Victory",
    "Anvil",
    "Received from Arena, BGs, or WM?",
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Illustrious Insight", { Helms: 20 }],
    ]
  );
  const infuriousWarbootsOfImpunityRecipe = await createRecipe(
    "Infurious Warboots of Impunity",
    infuriousWarbootsOfImpunity,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [largeSturdyFemur, 2],
      [obsidianSearedAlloy, 2],
      [infuriousAlloy, 16],
    ],
    null,
    "Armor",
    1,
    325,
    null,
    null,
    "PvP Victory",
    "Anvil",
    "Received from Arena, BGs, or WM?",
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Illustrious Insight", { Sabatons: 20 }],
    ]
  );
  const primalMoltenBreastplateRecipe = await createRecipe(
    "Primal Molten Breastplate",
    primalMoltenBreastplate,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [primalMoltenAlloy, 16],
    ],
    null,
    "Armor",
    1,
    280,
    null,
    { Breastplates: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Missive - Combat", { LargePlateArmor: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Illustrious Insight", { Breastplates: 20 }],
    ]
  );
  const primalMoltenGauntletsRecipe = await createRecipe(
    "Primal Molten Gauntlets",
    primalMoltenGauntlets,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [primalMoltenAlloy, 14],
    ],
    null,
    "Armor",
    1,
    280,
    null,
    { Gauntlets: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Missive - Combat", { FineArmor: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Illustrious Insight", { Gauntlets: 20 }],
    ]
  );
  const primalMoltenGreatbeltRecipe = await createRecipe(
    "Primal Molten Greatbelt",
    primalMoltenGreatbelt,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [primalMoltenAlloy, 13],
    ],
    null,
    "Armor",
    1,
    280,
    null,
    { Belts: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Missive - Combat", { FineArmor: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Illustrious Insight", { Belts: 20 }],
    ]
  );
  const primalMoltenHelmRecipe = await createRecipe(
    "Primal Molten Helm",
    primalMoltenHelm,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [primalMoltenAlloy, 16],
    ],
    null,
    "Armor",
    1,
    280,
    null,
    { Helms: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Missive - Combat", { SculptedArmor: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Illustrious Insight", { Helms: 20 }],
    ]
  );
  const primalMoltenLegplatesRecipe = await createRecipe(
    "Primal Molten Legplates",
    primalMoltenLegplates,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [primalMoltenAlloy, 16],
    ],
    null,
    "Armor",
    1,
    280,
    null,
    { Greaves: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Missive - Combat", { LargePlateArmor: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Illustrious Insight", { Greaves: 20 }],
    ]
  );
  const primalMoltenPauldronsRecipe = await createRecipe(
    "Primal Molten Pauldrons",
    primalMoltenPauldrons,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [primalMoltenAlloy, 15],
    ],
    null,
    "Armor",
    1,
    280,
    null,
    { Pauldrons: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Missive - Combat", { SculptedArmor: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Illustrious Insight", { Pauldrons: 20 }],
    ]
  );
  const primalMoltenSabatonsRecipe = await createRecipe(
    "Primal Molten Sabatons",
    primalMoltenSabatons,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [primalMoltenAlloy, 14],
    ],
    null,
    "Armor",
    1,
    280,
    null,
    { Sabatons: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Missive - Combat", { SculptedArmor: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Illustrious Insight", { Sabatons: 20 }],
    ]
  );
  const primalMoltenVambracesRecipe = await createRecipe(
    "Primal Molten Vambraces",
    primalMoltenVambraces,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [primalMoltenAlloy, 14],
    ],
    null,
    "Armor",
    1,
    280,
    null,
    { Vambraces: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Missive - Combat", { FineArmor: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Illustrious Insight", { Vambraces: 20 }],
    ]
  );
  const unstableFrostfireBeltRecipe = await createRecipe(
    "Unstable Frostfire Belt",
    unstableFrostfireBelt,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [frostySoul, 1],
      [fierySoul, 1],
      [frostfireAlloy, 13],
    ],
    null,
    "Armor",
    1,
    325,
    null,
    null,
    "Dungeon Drop",
    "Anvil",
    "Drops from Algeth'ar Academy & The Azure Vault.",
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Illustrious Insight", { Belts: 20 }],
    ]
  );
  const explorersExpertHelmRecipe = await createRecipe(
    "Explorer's Expert Helm",
    explorersExpertHelm,
    1,
    blacksmithing,
    [
      [primalFlux, 2],
      [draconiumOre, 7],
      [sereviteOre, 14],
    ],
    50,
    "Armor",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { SculptedArmor: 0 }],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Lesser Illustrious Insight", { Helms: 20 }],
    ]
  );
  const explorersExpertSpauldersRecipe = await createRecipe(
    "Explorer's Expert Spaulders",
    explorersExpertSpaulders,
    1,
    blacksmithing,
    [
      [primalFlux, 2],
      [draconiumOre, 6],
      [sereviteOre, 12],
    ],
    45,
    "Armor",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { SculptedArmor: 0 }],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Lesser Illustrious Insight", { Pauldrons: 20 }],
    ]
  );
  const explorersExpertGauntletsRecipe = await createRecipe(
    "Explorer's Expert Gauntlets",
    explorersExpertGauntlets,
    1,
    blacksmithing,
    [
      [primalFlux, 2],
      [draconiumOre, 6],
      [sereviteOre, 12],
    ],
    40,
    "Armor",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { FineArmor: 0 }],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Lesser Illustrious Insight", { Gauntlets: 20 }],
    ]
  );
  const crimsonCombatantsDraconiumArmguardsRecipe = await createRecipe(
    "Crimson Combatant's Draconium Armguards",
    crimsonCombatantsDraconiumArmguards,
    1,
    blacksmithing,
    [[infuriousAlloy, 2]],
    null,
    "Armor",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Anvil",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { FineArmor: 0 }],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Lesser Illustrious Insight", { Vambraces: 20 }],
    ]
  );
  const crimsonCombatantsDraconiumBreastplateRecipe = await createRecipe(
    "Crimson Combatant's Draconium Breastplate",
    crimsonCombatantsDraconiumBreastplate,
    1,
    blacksmithing,
    [[infuriousAlloy, 2]],
    null,
    "Armor",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Anvil",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { LargePlateArmor: 0 }],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Lesser Illustrious Insight", { Breastplates: 20 }],
    ]
  );
  const crimsonCombatantsDraconiumGauntletsRecipe = await createRecipe(
    "Crimson Combatant's Draconium Gauntlets",
    crimsonCombatantsDraconiumGauntlets,
    1,
    blacksmithing,
    [[infuriousAlloy, 2]],
    null,
    "Armor",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Anvil",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { FineArmor: 0 }],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Lesser Illustrious Insight", { Gauntlets: 20 }],
    ]
  );
  const crimsonCombatantsDraconiumGreavesRecipe = await createRecipe(
    "Crimson Combatant's Draconium Greaves",
    crimsonCombatantsDraconiumGreaves,
    1,
    blacksmithing,
    [[infuriousAlloy, 2]],
    null,
    "Armor",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Anvil",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { LargePlateArmor: 0 }],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Lesser Illustrious Insight", { Greaves: 20 }],
    ]
  );
  const crimsonCombatantsDraconiumHelmRecipe = await createRecipe(
    "Crimson Combatant's Draconium Helm",
    crimsonCombatantsDraconiumHelm,
    1,
    blacksmithing,
    [[infuriousAlloy, 2]],
    null,
    "Armor",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Anvil",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { SculptedArmor: 0 }],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Lesser Illustrious Insight", { Helms: 20 }],
    ]
  );
  const crimsonCombatantsDraconiumPauldronsRecipe = await createRecipe(
    "Crimson Combatant's Draconium Pauldrons",
    crimsonCombatantsDraconiumPauldrons,
    1,
    blacksmithing,
    [[infuriousAlloy, 2]],
    null,
    "Armor",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Anvil",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { SculptedArmor: 0 }],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Lesser Illustrious Insight", { Pauldrons: 20 }],
    ]
  );
  const crimsonCombatantsDraconiumSabatonsRecipe = await createRecipe(
    "Crimson Combatant's Draconium Sabatons",
    crimsonCombatantsDraconiumSabatons,
    1,
    blacksmithing,
    [[infuriousAlloy, 2]],
    null,
    "Armor",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Anvil",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { SculptedArmor: 0 }],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Lesser Illustrious Insight", { Sabatons: 20 }],
    ]
  );
  const crimsonCombatantsDraconiumWaistguardRecipe = await createRecipe(
    "Crimson Combatant's Draconium Waistguard",
    crimsonCombatantsDraconiumWaistguard,
    1,
    blacksmithing,
    [[infuriousAlloy, 2]],
    null,
    "Armor",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Anvil",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { FineArmor: 0 }],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Lesser Illustrious Insight", { Belts: 20 }],
    ]
  );
  const explorersExpertGreavesRecipe = await createRecipe(
    "Explorer's Expert Greaves",
    explorersExpertGreaves,
    1,
    blacksmithing,
    [
      [primalFlux, 2],
      [draconiumOre, 7],
      [sereviteOre, 14],
    ],
    35,
    "Armor",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { LargePlateArmor: 0 }],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Lesser Illustrious Insight", { Greaves: 20 }],
    ]
  );
  const explorersExpertClaspRecipe = await createRecipe(
    "Explorer's Expert Clasp",
    explorersExpertClasp,
    1,
    blacksmithing,
    [
      [primalFlux, 2],
      [draconiumOre, 4],
      [sereviteOre, 10],
    ],
    30,
    "Armor",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { FineArmor: 0 }],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Lesser Illustrious Insight", { Belts: 20 }],
    ]
  );
  const explorersPlateChestguardRecipe = await createRecipe(
    "Explorer's Plate Chestguard",
    explorersPlateChestguard,
    1,
    blacksmithing,
    [
      [primalFlux, 2],
      [draconiumOre, 3],
      [sereviteOre, 10],
    ],
    10,
    "Armor",
    3,
    40,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { LargePlateArmor: 0 }],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Lesser Illustrious Insight", { Breastplates: 20 }],
    ]
  );
  const explorersPlateBootsRecipe = await createRecipe(
    "Explorer's Plate Boots",
    explorersPlateBoots,
    1,
    blacksmithing,
    [
      [primalFlux, 2],
      [draconiumOre, 3],
      [sereviteOre, 10],
    ],
    5,
    "Armor",
    3,
    40,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { SculptedArmor: 0 }],
      ["Quenching Fluid", { SculptedArmor: 30 }],
      ["Lesser Illustrious Insight", { Sabatons: 20 }],
    ]
  );
  const explorersPlateBracersRecipe = await createRecipe(
    "Explorer's Plate Bracers",
    explorersPlateBracers,
    1,
    blacksmithing,
    [
      [primalFlux, 2],
      [draconiumOre, 3],
      [sereviteOre, 8],
    ],
    1,
    "Armor",
    3,
    40,
    null,
    null,
    null,
    "Anvil",
    "Learned by default.",
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { FineArmor: 0 }],
      ["Quenching Fluid", { FineArmor: 30 }],
      ["Lesser Illustrious Insight", { Vambraces: 20 }],
    ]
  );
  const primalMoltenDefenderRecipe = await createRecipe(
    "Primal Molten Defender",
    primalMoltenDefender,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [primalMoltenAlloy, 15],
    ],
    null,
    "Shields",
    1,
    280,
    null,
    { Shields: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Missive - Combat", { LargePlateArmor: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Illustrious Insight", { Shields: 20 }],
    ]
  );
  const shieldOfTheHearthRecipe = await createRecipe(
    "Shield of the Hearth",
    shieldOfTheHearth,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [earthenSoul, 1],
      [glowingTitanOrb, 1],
      [primalMoltenAlloy, 16],
    ],
    null,
    "Shields",
    1,
    325,
    null,
    null,
    "World Drop",
    "Anvil",
    "Apparently is 'stashed within the Dragon Isles'?",
    [
      ["Primal Infusion", { Armorsmithing: 0 }],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Illustrious Insight", { Shields: 20 }],
    ]
  );
  const draconiumDefenderRecipe = await createRecipe(
    "Draconium Defender",
    draconiumDefender,
    1,
    blacksmithing,
    [
      [primalFlux, 5],
      [draconiumOre, 6],
      [sereviteOre, 12],
    ],
    20,
    "Shields",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { LargePlateArmor: 0 }],
      ["Quenching Fluid", { LargePlateArmor: 30 }],
      ["Lesser Illustrious Insight", { Shields: 20 }],
    ]
  );
  const obsidianSearedClaymoreRecipe = await createRecipe(
    "Obsidian Seared Claymore",
    obsidianSearedClaymore,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 2],
      [primalChaos, 160],
      [obsidianSearedAlloy, 8],
      [primalMoltenAlloy, 5],
    ],
    null,
    "Weapons",
    1,
    300,
    { ValdrakkenAccord: 14 },
    null,
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Blades: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Blades: 30 }],
      ["Illustrious Insight", { LongBlades: 25 }],
    ]
  );
  const obsidianSearedCrusherRecipe = await createRecipe(
    "Obsidian Seared Crusher",
    obsidianSearedCrusher,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 2],
      [primalChaos, 160],
      [obsidianSearedAlloy, 7],
      [primalMoltenAlloy, 7],
    ],
    null,
    "Weapons",
    1,
    300,
    null,
    null,
    "World Drop",
    "Anvil",
    "Drops from mobs in the Obsidian Citadel.",
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Hafted: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Hafted: 30 }],
      ["Illustrious Insight", { MacesAndHammers: 25 }],
    ]
  );
  const obsidianSearedFacesmasherRecipe = await createRecipe(
    "Obsidian Seared Facesmasher",
    obsidianSearedFacesmasher,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 80],
      [obsidianSearedAlloy, 6],
      [primalMoltenAlloy, 6],
    ],
    null,
    "Weapons",
    1,
    300,
    { MaruukCentaur: 13 },
    null,
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Blades: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Blades: 30 }],
      ["Illustrious Insight", { ShortBlades: 25 }],
    ]
  );
  const obsidianSearedHalberdRecipe = await createRecipe(
    "Obsidian Seared Halberd",
    obsidianSearedHalberd,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 160],
      [obsidianSearedAlloy, 6],
      [primalMoltenAlloy, 8],
    ],
    null,
    "Weapons",
    1,
    300,
    { MaruukCentaur: 13 },
    null,
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Hafted: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Hafted: 30 }],
      ["Illustrious Insight", { AxesPicksAndPolearms: 25 }],
    ]
  );
  const obsidianSearedHexswordRecipe = await createRecipe(
    "Obsidian Seared Hexsword",
    obsidianSearedHexsword,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 120],
      [obsidianSearedAlloy, 6],
      [primalMoltenAlloy, 6],
    ],
    null,
    "Weapons",
    1,
    300,
    null,
    null,
    "World Drop",
    "Anvil",
    "Drops from mobs in the Obsidian Citadel.",
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Blades: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Blades: 30 }],
      ["Illustrious Insight", { LongBlades: 25 }],
    ]
  );
  const obsidianSearedInvokerRecipe = await createRecipe(
    "Obsidian Seared Invoker",
    obsidianSearedInvoker,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 2],
      [primalChaos, 160],
      [obsidianSearedAlloy, 7],
      [primalMoltenAlloy, 5],
    ],
    null,
    "Weapons",
    1,
    300,
    { ValdrakkenAccord: 14 },
    null,
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Hafted: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Hafted: 30 }],
      ["Illustrious Insight", { MacesAndHammers: 25 }],
    ]
  );
  const obsidianSearedRuneaxeRecipe = await createRecipe(
    "Obsidian Seared Runeaxe",
    obsidianSearedRuneaxe,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 120],
      [obsidianSearedAlloy, 6],
      [primalMoltenAlloy, 6],
    ],
    null,
    "Weapons",
    1,
    300,
    { MaruukCentaur: 13 },
    null,
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Hafted: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Hafted: 30 }],
      ["Illustrious Insight", { AxesPicksAndPolearms: 25 }],
    ]
  );
  const obsidianSearedSlicerRecipe = await createRecipe(
    "Obsidian Seared Slicer",
    obsidianSearedSlicer,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 80],
      [obsidianSearedAlloy, 5],
      [primalMoltenAlloy, 8],
    ],
    null,
    "Weapons",
    1,
    300,
    null,
    null,
    "World Drop",
    "Anvil",
    "Drops from mobs in the Obsidian Citadel.",
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Hafted: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Hafted: 30 }],
      ["Illustrious Insight", { AxesPicksAndPolearms: 25 }],
    ]
  );
  const primalMoltenGreataxeRecipe = await createRecipe(
    "Primal Molten Greataxe",
    primalMoltenGreataxe,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 2],
      [primalChaos, 160],
      [primalMoltenAlloy, 20],
    ],
    null,
    "Weapons",
    1,
    300,
    null,
    { AxesPicksAndPolearms: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Hafted: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Hafted: 30 }],
      ["Illustrious Insight", { AxesPicksAndPolearms: 25 }],
    ]
  );
  const primalMoltenLongswordRecipe = await createRecipe(
    "Primal Molten Longsword",
    primalMoltenLongsword,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 80],
      [primalMoltenAlloy, 17],
    ],
    null,
    "Weapons",
    1,
    300,
    null,
    { LongBlades: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Blades: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Blades: 30 }],
      ["Illustrious Insight", { LongBlades: 25 }],
    ]
  );
  const primalMoltenMaceRecipe = await createRecipe(
    "Primal Molten Mace",
    primalMoltenMace,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 80],
      [primalMoltenAlloy, 17],
    ],
    null,
    "Weapons",
    1,
    300,
    null,
    { MacesAndHammers: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Hafted: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Hafted: 30 }],
      ["Illustrious Insight", { MacesAndHammers: 25 }],
    ]
  );
  const primalMoltenShortbladeRecipe = await createRecipe(
    "Primal Molten Shortblade",
    primalMoltenShortblade,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 80],
      [primalMoltenAlloy, 17],
    ],
    null,
    "Weapons",
    1,
    300,
    null,
    { ShortBlades: 0 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Blades: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Blades: 30 }],
      ["Illustrious Insight", { ShortBlades: 25 }],
    ]
  );
  const primalMoltenSpellbladeRecipe = await createRecipe(
    "Primal Molten Spellblade",
    primalMoltenSpellblade,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 120],
      [primalMoltenAlloy, 17],
    ],
    null,
    "Weapons",
    1,
    300,
    null,
    { ShortBlades: 5 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Blades: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Blades: 30 }],
      ["Illustrious Insight", { ShortBlades: 25 }],
    ]
  );
  const primalMoltenWarglaiveRecipe = await createRecipe(
    "Primal Molten Warglaive",
    primalMoltenWarglaive,
    1,
    blacksmithing,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 80],
      [primalMoltenAlloy, 17],
    ],
    null,
    "Weapons",
    1,
    300,
    null,
    { LongBlades: 5 },
    null,
    "Anvil",
    null,
    [
      ["Primal Infusion", { Weaponsmithing: 0 }],
      ["Missive - Combat", { Blades: 0 }],
      ["Embellishment", {}],
      ["Quenching Fluid", { Blades: 30 }],
      ["Illustrious Insight", { LongBlades: 25 }],
    ]
  );
  const draconiumGreatMaceRecipe = await createRecipe(
    "Draconium Great Mace",
    draconiumGreatMace,
    1,
    blacksmithing,
    [
      [primalFlux, 6],
      [draconiumOre, 10],
      [sereviteOre, 20],
    ],
    50,
    "Weapons",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Hafted: 0 }],
      ["Quenching Fluid", { Hafted: 30 }],
      ["Lesser Illustrious Insight", { MacesAndHammers: 25 }],
    ]
  );
  const draconiumStilettoRecipe = await createRecipe(
    "Draconium Stiletto",
    draconiumStiletto,
    1,
    blacksmithing,
    [
      [primalFlux, 6],
      [draconiumOre, 6],
      [sereviteOre, 12],
    ],
    45,
    "Weapons",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Blades: 0 }],
      ["Quenching Fluid", { Blades: 30 }],
      ["Lesser Illustrious Insight", { ShortBlades: 25 }],
    ]
  );
  const draconiumGreatAxeRecipe = await createRecipe(
    "Draconium Great Axe",
    draconiumGreatAxe,
    1,
    blacksmithing,
    [
      [primalFlux, 6],
      [draconiumOre, 10],
      [sereviteOre, 20],
    ],
    40,
    "Weapons",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Hafted: 0 }],
      ["Quenching Fluid", { Hafted: 30 }],
      ["Lesser Illustrious Insight", { AxesPicksAndPolearms: 25 }],
    ]
  );
  const draconiumKnucklesRecipe = await createRecipe(
    "Draconium Knuckles",
    draconiumKnuckles,
    1,
    blacksmithing,
    [
      [primalFlux, 6],
      [draconiumOre, 6],
      [sereviteOre, 12],
    ],
    30,
    "Weapons",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Blades: 0 }],
      ["Quenching Fluid", { Blades: 30 }],
      ["Lesser Illustrious Insight", { ShortBlades: 25 }],
    ]
  );
  const draconiumSwordRecipe = await createRecipe(
    "Draconium Sword",
    draconiumSword,
    1,
    blacksmithing,
    [
      [primalFlux, 5],
      [draconiumOre, 6],
      [sereviteOre, 12],
    ],
    30,
    "Weapons",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Blades: 0 }],
      ["Quenching Fluid", { Blades: 30 }],
      ["Lesser Illustrious Insight", { LongBlades: 25 }],
    ]
  );
  const draconiumAxeRecipe = await createRecipe(
    "Draconium Axe",
    draconiumAxe,
    1,
    blacksmithing,
    [
      [primalFlux, 5],
      [draconiumOre, 6],
      [sereviteOre, 12],
    ],
    25,
    "Weapons",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Hafted: 0 }],
      ["Quenching Fluid", { Hafted: 30 }],
      ["Lesser Illustrious Insight", { AxesPicksAndPolearms: 25 }],
    ]
  );
  const draconiumDirkRecipe = await createRecipe(
    "Draconium Dirk",
    draconiumDirk,
    1,
    blacksmithing,
    [
      [primalFlux, 6],
      [draconiumOre, 6],
      [sereviteOre, 12],
    ],
    20,
    "Weapons",
    2,
    60,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Blades: 0 }],
      ["Quenching Fluid", { Blades: 30 }],
      ["Lesser Illustrious Insight", { ShortBlades: 25 }],
    ]
  );
  const blackDragonTouchedHammerRecipe = await createRecipe(
    "Black Dragon Touched Hammer",
    blackDragonTouchedHammer,
    1,
    blacksmithing,
    [
      [artisansMettle, 400],
      [earthenSoul, 1],
      [obsidianSearedAlloy, 7],
    ],
    null,
    "Profession Tools and Accessories",
    1,
    450,
    null,
    null,
    "World Drop",
    "Earth-Warder's Forge",
    "Dropped from Rohzor Forgesmash in the Waking Shores.",
    [
      ["Missive - Crafting", {}],
      ["Quenching Fluid", { Hafted: 30, Toolsmithing: 30 }],
      ["Illustrious Insight", { MacesAndHammers: 25, SpecialtySmithing: 40 }],
    ]
  );
  const khazgoriteBlacksmithsHammerRecipe = await createRecipe(
    "Khaz'gorite Blacksmith's Hammer",
    khazgoriteBlacksmithsHammer,
    1,
    blacksmithing,
    [
      [artisansMettle, 225],
      [primalFlux, 15],
      [khazgoriteOre, 40],
      [sereviteOre, 100],
    ],
    null,
    "Profession Tools and Accessories",
    1,
    425,
    null,
    { MacesAndHammers: 10 },
    null,
    "Anvil",
    null,
    [
      ["Missive - Crafting", {}],
      ["Quenching Fluid", { Hafted: 30, Toolsmithing: 30 }],
      ["Illustrious Insight", { MacesAndHammers: 25, SpecialtySmithing: 40 }],
    ]
  );
  const khazgoriteBlacksmithsToolboxRecipe = await createRecipe(
    "Khaz'gorite Blacksmith's Toolbox",
    khazgoriteBlacksmithsToolbox,
    1,
    blacksmithing,
    [
      [artisansMettle, 225],
      [primalFlux, 12],
      [khazgoriteOre, 40],
      [sereviteOre, 100],
    ],
    null,
    "Profession Tools and Accessories",
    1,
    400,
    null,
    { Toolsmithing: 10 },
    null,
    "Anvil",
    null,
    [
      ["Quenching Fluid", { Toolsmithing: 30 }],
      ["Illustrious Insight", { SpecialtySmithing: 40 }],
    ]
  );
  const khazgoriteLeatherworkersKnifeRecipe = await createRecipe(
    "Khaz'gorite Leatherworker's Knife",
    khazgoriteLeatherworkersKnife,
    1,
    blacksmithing,
    [
      [artisansMettle, 225],
      [primalFlux, 15],
      [khazgoriteOre, 40],
      [sereviteOre, 100],
    ],
    null,
    "Profession Tools and Accessories",
    1,
    425,
    { MaruukCentaur: 18 },
    null,
    null,
    "Anvil",
    null,
    [
      ["Missive - Crafting", {}],
      ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
      ["Illustrious Insight", { ShortBlades: 25, SpecialtySmithing: 40 }],
    ]
  );
  const khazgoriteLeatherworkersToolsetRecipe = await createRecipe(
    "Khaz'gorite Leatherworker's Toolset",
    khazgoriteLeatherworkersToolset,
    1,
    blacksmithing,
    [
      [artisansMettle, 300],
      [primalFlux, 12],
      [khazgoriteOre, 40],
      [sereviteOre, 100],
    ],
    null,
    "Profession Tools and Accessories",
    1,
    400,
    { ValdrakkenAccord: 19 },
    null,
    null,
    "Anvil",
    null,
    [
      ["Quenching Fluid", { Toolsmithing: 30 }],
      ["Illustrious Insight", { SpecialtySmithing: 40 }],
    ]
  );
  const khazgoriteNeedleSetRecipe = await createRecipe(
    "Khaz'gorite Needle Set",
    khazgoriteNeedleSet,
    1,
    blacksmithing,
    [
      [artisansMettle, 300],
      [primalFlux, 12],
      [khazgoriteOre, 35],
      [sereviteOre, 100],
    ],
    null,
    "Profession Tools and Accessories",
    1,
    400,
    { ValdrakkenAccord: 19 },
    null,
    null,
    "Anvil",
    null,
    [
      ["Quenching Fluid", { Toolsmithing: 30 }],
      ["Illustrious Insight", { SpecialtySmithing: 40 }],
    ]
  );
  const khazgoritePickaxeRecipe = await createRecipe(
    "Khaz'gorite Pickaxe",
    khazgoritePickaxe,
    1,
    blacksmithing,
    [
      [artisansMettle, 300],
      [primalFlux, 15],
      [khazgoriteOre, 45],
      [sereviteOre, 100],
    ],
    null,
    "Profession Tools and Accessories",
    1,
    425,
    null,
    { AxesPicksAndPolearms: 10 },
    null,
    "Anvil",
    null,
    [
      ["Missive - Gathering", {}],
      ["Quenching Fluid", { Hafted: 30, Toolsmithing: 30 }],
      [
        "Illustrious Insight",
        { AxesPicksAndPolearms: 25, SpecialtySmithing: 40 },
      ],
    ]
  );
  const khazgoriteSickleRecipe = await createRecipe(
    "Khaz'gorite Sickle",
    khazgoriteSickle,
    1,
    blacksmithing,
    [
      [artisansMettle, 300],
      [primalFlux, 15],
      [khazgoriteOre, 40],
      [sereviteOre, 100],
    ],
    null,
    "Profession Tools and Accessories",
    1,
    425,
    { ValdrakkenAccord: 19 },
    null,
    null,
    "Anvil",
    null,
    [
      ["Missive - Gathering", {}],
      ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
      ["Illustrious Insight", { LongBlades: 25, SpecialtySmithing: 40 }],
    ]
  );
  const khazgoriteSkinningKnifeRecipe = await createRecipe(
    "Khaz'gorite Skinning Knife",
    khazgoriteSkinningKnife,
    1,
    blacksmithing,
    [
      [artisansMettle, 300],
      [primalFlux, 15],
      [khazgoriteOre, 40],
      [sereviteOre, 100],
    ],
    null,
    "Profession Tools and Accessories",
    1,
    425,
    { MaruukCentaur: 18 },
    null,
    null,
    "Anvil",
    null,
    [
      ["Missive - Gathering", {}],
      ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
      ["Illustrious Insight", { ShortBlades: 25, SpecialtySmithing: 40 }],
    ]
  );
  const draconiumNeedleSetRecipe = await createRecipe(
    "Draconium Needle Set",
    draconiumNeedleSet,
    1,
    blacksmithing,
    [
      [primalFlux, 3],
      [draconiumOre, 4],
      [sereviteOre, 10],
    ],
    30,
    "Profession Tools and Accessories",
    2,
    80,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Quenching Fluid", { Toolsmithing: 30 }],
      ["Lesser Illustrious Insight", { SpecialtySmithing: 40 }],
    ]
  );
  const draconiumLeatherworkersToolsetRecipe = await createRecipe(
    "Draconium Leatherworker's Toolset",
    draconiumLeatherworkersToolset,
    1,
    blacksmithing,
    [
      [primalFlux, 3],
      [sereviteOre, 12],
      [draconiumOre, 3],
    ],
    25,
    "Profession Tools and Accessories",
    3,
    80,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Quenching Fluid", { Toolsmithing: 30 }],
      ["Lesser Illustrious Insight", { SpecialtySmithing: 40 }],
    ]
  );
  const draconiumLeatherworkersKnifeRecipe = await createRecipe(
    "Draconium Leatherworker's Knife",
    draconiumLeatherworkersKnife,
    1,
    blacksmithing,
    [
      [primalFlux, 4],
      [draconiumOre, 3],
      [sereviteOre, 12],
    ],
    20,
    "Profession Tools and Accessories",
    3,
    80,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Missive - Crafting", {}],
      ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
      [
        "Lesser Illustrious Insight",
        { ShortBlades: 25, SpecialtySmithing: 40 },
      ],
    ]
  );
  const draconiumBlacksmithsToolboxRecipe = await createRecipe(
    "Draconium Blacksmith's Toolbox",
    draconiumBlacksmithsToolbox,
    1,
    blacksmithing,
    [
      [primalFlux, 3],
      [sereviteOre, 12],
      [draconiumOre, 3],
    ],
    15,
    "Profession Tools and Accessories",
    3,
    80,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Quenching Fluid", { Toolsmithing: 30 }],
      ["Lesser Illustrious Insight", { SpecialtySmithing: 40 }],
    ]
  );
  const draconiumSkinningKnifeRecipe = await createRecipe(
    "Draconium Skinning Knife",
    draconiumSkinningKnife,
    1,
    blacksmithing,
    [
      [primalFlux, 4],
      [draconiumOre, 3],
      [sereviteOre, 10],
    ],
    15,
    "Profession Tools and Accessories",
    3,
    80,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Missive - Gathering", {}],
      ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
      [
        "Lesser Illustrious Insight",
        { ShortBlades: 25, SpecialtySmithing: 40 },
      ],
    ]
  );
  const draconiumSickleRecipe = await createRecipe(
    "Draconium Sickle",
    draconiumSickle,
    1,
    blacksmithing,
    [
      [primalFlux, 4],
      [draconiumOre, 2],
      [sereviteOre, 10],
    ],
    10,
    "Profession Tools and Accessories",
    3,
    80,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Missive - Gathering", {}],
      ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
      ["Lesser Illustrious Insight", { LongBlades: 25, SpecialtySmithing: 40 }],
    ]
  );
  const draconiumPickaxeRecipe = await createRecipe(
    "Draconium Pickaxe",
    draconiumPickaxe,
    1,
    blacksmithing,
    [
      [primalFlux, 4],
      [draconiumOre, 2],
      [sereviteOre, 10],
    ],
    5,
    "Profession Tools and Accessories",
    3,
    80,
    null,
    null,
    null,
    "Anvil",
    null,
    [
      ["Missive - Gathering", {}],
      ["Quenching Fluid", { Hafted: 30, Toolsmithing: 30 }],
      [
        "Lesser Illustrious Insight",
        { AxesPicksAndPolearms: 25, SpecialtySmithing: 40 },
      ],
    ]
  );
  const draconiumBlacksmithsHammerRecipe = await createRecipe(
    "Draconium Blacksmith's Hammer",
    draconiumBlacksmithsHammer,
    1,
    blacksmithing,
    [
      [primalFlux, 4],
      [draconiumOre, 2],
      [sereviteOre, 10],
    ],
    1,
    "Profession Tools and Accessories",
    3,
    80,
    null,
    null,
    null,
    "Anvil",
    "Learned by default.",
    [
      ["Missive - Crafting", {}],
      ["Quenching Fluid", { Hafted: 30, Toolsmithing: 30 }],
      [
        "Lesser Illustrious Insight",
        { MacesAndHammers: 25, SpecialtySmithing: 40 },
      ],
    ]
  );
  const mastersHammerRecipe = await createRecipe(
    "Master's Hammer",
    mastersHammer,
    1,
    blacksmithing,
    [
      [primalFlux, 10],
      [obsidianSearedAlloy, 1],
      [primalMoltenAlloy, 2],
      [frostfireAlloy, 2],
    ],
    null,
    "Consumable Tools",
    1,
    null,
    null,
    null,
    "Various Specializations",
    "Anvil",
    "Similar to Illustrious Insight - any Specialization rank that mentions Master's Hammer gives you this recipe."
  );
  const sturdyExpeditionShovelRecipe = await createRecipe(
    "Sturdy Expedition Shovel",
    sturdyExpeditionShovel,
    2,
    blacksmithing,
    [
      [primalFlux, 2],
      [sereviteOre, 10],
    ],
    null,
    "Consumable Tools",
    1,
    null,
    { DragonscaleExpedition: "?" },
    null,
    null,
    "Anvil",
    null,
    [["Quenching Fluid", { Toolsmithing: 30 }]]
  );
  const sereviteRepairHammerRecipe = await createRecipe(
    "Serevite Repair Hammer",
    sereviteRepairHammer,
    1,
    blacksmithing,
    [
      [primalFlux, 3],
      [sereviteOre, 8],
    ],
    15,
    "Consumable Tools",
    1,
    null,
    null,
    null,
    null,
    "Anvil",
    null,
    [["Quenching Fluid", { Toolsmithing: 30 }]]
  );
  const sereviteSkeletonKeyRecipe = await createRecipe(
    "Serevite Skeleton Key",
    sereviteSkeletonKey,
    5,
    blacksmithing,
    [
      [primalFlux, 3],
      [sereviteOre, 20],
    ],
    5,
    "Consumable Tools",
    1,
    null,
    null,
    null,
    null,
    "Anvil",
    null,
    [["Quenching Fluid", { Toolsmithing: 30 }]]
  );
  const primalRazorstoneRecipe = await createRecipe(
    "Primal Razorstone",
    primalRazorstone,
    5,
    blacksmithing,
    [
      [glossyStone, 4],
      [silkenGemdust, 1],
    ],
    null,
    "Stonework",
    1,
    325,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  );
  const primalWhetstoneRecipe = await createRecipe(
    "Primal Whetstone",
    primalWhetstone,
    5,
    blacksmithing,
    [
      [awakenedFire, 1],
      [glossyStone, 4],
    ],
    35,
    "Stonework",
    1,
    325,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  );
  const primalWeightstoneRecipe = await createRecipe(
    "Primal Weightstone",
    primalWeightstone,
    5,
    blacksmithing,
    [
      [awakenedEarth, 1],
      [glossyStone, 4],
    ],
    30,
    "Stonework",
    1,
    325,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  );
  const alvinTheAnvilRecipe = await createRecipe(
    "Alvin the Anvil",
    alvinTheAnvil,
    1,
    blacksmithing,
    [
      [earthenSoul, 1],
      [primalMoltenAlloy, 6],
      [frostfireAlloy, 6],
      [infuriousAlloy, 6],
    ],
    null,
    "Pets",
    1,
    null,
    null,
    null,
    "World Drop",
    "Anvil",
    "Drops from 'Powerful Blacksmiths'?"
  );
  const prototypeExplorersBardingFrameworkRecipe = await createRecipe(
    "Prototype Explorer's Barding Framework",
    prototypeExplorersBardingFramework,
    1,
    blacksmithing,
    [
      [primalFlux, 5],
      [primalBearSpine, 3],
      [sereviteOre, 20],
      [primalMoltenAlloy, 1],
      [obsidianSearedAlloy, 2],
    ],
    null,
    "Dragon Riding",
    1,
    null,
    { MaruukCentaur: 22 },
    null,
    null,
    "Anvil"
  );
  const prototypeRegalBardingFrameworkRecipe = await createRecipe(
    "Prototype Regal Barding Framework",
    prototypeRegalBardingFramework,
    1,
    blacksmithing,
    [
      [primalFlux, 5],
      [mastodonTusk, 3],
      [sereviteOre, 20],
      [frostfireAlloy, 1],
      [obsidianSearedAlloy, 2],
    ],
    null,
    "Dragon Riding",
    1,
    null,
    null,
    null,
    "World Drop",
    "Anvil",
    "Drops from Draconic Recipe in a Bottle."
  );

  // //enchanting recipes - 68 total
  const illustriousInsightRecipeEnchanting = await createRecipe(
    "Illustrious Insight",
    illustriousInsight,
    1,
    enchanting,
    [[artisansMettle, 50]],
    null,
    "Finishing Reagents",
    1,
    null,
    null,
    null,
    "Various Specializations",
    "Enchanter's Lectern"
  );
  const gracefulAvoidanceRecipe = await createRecipe(
    null,
    gracefulAvoidance,
    1,
    enchanting,
    [
      [chromaticDust, 8],
      [vibrantShard, 3],
    ],
    null,
    "Cloak Enchantments",
    1,
    400,
    { DragonscaleExpedition: 9 },
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const homeboundSpeedRecipe = await createRecipe(
    null,
    homeboundSpeed,
    1,
    enchanting,
    [
      [chromaticDust, 8],
      [vibrantShard, 3],
    ],
    null,
    "Cloak Enchantments",
    1,
    400,
    { ValdrakkenAccord: 11 },
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const regenerativeLeechRecipe = await createRecipe(
    null,
    regenerativeLeech,
    1,
    enchanting,
    [
      [chromaticDust, 8],
      [vibrantShard, 3],
    ],
    null,
    "Cloak Enchantments",
    1,
    400,
    { IskaaraTuskarr: 10 },
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const writOfAvoidanceCloakRecipe = await createRecipe(
    null,
    writOfAvoidanceCloak,
    1,
    enchanting,
    [[chromaticDust, 12]],
    25,
    "Cloak Enchantments",
    1,
    200,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const writOfLeechCloakRecipe = await createRecipe(
    null,
    writOfLeechCloak,
    1,
    enchanting,
    [[chromaticDust, 12]],
    25,
    "Cloak Enchantments",
    1,
    200,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const writOfSpeedCloakRecipe = await createRecipe(
    null,
    writOfSpeedCloak,
    1,
    enchanting,
    [[chromaticDust, 12]],
    25,
    "Cloak Enchantments",
    1,
    200,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const acceleratedAgilityRecipe = await createRecipe(
    null,
    acceleratedAgility,
    1,
    enchanting,
    [
      [vibrantShard, 3],
      [resonantCrystal, 2],
    ],
    null,
    "Chest Enchantments",
    1,
    400,
    { IskaaraTuskarr: 10 },
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const reserveOfIntellectRecipe = await createRecipe(
    null,
    reserveOfIntellect,
    1,
    enchanting,
    [
      [vibrantShard, 4],
      [resonantCrystal, 1],
    ],
    null,
    "Chest Enchantments",
    1,
    400,
    null,
    { MagicalReinforcement: 20 },
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const sustainedStrengthRecipe = await createRecipe(
    null,
    sustainedStrength,
    1,
    enchanting,
    [
      [vibrantShard, 4],
      [resonantCrystal, 2],
    ],
    null,
    "Chest Enchantments",
    1,
    400,
    { MaruukCentaur: 8 },
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const wakingStatsRecipe = await createRecipe(
    null,
    wakingStats,
    1,
    enchanting,
    [
      [chromaticDust, 8],
      [vibrantShard, 3],
    ],
    null,
    "Chest Enchantments",
    1,
    350,
    null,
    { MagicalReinforcement: 0 },
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const devotionOfAvoidanceRecipe = await createRecipe(
    null,
    devotionOfAvoidance,
    1,
    enchanting,
    [
      [chromaticDust, 5],
      [vibrantShard, 4],
    ],
    null,
    "Bracer Enchantments",
    1,
    425,
    null,
    { Adaptive: 0 },
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const devotionOfLeechRecipe = await createRecipe(
    null,
    devotionOfLeech,
    1,
    enchanting,
    [
      [chromaticDust, 5],
      [vibrantShard, 4],
    ],
    null,
    "Bracer Enchantments",
    1,
    425,
    null,
    { Adaptive: 10 },
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const devotionOfSpeedRecipe = await createRecipe(
    null,
    devotionOfSpeed,
    1,
    enchanting,
    [
      [chromaticDust, 5],
      [vibrantShard, 4],
    ],
    null,
    "Bracer Enchantments",
    1,
    425,
    null,
    { Adaptive: 20 },
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const writOfAvoidanceBracerRecipe = await createRecipe(
    null,
    writOfAvoidanceBracer,
    1,
    enchanting,
    [[vibrantShard, 1]],
    15,
    "Bracer Enchantments",
    1,
    60,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const writOfLeechBracerRecipe = await createRecipe(
    null,
    writOfLeechBracer,
    1,
    enchanting,
    [[vibrantShard, 1]],
    15,
    "Bracer Enchantments",
    1,
    60,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const writOfSpeedBracerRecipe = await createRecipe(
    null,
    writOfSpeedBracer,
    1,
    enchanting,
    [[vibrantShard, 1]],
    15,
    "Bracer Enchantments",
    1,
    60,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  );
  const plainsrunnersBreezeRecipe = await createRecipe(
    null,
    plainsrunnersBreeze,
    1,
    enchanting,
    [
      [vibrantShard, 4],
      [awakenedAir, 1],
      [awakenedEarth, 1],
    ],
    null,
    "Boot Enchantments",
    1,
    450,
    { MaruukCentaur: 8 },
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Earthen: 10, Wafting: 10 }]]
  );
  const ridersReassuranceRecipe = await createRecipe(
    null,
    ridersReassurance,
    1,
    enchanting,
    [
      [vibrantShard, 4],
      [awakenedAir, 1],
      [awakenedEarth, 1],
    ],
    null,
    "Boot Enchantments",
    1,
    450,
    { DragonscaleExpedition: 9 },
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Earthen: 10, Wafting: 10 }]]
  );
  const watchersLoamRecipe = await createRecipe(
    null,
    watchersLoam,
    1,
    enchanting,
    [
      [vibrantShard, 4],
      [awakenedAir, 1],
      [awakenedEarth, 1],
    ],
    null,
    "Boot Enchantments",
    1,
    450,
    { ValdrakkenAccord: 11 },
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Earthen: 10, Wafting: 10 }]]
  );
  const devotionOfCriticalStrikeRecipe = await createRecipe(
    null,
    devotionOfCriticalStrike,
    1,
    enchanting,
    [
      [chromaticDust, 5],
      [vibrantShard, 3],
    ],
    35,
    "Ring Enchantments",
    1,
    425,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const devotionOfHasteRecipe = await createRecipe(
    null,
    devotionOfHaste,
    1,
    enchanting,
    [
      [chromaticDust, 5],
      [vibrantShard, 3],
    ],
    35,
    "Ring Enchantments",
    1,
    425,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const devotionOfMasteryRecipe = await createRecipe(
    null,
    devotionOfMastery,
    1,
    enchanting,
    [
      [chromaticDust, 5],
      [vibrantShard, 3],
    ],
    35,
    "Ring Enchantments",
    1,
    425,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const devotionOfVersatilityRecipe = await createRecipe(
    null,
    devotionOfVersatility,
    1,
    enchanting,
    [
      [chromaticDust, 5],
      [vibrantShard, 3],
    ],
    30,
    "Ring Enchantments",
    1,
    425,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const writOfCriticalStrikeRecipe = await createRecipe(
    null,
    writOfCriticalStrike,
    1,
    enchanting,
    [[chromaticDust, 3]],
    5,
    "Ring Enchantments",
    1,
    40,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const writOfHasteRecipe = await createRecipe(
    null,
    writOfHaste,
    1,
    enchanting,
    [[chromaticDust, 3]],
    5,
    "Ring Enchantments",
    1,
    40,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const writOfMasteryRecipe = await createRecipe(
    null,
    writOfMastery,
    1,
    enchanting,
    [[chromaticDust, 3]],
    5,
    "Ring Enchantments",
    1,
    40,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const writOfVersatilityRecipe = await createRecipe(
    null,
    writOfHaste,
    1,
    enchanting,
    [[chromaticDust, 3]],
    1,
    "Ring Enchantments",
    1,
    40,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  );
  const burningDevotionRecipe = await createRecipe(
    null,
    burningDevotion,
    1,
    enchanting,
    [
      [vibrantShard, 5],
      [resonantCrystal, 4],
      [awakenedFire, 6],
      [glowingTitanOrb, 3],
    ],
    null,
    "Weapon Enchantments",
    1,
    425,
    null,
    { Burning: 0 },
    null,
    null,
    null,
    [["Illustrious Insight", { Burning: 10 }]]
  );
  const earthenDevotionRecipe = await createRecipe(
    null,
    earthenDevotion,
    1,
    enchanting,
    [
      [vibrantShard, 5],
      [resonantCrystal, 4],
      [awakenedEarth, 6],
      [glowingTitanOrb, 3],
    ],
    null,
    "Weapon Enchantments",
    1,
    425,
    null,
    { Earthen: 0 },
    null,
    null,
    null,
    [["Illustrious Insight", { Earthen: 10 }]]
  );
  const frozenDevotionRecipe = await createRecipe(
    null,
    frozenDevotion,
    1,
    enchanting,
    [
      [vibrantShard, 5],
      [resonantCrystal, 4],
      [awakenedFrost, 6],
      [glowingTitanOrb, 3],
    ],
    null,
    "Weapon Enchantments",
    1,
    425,
    null,
    { Frozen: 0 },
    null,
    null,
    null,
    [["Illustrious Insight", { Frozen: 10 }]]
  );
  const sophicDevotionRecipe = await createRecipe(
    null,
    sophicDevotion,
    1,
    enchanting,
    [
      [vibrantShard, 5],
      [resonantCrystal, 4],
      [awakenedOrder, 4],
      [glowingTitanOrb, 3],
    ],
    null,
    "Weapon Enchantments",
    1,
    425,
    null,
    { Sophic: 0 },
    null,
    null,
    null,
    [["Illustrious Insight", { Sophic: 10 }]]
  );
  const waftingDevotionRecipe = await createRecipe(
    null,
    waftingDevotion,
    1,
    enchanting,
    [
      [vibrantShard, 5],
      [resonantCrystal, 4],
      [awakenedAir, 6],
      [glowingTitanOrb, 3],
    ],
    null,
    "Weapon Enchantments",
    1,
    425,
    null,
    { Wafting: 0 },
    null,
    null,
    null,
    [["Illustrious Insight", { Wafting: 10 }]]
  );
  const burningWritRecipe = await createRecipe(
    null,
    burningWrit,
    1,
    enchanting,
    [
      [chromaticDust, 15],
      [resonantCrystal, 2],
      [awakenedFire, 4],
    ],
    50,
    "Weapon Enchantments",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [["Illustrious Insight", { Burning: 10 }]]
  );
  const earthenWritRecipe = await createRecipe(
    null,
    earthenWrit,
    1,
    enchanting,
    [
      [chromaticDust, 15],
      [resonantCrystal, 2],
      [awakenedEarth, 4],
    ],
    50,
    "Weapon Enchantments",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [["Illustrious Insight", { Earthen: 10 }]]
  );
  const frozenWritRecipe = await createRecipe(
    null,
    frozenWrit,
    1,
    enchanting,
    [
      [chromaticDust, 15],
      [resonantCrystal, 2],
      [awakenedFrost, 4],
    ],
    50,
    "Weapon Enchantments",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [["Illustrious Insight", { Frozen: 10 }]]
  );
  const sophicWritRecipe = await createRecipe(
    null,
    sophicWrit,
    1,
    enchanting,
    [
      [chromaticDust, 15],
      [resonantCrystal, 2],
      [awakenedOrder, 3],
    ],
    50,
    "Weapon Enchantments",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [["Illustrious Insight", { Sophic: 10 }]]
  );
  const waftingWritRecipe = await createRecipe(
    null,
    waftingWrit,
    1,
    enchanting,
    [
      [chromaticDust, 15],
      [resonantCrystal, 2],
      [awakenedAir, 4],
    ],
    50,
    "Weapon Enchantments",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [["Illustrious Insight", { Wafting: 10 }]]
  );
  const draconicDeftnessRecipe = await createRecipe(
    null,
    draconicDeftness,
    1,
    enchanting,
    [
      [vibrantShard, 4],
      [resonantCrystal, 2],
      [iridescentPlume, 3],
    ],
    null,
    "Profession Tool Enchantments",
    1,
    400,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    null,
    null,
    [["Illustrious Insight", { Artistry: 30 }]]
  );
  const draconicFinesseRecipe = await createRecipe(
    null,
    draconicFinesse,
    1,
    enchanting,
    [
      [vibrantShard, 4],
      [resonantCrystal, 2],
      [iridescentPlume, 3],
    ],
    null,
    "Profession Tool Enchantments",
    1,
    400,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    null,
    null,
    [["Illustrious Insight", { Artistry: 30 }]]
  );
  const draconicInspirationRecipe = await createRecipe(
    null,
    draconicInspiration,
    1,
    enchanting,
    [
      [vibrantShard, 4],
      [resonantCrystal, 2],
      [iridescentPlume, 3],
    ],
    null,
    "Profession Tool Enchantments",
    1,
    400,
    null,
    { Artistry: 0 },
    null,
    null,
    null,
    [["Illustrious Insight", { Artistry: 30 }]]
  );
  const draconicPerceptionRecipe = await createRecipe(
    null,
    draconicPerception,
    1,
    enchanting,
    [
      [vibrantShard, 4],
      [resonantCrystal, 2],
      [iridescentPlume, 3],
    ],
    null,
    "Profession Tool Enchantments",
    1,
    400,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    null,
    null,
    [["Illustrious Insight", { Artistry: 30 }]]
  );
  const draconicResourcefulnessRecipe = await createRecipe(
    null,
    draconicResourcefulness,
    1,
    enchanting,
    [
      [vibrantShard, 4],
      [resonantCrystal, 2],
      [iridescentPlume, 3],
    ],
    null,
    "Profession Tool Enchantments",
    1,
    400,
    null,
    { Artistry: 15 },
    null,
    null,
    null,
    [["Illustrious Insight", { Artistry: 30 }]]
  );
  const torchOfPrimalAwakeningRecipe = await createRecipe(
    "Torch of Primal Awakening",
    torchOfPrimalAwakening,
    1,
    enchanting,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 120],
      [vibrantShard, 2],
      [resonantCrystal, 3],
      [runedWrithebark, 2],
      [primalMoltenAlloy, 2],
    ],
    null,
    "Rods and Wands",
    1,
    265,
    null,
    { RodsAndWands: 30 },
    null,
    "Enchanter's Lectern",
    null,
    [
      ["Missive - Combat", { RodsAndWands: 0 }],
      ["Primal Infusion", { RodsAndWands: 20 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { RodsAndWands: 45 }],
    ]
  );
  const runedKhazgoriteRodRecipe = await createRecipe(
    "Runed Khaz'gorite Rod",
    runedKhazgoriteRod,
    1,
    enchanting,
    [
      [artisansMettle, 300],
      [vibrantShard, 5],
      [resonantCrystal, 1],
      [khazgoriteOre, 4],
      [runedWrithebark, 2],
    ],
    null,
    "Rods and Wands",
    1,
    350,
    null,
    { RodsAndWands: 10 },
    null,
    "Enchanter's Lectern",
    null,
    [
      ["Missive - Crafting", {}],
      ["Illustrious Insight", { RodsAndWands: 45 }],
    ]
  );
  const runedDraconiumRodRecipe = await createRecipe(
    "Runed Draconium Rod",
    runedDraconiumRod,
    1,
    enchanting,
    [
      [chromaticDust, 4],
      [draconiumOre, 3],
      [writhebark, 2],
    ],
    10,
    "Rods and Wands",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Crafting", {}],
      ["Lesser Illustrious Insight", { RodsAndWands: 45 }],
    ]
  );
  const enchantedWrithebarkWandRecipe = await createRecipe(
    "Enchanted Writhebark Wand",
    enchantedWrithebarkWand,
    1,
    enchanting,
    [
      [chromaticDust, 6],
      [writhebark, 2],
    ],
    5,
    "Rods and Wands",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { RodsAndWands: 0 }],
      ["Lesser Illustrious Insight", { RodsAndWands: 45 }],
    ]
  );
  const runedSereviteRodRecipe = await createRecipe(
    "Runed Serevite Rod",
    runedSereviteRod,
    1,
    enchanting,
    [
      [chromaticDust, 3],
      [sereviteRod, 1],
    ],
    1,
    "Rods and Wands",
    1,
    40,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [
      ["Missive - Crafting", {}],
      ["Lesser Illustrious Insight", { RodsAndWands: 45 }],
    ]
  );
  const illusionPrimalAirRecipe = await createRecipe(
    "Illusion: Primal Air",
    illusionPrimalAir,
    1,
    enchanting,
    [
      [resonantCrystal, 2],
      [awakenedAir, 20],
    ],
    null,
    "Illusory Goods",
    1,
    null,
    null,
    null,
    "World Drop",
    "Enchanter's Lectern",
    "Drops during Primal Storms."
  );
  const illusionPrimalEarthRecipe = await createRecipe(
    "Illusion: Primal Earth",
    illusionPrimalEarth,
    1,
    enchanting,
    [
      [resonantCrystal, 2],
      [awakenedEarth, 20],
    ],
    null,
    "Illusory Goods",
    1,
    null,
    null,
    null,
    "World Drop",
    "Enchanter's Lectern",
    "Drops during Primal Storms."
  );
  const illusionPrimalFireRecipe = await createRecipe(
    "Illusion: Primal Fire",
    illusionPrimalFire,
    1,
    enchanting,
    [
      [resonantCrystal, 2],
      [awakenedFire, 20],
    ],
    null,
    "Illusory Goods",
    1,
    null,
    null,
    null,
    "World Drop",
    "Enchanter's Lectern",
    "Drops during Primal Storms."
  );
  const illusionPrimalFrostRecipe = await createRecipe(
    "Illusion: Primal Frost",
    illusionPrimalFrost,
    1,
    enchanting,
    [
      [resonantCrystal, 2],
      [awakenedFrost, 20],
    ],
    null,
    "Illusory Goods",
    1,
    null,
    null,
    null,
    "World Drop",
    "Enchanter's Lectern",
    "Drops during Primal Storms."
  );
  const illusionPrimalMasteryRecipe = await createRecipe(
    "Illusion: Primal Mastery",
    illusionPrimalMastery,
    1,
    enchanting,
    [
      [resonantCrystal, 5],
      [awakenedAir, 5],
      [awakenedEarth, 5],
      [awakenedFire, 5],
      [awakenedFrost, 5],
    ],
    null,
    "Illusory Goods",
    1,
    null,
    null,
    null,
    "Raid Drop",
    "Enchanter's Lectern",
    "Drops from Kurog Grimtotem in Vault of the Incarnates."
  );
  const primalInvocationExtractRecipe = await createRecipe(
    "Primal Invocation Extract",
    primalInvocationExtract,
    1,
    enchanting,
    [
      [awakenedAir, 1],
      [awakenedEarth, 1],
      [awakenedFire, 1],
      [awakenedFrost, 1],
      [awakenedOrder, 1],
    ],
    null,
    "Illusory Goods",
    1,
    300,
    null,
    null,
    "Other",
    "Enchanter's Lectern",
    "Received from 'Primal Extraction - Glimmers of Insight'? Primal Extraction is an Enchanting sub-specialization.",
    [
      [
        "Lesser Illustrious Insight",
        { Burning: 10, Earthen: 10, Sophic: 10, Frozen: 10, Wafting: 10 },
      ],
    ]
  );
  const khadgarsDisenchantingRodRecipe = await createRecipe(
    "Khadgar's Disenchanting Rod",
    khadgarsDisenchantingRod,
    1,
    enchanting,
    [
      [chromaticDust, 12],
      [vibrantShard, 6],
      [resonantCrystal, 3],
    ],
    null,
    "Illusory Goods",
    1,
    null,
    null,
    { IllusoryGoods: 30 },
    null,
    "Enchanter's Lectern"
  );
  const illusoryAdornmentOrderRecipe = await createRecipe(
    "Illusory Adornment: Order",
    illusoryAdornmentOrder,
    1,
    enchanting,
    [
      [chromaticDust, 2],
      [rousingOrder, 2],
    ],
    null,
    "Illusory Goods",
    1,
    275,
    null,
    { IllusoryGoods: 20 },
    null,
    "Enchanter's Lectern",
    null,
    [["Lesser Illustrious Insight", { Sophic: 10 }]]
  );
  const illusoryAdornmentAirRecipe = await createRecipe(
    "Illusory Adornment: Air",
    illusoryAdornmentAir,
    1,
    enchanting,
    [
      [chromaticDust, 2],
      [rousingAir, 2],
    ],
    40,
    "Illusory Goods",
    1,
    275,
    null,
    null,
    null,
    "Enchanter's Lectern",
    null,
    [["Lesser Illustrious Insight", { Wafting: 10 }]]
  );
  const illusoryAdornmentEarthRecipe = await createRecipe(
    "Illusory Adornment: Earth",
    illusoryAdornmentEarth,
    1,
    enchanting,
    [
      [chromaticDust, 2],
      [rousingEarth, 2],
    ],
    40,
    "Illusory Goods",
    1,
    275,
    null,
    null,
    null,
    "Enchanter's Lectern",
    null,
    [["Lesser Illustrious Insight", { Earthen: 10 }]]
  );
  const illusoryAdornmentFireRecipe = await createRecipe(
    "Illusory Adornment: Fire",
    illusoryAdornmentFire,
    1,
    enchanting,
    [
      [chromaticDust, 2],
      [rousingFire, 2],
    ],
    40,
    "Illusory Goods",
    1,
    275,
    null,
    null,
    null,
    "Enchanter's Lectern",
    null,
    [["Lesser Illustrious Insight", { Burning: 10 }]]
  );
  const illusoryAdornmentFrostRecipe = await createRecipe(
    "Illusory Adornment: Frost",
    illusoryAdornmentFrost,
    1,
    enchanting,
    [
      [chromaticDust, 2],
      [rousingFrost, 2],
    ],
    40,
    "Illusory Goods",
    1,
    275,
    null,
    null,
    null,
    "Enchanter's Lectern",
    null,
    [["Lesser Illustrious Insight", { Frozen: 10 }]]
  );
  const scepterOfSpectacleOrderRecipe = await createRecipe(
    "Scepter of Spectacle: Order",
    scepterOfSpectacleOrder,
    1,
    enchanting,
    [
      [chromaticDust, 1],
      [rousingOrder, 3],
      [writhebark, 1],
    ],
    null,
    "Illusory Goods",
    1,
    null,
    null,
    { IllusoryGoods: 10 },
    null,
    "Enchanter's Lectern"
  );
  const scepterOfSpectacleAirRecipe = await createRecipe(
    "Scepter of Spectacle: Air",
    scepterOfSpectacleAir,
    1,
    enchanting,
    [
      [chromaticDust, 1],
      [rousingAir, 3],
      [writhebark, 1],
    ],
    20,
    "Illusory Goods",
    1
  );
  const scepterOfSpectacleFrostRecipe = await createRecipe(
    "Scepter of Spectacle: Frost",
    scepterOfSpectacleFrost,
    1,
    enchanting,
    [
      [chromaticDust, 1],
      [rousingFrost, 3],
      [writhebark, 1],
    ],
    20,
    "Illusory Goods",
    1
  );
  const scepterOfSpectacleEarthRecipe = await createRecipe(
    "Scepter of Spectacle: Earth",
    scepterOfSpectacleEarth,
    1,
    enchanting,
    [
      [chromaticDust, 1],
      [rousingEarth, 3],
      [writhebark, 1],
    ],
    1,
    "Illusory Goods",
    1,
    null,
    null,
    null,
    null,
    null,
    "Learned by default."
  );
  const scepterOfSpectacleFireRecipe = await createRecipe(
    "Scepter of Spectacle: Fire",
    scepterOfSpectacleFire,
    1,
    enchanting,
    [
      [chromaticDust, 1],
      [rousingFire, 3],
      [writhebark, 1],
    ],
    1,
    "Illusory Goods",
    1,
    null,
    null,
    null,
    null,
    null,
    "Learned by default."
  );
  const crystallineShatterResonantCrystal = await createRecipe(
    "Crystalline Shatter (Resonant Crystal to Vibrant Shard)",
    vibrantShard,
    3,
    enchanting,
    [[resonantCrystal, 1]],
    null,
    "Shatters",
    0,
    null,
    null,
    { DraconicDisenchantment: 10 }
  );
  const crystallineShatterVibrantShard = await createRecipe(
    "Crystalline Shatter (Vibrant Shard to Chromatic Dust)",
    chromaticDust,
    3,
    enchanting,
    [[vibrantShard, 1]],
    null,
    "Shatters",
    0,
    null,
    null,
    { DraconicDisenchantment: 10 }
  );
  const elementalShatterFrostRecipe = await createRecipe(
    null,
    elementalShatterFrost,
    1,
    enchanting,
    [[awakenedFrost, 1]],
    null,
    "Shatters",
    0,
    null,
    null,
    { PrimalExtraction: 10 },
    null,
    null,
    "Shatter an Awakened element to gain its power (an amount of secondary stat, or primary w/ Order) for 10-20 min. Can only be performed in the Dragon Isles"
  );

  const elementalShatterAirRecipe = await createRecipe(
    null,
    elementalShatterAir,
    1,
    enchanting,
    [[awakenedAir, 1]],
    null,
    "Shatters",
    0,
    null,
    null,
    { PrimalExtraction: 10 },
    null,
    null,
    "Shatter an Awakened element to gain its power (an amount of secondary stat, or primary w/ Order) for 10-20 min. Can only be performed in the Dragon Isles"
  );

  const elementalShatterOrderRecipe = await createRecipe(
    null,
    elementalShatterOrder,
    1,
    enchanting,
    [[awakenedOrder, 1]],
    null,
    "Shatters",
    0,
    null,
    null,
    { PrimalExtraction: 10 },
    null,
    null,
    "Shatter an Awakened element to gain its power (an amount of secondary stat, or primary w/ Order) for 10-20 min. Can only be performed in the Dragon Isles"
  );
  const elementalShatterFireRecipe = await createRecipe(
    null,
    elementalShatterFire,
    1,
    enchanting,
    [[awakenedFire, 1]],
    null,
    "Shatters",
    0,
    null,
    null,
    { PrimalExtraction: 10 },
    null,
    null,
    "Shatter an Awakened element to gain its power (an amount of secondary stat, or primary w/ Order) for 10-20 min. Can only be performed in the Dragon Isles"
  );
  const elementalShatterEarthRecipe = await createRecipe(
    null,
    elementalShatterEarth,
    1,
    enchanting,
    [[awakenedEarth, 1]],
    null,
    "Shatters",
    0,
    null,
    null,
    { PrimalExtraction: 10 },
    null,
    null,
    "Shatter an Awakened element to gain its power (an amount of secondary stat, or primary w/ Order) for 10-20 min. Can only be performed in the Dragon Isles"
  );
  const sophicAmalgamationRecipe = await createRecipe(
    "Sophic Amalgamation",
    sophicAmalgamation,
    1,
    enchanting,
    [
      [resonantCrystal, 3],
      [awakenedOrder, 3],
    ],
    null,
    "Magical Merchandise",
    1,
    null,
    null,
    { PrimalExtraction: 20 },
    null,
    "Enchanter's Lectern"
  );

  //engineering recipes - 91 total
  const arclightCapacitorRecipe = await createRecipe(
    "Arclight Capacitor",
    arclightCapacitor,
    1,
    engineering,
    [
      [awakenedOrder, 1],
      [shockSpringCoil, 2],
      [greasedUpGears, 1],
      [khazgoriteOre, 2],
    ],
    20,
    "Parts",
    2,
    350,
    null,
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { PiecesParts: 15 }],
      ["Spare Parts", { PiecesParts: 0 }],
    ]
  );
  const reinforcedMachineChassisRecipe = await createRecipe(
    "Reinforced Machine Chassis",
    reinforcedMachineChassis,
    1,
    engineering,
    [
      [awakenedEarth, 1],
      [handfulOfSereviteBolts, 4],
      [shockSpringCoil, 1],
      [greasedUpGears, 2],
    ],
    20,
    "Parts",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { PiecesParts: 15 }],
      ["Spare Parts", { PiecesParts: 0 }],
    ]
  );
  const assortedSafetyFusesRecipe = await createRecipe(
    "Assorted Safety Fuses",
    assortedSafetyFuses,
    "2-3",
    engineering,
    [
      [wildercloth, 3],
      [handfulOfSereviteBolts, 3],
      [shockSpringCoil, 1],
      [greasedUpGears, 1],
    ],
    null,
    "Parts",
    1,
    250,
    null,
    { EZThro: 0 },
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { PiecesParts: 15 }],
      ["Spare Parts", { PiecesParts: 0 }],
    ]
  );
  const everburningBlastingPowderRecipe = await createRecipe(
    "Everburning Blasting Powder",
    everburningBlastingPowder,
    "1-2",
    engineering,
    [
      [rousingFire, 2],
      [rousingEarth, 1],
      [draconiumOre, 1],
    ],
    15,
    "Parts",
    1,
    200,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { PiecesParts: 15 }],
      ["Spare Parts", { PiecesParts: 0 }],
    ]
  );
  const greasedUpGearsRecipe = await createRecipe(
    "Greased-Up Gears",
    greasedUpGears,
    "1-2",
    engineering,
    [
      [rousingFire, 3],
      [handfulOfSereviteBolts, 2],
      [draconiumOre, 4],
    ],
    10,
    "Parts",
    1,
    250,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { PiecesParts: 15 }],
      ["Spare Parts", { PiecesParts: 0 }],
    ]
  );
  const shockSpringCoilRecipe = await createRecipe(
    "Shock-Spring Coil",
    shockSpringCoil,
    "1-2",
    engineering,
    [
      [rousingEarth, 2],
      [handfulOfSereviteBolts, 6],
    ],
    5,
    "Parts",
    1,
    150,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { PiecesParts: 15 }],
      ["Spare Parts", { PiecesParts: 0 }],
    ]
  );
  const handfulOfSereviteBoltsRecipe = await createRecipe(
    "Handful of Serevite Bolts",
    handfulOfSereviteBolts,
    "2-3",
    engineering,
    [[sereviteOre, 4]],
    1,
    "Parts",
    1,
    50,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [
      ["Lesser Illustrious Insight", { PiecesParts: 15 }],
      ["Spare Parts", { PiecesParts: 0 }],
    ]
  );
  // const rummageThroughScrap = await(createRecipe("Rummage Through Scrap", null, 1, engineering, [[pieceOfScrap, 5]], null, "Parts", 0, null, null, {Scrapper: 0}, null, null, "Need more info"));
  const overchargedOverclockerRecipe = await createRecipe(
    "Overcharged Overclocker",
    overchargedOverclocker,
    2,
    engineering,
    [
      [rousingFire, 5],
      [handfulOfSereviteBolts, 2],
      [shockSpringCoil, 3],
    ],
    40,
    "Finishing Reagents",
    1,
    425,
    null,
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const illustriousInsightRecipeEngineering = await createRecipe(
    "Illustrious Insight",
    illustriousInsight,
    1,
    engineering,
    [[artisansMettle, 50]],
    null,
    "Finishing Reagents",
    1,
    null,
    null,
    null,
    "Various Specializations",
    "Tinker's Workbench"
  );
  const haphazardlyTetheredWiresRecipe = await createRecipe(
    "Haphazardly Tethered Wires",
    haphazardlyTetheredWires,
    2,
    engineering,
    [
      [rousingEarth, 4],
      [handfulOfSereviteBolts, 3],
    ],
    25,
    "Finishing Reagents",
    1,
    250,
    null,
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const calibratedSafetySwitchRecipe = await createRecipe(
    "Calibrated Safety Switch",
    calibratedSafetySwitch,
    1,
    engineering,
    [
      [arclightCapacitor, 1],
      [shockSpringCoil, 2],
      [greasedUpGears, 1],
      [reinforcedMachineChassis, 1],
    ],
    null,
    "Optional Reagents",
    1,
    425,
    null,
    { GearsForGear: 20 },
    "Tinker Malfunction",
    "Tinker's Workbench",
    "Chance to get from a tinker malfunction while having Gears For Gear 20.",
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const criticalFailurePreventionUnitRecipe = await createRecipe(
    "Critical Failure Prevention Unit",
    criticalFailurePreventionUnit,
    1,
    engineering,
    [
      [arclightCapacitor, 1],
      [primalDeconstructionCharge, 2],
      [shockSpringCoil, 3],
      [reinforcedMachineChassis, 1],
    ],
    null,
    "Optional Reagents",
    1,
    425,
    null,
    { GearsForGear: 20 },
    "Tinker Malfunction",
    "Tinker's Workbench",
    "Chance to get from a tinker malfunction while having Gears For Gear 20.",
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const magazineOfHealingDartsRecipe = await createRecipe(
    "Magazine of Healing Darts",
    magazineOfHealingDarts,
    1,
    engineering,
    [
      [arclightCapacitor, 1],
      [refreshingHealingPotion, 10],
      [everburningBlastingPowder, 3],
      [reinforcedMachineChassis, 1],
    ],
    null,
    "Optional Reagents",
    1,
    425,
    null,
    { GearsForGear: 10 },
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const springLoadedCapacitorCasingRecipe = await createRecipe(
    "Spring-Loaded Capacitor Casing",
    springLoadedCapacitorCasing,
    1,
    engineering,
    [
      [arclightCapacitor, 1],
      [shockSpringCoil, 2],
      [handfulOfSereviteBolts, 10],
      [reinforcedMachineChassis, 1],
    ],
    null,
    "Optional Reagents",
    1,
    425,
    null,
    { GearsForGear: 20 },
    "Tinker Malfunction",
    "Tinker's Workbench",
    "Chance to get from a tinker malfunction while having Gears For Gear 20.",
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const tinkerAlarmOTurretRecipe = await createRecipe(
    null,
    tinkerAlarmOTurret,
    1,
    engineering,
    [
      [awakenedIre, 2],
      [reinforcedMachineChassis, 1],
      [arclightCapacitor, 1],
      [greasedUpGears, 3],
      [shockSpringCoil, 3],
    ],
    null,
    "Tinkers",
    1,
    425,
    null,
    null,
    "PvP Victory",
    "Tinker's Workbench",
    "Received from Arena, BGs, or WM?",
    [
      ["Lesser Illustrious Insight", { MechanicalMind: 30 }],
      ["Spare Parts", { MechanicalMind: 15 }],
    ]
  );
  const tinkerArclightVitalCorrectorsRecipe = await createRecipe(
    null,
    tinkerArclightVitalCorrectors,
    1,
    engineering,
    [
      [awakenedOrder, 2],
      [reinforcedMachineChassis, 1],
      [arclightCapacitor, 2],
      [greasedUpGears, 4],
      [shockSpringCoil, 3],
    ],
    null,
    "Tinkers",
    1,
    425,
    null,
    { Inventions: 20 },
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { MechanicalMind: 30 }],
      ["Spare Parts", { MechanicalMind: 15 }],
    ]
  );
  const tinkerPolarityAmplifierRecipe = await createRecipe(
    null,
    tinkerPolarityAmplifier,
    1,
    engineering,
    [
      [awakenedIre, 1],
      [reinforcedMachineChassis, 1],
      [greasedUpGears, 3],
      [arclightCapacitor, 1],
      [handfulOfSereviteBolts, 8],
    ],
    null,
    "Tinkers",
    1,
    425,
    null,
    null,
    "PvP Victory",
    "Tinker's Workbench",
    "Received from Arena, BGs, or WM?",
    [
      ["Lesser Illustrious Insight", { MechanicalMind: 30 }],
      ["Spare Parts", { MechanicalMind: 15 }],
    ]
  );
  const tinkerSupercollideOTronRecipe = await createRecipe(
    null,
    tinkerSupercollideOTron,
    1,
    engineering,
    [
      [awakenedFire, 5],
      [awakenedOrder, 3],
      [shockSpringCoil, 3],
      [greasedUpGears, 10],
      [reinforcedMachineChassis, 1],
      [arclightCapacitor, 3],
    ],
    null,
    "Tinkers",
    1,
    425,
    null,
    { Inventions: 40 },
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { MechanicalMind: 30 }],
      ["Spare Parts", { MechanicalMind: 15 }],
    ]
  );
  const tinkerGroundedCircuitryRecipe = await createRecipe(
    null,
    tinkerGroundedCircuitry,
    1,
    engineering,
    [
      [reinforcedMachineChassis, 1],
      [handfulOfSereviteBolts, 4],
      [arclightCapacitor, 2],
      [greasedUpGears, 2],
    ],
    null,
    "Tinkers",
    1,
    425,
    { ValdrakkenAccord: 11 },
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { MechanicalMind: 30 }],
      ["Spare Parts", { MechanicalMind: 15 }],
    ]
  );
  const tinkerBreathOfNeltharionRecipe = await createRecipe(
    null,
    tinkerBreathOfNeltharion,
    1,
    engineering,
    [
      [awakenedFire, 3],
      [reinforcedMachineChassis, 1],
      [everburningBlastingPowder, 8],
      [handfulOfSereviteBolts, 5],
      [greasedUpGears, 4],
    ],
    null,
    "Tinkers",
    1,
    425,
    null,
    null,
    "Dungeon Drop",
    "Tinker's Workbench",
    "Drops from 'Crumpled Schematic' in Neltharus.",
    [
      ["Lesser Illustrious Insight", { MechanicalMind: 30 }],
      ["Spare Parts", { MechanicalMind: 15 }],
    ]
  );
  const tinkerPlaneDisplacerRecipe = await createRecipe(
    null,
    tinkerPlaneDisplacer,
    1,
    engineering,
    [
      [shockSpringCoil, 1],
      [reinforcedMachineChassis, 1],
      [potionOfTheHushedZephyr, 1],
    ],
    25,
    "Tinkers",
    1,
    425,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { MechanicalMind: 30 }],
      ["Spare Parts", { MechanicalMind: 15 }],
    ]
  );
  const battleReadyBinocularsRecipe = await createRecipe(
    null,
    battleReadyBinoculars,
    1,
    engineering,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [awakenedOrder, 2],
      [framelessLens, 2],
      [obsidianSearedAlloy, 2],
      [arclightCapacitor, 2],
      [reinforcedMachineChassis, 1],
    ],
    50,
    "Goggles",
    1,
    320,
    null,
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Primal Infusion", { Gear: 10 }],
      ["Cogwheel", {}],
      ["Safety Components", { GearsForGear: 20 }],
      ["Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const lightweightOcularLensesRecipe = await createRecipe(
    null,
    lightweightOcularLenses,
    1,
    engineering,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [awakenedOrder, 2],
      [framelessLens, 2],
      [vibrantWilderclothBolt, 2],
      [arclightCapacitor, 2],
      [reinforcedMachineChassis, 1],
    ],
    50,
    "Goggles",
    1,
    320,
    null,
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Primal Infusion", { Gear: 10 }],
      ["Cogwheel", {}],
      ["Safety Components", { GearsForGear: 20 }],
      ["Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const oscillatingWildernessOpticalsRecipe = await createRecipe(
    null,
    oscillatingWildernessOpticals,
    1,
    engineering,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [awakenedOrder, 2],
      [framelessLens, 2],
      [frostbiteScales, 4],
      [arclightCapacitor, 2],
      [reinforcedMachineChassis, 1],
    ],
    50,
    "Goggles",
    1,
    320,
    null,
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Primal Infusion", { Gear: 10 }],
      ["Cogwheel", {}],
      ["Safety Components", { GearsForGear: 20 }],
      ["Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const peripheralVisionProjectorsRecipe = await createRecipe(
    null,
    peripheralVisionProjectors,
    1,
    engineering,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [awakenedOrder, 2],
      [framelessLens, 2],
      [stonecrustHide, 4],
      [arclightCapacitor, 2],
      [reinforcedMachineChassis, 1],
    ],
    50,
    "Goggles",
    1,
    320,
    null,
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Primal Infusion", { Gear: 10 }],
      ["Cogwheel", {}],
      ["Safety Components", { GearsForGear: 20 }],
      ["Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const deadlineDeadeyesRecipe = await createRecipe(
    null,
    deadlineDeadeyes,
    1,
    engineering,
    [
      [smudgedLens, 2],
      [shockSpringCoil, 2],
      [handfulOfSereviteBolts, 2],
      [greasedUpGears, 1],
    ],
    15,
    "Goggles",
    2,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Lesser Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const milestoneMagnifiersRecipe = await createRecipe(
    null,
    milestoneMagnifiers,
    1,
    engineering,
    [
      [smudgedLens, 2],
      [shockSpringCoil, 2],
      [handfulOfSereviteBolts, 2],
      [greasedUpGears, 1],
    ],
    15,
    "Goggles",
    2,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Lesser Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const qualityAssuredOpticsRecipe = await createRecipe(
    null,
    qualityAssuredOptics,
    1,
    engineering,
    [
      [smudgedLens, 2],
      [shockSpringCoil, 2],
      [handfulOfSereviteBolts, 2],
      [greasedUpGears, 1],
    ],
    15,
    "Goggles",
    2,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Lesser Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const sentrysStabilizedSpecsRecipe = await createRecipe(
    null,
    sentrysStabilizedSpecs,
    1,
    engineering,
    [
      [smudgedLens, 2],
      [shockSpringCoil, 2],
      [handfulOfSereviteBolts, 2],
      [greasedUpGears, 1],
    ],
    15,
    "Goggles",
    2,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Lesser Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const complicatedCuffsRecipe = await createRecipe(
    null,
    complicatedCuffs,
    1,
    engineering,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [lustrousScaledHide, 5],
      [reinforcedMachineChassis, 1],
      [greasedUpGears, 3],
      [arclightCapacitor, 3],
    ],
    null,
    "Armor",
    1,
    320,
    null,
    { Gear: 0 },
    "Crafting Goggles/Guns/Bracers",
    "Tinker's Workbench",
    "Random chance to learn when crafting other gear pieces while having Gear 0.",
    [
      ["Primal Infusion", { Gear: 10 }],
      ["Cogwheel", { GearsForGear: 30 }],
      ["Safety Components", { GearsForGear: 20 }],
      ["Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const difficultWristProtectorsRecipe = await createRecipe(
    null,
    difficultWristProtectors,
    1,
    engineering,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [obsidianSearedAlloy, 2],
      [reinforcedMachineChassis, 1],
      [greasedUpGears, 3],
      [arclightCapacitor, 3],
    ],
    null,
    "Armor",
    1,
    320,
    null,
    { Gear: 0 },
    "Crafting Goggles/Guns/Bracers",
    "Tinker's Workbench",
    "Random chance to learn when crafting other gear pieces while having Gear 0.",
    [
      ["Primal Infusion", { Gear: 10 }],
      ["Cogwheel", { GearsForGear: 30 }],
      ["Safety Components", { GearsForGear: 20 }],
      ["Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const needlesslyComplexWristguardsRecipe = await createRecipe(
    null,
    needlesslyComplexWristguards,
    1,
    engineering,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [denseHide, 5],
      [reinforcedMachineChassis, 1],
      [greasedUpGears, 3],
      [arclightCapacitor, 3],
    ],
    null,
    "Armor",
    1,
    320,
    null,
    { Gear: 0 },
    "Crafting Goggles/Guns/Bracers",
    "Tinker's Workbench",
    "Random chance to learn when crafting other gear pieces while having Gear 0.",
    [
      ["Primal Infusion", { Gear: 10 }],
      ["Cogwheel", { GearsForGear: 30 }],
      ["Safety Components", { GearsForGear: 20 }],
      ["Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const overengineeredSleeveExtendersRecipe = await createRecipe(
    null,
    overengineeredSleeveExtenders,
    1,
    engineering,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [vibrantWilderclothBolt, 4],
      [reinforcedMachineChassis, 1],
      [greasedUpGears, 3],
      [arclightCapacitor, 3],
    ],
    null,
    "Armor",
    1,
    320,
    null,
    { Gear: 0 },
    "Crafting Goggles/Guns/Bracers",
    "Tinker's Workbench",
    "Random chance to learn when crafting other gear pieces while having Gear 0.",
    [
      ["Primal Infusion", { Gear: 10 }],
      ["Cogwheel", { GearsForGear: 30 }],
      ["Safety Components", { GearsForGear: 20 }],
      ["Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const sophisticatedProblemSolverRecipe = await createRecipe(
    null,
    sophisticatedProblemSolver,
    1,
    engineering,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 160],
      [obsidianSearedAlloy, 4],
      [reinforcedMachineChassis, 1],
      [everburningBlastingPowder, 8],
      [arclightCapacitor, 2],
    ],
    null,
    "Weapons",
    1,
    320,
    null,
    null,
    "Raid Drop",
    "Tinker's Workbench",
    "Dropped from bosses in Vault of the Incarnates.",
    [
      ["Primal Infusion", { Gear: 10 }],
      ["Missive - Combat", { Gear: 20 }],
      ["Embellishment", { Gear: 35 }],
      ["Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const pewTwoRecipe = await createRecipe(
    null,
    pewTwo,
    1,
    engineering,
    [
      [rousingFire, 1],
      [handfulOfSereviteBolts, 5],
      [everburningBlastingPowder, 5],
      [sereviteOre, 5],
    ],
    45,
    "Weapons",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Gear: 20 }],
      ["Lesser Illustrious Insight", { Gear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const meticulouslyTunedGearRecipe = await createRecipe(
    null,
    meticulouslyTunedGear,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 4],
      [greasedUpGears, 1],
      [sunderedOnyx, 1],
    ],
    null,
    "Cogwheels",
    1,
    425,
    null,
    { GearsForGear: 0 },
    "Crafting Greased-Up Gears",
    "Tinker's Workbench",
    "Random chance when crafting Greased-Up Gears while having Gears for Gear 0.",
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const oneSizeFitsAllGearRecipe = await createRecipe(
    null,
    oneSizeFitsAllGear,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 4],
      [greasedUpGears, 1],
      [mysticSapphire, 1],
    ],
    null,
    "Cogwheels",
    1,
    425,
    null,
    { GearsForGear: 0 },
    "Crafting Greased-Up Gears",
    "Tinker's Workbench",
    "Random chance when crafting Greased-Up Gears while having Gears for Gear 0.",
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const rapidlyTickingGearRecipe = await createRecipe(
    null,
    rapidlyTickingGear,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 4],
      [greasedUpGears, 1],
      [vibrantEmerald, 1],
    ],
    null,
    "Cogwheels",
    1,
    425,
    null,
    { GearsForGear: 0 },
    "Crafting Greased-Up Gears",
    "Tinker's Workbench",
    "Random chance when crafting Greased-Up Gears while having Gears for Gear 0.",
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const razorSharpGearRecipe = await createRecipe(
    null,
    meticulouslyTunedGear,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 4],
      [greasedUpGears, 1],
      [queensRuby, 1],
    ],
    null,
    "Cogwheels",
    1,
    425,
    null,
    { GearsForGear: 0 },
    "Crafting Greased-Up Gears",
    "Tinker's Workbench",
    "Random chance when crafting Greased-Up Gears while having Gears for Gear 0.",
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const highIntensityThermalScannerRecipe = await createRecipe(
    null,
    highIntensityThermalScanner,
    1,
    engineering,
    [
      [framelessLens, 1],
      [greasedUpGears, 3],
      [arclightCapacitor, 2],
      [reinforcedMachineChassis, 1],
    ],
    null,
    "Scopes & Ammo",
    1,
    425,
    null,
    { Utility: 20 },
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { Utility: 30 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const projectilePropulsionPinionRecipe = await createRecipe(
    null,
    projectilePropulsionPinion,
    1,
    engineering,
    [
      [framelessLens, 1],
      [greasedUpGears, 3],
      [arclightCapacitor, 2],
      [reinforcedMachineChassis, 1],
    ],
    null,
    "Scopes & Ammo",
    1,
    425,
    null,
    null,
    "World Drop",
    "Tinker's Workbench",
    "Drops from Djaradin Cache on the Waking SHores.",
    [
      ["Lesser Illustrious Insight", { Utility: 30 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const completelySafeRocketsRecipe = await createRecipe(
    null,
    completelySafeRockets,
    2,
    engineering,
    [
      [handfulOfSereviteBolts, 2],
      [everburningBlastingPowder, 4],
    ],
    null,
    "Scopes & Ammo",
    1,
    425,
    null,
    { Utility: 0 },
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { Utility: 30 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const endlessStackOfNeedlesRecipe = await createRecipe(
    null,
    endlessStackOfNeedles,
    2,
    engineering,
    [
      [handfulOfSereviteBolts, 2],
      [shockSpringCoil, 1],
      [greasedUpGears, 1],
    ],
    null,
    "Scopes & Ammo",
    1,
    425,
    null,
    { Utility: 10 },
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { Utility: 30 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const gyroscopicKaleidoscopeRecipe = await createRecipe(
    null,
    gyroscopicKaleidoscope,
    1,
    engineering,
    [
      [framelessLens, 1],
      [handfulOfSereviteBolts, 2],
      [greasedUpGears, 6],
      [arclightCapacitor, 2],
    ],
    30,
    "Scopes & Ammo",
    1,
    425,
    null,
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { Utility: 30 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const blackFireflightRecipe = await createRecipe(
    null,
    blackFireflight,
    "2-3",
    engineering,
    [
      [wildercloth, 1],
      [everburningBlastingPowder, 2],
    ],
    null,
    "Fireworks",
    1,
    null,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Tinker's Workbench"
  );
  const blueFireflightRecipe = await createRecipe(
    null,
    blueFireflight,
    "2-3",
    engineering,
    [
      [wildercloth, 1],
      [everburningBlastingPowder, 2],
    ],
    null,
    "Fireworks",
    1,
    null,
    { ArtisansConsortium: "Respected" },
    null,
    null,
    "Tinker's Workbench"
  );
  const bundleOfFireworksRecipe = await createRecipe(
    null,
    blackFireflight,
    1,
    engineering,
    [
      [rousingFire, 3],
      [everburningBlastingPowder, 2],
      [stonecrustHide, 1],
    ],
    null,
    "Fireworks",
    1,
    null,
    null,
    null,
    "World Drop",
    "Tinker's Workbench",
    "Drops from Draconic Recipe in a Bottle."
  );
  const greenFireflightRecipe = await createRecipe(
    null,
    greenFireflight,
    "2-3",
    engineering,
    [
      [everburningBlastingPowder, 2],
      [adamantScales, 1],
    ],
    null,
    "Fireworks",
    1,
    null,
    { ArtisansConsortium: "Esteemed" },
    null,
    null,
    "Tinker's Workbench"
  );
  const redFireflightRecipe = await createRecipe(
    null,
    redFireflight,
    "2-3",
    engineering,
    [
      [resilientLeather, 1],
      [everburningBlastingPowder, 2],
    ],
    null,
    "Fireworks",
    1,
    null,
    { ArtisansConsortium: "Preferred" },
    null,
    null,
    "Tinker's Workbench"
  );
  const bronzeFireflightRecipe = await createRecipe(
    null,
    blueFireflight,
    "2-3",
    engineering,
    [
      [everburningBlastingPowder, 2],
      [eternityAmber, 1],
    ],
    15,
    "Fireworks",
    1
  );
  const suspiciouslySilentCrateRecipe = await createRecipe(
    null,
    suspiciouslySilentCrate,
    1,
    engineering,
    [
      [awakenedFire, 1],
      [everburningBlastingPowder, 10],
      [shockSpringCoil, 1],
      [handfulOfSereviteBolts, 3],
      [assortedSafetyFuses, 2],
    ],
    null,
    "Explosives",
    1,
    450,
    null,
    { EZThro: 30 },
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { EZThro: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const suspiciouslyTickingCrateRecipe = await createRecipe(
    null,
    suspiciouslyTickingCrate,
    1,
    engineering,
    [
      [awakenedFire, 1],
      [everburningBlastingPowder, 10],
      [shockSpringCoil, 1],
      [handfulOfSereviteBolts, 3],
    ],
    null,
    "Explosives",
    1,
    450,
    null,
    { ShortFuse: 30 },
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { ShortFuse: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const iwinButtonMkTenRecipe = await createRecipe(
    null,
    iwinButtonMkTen,
    "1-2",
    engineering,
    [
      [handfulOfSereviteBolts, 1],
      [arclightCapacitor, 1],
      [shockSpringCoil, 1],
      [primalDeconstructionCharge, 1],
    ],
    null,
    "Explosives",
    1,
    300,
    null,
    { Explosives: 40 },
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { ShortFuse: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const ezThroCreatureCombustionCanisterRecipe = await createRecipe(
    null,
    ezThroCreatureCombustionCanister,
    "2-3",
    engineering,
    [
      [everburningBlastingPowder, 6],
      [shockSpringCoil, 1],
      [handfulOfSereviteBolts, 4],
      [assortedSafetyFuses, 1],
    ],
    null,
    "Explosives",
    1,
    250,
    null,
    { EZThro: 0 },
    "Crafting Explosives",
    "Tinker's Workbench",
    "Can be learned when crafting Creature Combustion Canister while having EZ-Thro 0.",
    [
      ["Lesser Illustrious Insight", { EZThro: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const ezThroGravitationalDisplacerRecipe = await createRecipe(
    null,
    ezThroGravitationalDisplacer,
    "2-3",
    engineering,
    [
      [rousingDecay, 1],
      [everburningBlastingPowder, 4],
      [shockSpringCoil, 1],
      [handfulOfSereviteBolts, 2],
      [potionOfGusts, 1],
      [assortedSafetyFuses, 1],
    ],
    null,
    "Explosives",
    1,
    350,
    null,
    { EZThro: 0 },
    "Crafting Explosives",
    "Tinker's Workbench",
    "Can be learned when crafting Gravitational Displacer while having EZ-Thro 0.",
    [
      ["Lesser Illustrious Insight", { EZThro: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const ezThroGreaseGrenadeRecipe = await createRecipe(
    null,
    ezThroGreaseGrenade,
    "2-3",
    engineering,
    [
      [rousingDecay, 1],
      [everburningBlastingPowder, 6],
      [handfulOfSereviteBolts, 4],
      [assortedSafetyFuses, 1],
    ],
    null,
    "Explosives",
    1,
    300,
    null,
    { EZThro: 0 },
    "Crafting Explosives",
    "Tinker's Workbench",
    "Can be learned when crafting Grease Grenade while having EZ-Thro 0.",
    [
      ["Lesser Illustrious Insight", { EZThro: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const ezThroPrimalDeconstructionChargeRecipe = await createRecipe(
    null,
    ezThroPrimalDeconstructionCharge,
    "2-3",
    engineering,
    [
      [rousingFire, 1],
      [everburningBlastingPowder, 4],
      [shockSpringCoil, 1],
      [handfulOfSereviteBolts, 4],
      [assortedSafetyFuses, 1],
    ],
    null,
    "Explosives",
    1,
    250,
    null,
    { EZThro: 0 },
    "Crafting Explosives",
    "Tinker's Workbench",
    "Can be learned when crafting Primal Deconstruction Charge while having EZ-Thro 0.",
    [
      ["Lesser Illustrious Insight", { EZThro: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const gravitationalDisplacerRecipe = await createRecipe(
    null,
    gravitationalDisplacer,
    "2-3",
    engineering,
    [
      [everburningBlastingPowder, 4],
      [shockSpringCoil, 1],
      [handfulOfSereviteBolts, 2],
      [potionOfGusts, 1],
    ],
    null,
    "Explosives",
    1,
    350,
    { DragonscaleExpedition: 9 },
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { ShortFuse: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const greaseGrenadeRecipe = await createRecipe(
    null,
    greaseGrenade,
    "2-3",
    engineering,
    [
      [rousingDecay, 1],
      [everburningBlastingPowder, 6],
      [handfulOfSereviteBolts, 4],
    ],
    null,
    "Explosives",
    1,
    300,
    null,
    null,
    "World Drop",
    "Tinker's Workbench",
    "Drops from Draconic Recipe in a Bottle.",
    [
      ["Lesser Illustrious Insight", { ShortFuse: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const stickyWarpGrenadeRecipe = await createRecipe(
    null,
    stickyWarpGrenade,
    "2-3",
    engineering,
    [
      [rousingDecay, 1],
      [everburningBlastingPowder, 3],
      [shockSpringCoil, 2],
      [handfulOfSereviteBolts, 6],
    ],
    null,
    "Explosives",
    1,
    450,
    null,
    null,
    "PvP Victory",
    "Tinker's Workbench",
    "Received from Arena, BGs, or WM?",
    [
      ["Lesser Illustrious Insight", { ShortFuse: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const primalDeconstructionChargeRecipe = await createRecipe(
    null,
    primalDeconstructionCharge,
    "2-3",
    engineering,
    [
      [awakenedFire, 1],
      [everburningBlastingPowder, 4],
      [shockSpringCoil, 1],
      [handfulOfSereviteBolts, 4],
    ],
    null,
    "Explosives",
    1,
    250,
    { DragonscaleExpedition: 9 },
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { ShortFuse: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const creatureCombustionCanisterRecipe = await createRecipe(
    null,
    creatureCombustionCanister,
    "2-3",
    engineering,
    [
      [everburningBlastingPowder, 6],
      [shockSpringCoil, 1],
      [handfulOfSereviteBolts, 4],
    ],
    25,
    "Explosives",
    1,
    250,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { ShortFuse: 15 }],
      ["Spare Parts", { Creation: 30 }],
    ]
  );
  const zapthrottleSoulInhalerRecipe = await createRecipe(
    null,
    zapthrottleSoulInhaler,
    1,
    engineering,
    [
      [everburningBlastingPowder, 3],
      [arclightCapacitor, 1],
      [reinforcedMachineChassis, 1],
      [handfulOfSereviteBolts, 6],
      [shockSpringCoil, 2],
      [greasedUpGears, 3],
    ],
    null,
    "Devices",
    1,
    null,
    null,
    { Scrapper: 20 },
    null,
    "Tinker's Workbench"
  );
  const saviorRecipe = await createRecipe(
    null,
    savior,
    2,
    engineering,
    [
      [awakenedOrder, 1],
      [handfulOfSereviteBolts, 20],
      [arclightCapacitor, 1],
      [shockSpringCoil, 3],
      [greasedUpGears, 2],
    ],
    null,
    "Devices",
    1,
    350,
    null,
    { MechanicalMind: 40 },
    null,
    "Tinker's Workbench",
    null,
    [
      ["Lesser Illustrious Insight", { MechanicalMind: 30 }],
      ["Spare Parts", { MechanicalMind: 15 }],
    ]
  );
  const cartomancyCannonRecipe = await createRecipe(
    null,
    cartomancyCannon,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 20],
      [shockSpringCoil, 6],
      [everburningBlastingPowder, 12],
      [reinforcedMachineChassis, 1],
      [arclightCapacitor, 2],
      [greasedUpGears, 4],
    ],
    null,
    "Devices",
    1,
    null,
    null,
    { Novelties: 10 },
    null,
    "Tinker's Workbench"
  );
  const centralizedPrecipitationEmitterRecipe = await createRecipe(
    null,
    centralizedPrecipitationEmitter,
    1,
    engineering,
    [
      [frostySoul, 3],
      [airySoul, 3],
      [handfulOfSereviteBolts, 20],
      [shockSpringCoil, 3],
      [reinforcedMachineChassis, 1],
      [arclightCapacitor, 4],
      [elementalHarmony, 1],
    ],
    null,
    "Devices",
    1,
    null,
    null,
    { Novelties: 5 },
    null,
    "Tinker's Workbench"
  );
  const elementInfusedRocketHelmetRecipe = await createRecipe(
    null,
    elementInfusedRocketHelmet,
    1,
    engineering,
    [
      [awakenedFire, 10],
      [awakenedAir, 5],
      [gravitationalDisplacer, 15],
      [everburningBlastingPowder, 20],
      [reinforcedMachineChassis, 1],
      [arclightCapacitor, 2],
      [handfulOfSereviteBolts, 5],
    ],
    null,
    "Devices",
    1,
    null,
    null,
    { Novelties: 15 },
    null,
    "Tinker's Workbench"
  );
  const environmentalEmulatorRecipe = await createRecipe(
    null,
    environmentalEmulator,
    1,
    engineering,
    [
      [fierySoul, 3],
      [earthenSoul, 3],
      [handfulOfSereviteBolts, 20],
      [shockSpringCoil, 3],
      [reinforcedMachineChassis, 1],
      [arclightCapacitor, 4],
      [elementalHarmony, 1],
    ],
    null,
    "Devices",
    1,
    null,
    null,
    { Novelties: 25 },
    null,
    "Tinker's Workbench"
  );
  const giggleGogglesRecipe = await createRecipe(
    null,
    giggleGoggles,
    1,
    engineering,
    [
      [framelessLens, 2],
      [shockSpringCoil, 3],
      [reinforcedMachineChassis, 1],
      [arclightCapacitor, 2],
      [handfulOfSereviteBolts, 6],
      [neltharite, 2],
    ],
    null,
    "Devices",
    1,
    null,
    null,
    { Novelties: 20 },
    null,
    "Tinker's Workbench"
  );
  const helpRecipe = await createRecipe(
    null,
    help,
    1,
    engineering,
    [
      [awakenedIre, 3],
      [markOfHonor, 15],
      [reinforcedMachineChassis, 1],
      [everburningBlastingPowder, 4],
      [handfulOfSereviteBolts, 6],
    ],
    null,
    "Devices",
    1,
    null,
    null,
    null,
    "PvP Victory",
    "Tinker's Workbench",
    "Received from Arena, BGs, or WM?"
  );
  const tinkerRemovalKitRecipe = await createRecipe(
    null,
    tinkerRemovalKit,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 3],
      [shockSpringCoil, 2],
      [draconiumOre, 2],
    ],
    40,
    "Devices",
    1,
    null,
    null,
    null,
    null,
    "Tinker's Workbench"
  );
  const wyrmholeGeneratorRecipe = await createRecipe(
    null,
    wyrmholeGenerator,
    1,
    engineering,
    [
      [awakenedOrder, 3],
      [handfulOfSereviteBolts, 2],
      [shockSpringCoil, 1],
      [greasedUpGears, 2],
      [reinforcedMachineChassis, 1],
      [arclightCapacitor, 3],
    ],
    null,
    "Devices",
    1,
    null,
    null,
    { MechanicalMind: 0 },
    null,
    "Tinker's Workbench"
  );
  const portableAlchemistsLabBenchRecipe = await createRecipe(
    null,
    portableAlchemistsLabBench,
    1,
    engineering,
    [
      [rousingAir, 1],
      [rousingFrost, 1],
      [greasedUpGears, 1],
      [handfulOfSereviteBolts, 3],
      [omniumDraconis, 3],
      [draconicVial, 5],
    ],
    null,
    "Devices",
    1,
    null,
    { ArtisansConsortium: "Respected" },
    null,
    null,
    "Tinker's Workbench"
  );
  const portableTinkersWorkbenchRecipe = await createRecipe(
    null,
    portableTinkersWorkbench,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 2],
      [framelessLens, 1],
      [greasedUpGears, 1],
      [shockSpringCoil, 1],
    ],
    null,
    "Devices",
    1,
    null,
    { ArtisansConsortium: "Respected" },
    null,
    null,
    "Tinker's Workbench"
  );
  const neuralSilencerMkThreeRecipe = await createRecipe(
    null,
    neuralSilencerMkThree,
    "2-3",
    engineering,
    [
      [wildercloth, 1],
      [handfulOfSereviteBolts, 4],
      [shockSpringCoil, 2],
      [greasedUpGears, 1],
    ],
    15,
    "Devices",
    1
  );
  const khazgoriteBrainwaveAmplifierRecipe = await createRecipe(
    null,
    khazgoriteBrainwaveAmplifier,
    1,
    engineering,
    [
      [artisansMettle, 225],
      [framelessLens, 2],
      [khazgoriteOre, 10],
      [shockSpringCoil, 2],
      [greasedUpGears, 3],
      [arclightCapacitor, 4],
    ],
    null,
    "Profession Equipment",
    1,
    425,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const khazgoriteDelversHelmetRecipe = await createRecipe(
    null,
    khazgoriteDelversHelmet,
    1,
    engineering,
    [
      [artisansMettle, 225],
      [framelessLens, 1],
      [obsidianSearedAlloy, 4],
      [arclightCapacitor, 2],
    ],
    null,
    "Profession Equipment",
    1,
    425,
    { ValdrakkenAccord: 19 },
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const khazgoriteEncasedSamophlangeRecipe = await createRecipe(
    null,
    khazgoriteEncasedSamophlange,
    1,
    engineering,
    [
      [artisansMettle, 300],
      [khazgoriteOre, 10],
      [shockSpringCoil, 2],
      [greasedUpGears, 3],
      [arclightCapacitor, 5],
    ],
    null,
    "Profession Equipment",
    1,
    400,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Missive - Crafting", {}],
      ["Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const khazgoriteFisherfriendRecipe = await createRecipe(
    null,
    khazgoriteFisherfriend,
    1,
    engineering,
    [
      [khazgoriteOre, 10],
      [greasedUpGears, 4],
      [arclightCapacitor, 2],
      [reinforcedMachineChassis, 1],
    ],
    null,
    "Profession Equipment",
    1,
    425,
    null,
    null,
    "World Drop",
    "Tinker's Workbench",
    "Drops from the 'Immaculate Sac of Swog Treasures' from 'The Great Swog'???",
    [
      ["Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const lapidarysKhazgoriteClampsRecipe = await createRecipe(
    null,
    lapidarysKhazgoriteClamps,
    1,
    engineering,
    [
      [artisansMettle, 300],
      [khazgoriteOre, 10],
      [shockSpringCoil, 2],
      [greasedUpGears, 5],
    ],
    null,
    "Profession Equipment",
    1,
    400,
    { ValdrakkenAccord: 19 },
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Missive - Crafting", {}],
      ["Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const springLoadedKhazgoriteFabricCuttersRecipe = await createRecipe(
    null,
    springLoadedKhazgoriteFabricCutters,
    1,
    engineering,
    [
      [artisansMettle, 300],
      [obsidianSearedAlloy, 4],
      [arclightCapacitor, 2],
      [shockSpringCoil, 2],
    ],
    null,
    "Profession Equipment",
    1,
    400,
    { DragonscaleExpedition: 15 },
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Missive - Crafting", {}],
      ["Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const bottomlessMireslushOreSatchelRecipe = await createRecipe(
    null,
    bottomlessMireslushOreSatchel,
    1,
    engineering,
    [
      [artisansMettle, 225],
      [mireslushHide, 6],
      [frostfireAlloy, 5],
    ],
    null,
    "Profession Equipment",
    1,
    425,
    { DragonscaleExpedition: 15 },
    null,
    null,
    "Tinker's Workbench",
    null,
    [
      ["Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const bottomlessStonecrustOreSatchelRecipe = await createRecipe(
    null,
    bottomlessStonecrustOreSatchel,
    1,
    engineering,
    [
      [stonecrustHide, 1],
      [handfulOfSereviteBolts, 2],
    ],
    20,
    "Profession Equipment",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const draconiumBrainwaveAmplifierRecipe = await createRecipe(
    null,
    draconiumBrainwaveAmplifier,
    1,
    engineering,
    [
      [framelessLens, 1],
      [handfulOfSereviteBolts, 2],
      [shockSpringCoil, 2],
      [draconiumOre, 2],
    ],
    25,
    "Profession Equipment",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const draconiumDelversHelmetRecipe = await createRecipe(
    null,
    draconiumDelversHelmet,
    1,
    engineering,
    [
      [smudgedLens, 1],
      [handfulOfSereviteBolts, 2],
      [draconiumOre, 2],
    ],
    20,
    "Profession Equipment",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const draconiumEncasedSamophlangeRecipe = await createRecipe(
    null,
    draconiumEncasedSamophlange,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 2],
      [shockSpringCoil, 2],
      [greasedUpGears, 1],
      [draconiumOre, 2],
    ],
    20,
    "Profession Equipment",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Crafting", {}],
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const draconiumFisherfriendRecipe = await createRecipe(
    null,
    draconiumFisherfriend,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 2],
      [greasedUpGears, 1],
      [shockSpringCoil, 2],
      [draconiumOre, 3],
    ],
    35,
    "Profession Equipment",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const lapidarysDraconiumClampsRecipe = await createRecipe(
    null,
    lapidarysDraconiumClamps,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 2],
      [greasedUpGears, 1],
      [draconiumOre, 3],
    ],
    20,
    "Profession Equipment",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Crafting", {}],
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const springLoadedDraconiumFabricCuttersRecipe = await createRecipe(
    null,
    springLoadedDraconiumFabricCutters,
    1,
    engineering,
    [
      [handfulOfSereviteBolts, 3],
      [shockSpringCoil, 3],
      [draconiumOre, 4],
    ],
    25,
    "Profession Equipment",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Crafting", {}],
      ["Lesser Illustrious Insight", { GearsForGear: 15 }],
      ["Spare Parts", { FunctionOverForm: 10 }],
    ]
  );
  const quackERecipe = await createRecipe(
    null,
    quackE,
    1,
    engineering,
    [
      [contouredFowlfeather, 60],
      [quackEQuackModulator, 1],
      [reinforcedMachineChassis, 1],
      [malygite, 2],
      [greasedUpGears, 2],
      [shockSpringCoil, 1],
      [handfulOfSereviteBolts, 4],
    ],
    null,
    "Robotics",
    1,
    null,
    { DragonscaleExpedition: 21 },
    null,
    null,
    "Tinker's Workbench"
  );
  const duckoyRecipe = await createRecipe(
    null,
    duckoy,
    1,
    engineering,
    [
      [contouredFowlfeather, 6],
      [resilientLeather, 1],
      [handfulOfSereviteBolts, 1],
      [everburningBlastingPowder, 2],
    ],
    null,
    "Robotics",
    1,
    350,
    null,
    null,
    "World Drop",
    "Tinker's Workbench",
    "Drops from Draconic Message in a Bottle.",
    [
      ["Lesser Illustrious Insight", { MechanicalMind: 30 }],
      ["Spare Parts", { MechanicalMind: 15 }],
    ]
  );

  // //inscription recipes - 100 total
  // const dragonIslesMilling = await(createRecipe("Dragon Isles Milling", shimmeringPigment, 5, inscription, [[hochenblume, 5]], 1, "Inscription Essentials", 1, 250));
  const cosmicInkRecipe = await createRecipe(
    null,
    cosmicInk,
    2,
    inscription,
    [
      [iridescentWater, 1],
      [awakenedFrost, 1],
      [sereneInk, 1],
      [burnishedInk, 2],
      [runedWrithebark, 1],
    ],
    35,
    "Inks",
    2,
    300,
    null,
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, FlawlessInks: 20 }],
      ["Blotting Sand", { FlawlessInks: 0 }],
    ]
  );
  const burnishedInkRecipe = await createRecipe(
    null,
    burnishedInk,
    2,
    inscription,
    [
      [iridescentWater, 1],
      [blazingInk, 2],
      [flourishingInk, 2],
      [sereneInk, 2],
    ],
    20,
    "Inks",
    2,
    260,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, FlawlessInks: 20 }],
      ["Blotting Sand", { FlawlessInks: 0 }],
    ]
  );
  const blazingInkRecipe = await createRecipe(
    null,
    blazingInk,
    2,
    inscription,
    [
      [iridescentWater, 1],
      [shimmeringPigment, 2],
      [blazingPigment, 1],
      [draconicVial, 1],
    ],
    1,
    "Inks",
    1,
    80,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, FlawlessInks: 20 }],
      ["Blotting Sand", { FlawlessInks: 0 }],
    ]
  );
  const flourishingInkRecipe = await createRecipe(
    null,
    flourishingInk,
    2,
    inscription,
    [
      [iridescentWater, 1],
      [shimmeringPigment, 2],
      [flourishingPigment, 1],
      [draconicVial, 1],
    ],
    1,
    "Inks",
    1,
    80,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, FlawlessInks: 20 }],
      ["Blotting Sand", { FlawlessInks: 0 }],
    ]
  );
  const sereneInkRecipe = await createRecipe(
    null,
    sereneInk,
    2,
    inscription,
    [
      [iridescentWater, 1],
      [shimmeringPigment, 2],
      [serenePigment, 1],
      [draconicVial, 1],
    ],
    1,
    "Inks",
    1,
    80,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, FlawlessInks: 20 }],
      ["Blotting Sand", { FlawlessInks: 0 }],
    ]
  );
  const illustriousInsightRecipeInscription = await createRecipe(
    "Illustrious Insight",
    illustriousInsight,
    1,
    inscription,
    [[artisansMettle, 50]],
    null,
    "Reagents",
    1,
    null,
    null,
    null,
    "Various Specializations",
    "Scribe's Drafting Table"
  );
  const runedWrithebarkRecipe = await createRecipe(
    null,
    runedWrithebark,
    1,
    inscription,
    [
      [rousingAir, 5],
      [writhebark, 5],
      [flourishingInk, 1],
      [chilledRune, 1],
    ],
    15,
    "Reagents",
    1,
    260,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { RuneMastery: 40 }]]
  );
  const chilledRuneRecipe = await createRecipe(
    null,
    chilledRune,
    1,
    inscription,
    [
      [rousingFrost, 5],
      [sereneInk, 1],
    ],
    1,
    "Reagents",
    1,
    260,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [["Lesser Illustrious Insight", { RuneMastery: 40 }]]
  );
  const draconicMissiveOfTheAuroraRecipe = await createRecipe(
    null,
    draconicMissiveOfTheAurora,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [sereneInk, 1],
    ],
    45,
    "Missives",
    1,
    275,
    null,
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfTheFeverflareRecipe = await createRecipe(
    null,
    draconicMissiveOfTheFeverflare,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [blazingInk, 1],
    ],
    45,
    "Missives",
    1,
    275,
    null,
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfTheFireflashRecipe = await createRecipe(
    null,
    draconicMissiveOfTheFireflash,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [blazingInk, 1],
    ],
    45,
    "Missives",
    1,
    275,
    null,
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfTheHarmoniousRecipe = await createRecipe(
    null,
    draconicMissiveOfTheHarmonious,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [sereneInk, 1],
    ],
    45,
    "Missives",
    1,
    275,
    null,
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfThePeerlessRecipe = await createRecipe(
    null,
    draconicMissiveOfThePeerless,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [flourishingInk, 1],
    ],
    45,
    "Missives",
    1,
    275,
    null,
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfTheQuickbladeRecipe = await createRecipe(
    null,
    draconicMissiveOfTheQuickblade,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [flourishingInk, 1],
    ],
    45,
    "Missives",
    1,
    275,
    null,
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfCraftingSpeedRecipe = await createRecipe(
    null,
    draconicMissiveOfCraftingSpeed,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [flourishingInk, 1],
    ],
    null,
    "Crafting Tool Missives",
    1,
    275,
    { ArtisansConsortium: "Preferred" },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfInspirationRecipe = await createRecipe(
    null,
    draconicMissiveOfInspiration,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [blazingInk, 1],
    ],
    null,
    "Crafting Tool Missives",
    1,
    275,
    { ArtisansConsortium: "Preferred" },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfMulticraftRecipe = await createRecipe(
    null,
    draconicMissiveOfMulticraft,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [flourishingInk, 1],
    ],
    null,
    "Crafting Tool Missives",
    1,
    275,
    { ArtisansConsortium: "Preferred" },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfResourcefulnessRecipe = await createRecipe(
    null,
    draconicMissiveOfResourcefulness,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [blazingInk, 1],
    ],
    null,
    "Crafting Tool Missives",
    1,
    275,
    { ArtisansConsortium: "Preferred" },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfDeftnessRecipe = await createRecipe(
    null,
    draconicMissiveOfDeftness,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [sereneInk, 1],
    ],
    null,
    "Gathering Tool Missives",
    1,
    275,
    { ArtisansConsortium: "Preferred" },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfFinesseRecipe = await createRecipe(
    null,
    draconicMissiveOfFinesse,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [flourishingInk, 1],
    ],
    null,
    "Gathering Tool Missives",
    1,
    275,
    { ArtisansConsortium: "Preferred" },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicMissiveOfPerceptionRecipe = await createRecipe(
    null,
    draconicMissiveOfPerception,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [chilledRune, 1],
      [sereneInk, 1],
    ],
    null,
    "Gathering Tool Missives",
    1,
    275,
    { ArtisansConsortium: "Preferred" },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const darkmoonDeckBoxDanceRecipe = await createRecipe(
    null,
    darkmoonDeckBoxDance,
    1,
    inscription,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 60],
      [darkmoonDeckDance, 1],
      [awakenedAir, 10],
      [writhebark, 10],
      [cosmicInk, 12],
    ],
    null,
    "Trinkets",
    3,
    360,
    null,
    { Air: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Primal Infusion", { Archiving: 0 }],
      ["Darkmoon Sigil", { Air: 10 }],
      ["Illustrious Insight", { RuneMastery: 40, Air: 30 }],
      ["Blotting Sand", { Archiving: 30, DarkmoonMysteries: 35 }],
    ]
  );
  const darkmoonDeckBoxInfernoRecipe = await createRecipe(
    null,
    darkmoonDeckBoxInferno,
    1,
    inscription,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 60],
      [darkmoonDeckInferno, 1],
      [awakenedFire, 10],
      [writhebark, 10],
      [cosmicInk, 12],
    ],
    null,
    "Trinkets",
    3,
    360,
    null,
    { Fire: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Primal Infusion", { Archiving: 0 }],
      ["Darkmoon Sigil", { Fire: 10 }],
      ["Illustrious Insight", { RuneMastery: 40, Fire: 30 }],
      ["Blotting Sand", { Archiving: 30, DarkmoonMysteries: 35 }],
    ]
  );
  const darkmoonDeckBoxRimeRecipe = await createRecipe(
    null,
    darkmoonDeckBoxRime,
    1,
    inscription,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 60],
      [darkmoonDeckRime, 1],
      [awakenedFrost, 10],
      [writhebark, 10],
      [cosmicInk, 12],
    ],
    null,
    "Trinkets",
    3,
    360,
    null,
    { Frost: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Primal Infusion", { Archiving: 0 }],
      ["Darkmoon Sigil", { Frost: 10 }],
      ["Illustrious Insight", { RuneMastery: 40, Frost: 30 }],
      ["Blotting Sand", { Archiving: 30, DarkmoonMysteries: 35 }],
    ]
  );
  const darkmoonDeckBoxWatcherRecipe = await createRecipe(
    null,
    darkmoonDeckBoxWatcher,
    1,
    inscription,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 60],
      [darkmoonDeckWatcher, 1],
      [awakenedEarth, 10],
      [writhebark, 10],
      [cosmicInk, 12],
    ],
    null,
    "Trinkets",
    3,
    360,
    null,
    { Earth: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Primal Infusion", { Archiving: 0 }],
      ["Darkmoon Sigil", { Earth: 10 }],
      ["Illustrious Insight", { RuneMastery: 40, Earth: 30 }],
      ["Blotting Sand", { Archiving: 30, DarkmoonMysteries: 35 }],
    ]
  );
  const cracklingCodexOfTheIslesRecipe = await createRecipe(
    null,
    cracklingCodexOfTheIsles,
    1,
    inscription,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [awakenedAir, 10],
      [glitteringParchment, 20],
      [cosmicInk, 12],
      [runedWrithebark, 5],
      [chilledRune, 4],
    ],
    null,
    "Weapons",
    2,
    300,
    null,
    { Codexes: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Primal Infusion", { Runebinding: 0 }],
      ["Missive - Combat", { RunicScripture: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { RuneMastery: 40, Codexes: 25 }],
      ["Blotting Sand", { Ruenbinding: 30 }],
    ]
  );
  const illuminatingPillarOfTheIslesRecipe = await createRecipe(
    null,
    illuminatingPillarOfTheIsles,
    1,
    inscription,
    [
      [sparkOfIngenuity, 2],
      [primalChaos, 160],
      [cosmicInk, 6],
      [runedWrithebark, 10],
      [chilledRune, 8],
    ],
    null,
    "Weapons",
    2,
    300,
    null,
    { Staves: 5 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Primal Infusion", { Runebinding: 0 }],
      ["Missive - Combat", { Woodcarving: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { RuneMastery: 40, Staves: 25 }],
      ["Blotting Sand", { Ruenbinding: 30 }],
    ]
  );
  const kineticPillarOfTheIslesRecipe = await createRecipe(
    null,
    kineticPillarOfTheIsles,
    1,
    inscription,
    [
      [sparkOfIngenuity, 2],
      [primalChaos, 160],
      [cosmicInk, 6],
      [runedWrithebark, 10],
      [chilledRune, 8],
    ],
    null,
    "Weapons",
    2,
    300,
    null,
    { Staves: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Primal Infusion", { Runebinding: 0 }],
      ["Missive - Combat", { Woodcarving: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { RuneMastery: 40, Staves: 25 }],
      ["Blotting Sand", { Ruenbinding: 30 }],
    ]
  );
  const weatheredExplorersStaveRecipe = await createRecipe(
    null,
    weatheredExplorersStave,
    1,
    inscription,
    [
      [sparkOfIngenuity, 2],
      [primalChaos, 160],
      [awakenedDecay, 8],
      [cosmicInk, 12],
      [runedWrithebark, 8],
      [chilledRune, 5],
    ],
    null,
    "Weapons",
    2,
    350,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Dropped from creatures, probably Decayed ones?",
    [
      ["Primal Infusion", { Runebinding: 0 }],
      ["Illustrious Insight", { RuneMastery: 40, Staves: 25 }],
      ["Blotting Sand", { Ruenbinding: 30 }],
    ]
  );
  const coreExplorersCompendiumRecipe = await createRecipe(
    null,
    coreExplorersCompendium,
    1,
    inscription,
    [
      [glitteringParchment, 20],
      [rousingEarth, 5],
      [blazingInk, 1],
      [chilledRune, 1],
    ],
    15,
    "Weapons",
    2,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Combat", { RunicScripture: 0 }],
      ["Embellishment", {}],
      ["Lesser Illustrious Insight", { RuneMastery: 40, Codexes: 25 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const overseersWrithebarkStaveRecipe = await createRecipe(
    null,
    overseersWrithebarkStave,
    1,
    inscription,
    [
      [blazingInk, 1],
      [runedWrithebark, 1],
    ],
    15,
    "Weapons",
    2,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Combat", { Woodcarving: 0 }],
      ["Embellishment", {}],
      ["Lesser Illustrious Insight", { RuneMastery: 40, Staves: 25 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const pioneersWrithebarkStaveRecipe = await createRecipe(
    null,
    pioneersWrithebarkStave,
    1,
    inscription,
    [
      [sereneInk, 1],
      [runedWrithebark, 1],
    ],
    15,
    "Weapons",
    2,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Combat", { Woodcarving: 0 }],
      ["Embellishment", {}],
      ["Lesser Illustrious Insight", { RuneMastery: 40, Staves: 25 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const emberscaleSigilRecipe = await createRecipe(
    null,
    emberscaleSigil,
    1,
    inscription,
    [
      [awakenedFire, 1],
      [blazingInk, 1],
      [burnishedInk, 2],
    ],
    null,
    "Runes and Sigils",
    2,
    300,
    null,
    { EmberscaleSigil: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, ScaleSigils: 20 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const jetscaleSigilRecipe = await createRecipe(
    null,
    jetscaleSigil,
    1,
    inscription,
    [
      [awakenedIre, 1],
      [cosmicInk, 1],
    ],
    null,
    "Runes and Sigils",
    2,
    300,
    null,
    { JetscaleSigil: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, ScaleSigils: 20 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const sagescaleSigilRecipe = await createRecipe(
    null,
    sagescaleSigil,
    1,
    inscription,
    [
      [awakenedEarth, 1],
      [flourishingInk, 1],
      [burnishedInk, 2],
    ],
    null,
    "Runes and Sigils",
    2,
    300,
    null,
    { SagescaleSigil: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, ScaleSigils: 20 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const azurescaleSigilRecipe = await createRecipe(
    null,
    azurescaleSigil,
    1,
    inscription,
    [
      [awakenedFrost, 1],
      [sereneInk, 1],
      [burnishedInk, 2],
    ],
    null,
    "Runes and Sigils",
    2,
    300,
    null,
    { AzurescaleSigil: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, ScaleSigils: 20 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const bronzescaleSigilRecipe = await createRecipe(
    null,
    bronzescaleSigil,
    1,
    inscription,
    [
      [awakenedOrder, 1],
      [burnishedInk, 2],
    ],
    null,
    "Runes and Sigils",
    2,
    300,
    null,
    { BronzescaleSigil: 0 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, ScaleSigils: 20 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const vantusRuneVaultOfTheIncarnatesRecipe = await createRecipe(
    null,
    vantusRuneVaultOfTheIncarnates,
    1,
    inscription,
    [
      [burnishedInk, 2],
      [chilledRune, 1],
    ],
    50,
    "Runes and Sigils",
    1,
    360,
    null,
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, VantusRunes: 20 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const buzzingRuneRecipe = await createRecipe(
    null,
    buzzingRune,
    2,
    inscription,
    [[chilledRune, 1]],
    25,
    "Runes and Sigils",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, FaunaRunes: 20 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const chirpingRuneRecipe = await createRecipe(
    null,
    chirpingRune,
    2,
    inscription,
    [[chilledRune, 1]],
    25,
    "Runes and Sigils",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, FaunaRunes: 20 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const howlingRuneRecipe = await createRecipe(
    null,
    howlingRune,
    2,
    inscription,
    [[chilledRune, 1]],
    25,
    "Runes and Sigils",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, FaunaRunes: 20 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const alchemistsBrilliantMixingRodRecipe = await createRecipe(
    null,
    alchemistsBrilliantMixingRod,
    1,
    inscription,
    [
      [artisansMettle, 300],
      [runedWrithebark, 12],
      [draconiumOre, 30],
    ],
    null,
    "Profession Equipment",
    1,
    375,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Missive - Crafting", {}],
      ["Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const chefsSplendidRollingPinRecipe = await createRecipe(
    null,
    chefsSplendidRollingPin,
    1,
    inscription,
    [
      [runedWrithebark, 12],
      [draconiumOre, 30],
    ],
    null,
    "Profession Equipment",
    1,
    375,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const scribesResplendentQuillRecipe = await createRecipe(
    null,
    scribesResplendentQuill,
    1,
    inscription,
    [
      [artisansMettle, 300],
      [contouredFowlfeather, 1],
      [runedWrithebark, 12],
      [cosmicInk, 4],
    ],
    null,
    "Profession Equipment",
    1,
    375,
    null,
    { ProfessionTools: 10 },
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Missive - Crafting", {}],
      ["Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const alchemistsSturdyMixingRodRecipe = await createRecipe(
    null,
    alchemistsSturdyMixingRod,
    1,
    inscription,
    [
      [runedWrithebark, 1],
      [sereneInk, 1],
    ],
    25,
    "Profession Equipment",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Crafting", {}],
      ["Lesser Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const chefsSmoothRollingPinRecipe = await createRecipe(
    null,
    chefsSmoothRollingPin,
    1,
    inscription,
    [
      [runedWrithebark, 1],
      [blazingInk, 1],
    ],
    25,
    "Profession Equipment",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const scribesFastenedQuillRecipe = await createRecipe(
    null,
    scribesFastenedQuill,
    1,
    inscription,
    [
      [contouredFowlfeather, 1],
      [runedWrithebark, 1],
      [sereneInk, 1],
    ],
    25,
    "Profession Equipment",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Crafting", {}],
      ["Lesser Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
      ["Blotting Sand", { Runebinding: 30 }],
    ]
  );
  const illusionParchmentWhirlingBreezeRecipe = await createRecipe(
    null,
    illusionParchmentWhirlingBreeze,
    5,
    inscription,
    [
      [glitteringParchment, 3],
      [iridescentWater, 3],
      [awakenedAir, 1],
      [flourishingInk, 1],
    ],
    null,
    "Scrolls",
    1,
    null,
    { ValdrakkenAccord: 28 }
  );
  const illusionParchmentAquaTorrentRecipe = await createRecipe(
    null,
    illusionParchmentAquaTorrent,
    5,
    inscription,
    [
      [glitteringParchment, 3],
      [iridescentWater, 3],
      [awakenedFrost, 1],
      [sereneInk, 1],
    ],
    null,
    "Scrolls",
    1,
    null,
    null,
    null,
    "World Drop",
    null,
    "Drops from Draconic Message in a Bottle."
  );
  const illusionParchmentArcaneBurstRecipe = await createRecipe(
    null,
    illusionParchmentArcaneBurst,
    5,
    inscription,
    [
      [glitteringParchment, 3],
      [iridescentWater, 3],
      [awakenedOrder, 1],
      [burnishedInk, 1],
    ],
    null,
    "Scrolls",
    1,
    null,
    null,
    null,
    "World Drop",
    null,
    "Drops from creatures in Thaldraszus."
  );
  const illusionParchmentChillingWindRecipe = await createRecipe(
    null,
    illusionParchmentChillingWind,
    5,
    inscription,
    [
      [glitteringParchment, 3],
      [iridescentWater, 3],
      [awakenedFrost, 1],
      [sereneInk, 1],
    ],
    null,
    "Scrolls",
    1,
    null,
    null,
    null,
    "World Drop",
    null,
    "Drops from creatures in The Azure Span."
  );
  const illusionParchmentLoveCharmRecipe = await createRecipe(
    null,
    illusionParchmentLoveCharm,
    5,
    inscription,
    [
      [glitteringParchment, 3],
      [iridescentWater, 3],
      [awakenedIre, 1],
    ],
    null,
    "Scrolls",
    1,
    null,
    null,
    null,
    "Dungeon Drop",
    null,
    "Drops from 'Deliberately Delinquent Notes' in Algeth'ar Academy."
  );
  const illusionParchmentMagmaMissileRecipe = await createRecipe(
    null,
    illusionParchmentMagmaMissile,
    5,
    inscription,
    [
      [glitteringParchment, 3],
      [iridescentWater, 3],
      [awakenedFire, 1],
      [blazingInk, 1],
    ],
    null,
    "Scrolls",
    1,
    null,
    { DragonscaleExpedition: 21 }
  );
  const illusionParchmentShadowOrbRecipe = await createRecipe(
    null,
    illusionParchmentShadowOrb,
    5,
    inscription,
    [
      [glitteringParchment, 3],
      [iridescentWater, 3],
      [awakenedDecay, 1],
      [sereneInk, 1],
    ],
    null,
    "Scrolls",
    1,
    null,
    null,
    null,
    "Dungeon Drop",
    null,
    "Drops from last boss in Algeth'ar Academy."
  );
  const illusionParchmentSpellShieldRecipe = await createRecipe(
    null,
    illusionParchmentSpellShield,
    5,
    inscription,
    [
      [glitteringParchment, 3],
      [iridescentWater, 3],
      [awakenedOrder, 1],
      [burnishedInk, 1],
    ],
    15,
    "Scrolls",
    1
  );
  const scrollOfSalesRecipe = await createRecipe(
    null,
    scrollOfSales,
    2,
    inscription,
    [
      [glitteringParchment, 1],
      [pentagoldSeal, 1],
      [sereneInk, 1],
    ],
    null,
    "Scrolls",
    1,
    150,
    { ArtisansConsortium: "Esteemed" }
  );
  const bundleOCardsDragonIslesRecipe = await createRecipe(
    null,
    bundleOCardsDragonIsles,
    1,
    inscription,
    [
      [awakenedOrder, 3],
      [awakenedAir, 3],
      [awakenedEarth, 3],
      [awakenedFire, 3],
      [awakenedFrost, 3],
      [glitteringParchment, 3],
    ],
    null,
    "Mysteries",
    1,
    null,
    null,
    { DarkmoonMysteries: 0 }
  );
  const blazingFortuneRecipe = await createRecipe(
    "Blazing Fortune",
    fatedFortuneCard,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [blazingInk, 1],
    ],
    10,
    "Mysteries",
    1
  );
  const flourishingFortuneRecipe = await createRecipe(
    "Flourishing Fortune",
    fatedFortuneCard,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [flourishingInk, 1],
    ],
    10,
    "Mysteries",
    1
  );
  const sereneFortuneRecipe = await createRecipe(
    "Serene Fortune",
    fatedFortuneCard,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [sereneInk, 1],
    ],
    10,
    "Mysteries",
    1
  );
  // const extractionAwakenedAir = await(createRecipe("Extraction: Awakened Air", awakenedAir, 1, inscription, [[insert ace through eight of air here, 1]], null, "Mysteries", 1, null, null, {Air: 20}));
  // const extractionAwakenedEarth = await(createRecipe("Extraction: Awakened Earth", awakenedEarth, 1, inscription, [[insert ace through eight of earth here, 1]], null, "Mysteries", 1, null, null, {Earth: 20}));
  // const extractionAwakenedFire = await(createRecipe("Extraction: Awakened Fire", awakenedFire, 1, inscription, [[insert ace through eight of fire here, 1]], null, "Mysteries", 1, null, null, {Fire: 20}));
  // const extractionAwakenedFrost = await(createRecipe("Extraction: Awakened Frost", awakenedFrost, 1, inscription, [[insert ace through eight of frost here, 1]], null, "Mysteries", 1, null, null, {Frost: 20}));
  const contractArtisansConsortiumRecipe = await createRecipe(
    null,
    contractArtisansConsortium,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [burnishedInk, 3],
    ],
    null,
    "Contracts",
    1,
    300,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const contractDragonscaleExpeditionRecipe = await createRecipe(
    null,
    contractDragonscaleExpedition,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [blazingInk, 1],
      [chilledRune, 1],
    ],
    null,
    "Contracts",
    1,
    300,
    { DragonscaleExpedition: 19 },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const contractIskaaraTuskarrRecipe = await createRecipe(
    null,
    contractIskaaraTuskarr,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [sereneInk, 1],
      [chilledRune, 1],
    ],
    null,
    "Contracts",
    1,
    300,
    { IskaaraTuskarr: 25 },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const contractMaruukCentaurRecipe = await createRecipe(
    null,
    contractMaruukCentaur,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [flourishingInk, 1],
      [chilledRune, 1],
    ],
    null,
    "Contracts",
    1,
    300,
    { MaruukCentaur: 22 },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const contractValdrakkenAccordRecipe = await createRecipe(
    null,
    contractValdrakkenAccord,
    1,
    inscription,
    [
      [glitteringParchment, 1],
      [burnishedInk, 2],
    ],
    null,
    "Contracts",
    1,
    300,
    { ValdrakkenAccord: 23 },
    null,
    null,
    "Scribe's Drafting Table",
    null,
    [
      ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
      ["Blotting Sand", { Archiving: 30 }],
    ]
  );
  const draconicTreatiseOnAlchemyRecipe = await createRecipe(
    null,
    draconicTreatiseOnAlchemy,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedAir, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    null,
    "Crafting Other Treatises",
    "Scribe's Drafting Table",
    "Can be learned when crafting other Draconic Treatises."
  );
  const draconicTreatiseOnBlacksmithingRecipe = await createRecipe(
    null,
    draconicTreatiseOnBlacksmithing,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedFire, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    null,
    "Crafting Other Treatises",
    "Scribe's Drafting Table",
    "Can be learned when crafting other Draconic Treatises."
  );
  const draconicTreatiseOnEnchantingRecipe = await createRecipe(
    null,
    draconicTreatiseOnEnchanting,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedFrost, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    null,
    "Crafting Other Treatises",
    "Scribe's Drafting Table",
    "Can be learned when crafting other Draconic Treatises."
  );
  const draconicTreatiseOnEngineeringRecipe = await createRecipe(
    null,
    draconicTreatiseOnEngineering,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedFire, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    null,
    "Crafting Other Treatises",
    "Scribe's Drafting Table",
    "Can be learned when crafting other Draconic Treatises."
  );
  const draconicTreatiseOnHerbalismRecipe = await createRecipe(
    null,
    draconicTreatiseOnHerbalism,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedEarth, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    null,
    "Crafting Other Treatises",
    "Scribe's Drafting Table",
    "Can be learned when crafting other Draconic Treatises."
  );
  const draconicTreatiseOnInscriptionRecipe = await createRecipe(
    null,
    draconicTreatiseOnInscription,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedFrost, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    { DraconicTreatises: 0 },
    null,
    "Scribe's Drafting Table"
  );
  const draconicTreatiseOnJewelcraftingRecipe = await createRecipe(
    null,
    draconicTreatiseOnJewelcrafting,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedFire, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    null,
    "Crafting Other Treatises",
    "Scribe's Drafting Table",
    "Can be learned when crafting other Draconic Treatises."
  );
  const draconicTreatiseOnLeatherworkingRecipe = await createRecipe(
    null,
    draconicTreatiseOnLeatherworking,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedAir, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    null,
    "Crafting Other Treatises",
    "Scribe's Drafting Table",
    "Can be learned when crafting other Draconic Treatises."
  );
  const draconicTreatiseOnMiningRecipe = await createRecipe(
    null,
    draconicTreatiseOnMining,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedEarth, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    null,
    "Crafting Other Treatises",
    "Scribe's Drafting Table",
    "Can be learned when crafting other Draconic Treatises."
  );
  const draconicTreatiseOnSkinningRecipe = await createRecipe(
    null,
    draconicTreatiseOnSkinning,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedEarth, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    null,
    "Crafting Other Treatises",
    "Scribe's Drafting Table",
    "Can be learned when crafting other Draconic Treatises."
  );
  const draconicTreatiseOnTailoringRecipe = await createRecipe(
    null,
    draconicTreatiseOnTailoring,
    1,
    inscription,
    [
      [artisansMettle, 10],
      [rockfangLeather, 1],
      [glitteringParchment, 5],
      [awakenedFrost, 1],
      [burnishedInk, 1],
    ],
    null,
    "Profession Specialization",
    2,
    null,
    null,
    null,
    "Crafting Other Treatises",
    "Scribe's Drafting Table",
    "Can be learned when crafting other Draconic Treatises."
  );
  const renewedProtoDrakeSilverAndBlueArmorRecipe = await createRecipe(
    null,
    renewedProtoDrakeSilverAndBlueArmor,
    1,
    inscription,
    [
      [wildercloth, 20],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 8],
      [finishedPrototypeRegalBarding, 1],
      [rockfangLeather, 10],
    ],
    null,
    "Dragonriding - Renewed Proto-Drake",
    1,
    null,
    null,
    null,
    "Dungeon Drop",
    "Scribe's Drafting Table",
    "Drops from Ruby Life Pools last boss."
  );
  const renewedProtoDrakeSteelAndYellowArmorRecipe = await createRecipe(
    null,
    renewedProtoDrakeSteelAndYellowArmor,
    1,
    inscription,
    [
      [wildercloth, 20],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 8],
      [finishedPrototypeExplorersBarding, 1],
      [rockfangLeather, 10],
    ],
    null,
    "Dragonriding - Renewed Proto-Drake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Drops from Draconic Recipe in a Bottle."
  );
  const renewedProtoDrakeBovineHornsRecipe = await createRecipe(
    null,
    renewedProtoDrakeBovineHorns,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Renewed Proto-Drake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Drops from creatures on The Waking Shores."
  );
  const renewedProtoDrakePredatorPatternRecipe = await createRecipe(
    null,
    renewedProtoDrakePredatorPattern,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Renewed Proto-Drake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Drops from Draconic Recipe in a Bottle."
  );
  const renewedProtoDrakeSpinedCrestRecipe = await createRecipe(
    null,
    renewedProtoDrakeSpinedCrest,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Renewed Proto-Drake",
    1,
    null,
    { DragonscaleExpedition: 15 },
    null,
    null,
    "Scribe's Drafting Table"
  );
  const windborneVelocidrakeSilverAndBlueArmorRecipe = await createRecipe(
    null,
    windborneVelocidrakeSilverAndBlueArmor,
    1,
    inscription,
    [
      [wildercloth, 20],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 8],
      [finishedPrototypeRegalBarding, 1],
      [rockfangLeather, 10],
    ],
    null,
    "Dragonriding - Windborne Velocidrake",
    1,
    null,
    null,
    null,
    "Dungeon Drop",
    "Scribe's Drafting Table",
    "Drops from The Nokhud Offensive last boss."
  );
  const windborneVelocidrakeSteelAndOrangeArmorRecipe = await createRecipe(
    null,
    windborneVelocidrakeSteelAndOrangeArmor,
    1,
    inscription,
    [
      [wildercloth, 20],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 8],
      [finishedPrototypeExplorersBarding, 1],
      [rockfangLeather, 10],
    ],
    null,
    "Dragonriding - Windborne Velocidrake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Purchasable from The Great Swog?"
  );
  const windborneVelocidrakeBlackFurRecipe = await createRecipe(
    null,
    windborneVelocidrakeBlackFur,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Windborne Velocidrake",
    1,
    null,
    { MaruukCentaur: 15 },
    null,
    null,
    "Scribe's Drafting Table"
  );
  const windborneVelocidrakeSpinedHeadRecipe = await createRecipe(
    null,
    windborneVelocidrakeSpinedHead,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Windborne Velocidrake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Drops from Draconic Recipe in a Bottle."
  );
  const windborneVelocidrakeWindsweptPatternRecipe = await createRecipe(
    null,
    windborneVelocidrakeWindsweptPattern,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Windborne Velocidrake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Drops from creatures in the Ohn'ahran Plains."
  );
  const highlandDrakeSilverAndBlueArmorRecipe = await createRecipe(
    null,
    highlandDrakeSilverAndBlueArmor,
    1,
    inscription,
    [
      [wildercloth, 20],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 8],
      [finishedPrototypeRegalBarding, 1],
      [rockfangLeather, 10],
    ],
    null,
    "Dragonriding - Highland Drake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Drops from creatures in The Azure Span."
  );
  const highlandDrakeSteelAndYellowArmorRecipe = await createRecipe(
    null,
    highlandDrakeSteelAndYellowArmor,
    1,
    inscription,
    [
      [wildercloth, 20],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 8],
      [finishedPrototypeRegalBarding, 1],
      [rockfangLeather, 10],
    ],
    null,
    "Dragonriding - Highland Drake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Purchasable from The Great Swog?"
  );
  const highlandDrakeBlackHairRecipe = await createRecipe(
    null,
    highlandDrakeBlackHair,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Highland Drake",
    1,
    null,
    { IskaaraTuskarr: 13 },
    null,
    null,
    "Scribe's Drafting Table"
  );
  const highlandDrakeSpinedCrestRecipe = await createRecipe(
    null,
    highlandDrakeSpinedCrest,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Highland Drake",
    1,
    null,
    { CobaltAssembly: "High" },
    null,
    null,
    "Scribe's Drafting Table"
  );
  const highlandDrakeSpinedThroatRecipe = await createRecipe(
    null,
    highlandDrakeSpinedThroat,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Highland Drake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Drops from Draconic Recipe in a Bottle."
  );
  const cliffsideWylderdrakeSilverAndBlueArmorRecipe = await createRecipe(
    null,
    cliffsideWylderdrakeSilverAndBlueArmor,
    1,
    inscription,
    [
      [wildercloth, 20],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 8],
      [finishedPrototypeRegalBarding, 1],
      [rockfangLeather, 10],
    ],
    null,
    "Dragonriding - Cliffside Wylderdrake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Drops from creatures in Thaldraszus."
  );
  const cliffsideWylderdrakeSteelAndYellowArmorRecipe = await createRecipe(
    null,
    cliffsideWylderdrakeSteelAndYellowArmor,
    1,
    inscription,
    [
      [wildercloth, 20],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 8],
      [finishedPrototypeRegalBarding, 1],
      [rockfangLeather, 10],
    ],
    null,
    "Dragonriding - Cliffside Wylderdrake",
    1,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Purchasable from The Great Swog?"
  );
  const cliffsideWylderdrakeConicalHeadRecipe = await createRecipe(
    null,
    cliffsideWylderdrakeConicalHead,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Cliffside Wylderdrake",
    3,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Drops from Draconic Recipe in a Bottle."
  );
  const cliffsideWylderdrakeRedHairRecipe = await createRecipe(
    null,
    cliffsideWylderdrakeRedHair,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Cliffside Wylderdrake",
    3,
    null,
    { ValdrakkenAccord: 15 },
    null,
    null,
    "Scribe's Drafting Table"
  );
  const cliffsideWylderdrakeTripleHeadHornsRecipe = await createRecipe(
    null,
    cliffsideWylderdrakeTripleHeadHorns,
    1,
    inscription,
    [
      [wildercloth, 15],
      [glitteringParchment, 5],
      [iridescentWater, 8],
      [flawlessProtoDragonScale, 10],
      [awakenedOrder, 4],
    ],
    null,
    "Dragonriding - Cliffside Wylderdrake",
    3,
    null,
    null,
    null,
    "World Drop",
    "Scribe's Drafting Table",
    "Drops from creatures in Thaldraszus."
  );

  // //jewelcrafting recipes - 82 total
  // // const dragonIslesCrushing = await(createRecipe());
  // // const dragonIslesProspecting = await(createRecipe());
  const elementalHarmonyRecipe = await createRecipe(
    null,
    elementalHarmony,
    1,
    jewelcrafting,
    [
      [alexstraszite, 1],
      [malygite, 1],
      [ysemerald, 1],
      [neltharite, 1],
      [nozdorite, 1],
      [primalConvergent, 1],
    ],
    40,
    "Reagents",
    1,
    275,
    null,
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const illustriousInsightRecipeJewelcrafting = await createRecipe(
    "Illustrious Insight",
    illustriousInsight,
    1,
    jewelcrafting,
    [[artisansMettle, 50]],
    null,
    "Finishing Reagents",
    1,
    null,
    null,
    null,
    "Various Specializations",
    "Jeweler's Bench"
  );
  const blottingSandRecipe = await createRecipe(
    null,
    blottingSand,
    2,
    jewelcrafting,
    [
      [rousingFire, 1],
      [wildercloth, 1],
      [silkenGemdust, 1],
    ],
    null,
    "Reagents",
    1,
    225,
    null,
    { Enterprising: 0 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const pounceRecipe = await createRecipe(
    null,
    pounce,
    2,
    jewelcrafting,
    [
      [rousingEarth, 2],
      [wildercloth, 1],
      [silkenGemdust, 2],
    ],
    null,
    "Reagents",
    1,
    275,
    null,
    { Extravagancies: 0 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const emptySoulCageRecipe = await createRecipe(
    null,
    emptySoulCage,
    1,
    jewelcrafting,
    [
      [fracturedGlass, 3],
      [rousingAir, 2],
      [rousingEarth, 2],
      [rousingFire, 2],
      [rousingFrost, 2],
    ],
    null,
    "Reagents",
    1,
    null,
    null,
    { Enterprising: 15 },
    null,
    "Jeweler's Bench"
  );
  const draconicVialRecipe = await createRecipe(
    null,
    draconicVial,
    5,
    jewelcrafting,
    [
      [rousingFire, 1],
      [fracturedGlass, 5],
      [draconicStopper, 5],
      [silkenGemdust, 1],
    ],
    20,
    "Reagents",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20, Glassware: 10 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const framelessLensRecipe = await createRecipe(
    null,
    framelessLens,
    2,
    jewelcrafting,
    [
      [rousingEarth, 1],
      [fracturedGlass, 3],
      [silkenGemdust, 2],
    ],
    10,
    "Reagents",
    1,
    300,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20, Glassware: 10 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const glossyStoneRecipe = await createRecipe(
    null,
    glossyStone,
    2,
    jewelcrafting,
    [
      [crumbledStone, 4],
      [rousingEarth, 2],
      [eternityAmber, 1],
    ],
    5,
    "Reagents",
    1,
    200,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const shimmeringClaspRecipe = await createRecipe(
    null,
    shimmeringClasp,
    2,
    jewelcrafting,
    [
      [misshapenFiligree, 1],
      [mysticSapphire, 1],
    ],
    5,
    "Reagents",
    1,
    200,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const craftyQueensRubyRecipe = await createRecipe(
    null,
    craftyQueensRuby,
    1,
    jewelcrafting,
    [
      [rousingAir, 2],
      [queensRuby, 2],
    ],
    15,
    "Rudimentary Gems",
    1,
    60,
    null,
    null,
    null,
    null,
    null,
    [["Polishing Cloth", { Faceting: 0 }]]
  );
  const energizedVibrantEmeraldRecipe = await createRecipe(
    null,
    energizedVibrantEmerald,
    1,
    jewelcrafting,
    [
      [rousingFrost, 2],
      [vibrantEmerald, 2],
    ],
    10,
    "Rudimentary Gems",
    1,
    60,
    null,
    null,
    null,
    null,
    null,
    [["Polishing Cloth", { Faceting: 0 }]]
  );
  const senseisSunderedOnyxRecipe = await createRecipe(
    null,
    senseisSunderedOnyx,
    1,
    jewelcrafting,
    [
      [rousingFire, 2],
      [sunderedOnyx, 2],
    ],
    15,
    "Rudimentary Gems",
    1,
    60,
    null,
    null,
    null,
    null,
    null,
    [["Polishing Cloth", { Faceting: 0 }]]
  );
  const zenMysticSapphireRecipe = await createRecipe(
    null,
    zenMysticSapphire,
    1,
    jewelcrafting,
    [
      [rousingEarth, 2],
      [mysticSapphire, 2],
    ],
    10,
    "Rudimentary Gems",
    1,
    60,
    null,
    null,
    null,
    null,
    null,
    [["Polishing Cloth", { Faceting: 0 }]]
  );
  const solidEternityAmberRecipe = await createRecipe(
    null,
    solidEternityAmber,
    1,
    jewelcrafting,
    [[eternityAmber, 2]],
    1,
    "Rudimentary Gems",
    1,
    150,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [["Polishing Cloth", { Faceting: 0 }]]
  );
  const craftyAlexstrasziteRecipe = await createRecipe(
    null,
    craftyAlexstraszite,
    1,
    jewelcrafting,
    [
      [awakenedAir, 2],
      [awakenedFire, 1],
      [awakenedOrder, 1],
      [alexstraszite, 1],
    ],
    null,
    "Air Gems",
    1,
    325,
    null,
    { Air: 10 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Air: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const energizedMalygiteRecipe = await createRecipe(
    null,
    energizedMalygite,
    1,
    jewelcrafting,
    [
      [awakenedAir, 2],
      [awakenedFrost, 1],
      [awakenedOrder, 1],
      [malygite, 1],
    ],
    null,
    "Air Gems",
    1,
    325,
    { DragonscaleExpedition: 9 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Air: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const forcefulNozdoriteRecipe = await createRecipe(
    null,
    forcefulNozdorite,
    1,
    jewelcrafting,
    [
      [awakenedAir, 1],
      [nozdorite, 1],
    ],
    30,
    "Air Gems",
    1,
    300,
    null,
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Air: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const keenNelthariteRecipe = await createRecipe(
    null,
    keenNeltharite,
    1,
    jewelcrafting,
    [
      [awakenedAir, 2],
      [awakenedEarth, 1],
      [awakenedOrder, 1],
      [neltharite, 1],
    ],
    null,
    "Air Gems",
    1,
    325,
    { DragonscaleExpedition: 9 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Air: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const quickYsemeraldRecipe = await createRecipe(
    null,
    quickYsemerald,
    1,
    jewelcrafting,
    [
      [awakenedAir, 3],
      [awakenedOrder, 1],
      [ysemerald, 1],
    ],
    null,
    "Air Gems",
    1,
    325,
    null,
    { Air: 20 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Air: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const fracturedNelthariteRecipe = await createRecipe(
    null,
    fracturedNeltharite,
    1,
    jewelcrafting,
    [
      [awakenedEarth, 3],
      [awakenedOrder, 1],
      [neltharite, 1],
    ],
    null,
    "Earth Gems",
    1,
    325,
    null,
    { Earth: 20 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Earth: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const keenYsemeraldRecipe = await createRecipe(
    null,
    keenYsemerald,
    1,
    jewelcrafting,
    [
      [awakenedEarth, 2],
      [awakenedAir, 1],
      [awakenedOrder, 1],
      [ysemerald, 1],
    ],
    null,
    "Earth Gems",
    1,
    325,
    { IskaaraTuskarr: 10 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Earth: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const puissantNozdoriteRecipe = await createRecipe(
    null,
    puissantNozdorite,
    1,
    jewelcrafting,
    [
      [awakenedEarth, 1],
      [nozdorite, 1],
    ],
    30,
    "Earth Gems",
    1,
    300,
    null,
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Earth: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const senseisAlexstrasziteRecipe = await createRecipe(
    null,
    senseisAlexstraszite,
    1,
    jewelcrafting,
    [
      [awakenedEarth, 2],
      [awakenedFire, 1],
      [awakenedOrder, 1],
      [alexstraszite, 1],
    ],
    null,
    "Earth Gems",
    1,
    325,
    { IskaaraTuskarr: 10 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Earth: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const zenMalygiteRecipe = await createRecipe(
    null,
    zenMalygite,
    1,
    jewelcrafting,
    [
      [awakenedEarth, 2],
      [awakenedFrost, 1],
      [awakenedOrder, 1],
      [malygite, 1],
    ],
    null,
    "Earth Gems",
    1,
    325,
    null,
    { Earth: 10 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Earth: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const craftyYsemeraldRecipe = await createRecipe(
    null,
    craftyYsemerald,
    1,
    jewelcrafting,
    [
      [awakenedFire, 2],
      [awakenedAir, 1],
      [awakenedOrder, 1],
      [ysemerald, 1],
    ],
    null,
    "Fire Gems",
    1,
    325,
    null,
    { Fire: 10 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Fire: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const deadlyAlexstrasziteRecipe = await createRecipe(
    null,
    deadlyAlexstraszite,
    1,
    jewelcrafting,
    [
      [awakenedFire, 3],
      [awakenedOrder, 1],
      [alexstraszite, 1],
    ],
    null,
    "Fire Gems",
    1,
    325,
    null,
    { Fire: 20 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Fire: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const jaggedNozdoriteRecipe = await createRecipe(
    null,
    jaggedNozdorite,
    1,
    jewelcrafting,
    [
      [awakenedFire, 1],
      [nozdorite, 1],
    ],
    30,
    "Fire Gems",
    1,
    300,
    null,
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Fire: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const radiantMalygiteRecipe = await createRecipe(
    null,
    radiantMalygite,
    1,
    jewelcrafting,
    [
      [awakenedFire, 2],
      [awakenedFrost, 1],
      [awakenedOrder, 1],
      [malygite, 1],
    ],
    null,
    "Fire Gems",
    1,
    325,
    { DragonscaleExpedition: 9 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Fire: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const senseisNelthariteRecipe = await createRecipe(
    null,
    senseisNeltharite,
    1,
    jewelcrafting,
    [
      [awakenedFire, 2],
      [awakenedEarth, 1],
      [awakenedOrder, 1],
      [neltharite, 1],
    ],
    null,
    "Fire Gems",
    1,
    325,
    { DragonscaleExpedition: 9 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Fire: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const energizedYsemeraldRecipe = await createRecipe(
    null,
    energizedYsemerald,
    1,
    jewelcrafting,
    [
      [awakenedFrost, 2],
      [awakenedAir, 1],
      [awakenedOrder, 1],
      [ysemerald, 1],
    ],
    null,
    "Frost Gems",
    1,
    325,
    { IskaaraTuskarr: 10 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Frost: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const radiantAlexstrasziteRecipe = await createRecipe(
    null,
    radiantAlexstraszite,
    1,
    jewelcrafting,
    [
      [awakenedFrost, 2],
      [awakenedFire, 1],
      [awakenedOrder, 1],
      [alexstraszite, 1],
    ],
    null,
    "Frost Gems",
    1,
    325,
    { IskaaraTuskarr: 10 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Frost: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const steadyNozdoriteRecipe = await createRecipe(
    null,
    steadyNozdorite,
    1,
    jewelcrafting,
    [
      [awakenedFrost, 1],
      [nozdorite, 1],
    ],
    30,
    "Frost Gems",
    1,
    300,
    null,
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Frost: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const stormyMalygiteRecipe = await createRecipe(
    null,
    stormyMalygite,
    1,
    jewelcrafting,
    [
      [awakenedFrost, 3],
      [awakenedOrder, 1],
      [malygite, 1],
    ],
    null,
    "Frost Gems",
    1,
    325,
    null,
    { Frost: 20 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Frost: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const zenNelthariteRecipe = await createRecipe(
    null,
    zenNeltharite,
    1,
    jewelcrafting,
    [
      [awakenedFrost, 2],
      [awakenedEarth, 1],
      [awakenedOrder, 1],
      [neltharite, 1],
    ],
    null,
    "Frost Gems",
    1,
    325,
    null,
    { Frost: 10 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Frost: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const fierceIllimitedDiamondRecipe = await createRecipe(
    null,
    fierceIllimitedDiamond,
    1,
    jewelcrafting,
    [
      [awakenedAir, 1],
      [awakenedOrder, 1],
      [primalChaos, 20],
      [illimitedDiamond, 1],
      [ysemerald, 1],
    ],
    null,
    "Primalist Gems",
    1,
    375,
    null,
    { Air: 40 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Illustrious Insight", { Air: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const inscribedIllimitedDiamondRecipe = await createRecipe(
    null,
    inscribedIllimitedDiamond,
    1,
    jewelcrafting,
    [
      [awakenedFire, 1],
      [awakenedOrder, 1],
      [primalChaos, 20],
      [illimitedDiamond, 1],
      [alexstraszite, 1],
    ],
    null,
    "Primalist Gems",
    1,
    375,
    null,
    { Fire: 40 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Illustrious Insight", { Fire: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const resplendentIllimitedDiamondRecipe = await createRecipe(
    null,
    resplendentIllimitedDiamond,
    1,
    jewelcrafting,
    [
      [awakenedFrost, 1],
      [awakenedOrder, 1],
      [primalChaos, 20],
      [illimitedDiamond, 1],
      [malygite, 1],
    ],
    null,
    "Primalist Gems",
    1,
    375,
    null,
    { Frost: 40 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Illustrious Insight", { Frost: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const skillfulIllimitedDiamondRecipe = await createRecipe(
    null,
    skillfulIllimitedDiamond,
    1,
    jewelcrafting,
    [
      [awakenedEarth, 1],
      [awakenedOrder, 1],
      [primalChaos, 20],
      [illimitedDiamond, 1],
      [neltharite, 1],
    ],
    null,
    "Primalist Gems",
    1,
    375,
    null,
    { Earth: 40 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Illustrious Insight", { Earth: 30 }],
      ["Polishing Cloth", { Faceting: 0 }],
    ]
  );
  const tieredMedallionSettingRecipe = await createRecipe(
    null,
    tieredMedallionSetting,
    1,
    jewelcrafting,
    [
      [awakenedOrder, 1],
      [illimitedDiamond, 1],
      [shimmeringClasp, 1],
    ],
    null,
    "Miscellaneous",
    1,
    275,
    null,
    { Setting: 30 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", {}],
      ["Polishing Cloth", {}],
    ]
  );
  const idolOfTheDreamerRecipe = await createRecipe(
    null,
    idolOfTheDreamer,
    1,
    jewelcrafting,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 60],
      [airySoul, 1],
      [ysemerald, 1],
      [illimitedDiamond, 1],
      [glossyStone, 10],
    ],
    null,
    "Trinkets",
    1,
    325,
    { IskaaraTuskarr: 15 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Primal Infusion", { Idols: 0 }],
      ["Illustrious Insight", { Idols: 30 }],
      ["Polishing Cloth", { Carving: 30 }],
    ]
  );
  const idolOfTheEarthWarderRecipe = await createRecipe(
    null,
    idolOfTheEarthWarder,
    1,
    jewelcrafting,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 60],
      [earthenSoul, 1],
      [neltharite, 1],
      [illimitedDiamond, 1],
      [glossyStone, 10],
    ],
    null,
    "Trinkets",
    1,
    325,
    { DragonscaleExpedition: 13 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Primal Infusion", { Idols: 0 }],
      ["Illustrious Insight", { Idols: 30 }],
      ["Polishing Cloth", { Carving: 30 }],
    ]
  );
  const idolOfTheLifebinderRecipe = await createRecipe(
    null,
    idolOfTheLifebinder,
    1,
    jewelcrafting,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 60],
      [fierySoul, 1],
      [alexstraszite, 1],
      [illimitedDiamond, 1],
      [glossyStone, 10],
    ],
    null,
    "Trinkets",
    1,
    325,
    { DragonscaleExpedition: 13 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Primal Infusion", { Idols: 0 }],
      ["Illustrious Insight", { Idols: 30 }],
      ["Polishing Cloth", { Carving: 30 }],
    ]
  );
  const idolOfTheSpellWeaverRecipe = await createRecipe(
    null,
    idolOfTheSpellWeaver,
    1,
    jewelcrafting,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 60],
      [frostySoul, 1],
      [malygite, 1],
      [illimitedDiamond, 1],
      [glossyStone, 10],
    ],
    null,
    "Trinkets",
    1,
    325,
    { IskaaraTuskarr: 15 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Primal Infusion", { Idols: 0 }],
      ["Illustrious Insight", { Idols: 30 }],
      ["Polishing Cloth", { Carving: 30 }],
    ]
  );
  const chokerOfShieldingRecipe = await createRecipe(
    null,
    chokerOfShielding,
    1,
    jewelcrafting,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [shimmeringClasp, 2],
      [illimitedDiamond, 1],
      [elementalHarmony, 1],
    ],
    null,
    "Jewelry",
    1,
    315,
    null,
    null,
    "Raid Drop",
    "Jeweler's Bench",
    "Drops from bosses in Vault of the Incarnates.",
    [
      ["Missive - Combat", { Jewelry: 15 }],
      ["Primal Infusion", { Jewelry: 25 }],
      ["Illustrious Insight", { Necklaces: 30 }],
      ["Polishing Cloth", { Jewelry: 30 }],
    ]
  );
  const elementalLariatRecipe = await createRecipe(
    null,
    elementalLariat,
    1,
    jewelcrafting,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [shimmeringClasp, 2],
      [illimitedDiamond, 1],
      [elementalHarmony, 1],
    ],
    null,
    "Jewelry",
    1,
    315,
    null,
    null,
    "World Drop",
    "Jeweler's Bench",
    "Drops from 'powerful creatures' in Primal Storms.",
    [
      ["Missive - Combat", { Jewelry: 15 }],
      ["Primal Infusion", { Jewelry: 25 }],
      ["Illustrious Insight", { Necklaces: 30 }],
      ["Polishing Cloth", { Jewelry: 30 }],
    ]
  );
  const ringBoundHourglassRecipe = await createRecipe(
    null,
    ringBoundHourglass,
    1,
    jewelcrafting,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [shimmeringClasp, 2],
      [illimitedDiamond, 1],
      [elementalHarmony, 1],
      [silkenGemdust, 3],
    ],
    null,
    "Jewelry",
    1,
    315,
    null,
    null,
    "World Drop",
    "Jeweler's Bench",
    "Drops from 'Chest of the Elements' in the Primalist Tomorrow zone.",
    [
      ["Missive - Combat", { Jewelry: 15 }],
      ["Primal Infusion", { Jewelry: 25 }],
      ["Illustrious Insight", { Rings: 30 }],
      ["Polishing Cloth", { Jewelry: 30 }],
    ]
  );
  const signetOfTitanicInsightRecipe = await createRecipe(
    null,
    signetOfTitanicInsight,
    1,
    jewelcrafting,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [shimmeringClasp, 2],
      [elementalHarmony, 1],
      [ysemerald, 1],
    ],
    null,
    "Jewelry",
    1,
    280,
    null,
    { Rings: 0 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Missive - Combat", { Jewelry: 15 }],
      ["Primal Infusion", { Jewelry: 25 }],
      ["Embellishment", { Rings: 15 }],
      ["Illustrious Insight", { Rings: 30 }],
      ["Polishing Cloth", { Jewelry: 30 }],
    ]
  );
  const torcOfPassedTimeRecipe = await createRecipe(
    null,
    torcOfPassedTime,
    1,
    jewelcrafting,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [shimmeringClasp, 2],
      [elementalHarmony, 1],
      [malygite, 1],
    ],
    null,
    "Jewelry",
    1,
    280,
    null,
    { Necklaces: 0 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Missive - Combat", { Jewelry: 15 }],
      ["Primal Infusion", { Jewelry: 25 }],
      ["Embellishment", { Necklaces: 15 }],
      ["Illustrious Insight", { Necklaces: 30 }],
      ["Polishing Cloth", { Jewelry: 30 }],
    ]
  );
  const crimsonCombatantsJeweledAmuletRecipe = await createRecipe(
    null,
    crimsonCombatantsJeweledAmulet,
    1,
    jewelcrafting,
    [
      [rousingIre, 2],
      [shimmeringClasp, 1],
      [mysticSapphire, 2],
    ],
    null,
    "Jewelry",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Jeweler's Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Jewelry: 15 }],
      ["Lesser Illustrious Insight", { Necklaces: 30 }],
      ["Polishing Cloth", { Jewelry: 30 }],
    ]
  );
  const crimsonCombatantsJeweledSignetRecipe = await createRecipe(
    null,
    crimsonCombatantsJeweledSignet,
    1,
    jewelcrafting,
    [
      [rousingIre, 2],
      [shimmeringClasp, 1],
      [mysticSapphire, 2],
    ],
    null,
    "Jewelry",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Jeweler's Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Jewelry: 15 }],
      ["Lesser Illustrious Insight", { Rings: 30 }],
      ["Polishing Cloth", { Jewelry: 30 }],
    ]
  );
  const bandOfNewBeginningsRecipe = await createRecipe(
    null,
    bandOfNewBeginnings,
    1,
    jewelcrafting,
    [
      [rousingFire, 5],
      [shimmeringClasp, 1],
      [eternityAmber, 2],
    ],
    15,
    "Jewelry",
    2,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Combat", { Jewelry: 15 }],
      ["Training Matrix", {}],
      ["Lesser Illustrious Insight", { Rings: 30 }],
      ["Polishing Cloth", { Jewelry: 30 }],
    ]
  );
  const pendantOfImpendingPerilsRecipe = await createRecipe(
    null,
    pendantOfImpendingPerils,
    1,
    jewelcrafting,
    [
      [shimmeringClasp, 1],
      [sunderedOnyx, 1],
    ],
    15,
    "Jewelry",
    2,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Missive - Combat", { Jewelry: 15 }],
      ["Training Matrix", {}],
      ["Lesser Illustrious Insight", { Necklaces: 30 }],
      ["Polishing Cloth", { Jewelry: 30 }],
    ]
  );
  const djaradinsPinataRecipe = await createRecipe(
    null,
    djaradinsPinata,
    3,
    jewelcrafting,
    [
      [awakenedIre, 1],
      [markOfHonor, 2],
      [glossyStone, 9],
      [sunderedOnyx, 6],
      [silkenGemdust, 2],
      [shimmeringClasp, 3],
    ],
    null,
    "Statues & Carvings",
    1,
    375,
    null,
    null,
    "PvP Victory",
    "Jeweler's Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Lesser Illustrious Insight", { Stone: 30 }],
      ["Polishing Cloth", { Carving: 30 }],
    ]
  );
  const narcissistsSculptureRecipe = await createRecipe(
    null,
    narcissistsSculpture,
    1,
    jewelcrafting,
    [
      [awakenedFire, 1],
      [glossyStone, 2],
      [vibrantEmerald, 1],
      [silkenGemdust, 1],
      [shimmeringClasp, 1],
    ],
    null,
    "Statues & Carvings",
    1,
    300,
    null,
    { Setting: 0 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Stone: 30 }],
      ["Polishing Cloth", { Carving: 30 }],
    ]
  );
  const kaluakFigurineRecipe = await createRecipe(
    null,
    kaluakFigurine,
    1,
    jewelcrafting,
    [
      [scalebellyMackerel, 1],
      [glossyStone, 1],
      [silkenGemdust, 1],
    ],
    null,
    "Statues & Carvings",
    1,
    250,
    { IskaaraTuskarr: 10 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Stone: 30 }],
      ["Polishing Cloth", { Carving: 30 }],
    ]
  );
  const statueOfTyrsHeraldRecipe = await createRecipe(
    null,
    statueOfTyrsHerald,
    1,
    jewelcrafting,
    [
      [glowingTitanOrb, 1],
      [glossyStone, 2],
      [mysticSapphire, 1],
      [silkenGemdust, 1],
      [shimmeringClasp, 1],
    ],
    null,
    "Statues & Carvings",
    1,
    300,
    null,
    { Setting: 15 },
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Stone: 30 }],
      ["Polishing Cloth", { Carving: 30 }],
    ]
  );
  const revitalizingRedCarvingRecipe = await createRecipe(
    null,
    revitalizingRedCarving,
    1,
    jewelcrafting,
    [
      [glossyStone, 2],
      [queensRuby, 1],
      [silkenGemdust, 1],
      [shimmeringClasp, 1],
    ],
    25,
    "Statues & Carvings",
    1,
    250,
    null,
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Stone: 30 }],
      ["Polishing Cloth", { Carving: 30 }],
    ]
  );
  const jeweledAmberWhelplingRecipe = await createRecipe(
    null,
    jeweledAmberWhelpling,
    1,
    jewelcrafting,
    [
      [jeweledDragonsHeart, 1],
      [glimmeringNozdoriteCluster, 1],
      [glossyStone, 1],
      [nozdorite, 1],
      [elementalHarmony, 2],
      [illimitedDiamond, 1],
    ],
    null,
    "Battle Pets",
    1,
    null,
    null,
    null,
    "World Drop",
    "Jeweler's Bench",
    "Drops from 'Treasures of the Dragon Isles.'"
  );
  const jeweledEmeraldWhelplingRecipe = await createRecipe(
    null,
    jeweledEmeraldWhelpling,
    1,
    jewelcrafting,
    [
      [jeweledDragonsHeart, 1],
      [glimmeringYsemeraldCluster, 1],
      [glossyStone, 1],
      [ysemerald, 1],
      [elementalHarmony, 2],
      [illimitedDiamond, 1],
    ],
    null,
    "Battle Pets",
    1,
    null,
    null,
    null,
    "World Drop",
    "Jeweler's Bench",
    "Drops from 'Treasures of the Dragon Isles.'"
  );
  const jeweledOnyxWhelplingRecipe = await createRecipe(
    null,
    jeweledOnyxWhelpling,
    1,
    jewelcrafting,
    [
      [jeweledDragonsHeart, 1],
      [glimmeringNelthariteCluster, 1],
      [glossyStone, 1],
      [neltharite, 1],
      [elementalHarmony, 2],
      [illimitedDiamond, 1],
    ],
    null,
    "Battle Pets",
    1,
    null,
    null,
    null,
    "World Drop",
    "Jeweler's Bench",
    "Drops from 'Treasures of the Dragon Isles.'"
  );
  const jeweledRubyWhelplingRecipe = await createRecipe(
    null,
    jeweledRubyWhelpling,
    1,
    jewelcrafting,
    [
      [jeweledDragonsHeart, 1],
      [glimmeringAlexstrasziteCluster, 1],
      [glossyStone, 1],
      [alexstraszite, 1],
      [elementalHarmony, 2],
      [illimitedDiamond, 1],
    ],
    null,
    "Battle Pets",
    1,
    null,
    null,
    null,
    "World Drop",
    "Jeweler's Bench",
    "Drops from 'Treasures of the Dragon Isles.'"
  );
  const jeweledSapphireWhelplingRecipe = await createRecipe(
    null,
    jeweledSapphireWhelpling,
    1,
    jewelcrafting,
    [
      [jeweledDragonsHeart, 1],
      [glimmeringMalygiteCluster, 1],
      [glossyStone, 1],
      [malygite, 1],
      [elementalHarmony, 2],
      [illimitedDiamond, 1],
    ],
    null,
    "Battle Pets",
    1,
    null,
    null,
    null,
    "World Drop",
    "Jeweler's Bench",
    "Drops from 'Treasures of the Dragon Isles.'"
  );
  const convergentPrismRecipe = await createRecipe(
    null,
    convergentPrism,
    1,
    jewelcrafting,
    [
      [glowingTitanOrb, 1],
      [illimitedDiamond, 1],
      [projectionPrism, 1],
      [elementalHarmony, 1],
    ],
    null,
    "Novelties",
    1,
    null,
    null,
    null,
    "World Drop",
    "Jeweler's Bench",
    "Drops from 'Inconspicuous Bookmark' in Thaldraszus."
  );
  const jeweledOfferingRecipe = await createRecipe(
    null,
    convergentPrism,
    1,
    jewelcrafting,
    [
      [contouredFowlfeather, 75],
      [tuftOfPrimalWool, 2],
      [alexstraszite, 1],
      [silkenGemdust, 15],
      [vibrantWilderclothBolt, 10],
    ],
    null,
    "Novelties",
    1,
    null,
    { Enterprising: 30 },
    null,
    null,
    "Jeweler's Bench"
  );
  const projectionPrismRecipe = await createRecipe(
    null,
    projectionPrism,
    "1-2",
    jewelcrafting,
    [
      [fracturedGlass, 7],
      [framelessLens, 1],
      [silkenGemdust, 1],
    ],
    null,
    "Novelties",
    1,
    225,
    { Glassware: 0 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20, Glassware: 10 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const rhinestoneSunglassesRecipe = await createRecipe(
    null,
    rhinestoneSunglasses,
    1,
    jewelcrafting,
    [
      [ysemerald, 2],
      [framelessLens, 2],
      [illimitedDiamond, 1],
      [elementalHarmony, 1],
    ],
    null,
    "Novelties",
    1,
    null,
    null,
    null,
    "World Drop",
    "Jeweler's Bench",
    "Drops from Draconic Recipe in a Bottle."
  );
  const splitLensSpecsRecipe = await createRecipe(
    null,
    splitLensSpecs,
    1,
    jewelcrafting,
    [
      [neltharite, 1],
      [framelessLens, 1],
      [elementalHarmony, 1],
    ],
    null,
    "Novelties",
    1,
    null,
    { Glassware: 25 },
    null,
    null,
    "Jeweler's Bench"
  );
  const alexstrasziteLoupesRecipe = await createRecipe(
    null,
    alexstrasziteLoupes,
    1,
    jewelcrafting,
    [
      [artisansMettle, 225],
      [vibrantShard, 2],
      [framelessLens, 2],
      [shimmeringClasp, 5],
      [alexstraszite, 2],
    ],
    1,
    "Profession Equipment",
    null,
    325,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const finePrintTrifocalsRecipe = await createRecipe(
    null,
    finePrintTrifocals,
    1,
    jewelcrafting,
    [
      [artisansMettle, 225],
      [vibrantShard, 2],
      [framelessLens, 2],
      [shimmeringClasp, 5],
      [nozdorite, 2],
    ],
    1,
    "Profession Equipment",
    null,
    325,
    { IskaaraTuskarr: 18 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const magnificentMarginMagnifierRecipe = await createRecipe(
    null,
    magnificentMarginMagnifier,
    1,
    jewelcrafting,
    [
      [artisansMettle, 225],
      [framelessLens, 2],
      [shimmeringClasp, 2],
      [nozdorite, 4],
    ],
    1,
    "Profession Equipment",
    null,
    325,
    { DragonscaleExpedition: 15 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const resonantFocusRecipe = await createRecipe(
    null,
    resonantFocus,
    1,
    jewelcrafting,
    [
      [artisansMettle, 225],
      [resonantCrystal, 2],
      [vibrantShard, 2],
      [shimmeringClasp, 2],
    ],
    null,
    "Profession Equipment",
    1,
    325,
    { IskaaraTuskarr: 18 },
    null,
    null,
    "Jeweler's Bench",
    null,
    [
      ["Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const boldPrintBifocalsRecipe = await createRecipe(
    null,
    boldPrintBifocals,
    1,
    jewelcrafting,
    [
      [framelessLens, 2],
      [sereviteOre, 2],
    ],
    20,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const chromaticFocusRecipe = await createRecipe(
    null,
    chromaticFocus,
    1,
    jewelcrafting,
    [
      [chromaticDust, 4],
      [shimmeringClasp, 1],
    ],
    20,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const leftHandedMagnifyingGlassRecipe = await createRecipe(
    null,
    leftHandedMagnifyingGlass,
    1,
    jewelcrafting,
    [
      [framelessLens, 1],
      [draconiumOre, 3],
    ],
    20,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const sunderedOnyxLoupesRecipe = await createRecipe(
    null,
    sunderedOnyxLoupes,
    1,
    jewelcrafting,
    [
      [framelessLens, 2],
      [sereviteOre, 2],
      [sunderedOnyx, 1],
    ],
    20,
    "Profession Equipment",
    3,
    275,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Enterprising: 20 }],
      ["Polishing Cloth", { Enterprising: 10 }],
    ]
  );
  const jeweledDragonsHeartRecipe = await createRecipe(
    null,
    jeweledDragonsHeart,
    1,
    jewelcrafting,
    [
      [queensRuby, 1],
      [mysticSapphire, 1],
      [vibrantEmerald, 1],
      [sunderedOnyx, 1],
      [eternityAmber, 2],
      [silkenGemdust, 3],
    ],
    null,
    "Extravagent Glasswares",
    1,
    null,
    null,
    { Glassware: 35 },
    null,
    "Jeweler's Bench"
  );
  const dreamersVisionRecipe = await createRecipe(
    null,
    dreamersVision,
    1,
    jewelcrafting,
    [
      [fracturedGlass, 3],
      [vibrantEmerald, 2],
      [silkenGemdust, 1],
    ],
    null,
    "Extravagent Glassware",
    1,
    250,
    null,
    { Air: 0 },
    null,
    "Jeweler's Bench"
  );
  const earthwardensPrizeRecipe = await createRecipe(
    null,
    earthwardensPrize,
    1,
    jewelcrafting,
    [
      [fracturedGlass, 3],
      [sunderedOnyx, 2],
      [silkenGemdust, 1],
    ],
    null,
    "Extravagent Glassware",
    1,
    250,
    null,
    { Earth: 0 },
    null,
    "Jeweler's Bench"
  );
  const keepersGloryRecipe = await createRecipe(
    null,
    keepersGlory,
    1,
    jewelcrafting,
    [
      [fracturedGlass, 3],
      [mysticSapphire, 2],
      [silkenGemdust, 1],
    ],
    null,
    "Extravagent Glassware",
    1,
    250,
    null,
    { Frost: 0 },
    null,
    "Jeweler's Bench"
  );
  const queensGiftRecipe = await createRecipe(
    null,
    queensGift,
    1,
    jewelcrafting,
    [
      [fracturedGlass, 3],
      [queensGift, 2],
      [silkenGemdust, 1],
    ],
    null,
    "Extravagent Glassware",
    1,
    250,
    null,
    { Fire: 0 },
    null,
    "Jeweler's Bench"
  );
  const timewatchersPatienceRecipe = await createRecipe(
    null,
    timewatchersPatience,
    1,
    jewelcrafting,
    [
      [fracturedGlass, 3],
      [eternityAmber, 4],
      [silkenGemdust, 1],
    ],
    25,
    "Extravagent Glassware",
    1,
    250,
    null,
    null,
    null,
    "Jeweler's Bench"
  );

  // //leatherworking recipes - 101 total
  const lifeBoundBeltRecipe = await createRecipe(
    null,
    lifeBoundBelt,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [pristineVorquinHorn, 4],
      [earthshineScales, 13],
      [resilientLeather, 150],
    ],
    null,
    "Leather Armor",
    1,
    280,
    null,
    { BeltsLeather: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Illustrious Insight", { BeltsLeather: 20 }],
      ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
    ]
  );
  const lifeBoundBindingsRecipe = await createRecipe(
    null,
    lifeBoundBindings,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [windsongPlumage, 3],
      [earthshineScales, 10],
      [resilientLeather, 150],
    ],
    null,
    "Leather Armor",
    1,
    280,
    null,
    { Wristwraps: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Illustrious Insight", { Wristwraps: 20 }],
      ["Curing Agent", { ShapedLeatherArmor: 30 }],
    ]
  );
  const lifeBoundBootsRecipe = await createRecipe(
    null,
    lifeBoundBoots,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [crystalspineFur, 4],
      [frostbiteScales, 13],
      [resilientLeather, 150],
    ],
    null,
    "Leather Armor",
    1,
    280,
    null,
    { BootsLeather: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Illustrious Insight", { BootsLeather: 20 }],
      ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
    ]
  );
  const lifeBoundCapRecipe = await createRecipe(
    null,
    lifeBoundCap,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [windsongPlumage, 4],
      [mireslushHide, 15],
      [resilientLeather, 150],
    ],
    null,
    "Leather Armor",
    1,
    280,
    null,
    { Helms: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Illustrious Insight", { Helms: 20 }],
      ["Curing Agent", { ShapedLeatherArmor: 30 }],
    ]
  );
  const lifeBoundChestpieceRecipe = await createRecipe(
    null,
    lifeBoundChestpiece,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [flawlessProtoDragonScale, 4],
      [mireslushHide, 15],
      [resilientLeather, 150],
    ],
    null,
    "Leather Armor",
    1,
    280,
    null,
    { Chestpieces: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Illustrious Insight", { Chestpieces: 20 }],
      ["Curing Agent", { ShapedLeatherArmor: 30 }],
    ]
  );
  const lifeBoundGlovesRecipe = await createRecipe(
    null,
    lifeBoundGloves,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [salamantherScales, 4],
      [frostbiteScales, 13],
      [resilientLeather, 150],
    ],
    null,
    "Leather Armor",
    1,
    280,
    null,
    { Gloves: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Illustrious Insight", { Gloves: 20 }],
      ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
    ]
  );
  const lifeBoundShoulderpadsRecipe = await createRecipe(
    null,
    lifeBoundShoulderpads,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [fireInfusedHide, 4],
      [stonecrustHide, 13],
      [resilientLeather, 150],
    ],
    null,
    "Leather Armor",
    1,
    280,
    null,
    { Shoulderpads: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Illustrious Insight", { Shoulderpads: 20 }],
      ["Curing Agent", { ShapedLeatherArmor: 30 }],
    ]
  );
  const lifeBoundTrousersRecipe = await createRecipe(
    null,
    lifeBoundTrousers,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [cacophonousThunderscale, 4],
      [stonecrustHide, 15],
      [resilientLeather, 150],
    ],
    null,
    "Leather Armor",
    1,
    280,
    null,
    { Legguards: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Illustrious Insight", { Legguards: 20 }],
      ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
    ]
  );
  const pioneersPracticedCowlRecipe = await createRecipe(
    null,
    pioneersPracticedCowl,
    1,
    leatherworking,
    [
      [resilientLeather, 10],
      [denseHide, 3],
    ],
    50,
    "Leather Armor",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Helms: 20 }],
      ["Curing Agent", { ShapedLeatherArmor: 30 }],
    ]
  );
  const pioneersPracticedLeggingsRecipe = await createRecipe(
    null,
    pioneersPracticedLeggings,
    1,
    leatherworking,
    [
      [resilientLeather, 10],
      [denseHide, 3],
    ],
    45,
    "Leather Armor",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Legguards: 20 }],
      ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
    ]
  );
  const pioneersPracticedShouldersRecipe = await createRecipe(
    null,
    pioneersPracticedShoulders,
    1,
    leatherworking,
    [
      [resilientLeather, 16],
      [denseHide, 2],
    ],
    40,
    "Leather Armor",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Shoulderpads: 20 }],
      ["Curing Agent", { ShapedLeatherArmor: 30 }],
    ]
  );
  const pioneersPracticedGlovesRecipe = await createRecipe(
    null,
    pioneersPracticedGloves,
    1,
    leatherworking,
    [
      [resilientLeather, 16],
      [denseHide, 2],
    ],
    25,
    "Leather Armor",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Gloves: 20 }],
      ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
    ]
  );
  const pioneersPracticedBeltRecipe = await createRecipe(
    null,
    pioneersPracticedBelt,
    1,
    leatherworking,
    [
      [resilientLeather, 16],
      [denseHide, 2],
    ],
    20,
    "Leather Armor",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { BeltsLeather: 20 }],
      ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
    ]
  );
  const pioneersLeatherTunicRecipe = await createRecipe(
    null,
    pioneersLeatherTunic,
    1,
    leatherworking,
    [
      [resilientLeather, 25],
      [adamantScales, 15],
    ],
    10,
    "Leather Armor",
    3,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Chestpieces: 20 }],
      ["Curing Agent", { ShapedLeatherArmor: 30 }],
    ]
  );
  const pioneersLeatherBootsRecipe = await createRecipe(
    null,
    pioneersLeatherBoots,
    1,
    leatherworking,
    [
      [resilientLeather, 20],
      [adamantScales, 10],
    ],
    5,
    "Leather Armor",
    3,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { BootsLeather: 20 }],
      ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
    ]
  );
  const pioneersLeatherWristguardsRecipe = await createRecipe(
    null,
    pioneersLeatherWristguards,
    1,
    leatherworking,
    [
      [resilientLeather, 15],
      [adamantScales, 5],
    ],
    1,
    "Leather Armor",
    3,
    40,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Wristwraps: 20 }],
      ["Curing Agent", { ShapedLeatherArmor: 30 }],
    ]
  );
  const flameTouchedChainRecipe = await createRecipe(
    null,
    flameTouchedChain,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [crystalspineFur, 4],
      [earthshineScales, 14],
      [adamantScales, 150],
    ],
    null,
    "Mail Armor",
    1,
    280,
    null,
    { BeltsMail: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Illustrious Insight", { BeltsMail: 20 }],
      ["Chain Oil", { IntricateMail: 30 }],
    ]
  );
  const flameTouchedChainmailRecipe = await createRecipe(
    null,
    flameTouchedChainmail,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [flawlessProtoDragonScale, 4],
      [stonecrustHide, 15],
      [adamantScales, 150],
    ],
    null,
    "Mail Armor",
    1,
    280,
    null,
    { MailShirts: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { LargeMail: 0 }],
      ["Illustrious Insight", { MailShirts: 20 }],
      ["Chain Oil", { LargeMail: 30 }],
    ]
  );
  const flameTouchedCuffsRecipe = await createRecipe(
    null,
    flameTouchedCuffs,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [windsongPlumage, 4],
      [earthshineScales, 10],
      [adamantScales, 150],
    ],
    null,
    "Mail Armor",
    1,
    280,
    null,
    { Bracers: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { LargeMail: 0 }],
      ["Illustrious Insight", { Bracers: 20 }],
      ["Chain Oil", { LargeMail: 30 }],
    ]
  );
  const flameTouchedHandguardsRecipe = await createRecipe(
    null,
    flameTouchedHandguards,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [rockfangLeather, 4],
      [earthshineScales, 13],
      [adamantScales, 150],
    ],
    null,
    "Mail Armor",
    1,
    280,
    null,
    { Gauntlets: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Illustrious Insight", { Gauntlets: 20 }],
      ["Chain Oil", { IntricateMail: 30 }],
    ]
  );
  const flameTouchedHelmetRecipe = await createRecipe(
    null,
    flameTouchedHelmet,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [cacophonousThunderscale, 4],
      [stonecrustHide, 15],
      [adamantScales, 150],
    ],
    null,
    "Mail Armor",
    1,
    280,
    null,
    { MailHelms: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { LargeMail: 0 }],
      ["Illustrious Insight", { MailHelms: 20 }],
      ["Chain Oil", { LargeMail: 30 }],
    ]
  );
  const flameTouchedLegguardsRecipe = await createRecipe(
    null,
    flameTouchedLegguards,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [cacophonousThunderscale, 4],
      [stonecrustHide, 15],
      [adamantScales, 150],
    ],
    null,
    "Mail Armor",
    1,
    280,
    null,
    { Greaves: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Illustrious Insight", { Greaves: 20 }],
      ["Chain Oil", { IntricateMail: 30 }],
    ]
  );
  const flameTouchedSpauldersRecipe = await createRecipe(
    null,
    flameTouchedSpaulders,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [windsongPlumage, 4],
      [earthshineScales, 13],
      [adamantScales, 150],
    ],
    null,
    "Mail Armor",
    1,
    280,
    null,
    { Shoulderguards: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { LargeMail: 0 }],
      ["Illustrious Insight", { Shoulderguards: 20 }],
      ["Chain Oil", { LargeMail: 30 }],
    ]
  );
  const flameTouchedTreadsRecipe = await createRecipe(
    null,
    flameTouchedTreads,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [crystalspineFur, 4],
      [earthshineScales, 13],
      [adamantScales, 150],
    ],
    null,
    "Mail Armor",
    1,
    280,
    null,
    { BootsMail: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Embellishment", {}],
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Illustrious Insight", { BootsMail: 20 }],
      ["Chain Oil", { IntricateMail: 30 }],
    ]
  );
  const trailblazersToughenedCoifRecipe = await createRecipe(
    null,
    trailblazersToughenedCoif,
    1,
    leatherworking,
    [
      [adamantScales, 10],
      [lustrousScaledHide, 2],
    ],
    50,
    "Mail Armor",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { LargeMail: 0 }],
      ["Lesser Illustrious Insight", { MailHelms: 20 }],
      ["Chain Oil", { LargeMail: 30 }],
    ]
  );
  const trailblazersToughenedLegguardsRecipe = await createRecipe(
    null,
    trailblazersToughenedLegguards,
    1,
    leatherworking,
    [
      [adamantScales, 6],
      [lustrousScaledHide, 3],
    ],
    45,
    "Mail Armor",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Lesser Illustrious Insight", { Greaves: 20 }],
      ["Chain Oil", { IntricateMail: 30 }],
    ]
  );
  const trailblazersToughenedSpikesRecipe = await createRecipe(
    null,
    trailblazersToughenedSpikes,
    1,
    leatherworking,
    [
      [adamantScales, 16],
      [lustrousScaledHide, 2],
    ],
    40,
    "Mail Armor",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { LargeMail: 0 }],
      ["Lesser Illustrious Insight", { Shoulderguards: 20 }],
      ["Chain Oil", { LargeMail: 30 }],
    ]
  );
  const trailblazersToughenedGripsRecipe = await createRecipe(
    null,
    trailblazersToughenedGrips,
    1,
    leatherworking,
    [
      [adamantScales, 16],
      [lustrousScaledHide, 2],
    ],
    25,
    "Mail Armor",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Lesser Illustrious Insight", { Gauntlets: 20 }],
      ["Chain Oil", { IntricateMail: 30 }],
    ]
  );
  const trailblazersToughenedChainbeltRecipe = await createRecipe(
    null,
    trailblazersToughenedChainbelt,
    1,
    leatherworking,
    [
      [adamantScales, 16],
      [lustrousScaledHide, 2],
    ],
    20,
    "Mail Armor",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Lesser Illustrious Insight", { BeltsMail: 20 }],
      ["Chain Oil", { IntricateMail: 30 }],
    ]
  );
  const trailblazersScaleVestRecipe = await createRecipe(
    null,
    trailblazersScaleVest,
    1,
    leatherworking,
    [
      [adamantScales, 25],
      [resilientLeather, 15],
    ],
    10,
    "Mail Armor",
    3,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { LargeMail: 0 }],
      ["Lesser Illustrious Insight", { MailShirts: 20 }],
      ["Chain Oil", { LargeMail: 30 }],
    ]
  );
  const trailblazersScaleBootsRecipe = await createRecipe(
    null,
    trailblazersScaleVest,
    1,
    leatherworking,
    [
      [adamantScales, 20],
      [resilientLeather, 10],
    ],
    5,
    "Mail Armor",
    3,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Lesser Illustrious Insight", { BootsMail: 20 }],
      ["Chain Oil", { IntricateMail: 30 }],
    ]
  );
  const trailblazersScaleBracersRecipe = await createRecipe(
    null,
    trailblazersScaleBracers,
    1,
    leatherworking,
    [
      [adamantScales, 15],
      [resilientLeather, 5],
    ],
    1,
    "Mail Armor",
    3,
    40,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { LargeMail: 0 }],
      ["Lesser Illustrious Insight", { Bracers: 20 }],
      ["Chain Oil", { LargeMail: 30 }],
    ]
  );
  const expertAlchemistsHatRecipe = await createRecipe(
    null,
    expertAlchemistsHat,
    1,
    leatherworking,
    [
      [artisansMettle, 225],
      [awakenedAir, 12],
      [frostbiteScales, 8],
      [resilientLeather, 80],
    ],
    null,
    "Profession Equipment",
    1,
    275,
    { MaruukCentaur: 18 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [["Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const expertSkinnersCapRecipe = await createRecipe(
    null,
    expertSkinnersCap,
    1,
    leatherworking,
    [
      [artisansMettle, 225],
      [windsongPlumage, 4],
      [tuftOfPrimalWool, 2],
      [earthshineScales, 10],
      [resilientLeather, 80],
    ],
    null,
    "Profession Equipment",
    1,
    275,
    { IskaaraTuskarr: 18 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [["Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const flameproofApronRecipe = await createRecipe(
    null,
    flameproofApron,
    1,
    leatherworking,
    [
      [artisansMettle, 225],
      [flawlessProtoDragonScale, 10],
      [stonecrustHide, 8],
      [adamantScales, 80],
    ],
    null,
    "Profession Equipment",
    1,
    275,
    { MaruukCentaur: 18 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [["Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const lavishFloralPackRecipe = await createRecipe(
    null,
    lavishFloralPack,
    1,
    leatherworking,
    [
      [artisansMettle, 225],
      [crystalspineFur, 15],
      [mireslushHide, 10],
      [resilientLeather, 60],
      [omniumDraconis, 5],
    ],
    null,
    "Profession Equipment",
    1,
    275,
    { IskaaraTuskarr: 18 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [["Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const masterworkSmockRecipe = await createRecipe(
    null,
    masterworkSmock,
    1,
    leatherworking,
    [
      [artisansMettle, 225],
      [crystalspineFur, 15],
      [mireslushHide, 10],
      [resilientLeather, 80],
    ],
    null,
    "Profession Equipment",
    1,
    275,
    { MaruukCentaur: 18 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [["Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const reinforcedPackRecipe = await createRecipe(
    null,
    reinforcedPack,
    1,
    leatherworking,
    [
      [artisansMettle, 225],
      [pristineVorquinHorn, 15],
      [earthshineScales, 10],
      [resilientLeather, 80],
    ],
    null,
    "Profession Equipment",
    1,
    275,
    { MaruukCentaur: 18 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [["Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const resplendentCoverRecipe = await createRecipe(
    null,
    resplendentCover,
    1,
    leatherworking,
    [
      [artisansMettle, 225],
      [salamantherScales, 20],
      [stonecrustHide, 10],
      [resilientLeather, 80],
    ],
    null,
    "Profession Equipment",
    1,
    275,
    { IskaaraTuskarr: 18 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [["Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const shockproofGlovesRecipe = await createRecipe(
    null,
    shockproofGloves,
    1,
    leatherworking,
    [
      [artisansMettle, 225],
      [rockfangLeather, 15],
      [earthshineScales, 10],
      [adamantScales, 80],
    ],
    null,
    "Profession Equipment",
    1,
    275,
    { IskaaraTuskarr: 18 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [["Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const alchemistsHatRecipe = await createRecipe(
    null,
    alchemistsHat,
    1,
    leatherworking,
    [
      [lustrousScaledHide, 2],
      [resilientLeather, 10],
    ],
    35,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const smithingApronRecipe = await createRecipe(
    null,
    smithingApron,
    1,
    leatherworking,
    [
      [denseHide, 2],
      [adamantScales, 10],
    ],
    35,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const jewelersCoverRecipe = await createRecipe(
    null,
    jewelersCover,
    1,
    leatherworking,
    [
      [denseHide, 2],
      [resilientLeather, 10],
    ],
    30,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const protectiveGlovesRecipe = await createRecipe(
    null,
    protectiveGloves,
    1,
    leatherworking,
    [
      [lustrousScaledHide, 2],
      [adamantScales, 10],
    ],
    30,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const durablePackRecipe = await createRecipe(
    null,
    durablePack,
    1,
    leatherworking,
    [
      [resilientLeather, 20],
      [denseHide, 1],
    ],
    15,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const floralBasketRecipe = await createRecipe(
    null,
    floralBasket,
    1,
    leatherworking,
    [
      [denseHide, 2],
      [resilientLeather, 5],
      [hochenblume, 5],
    ],
    10,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const skinnersCapRecipe = await createRecipe(
    null,
    skinnersCap,
    1,
    leatherworking,
    [
      [resilientLeather, 30],
      [lustrousScaledHide, 1],
    ],
    5,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const resilientSmockRecipe = await createRecipe(
    null,
    resilientSmock,
    1,
    leatherworking,
    [
      [resilientLeather, 20],
      [adamantScales, 10],
    ],
    1,
    "Profession Equipment",
    3,
    80,
    null,
    null,
    null,
    null,
    "Learned by default.",
    [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  );
  const bonewroughtCrossbowRecipe = await createRecipe(
    null,
    bonewroughtCrossbow,
    1,
    leatherworking,
    [
      [pristineVorquinHorn, 2],
      [runedWrithebark, 1],
      [resilientLeather, 20],
    ],
    35,
    "Weapons",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", {}],
      ["Lesser Illustrious Insight", { BondingAndStitching: 25 }],
    ]
  );
  const ancestorsDewDrippersRecipe = await createRecipe(
    null,
    ancestorsDewDrippers,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [crystalspineFur, 10],
      [mireslushHide, 18],
      [adamantScales, 150],
    ],
    null,
    "Elemental Patterns",
    1,
    415,
    { MaruukCentaur: 13 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Illustrious Insight", { Shoulderguards: 20, ElementalMastery: 25 }],
      ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const flaringCowlRecipe = await createRecipe(
    null,
    flaringCowl,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [fierySoul, 1],
      [awakenedFire, 10],
      [earthshineScales, 16],
      [resilientLeather, 100],
    ],
    null,
    "Elemental Patterns",
    1,
    415,
    null,
    { ElementalMastery: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Illustrious Insight", { Helms: 20, ElementalMastery: 25 }],
      [
        "Curing Agent",
        { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const oldSpiritsWristwrapsRecipe = await createRecipe(
    null,
    oldSpiritsWristwraps,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [rockfangLeather, 10],
      [mireslushHide, 16],
      [resilientLeather, 150],
    ],
    null,
    "Elemental Patterns",
    1,
    415,
    null,
    null,
    "Raid Drop",
    "Leatherworker's Tool Bench",
    "Drops from bosses in Vault of the Incarnates.",
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Illustrious Insight", { Wristwraps: 20, ElementalMastery: 25 }],
      [
        "Curing Agent",
        { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const scaleReinGripsRecipe = await createRecipe(
    null,
    scaleReinGrips,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [salamantherScales, 12],
      [earthshineScales, 18],
      [adamantScales, 150],
    ],
    null,
    "Elemental Patterns",
    1,
    415,
    null,
    null,
    "Raid Drop",
    "Leatherworker's Tool Bench",
    "Drops from bosses in Vault of the Incarnates.",
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Illustrious Insight", { Gauntlets: 20, ElementalMastery: 25 }],
      ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const snowballMakersRecipe = await createRecipe(
    null,
    snowballMakers,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [crystalspineFur, 10],
      [frostbiteScales, 20],
      [resilientLeather, 150],
    ],
    null,
    "Elemental Patterns",
    1,
    415,
    { IskaaraTuskarr: 15 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Illustrious Insight", { Gloves: 20, ElementalMastery: 25 }],
      [
        "Curing Agent",
        { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const stringOfSpiritualKnickKnacksRecipe = await createRecipe(
    null,
    stringOfSpiritualKnickKnacks,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [salamantherScales, 10],
      [mireslushHide, 20],
      [resilientLeather, 150],
    ],
    null,
    "Elemental Patterns",
    1,
    415,
    null,
    null,
    "Raid Drop",
    "Leatherworker's Tool Bench",
    "Drops from bosses in Vault of the Incarnates.",
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Illustrious Insight", { BeltsLeather: 20, ElementalMastery: 25 }],
      [
        "Curing Agent",
        { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const windSpiritsLassoRecipe = await createRecipe(
    null,
    windSpiritsLasso,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [awakenedAir, 10],
      [mireslushHide, 16],
      [adamantScales, 150],
    ],
    null,
    "Elemental Patterns",
    1,
    415,
    null,
    null,
    "Raid Drop",
    "Leatherworker's Tool Bench",
    "Drops from bosses in Vault of the Incarnates.",
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Illustrious Insight", { BeltsMail: 20, ElementalMastery: 25 }],
      ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const alliedHeartwarmingFurCoatRecipe = await createRecipe(
    null,
    alliedHeartwarmingFurCoat,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [fireInfusedHide, 10],
      [tuftOfPrimalWool, 3],
      [frostbiteScales, 20],
      [resilientLeather, 150],
    ],
    null,
    "Bestial Patterns",
    1,
    415,
    { IskaaraTuskarr: 15 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Illustrious Insight", { Chestpieces: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const alliedLegguardsOfSansokKhanRecipe = await createRecipe(
    null,
    alliedLegguardsOfSansokKhan,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [centaursTrophyNecklace, 1],
      [earthshineScales, 20],
      [adamantScales, 150],
    ],
    null,
    "Bestial Patterns",
    1,
    450,
    { MaruukCentaur: 13 },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Illustrious Insight", { Greaves: 20, BestialPrimacy: 25 }],
      ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const bowOfTheDragonHuntersRecipe = await createRecipe(
    null,
    bowOfTheDragonHunters,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 2],
      [primalChaos, 160],
      [awakenedAir, 6],
      [tallstriderSinew, 2],
      [mireslushHide, 10],
      [runedWrithebark, 2],
    ],
    null,
    "Bestial Patterns",
    1,
    280,
    null,
    { BestialPrimacy: 0 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      ["Primal Infusion", {}],
      ["Missive - Combat", {}],
      ["Embellishment", {}],
      ["Illustrious Insight", { BondingAndStitching: 25, BestialPrimacy: 25 }],
    ]
  );
  const infuriousBootsOfReprieveRecipe = await createRecipe(
    null,
    infuriousBootsOfReprieve,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [centaursTrophyNecklace, 1],
      [infuriousHide, 16],
      [adamantScales, 100],
    ],
    null,
    "Bestial Patterns",
    1,
    415,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Illustrious Insight", { BootsMail: 20, BestialPrimacy: 25 }],
      ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const infuriousChainhelmProtectorRecipe = await createRecipe(
    null,
    infuriousChainhelmProtector,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [centaursTrophyNecklace, 1],
      [infuriousScales, 20],
      [adamantScales, 100],
    ],
    null,
    "Bestial Patterns",
    1,
    415,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Illustrious Insight", { MailHelms: 20, BestialPrimacy: 25 }],
      ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const infuriousFootwrapsOfIndemnityRecipe = await createRecipe(
    null,
    infuriousFootwrapsOfIndemnity,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [crystalspineFur, 8],
      [infuriousScales, 16],
      [resilientLeather, 100],
    ],
    null,
    "Bestial Patterns",
    1,
    415,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Illustrious Insight", { BootsLeather: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const infuriousSpiritsHoodRecipe = await createRecipe(
    null,
    infuriousSpiritsHood,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [fireInfusedHide, 8],
      [infuriousHide, 20],
      [resilientLeather, 100],
    ],
    null,
    "Bestial Patterns",
    1,
    415,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Illustrious Insight", { Helms: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const crimsonCombatantsAdamantChainmailRecipe = await createRecipe(
    null,
    crimsonCombatantsAdamantChainmail,
    1,
    leatherworking,
    [
      [cacophonousThunderscale, 2],
      [infuriousScales, 1],
      [adamantScales, 15],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { LargeMail: 0 }],
      ["Lesser Illustrious Insight", { MailShirts: 20, BestialPrimacy: 25 }],
      ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const crimsonCombatantsAdamantCowlRecipe = await createRecipe(
    null,
    crimsonCombatantsAdamantCowl,
    1,
    leatherworking,
    [
      [windsongPlumage, 2],
      [infuriousScales, 1],
      [adamantScales, 15],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { LargeMail: 0 }],
      ["Lesser Illustrious Insight", { MailHelms: 20, BestialPrimacy: 25 }],
      ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const crimsonCombatantsAdamantCuffsRecipe = await createRecipe(
    null,
    crimsonCombatantsAdamantCuffs,
    1,
    leatherworking,
    [
      [crystalspineFur, 2],
      [infuriousScales, 1],
      [adamantScales, 10],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { LargeMail: 0 }],
      ["Lesser Illustrious Insight", { Bracers: 20, BestialPrimacy: 25 }],
      ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const crimsonCombatantsAdamantEpaulettesRecipe = await createRecipe(
    null,
    crimsonCombatantsAdamantEpaulettes,
    1,
    leatherworking,
    [
      [fireInfusedHide, 2],
      [infuriousScales, 1],
      [adamantScales, 12],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { LargeMail: 0 }],
      [
        "Lesser Illustrious Insight",
        { Shoulderguards: 20, BestialPrimacy: 25 },
      ],
      ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const crimsonCombatantsAdamantGauntletsRecipe = await createRecipe(
    null,
    crimsonCombatantsAdamantGauntlets,
    1,
    leatherworking,
    [
      [salamantherScales, 2],
      [infuriousScales, 1],
      [adamantScales, 12],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Lesser Illustrious Insight", { Gauntlets: 20, BestialPrimacy: 25 }],
      ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const crimsonCombatantsAdamantGirdleRecipe = await createRecipe(
    null,
    crimsonCombatantsAdamantGirdle,
    1,
    leatherworking,
    [
      [salamantherScales, 2],
      [infuriousScales, 1],
      [adamantScales, 10],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Lesser Illustrious Insight", { BeltsMail: 20, BestialPrimacy: 25 }],
      ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const crimsonCombatantsAdamantLeggingsRecipe = await createRecipe(
    null,
    crimsonCombatantsAdamantLeggings,
    1,
    leatherworking,
    [
      [rockfangLeather, 2],
      [infuriousScales, 1],
      [adamantScales, 15],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Lesser Illustrious Insight", { Greaves: 20, BestialPrimacy: 25 }],
      ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const crimsonCombatantsAdamantTreadsRecipe = await createRecipe(
    null,
    crimsonCombatantsAdamantTreads,
    1,
    leatherworking,
    [
      [crystalspineFur, 2],
      [infuriousScales, 1],
      [adamantScales, 12],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { IntricateMail: 0 }],
      ["Lesser Illustrious Insight", { BootsMail: 20, BestialPrimacy: 25 }],
      ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const crimsonCombatantsResilientBeltRecipe = await createRecipe(
    null,
    crimsonCombatantsResilientBelt,
    1,
    leatherworking,
    [
      [salamantherScales, 2],
      [infuriousHide, 1],
      [resilientLeather, 10],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { BeltsLeather: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const crimsonCombatantsResilientBootsRecipe = await createRecipe(
    null,
    crimsonCombatantsResilientBelt,
    1,
    leatherworking,
    [
      [crystalspineFur, 2],
      [infuriousHide, 1],
      [resilientLeather, 12],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { BootsLeather: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const crimsonCombatantsResilientChestpieceRecipe = await createRecipe(
    null,
    crimsonCombatantsResilientChestpiece,
    1,
    leatherworking,
    [
      [cacophonousThunderscale, 2],
      [infuriousHide, 1],
      [resilientLeather, 15],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Chestpieces: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const crimsonCombatantsResilientGlovesRecipe = await createRecipe(
    null,
    crimsonCombatantsResilientGloves,
    1,
    leatherworking,
    [
      [salamantherScales, 2],
      [infuriousHide, 1],
      [resilientLeather, 12],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Gloves: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const crimsonCombatantsResilientMaskRecipe = await createRecipe(
    null,
    crimsonCombatantsResilientMask,
    1,
    leatherworking,
    [
      [windsongPlumage, 2],
      [infuriousHide, 1],
      [resilientLeather, 15],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Helms: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const crimsonCombatantsResilientShoulderpadsRecipe = await createRecipe(
    null,
    crimsonCombatantsResilientShoulderpads,
    1,
    leatherworking,
    [
      [fireInfusedHide, 2],
      [infuriousHide, 1],
      [resilientLeather, 12],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Shoulderpads: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const crimsonCombatantsResilientTrousersRecipe = await createRecipe(
    null,
    crimsonCombatantsResilientTrousers,
    1,
    leatherworking,
    [
      [rockfangLeather, 2],
      [infuriousHide, 1],
      [resilientLeather, 15],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { EmbroideredLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Legguards: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const crimsonCombatantsResilientWristwrapsRecipe = await createRecipe(
    null,
    crimsonCombatantsResilientWristwraps,
    1,
    leatherworking,
    [
      [crystalspineFur, 2],
      [infuriousHide, 1],
      [resilientLeather, 10],
    ],
    null,
    "Bestial Patterns",
    1,
    120,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { ShapedLeatherArmor: 0 }],
      ["Lesser Illustrious Insight", { Wristwraps: 20, BestialPrimacy: 25 }],
      [
        "Curing Agent",
        { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const acidicHailstoneTreadsRecipe = await createRecipe(
    null,
    acidicHailstoneTreads,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [rockfangLeather, 12],
      [frostbiteScales, 18],
      [adamantScales, 150],
    ],
    null,
    "Decayed Patterns",
    1,
    415,
    null,
    null,
    "Dungeon Drop",
    "Altar of Decay",
    "Drops from Decayed Creates in Brackenhide Hollow.",
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Illustrious Insight", { BootsMail: 20, DecayingGrasp: 25 }],
      ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const slimyExpulsionBootsRecipe = await createRecipe(
    null,
    slimyExpulsionBoots,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [salamantherScales, 10],
      [stonecrustHide, 18],
      [resilientLeather, 150],
    ],
    null,
    "Decayed Patterns",
    1,
    415,
    null,
    null,
    "Dungeon Drop",
    "Altar of Decay",
    "Drops from Decayed Creates in Brackenhide Hollow.",
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Illustrious Insight", { BootsLeather: 20, DecayingGrasp: 25 }],
      [
        "Curing Agent",
        { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const toxicThornFootwrapsRecipe = await createRecipe(
    null,
    toxicThornFootwraps,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [cacophonousThunderscale, 6],
      [frostbiteScales, 18],
      [resilientLeather, 150],
    ],
    null,
    "Decayed Patterns",
    1,
    415,
    null,
    null,
    "Dungeon Drop",
    "Altar of Decay",
    "Drops from Decayed Creates in Brackenhide Hollow.",
    [
      ["Primal Infusion", { LeatherArmorCrafting: 0 }],
      ["Illustrious Insight", { BootsLeather: 20, DecayingGrasp: 25 }],
      [
        "Curing Agent",
        { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
      ],
    ]
  );
  const venomSteepedStompersRecipe = await createRecipe(
    null,
    venomSteepedStompers,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [cacophonousThunderscale, 6],
      [stonecrustHide, 18],
      [adamantScales, 150],
    ],
    null,
    "Decayed Patterns",
    1,
    415,
    null,
    null,
    "Dungeon Drop",
    "Altar of Decay",
    "Drops from Decayed Creates in Brackenhide Hollow.",
    [
      ["Primal Infusion", { MailArmorCrafting: 0 }],
      ["Illustrious Insight", { BootsMail: 20, DecayingGrasp: 25 }],
      ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
    ]
  );
  const witherrotTomeRecipe = await createRecipe(
    null,
    witherrotTome,
    1,
    leatherworking,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [awakenedDecay, 15],
      [tallstriderSinew, 2],
      [stonecrustHide, 14],
      [resilientLeather, 100],
    ],
    null,
    "Decayed Patterns",
    1,
    300,
    null,
    { DecayingGrasp: 0 },
    null,
    "Altar of Decay",
    null,
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DecayingGrasp: 25 }],
    ]
  );
  const finishedPrototypeExplorersBardingRecipe = await createRecipe(
    null,
    finishedPrototypeExplorersBarding,
    1,
    leatherworking,
    [
      [prototypeExplorersBardingFramework, 1],
      [tuftOfPrimalWool, 1],
      [lustrousScaledHide, 6],
      [resilientLeather, 80],
    ],
    null,
    "Reagents",
    1,
    null,
    { MaruukCentaur: 22 },
    null,
    null,
    "Leatherworker's Tool Bench"
  );
  const finishedPrototypeRegalBardingRecipe = await createRecipe(
    null,
    finishedPrototypeExplorersBarding,
    1,
    leatherworking,
    [
      [prototypeRegalBardingFramework, 1],
      [tuftOfPrimalWool, 1],
      [lustrousScaledHide, 6],
      [resilientLeather, 80],
    ],
    null,
    "Reagents",
    1,
    null,
    { IskaaraTuskarr: 29 },
    null,
    null,
    "Leatherworker's Tool Bench"
  );
  const earthshineScalesRecipe = await createRecipe(
    null,
    earthshineScales,
    2,
    leatherworking,
    [
      [awakenedEarth, 1],
      [awakenedFrost, 1],
      [lustrousScaledHide, 2],
    ],
    25,
    "Reagents",
    1,
    375,
    null,
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      [
        "Lesser Illustrious Insight",
        { CuringAndTanning: 25, ElementalMastery: 25 },
      ],
    ]
  );
  const frostbiteScalesRecipe = await createRecipe(
    null,
    frostbiteScales,
    2,
    leatherworking,
    [
      [awakenedFrost, 1],
      [awakenedDecay, 1],
      [lustrousScaledHide, 2],
    ],
    25,
    "Reagents",
    1,
    375,
    null,
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      [
        "Lesser Illustrious Insight",
        { CuringAndTanning: 25, DecayingGrasp: 25 },
      ],
    ]
  );
  const infuriousHideRecipe = await createRecipe(
    null,
    infuriousHide,
    2,
    leatherworking,
    [
      [awakenedIre, 2],
      [denseHide, 2],
    ],
    null,
    "Reagents",
    1,
    375,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      [
        "Lesser Illustrious Insight",
        { CuringAndTanning: 25, BestialPrimacy: 25 },
      ],
    ]
  );
  const infuriousScalesRecipe = await createRecipe(
    null,
    infuriousScales,
    2,
    leatherworking,
    [
      [awakenedIre, 2],
      [lustrousScaledHide, 2],
    ],
    null,
    "Reagents",
    1,
    375,
    null,
    null,
    "PvP Victory",
    "Leatherworker's Tool Bench",
    "Received from Arena, BGs, or WM?",
    [
      [
        "Lesser Illustrious Insight",
        { CuringAndTanning: 25, BestialPrimacy: 25 },
      ],
    ]
  );
  const mireslushHideRecipe = await createRecipe(
    null,
    mireslushHide,
    2,
    leatherworking,
    [
      [awakenedEarth, 1],
      [awakenedFrost, 1],
      [denseHide, 2],
    ],
    25,
    "Reagents",
    1,
    375,
    null,
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      [
        "Lesser Illustrious Insight",
        { CuringAndTanning: 25, ElementalMastery: 25 },
      ],
    ]
  );
  const stonecrustHideRecipe = await createRecipe(
    null,
    stonecrustHide,
    2,
    leatherworking,
    [
      [awakenedDecay, 1],
      [awakenedEarth, 1],
      [denseHide, 2],
    ],
    25,
    "Reagents",
    1,
    375,
    null,
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [
      [
        "Lesser Illustrious Insight",
        { CuringAndTanning: 25, DecayingGrasp: 25 },
      ],
    ]
  );
  const fangAdornmentsRecipe = await createRecipe(
    null,
    fangAdornments,
    1,
    leatherworking,
    [
      [rockfangLeather, 2],
      [pristineVorquinHorn, 2],
      [aquaticMaw, 1],
      [mastodonTusk, 1],
      [earthshineScales, 3],
      [resilientLeather, 60],
    ],
    null,
    "Optional Reagents",
    1,
    350,
    null,
    { BestialPrimacy: 20 },
    null,
    "Leatherworker's Tool Bench",
    null,
    [["Lesser Illustrious Insight", { BestialPrimacy: 25 }]]
  );
  const toxifiedArmorPatchRecipe = await createRecipe(
    null,
    toxifiedArmorPatch,
    1,
    leatherworking,
    [
      [awakenedDecay, 8],
      [stonecrustHide, 2],
      [adamantScales, 60],
    ],
    null,
    "Optional Reagents",
    1,
    350,
    null,
    { DecayingGrasp: 20 },
    null,
    "Altar of Decay",
    null,
    [["Lesser Illustrious Insight", { DecayingGrasp: 25 }]]
  );
  const illustriousInsightRecipeLeatherworking = await createRecipe(
    "Illustrious Insight",
    illustriousInsight,
    1,
    leatherworking,
    [[artisansMettle, 50]],
    null,
    "Finishing Reagents",
    1,
    null,
    null,
    null,
    "Various Specializations",
    "Leatherworker's Tool Bench"
  );
  const fierceArmorKitRecipe = await createRecipe(
    null,
    fierceArmorKit,
    1,
    leatherworking,
    [
      [awakenedEarth, 10],
      [stonecrustHide, 4],
      [resilientLeather, 60],
    ],
    null,
    "Armor Kits",
    1,
    375,
    null,
    null,
    "World Drop",
    "Leatherworker's Tool Bench",
    "Received from Maruuk Centaur Hunts.",
    [["Illustrious Insight", { CuringAndTanning: 25, BestialPrimacy: 25 }]]
  );
  const frostedArmorKitRecipe = await createRecipe(
    null,
    frostedArmorKit,
    1,
    leatherworking,
    [
      [awakenedFrost, 10],
      [frostbiteScales, 4],
      [adamantScales, 60],
    ],
    null,
    "Armor Kits",
    1,
    375,
    { CobaltAssembly: "High" },
    null,
    null,
    "Leatherworker's Tool Bench",
    null,
    [["Illustrious Insight", { CuringAndTanning: 25, ElementalMastery: 25 }]]
  );
  const reinforcedArmorKitRecipe = await createRecipe(
    null,
    reinforcedArmorKit,
    1,
    leatherworking,
    [
      [cacophonousThunderscale, 2],
      [denseHide, 1],
      [resilientLeather, 50],
    ],
    10,
    "Armor Kits",
    1,
    150,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { CuringAndTanning: 25 }]]
  );
  const feralHideDrumsRecipe = await createRecipe(
    null,
    feralHideDrums,
    1,
    leatherworking,
    [
      [denseHide, 1],
      [resilientLeather, 10],
    ],
    15,
    "Drums",
    1
  );
  const artisansSignRecipe = await createRecipe(
    null,
    artisansSign,
    1,
    leatherworking,
    [
      [pentagoldSeal, 4],
      [rockfangLeather, 5],
      [denseHide, 2],
      [runedWrithebark, 4],
    ],
    null,
    "Toys",
    1,
    null,
    { ArtisansConsortium: "Esteemed" },
    null,
    null,
    "Leatherworker's Tool Bench"
  );
  const gnollTentRecipe = await createRecipe(
    null,
    gnollTent,
    1,
    leatherworking,
    [
      [primalBearSpine, 1],
      [denseHide, 20],
      [lustrousScaledHide, 15],
      [resilientLeather, 200],
    ],
    null,
    "Toys",
    1,
    null,
    null,
    null,
    "World Drop",
    "Leatherworker's Tool Bench",
    "Drops from Gnolls."
  );
  const tuskarrBeanBagRecipe = await createRecipe(
    null,
    tuskarrBeanBag,
    1,
    leatherworking,
    [
      [contouredFowlfeather, 100],
      [denseHide, 30],
      [resilientLeather, 200],
    ],
    null,
    "Toys",
    1,
    null,
    { IskaaraTuskarr: 23 },
    null,
    null,
    "Leatherworker's Tool Bench"
  );

  //tailoring recipes - 80 total
  // const dragonIslesUnraveling = await(createRecipe("Dragon Isles Unraveling", spoolOfWilderthread, "1-5", tailoring, [[tatteredWildercloth, 5]], 1, "Tailoring Essentials", 1, 225));
  const azureweaveBoltRecipe = await createRecipe(
    null,
    azureweaveBolt,
    1,
    tailoring,
    [
      [awakenedFrost, 1],
      [awakenedOrder, 1],
      [vibrantWilderclothBolt, 3],
    ],
    null,
    "Woven Cloth",
    1,
    425,
    null,
    { AzureweaveTailoring: 0 },
    null,
    "Azure Loom",
    "Has a CD to craft. 10 crafts can be stored.",
    [["Lesser Illustrious Insight", { Textiles: 30, DraconicNeedlework: 15 }]]
  );
  const chronoclothBoltRecipe = await createRecipe(
    null,
    chronoclothBolt,
    1,
    tailoring,
    [
      [awakenedAir, 1],
      [awakenedOrder, 1],
      [vibrantWilderclothBolt, 3],
    ],
    null,
    "Woven Cloth",
    1,
    425,
    null,
    { ChronoclothTailoring: 0 },
    null,
    "Temporal Loom",
    "Has a CD to craft. 10 crafts can be stored.",
    [["Lesser Illustrious Insight", { Textiles: 30, DraconicNeedlework: 15 }]]
  );
  const vibrantWilderclothBoltRecipe = await createRecipe(
    null,
    vibrantWilderclothBolt,
    1,
    tailoring,
    [
      [vibrantShard, 1],
      [wildercloth, 3],
    ],
    25,
    "Woven Cloth",
    1,
    300,
    null,
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Lesser Illustrious Insight", { Textiles: 30 }]]
  );
  const infuriousWilderclothBoltRecipe = await createRecipe(
    null,
    infuriousWilderclothBolt,
    1,
    tailoring,
    [
      [awakenedIre, 3],
      [wildercloth, 3],
    ],
    null,
    "Woven Cloth",
    1,
    200,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [["Lesser Illustrious Insight", { Textiles: 30 }]]
  );
  const wilderclothBoltRecipe = await createRecipe(
    null,
    wilderclothBolt,
    1,
    tailoring,
    [[wildercloth, 3]],
    10,
    "Woven Cloth",
    1,
    60,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Textiles: 30 }]]
  );
  const blueSilkenLiningRecipe = await createRecipe(
    null,
    blueSilkenLining,
    1,
    tailoring,
    [
      [tuftOfPrimalWool, 1],
      [spoolOfWilderthread, 5],
      [azureweaveBolt, 1],
    ],
    null,
    "Optional Reagents",
    1,
    325,
    { CobaltAssembly: "Medium" },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Lesser Illustrious Insight", { Textiles: 30 }],
      ["Embroidery Thread", { Embroidery: 30 }],
    ]
  );
  const bronzedGripWrappingsRecipe = await createRecipe(
    null,
    bronzedGripWrappings,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 15],
      [chronoclothBolt, 1],
    ],
    null,
    "Optional Reagents",
    1,
    325,
    null,
    null,
    "Raid Drop",
    "Tailor's Work Table",
    "Drops from bosses in Vault of the Incarnates.",
    [
      ["Lesser Illustrious Insight", { Textiles: 30 }],
      ["Embroidery Thread", { Embroidery: 30 }],
    ]
  );
  const abrasivePolishingClothRecipe = await createRecipe(
    null,
    abrasivePolishingCloth,
    2,
    tailoring,
    [
      [fracturedGlass, 3],
      [wilderclothBolt, 1],
    ],
    45,
    "Finishing Reagents",
    1,
    200,
    null,
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Lesser Illustrious Insight", { Textiles: 30 }]]
  );
  const illustriousInsightRecipeTailoring = await createRecipe(
    "Illustrious Insight",
    illustriousInsight,
    1,
    tailoring,
    [[artisansMettle, 50]],
    null,
    "Finishing Reagents",
    1,
    null,
    null,
    null,
    "Various Specializations",
    "Tailor's Work Table"
  );
  const vibrantPolishingClothRecipe = await createRecipe(
    null,
    vibrantPolishingCloth,
    2,
    tailoring,
    [
      [spoolOfWilderthread, 1],
      [vibrantWilderclothBolt, 1],
    ],
    null,
    "Finishing Reagents",
    1,
    300,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Lesser Illustrious Insight", { Textiles: 30 }]]
  );
  const chromaticEmbroideryThreadRecipe = await createRecipe(
    null,
    chromaticEmbroideryThread,
    2,
    tailoring,
    [
      [chromaticDust, 5],
      [spoolOfWilderthread, 1],
    ],
    null,
    "Finishing Reagents",
    1,
    300,
    { ArtisansConsortium: "Valued" },
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Lesser Illustrious Insight", { Textiles: 30 }]]
  );
  const shimmeringEmbroideryThreadRecipe = await createRecipe(
    null,
    shimmeringEmbroideryThread,
    2,
    tailoring,
    [
      [spoolOfWilderthread, 1],
      [silkenGemdust, 1],
    ],
    null,
    "Finishing Reagents",
    1,
    300,
    null,
    null,
    "World Drop",
    "Tailor's Work Table",
    "Drops from creatures in any zone.",
    [["Lesser Illustrious Insight", { Textiles: 30 }]]
  );
  const blazingEmbroideryThreadRecipe = await createRecipe(
    null,
    blazingEmbroideryThread,
    2,
    tailoring,
    [
      [awakenedFire, 1],
      [spoolOfWilderthread, 1],
    ],
    25,
    "Finishing Reagents",
    1,
    200,
    null,
    null,
    null,
    null,
    null,
    [["Lesser Illustrious Insight", { Textiles: 30 }]]
  );
  const vibrantWilderclothGirdleRecipe = await createRecipe(
    null,
    vibrantWilderclothGirdle,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [spoolOfWilderthread, 6],
      [vibrantWilderclothBolt, 10],
    ],
    null,
    "Garments",
    1,
    280,
    null,
    { Belts: 0 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Missive - Combat", { Embellishments: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { Belts: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const vibrantWilderclothHandwrapsRecipe = await createRecipe(
    null,
    vibrantWilderclothHandwraps,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [spoolOfWilderthread, 8],
      [vibrantWilderclothBolt, 10],
    ],
    null,
    "Garments",
    1,
    280,
    null,
    { Gloves: 0 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Missive - Combat", { Outerwear: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { Gloves: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const vibrantWilderclothHeadcoverRecipe = await createRecipe(
    null,
    vibrantWilderclothHeadcover,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [spoolOfWilderthread, 10],
      [vibrantWilderclothBolt, 12],
    ],
    null,
    "Garments",
    1,
    280,
    null,
    { Hats: 0 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Missive - Combat", { Outerwear: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const vibrantWilderclothShawlRecipe = await createRecipe(
    null,
    vibrantWilderclothShawl,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [spoolOfWilderthread, 6],
      [vibrantWilderclothBolt, 8],
    ],
    null,
    "Garments",
    1,
    280,
    null,
    { Cloaks: 0 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Missive - Combat", { Outerwear: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { Cloaks: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const vibrantWilderclothShoulderspikesRecipe = await createRecipe(
    null,
    vibrantWilderclothShoulderspikes,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [spoolOfWilderthread, 8],
      [vibrantWilderclothBolt, 10],
    ],
    null,
    "Garments",
    1,
    280,
    null,
    { Mantles: 0 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Missive - Combat", { Embellishments: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { Mantles: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const vibrantWilderclothSlacksRecipe = await createRecipe(
    null,
    vibrantWilderclothSlacks,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [spoolOfWilderthread, 10],
      [vibrantWilderclothBolt, 12],
    ],
    null,
    "Garments",
    1,
    280,
    null,
    { Leggings: 0 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Missive - Combat", { Outfits: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { Leggings: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const vibrantWilderclothSlippersRecipe = await createRecipe(
    null,
    vibrantWilderclothSlippers,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [spoolOfWilderthread, 8],
      [vibrantWilderclothBolt, 10],
    ],
    null,
    "Garments",
    1,
    280,
    null,
    { Footwear: 0 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Missive - Combat", { Outerwear: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { Footwear: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const vibrantWilderclothVestmentsRecipe = await createRecipe(
    null,
    vibrantWilderclothVestments,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [spoolOfWilderthread, 10],
      [vibrantWilderclothBolt, 12],
    ],
    null,
    "Garments",
    1,
    280,
    null,
    { Robes: 0 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Missive - Combat", { Outfits: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { Robes: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const vibrantWilderclothWristwrapsRecipe = await createRecipe(
    null,
    vibrantWilderclothWristwraps,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [spoolOfWilderthread, 6],
      [vibrantWilderclothBolt, 8],
    ],
    null,
    "Garments",
    1,
    280,
    null,
    { Armbands: 0 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Missive - Combat", { Embellishments: 0 }],
      ["Embellishment", {}],
      ["Illustrious Insight", { Armbands: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const surveyorsSeasonedHoodRecipe = await createRecipe(
    null,
    surveyorsSeasonedHood,
    1,
    tailoring,
    [
      [wildercloth, 10],
      [spoolOfWilderthread, 7],
    ],
    50,
    "Garments",
    2,
    60,
    null,
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Outerwear: 0 }],
      ["Lesser Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const surveyorsSeasonedPantsRecipe = await createRecipe(
    null,
    surveyorsSeasonedPants,
    1,
    tailoring,
    [
      [wildercloth, 10],
      [spoolOfWilderthread, 7],
    ],
    45,
    "Garments",
    2,
    60,
    null,
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Outfits: 0 }],
      ["Lesser Illustrious Insight", { Leggings: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const surveyorsSeasonedShouldersRecipe = await createRecipe(
    null,
    surveyorsSeasonedShoulders,
    1,
    tailoring,
    [
      [wildercloth, 8],
      [spoolOfWilderthread, 6],
    ],
    40,
    "Garments",
    2,
    60,
    null,
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Embellishments: 0 }],
      ["Lesser Illustrious Insight", { Mantles: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const crimsonCombatantsWilderclothBandsRecipe = await createRecipe(
    null,
    crimsonCombatantsWilderclothBands,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 3],
      [infuriousWilderclothBolt, 2],
    ],
    null,
    "Garments",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Embellishments: 0 }],
      ["Lesser Illustrious Insight", { Armbands: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const crimsonCombatantsWilderclothCloakRecipe = await createRecipe(
    null,
    crimsonCombatantsWilderclothCloak,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 4],
      [infuriousWilderclothBolt, 2],
    ],
    null,
    "Garments",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Outerwear: 0 }],
      ["Lesser Illustrious Insight", { Cloaks: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const crimsonCombatantsWilderclothGlovesRecipe = await createRecipe(
    null,
    crimsonCombatantsWilderclothGloves,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 4],
      [infuriousWilderclothBolt, 2],
    ],
    null,
    "Garments",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Outerwear: 0 }],
      ["Lesser Illustrious Insight", { Gloves: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const crimsonCombatantsWilderclothHoodRecipe = await createRecipe(
    null,
    crimsonCombatantsWilderclothHood,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 5],
      [infuriousWilderclothBolt, 2],
    ],
    null,
    "Garments",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Outerwear: 0 }],
      ["Lesser Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const crimsonCombatantsWilderclothLeggingsRecipe = await createRecipe(
    null,
    crimsonCombatantsWilderclothLeggings,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 5],
      [infuriousWilderclothBolt, 2],
    ],
    null,
    "Garments",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Outfits: 0 }],
      ["Lesser Illustrious Insight", { Leggings: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const crimsonCombatantsWilderclothSashRecipe = await createRecipe(
    null,
    crimsonCombatantsWilderclothSash,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 3],
      [infuriousWilderclothBolt, 2],
    ],
    null,
    "Garments",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Embellishments: 0 }],
      ["Lesser Illustrious Insight", { Belts: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const crimsonCombatantsWilderclothShoulderpadsRecipe = await createRecipe(
    null,
    crimsonCombatantsWilderclothShoulderpads,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 4],
      [infuriousWilderclothBolt, 2],
    ],
    null,
    "Garments",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Embellishments: 0 }],
      ["Lesser Illustrious Insight", { Mantles: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const crimsonCombatantsWilderclothTreadsRecipe = await createRecipe(
    null,
    crimsonCombatantsWilderclothTreads,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 4],
      [infuriousWilderclothBolt, 2],
    ],
    null,
    "Garments",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Outerwear: 0 }],
      ["Lesser Illustrious Insight", { Footwear: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const crimsonCombatantsWilderclothTunicRecipe = await createRecipe(
    null,
    crimsonCombatantsWilderclothTunic,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 5],
      [infuriousWilderclothBolt, 2],
    ],
    null,
    "Garments",
    2,
    120,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Missive - Combat", { Outfits: 0 }],
      ["Lesser Illustrious Insight", { Robes: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const surveyorsSeasonedGlovesRecipe = await createRecipe(
    null,
    surveyorsSeasonedGloves,
    1,
    tailoring,
    [
      [wildercloth, 8],
      [spoolOfWilderthread, 6],
    ],
    35,
    "Garments",
    2,
    60,
    null,
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Outerwear: 0 }],
      ["Lesser Illustrious Insight", { Gloves: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const surveyorsSeasonedCordRecipe = await createRecipe(
    null,
    surveyorsSeasonedCord,
    1,
    tailoring,
    [
      [wildercloth, 8],
      [spoolOfWilderthread, 6],
    ],
    30,
    "Garments",
    2,
    60,
    null,
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Embellishments: 0 }],
      ["Lesser Illustrious Insight", { Belts: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const surveyorsTailoredCloakRecipe = await createRecipe(
    null,
    surveyorsTailoredCloak,
    1,
    tailoring,
    [
      [wildercloth, 8],
      [spoolOfWilderthread, 6],
    ],
    20,
    "Garments",
    3,
    60,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Outerwear: 0 }],
      ["Lesser Illustrious Insight", { Cloaks: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const surveyorsClothRobeRecipe = await createRecipe(
    null,
    surveyorsClothRobe,
    1,
    tailoring,
    [
      [wildercloth, 8],
      [spoolOfWilderthread, 5],
    ],
    15,
    "Garments",
    3,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Outfits: 0 }],
      ["Lesser Illustrious Insight", { Robes: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const surveyorsClothTreadsRecipe = await createRecipe(
    null,
    surveyorsClothTreads,
    1,
    tailoring,
    [
      [wildercloth, 6],
      [spoolOfWilderthread, 5],
    ],
    10,
    "Garments",
    3,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Outerwear: 0 }],
      ["Lesser Illustrious Insight", { Footwear: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const surveyorsClothBandsRecipe = await createRecipe(
    null,
    surveyorsClothBands,
    1,
    tailoring,
    [
      [wildercloth, 4],
      [spoolOfWilderthread, 4],
    ],
    5,
    "Garments",
    3,
    40,
    null,
    null,
    null,
    null,
    null,
    [
      ["Training Matrix", {}],
      ["Missive - Combat", { Embellishments: 0 }],
      ["Lesser Illustrious Insight", { Armbands: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const amiceOfTheBlueRecipe = await createRecipe(
    null,
    amiceOfTheBlue,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [frostySoul, 1],
      [frozenSpellthread, 1],
      [azureweaveBolt, 3],
    ],
    null,
    "Azureweave Garments",
    1,
    400,
    null,
    null,
    "Dungeon Drop",
    "Tailor's Work Table",
    "Drops from Algeth'ar Academy & The Azure Vault.",
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Mantles: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const azureweaveMantleRecipe = await createRecipe(
    null,
    azureweaveMantle,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [frozenSpellthread, 1],
      [azureweaveBolt, 3],
    ],
    null,
    "Azureweave Garments",
    1,
    400,
    null,
    { AzureweaveTailoring: 10 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Mantles: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const azureweaveRobeRecipe = await createRecipe(
    null,
    azureweaveRobe,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [frozenSpellthread, 1],
      [azureweaveBolt, 4],
    ],
    null,
    "Azureweave Garments",
    1,
    400,
    null,
    { AzureweaveTailoring: 30 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Robes: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const azureweaveSlippersRecipe = await createRecipe(
    null,
    azureweaveSlippers,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [frozenSpellthread, 1],
      [azureweaveBolt, 3],
    ],
    null,
    "Azureweave Garments",
    1,
    400,
    { ValdrakkenAccord: 14 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Footwear: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const blueDragonSolesRecipe = await createRecipe(
    null,
    blueDragonSoles,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [frostySoul, 1],
      [frozenSpellthread, 1],
      [azureweaveBolt, 3],
    ],
    null,
    "Azureweave Garments",
    1,
    400,
    null,
    null,
    "Raid Drop",
    "Tailor's Work Table",
    "Drops from bosses in Vault of the Incarnates",
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Footwear: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const infuriousBindingOfGesticulationRecipe = await createRecipe(
    null,
    infuriousBindingOfGesticulation,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [tallstriderSinew, 2],
      [vibrantSpellthread, 1],
      [azureweaveBolt, 1],
      [infuriousWilderclothBolt, 16],
    ],
    null,
    "Azureweave Garments",
    1,
    400,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Belts: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const alliedWristguardsOfTimeDilationRecipe = await createRecipe(
    null,
    alliedWristguardsOfTimeDilation,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 30],
      [centaursTrophyNecklace, 1],
      [temporalSpellthread, 1],
      [chronoclothBolt, 2],
    ],
    null,
    "Chronocloth Garments",
    1,
    400,
    null,
    null,
    "Raid Drop",
    "Tailor's Work Table",
    "Drops from bosses in Vault of the Incarnates.",
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Armbands: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const chronoclothGlovesRecipe = await createRecipe(
    null,
    chronoclothGloves,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [temporalSpellthread, 1],
      [chronoclothBolt, 3],
    ],
    null,
    "Chronocloth Garments",
    1,
    400,
    { ChronoclothTailoring: 10 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Gloves: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const chronoclothLeggingsRecipe = await createRecipe(
    null,
    chronoclothLeggings,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [temporalSpellthread, 1],
      [chronoclothBolt, 4],
    ],
    null,
    "Chronocloth Garments",
    1,
    400,
    { ChronoclothTailoring: 30 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Leggings: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const chronoclothSashRecipe = await createRecipe(
    null,
    chronoclothSash,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 40],
      [temporalSpellthread, 1],
      [chronoclothBolt, 3],
    ],
    null,
    "Chronocloth Garments",
    1,
    400,
    null,
    { ValdrakkenAccord: 14 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Belts: 10 }],
      ["Embroidery Thread", { Embellishments: 40 }],
    ]
  );
  const hoodOfSurgingTimeRecipe = await createRecipe(
    null,
    hoodOfSurgingTime,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [airySoul, 1],
      [temporalSpellthread, 1],
      [chronoclothBolt, 4],
    ],
    null,
    "Chronocloth Garments",
    1,
    400,
    null,
    null,
    "Dungeon Drop",
    "Tailor's Work Table",
    "Drops from Algeth'ar Academy & Uldaman (new version).",
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const infuriousLegwrapsOfPossibilityRecipe = await createRecipe(
    null,
    infuriousLegwrapsOfPossibility,
    1,
    tailoring,
    [
      [sparkOfIngenuity, 1],
      [primalChaos, 50],
      [vibrantSpellthread, 1],
      [chronoclothBolt, 1],
      [infuriousWilderclothBolt, 20],
    ],
    null,
    "Chronocloth Garments",
    1,
    400,
    null,
    null,
    "PvP Victory",
    "Tailor's Work Table",
    "Received from Arena, BGs, or WM?",
    [
      ["Primal Infusion", {}],
      ["Illustrious Insight", { DraconicNeedlework: 15, Leggings: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const dragonclothTailoringVestmentsRecipe = await createRecipe(
    null,
    dragonclothTailoringVestments,
    1,
    tailoring,
    [
      [artisansMettle, 325],
      [vibrantSpellthread, 1],
      [chronoclothBolt, 3],
      [azureweaveBolt, 3],
    ],
    null,
    "Profession Garments",
    1,
    475,
    null,
    { Outfits: 20 },
    null,
    "Tailor's Work Table",
    null,
    [
      ["Illustrious Insight", { DraconicNeedlework: 15, Robes: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const mastersWilderclothAlchemistsRobeRecipe = await createRecipe(
    null,
    mastersWilderclothAlchemistsRobe,
    1,
    tailoring,
    [
      [artisansMettle, 225],
      [spoolOfWilderthread, 5],
      [vibrantWilderclothBolt, 6],
      [omniumDraconis, 10],
    ],
    null,
    "Profession Garments",
    1,
    400,
    { ValdrakkenAccord: 19 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Illustrious Insight", { Robes: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const mastersWilderclothChefsHatRecipe = await createRecipe(
    null,
    mastersWilderclothChefsHat,
    1,
    tailoring,
    [
      [artisansMettle, 225],
      [spoolOfWilderthread, 4],
      [vibrantWilderclothBolt, 6],
    ],
    null,
    "Profession Garments",
    1,
    400,
    { DragonscaleExpedition: 15 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const mastersWilderclothEnchantersHatRecipe = await createRecipe(
    null,
    mastersWilderclothEnchantersHat,
    1,
    tailoring,
    [
      [artisansMettle, 225],
      [resonantCrystal, 2],
      [spoolOfWilderthread, 5],
      [vibrantWilderclothBolt, 5],
    ],
    null,
    "Profession Garments",
    1,
    400,
    { ValdrakkenAccord: 19 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const mastersWilderclothFishingCapRecipe = await createRecipe(
    null,
    mastersWilderclothFishingCap,
    1,
    tailoring,
    [
      [rainbowPearl, 2],
      [spoolOfWilderthread, 5],
      [vibrantWilderclothBolt, 3],
    ],
    null,
    "Profession Garments",
    1,
    400,
    { DragonscaleExpedition: 15 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const mastersWilderclothGardeningHatRecipe = await createRecipe(
    null,
    mastersWilderclothGardeningHat,
    1,
    tailoring,
    [
      [artisansMettle, 225],
      [spoolOfWilderthread, 5],
      [vibrantWilderclothBolt, 6],
      [omniumDraconis, 4],
    ],
    null,
    "Profession Garments",
    1,
    400,
    { ValdrakkenAccord: 19 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const wilderclothEnchantersHatRecipe = await createRecipe(
    null,
    wilderclothEnchantersHat,
    1,
    tailoring,
    [
      [wildercloth, 3],
      [chromaticDust, 3],
      [spoolOfWilderthread, 4],
    ],
    35,
    "Profession Garments",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const wilderclothAlchemistsRobeRecipe = await createRecipe(
    null,
    wilderclothAlchemistsRobe,
    1,
    tailoring,
    [
      [wildercloth, 6],
      [spoolOfWilderthread, 4],
    ],
    30,
    "Profession Garments",
    2,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Robes: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const wilderclothFishingCapRecipe = await createRecipe(
    null,
    wilderclothFishingCap,
    1,
    tailoring,
    [
      [wildercloth, 5],
      [spoolOfWilderthread, 4],
    ],
    25,
    "Profession Garments",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const wilderclothChefsHatRecipe = await createRecipe(
    null,
    wilderclothChefsHat,
    1,
    tailoring,
    [
      [wildercloth, 5],
      [spoolOfWilderthread, 4],
    ],
    20,
    "Profession Garments",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const wilderclothGardeningHatRecipe = await createRecipe(
    null,
    wilderclothGardeningHat,
    1,
    tailoring,
    [
      [wildercloth, 5],
      [spoolOfWilderthread, 4],
      [hochenblume, 5],
    ],
    15,
    "Profession Garments",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Hats: 10 }],
      ["Embroidery Thread", { Outerwear: 50 }],
    ]
  );
  const wilderclothTailorsCoatRecipe = await createRecipe(
    null,
    wilderclothTailorsCoat,
    1,
    tailoring,
    [
      [wildercloth, 6],
      [spoolOfWilderthread, 4],
    ],
    5,
    "Profession Garments",
    3,
    80,
    null,
    null,
    null,
    null,
    null,
    [
      ["Lesser Illustrious Insight", { Robes: 10 }],
      ["Embroidery Thread", { Outfits: 40 }],
    ]
  );
  const frozenSpellthreadRecipe = await createRecipe(
    null,
    frozenSpellthread,
    1,
    tailoring,
    [
      [awakenedFrost, 1],
      [awakenedOrder, 2],
      [azureweaveBolt, 1],
    ],
    null,
    "Spellthread",
    1,
    425,
    { CobaltAssembly: "High" },
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Illustrious Insight", { Textiles: 30, DraconicNeedlework: 15 }]]
  );
  const temporalSpellthreadRecipe = await createRecipe(
    null,
    temporalSpellthread,
    1,
    tailoring,
    [
      [awakenedAir, 1],
      [awakenedOrder, 2],
      [chronoclothBolt, 1],
    ],
    null,
    "Spellthread",
    1,
    425,
    null,
    null,
    "World Drop",
    "Tailor's Work Table",
    "Drops from creatures in Thaldraszus.",
    [["Illustrious Insight", { Textiles: 30, DraconicNeedlework: 15 }]]
  );
  const vibrantSpellthreadRecipe = await createRecipe(
    null,
    vibrantSpellthread,
    1,
    tailoring,
    [
      [vibrantShard, 1],
      [vibrantWilderclothBolt, 2],
    ],
    50,
    "Spellthread",
    1,
    150,
    null,
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Lesser Illustrious Insight", { Textiles: 30 }]]
  );
  const azureweaveExpeditionPackRecipe = await createRecipe(
    null,
    azureweaveExpeditionPack,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 5],
      [azureweaveBolt, 3],
    ],
    null,
    "Embroidered Bags",
    1,
    null,
    { DragonscaleExpedition: 19 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Embroidery Thread", { Embroidery: 30 }]]
  );
  const chronoclothReagentBagRecipe = await createRecipe(
    null,
    chronoclothReagentBag,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 6],
      [chronoclothBolt, 6],
    ],
    null,
    "Embroidered Bags",
    1,
    null,
    { ValdrakkenAccord: 23 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Embroidery Thread", { Embroidery: 30 }]]
  );
  const wilderclothBagRecipe = await createRecipe(
    null,
    wilderclothBag,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 4],
      [wilderclothBolt, 12],
    ],
    40,
    "Embroidered Bags",
    2,
    null,
    null,
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Embroidery Thread", { Embroidery: 30 }]]
  );
  const simplyStitchedReagentBagRecipe = await createRecipe(
    null,
    simplyStitchedReagentBag,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 4],
      [wilderclothBolt, 8],
    ],
    10,
    "Embroidered Bags",
    2,
    null,
    null,
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Embroidery Thread", { Embroidery: 30 }]]
  );
  const explorersBannerOfGeologyRecipe = await createRecipe(
    null,
    explorersBannerOfGeology,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 2],
      [wilderclothBolt, 2],
      [elementalHarmony, 2],
    ],
    null,
    "Assorted Embroidery",
    1,
    325,
    { DragonscaleExpedition: 15 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Illustrious Insight", { Textiles: 30 }],
      ["Embroidery Thread", { Embroidery: 30 }],
    ]
  );
  const explorersBannerOfHerbologyRecipe = await createRecipe(
    null,
    explorersBannerOfHerbology,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 2],
      [vibrantWilderclothBolt, 7],
      [omniumDraconis, 12],
    ],
    null,
    "Assorted Embroidery",
    1,
    325,
    { DragonscaleExpedition: 15 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [
      ["Illustrious Insight", { Textiles: 30 }],
      ["Embroidery Thread", { Embroidery: 30 }],
    ]
  );
  const duckStuffedDuckLovieRecipe = await createRecipe(
    null,
    duckStuffedDuckLovie,
    1,
    tailoring,
    [
      [contouredFowlfeather, 75],
      [spoolOfWilderthread, 8],
      [vibrantWilderclothBolt, 6],
    ],
    null,
    "Assorted Embroidery",
    1,
    null,
    { DragonscaleExpedition: 21 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Embroidery Thread", { Embroidery: 30 }]]
  );
  const forlornFuneralPallRecipe = await createRecipe(
    null,
    forlornFuneralPall,
    1,
    tailoring,
    [
      [awakenedDecay, 5],
      [spoolOfWilderthread, 4],
      [vibrantWilderclothBolt, 12],
    ],
    null,
    "Assorted Embroidery",
    1,
    null,
    null,
    null,
    "World Drop",
    "Tailor's Work Table",
    "Drops from decayed creatures.",
    [["Embroidery Thread", { Embroidery: 30 }]]
  );
  const dragonscaleExpeditionsExpeditionTentRecipe = await createRecipe(
    null,
    dragonscaleExpeditionsExpeditionTent,
    1,
    tailoring,
    [
      [tallstriderSinew, 4],
      [spoolOfWilderthread, 20],
      [vibrantWilderclothBolt, 40],
    ],
    null,
    "Assorted Embroidery",
    1,
    null,
    { DragonscaleExpedition: 17 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Embroidery Thread", { Embroidery: 30 }]]
  );
  const coldCushionRecipe = await createRecipe(
    null,
    coldCushion,
    1,
    tailoring,
    [
      [contouredFowlfeather, 25],
      [iridescentPlume, 5],
      [spoolOfWilderthread, 5],
      [azureweaveBolt, 1],
    ],
    null,
    "Assorted Embroidery",
    1,
    null,
    { DragonscaleExpedition: 17 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Embroidery Thread", { Embroidery: 30 }]]
  );
  const cushionOfTimeTravelRecipe = await createRecipe(
    null,
    cushionOfTimeTravel,
    1,
    tailoring,
    [
      [contouredFowlfeather, 25],
      [iridescentPlume, 5],
      [spoolOfWilderthread, 5],
      [chronoclothBolt, 1],
    ],
    null,
    "Assorted Embroidery",
    1,
    null,
    { DragonscaleExpedition: 28 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Embroidery Thread", { Embroidery: 30 }]]
  );
  const marketTentRecipe = await createRecipe(
    null,
    marketTent,
    1,
    tailoring,
    [
      [spoolOfWilderthread, 20],
      [wilderclothBolt, 50],
    ],
    null,
    "Assorted Embroidery",
    1,
    null,
    { Outerwear: 25 },
    null,
    null,
    "Tailor's Work Table",
    null,
    [["Embroidery Thread", { Embroidery: 30 }]]
  );
  const wilderclothBandageRecipe = await createRecipe(
    null,
    wilderclothBandage,
    1,
    tailoring,
    [[wildercloth, 2]],
    1,
    "Assorted Embroidery",
    1,
    40
  );

  //cooking recipes - 41 total
  const ooeyGooeyChocolateRecipe = await createRecipe(
    null,
    ooeyGooeyChocolate,
    1,
    cooking,
    [
      [convenientlyPackagedIngredients, 3],
      [thaldraszianCocoaPowder, 6],
      [pastryPackets, 4],
    ],
    null,
    "Ingredients",
    1,
    null,
    { ArtisansConsortium: "Esteemed" },
    null,
    null,
    "Cooking Fire"
  );
  const impossiblySharpCuttingKnifeRecipe = await createRecipe(
    null,
    impossiblySharpCuttingKnife,
    2,
    cooking,
    [
      [saltDeposit, 2],
      [sereviteOre, 2],
    ],
    null,
    "Ingredients",
    1,
    null,
    { IskaaraTuskarr: 15 },
    null,
    null,
    "Anvil"
  );
  const saladOnTheSideRecipe = await createRecipe(
    null,
    saladOnTheSide,
    2,
    cooking,
    [
      [lavaBeetle, 2],
      [hochenblume, 1],
      [saxifrage, 1],
    ],
    null,
    "Ingredients",
    1,
    null,
    { DragonscaleExpedition: 13 },
    null,
    null,
    "Anvil"
  );
  const assortedExoticSpicesRecipe = await createRecipe(
    null,
    assortedExoticSpices,
    "2-3",
    cooking,
    [
      [lavaBeetle, 2],
      [convenientlyPackagedIngredients, 1],
    ],
    1,
    "Ingredients",
    1
  );
  const pebbledRockSaltsRecipe = await createRecipe(
    null,
    pebbledRockSalts,
    "2-3",
    cooking,
    [
      [saltDeposit, 2],
      [convenientlyPackagedIngredients, 1],
    ],
    1,
    "Ingredients",
    1
  );
  const breakfastOfDraconicChampionsRecipe = await createRecipe(
    null,
    breakfastOfDraconicChampions,
    4,
    cooking,
    [
      [waterfowlFilet, 2],
      [hornswogHunk, 2],
      [bruffalonFlank, 2],
      [basiliskEggs, 2],
      [mightyMammothRibs, 2],
      [burlyBearHaunch, 2],
    ],
    45,
    "Snacks",
    1,
    null,
    null,
    null,
    null,
    "Cooking Fire",
    null,
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const mackerelSnackerelRecipe = await createRecipe(
    null,
    mackerelSnackerel,
    4,
    cooking,
    [[scalebellyMackerel, 4]],
    15,
    "Snacks",
    1,
    null,
    null,
    null,
    null,
    "Cooking Fire",
    null,
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const cheeseAndQuackersRecipe = await createRecipe(
    null,
    cheeseAndQuackers,
    4,
    cooking,
    [
      [waterfowlFilet, 2],
      [threeCheeseBlend, 1],
    ],
    10,
    "Snacks",
    1,
    null,
    null,
    null,
    null,
    "Cooking Fire",
    null,
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const probablyProteinRecipe = await createRecipe(
    null,
    probablyProtein,
    4,
    cooking,
    [
      [maybeMeat, 2],
      [convenientlyPackagedIngredients, 2],
    ],
    5,
    "Snacks",
    1,
    null,
    null,
    null,
    null,
    "Cooking Fire",
    null,
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const sweetAndSourClamChowderRecipe = await createRecipe(
    null,
    sweetAndSourClamChowder,
    4,
    cooking,
    [
      [ribbedMolluskMeat, 2],
      [convenientlyPackagedIngredients, 2],
      [ohnahranPotato, 5],
    ],
    35,
    "Snacks",
    1,
    null,
    null,
    null,
    null,
    "Cooking Fire",
    null,
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const twiceBakedPotatoRecipe = await createRecipe(
    null,
    twiceBakedPotato,
    4,
    cooking,
    [
      [ohnahranPotato, 4],
      [threeCheeseBlend, 2],
    ],
    1,
    "Snacks",
    1,
    null,
    null,
    null,
    null,
    "Cooking Fire",
    "Learned by default.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const deliciousDragonSpittleRecipe = await createRecipe(
    null,
    deliciousDragonSpittle,
    4,
    cooking,
    [
      [artisanalBerryJuice, 1],
      [ribbedMolluskMeat, 1],
    ],
    25,
    "Snacks",
    1,
    null,
    null,
    null,
    null,
    "Cooking Fire",
    null,
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const churnbellyTeaRecipe = await createRecipe(
    null,
    churnbellyTea,
    1,
    cooking,
    [
      [scalebellyMackerel, 1],
      [islefinDorado, 1],
      [zestyWater, 1],
    ],
    null,
    "Snacks",
    1,
    null,
    null,
    null,
    "World Drop",
    null,
    "Received from Draconic Recipe in a Bottle.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const zestyWaterRecipe = await createRecipe(
    null,
    zestyWater,
    4,
    cooking,
    [
      [ribbedMolluskMeat, 1],
      [refreshingSpringWater, 1],
    ],
    10,
    "Snacks",
    1,
    null,
    null,
    null,
    null,
    null,
    null,
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const fatedFortuneCookieRecipe = await createRecipe(
    null,
    fatedFortuneCookie,
    1,
    cooking,
    [
      [fatedFortuneCard, 1],
      [thaldraszianCocoaPowder, 3],
      [pastryPackets, 5],
      [silkenGemdust, 2],
    ],
    null,
    "Desserts",
    1,
    null,
    null,
    null,
    "Fated Fortune Card",
    "Cooking Fire",
    "Chance to get from a Fated Fortune Card.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const blubberyMuffinRecipe = await createRecipe(
    null,
    blubberyMuffin,
    3,
    cooking,
    [
      [buttermilk, 1],
      [basiliskEggs, 2],
      [pastryPackets, 3],
      [threeCheeseBlend, 1],
    ],
    null,
    "Desserts",
    1,
    null,
    null,
    null,
    "Fishing Vendor",
    "Cooking Fire",
    "Purchased with some wacky currency from Jinkutuk in The Azure Span.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const celebratoryCakeRecipe = await createRecipe(
    null,
    celebratoryCake,
    1,
    cooking,
    [
      [basiliskEggs, 5],
      [pastryPackets, 3],
      [thaldraszianCocoaPowder, 10],
      [convenientlyPackagedIngredients, 3],
    ],
    null,
    "Desserts",
    1,
    null,
    null,
    null,
    "Quest",
    "Cooking Fire",
    "Received from the After My Own Heart questline in Ohn'ahran Plains.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const snowInAConeRecipe = await createRecipe(
    null,
    snowInACone,
    4,
    cooking,
    [
      [snowball, 3],
      [pastryPackets, 1],
      [thaldraszianCocoaPowder, 2],
    ],
    5,
    "Desserts",
    1,
    null,
    null,
    null,
    "World Drop",
    null,
    "Snow Covered Scroll in The Azure Span.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const tastyHatchlingsTreatRecipe = await createRecipe(
    null,
    tastyHatchlingsTreat,
    2,
    cooking,
    [
      [maybeMeat, 10],
      [basiliskEggs, 3],
      [pastryPackets, 2],
      [thaldraszianCocoaPowder, 1],
    ],
    null,
    "Desserts",
    1,
    null,
    null,
    null,
    "World Drop",
    "Cooking Fire",
    "Drops from Barrel of Confiscated Treats in Valdrakken.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const braisedBruffalonBrisketRecipe = await createRecipe(
    null,
    braisedBruffalonBrisket,
    4,
    cooking,
    [
      [aileronSeamoth, 1],
      [bruffalonFlank, 4],
      [assortedExoticSpices, 1],
    ],
    null,
    "Meat Meals",
    1,
    null,
    null,
    null,
    "Cooking Other Food",
    "Cooking Fire",
    "Can be learned when cooking Charred Hornswog Steaks.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const charredHornswogSteaksRecipe = await createRecipe(
    null,
    charredHornswogSteaks,
    4,
    cooking,
    [
      [maybeMeat, 4],
      [hornswogHunk, 4],
      [ohnahranPotato, 2],
    ],
    null,
    "Meat Meals",
    1,
    null,
    null,
    null,
    "World Drop",
    "Cooking Fire",
    "Drops from Searing Flame Harchek in The Waking Shores.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const riversidePicnicRecipe = await createRecipe(
    null,
    riversidePicnic,
    4,
    cooking,
    [
      [ceruleanSpinefish, 1],
      [burlyBearHaunch, 4],
      [assortedExoticSpices, 1],
    ],
    null,
    "Meat Meals",
    1,
    null,
    null,
    null,
    "Cooking Other Food",
    "Cooking Fire",
    "Can be learned when cooking Scrambled Basilisk Eggs.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const roastDuckDelightRecipe = await createRecipe(
    null,
    roastDuckDelight,
    4,
    cooking,
    [
      [temporalDragonhead, 1],
      [waterfowlFilet, 4],
      [assortedExoticSpices, 1],
    ],
    null,
    "Meat Meals",
    1,
    null,
    null,
    null,
    "Cooking Other Food",
    "Cooking Fire",
    "Can be learned when cooking Thrice-Spiced Mammoth Kabob.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const saltedMeatMashRecipe = await createRecipe(
    null,
    saltedMeatMash,
    4,
    cooking,
    [
      [scalebellyMackerel, 1],
      [maybeMeat, 6],
      [pebbledRockSalts, 1],
    ],
    40,
    "Meat Meals",
    1,
    null,
    null,
    null,
    null,
    "Cooking Fire",
    null,
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const scrambledBasiliskEggsRecipe = await createRecipe(
    null,
    scrambledBasiliskEggs,
    4,
    cooking,
    [
      [maybeMeat, 2],
      [basiliskEggs, 3],
      [threeCheeseBlend, 2],
    ],
    30,
    "Meat Meals",
    1,
    null,
    null,
    null,
    null,
    "Cooking Fire",
    null,
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const thriceSpicedMammothKabobRecipe = await createRecipe(
    null,
    thriceSpicedMammothKabob,
    4,
    cooking,
    [
      [maybeMeat, 4],
      [mightyMammothRibs, 4],
    ],
    null,
    "Meat Meals",
    1,
    null,
    null,
    null,
    "Quest",
    "Cooking Fire",
    "Received from the Honoring Our Ancestors questline in Ohn'ahran Plains.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const hopefullyHealthyRecipe = await createRecipe(
    null,
    hopefullyHealthy,
    4,
    cooking,
    [
      [maybeMeat, 3],
      [convenientlyPackagedIngredients, 4],
    ],
    20,
    "Meat Meals",
    1,
    null,
    null,
    null,
    null,
    "Cooking Fire",
    null,
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const filetOfFangsRecipe = await createRecipe(
    null,
    filetOfFangs,
    4,
    cooking,
    [
      [thousandbitePiranha, 2],
      [ribbedMolluskMeat, 2],
      [assortedExoticSpices, 2],
    ],
    null,
    "Simple Fish Dishes",
    1,
    null,
    null,
    null,
    "Quest",
    "Cooking Fire",
    "Received from the Encroaching Heat quest in The Waking Shores.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const saltBakedFishcakeRecipe = await createRecipe(
    null,
    saltBakedFishcake,
    4,
    cooking,
    [
      [ceruleanSpinefish, 2],
      [ribbedMolluskMeat, 2],
      [assortedExoticSpices, 2],
    ],
    null,
    "Simple Fish Dishes",
    1,
    null,
    null,
    null,
    "Quest",
    "Cooking Fire",
    "Received from the Encroaching Heat quest in The Waking Shores.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const seamothSurpriseRecipe = await createRecipe(
    null,
    seamothSurprise,
    4,
    cooking,
    [
      [aileronSeamoth, 2],
      [ribbedMolluskMeat, 2],
      [assortedExoticSpices, 2],
    ],
    null,
    "Simple Fish Dishes",
    1,
    null,
    null,
    null,
    "Quest",
    "Cooking Fire",
    "Received from the Encroaching Heat quest in The Waking Shores.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const timelyDemiseRecipe = await createRecipe(
    null,
    timelyDemise,
    4,
    cooking,
    [
      [temporalDragonhead, 2],
      [ribbedMolluskMeat, 2],
      [pebbledRockSalts, 2],
    ],
    null,
    "Simple Fish Dishes",
    1,
    null,
    null,
    null,
    "Quest",
    "Cooking Fire",
    "Received from the Encroaching Heat quest in The Waking Shores.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const aromaticSeafoodPlatterRecipe = await createRecipe(
    null,
    aromaticSeafoodPlatter,
    4,
    cooking,
    [
      [aileronSeamoth, 1],
      [temporalDragonhead, 1],
      [pebbledRockSalts, 3],
      [islefinDorado, 1],
    ],
    null,
    "Deluxe Fish Dishes",
    1,
    null,
    null,
    null,
    "Cooking Other Food",
    "Cooking Fire",
    "Can be learned when cooking Timely Demise or Seamoth Surprise.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const feistyFishSticksRecipe = await createRecipe(
    null,
    feistyFishSticks,
    4,
    cooking,
    [
      [temporalDragonhead, 1],
      [thousandbitePiranha, 1],
      [pebbledRockSalts, 3],
      [islefinDorado, 1],
    ],
    null,
    "Deluxe Fish Dishes",
    1,
    null,
    null,
    null,
    "Cooking Other Food",
    "Cooking Fire",
    "Can be learned when cooking Timely Demise or Filet of Fangs.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const greatCeruleanSeaRecipe = await createRecipe(
    null,
    greatCeruleanSea,
    4,
    cooking,
    [
      [aileronSeamoth, 1],
      [ceruleanSpinefish, 1],
      [pebbledRockSalts, 3],
      [islefinDorado, 1],
    ],
    null,
    "Deluxe Fish Dishes",
    1,
    null,
    null,
    null,
    "Cooking Other Food",
    "Cooking Fire",
    "Can be learned when cooking Seamoth Surprise or Salt-Baked Fishcake.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const revengeServedColdRecipe = await createRecipe(
    null,
    revengeServedCold,
    4,
    cooking,
    [
      [aileronSeamoth, 1],
      [thousandbitePiranha, 1],
      [assortedExoticSpices, 3],
      [islefinDorado, 1],
    ],
    null,
    "Deluxe Fish Dishes",
    1,
    null,
    null,
    null,
    "Cooking Other Food",
    "Cooking Fire",
    "Can be learned when cooking Filet of Fangs or Seamoth Surprise.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const sizzlingSeafoodMedleyRecipe = await createRecipe(
    null,
    sizzlingSeafoodMedley,
    4,
    cooking,
    [
      [temporalDragonhead, 1],
      [ceruleanSpinefish, 1],
      [assortedExoticSpices, 3],
      [islefinDorado, 1],
    ],
    null,
    "Deluxe Fish Dishes",
    1,
    null,
    null,
    null,
    "Cooking Other Food",
    "Cooking Fire",
    "Can be learned when cooking Timely Demise or Salt-Baked Fishcake.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const thousandboneTongueslicerRecipe = await createRecipe(
    null,
    thousandboneTongueslicer,
    4,
    cooking,
    [
      [thousandbitePiranha, 1],
      [ceruleanSpinefish, 1],
      [pebbledRockSalts, 3],
      [islefinDorado, 1],
    ],
    null,
    "Deluxe Fish Dishes",
    1,
    null,
    null,
    null,
    "Cooking Other Food",
    "Cooking Fire",
    "Can be learned when cooking Filet of Fangs or Salt-Baked Fishcake.",
    [
      ["Finishing Touches", {}],
      ["Secret Ingredient", {}],
    ]
  );
  const gralsDevotion = await createRecipe(
    "Gral's Devotion",
    grandBanquetOfTheKaluak,
    2,
    cooking,
    [
      [magmaThresher, 2],
      [roastDuckDelight, 4],
      [sizzlingSeafoodMedley, 6],
      [revengeServedCold, 6],
      [mightyMammothRibs, 6],
      [celebratoryCake, 1],
    ],
    null,
    "Great Feasts",
    1,
    null,
    null,
    null,
    "World Quest",
    "Cooking Fire",
    "Received from the Community Feast world quest in The Azure Span.",
    [["Finishing Touches", {}]]
  );
  const gralsReverence = await createRecipe(
    "Gral's Reverence",
    grandBanquetOfTheKaluak,
    2,
    cooking,
    [
      [prismaticLeaper, 2],
      [braisedBruffalonBrisket, 4],
      [feistyFishSticks, 6],
      [greatCeruleanSea, 6],
      [hornswogHunk, 6],
      [blubberyMuffin, 3],
    ],
    null,
    "Great Feasts",
    1,
    null,
    null,
    null,
    "World Quest",
    "Cooking Fire",
    "Received from the Community Feast world quest in The Azure Span.",
    [["Finishing Touches", {}]]
  );
  const gralsVeneration = await createRecipe(
    "Gral's Veneration",
    grandBanquetOfTheKaluak,
    2,
    cooking,
    [
      [rimefinTuna, 2],
      [riversidePicnic, 4],
      [aromaticSeafoodPlatter, 6],
      [thousandbitePiranha, 6],
      [basiliskEggs, 6],
      [snowInACone, 3],
    ],
    null,
    "Great Feasts",
    1,
    null,
    null,
    null,
    "World Quest",
    "Cooking Fire",
    "Received from the Community Feast world quest in The Azure Span.",
    [["Finishing Touches", {}]]
  );
  const hoardOfDraconicDelicaciesRecipe = await createRecipe(
    null,
    hoardOfDraconicDelicacies,
    1,
    cooking,
    [
      [islefinDorado, 3],
      [braisedBruffalonBrisket, 3],
      [roastDuckDelight, 3],
      [pebbledRockSalts, 2],
      [assortedExoticSpices, 2],
    ],
    null,
    "Great Feasts",
    1,
    null,
    null,
    null,
    "Quest",
    "Cooking Fire",
    "Received from the What a Long, Sweet Trip It's Been questline in Valdrakken.",
    [["Finishing Touches", {}]]
  );
  const yusasHeartyStewRecipe = await createRecipe(
    null,
    yusasHeartyStew,
    1,
    cooking,
    [
      [islefinDorado, 1],
      [thousandbitePiranha, 1],
      [mightyMammothRibs, 1],
      [ohnahranPotato, 1],
      [assortedExoticSpices, 1],
    ],
    null,
    "Great Feasts",
    1,
    null,
    null,
    null,
    "World Drop",
    "Cooking Fire",
    "Elder Yusa discovery? In the Ohn'ahran Plains.",
    [["Finishing Touches", {}]]
  );
};

makeTables();
