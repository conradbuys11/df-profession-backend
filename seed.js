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
    finishingReagentType: { type: DataTypes.STRING },
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
    icon: {type: DataTypes.STRING},
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

async function createProfession(name, icon) {
  let profession = Profession.build({ name: name });
  if (isNotNullAndUndefined(icon)) {
    profession.icon = makeIcon(icon);
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
  await item.save();
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
  if(isNotNullAndUndefined(icon)){
    recipe.icon = icon;
  }
  else if(itemMade.icon){
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

// MAKING TABLES
// TIME TO SYNC
const makeTables = async () => {
  await(sequelize.drop());
  console.log("Tables dropped successfully.");
  await(sequelize.sync());
  console.log("Tables synced successfully.");
  //
  // SEEDING PROFESSIONS
  //

  // const vendor = await(createProfession('Vendor'));
  // const worldDropAndGathering = await(createProfession('World Drop & Gathering'));
  const tailoring = await createProfession(
    "Tailoring",
    "ui_profession_tailoring"
  );
  const enchanting = await createProfession(
    "Enchanting",
    "ui_profession_enchanting"
  );
  const engineering = await createProfession(
    "Engineering",
    "ui_profession_engineering"
  );
  const alchemy = await createProfession("Alchemy", "ui_profession_alchemy");
  const inscription = await createProfession(
    "Inscription",
    "ui_profession_inscription"
  );
  const jewelcrafting = await createProfession(
    "Jewelcrafting",
    "ui_profession_jewelcrafting"
  );
  const blacksmithing = await createProfession(
    "Blacksmithing",
    "ui_profession_blacksmithing"
  );
  const leatherworking = await createProfession(
    "Leatherworking",
    "ui_profession_leatherworking"
  );
  const herbalism = await createProfession(
    "Herbalism",
    "ui_profession_herbalism"
  );
  const mining = await createProfession("Mining", "ui_profession_mining");
  const skinning = await createProfession("Skinning", "ui_profession_skinning");
  const cooking = await createProfession("Cooking", "ui_profession_cooking");
  const fishing = await createProfession("Fishing", "ui_profession_fishing");
  const archaeology = await createProfession(
    "Archaeology",
    "ui_profession_archaeology"
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
    "Training Matrix",
    "Set Item Level based on Crafting Quality (333 - 343), add Soulbound and Required Level 64."
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
    "Training Matrix",
    "Set Item Level based on Crafting Quality (346 - 356), add Soulbound and Required Level 70."
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
    "Training Matrix",
    "Set Item Level based on Crafting Quality (359 - 369), add Soulbound and Required Level 70."
  );
  const titanTrainingMatrixFour = await createItem(
    "Titan Training Matrix IV",
    "achievement_dungeon_ulduar77_heroic",
    "Pickup",
    200,
    "Unfortunately, nobody can be told what the Titan Matrix is. You have to see it for yourself.",
    "Like the Crafter's Marks in Shadowlands. Drops from bosses in Mythic dungeons.",
    "Epic",
    "Optional Crafting Reagent",
    null,
    "Training Matrix",
    "Set Item Level based on Crafting Quality (372 - 382), add Soulbound and Required Level 70."
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
    "Illustrious Insight",
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
    "Lesser Illustrious Insight",
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
  // const maybeMeat = await createItem("Maybe Meat", 1000);
  // const ribbedMolluskMeat = await createItem("Ribbed Mollusk Meat", 1000);
  // const waterfowlFilet = await createItem("Waterfowl Filet", 1000);
  // const hornswogHunk = await createItem("Hornswog Hunk", 1000);
  // const basiliskEggs = await createItem("Basilisk Eggs", 1000);
  // const bruffalonFlank = await createItem("Bruffalon Flank", 1000);
  // const mightyMammothRibs = await createItem("Mighty Mammoth Ribs", 1000);
  // const burlyBearHaunch = await createItem("Burly Bear Haunch", 1000);
  // const saltDeposit = await createItem("Salt Deposit", 1000);
  // const lavaBeetle = await createItem("Lava Beetle", 1000);
  // const scalebellyMackerel = await createItem("Scalebelly Mackerel", 1000);
  // const thousandbitePiranha = await createItem("Thousandbite Piranha", 1000);
  // const aileronSeamoth = await createItem("Aileron Seamoth", 1000);
  // const ceruleanSpinefish = await createItem("Cerulean Spinefish", 1000);
  // const temporalDragonhead = await createItem("Temporal Dragonhead", 1000);
  // const islefinDorado = await createItem("Islefin Dorado", 1000);
  // const magmaThresher = await createItem("Magma Thresher", 1000);
  // const prismaticLeaper = await createItem("Prismatic Leaper", 1000);
  // const rimefinTuna = await createItem("Rimefin Tuna", 1000);
  // const snowball = await createItem("Snowball", 1000);
  // const hornOMead = await createItem("Horn O' Mead", 1000);
  // const buttermilk = await createItem("Buttermilk", 1000);
  // const ohnahranPotato = await createItem("Ohn'ahran Potato", 1000);
  // const threeCheeseBlend = await createItem("Three-Cheese Blend", 1000);
  // const pastryPackets = await createItem("Pastry Packets", 1000);
  // const convenientlyPackagedIngredients = await createItem(
  //   "Conveniently Packaged Ingredients",
  //   1000
  // );
  // const thaldraszianCocoaPowder = await createItem(
  //   "Thaldraszian Cocoa Powder",
  //   1000
  // );

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
  // const glowingTitanOrb = await createItem("Glowing Titan Orb", 200);
  // const aquaticMaw = await createItem("Aquatic Maw", 1000);
  // const largeSturdyFemur = await createItem("Large Sturdy Femur", 1000);
  // const primalBearSpine = await createItem("Primal Bear Spine", 1000);
  // const mastodonTusk = await createItem("Mastodon Tusk", 1000);
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
  // const pentagoldSeal = await createItem("Pentagold Seal", 1000);
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
  // const artisanalBerryJuice = await createItem("Artisanal Berry Juice", 1000);
  // const refreshingSpringWater = await createItem(
  //   "Refreshing Spring Water",
  //   1000
  // );

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
    [
      ["Intellect", "", "", "", ""],
      [96, "?", "?", "?", 105],
    ],
    [
      ["Stamina", 240, "?", "?", "?", 257],
      ["Random Stat 1", 55, "?", "?", "?", 65],
      ["Random Stat 2", 55, "?", "?", "?", 65],
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
    [
      ["Intellect", "", "", "", ""],
      [128, "?", "?", "?", 140],
    ],
    [
      ["Stamina", 319, "?", "?", "?", 342],
      ["Random Stat 1", 74, "?", "?", "?", 86],
      ["Random Stat 2", 74, "?", "?", "?", 86],
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
    [
      ["Intellect", "", "", "", ""],
      [171, "?", "?", "?", 187],
    ],
    [
      ["Stamina", 426, "?", "?", "?", 456],
      ["Random Stat 1", 98, "?", "?", "?", 115],
      ["Random Stat 2", 98, "?", "?", "?", 115],
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
    [
      ["Intellect", "", "", "", ""],
      [165, "?", "?", "?", 181],
    ],
    [
      ["Stamina", 362, "?", "?", "?", 374],
      ["Random Stat 1", 138, "?", "?", "?", 179],
      ["Random Stat 2", 138, "?", "?", "?", 179],
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
    [
      ["Intellect", "", "", "", ""],
      [165, "?", "?", "?", 181],
    ],
    [
      ["Stamina", 362, "?", "?", "?", 374],
      ["Random Stat 1", 138, "?", "?", "?", 179],
      ["Random Stat 2", 138, "?", "?", "?", 179],
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
    [
      ["Intellect", "", "", "", ""],
      [219, "?", "?", "?", 241],
    ],
    [
      ["Stamina", 483, "?", "?", "?", 498],
      ["Random Stat 1", 184, "?", "?", "?", 239],
      ["Random Stat 2", 184, "?", "?", "?", 239],
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
    [
      ["Intellect", "", "", "", ""],
      [219, "?", "?", "?", 241],
    ],
    [
      ["Stamina", 483, "?", "?", "?", 498],
      ["Random Stat 1", 184, "?", "?", "?", 239],
      ["Random Stat 2", 184, "?", "?", "?", 239],
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
    [
      ["Intellect", "", "", "", ""],
      [165, "?", "?", "?", 181],
    ],
    [
      ["Stamina", 362, "?", "?", "?", 374],
      ["Random Stat 1", 138, "?", "?", "?", 179],
      ["Random Stat 2", 138, "?", "?", "?", 179],
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
      [96, "?", "?", "?", 105],
    ],
    [
      ["Stamina", 240, "?", "?", "?", 257],
      ["Random Stat 1", 55, "?", "?", "?", 65],
      ["Random Stat 2", 55, "?", "?", "?", 65],
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
    "Embellishment",
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
    "Embellishment",
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
    "Polishing Cloth",
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
    "Polishing Cloth",
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
    "Embroidery Thread",
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
    "Embroidery Thread",
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
    "Embroidery Thread",
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", "?", 285],
    ],
    [
      ["Stamina", 594, "?", "?", "?", 679],
      ["Random Stat 1", 235, "?", "?", "?", 249],
      ["Random Stat 2", 235, "?", "?", "?", 249],
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", "?", 285],
    ],
    [
      ["Stamina", 594, "?", "?", "?", 679],
      ["Random Stat 1", 235, "?", "?", "?", 249],
      ["Random Stat 2", 235, "?", "?", "?", 249],
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
    [
      ["Intellect", "", "", "", ""],
      [346, "?", "?", "?", 380],
    ],
    [
      ["Stamina", 793, "?", "?", "?", 905],
      ["Random Stat 1", 313, "?", "?", "?", 332],
      ["Random Stat 2", 313, "?", "?", "?", 332],
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
      [195, 198, "?", "?", 214],
    ],
    [
      ["Stamina", 446, 458, "?", "?", 509],
      ["Random Stat 1", 176, "?", "?", "?", 187],
      ["Random Stat 2", 176, "?", "?", "?", 187],
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", "?", 285],
    ],
    [
      ["Stamina", 594, "?", "?", "?", 679],
      ["Random Stat 1", 235, "?", "?", "?", 249],
      ["Random Stat 2", 235, "?", "?", "?", 249],
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
    [
      ["Intellect", "", "", "", ""],
      [346, "?", "?", "?", 380],
    ],
    [
      ["Stamina", 793, "?", "?", "?", 905],
      ["Random Stat 1", 313, "?", "?", "?", 332],
      ["Random Stat 2", 313, "?", "?", "?", 332],
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", "?", 285],
    ],
    [
      ["Stamina", 594, "?", "?", "?", 679],
      ["Random Stat 1", 235, "?", "?", "?", 249],
      ["Random Stat 2", 235, "?", "?", "?", 249],
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
    [
      ["Intellect", "", "", "", ""],
      [346, "?", "?", "?", 380],
    ],
    [
      ["Stamina", 793, "?", "?", "?", 905],
      ["Random Stat 1", 313, "?", "?", "?", 332],
      ["Random Stat 2", 313, "?", "?", "?", 332],
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
    [
      ["Intellect", "", "", "", ""],
      [195, 198, "?", "?", 214],
    ],
    [
      ["Stamina", 446, 458, "?", "?", 509],
      ["Random Stat 1", 176, "?", "?", "?", 187],
      ["Random Stat 2", 176, "?", "?", "?", 187],
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
    [
      ["Intellect", "", "", "", ""],
      [123, "?", "?", "?", 135],
    ],
    [
      ["Stamina", 271, "?", "?", "?", 280],
      ["Random Stat 1", 104, "?", "?", "?", 134],
      ["Random Stat 2", 104, "?", "?", "?", 134],
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
      [123, "?", "?", "?", 135],
    ],
    [
      ["Stamina", 271, "?", "?", "?", 280],
      ["Random Stat 1", 104, "?", "?", "?", 134],
      ["Random Stat 2", 104, "?", "?", "?", 134],
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
    [
      ["Intellect", "", "", "", ""],
      [165, "?", "?", "?", 181],
    ],
    [
      ["Stamina", 362, "?", "?", "?", 374],
      ["Random Stat 1", 138, "?", "?", "?", 179],
      ["Random Stat 2", 138, "?", "?", "?", 179],
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
    [
      ["Intellect", "", "", "", ""],
      [219, "?", "?", "?", 241],
    ],
    [
      ["Stamina", 483, "?", "?", "?", 498],
      ["Random Stat 1", 184, "?", "?", "?", 239],
      ["Random Stat 2", 184, "?", "?", "?", 239],
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
    [
      ["Intellect", "", "", "", ""],
      [219, "?", "?", "?", 241],
    ],
    [
      ["Stamina", 483, "?", "?", "?", 498],
      ["Random Stat 1", 184, "?", "?", "?", 239],
      ["Random Stat 2", 184, "?", "?", "?", 239],
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
    [
      ["Intellect", "", "", "", ""],
      [165, "?", "?", "?", 181],
    ],
    [
      ["Stamina", 362, "?", "?", "?", 374],
      ["Random Stat 1", 138, "?", "?", "?", 179],
      ["Random Stat 2", 138, "?", "?", "?", 179],
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
    [
      ["Intellect", "", "", "", ""],
      [165, "?", "?", "?", 181],
    ],
    [
      ["Stamina", 362, "?", "?", "?", 374],
      ["Random Stat 1", 138, "?", "?", "?", 179],
      ["Random Stat 2", 138, "?", "?", "?", 179],
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
    [
      ["Intellect", "", "", "", ""],
      [165, "?", "?", "?", 181],
    ],
    [
      ["Stamina", 362, "?", "?", "?", 374],
      ["Random Stat 1", 138, "?", "?", "?", 179],
      ["Random Stat 2", 138, "?", "?", "?", 179],
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
    [
      ["Intellect", "", "", "", ""],
      [219, "?", "?", "?", 241],
    ],
    [
      ["Stamina", 483, "?", "?", "?", 498],
      ["Random Stat 1", 184, "?", "?", "?", 239],
      ["Random Stat 2", 184, "?", "?", "?", 239],
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", 277, 285],
    ],
    [
      ["Stamina", 594, "?", "?", 653, 679],
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", 277, 285],
    ],
    [
      ["Stamina", 594, "?", "?", 653, 679],
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
    [
      ["Intellect", "", "", "", ""],
      [346, "?", "?", "?", 380],
    ],
    [
      ["Stamina", 793, "?", "?", "?", 905],
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", 277, 285],
    ],
    [
      ["Stamina", 594, "?", "?", 653, 679],
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", 277, 285],
    ],
    [
      ["Stamina", 594, "?", "?", 653, 679],
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", 277, 285],
    ],
    [
      ["Stamina", 594, "?", "?", 653, 679],
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
    "Your spells and abilities have a chance to rally you and your 4 closest allies withing 30 yards to victory for 10 sec, increasing Versatility by 191-?. (based on quality)",
    null,
    "Cloth",
    "Wrist",
    "Embellished (2)",
    [382, 384, 386, 389, 392],
    [
      ["Intellect", "", "", "", ""],
      [195, 198, "?", "?", 214],
    ],
    [
      ["Stamina", 446, 458, "?", "?", 509],
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", 277, 285],
    ],
    [
      ["Stamina", 594, "?", "?", 653, 679],
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
    [
      ["Intellect", "", "", "", ""],
      [346, "?", "?", 370, 380],
    ],
    [
      ["Stamina", 793, "?", "?", 871, 905],
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
    [
      ["Intellect", "", "", "", ""],
      [260, "?", "?", 277, 285],
    ],
    [
      ["Stamina", 594, "?", "?", 653, 679],
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
    [
      ["Intellect", "", "", "", ""],
      [346, "?", "?", 370, 380],
    ],
    [
      ["Stamina", 793, "?", "?", 871, 905],
      ["Haste", 317, "?", "?", 331, 337],
      ["Versatility", 308, "?", "?", 322, 327],
    ]
  );
  //below item needs pvp ilvl
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
    [
      ["Intellect", "", "", "", ""],
      [346, "?", "?", 370, 380],
    ],
    [
      ["Stamina", 793, "?", "?", 871, 905],
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
      ["Deftness", 32, "?", "?", 40, "?"],
      ["Perception", 32, "?", "?", 40, "?"],
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
      ["Deftness", 23, "?", "?", "?", 32],
      ["Perception", 23, "?", "?", "?", 32],
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
    "Spare Parts",
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
    "Spare Parts",
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
    "Safety Components",
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
    "Safety Components",
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
    "Embellishment",
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
    "Safety Components",
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
    "Tinker",
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
    "Tinker",
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
    "Tinker",
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
    "Tinker",
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
    "Tinker",
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
    "Tinker",
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
    "Tinker",
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
    [
      ["Strength", "Intellect", "", "", ""],
      [353, 353, "?", "?", 380],
    ],
    [
      ["Stamina", 814, 814, "?", "?", 905],
      ["Random Stat 1", 633, 633, "?", "?", 664],
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
    [
      ["Intellect", "", "", "", ""],
      [353, 353, "?", "?", 380],
    ],
    [
      ["Stamina", 814, 814, "?", "?", 905],
      ["Random Stat 1", 633, 633, "?", "?", 664],
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
    [
      ["Agility", "Intellect", "", "", ""],
      [353, 353, "?", "?", 380],
    ],
    [
      ["Stamina", 814, 814, "?", "?", 905],
      ["Random Stat 1", 633, 633, "?", "?", 664],
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
    [
      ["Agility", "Intellect", "", "", ""],
      [353, 353, "?", "?", 380],
    ],
    [
      ["Stamina", 814, 814, "?", "?", 905],
      ["Random Stat 1", 633, 633, "?", "?", 664],
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
    [
      ["Agility", "Intellect", "", "", ""],
      [171, "?", "?", "?", 187],
    ],
    [
      ["Stamina", 426, "?", "?", "?", 456],
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
    [
      ["Agility", "Intellect", "", "", ""],
      [171, "?", "?", "?", 187],
    ],
    [
      ["Stamina", 426, "?", "?", "?", 456],
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
    [
      ["Intellect", "", "", "", ""],
      [171, "?", "?", "?", 187],
    ],
    [
      ["Stamina", 426, "?", "?", "?", 456],
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
    [
      ["Intellect", "Strength", "", "", ""],
      [171, "?", "?", "?", 187],
    ],
    [
      ["Stamina", 426, "?", "?", "?", 456],
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
    [
      ["Agility", "Intellect", "", "", ""],
      [195, 198, "?", "?", 214],
    ],
    [
      ["Stamina", 446, 458, "?", "?", 509],
      ["Random Stat 1", 356, 356, "?", "?", 373],
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
    [
      ["Intellect", "Strength", "", "", ""],
      [195, 198, "?", "?", 214],
    ],
    [
      ["Stamina", 446, 458, "?", "?", 509],
      ["Random Stat 1", 356, 356, "?", "?", 373],
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
    [
      ["Agility", "Intellect", "", "", ""],
      [195, 198, "?", "?", 214],
    ],
    [
      ["Stamina", 446, 458, "?", "?", 509],
      ["Random Stat 1", 356, 356, "?", "?", 373],
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
    [
      ["Intellect", "", "", "", ""],
      [195, 198, "?", "?", 214],
    ],
    [
      ["Stamina", 446, 458, "?", "?", 509],
      ["Random Stat 1", 356, 356, "?", "?", 373],
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
    [
      ["Agility", "", "", "", ""],
      [353, 353, "?", "?", 380],
    ],
    [
      ["Stamina", 814, 814, "?", "?", 905],
      ["Random Stat 1", 317, 317, "?", "?", 332],
      ["Random Stat 2", 317, 317, "?", "?", 332],
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
    [
      ["Agility", "", "", "", ""],
      [223, 223, "?", "?", 241],
    ],
    [
      ["Stamina", 486, 486, "?", "?", 498],
      ["Random Stat 1", 195, 195, "?", "?", 239],
      ["Random Stat 2", 195, 195, "?", "?", 239],
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
    "Cogwheel",
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
    "Cogwheel",
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
    "Cogwheel",
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
    "Cogwheel",
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
    [
      ["Skill", "", "", "", ""],
      [10, 10, 10, 10, 10],
    ],
    [["Random Stat 1", 79, 86, "?", 101, 110]]
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
    [
      ["Skill", "", "", "", ""],
      [10, 10, 10, 10, 10],
    ],
    [["Perception", 79, 86, "?", 101, 110]]
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
    [
      ["Skill", "", "", "", ""],
      [10, 10, 10, 10, 10],
    ],
    [["Random Stat 1", 79, 86, "?", 101, 110]]
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
    [
      ["Skill", "", "", "", ""],
      [10, 10, 10, 10, 10],
    ],
    [["Random Stat 1", 79, 86, "?", 101, 110]]
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
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [["Random Stat 1", 58, 62, "?", "?", 79]]
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
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [["Perception", 58, 62, "?", "?", 79]]
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
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [["Random Stat 1", 58, 62, "?", "?", 79]]
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
    [
      ["Skill", "", "", "", ""],
      [6, 6, 6, 6, 6],
    ],
    [["Random Stat 1", 58, 62, "?", "?", 79]]
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
  // const gracefulAvoidance = await createItem("Graceful Avoidance");
  // const homeboundSpeed = await createItem("Homebound Speed");
  // const regenerativeLeech = await createItem("Regenerative Leech");
  // const writOfAvoidanceCloak = await createItem("Writ of Avoidance (Cloak)");
  // const writOfLeechCloak = await createItem("Writ of Leech (Cloak)");
  // const writOfSpeedCloak = await createItem("Writ of Speed (Cloak)");
  // const acceleratedAgility = await createItem("Accelerated Agility");
  // const reserveOfIntellect = await createItem("Reserve of Intellect");
  // const sustainedStrength = await createItem("Sustained Strength");
  // const wakingStats = await createItem("Waking Stats");
  // const devotionOfAvoidance = await createItem("Devotion of Avoidance");
  // const devotionOfLeech = await createItem("Devotion of Leech");
  // const devotionOfSpeed = await createItem("Devotion of Speed");
  // const writOfAvoidanceBracer = await createItem("Writ of Avoidance (Bracer)");
  // const writOfLeechBracer = await createItem("Writ of Leech (Bracer)");
  // const writOfSpeedBracer = await createItem("Writ of Speed (Bracer)");
  // const plainsrunnersBreeze = await createItem("Plainsrunner's Breeze");
  // const ridersReassurance = await createItem("Rider's Reassurance");
  // const watchersLoam = await createItem("Watcher's Loam");
  // const devotionOfCriticalStrike = await createItem(
  //   "Devotion of Critical Strike"
  // );
  // const devotionOfHaste = await createItem("Devotion of Haste");
  // const devotionOfMastery = await createItem("Devotion of Mastery");
  // const devotionOfVersatility = await createItem("Devotion of Versatility");
  // const writOfCriticalStrike = await createItem("Writ of Critical Strike");
  // const writOfHaste = await createItem("Writ of Haste");
  // const writOfMastery = await createItem("Writ of Mastery");
  // const writOfVersatility = await createItem("Writ of Versatility");
  // const burningDevotion = await createItem("Burning Devotion");
  // const earthenDevotion = await createItem("Earthen Devotion");
  // const frozenDevotion = await createItem("Frozen Devotion");
  // const sophicDevotion = await createItem("Sophic Devotion");
  // const waftingDevotion = await createItem("Wafting Devotion");
  // const burningWrit = await createItem("Burning Writ");
  // const earthenWrit = await createItem("Earthen Writ");
  // const frozenWrit = await createItem("Frozen Writ");
  // const sophicWrit = await createItem("Sophic Writ");
  // const waftingWrit = await createItem("Wafting Writ");
  // const draconicDeftness = await createItem("Draconic Deftness");
  // const draconicFinesse = await createItem("Draconic Finesse");
  // const draconicInspiration = await createItem("Draconic Inspiration");
  // const draconicPerception = await createItem("Draconic Perception");
  // const draconicResourcefulness = await createItem("Draconic Resourcefulness");
  // const torchOfPrimalAwakening = await createItem(
  //   "Torch of Primal Awakening",
  //   1,
  //   382,
  //   392
  // );
  // const runedKhazgoriteRod = await createItem(
  //   "Runed Khaz'gorite Rod",
  //   1,
  //   356,
  //   371
  // );
  // const runedDraconiumRod = await createItem(
  //   "Runed Draconium Rod",
  //   1,
  //   317,
  //   332
  // );
  // const enchantedWrithebarkWand = await createItem(
  //   "Enchanted Writhebark Wand",
  //   1,
  //   333,
  //   343
  // );
  // const runedSereviteRod = await createItem("Runed Serevite Rod", 1, 270, 285);
  // const illusionPrimalAir = await createItem("Illusion: Primal Air");
  // const illusionPrimalEarth = await createItem("Illusion: Primal Earth");
  // const illusionPrimalFire = await createItem("Illusion: Primal Fire");
  // const illusionPrimalFrost = await createItem("Illusion: Primal Frost");
  // const illusionPrimalMastery = await createItem("Illusion: Primal Mastery");
  // const primalInvocationExtract = await createItem("Primal Invocation Extract");
  // const khadgarsDisenchantingRod = await createItem(
  //   "Khadgar's Disenchanting Rod"
  // );
  // const illusoryAdornmentOrder = await createItem("Illusory Adornment: Order");
  // const illusoryAdornmentAir = await createItem("Illusory Adornment: Air");
  // const illusoryAdornmentEarth = await createItem("Illusory Adornment: Earth");
  // const illusoryAdornmentFire = await createItem("Illusory Adornment: Fire");
  // const illusoryAdornmentFrost = await createItem("Illusory Adornment: Frost");
  // const scepterOfSpectacleOrder = await createItem(
  //   "Scepter of Spectacle: Order"
  // );
  // const scepterOfSpectacleAir = await createItem("Scepter of Spectacle: Air");
  // const scepterOfSpectacleFrost = await createItem(
  //   "Scepter of Spectacle: Frost"
  // );
  // const scepterOfSpectacleEarth = await createItem(
  //   "Scepter of Spectacle: Earth"
  // );
  // const scepterOfSpectacleFire = await createItem("Scepter of Spectacle: Fire");
  // const sophicAmalgamation = await createItem("Sophic Amalgamation");
  // const crystalMagicalLockpick = await createItem(
  //   "Crystal Magical Lockpick",
  //   1000
  // );

  // //alchemy items
  // const dragonsAlchemicalSolution = await createItem(
  //   "Dragon's Alchemical Solution",
  //   1000
  // );
  // const residualNeuralChannelingAgent = await createItem(
  //   "Residual Neural Channeling Agent",
  //   1000
  // );
  // const bottledPutrescence = await createItem("Bottled Putrescence", 1000);
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
  // const potionOfShockingDisclosure = await createItem(
  //   "Potion of Shocking Disclosure",
  //   1000
  // );
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
  // const aeratedManaPotion = await createItem("Aerated Mana Potion", 1000);
  // const potionOfChilledClarity = await createItem(
  //   "Potion of Chilled Clarity",
  //   1000
  // );
  // const delicateSuspensionOfSpores = await createItem(
  //   "Delicate Suspension of Spores",
  //   1000
  // );
  // const potionOfFrozenFocus = await createItem("Potion of Frozen Focus", 1000);
  // const potionOfWitheringVitality = await createItem(
  //   "Potion of Withering Vitality",
  //   1000
  // );
  // const potionOfFrozenFatality = await createItem(
  //   "Potion of Frozen Fatality",
  //   1000
  // );
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
  // const potionCauldronOfUltimatePower = await createItem(
  //   "Potion Cauldron of Ultimate Power",
  //   1000
  // );
  // const potionCauldronOfPower = await createItem(
  //   "Potion Cauldron of Power",
  //   1000
  // );
  // const cauldronOfThePooka = await createItem("Cauldron of the Pooka", 1000);
  // const elementalPotionOfUltimatePower = await createItem(
  //   "Elemental Potion of Ultimate Power",
  //   1000
  // );
  // const elementalPotionOfPower = await createItem(
  //   "Elemental Potion of Power",
  //   1000
  // );
  // const phialOfElementalChaos = await createItem(
  //   "Phial of Elemental Chaos",
  //   1000
  // );
  // const phialOfChargedIsolation = await createItem(
  //   "Phial of Charged Isolation",
  //   1000
  // );
  // const phialOfStaticEmpowerment = await createItem(
  //   "Phial of Static Empowerment",
  //   1000
  // );
  // const phialOfStillAir = await createItem("Phial of Still Air", 1000);
  // const phialOfTheEyeInTheStorm = await createItem(
  //   "Phial of the Eye in the Storm",
  //   1000
  // );
  // const aeratedPhialOfDeftness = await createItem(
  //   "Aerated Phial of Deftness",
  //   1000
  // );
  // const chargedPhialOfAlacrity = await createItem(
  //   "Charged Phial of Alacrity",
  //   1000
  // );
  // const aeratedPhialOfQuickHands = await createItem(
  //   "Aerated Phial of Quick Hands",
  //   1000
  // );
  // const phialOfIcyPreservation = await createItem(
  //   "Phial of Icy Preservation",
  //   1000
  // );
  // const icedPhialOfCorruptingRage = await createItem(
  //   "Iced Phial of Corrupting Rage",
  //   1000
  // );
  // const phialOfGlacialFury = await createItem("Phial of Glacial Fury", 1000);
  // const steamingPhialOfFinesse = await createItem(
  //   "Steaming Phial of Finesse",
  //   1000
  // );
  // const crystallinePhialOfPerception = await createItem(
  //   "Crystalline Phial of Perception",
  //   1000
  // );
  // const phialOfTepidVersatility = await createItem(
  //   "Phial of Tepid Versatility",
  //   1000
  // );
  // //next 2 aren't really items
  // const transmuteDecayToElements = await createItem(
  //   "Transmute: Decay to Elements"
  // );
  // const transmuteOrderToElements = await createItem(
  //   "Transmute: Order to Elements"
  // );
  // //back to actual items
  // const potionAbsorptionInhibitor = await createItem(
  //   "Potion Absorption Inhibitor",
  //   1000
  // );
  // const writhefireOil = await createItem("Writhefire Oil", 1000);
  // const broodSalt = await createItem("Brood Salt", 1000);
  // const stableFluidicDraconium = await createItem(
  //   "Stable Fluidic Draconium",
  //   1000
  // );
  // const agitatingPotionAugmentation = await createItem(
  //   "Agitating Potion Augmentation",
  //   1000
  // );
  // const reactivePhialEmbellishment = await createItem(
  //   "Reactive Phial Embellishment",
  //   1000
  // );
  // const sagaciousIncense = await createItem("Sagacious Incense", 1000);
  // const exultantIncense = await createItem("Exultant Incense", 1000);
  // const fervidIncense = await createItem("Fervid Incense", 1000);
  // const somniferousIncense = await createItem("Somniferous Incense", 1000);
  // const alacritousAlchemistStone = await createItem(
  //   "Alacritous Alchemist Stone",
  //   1,
  //   382,
  //   392
  // );
  // const sustainingAlchemistStone = await createItem(
  //   "Sustaining Alchemist Stone",
  //   1,
  //   382,
  //   392
  // );

  // //inscription items
  // // const dragonIslesMilling = await(createItem("Dragon Isles Milling")); //not a real item
  // const shimmeringPigment = await createItem("Shimmering Pigment", 1000);
  // const serenePigment = await createItem("Serene Pigment", 1000);
  // const flourishingPigment = await createItem("Flourishing Pigment", 1000);
  // const blazingPigment = await createItem("Blazing Pigment", 1000);
  // const cosmicInk = await createItem("Cosmic Ink", 1000);
  // const burnishedInk = await createItem("Burnished Ink", 1000);
  // const blazingInk = await createItem("Blazing Ink", 1000);
  // const flourishingInk = await createItem("Flourishing Ink", 1000);
  // const sereneInk = await createItem("Serene Ink", 1000);
  // const runedWrithebark = await createItem("Runed Writhebark", 1000);
  // const chilledRune = await createItem("Chilled Rune", 1000);
  // const draconicMissiveOfTheAurora = await createItem(
  //   "Draconic Missive of the Aurora",
  //   1000
  // );
  // const draconicMissiveOfTheFeverflare = await createItem(
  //   "Draconic Missive of the Feverflare",
  //   1000
  // );
  // const draconicMissiveOfTheFireflash = await createItem(
  //   "Draconic Missive of the Fireflash",
  //   1000
  // );
  // const draconicMissiveOfTheHarmonious = await createItem(
  //   "Draconic Missive of the Harmonious",
  //   1000
  // );
  // const draconicMissiveOfThePeerless = await createItem(
  //   "Draconic Missive of the Peerless",
  //   1000
  // );
  // const draconicMissiveOfTheQuickblade = await createItem(
  //   "Draconic Missive of the Quickblade",
  //   1000
  // );
  // const draconicMissiveOfCraftingSpeed = await createItem(
  //   "Draconic Missive of Crafting Speed",
  //   1000
  // );
  // const draconicMissiveOfInspiration = await createItem(
  //   "Draconic Missive of Inspiration",
  //   1000
  // );
  // const draconicMissiveOfMulticraft = await createItem(
  //   "Draconic Missive of Multicraft",
  //   1000
  // );
  // const draconicMissiveOfResourcefulness = await createItem(
  //   "Draconic Missive of Resourcefulness",
  //   1000
  // );
  // const draconicMissiveOfDeftness = await createItem(
  //   "Draconic Missive of Deftness",
  //   1000
  // );
  // const draconicMissiveOfFinesse = await createItem(
  //   "Draconic Missive of Finesse",
  //   1000
  // );
  // const draconicMissiveOfPerception = await createItem(
  //   "Draconic Missive of Perception",
  //   1000
  // );
  // const darkmoonDeckDance = await createItem("Darkmoon Deck: Dance", 1, 372);
  // const darkmoonDeckInferno = await createItem(
  //   "Darkmoon Deck: Inferno",
  //   1,
  //   372
  // );
  // const darkmoonDeckRime = await createItem("Darkmoon Deck: Rime", 1, 372);
  // const darkmoonDeckWatcher = await createItem(
  //   "Darkmoon Deck: Watcher",
  //   1,
  //   372
  // );
  // const darkmoonDeckBoxDance = await createItem(
  //   "Darkmoon Deck Box: Dance",
  //   1,
  //   382,
  //   392
  // );
  // const darkmoonDeckBoxInferno = await createItem(
  //   "Darkmoon Deck Box: Inferno",
  //   1,
  //   382,
  //   392
  // );
  // const darkmoonDeckBoxRime = await createItem(
  //   "Darkmoon Deck Box: Rime",
  //   1,
  //   382,
  //   392
  // );
  // const darkmoonDeckBoxWatcher = await createItem(
  //   "Darkmoon Deck Box: Watcher",
  //   1,
  //   382,
  //   392
  // );
  // const crackingCodexOfTheIsles = await createItem(
  //   "Cracking Codex of the Isles",
  //   1,
  //   382,
  //   392
  // );
  // const illuminatingPillarOfTheIsles = await createItem(
  //   "Illuminating Pillar of the Isles",
  //   1,
  //   382,
  //   392
  // );
  // const kineticPillarOfTheIsles = await createItem(
  //   "Kinetic Pillar of the Isles",
  //   1,
  //   382,
  //   392
  // );
  // const weatheredExplorersStave = await createItem(
  //   "Weathered Explorer's Stave",
  //   1,
  //   382,
  //   392
  // );
  // const coreExplorersCompendium = await createItem(
  //   "Core Explorer's Compendium",
  //   1,
  //   333,
  //   343
  // );
  // const overseersWrithebarkStave = await createItem(
  //   "Overseer's Writhebark Stave",
  //   1,
  //   333,
  //   343
  // );
  // const pioneersWrithebarkStave = await createItem(
  //   "Pioneer's Writhebark Stave",
  //   1,
  //   333,
  //   343
  // );
  // const emberscaleSigil = await createItem("Emberscale Sigil", 1000);
  // const jetscaleSigil = await createItem("Jetscale Sigil", 1000);
  // const sagescaleSigil = await createItem("Sagescale Sigil", 1000);
  // const azurescaleSigil = await createItem("Azurescale Sigil", 1000);
  // const bronzescaleSigil = await createItem("Bronzescale Sigil", 1000);
  // const vantusRuneVaultOfTheIncarnates = await createItem(
  //   "Vantus Rune: Vault of the Incarnates",
  //   1000
  // );
  // const buzzingRune = await createItem("Buzzing Rune", 1000);
  // const chirpingRune = await createItem("Chirping Rune", 1000);
  // const howlingRune = await createItem("Howling Rune", 1000);
  // const alchemistsBrilliantMixingRod = await createItem(
  //   "Alchemist's Brilliant Mixing Rod",
  //   1,
  //   356,
  //   371
  // );
  // const chefsSplendidRollingPin = await createItem(
  //   "Chef's Splendid Rolling Pin",
  //   1,
  //   356,
  //   371
  // );
  // const scribesResplendentQuill = await createItem(
  //   "Scribe's Resplendent Quill",
  //   1,
  //   356,
  //   371
  // );
  // const alchemistsSturdyMixingRod = await createItem(
  //   "Alchemist's Sturdy Mixing Rod",
  //   1,
  //   317,
  //   332
  // );
  // const chefsSmoothRollingPin = await createItem(
  //   "Chef's Smooth Rolling Pin",
  //   1,
  //   317,
  //   332
  // );
  // const scribesFastenedQuill = await createItem(
  //   "Scribe's Fastened Quill",
  //   1,
  //   317,
  //   332
  // );
  // const illusionParchmentWhirlingBreeze = await createItem(
  //   "Illusion Parchment: Whirling Breeze",
  //   1000
  // );
  // const illusionParchmentAquaTorrent = await createItem(
  //   "Illusion Parchment: Aqua Torrent",
  //   1000
  // );
  // const illusionParchmentArcaneBurst = await createItem(
  //   "Illusion Parchment: Arcane Burst",
  //   1000
  // );
  // const illusionParchmentChillingWind = await createItem(
  //   "Illusion Parchment: Chilling Wind",
  //   1000
  // );
  // const illusionParchmentLoveCharm = await createItem(
  //   "Illusion Parchment: Love Charm",
  //   1000
  // );
  // const illusionParchmentMagmaMissile = await createItem(
  //   "Illusion Parchment: Magma Missile",
  //   1000
  // );
  // const illusionParchmentShadowOrb = await createItem(
  //   "Illusion Parchment: Shadow Orb",
  //   1000
  // );
  // const illusionParchmentSpellShield = await createItem(
  //   "Illusion Parchment: Spell Shield",
  //   1000
  // );
  // const scrollOfSales = await createItem("Scroll of Sales", 1000);
  // const bundleOCardsDragonIsles = await createItem(
  //   "Bundle O' Cards: Dragon Isles"
  // );
  // const fatedFortuneCard = await createItem("Fated Fortune Card", 1000);
  // //4 extractions of awakened elements, but like, they just yield awakened elements...
  // const contractIskaaraTuskarr = await createItem(
  //   "Contract: Iskaara Tuskarr",
  //   1000
  // );
  // const contractArtisansConsortium = await createItem(
  //   "Contract: Artisan's Consortium",
  //   1000
  // );
  // const contractDragonscaleExpedition = await createItem(
  //   "Contract: Dragonscale Expedition",
  //   1000
  // );
  // const contractMaruukCentaur = await createItem(
  //   "Contract: Maruuk Centaur",
  //   1000
  // );
  // const contractValdrakkenAccord = await createItem(
  //   "Contract: Valdrakken Accord",
  //   1000
  // );
  // const draconicTreatiseOnAlchemy = await createItem(
  //   "Draconic Treatise on Alchemy",
  //   1000
  // );
  // const draconicTreatiseOnBlacksmithing = await createItem(
  //   "Draconic Treatise on Blacksmithing",
  //   1000
  // );
  // const draconicTreatiseOnEnchanting = await createItem(
  //   "Draconic Treatise on Enchanting",
  //   1000
  // );
  // const draconicTreatiseOnEngineering = await createItem(
  //   "Draconic Treatise on Engineering",
  //   1000
  // );
  // const draconicTreatiseOnHerbalism = await createItem(
  //   "Draconic Treatise on Herbalism",
  //   1000
  // );
  // const draconicTreatiseOnInscription = await createItem(
  //   "Draconic Treatise on Inscription",
  //   1000
  // );
  // const draconicTreatiseOnJewelcrafting = await createItem(
  //   "Draconic Treatise on Jewelcrafting",
  //   1000
  // );
  // const draconicTreatiseOnLeatherworking = await createItem(
  //   "Draconic Treatise on Leatherworking",
  //   1000
  // );
  // const draconicTreatiseOnMining = await createItem(
  //   "Draconic Treatise on Mining",
  //   1000
  // );
  // const draconicTreatiseOnSkinning = await createItem(
  //   "Draconic Treatise on Skinning",
  //   1000
  // );
  // const draconicTreatiseOnTailoring = await createItem(
  //   "Draconic Treatise on Tailoring",
  //   1000
  // );
  // const renewedProtoDrakeSilverAndBlueArmor = await createItem(
  //   "Renewed Proto-Drake: Silver and Blue Armor"
  // );
  // const renewedProtoDrakeSteelAndYellowArmor = await createItem(
  //   "Renewed Proto-Drake: Steel and Yellow Armor"
  // );
  // const renewedProtoDrakeBovineHorns = await createItem(
  //   "Renewed Proto-Drake: Bovine Horns"
  // );
  // const renewedProtoDrakePredatorPattern = await createItem(
  //   "Renewed Proto-Drake: Predator Pattern"
  // );
  // const renewedProtoDrakeSpinedCrest = await createItem(
  //   "Renewed Proto-Drake: Spined Crest"
  // );
  // const windborneVelocidrakeSilverAndBlueArmor = await createItem(
  //   "Windborne Velocidrake: Silver and Blue Armor"
  // );
  // const windborneVelocidrakeSteelAndOrangeArmor = await createItem(
  //   "Windborne Velocidrake: Steel and Orange Armor"
  // );
  // const windborneVelocidrakeBlackFur = await createItem(
  //   "Windborne Velocidrake: Black Fur"
  // );
  // const windborneVelocidrakeSpinedHead = await createItem(
  //   "Windborne Velocidrake: Spined Head"
  // );
  // const windborneVelocidrakeWindsweptPattern = await createItem(
  //   "Windborne Velocidrake: Windswept Pattern"
  // );
  // const highlandDrakeSilverAndBlueArmor = await createItem(
  //   "Highland Drake: Silver and Blue Armor"
  // );
  // const highlandDrakeSteelAndYellowArmor = await createItem(
  //   "Highland Drake: Steel and Yellow Armor"
  // );
  // const highlandDrakeBlackHair = await createItem("Highland Drake: Black Hair");
  // const highlandDrakeSpinedCrest = await createItem(
  //   "Highland Drake: Spined Crest"
  // );
  // const highlandDrakeSpinedThroat = await createItem(
  //   "Highland Drake: Spined Throat"
  // );
  // const cliffsideWylderdrakeSilverAndBlueArmor = await createItem(
  //   "Cliffside Wylderdrake: Silver and Blue Armor"
  // );
  // const cliffsideWylderdrakeSteelAndYellowArmor = await createItem(
  //   "Cliffside Wylderdrake: Steel and Yellow Armor"
  // );
  // const cliffsideWylderdrakeConicalHead = await createItem(
  //   "Cliffside Wylderdrake: Conical Head"
  // );
  // const cliffsideWylderdrakeRedHair = await createItem(
  //   "Cliffside Wylderdrake: Red Hair"
  // );
  // const cliffsideWylderdrakeTripleHeadHorns = await createItem(
  //   "Cliffside Wylderdrake: Triple Head Horns"
  // );

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
  // const illimitedDiamond = await createItem("Illimited Diamond", 1000);
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
  // const blottingSand = await createItem("Blotting Sand", 1000);
  // const pounce = await createItem("Pounce", 1000);
  // const emptySoulCage = await createItem("Empty Soul Cage", 1000);
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
  // const glossyStone = await createItem("Glossy Stone", 1000);
  // const shimmeringClasp = await createItem("Shimmering Clasp", 1000);
  // const energizedVibrantEmerald = await createItem(
  //   "Energized Vibrant Emerald",
  //   1000
  // );
  // const zenMysticSapphire = await createItem("Zen Mystic Sapphire", 1000);
  // const craftyQueensRuby = await createItem("Crafy Queen's Ruby", 1000);
  // const senseisSunderedOnyx = await createItem("Sensei's Sundered Onyx", 1000);
  // const solidEternityAmber = await createItem("Solid Eternity Amber", 1000);
  // const quickYsemerald = await createItem("Quick Ysemerald", 1000);
  // const craftyAlexstraszite = await createItem("Crafty Alexstraszite", 1000);
  // const energizedMalygite = await createItem("Energized Malygite", 1000);
  // const forcefulNozdorite = await createItem("Forceful Nozdorite", 1000);
  // const keenNeltharite = await createItem("Keen Neltharite", 1000);
  // const puissantNozdorite = await createItem("Puissant Nozdorite", 1000);
  // const fracturedNeltharite = await createItem("Fractured Neltharite", 1000);
  // const keenYsemerald = await createItem("Keen Ysemerald", 1000);
  // const senseisAlexstraszite = await createItem("Sensei's Alexstraszite", 1000);
  // const zenMalygite = await createItem("Zen Malygite", 1000);
  // const radiantMalygite = await createItem("Radiant Malygite", 1000);
  // const craftyYsemerald = await createItem("Crafty Ysemerald", 1000);
  // const deadlyAlexstraszite = await createItem("Deadly Alexstraszite", 1000);
  // const jaggedNozdorite = await createItem("Jagged Nozdorite", 1000);
  // const senseisNeltharite = await createItem("Sensei's Neltharite", 1000);
  // const energizedYsemerald = await createItem("Energized Ysemerald", 1000);
  // const radiantAlexstraszite = await createItem("Radiant Alexstraszite", 1000);
  // const steadyNozdorite = await createItem("Steady Nozdorite", 1000);
  // const stormyMalygite = await createItem("Stormy Malygite", 1000);
  // const zenNeltharite = await createItem("Zen Neltharite", 1000);
  // const fierceIllimitedDiamond = await createItem(
  //   "Fierce Illimited Diamond",
  //   1000
  // );
  // const inscribedIllimitedDiamond = await createItem(
  //   "Inscribed Illimited Diamond",
  //   1000
  // );
  // const resplendentIllimitedDiamond = await createItem(
  //   "Resplendent Illimited Diamond",
  //   1000
  // );
  // const skillfulIllimitedDiamond = await createItem(
  //   "Skillful Illimited Diamond",
  //   1000
  // );
  // const tieredMedallionSetting = await createItem(
  //   "Tiered Medallion Setting",
  //   1000
  // );
  // const idolOfTheDreamer = await createItem("Idol of the Dreamer", 1, 382, 392);
  // const idolOfTheEarthWarder = await createItem(
  //   "Idol of the Earth Warder",
  //   1,
  //   382,
  //   392
  // );
  // const idolOfTheLifebinder = await createItem(
  //   "Idol of the Lifebinder",
  //   1,
  //   382,
  //   392
  // );
  // const idolOfTheSpellWeaver = await createItem(
  //   "Idol of the Spell-Weaver",
  //   1,
  //   382,
  //   392
  // );
  // const chokerOfShielding = await createItem(
  //   "Choker of Shielding",
  //   1,
  //   382,
  //   392
  // );
  // const elementalLariat = await createItem("Elemental Lariat", 1, 382, 392);
  // const ringBoundHourglass = await createItem(
  //   "Ring-Bound Hourglass",
  //   1,
  //   382,
  //   392
  // );
  // const signetOfTitanicInsight = await createItem(
  //   "Signet of Titanic Insight",
  //   1,
  //   382,
  //   392
  // );
  // const torcOfPassedTime = await createItem("Torc of Passed Time", 1, 382, 392);
  // //next 2 need pvp ilvls
  // const crimsonCombatantsJeweledAmulet = await createItem(
  //   "Crimson Combatant's Jeweled Amulet",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsJeweledSignet = await createItem(
  //   "Crimson Combatant's Jeweled Signet",
  //   1,
  //   333,
  //   343
  // );
  // const bandOfNewBeginnings = await createItem(
  //   "Band of New Beginnings",
  //   1,
  //   306,
  //   316
  // );
  // const pendantOfImpendingPerils = await createItem(
  //   "Pendant of Impending Perils",
  //   1,
  //   306,
  //   316
  // );
  // const djaradinsPinata = await createItem(`Djaradin's "Pinata"`, 1000);
  // const narcissistsSculpture = await createItem("Narcissist's Sculpture", 1000);
  // const kaluakFigurine = await createItem("Kalu'ak Figurine", 1000);
  // const statueOfTyrsHerald = await createItem("Statue of Tyr's Herald", 1000);
  // const revitalizingRedCarving = await createItem(
  //   "Revitalizing Red Carving",
  //   1000
  // );
  // const jeweledAmberWhelpling = await createItem("Jeweled Amber Whelpling");
  // const jeweledEmeraldWhelpling = await createItem("Jeweled Emerald Whelpling");
  // const jeweledOnyxWhelpling = await createItem("Jeweled Onyx Whelpling");
  // const jeweledRubyWhelpling = await createItem("Jeweled Ruby Whelpling");
  // const jeweledSapphireWhelpling = await createItem(
  //   "Jeweled Sapphire Whelpling"
  // );
  // const convergentPrism = await createItem("Convergent Prism");
  // const jeweledOffering = await createItem("Jeweled Offering");
  // const projectionPrism = await createItem("Projection Prism", 1000);
  // const rhinestoneSunglasses = await createItem('"Rhinestone" Sunglasses');
  // const splitLensSpecs = await createItem("Split-Lens Specs");
  // const alexstrasziteLoupes = await createItem(
  //   "Alexstraszite Loupes",
  //   1,
  //   356,
  //   371
  // );
  // const finePrintTrifocals = await createItem(
  //   "Fine-Print Trifocals",
  //   1,
  //   356,
  //   371
  // );
  // const magnificentMarginMagnifier = await createItem(
  //   "Magnificent Margin Magnifier",
  //   1,
  //   356,
  //   371
  // );
  // const resonantFocus = await createItem("Resonant Focus", 1, 356, 371);
  // const boldPrintBifocals = await createItem(
  //   "Bold-Print Bifocals",
  //   1,
  //   317,
  //   332
  // );
  // const chromaticFocus = await createItem("Chromatic Focus", 1, 317, 332);
  // const leftHandedMagnifyingGlass = await createItem(
  //   "Left-Handed Magnifying Glass",
  //   1,
  //   317,
  //   332
  // );
  // const sunderedOnyxLoupes = await createItem(
  //   "Sundered Onyx Loupes",
  //   1,
  //   317,
  //   332
  // );
  // const jeweledDragonsHeart = await createItem("Jeweled Dragon's Heart");
  // const dreamersVision = await createItem("Dreamer's Vision");
  // const earthwardensPrize = await createItem("Earthwarden's Prize");
  // const keepersGlory = await createItem("Keeper's Glory");
  // const queensGift = await createItem("Queen's Gift");
  // const timewatchersPatience = await createItem("Timewatcher's Patience");
  // const glimmeringNozdoriteCluster = await createItem(
  //   "Glimmering Nozdorite Cluster"
  // );
  // const glimmeringYsemeraldCluster = await createItem(
  //   "Glimmering Ysemerald Cluster"
  // );
  // const glimmeringNelthariteCluster = await createItem(
  //   "Glimmering Neltharite Cluster"
  // );
  // const glimmeringAlexstrasziteCluster = await createItem(
  //   "Glimmering Alexstraszite Cluster"
  // );
  // const glimmeringMalygiteCluster = await createItem(
  //   "Glimmering Malygite Cluster"
  // );

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
  // const infuriousAlloy = await createItem("Infurious Alloy", 1000);
  // const primalMoltenAlloy = await createItem("Primal Molten Alloy", 1000);
  // const armorSpikes = await createItem("Armor Spikes", 1000);
  // const alliedChestplateOfGenerosity = await createItem(
  //   "Allied Chestplate of Generosity",
  //   1,
  //   382,
  //   392
  // );
  // const alliedWristguardOfCompanionship = await createItem(
  //   "Allied Wristguard of Companionship",
  //   1,
  //   382,
  //   392
  // );
  // const frostfireLegguardsOfPreparation = await createItem(
  //   "Frostfire Legguards of Preparation",
  //   1,
  //   382,
  //   392
  // );
  // //next two items need pvp ilvl
  // const infuriousHelmOfVengeance = await createItem(
  //   "Infurious Helm of Vengeance",
  //   1,
  //   382,
  //   392
  // );
  // const infuriousWarbootsOfImpunity = await createItem(
  //   "Infurious Warboots of Impunity",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenBreastplate = await createItem(
  //   "Primal Molten Breastplate",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenGauntlets = await createItem(
  //   "Primal Molten Gauntlets",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenGreatbelt = await createItem(
  //   "Primal Molten Greatbelt",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenHelm = await createItem("Primal Molten Helm", 1, 382, 392);
  // const primalMoltenLegplates = await createItem(
  //   "Primal Molten Legplates",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenPauldrons = await createItem(
  //   "Primal Molten Pauldrons",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenSabatons = await createItem(
  //   "Primal Molten Sabatons",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenVambraces = await createItem(
  //   "Primal Molten Vambraces",
  //   1,
  //   382,
  //   392
  // );
  // const unstableFrostfireBelt = await createItem(
  //   "Unstable Frostfire Belt",
  //   1,
  //   382,
  //   392
  // );
  // const explorersExpertHelm = await createItem(
  //   "Explorer's Expert Helm",
  //   1,
  //   333,
  //   343
  // );
  // const explorersExpertSpaulders = await createItem(
  //   "Explorer's Expert Spaulders",
  //   1,
  //   333,
  //   343
  // );
  // const explorersExpertGauntlets = await createItem(
  //   "Explorer's Expert Gauntlets",
  //   1,
  //   333,
  //   343
  // );
  // const explorersExpertGreaves = await createItem(
  //   "Explorer's Expert Greaves",
  //   1,
  //   333,
  //   343
  // );
  // const explorersExpertClasp = await createItem(
  //   "Explorer's Expert Clasp",
  //   1,
  //   333,
  //   343
  // );
  // const explorersPlateChestguard = await createItem(
  //   "Explorer's Plate Chestguard",
  //   1,
  //   306,
  //   316
  // );
  // const explorersPlateBoots = await createItem(
  //   "Explorer's Plate Boots",
  //   1,
  //   306,
  //   316
  // );
  // const explorersPlateBracers = await createItem(
  //   "Explorer's Plate Bracers",
  //   1,
  //   306,
  //   316
  // );
  // //all of the next bunch need pvp ilvls
  // const crimsonCombatantsDraconiumArmguards = await createItem(
  //   "Crimson Combatant's Draconium Armguards",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsDraconiumBreastplate = await createItem(
  //   "Crimson Combatant's Draconium Breastplate",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsDraconiumGauntlets = await createItem(
  //   "Crimson Combatant's Draconium Gauntlets",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsDraconiumGreaves = await createItem(
  //   "Crimson Combatant's Draconium Greaves",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsDraconiumHelm = await createItem(
  //   "Crimson Combatant's Draconium Helm",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsDraconiumPauldrons = await createItem(
  //   "Crimson Combatant's Draconium Pauldrons",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsDraconiumSabatons = await createItem(
  //   "Crimson Combatant's Draconium Sabatons",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsDraconiumWaistguard = await createItem(
  //   "Crimson Combatant's Draconium Waistguard",
  //   1,
  //   333,
  //   343
  // );
  // //end of pvp block
  // const primalMoltenDefender = await createItem(
  //   "Primal Molten Defender",
  //   1,
  //   382,
  //   392
  // );
  // const shieldOfTheHearth = await createItem(
  //   "Shield of the Hearth",
  //   1,
  //   382,
  //   392
  // );
  // const draconiumDefender = await createItem("Draconium Defender", 1, 333, 343);
  // const obsidianSearedClaymore = await createItem(
  //   "Obsidian Seared Claymore",
  //   1,
  //   382,
  //   392
  // );
  // const obsidianSearedCrusher = await createItem(
  //   "Obsidian Seared Crusher",
  //   1,
  //   382,
  //   392
  // );
  // const obsidianSearedFacesmasher = await createItem(
  //   "Obsidian Seared Facesmasher",
  //   1,
  //   382,
  //   392
  // );
  // const obsidianSearedHalberd = await createItem(
  //   "Obsidian Seared Halberd",
  //   1,
  //   382,
  //   392
  // );
  // const obsidianSearedHexsword = await createItem(
  //   "Obsidian Seared Hexsword",
  //   1,
  //   382,
  //   392
  // );
  // const obsidianSearedInvoker = await createItem(
  //   "Obsidian Seared Invoker",
  //   1,
  //   382,
  //   392
  // );
  // const obsidianSearedRuneaxe = await createItem(
  //   "Obsidian Seared Runeaxe",
  //   1,
  //   382,
  //   392
  // );
  // const obsidianSearedSlicer = await createItem(
  //   "Obsidian Seared Slicer",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenGreataxe = await createItem(
  //   "Primal Molten Greataxe",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenLongsword = await createItem(
  //   "Primal Molten Longsword",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenMace = await createItem("Primal Molten Mace", 1, 382, 392);
  // const primalMoltenShortblade = await createItem(
  //   "Primal Molten Shortblade",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenSpellblade = await createItem(
  //   "Primal Molten Spellblade",
  //   1,
  //   382,
  //   392
  // );
  // const primalMoltenWarglaive = await createItem(
  //   "Primal Molten Warglaive",
  //   1,
  //   382,
  //   392
  // );
  // const draconiumGreatMace = await createItem(
  //   "Draconium Great Mace",
  //   1,
  //   333,
  //   343
  // );
  // const draconiumStiletto = await createItem("Draconium Stiletto", 1, 333, 343);
  // const draconiumGreatAxe = await createItem(
  //   "Draconium Great Axe",
  //   1,
  //   333,
  //   343
  // );
  // const draconiumKnuckles = await createItem("Draconium Knuckles", 1, 333, 343);
  // const draconiumSword = await createItem("Draconium Sword", 1, 333, 343);
  // const draconiumAxe = await createItem("Draconium Axe", 1, 333, 343);
  // const draconiumDirk = await createItem("Draconium Dirk", 1, 333, 343);
  // const blackDragonTouchedHammer = await createItem(
  //   "Black Dragon Touched Hammer",
  //   1,
  //   382,
  //   397
  // );
  // const khazgoriteBlacksmithsHammer = await createItem(
  //   "Khaz'gorite Blacksmith's Hammer",
  //   1,
  //   356,
  //   371
  // );
  // const khazgoriteBlacksmithsToolbox = await createItem(
  //   "Khaz'gorite Blacksmith's Toolbox",
  //   1,
  //   356,
  //   371
  // );
  // const khazgoriteLeatherworkersKnife = await createItem(
  //   "Khaz'gorite Leatherworker's Knife",
  //   1,
  //   356,
  //   371
  // );
  // const khazgoriteLeatherworkersToolset = await createItem(
  //   "Khaz'gorite Leatherworker's Toolset",
  //   1,
  //   356,
  //   371
  // );
  // const khazgoriteNeedleSet = await createItem(
  //   "Khaz'gorite Needle Set",
  //   1,
  //   356,
  //   371
  // );
  // const khazgoritePickaxe = await createItem(
  //   "Khaz'gorite Pickaxe",
  //   1,
  //   356,
  //   371
  // );
  // const khazgoriteSickle = await createItem("Khaz'gorite Sickle", 1, 356, 371);
  // const khazgoriteSkinningKnife = await createItem(
  //   "Khaz'gorite Skinning Knife",
  //   1,
  //   356,
  //   371
  // );
  // const draconiumNeedleSet = await createItem(
  //   "Draconium Needle Set",
  //   1,
  //   317,
  //   332
  // );
  // const draconiumLeatherworkersKnife = await createItem(
  //   "Draconium Leatherworker's Knife",
  //   1,
  //   317,
  //   332
  // );
  // const draconiumLeatherworkersToolset = await createItem(
  //   "Draconium Leatherworker's Toolset",
  //   1,
  //   317,
  //   332
  // );
  // const draconiumBlacksmithsToolbox = await createItem(
  //   "Draconium Blacksmith's Toolbox",
  //   1,
  //   317,
  //   332
  // );
  // const draconiumBlacksmithsHammer = await createItem(
  //   "Draconium Blacksmith's Hammer",
  //   1,
  //   317,
  //   332
  // );
  // const draconiumSkinningKnife = await createItem(
  //   "Draconium Skinning Knife",
  //   1,
  //   317,
  //   332
  // );
  // const draconiumSickle = await createItem("Draconium Sickle", 1, 317, 332);
  // const draconiumPickaxe = await createItem("Draconium Pickaxe", 1, 317, 332);
  // const mastersHammer = await createItem("Master's Hammer");
  // const sturdyExpeditionShovel = await createItem(
  //   "Sturdy Expedition Shovel",
  //   1000
  // );
  // const sereviteRepairHammer = await createItem("Serevite Repair Hammer", 1000);
  // const sereviteSkeletonKey = await createItem("Serevite Skeleton Key", 1000);
  // const primalRazorstone = await createItem("Primal Razorstone", 1000);
  // const primalWhetstone = await createItem("Primal Whetstone", 1000);
  // const primalWeightstone = await createItem("Primal Weightstone", 1000);
  // const alvinTheAnvil = await createItem("Alvin the Anvil");
  // const prototypeExplorersBardingFramework = await createItem(
  //   "Prototype Explorer's Barding Framework"
  // );
  // const prototypeRegalBardingFramework = await createItem(
  //   "Prototype Regal Barding Framework"
  // );

  // //leatherworking items
  // const lifeBoundBelt = await createItem("Life-Bound Belt", 1, 382, 392);
  // const lifeBoundBindings = await createItem(
  //   "Life-Bound Bindings",
  //   1,
  //   382,
  //   392
  // );
  // const lifeBoundBoots = await createItem("Life-Bound Boots", 1, 382, 392);
  // const lifeBoundCap = await createItem("Life-Bound Cap", 1, 382, 392);
  // const lifeBoundChestpiece = await createItem(
  //   "Life-Bound Chestpiece",
  //   1,
  //   382,
  //   392
  // );
  // const lifeBoundGloves = await createItem("Life-Bound Gloves", 1, 382, 392);
  // const lifeBoundShoulderpads = await createItem(
  //   "Life-Bound Shoulderpads",
  //   1,
  //   382,
  //   392
  // );
  // const lifeBoundTrousers = await createItem(
  //   "Life-Bound Trousers",
  //   1,
  //   382,
  //   392
  // );
  // const pioneersPracticedCowl = await createItem(
  //   "Pioneer's Practiced Cowl",
  //   1,
  //   333,
  //   343
  // );
  // const pioneersPracticedLeggings = await createItem(
  //   "Pioneer's Practiced Leggings",
  //   1,
  //   333,
  //   343
  // );
  // const pioneersPracticedShoulders = await createItem(
  //   "Pioneer's Practiced Shoulders",
  //   1,
  //   333,
  //   343
  // );
  // const pioneersPracticedGloves = await createItem(
  //   "Pioneer's Practiced Gloves",
  //   1,
  //   333,
  //   343
  // );
  // const pioneersPracticedBelt = await createItem(
  //   "Pioneer's Practiced Belt",
  //   1,
  //   333,
  //   343
  // );
  // const pioneersLeatherTunic = await createItem(
  //   "Pioneer's Leather Tunic",
  //   1,
  //   306,
  //   316
  // );
  // const pioneersLeatherBoots = await createItem(
  //   "Pioneer's Leather Boots",
  //   1,
  //   306,
  //   316
  // );
  // const pioneersLeatherWristguards = await createItem(
  //   "Pioneer's Leather Wristguards",
  //   1,
  //   306,
  //   316
  // );
  // const flameTouchedChain = await createItem(
  //   "Flame-Touched Chain",
  //   1,
  //   382,
  //   392
  // );
  // const flameTouchedChainmail = await createItem(
  //   "Flame-Touched Chainmail",
  //   1,
  //   382,
  //   392
  // );
  // const flameTouchedCuffs = await createItem(
  //   "Flame-Touched Cuffs",
  //   1,
  //   382,
  //   392
  // );
  // const flameTouchedHandguards = await createItem(
  //   "Flame-Touched Handguards",
  //   1,
  //   382,
  //   392
  // );
  // const flameTouchedHelmet = await createItem(
  //   "Flame-Touched Helmet",
  //   1,
  //   382,
  //   392
  // );
  // const flameTouchedLegguards = await createItem(
  //   "Flame-Touched Legguards",
  //   1,
  //   382,
  //   392
  // );
  // const flameTouchedSpaulders = await createItem(
  //   "Flame-Touched Spaulders",
  //   1,
  //   382,
  //   392
  // );
  // const flameTouchedTreads = await createItem(
  //   "Flame-Touched Treads",
  //   1,
  //   382,
  //   392
  // );
  // const trailblazersToughenedCoif = await createItem(
  //   "Trailblazer's Toughened Coif",
  //   1,
  //   333,
  //   343
  // );
  // const trailblazersToughenedLegguards = await createItem(
  //   "Trailblazer's Toughened Legguards",
  //   1,
  //   333,
  //   343
  // );
  // const trailblazersToughenedSpikes = await createItem(
  //   "Trailblazer's Toughened Spikes",
  //   1,
  //   333,
  //   343
  // );
  // const trailblazersToughenedGrips = await createItem(
  //   "Trailblazer's Toughened Grips",
  //   1,
  //   333,
  //   343
  // );
  // const trailblazersToughenedChainbelt = await createItem(
  //   "Trailblazer's Toughened Chainbelt",
  //   1,
  //   333,
  //   343
  // );
  // const trailblazersScaleVest = await createItem(
  //   "Trailblazer's Scale Vest",
  //   1,
  //   306,
  //   316
  // );
  // const trailblazersScaleBoots = await createItem(
  //   "Trailblazer's Scale Boots",
  //   1,
  //   306,
  //   316
  // );
  // const trailblazersScaleBracers = await createItem(
  //   "Trailblazer's Scale Bracers",
  //   1,
  //   306,
  //   316
  // );
  // const expertAlchemistsHat = await createItem(
  //   "Expert Alchemist's Hat",
  //   1,
  //   356,
  //   371
  // );
  // const expertSkinnersCap = await createItem(
  //   "Expert Skinner's Cap",
  //   1,
  //   356,
  //   371
  // );
  // const flameproofApron = await createItem("Flameproof Apron", 1, 356, 371);
  // const lavishFloralPack = await createItem("Lavish Floral Pack", 1, 356, 371);
  // const masterworkSmock = await createItem("Masterwork Smock", 1, 356, 371);
  // const reinforcedPack = await createItem("Reinforced Pack", 1, 356, 371);
  // const resplendentCover = await createItem("Resplendent Cover", 1, 356, 371);
  // const shockproofGloves = await createItem("Shockproof Gloves", 1, 356, 371);
  // const alchemistsHat = await createItem("Alchemist's Hat", 1, 317, 332);
  // const smithingApron = await createItem("Smithing Apron", 1, 317, 332);
  // const jewelersCover = await createItem("Jeweler's Cover", 1, 317, 332);
  // const protectiveGloves = await createItem("Protective Gloves", 1, 317, 332);
  // const durablePack = await createItem("Durable Pack", 1, 317, 332);
  // const floralBasket = await createItem("Floral Basket", 1, 317, 332);
  // const skinnersCap = await createItem("Skinner's Cap", 1, 317, 332);
  // const resilientSmock = await createItem("Resilient Smock", 1, 317, 332);
  // const bonewroughtCrossbow = await createItem(
  //   "Bonewrought Crossbow",
  //   1,
  //   317,
  //   332
  // );
  // const ancestorsDewDrippers = await createItem(
  //   "Ancestor's Dew Drippers",
  //   1,
  //   382,
  //   392
  // );
  // const flaringCowl = await createItem("Flaring Cowl", 1, 382, 392);
  // const oldSpiritsWristwraps = await createItem(
  //   "Old Spirit's Wristwraps",
  //   1,
  //   382,
  //   392
  // );
  // const scaleReinGrips = await createItem("Scale Rein Grips", 1, 382, 392);
  // const snowballMakers = await createItem("Snowball Makers", 1, 382, 392);
  // const stringOfSpiritualKnickKnacks = await createItem(
  //   "String of Spiritual Knick-Knacks",
  //   1,
  //   382,
  //   392
  // );
  // const windSpiritsLasso = await createItem("Wind Spirit's Lasso", 1, 382, 392);
  // const alliedHeartwarmingFurCoat = await createItem(
  //   "Allied Heartwarming Fur Coat",
  //   1,
  //   382,
  //   392
  // );
  // const alliedLegguardsOfSansokKhan = await createItem(
  //   "Allied Legguards of Sansok Khan",
  //   1,
  //   382,
  //   392
  // );
  // const bowOfTheDragonHunters = await createItem(
  //   "Bow of the Dragon Hunters",
  //   1,
  //   382,
  //   392
  // );
  // //this block below need pvp ilvls
  // const infuriousBootsOfReprieve = await createItem(
  //   "Infurious Boots of Reprieve",
  //   1,
  //   382,
  //   392
  // );
  // const infuriousChainhelmProtector = await createItem(
  //   "Infurious Chainhelm Protector",
  //   1,
  //   382,
  //   392
  // );
  // const infuriousFootwrapsOfIndemnity = await createItem(
  //   "Infurious Footwraps of Indemnity",
  //   1,
  //   382,
  //   392
  // );
  // const infuriousSpiritsHood = await createItem(
  //   "Infurious Spirit's Hood",
  //   1,
  //   382,
  //   392
  // );
  // const crimsonCombatantsAdamantChainmail = await createItem(
  //   "Crimson Combatant's Adamant Chainmail",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsAdamantCowl = await createItem(
  //   "Crimson Combatant's Adamant Cowl",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsAdamantCuffs = await createItem(
  //   "Crimson Combatant's Adamant Cuffs",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsAdamantEpaulettes = await createItem(
  //   "Crimson Combatant's Adamant Epaulettes",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsAdamantGauntlets = await createItem(
  //   "Crimson Combatant's Adamant Gauntlets",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsAdamantGirdle = await createItem(
  //   "Crimson Combatant's Adamant Girdle",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsAdamantLeggings = await createItem(
  //   "Crimson Combatant's Adamant Leggings",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsAdamantTreads = await createItem(
  //   "Crimson Combatant's Adamant Treads",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsResilientBelt = await createItem(
  //   "Crimson Combatant's Resilient Belt",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsResilientBoots = await createItem(
  //   "Crimson Combatant's Resilient Boots",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsResilientChestpiece = await createItem(
  //   "Crimson Combatant's Resilient Chestpiece",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsResilientGloves = await createItem(
  //   "Crimson Combatant's Resilient Gloves",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsResilientMask = await createItem(
  //   "Crimson Combatant's Resilient Mask",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsResilientShoulderpads = await createItem(
  //   "Crimson Combatant's Resilient Shoulderpads",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsResilientTrousers = await createItem(
  //   "Crimson Combatant's Resilient Trousers",
  //   1,
  //   333,
  //   343
  // );
  // const crimsonCombatantsResilientWristwraps = await createItem(
  //   "Crimson Combatant's Resilient Wristwraps",
  //   1,
  //   333,
  //   343
  // );
  // const acidicHailstoneTreads = await createItem(
  //   "Acidic Hailstone Treads",
  //   1,
  //   382,
  //   392
  // );
  // const slimyExpulsionBoots = await createItem(
  //   "Slimy Expulsion Boots",
  //   1,
  //   382,
  //   392
  // );
  // const toxicThornFootwraps = await createItem(
  //   "Toxic Thorn Footwraps",
  //   1,
  //   382,
  //   392
  // );
  // const venomSteepedStompers = await createItem(
  //   "Venom-Steeped Stompers",
  //   1,
  //   382,
  //   392
  // );
  // const witherrotTome = await createItem("Witherrot Tome", 1, 382, 392);
  // const finishedPrototypeExplorersBarding = await createItem(
  //   "Finished Prototype Explorer's Barding"
  // );
  // const finishedPrototypeRegalBarding = await createItem(
  //   "Finished Prototype Regal Barding"
  // );
  // const earthshineScales = await createItem("Earthshine Scales", 1000);
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
  // const infuriousHide = await createItem("Infurious Hide", 1000);
  // const infuriousScales = await createItem("Infurious Scales", 1000);
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
  // const fangAdornments = await createItem("Fang Adornments", 1000);
  // const toxifiedArmorPatch = await createItem("Toxified Armor Patch", 1000);
  // const fierceArmorKit = await createItem("Fierce Armor Kit", 1000);
  // const frostedArmorKit = await createItem("Frosted Armor Kit", 1000);
  // const reinforcedArmorKit = await createItem("Reinforced Armor Kit", 1000);
  // const feralHideDrums = await createItem("Feral Hide Drums", 1000);
  // const artisansSign = await createItem("Artisan's Sign");
  // const gnollTent = await createItem("Gnoll Tent");
  // const tuskarrBeanBag = await createItem("Tuskarr Bean Bag");

  // //cooking items
  // const ooeyGooeyChocolate = await createItem("Ooey-Gooey Chocolate", 1000);
  // const impossiblySharpCuttingKnife = await createItem(
  //   "Impossibly Sharp Cutting Knife",
  //   1000
  // );
  // const saladOnTheSide = await createItem("Salad on the Side", 1000);
  // const assortedExoticSpices = await createItem("Assorted Exotic Spices", 1000);
  // const pebbledRockSalts = await createItem("Pebbled Rock Salts", 1000);
  // const breakfastOfDraconicChampions = await createItem(
  //   "Breakfast of Draconic Champions",
  //   1000
  // );
  // const sweetAndSourClamChowder = await createItem(
  //   "Sweet and Sour Clam Chowder",
  //   1000
  // );
  // const probablyProtein = await createItem("Probably Protein", 1000);
  // const cheeseAndQuackers = await createItem("Cheese and Quackers", 1000);
  // const mackerelSnackerel = await createItem("Mackerel Snackerel", 1000);
  // const twiceBakedPotato = await createItem("Twice-Baked Potato", 1000);
  // const deliciousDragonSpittle = await createItem(
  //   "Delicious Dragon Spittle",
  //   1000
  // );
  // const churnbellyTea = await createItem("Churnbelly Tea", 1000);
  // const zestyWater = await createItem("Zesty Water", 1000);
  // const fatedFortuneCookie = await createItem("Fated Fortune Cookie", 1000);
  // const blubberyMuffin = await createItem("Blubbery Muffin", 1000);
  // const celebratoryCake = await createItem("Celebratory Cake", 1000);
  // const snowInACone = await createItem("Snow in a Cone", 1000);
  // const tastyHatchlingsTreat = await createItem(
  //   "Tasty Hatchling's Treat",
  //   1000
  // );
  // const braisedBruffalonBrisket = await createItem(
  //   "Braised Bruffalon Brisket",
  //   1000
  // );
  // const charredHornswogSteaks = await createItem(
  //   "Charred Hornswog Steaks",
  //   1000
  // );
  // const hopefullyHealthy = await createItem("Hopefully Healthy", 1000);
  // const riversidePicnic = await createItem("Riverside Picnic", 1000);
  // const roastDuckDelight = await createItem("Roast Duck Delight", 1000);
  // const saltedMeatMash = await createItem("Salted Meat Mash", 1000);
  // const scrambledBasiliskEggs = await createItem(
  //   "Scrambled Basilisk Eggs",
  //   1000
  // );
  // const thriceSpicedMammothKabob = await createItem(
  //   "Thrice-Spiced Mammoth Kabob",
  //   1000
  // );
  // const filetOfFangs = await createItem("Filet of Fangs", 1000);
  // const saltBakedFishcake = await createItem("Salt-Baked Fishcake", 1000);
  // const seamothSurprise = await createItem("Seamoth Surprise", 1000);
  // const timelyDemise = await createItem("Timely Demise", 1000);
  // const aromaticSeafoodPlatter = await createItem(
  //   "Aromatic Seafood Platter",
  //   1000
  // );
  // const feistyFishSticks = await createItem("Feisty Fish Sticks", 1000);
  // const greatCeruleanSea = await createItem("Great Cerulean Sea", 1000);
  // const revengeServedCold = await createItem("Revenge, Served Cold", 1000);
  // const sizzlingSeafoodMedley = await createItem(
  //   "Sizzling Seafood Medley",
  //   1000
  // );
  // const thousandboneTongueslicer = await createItem(
  //   "Thousandbone Tongueslicer",
  //   1000
  // );
  // const grandBanquetOfTheKaluak = await createItem(
  //   "Grand Banquet of the Kalu'ak",
  //   1000
  // );
  // const hoardOfDraconicDelicacies = await createItem(
  //   "Hoard of Draconic Delicacies",
  //   1000
  // );
  // const yusasHeartyStew = await createItem("Yusa's Hearty Stew", 1000);

  //
  // SEEDING RECIPES
  //

  /*base recipe method to copy/paste, and an example:
        await(createRecipe("Name", itemName, amountMade, profession, material array, profSkill, "Category", skillUpAmount, difficulty, requiredRenown, requiredSpecialization, notes, finishing reagent array)
        material array: [ [item, amount needed], [item, amount needed], etc. ]
        required renown (if not null): {NameOfRep: "Renown Needed"}
        required specialization (if not null): {NameOfSpecialization: Level}
        finishing reagent array: [ [item, {SpecializationNeeded: Level}], [item, {SpecializationNeeded: Level}], etc. ]
        */

  //alchemy recipes - 56 total
  //advancedPhialExperimentation
  //advancedPotionExperimentation
  //basicPhialExperimentation
  //basicPotionExperimentation
  //reclaimConcoctions
  // const primalConvergentRecipe = await createRecipe(
  //   "Primal Convergent",
  //   primalConvergent,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedEarth, 1],
  //     [awakenedFire, 1],
  //     [awakenedAir, 1],
  //     [awakenedFrost, 1],
  //     [awakenedOrder, 1],
  //   ],
  //   20,
  //   "Reagents",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const omniumDraconisRecipe = await createRecipe(
  //   "Omnium Draconis",
  //   omniumDraconis,
  //   1,
  //   alchemy,
  //   [
  //     [writhebark, 1],
  //     [saxifrage, 1],
  //     [hochenblume, 5],
  //     [bubblePoppy, 1],
  //   ],
  //   10,
  //   "Reagents",
  //   1,
  //   325,
  //   null,
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const residualNeuralChannelingAgentRecipe = await createRecipe(
  //   "Residual Neural Channeling Agent",
  //   residualNeuralChannelingAgent,
  //   5,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [awakenedEarth, 1],
  //     [draconicVial, 5],
  //     [saxifrage, 10],
  //   ],
  //   null,
  //   "Air Potions",
  //   1,
  //   400,
  //   null,
  //   null,
  //   "Potion Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Potion Experimentation.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PotionLore: 25, AirFormulatedPotions: 30 },
  //     ],
  //   ]
  // );
  // const bottledPutrescenceRecipe = await createRecipe(
  //   "Bottled Putrescence",
  //   bottledPutrescence,
  //   5,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [awakenedDecay, 2],
  //     [draconicVial, 5],
  //     [hochenblume, 30],
  //   ],
  //   null,
  //   "Air Potions",
  //   3,
  //   450,
  //   null,
  //   { Decayology: 0 },
  //   "Potion Experimentation",
  //   "Altar of Decay",
  //   "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PotionLore: 25, AirFormulatedPotions: 30 },
  //     ],
  //   ]
  // );
  // const potionOfGustsRecipe = await createRecipe(
  //   "Potion of Gusts",
  //   potionOfGusts,
  //   5,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [draconicVial, 5],
  //     [saxifrage, 5],
  //     [hochenblume, 20],
  //   ],
  //   null,
  //   "Air Potions",
  //   3,
  //   150,
  //   null,
  //   null,
  //   "Potion Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Potion Experimentation.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PotionLore: 25, AirFormulatedPotions: 30 },
  //     ],
  //   ]
  // );
  // const potionOfShockingDisclosureRecipe = await createRecipe(
  //   "Potion of Shocking Disclosure",
  //   potionOfShockingDisclosure,
  //   5,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [awakenedEarth, 1],
  //     [draconicVial, 5],
  //     [hochenblume, 10],
  //   ],
  //   null,
  //   "Air Potions",
  //   3,
  //   150,
  //   null,
  //   null,
  //   "Potion Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Potion Experimentation.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PotionLore: 25, AirFormulatedPotions: 30 },
  //     ],
  //   ]
  // );
  // const potionOfTheHushedZephyrRecipe = await createRecipe(
  //   "Potion of Shocking Disclosure",
  //   potionOfShockingDisclosure,
  //   5,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [draconicVial, 5],
  //     [hochenblume, 20],
  //     [saxifrage, 8],
  //   ],
  //   null,
  //   "Air Potions",
  //   3,
  //   150,
  //   null,
  //   null,
  //   "Potion Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Potion Experimentation.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PotionLore: 25, AirFormulatedPotions: 30 },
  //     ],
  //   ]
  // );
  // const aeratedManaPotionRecipe = await createRecipe(
  //   "Aerated Mana Potion",
  //   aeratedManaPotion,
  //   5,
  //   alchemy,
  //   [
  //     [rousingAir, 1],
  //     [draconicVial, 5],
  //     [hochenblume, 15],
  //   ],
  //   5,
  //   "Air Potions",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PotionLore: 25, AirFormulatedPotions: 30 },
  //     ],
  //   ]
  // );
  // const potionOfChilledClarityRecipe = await createRecipe(
  //   "Potion of Chilled Clairty",
  //   potionOfChilledClarity,
  //   5,
  //   alchemy,
  //   [
  //     [awakenedFrost, 1],
  //     [awakenedDecay, 1],
  //     [draconicVial, 5],
  //     [bubblePoppy, 10],
  //   ],
  //   null,
  //   "Frost Potions",
  //   1,
  //   450,
  //   null,
  //   { Decayology: 0 },
  //   "Potion Experimentation",
  //   "Altar of Decay",
  //   "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPotions: 30, PotionLore: 25 },
  //     ],
  //   ]
  // );
  // const delicateSuspensionOfSporesRecipe = await createRecipe(
  //   "Delicate Suspension of Spores",
  //   delicateSuspensionOfSpores,
  //   5,
  //   alchemy,
  //   [
  //     [awakenedFrost, 1],
  //     [awakenedDecay, 1],
  //     [draconicVial, 5],
  //     [bubblePoppy, 10],
  //   ],
  //   null,
  //   "Frost Potions",
  //   1,
  //   450,
  //   null,
  //   { Decayology: 0 },
  //   "Potion Experimentation",
  //   "Altar of Decay",
  //   "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPotions: 30, PotionLore: 25 },
  //     ],
  //   ]
  // );
  // const potionOfFrozenFocusRecipe = await createRecipe(
  //   "Potion of Frozen Focus",
  //   potionOfFrozenFocus,
  //   5,
  //   alchemy,
  //   [
  //     [awakenedFrost, 1],
  //     [draconicVial, 5],
  //     [hochenblume, 20],
  //     [saxifrage, 8],
  //   ],
  //   null,
  //   "Frost Potions",
  //   1,
  //   400,
  //   null,
  //   null,
  //   "Potion Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Potion Experimentation.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPotions: 30, PotionLore: 25 },
  //     ],
  //   ]
  // );
  // const potionOfWitheringVitalityRecipe = await createRecipe(
  //   "Potion of Withering Vitality",
  //   potionOfWitheringVitality,
  //   5,
  //   alchemy,
  //   [
  //     [awakenedFrost, 1],
  //     [awakenedDecay, 1],
  //     [draconicVial, 5],
  //     [writhebark, 10],
  //   ],
  //   null,
  //   "Frost Potions",
  //   1,
  //   450,
  //   null,
  //   { Decayology: 0 },
  //   "Potion Experimentation",
  //   "Altar of Decay",
  //   "Learned via Potion Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPotions: 30, PotionLore: 25 },
  //     ],
  //   ]
  // );
  // const potionOfFrozenFatalityRecipe = await createRecipe(
  //   "Potion of Frozen Fatality",
  //   potionOfFrozenFatality,
  //   5,
  //   alchemy,
  //   [
  //     [awakenedFrost, 1],
  //     [draconicVial, 5],
  //     [writhebark, 5],
  //     [hochenblume, 20],
  //   ],
  //   null,
  //   "Frost Potions",
  //   3,
  //   200,
  //   null,
  //   null,
  //   "Potion Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Potion Experimentation.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPotions: 30, PotionLore: 25 },
  //     ],
  //   ]
  // );
  // const refreshingHealingPotionRecipe = await createRecipe(
  //   "Refreshing Healing Potion",
  //   refreshingHealingPotion,
  //   5,
  //   alchemy,
  //   [
  //     [rousingFrost, 1],
  //     [draconicVial, 5],
  //     [hochenblume, 8],
  //   ],
  //   1,
  //   "Frost Potions",
  //   3,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPotions: 30, PotionLore: 25 },
  //     ],
  //   ]
  // );
  // const potionCauldronOfUltimatePowerRecipe = await createRecipe(
  //   "Potion Cauldron of Ultimate Power",
  //   potionCauldronOfUltimatePower,
  //   1,
  //   alchemy,
  //   [
  //     [elementalPotionOfPower, 150],
  //     [omniumDraconis, 20],
  //   ],
  //   null,
  //   "Cauldrons",
  //   2,
  //   450,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Alchemist's Lab Bench",
  //   "Learned from Elemental Codex of Ultimate Power, which drops from Vault of the Incarnates bosses on Heroic & Mythic.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Illustrious Insight",
  //       {
  //         FrostFormulatedPotions: 30,
  //         PotionLore: 25,
  //         AirFormulatedPotions: 30,
  //       },
  //     ],
  //   ]
  // );
  // const potionCauldronOfPowerRecipe = await createRecipe(
  //   "Potion Cauldron of Power",
  //   potionCauldronOfPower,
  //   1,
  //   alchemy,
  //   [
  //     [elementalPotionOfPower, 100],
  //     [omniumDraconis, 10],
  //   ],
  //   null,
  //   "Cauldrons",
  //   2,
  //   425,
  //   null,
  //   { BatchProduction: 10 },
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Illustrious Insight",
  //       {
  //         FrostFormulatedPotions: 30,
  //         PotionLore: 25,
  //         AirFormulatedPotions: 30,
  //       },
  //     ],
  //   ]
  // );
  // const cauldronOfThePookaRecipe = await createRecipe(
  //   "Cauldron of the Pooka",
  //   cauldronOfThePooka,
  //   2,
  //   alchemy,
  //   [
  //     [tuftOfPrimalWool, 1],
  //     [omniumDraconis, 1],
  //     [primalConvergent, 2],
  //   ],
  //   null,
  //   "Cauldrons",
  //   1,
  //   300,
  //   null,
  //   null,
  //   "World Drop",
  //   "Alchemist's Lab Bench",
  //   "Drops from Draconic Recipe in a Bottle.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       {
  //         FrostFormulatedPotions: 30,
  //         PotionLore: 25,
  //         AirFormulatedPotions: 30,
  //       },
  //     ],
  //   ]
  // );
  // const elementalPotionOfUltimatePowerRecipe = await createRecipe(
  //   "Elemental Potion of Ultimate Power",
  //   elementalPotionOfUltimatePower,
  //   20,
  //   alchemy,
  //   [
  //     [primalChaos, 20],
  //     [awakenedOrder, 2],
  //     [elementalPotionOfPower, 30],
  //   ],
  //   null,
  //   "Elemental Phials and Potions",
  //   1,
  //   450,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Alchemist's Lab Bench",
  //   "Learned from Elemental Codex of Ultimate Power, which drops from Vault of the Incarnates bosses on Heroic & Mythic.",
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Illustrious Insight",
  //       {
  //         FrostFormulatedPotions: 30,
  //         PotionLore: 25,
  //         AirFormulatedPotions: 30,
  //       },
  //     ],
  //   ]
  // );
  // const elementalPotionOfPowerRecipe = await createRecipe(
  //   "Elemental Potion of Power",
  //   elementalPotionOfPower,
  //   5,
  //   alchemy,
  //   [
  //     [draconicVial, 5],
  //     [omniumDraconis, 3],
  //     [primalConvergent, 1],
  //   ],
  //   50,
  //   "Elemental Phials and Potions",
  //   3,
  //   425,
  //   null,
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       {
  //         FrostFormulatedPotions: 30,
  //         PotionLore: 25,
  //         AirFormulatedPotions: 30,
  //       },
  //     ],
  //   ]
  // );
  // const phialOfElementalChaosRecipe = await createRecipe(
  //   "Phial of Elemental Chaos",
  //   phialOfElementalChaos,
  //   2,
  //   alchemy,
  //   [
  //     [draconicVial, 2],
  //     [primalConvergent, 1],
  //     [omniumDraconis, 2],
  //   ],
  //   null,
  //   "Elemental Phials and Potions",
  //   1,
  //   450,
  //   null,
  //   null,
  //   "Phial Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Phial Experimentation.",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPhials: 30, PhialLore: 25, AirFormulatedPhials: 30 },
  //     ],
  //   ]
  // );
  // const phialOfChargedIsolationRecipe = await createRecipe(
  //   "Phial of Charged Isolation",
  //   phialOfChargedIsolation,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [awakenedEarth, 1],
  //     [draconicVial, 2],
  //     [saxifrage, 9],
  //   ],
  //   null,
  //   "Air Phials",
  //   1,
  //   400,
  //   null,
  //   null,
  //   "Phial Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Phial Experimentation",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PhialLore: 25, AirFormulatedPhials: 30 },
  //     ],
  //   ]
  // );
  // const phialOfStaticEmpowermentRecipe = await createRecipe(
  //   "Phial of Static Empowerment",
  //   phialOfStaticEmpowerment,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [awakenedEarth, 1],
  //     [draconicVial, 2],
  //     [bubblePoppy, 5],
  //   ],
  //   null,
  //   "Air Phials",
  //   1,
  //   400,
  //   null,
  //   null,
  //   "Phial Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Phial Experimentation",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PhialLore: 25, AirFormulatedPhials: 30 },
  //     ],
  //   ]
  // );
  // const phialOfStillAirRecipe = await createRecipe(
  //   "Phial of Still Air",
  //   phialOfStillAir,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [draconicVial, 2],
  //     [bubblePoppy, 10],
  //     [saxifrage, 5],
  //   ],
  //   null,
  //   "Air Phials",
  //   1,
  //   400,
  //   null,
  //   null,
  //   "Phial Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Phial Experimentation",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PhialLore: 25, AirFormulatedPhials: 30 },
  //     ],
  //   ]
  // );
  // const phialOfTheEyeInTheStormRecipe = await createRecipe(
  //   "Phial of the Eye in the Storm",
  //   phialOfTheEyeInTheStorm,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [draconicVial, 2],
  //     [bubblePoppy, 5],
  //     [saxifrage, 10],
  //   ],
  //   null,
  //   "Air Phials",
  //   1,
  //   400,
  //   null,
  //   null,
  //   "Phial Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Phial Experimentation",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PhialLore: 25, AirFormulatedPhials: 30 },
  //     ],
  //   ]
  // );
  // const aeratedPhialOfDeftnessRecipe = await createRecipe(
  //   "Aerated Phial of Deftness",
  //   aeratedPhialOfDeftness,
  //   10,
  //   alchemy,
  //   [
  //     [artisansMettle, 10],
  //     [awakenedAir, 2],
  //     [draconicVial, 10],
  //     [saxifrage, 10],
  //   ],
  //   null,
  //   "Air Phials",
  //   2,
  //   400,
  //   null,
  //   null,
  //   "Phial Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Phial Experimentation",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PhialLore: 25, AirFormulatedPhials: 30 },
  //     ],
  //   ]
  // );
  // const chargedPhialOfAlacrityRecipe = await createRecipe(
  //   "Charged Phial of Alacrity",
  //   chargedPhialOfAlacrity,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [awakenedEarth, 1],
  //     [draconicVial, 2],
  //     [writhebark, 4],
  //   ],
  //   null,
  //   "Air Phials",
  //   1,
  //   200,
  //   null,
  //   null,
  //   "Phial Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Phial Experimentation",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PhialLore: 25, AirFormulatedPhials: 30 },
  //     ],
  //   ]
  // );
  // const aeratedPhialOfQuickHandsRecipe = await createRecipe(
  //   "Aerated Phial of Quick Hands",
  //   aeratedPhialOfQuickHands,
  //   2,
  //   alchemy,
  //   [
  //     [rousingAir, 4],
  //     [draconicVial, 2],
  //     [hochenblume, 8],
  //   ],
  //   null,
  //   "Air Phials",
  //   2,
  //   200,
  //   { ArtisansConsortium: "Respected" },
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { PhialLore: 25, AirFormulatedPhials: 30 },
  //     ],
  //   ]
  // );
  // const phialOfIcyPreservationRecipe = await createRecipe(
  //   "Phial of Icy Preservation",
  //   phialOfIcyPreservation,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedDecay, 1],
  //     [awakenedFrost, 1],
  //     [draconicVial, 2],
  //     [saxifrage, 9],
  //   ],
  //   null,
  //   "Frost Phials",
  //   1,
  //   450,
  //   null,
  //   { Decayology: 0 },
  //   "Phial Experimentation",
  //   "Altar of Decay",
  //   "Learned via Phial Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPhials: 30, PhialLore: 25 },
  //     ],
  //   ]
  // );
  // const icedPhialOfCorruptingRageRecipe = await createRecipe(
  //   "Iced Phial of Corrupting Rage",
  //   icedPhialOfCorruptingRage,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedDecay, 1],
  //     [awakenedFrost, 1],
  //     [draconicVial, 2],
  //     [writhebark, 9],
  //   ],
  //   null,
  //   "Frost Phials",
  //   1,
  //   450,
  //   null,
  //   { Decayology: 0 },
  //   "Phial Experimentation",
  //   "Altar of Decay",
  //   "Learned via Phial Experimentation while having the Decayology specialization. Must be crafted at Altar of Decay.",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPhials: 30, PhialLore: 25 },
  //     ],
  //   ]
  // );
  // const phialOfGlacialFuryRecipe = await createRecipe(
  //   "Phial of Glacial Fury",
  //   phialOfGlacialFury,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedFrost, 1],
  //     [draconicVial, 2],
  //     [writhebark, 5],
  //     [bubblePoppy, 10],
  //   ],
  //   null,
  //   "Frost Phials",
  //   1,
  //   400,
  //   null,
  //   null,
  //   "Phial Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Phial Experimentation.",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPhials: 30, PhialLore: 25 },
  //     ],
  //   ]
  // );
  // const steamingPhialOfFinesseRecipe = await createRecipe(
  //   "Steaming Phial of Finesse",
  //   steamingPhialOfFinesse,
  //   10,
  //   alchemy,
  //   [
  //     [artisansMettle, 10],
  //     [awakenedFrost, 1],
  //     [awakenedFire, 1],
  //     [draconicVial, 10],
  //     [writhebark, 8],
  //   ],
  //   null,
  //   "Frost Phials",
  //   2,
  //   400,
  //   null,
  //   null,
  //   "Phial Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Phial Experimentation.",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPhials: 30, PhialLore: 25 },
  //     ],
  //   ]
  // );
  // const crystallinePhialOfPerceptionRecipe = await createRecipe(
  //   "Crystalline Phial of Perception",
  //   crystallinePhialOfPerception,
  //   10,
  //   alchemy,
  //   [
  //     [artisansMettle, 10],
  //     [awakenedFrost, 2],
  //     [draconicVial, 10],
  //     [bubblePoppy, 10],
  //   ],
  //   null,
  //   "Frost Phials",
  //   2,
  //   400,
  //   null,
  //   null,
  //   "Phial Experimentation",
  //   "Alchemist's Lab Bench",
  //   "Learned via Phial Experimentation.",
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPhials: 30, PhialLore: 25 },
  //     ],
  //   ]
  // );
  // const phialOfTepidVersatilityRecipe = await createRecipe(
  //   "Phial of Tepid Versatility",
  //   phialOfTepidVersatility,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedFrost, 2],
  //     [draconicVial, 2],
  //     [hochenblume, 16],
  //   ],
  //   25,
  //   "Frost Phials",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { FrostFormulatedPhials: 30, PhialLore: 25 },
  //     ],
  //   ]
  // );
  // // const transmuteDecayToElementsRecipe = await(createRecipe("Transmute: Decay to Elements", transmuteDecayToElements, 1, alchemy, [[awakenedDecay, 1]], null, "Transmutations", 1, null, null, {Decayology: 20}, null, "Alchemist's Lab Bench", "Recover an 'assortment' of Rousing Elements. Has a CD."));
  // // const transmuteOrderToElementsRecipe = await(createRecipe("Transmute: Order to Elements", transmuteOrderToElements, 1, alchemy, [[awakenedOrder, 1]], null, "Transmutations", 1, null, null, {Transmutation: 10}, null, "Alchemist's Lab Bench", "Creates one Awakened Air, Earth, Fire, & Frost. Has a CD."));
  // const transmuteAwakenedAir = await createRecipe(
  //   "Transmute: Awakened Air",
  //   awakenedAir,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedFrost, 1],
  //     [awakenedFire, 1],
  //   ],
  //   15,
  //   "Transmutations",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   "Has a CD."
  // );
  // const transmuteAwakenedEarth = await createRecipe(
  //   "Transmute: Awakened Earth",
  //   awakenedEarth,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedFrost, 1],
  //     [awakenedFire, 1],
  //   ],
  //   15,
  //   "Transmutations",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   "Has a CD."
  // );
  // const transmuteAwakenedFire = await createRecipe(
  //   "Transmute: Awakened Fire",
  //   awakenedFire,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedEarth, 1],
  //     [awakenedAir, 1],
  //   ],
  //   15,
  //   "Transmutations",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   "Has a CD."
  // );
  // const transmuteAwakenedFrost = await createRecipe(
  //   "Transmute: Awakened Frost",
  //   awakenedFrost,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedEarth, 1],
  //     [awakenedAir, 1],
  //   ],
  //   15,
  //   "Transmutations",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   "Has a CD."
  // );
  // const potionAbsorptionInhibitorRecipe = await createRecipe(
  //   "Potion Absorption Inhibitor",
  //   potionAbsorptionInhibitor,
  //   1,
  //   alchemy,
  //   [
  //     [saxifrage, 10],
  //     [hochenblume, 20],
  //     [bubblePoppy, 10],
  //     [primalConvergent, 4],
  //   ],
  //   null,
  //   "Optional Reagents",
  //   1,
  //   325,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Alchemist's Lab Bench",
  //   "Drops from 'bosses in Vault of the Incarnates'.",
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const illustriousInsightRecipeAlchemy = await createRecipe(
  //   "Illustrious Insight",
  //   illustriousInsight,
  //   1,
  //   alchemy,
  //   [[artisansMettle, 50]],
  //   null,
  //   "Finishing Reagents",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Various Specializations",
  //   "Alchemist's Lab Bench"
  // );
  // const writhefireOilRecipe = await createRecipe(
  //   "Writhefire Oil",
  //   writhefireOil,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedFire, 1],
  //     [writhebark, 1],
  //     [hochenblume, 2],
  //   ],
  //   35,
  //   "Finishing Reagents",
  //   1,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const broodSaltRecipe = await createRecipe(
  //   "Brood Salt",
  //   broodSalt,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedFrost, 1],
  //     [saxifrage, 6],
  //     [hochenblume, 12],
  //   ],
  //   null,
  //   "Finishing Reagents",
  //   1,
  //   300,
  //   null,
  //   { ChemicalSynthesis: 20 },
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const stableFluidicDraconiumRecipe = await createRecipe(
  //   "Stable Fluidic Draconium",
  //   stableFluidicDraconium,
  //   2,
  //   alchemy,
  //   [
  //     [awakenedAir, 1],
  //     [draconiumOre, 3],
  //     [writhebark, 3],
  //   ],
  //   null,
  //   "Finishing Reagents",
  //   1,
  //   300,
  //   { ArtisansConsortium: "Respected" },
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const agitatingPotionAugmentationRecipe = await createRecipe(
  //   "Agitating Potion Augmentation",
  //   agitatingPotionAugmentation,
  //   2,
  //   alchemy,
  //   [
  //     [saxifrage, 5],
  //     [hochenblume, 12],
  //     [bubblePoppy, 6],
  //   ],
  //   null,
  //   "Finishing Reagents",
  //   1,
  //   300,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const reactivePhialEmbellishmentRecipe = await createRecipe(
  //   "Reactive Phial Embellishment",
  //   reactivePhialEmbellishment,
  //   2,
  //   alchemy,
  //   [
  //     [writhebark, 6],
  //     [hochenblume, 12],
  //     [bubblePoppy, 6],
  //   ],
  //   null,
  //   "Finishing Reagents",
  //   1,
  //   300,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const sagaciousIncenseRecipe = await createRecipe(
  //   "Sagacious Incense",
  //   sagaciousIncense,
  //   2,
  //   alchemy,
  //   [
  //     [primalConvergent, 1],
  //     [saxifrage, 5],
  //   ],
  //   null,
  //   "Incense",
  //   1,
  //   300,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const exultantIncenseRecipe = await createRecipe(
  //   "Exultant Incense",
  //   exultantIncense,
  //   2,
  //   alchemy,
  //   [
  //     [saxifrage, 6],
  //     [hochenblume, 6],
  //   ],
  //   null,
  //   "Incense",
  //   1,
  //   250,
  //   { MaruukCentaur: 22 },
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const fervidIncenseRecipe = await createRecipe(
  //   "Fervid Incense",
  //   fervidIncense,
  //   2,
  //   alchemy,
  //   [
  //     [writhebark, 6],
  //     [hochenblume, 6],
  //   ],
  //   null,
  //   "Incense",
  //   1,
  //   150,
  //   null,
  //   null,
  //   "World Drop",
  //   "Alchemist's Lab Bench",
  //   "Drops from Draconic Recipe in a Bottle.",
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const somniferousIncenseRecipe = await createRecipe(
  //   "Somniferous Incense",
  //   somniferousIncense,
  //   2,
  //   alchemy,
  //   [
  //     [bubblePoppy, 6],
  //     [hochenblume, 6],
  //   ],
  //   null,
  //   "Incense",
  //   1,
  //   250,
  //   null,
  //   null,
  //   "World Drop",
  //   "Alchemist's Lab Bench",
  //   "Drops from Draconic Recipe in a Bottle.",
  //   [["Lesser Illustrious Insight", { ChemicalSynthesis: 35 }]]
  // );
  // const alacritousAlchemistStoneRecipe = await createRecipe(
  //   "Alacritous Alchemist Stone",
  //   alacritousAlchemistStone,
  //   1,
  //   alchemy,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 60],
  //     [glowingTitanOrb, 1],
  //     [omniumDraconis, 15],
  //     [elementalPotionOfPower, 12],
  //     [potionOfFrozenFocus, 12],
  //   ],
  //   null,
  //   "Alchemist Stones",
  //   1,
  //   275,
  //   { MaruukCentaur: 13 },
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [
  //     ["Primal Infusion", {}],
  //     ["Alchemical Catalyst", { PotionMastery: 30 }],
  //     ["Illustrious Insight", { PotionLore: 25 }],
  //   ]
  // );
  // const sustainingAlchemistStoneRecipe = await createRecipe(
  //   "Sustaining Alchemist Stone",
  //   sustainingAlchemistStone,
  //   1,
  //   alchemy,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 60],
  //     [glowingTitanOrb, 1],
  //     [primalConvergent, 4],
  //     [phialOfTepidVersatility, 6],
  //     [phialOfElementalChaos, 6],
  //   ],
  //   1,
  //   "Alchemist Stones",
  //   1,
  //   275,
  //   { ValdrakkenAccord: 14 },
  //   null,
  //   null,
  //   "Alchemist's Lab Bench",
  //   null,
  //   [
  //     ["Primal Infusion", {}],
  //     ["Alchemical Catalyst", { PhialMastery: 30 }],
  //     ["Illustrious Insight", { PhialLore: 25 }],
  //   ]
  // );

  // //blacksmithing recipes - 86 total
  // const obsidianSearedAlloyRecipe = await createRecipe(
  //   "Obsidian Seared Alloy",
  //   obsidianSearedAlloy,
  //   2,
  //   blacksmithing,
  //   [
  //     [awakenedOrder, 1],
  //     [awakenedFire, 1],
  //     [primalFlux, 6],
  //     [draconiumOre, 10],
  //     [khazgoriteOre, 8],
  //   ],
  //   null,
  //   "Smelting",
  //   1,
  //   325,
  //   null,
  //   null,
  //   "Quest",
  //   "Earth-Warder's Forge",
  //   "Unlocked via 'A Head For Metal' quest in the Waking Shores.",
  //   [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  // );
  // const frostfireAlloyRecipe = await createRecipe(
  //   "Frostfire Alloy",
  //   frostfireAlloy,
  //   2,
  //   blacksmithing,
  //   [
  //     [awakenedFire, 1],
  //     [awakenedFrost, 1],
  //     [primalFlux, 4],
  //     [draconiumOre, 5],
  //     [khazgoriteOre, 4],
  //   ],
  //   25,
  //   "Smelting",
  //   1,
  //   325,
  //   null,
  //   null,
  //   null,
  //   "Forge",
  //   null,
  //   [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  // );
  // const infuriousAlloyRecipe = await createRecipe(
  //   "Infurious Alloy",
  //   infuriousAlloy,
  //   2,
  //   blacksmithing,
  //   [
  //     [awakenedIre, 2],
  //     [primalFlux, 3],
  //     [draconiumOre, 4],
  //     [khazgoriteOre, 2],
  //   ],
  //   null,
  //   "Smelting",
  //   1,
  //   200,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Forge",
  //   "Received from Arena, BGs, or WM?",
  //   [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  // );
  // const primalMoltenAlloyRecipe = await createRecipe(
  //   "Primal Molten Alloy",
  //   primalMoltenAlloy,
  //   2,
  //   blacksmithing,
  //   [
  //     [awakenedEarth, 1],
  //     [awakenedFire, 1],
  //     [primalFlux, 4],
  //     [draconiumOre, 5],
  //     [khazgoriteOre, 4],
  //   ],
  //   25,
  //   "Smelting",
  //   1,
  //   325,
  //   null,
  //   null,
  //   null,
  //   "Forge",
  //   null,
  //   [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  // );
  // const illustriousInsightRecipeBlacksmithing = await createRecipe(
  //   "Illustrious Insight",
  //   illustriousInsight,
  //   1,
  //   blacksmithing,
  //   [[artisansMettle, 50]],
  //   null,
  //   "Finishing Reagents",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Various Specializations",
  //   "Anvil"
  // );
  // const armorSpikesRecipe = await createRecipe(
  //   "Armor Spikes",
  //   armorSpikes,
  //   1,
  //   blacksmithing,
  //   [
  //     [awakenedFire, 3],
  //     [aquaticMaw, 2],
  //     [sereviteOre, 30],
  //     [khazgoriteOre, 15],
  //   ],
  //   null,
  //   "Optional Reagents",
  //   1,
  //   325,
  //   { ArtisansConsortium: "Respected" },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  // );
  // const alliedChestplateOfGenerosityRecipe = await createRecipe(
  //   "Allied Chestplate of Generosity",
  //   alliedChestplateOfGenerosity,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [centaursTrophyNecklace, 1],
  //     [obsidianSearedAlloy, 10],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   325,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Anvil",
  //   "Drops from bosses in Vault of the Incarnates.",
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Illustrious Insight", { Breastplates: 20 }],
  //   ]
  // );
  // const alliedWristguardOfCompanionshipRecipe = await createRecipe(
  //   "Allied Wristguard of Companionship",
  //   alliedWristguardOfCompanionship,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 30],
  //     [centaursTrophyNecklace, 1],
  //     [obsidianSearedAlloy, 8],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   325,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Anvil",
  //   "Drops from bosses in Vault of the Incarnates.",
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Illustrious Insight", { Vambraces: 20 }],
  //   ]
  // );
  // const frostfireLegguardsOfPreparationRecipe = await createRecipe(
  //   "Frostfire Legguards of Preparation",
  //   frostfireLegguardsOfPreparation,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [frostySoul, 1],
  //     [fierySoul, 1],
  //     [frostfireAlloy, 16],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   325,
  //   null,
  //   null,
  //   "Dungeon Drop",
  //   "Anvil",
  //   "Drops from Algeth'ar Academy & The Azure Vault.",
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Illustrious Insight", { Greaves: 20 }],
  //   ]
  // );
  // const infuriousHelmOfVengeanceRecipe = await createRecipe(
  //   "Infurious Helm of Vengeance",
  //   infuriousHelmOfVengeance,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [obsidianSearedAlloy, 2],
  //     [infuriousAlloy, 20],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   325,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Anvil",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Illustrious Insight", { Helms: 20 }],
  //   ]
  // );
  // const infuriousWarbootsOfImpunityRecipe = await createRecipe(
  //   "Infurious Warboots of Impunity",
  //   infuriousWarbootsOfImpunity,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [largeSturdyFemur, 2],
  //     [obsidianSearedAlloy, 2],
  //     [infuriousAlloy, 16],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   325,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Anvil",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Illustrious Insight", { Sabatons: 20 }],
  //   ]
  // );
  // const primalMoltenBreastplateRecipe = await createRecipe(
  //   "Primal Molten Breastplate",
  //   primalMoltenBreastplate,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [primalMoltenAlloy, 16],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   280,
  //   null,
  //   { Breastplates: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Missive", { LargePlateArmor: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Illustrious Insight", { Breastplates: 20 }],
  //   ]
  // );
  // const primalMoltenGauntletsRecipe = await createRecipe(
  //   "Primal Molten Gauntlets",
  //   primalMoltenGauntlets,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [primalMoltenAlloy, 14],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   280,
  //   null,
  //   { Gauntlets: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Missive", { FineArmor: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Illustrious Insight", { Gauntlets: 20 }],
  //   ]
  // );
  // const primalMoltenGreatbeltRecipe = await createRecipe(
  //   "Primal Molten Greatbelt",
  //   primalMoltenGreatbelt,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [primalMoltenAlloy, 13],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   280,
  //   null,
  //   { Belts: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Missive", { FineArmor: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Illustrious Insight", { Belts: 20 }],
  //   ]
  // );
  // const primalMoltenHelmRecipe = await createRecipe(
  //   "Primal Molten Helm",
  //   primalMoltenHelm,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [primalMoltenAlloy, 16],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   280,
  //   null,
  //   { Helms: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Missive", { SculptedArmor: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Illustrious Insight", { Helms: 20 }],
  //   ]
  // );
  // const primalMoltenLegplatesRecipe = await createRecipe(
  //   "Primal Molten Legplates",
  //   primalMoltenLegplates,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [primalMoltenAlloy, 16],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   280,
  //   null,
  //   { Greaves: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Missive", { LargePlateArmor: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Illustrious Insight", { Greaves: 20 }],
  //   ]
  // );
  // const primalMoltenPauldronsRecipe = await createRecipe(
  //   "Primal Molten Pauldrons",
  //   primalMoltenPauldrons,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [primalMoltenAlloy, 15],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   280,
  //   null,
  //   { Pauldrons: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Missive", { SculptedArmor: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Illustrious Insight", { Pauldrons: 20 }],
  //   ]
  // );
  // const primalMoltenSabatonsRecipe = await createRecipe(
  //   "Primal Molten Sabatons",
  //   primalMoltenSabatons,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [primalMoltenAlloy, 14],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   280,
  //   null,
  //   { Sabatons: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Missive", { SculptedArmor: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Illustrious Insight", { Sabatons: 20 }],
  //   ]
  // );
  // const primalMoltenVambracesRecipe = await createRecipe(
  //   "Primal Molten Vambraces",
  //   primalMoltenVambraces,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 30],
  //     [primalMoltenAlloy, 14],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   280,
  //   null,
  //   { Vambraces: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Missive", { FineArmor: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Illustrious Insight", { Vambraces: 20 }],
  //   ]
  // );
  // const unstableFrostfireBeltRecipe = await createRecipe(
  //   "Unstable Frostfire Belt",
  //   unstableFrostfireBelt,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [frostySoul, 1],
  //     [fierySoul, 1],
  //     [frostfireAlloy, 13],
  //   ],
  //   null,
  //   "Armor",
  //   1,
  //   325,
  //   null,
  //   null,
  //   "Dungeon Drop",
  //   "Anvil",
  //   "Drops from Algeth'ar Academy & The Azure Vault.",
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Illustrious Insight", { Belts: 20 }],
  //   ]
  // );
  // const explorersExpertHelmRecipe = await createRecipe(
  //   "Explorer's Expert Helm",
  //   explorersExpertHelm,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 2],
  //     [draconiumOre, 7],
  //     [sereviteOre, 14],
  //   ],
  //   50,
  //   "Armor",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { SculptedArmor: 0 }],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Helms: 20 }],
  //   ]
  // );
  // const explorersExpertSpauldersRecipe = await createRecipe(
  //   "Explorer's Expert Spaulders",
  //   explorersExpertSpaulders,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 2],
  //     [draconiumOre, 6],
  //     [sereviteOre, 12],
  //   ],
  //   45,
  //   "Armor",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { SculptedArmor: 0 }],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Pauldrons: 20 }],
  //   ]
  // );
  // const explorersExpertGauntletsRecipe = await createRecipe(
  //   "Explorer's Expert Gauntlets",
  //   explorersExpertGauntlets,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 2],
  //     [draconiumOre, 6],
  //     [sereviteOre, 12],
  //   ],
  //   40,
  //   "Armor",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { FineArmor: 0 }],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Gauntlets: 20 }],
  //   ]
  // );
  // const crimsonCombatantsDraconiumArmguardsRecipe = await createRecipe(
  //   "Crimson Combatant's Draconium Armguards",
  //   crimsonCombatantsDraconiumArmguards,
  //   1,
  //   blacksmithing,
  //   [[infuriousAlloy, 2]],
  //   null,
  //   "Armor",
  //   2,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Anvil",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { FineArmor: 0 }],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Vambraces: 20 }],
  //   ]
  // );
  // const crimsonCombatantsDraconiumBreastplateRecipe = await createRecipe(
  //   "Crimson Combatant's Draconium Breastplate",
  //   crimsonCombatantsDraconiumBreastplate,
  //   1,
  //   blacksmithing,
  //   [[infuriousAlloy, 2]],
  //   null,
  //   "Armor",
  //   2,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Anvil",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { LargePlateArmor: 0 }],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Breastplates: 20 }],
  //   ]
  // );
  // const crimsonCombatantsDraconiumGauntletsRecipe = await createRecipe(
  //   "Crimson Combatant's Draconium Gauntlets",
  //   crimsonCombatantsDraconiumGauntlets,
  //   1,
  //   blacksmithing,
  //   [[infuriousAlloy, 2]],
  //   null,
  //   "Armor",
  //   2,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Anvil",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { FineArmor: 0 }],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Gauntlets: 20 }],
  //   ]
  // );
  // const crimsonCombatantsDraconiumGreavesRecipe = await createRecipe(
  //   "Crimson Combatant's Draconium Greaves",
  //   crimsonCombatantsDraconiumGreaves,
  //   1,
  //   blacksmithing,
  //   [[infuriousAlloy, 2]],
  //   null,
  //   "Armor",
  //   2,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Anvil",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { LargePlateArmor: 0 }],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Greaves: 20 }],
  //   ]
  // );
  // const crimsonCombatantsDraconiumHelmRecipe = await createRecipe(
  //   "Crimson Combatant's Draconium Helm",
  //   crimsonCombatantsDraconiumHelm,
  //   1,
  //   blacksmithing,
  //   [[infuriousAlloy, 2]],
  //   null,
  //   "Armor",
  //   2,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Anvil",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { SculptedArmor: 0 }],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Helms: 20 }],
  //   ]
  // );
  // const crimsonCombatantsDraconiumPauldronsRecipe = await createRecipe(
  //   "Crimson Combatant's Draconium Pauldrons",
  //   crimsonCombatantsDraconiumPauldrons,
  //   1,
  //   blacksmithing,
  //   [[infuriousAlloy, 2]],
  //   null,
  //   "Armor",
  //   2,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Anvil",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { SculptedArmor: 0 }],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Pauldrons: 20 }],
  //   ]
  // );
  // const crimsonCombatantsDraconiumSabatonsRecipe = await createRecipe(
  //   "Crimson Combatant's Draconium Sabatons",
  //   crimsonCombatantsDraconiumSabatons,
  //   1,
  //   blacksmithing,
  //   [[infuriousAlloy, 2]],
  //   null,
  //   "Armor",
  //   2,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Anvil",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { SculptedArmor: 0 }],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Sabatons: 20 }],
  //   ]
  // );
  // const crimsonCombatantsDraconiumWaistguardRecipe = await createRecipe(
  //   "Crimson Combatant's Draconium Waistguard",
  //   crimsonCombatantsDraconiumWaistguard,
  //   1,
  //   blacksmithing,
  //   [[infuriousAlloy, 2]],
  //   null,
  //   "Armor",
  //   2,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Anvil",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { FineArmor: 0 }],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Belts: 20 }],
  //   ]
  // );
  // const explorersExpertGreavesRecipe = await createRecipe(
  //   "Explorer's Expert Greaves",
  //   explorersExpertGreaves,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 2],
  //     [draconiumOre, 7],
  //     [sereviteOre, 14],
  //   ],
  //   35,
  //   "Armor",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { LargePlateArmor: 0 }],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Greaves: 20 }],
  //   ]
  // );
  // const explorersExpertClaspRecipe = await createRecipe(
  //   "Explorer's Expert Clasp",
  //   explorersExpertClasp,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 2],
  //     [draconiumOre, 4],
  //     [sereviteOre, 10],
  //   ],
  //   30,
  //   "Armor",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { FineArmor: 0 }],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Belts: 20 }],
  //   ]
  // );
  // const explorersPlateChestguardRecipe = await createRecipe(
  //   "Explorer's Plate Chestguard",
  //   explorersPlateChestguard,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 2],
  //     [draconiumOre, 3],
  //     [sereviteOre, 10],
  //   ],
  //   10,
  //   "Armor",
  //   3,
  //   40,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { LargePlateArmor: 0 }],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Breastplates: 20 }],
  //   ]
  // );
  // const explorersPlateBootsRecipe = await createRecipe(
  //   "Explorer's Plate Boots",
  //   explorersPlateBoots,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 2],
  //     [draconiumOre, 3],
  //     [sereviteOre, 10],
  //   ],
  //   5,
  //   "Armor",
  //   3,
  //   40,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { SculptedArmor: 0 }],
  //     ["Quenching Fluid", { SculptedArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Sabatons: 20 }],
  //   ]
  // );
  // const explorersPlateBracersRecipe = await createRecipe(
  //   "Explorer's Plate Bracers",
  //   explorersPlateBracers,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 2],
  //     [draconiumOre, 3],
  //     [sereviteOre, 8],
  //   ],
  //   1,
  //   "Armor",
  //   3,
  //   40,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   "Learned by default.",
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { FineArmor: 0 }],
  //     ["Quenching Fluid", { FineArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Vambraces: 20 }],
  //   ]
  // );
  // const primalMoltenDefenderRecipe = await createRecipe(
  //   "Primal Molten Defender",
  //   primalMoltenDefender,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [primalMoltenAlloy, 15],
  //   ],
  //   null,
  //   "Shields",
  //   1,
  //   280,
  //   null,
  //   { Shields: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Missive", { LargePlateArmor: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Illustrious Insight", { Shields: 20 }],
  //   ]
  // );
  // const shieldOfTheHearthRecipe = await createRecipe(
  //   "Shield of the Hearth",
  //   shieldOfTheHearth,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [earthenSoul, 1],
  //     [glowingTitanOrb, 1],
  //     [primalMoltenAlloy, 16],
  //   ],
  //   null,
  //   "Shields",
  //   1,
  //   325,
  //   null,
  //   null,
  //   "World Drop",
  //   "Anvil",
  //   "Apparently is 'stashed within the Dragon Isles'?",
  //   [
  //     ["Primal Infusion", { Armorsmithing: 0 }],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Illustrious Insight", { Shields: 20 }],
  //   ]
  // );
  // const draconiumDefenderRecipe = await createRecipe(
  //   "Draconium Defender",
  //   draconiumDefender,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 5],
  //     [draconiumOre, 6],
  //     [sereviteOre, 12],
  //   ],
  //   20,
  //   "Shields",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { LargePlateArmor: 0 }],
  //     ["Quenching Fluid", { LargePlateArmor: 30 }],
  //     ["Lesser Illustrious Insight", { Shields: 20 }],
  //   ]
  // );
  // const obsidianSearedClaymoreRecipe = await createRecipe(
  //   "Obsidian Seared Claymore",
  //   obsidianSearedClaymore,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 2],
  //     [primalChaos, 160],
  //     [obsidianSearedAlloy, 8],
  //     [primalMoltenAlloy, 5],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   { ValdrakkenAccord: 14 },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Blades: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Illustrious Insight", { LongBlades: 25 }],
  //   ]
  // );
  // const obsidianSearedCrusherRecipe = await createRecipe(
  //   "Obsidian Seared Crusher",
  //   obsidianSearedCrusher,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 2],
  //     [primalChaos, 160],
  //     [obsidianSearedAlloy, 7],
  //     [primalMoltenAlloy, 7],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   null,
  //   null,
  //   "World Drop",
  //   "Anvil",
  //   "Drops from mobs in the Obsidian Citadel.",
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Hafted: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Hafted: 30 }],
  //     ["Illustrious Insight", { MacesAndHammers: 25 }],
  //   ]
  // );
  // const obsidianSearedFacesmasherRecipe = await createRecipe(
  //   "Obsidian Seared Facesmasher",
  //   obsidianSearedFacesmasher,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 80],
  //     [obsidianSearedAlloy, 6],
  //     [primalMoltenAlloy, 6],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   { MaruukCentaur: 13 },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Blades: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Illustrious Insight", { ShortBlades: 25 }],
  //   ]
  // );
  // const obsidianSearedHalberdRecipe = await createRecipe(
  //   "Obsidian Seared Halberd",
  //   obsidianSearedHalberd,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 160],
  //     [obsidianSearedAlloy, 6],
  //     [primalMoltenAlloy, 8],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   { MaruukCentaur: 13 },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Hafted: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Hafted: 30 }],
  //     ["Illustrious Insight", { AxesPicksAndPolearms: 25 }],
  //   ]
  // );
  // const obsidianSearedHexswordRecipe = await createRecipe(
  //   "Obsidian Seared Hexsword",
  //   obsidianSearedHexsword,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 120],
  //     [obsidianSearedAlloy, 6],
  //     [primalMoltenAlloy, 6],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   null,
  //   null,
  //   "World Drop",
  //   "Anvil",
  //   "Drops from mobs in the Obsidian Citadel.",
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Blades: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Illustrious Insight", { LongBlades: 25 }],
  //   ]
  // );
  // const obsidianSearedInvokerRecipe = await createRecipe(
  //   "Obsidian Seared Invoker",
  //   obsidianSearedInvoker,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 2],
  //     [primalChaos, 160],
  //     [obsidianSearedAlloy, 7],
  //     [primalMoltenAlloy, 5],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   { ValdrakkenAccord: 14 },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Hafted: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Hafted: 30 }],
  //     ["Illustrious Insight", { MacesAndHammers: 25 }],
  //   ]
  // );
  // const obsidianSearedRuneaxeRecipe = await createRecipe(
  //   "Obsidian Seared Runeaxe",
  //   obsidianSearedRuneaxe,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 120],
  //     [obsidianSearedAlloy, 6],
  //     [primalMoltenAlloy, 6],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   { MaruukCentaur: 13 },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Hafted: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Hafted: 30 }],
  //     ["Illustrious Insight", { AxesPicksAndPolearms: 25 }],
  //   ]
  // );
  // const obsidianSearedSlicerRecipe = await createRecipe(
  //   "Obsidian Seared Slicer",
  //   obsidianSearedSlicer,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 80],
  //     [obsidianSearedAlloy, 5],
  //     [primalMoltenAlloy, 8],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   null,
  //   null,
  //   "World Drop",
  //   "Anvil",
  //   "Drops from mobs in the Obsidian Citadel.",
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Hafted: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Hafted: 30 }],
  //     ["Illustrious Insight", { AxesPicksAndPolearms: 25 }],
  //   ]
  // );
  // const primalMoltenGreataxeRecipe = await createRecipe(
  //   "Primal Molten Greataxe",
  //   primalMoltenGreataxe,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 2],
  //     [primalChaos, 160],
  //     [primalMoltenAlloy, 20],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   null,
  //   { AxesPicksAndPolearms: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Hafted: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Hafted: 30 }],
  //     ["Illustrious Insight", { AxesPicksAndPolearms: 25 }],
  //   ]
  // );
  // const primalMoltenLongswordRecipe = await createRecipe(
  //   "Primal Molten Longsword",
  //   primalMoltenLongsword,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 80],
  //     [primalMoltenAlloy, 17],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   null,
  //   { LongBlades: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Blades: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Illustrious Insight", { LongBlades: 25 }],
  //   ]
  // );
  // const primalMoltenMaceRecipe = await createRecipe(
  //   "Primal Molten Mace",
  //   primalMoltenMace,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 80],
  //     [primalMoltenAlloy, 17],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   null,
  //   { MacesAndHammers: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Hafted: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Hafted: 30 }],
  //     ["Illustrious Insight", { MacesAndHammers: 25 }],
  //   ]
  // );
  // const primalMoltenShortbladeRecipe = await createRecipe(
  //   "Primal Molten Shortblade",
  //   primalMoltenShortblade,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 80],
  //     [primalMoltenAlloy, 17],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   null,
  //   { ShortBlades: 0 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Blades: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Illustrious Insight", { ShortBlades: 25 }],
  //   ]
  // );
  // const primalMoltenSpellbladeRecipe = await createRecipe(
  //   "Primal Molten Spellblade",
  //   primalMoltenSpellblade,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 120],
  //     [primalMoltenAlloy, 17],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   null,
  //   { ShortBlades: 5 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Blades: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Illustrious Insight", { ShortBlades: 25 }],
  //   ]
  // );
  // const primalMoltenWarglaiveRecipe = await createRecipe(
  //   "Primal Molten Warglaive",
  //   primalMoltenWarglaive,
  //   1,
  //   blacksmithing,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 80],
  //     [primalMoltenAlloy, 17],
  //   ],
  //   null,
  //   "Weapons",
  //   1,
  //   300,
  //   null,
  //   { LongBlades: 5 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Primal Infusion", { Weaponsmithing: 0 }],
  //     ["Missive", { Blades: 0 }],
  //     ["Embellishment", {}],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Illustrious Insight", { LongBlades: 25 }],
  //   ]
  // );
  // const draconiumGreatMaceRecipe = await createRecipe(
  //   "Draconium Great Mace",
  //   draconiumGreatMace,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 6],
  //     [draconiumOre, 10],
  //     [sereviteOre, 20],
  //   ],
  //   50,
  //   "Weapons",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { Hafted: 0 }],
  //     ["Quenching Fluid", { Hafted: 30 }],
  //     ["Lesser Illustrious Insight", { MacesAndHammers: 25 }],
  //   ]
  // );
  // const draconiumStilettoRecipe = await createRecipe(
  //   "Draconium Stiletto",
  //   draconiumStiletto,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 6],
  //     [draconiumOre, 6],
  //     [sereviteOre, 12],
  //   ],
  //   45,
  //   "Weapons",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { Blades: 0 }],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Lesser Illustrious Insight", { ShortBlades: 25 }],
  //   ]
  // );
  // const draconiumGreatAxeRecipe = await createRecipe(
  //   "Draconium Great Axe",
  //   draconiumGreatAxe,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 6],
  //     [draconiumOre, 10],
  //     [sereviteOre, 20],
  //   ],
  //   40,
  //   "Weapons",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { Hafted: 0 }],
  //     ["Quenching Fluid", { Hafted: 30 }],
  //     ["Lesser Illustrious Insight", { AxesPicksAndPolearms: 25 }],
  //   ]
  // );
  // const draconiumKnucklesRecipe = await createRecipe(
  //   "Draconium Knuckles",
  //   draconiumKnuckles,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 6],
  //     [draconiumOre, 6],
  //     [sereviteOre, 12],
  //   ],
  //   30,
  //   "Weapons",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { Blades: 0 }],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Lesser Illustrious Insight", { ShortBlades: 25 }],
  //   ]
  // );
  // const draconiumSwordRecipe = await createRecipe(
  //   "Draconium Sword",
  //   draconiumSword,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 5],
  //     [draconiumOre, 6],
  //     [sereviteOre, 12],
  //   ],
  //   30,
  //   "Weapons",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { Blades: 0 }],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Lesser Illustrious Insight", { LongBlades: 25 }],
  //   ]
  // );
  // const draconiumAxeRecipe = await createRecipe(
  //   "Draconium Axe",
  //   draconiumAxe,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 5],
  //     [draconiumOre, 6],
  //     [sereviteOre, 12],
  //   ],
  //   25,
  //   "Weapons",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { Hafted: 0 }],
  //     ["Quenching Fluid", { Hafted: 30 }],
  //     ["Lesser Illustrious Insight", { AxesPicksAndPolearms: 25 }],
  //   ]
  // );
  // const draconiumDirkRecipe = await createRecipe(
  //   "Draconium Dirk",
  //   draconiumDirk,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 6],
  //     [draconiumOre, 6],
  //     [sereviteOre, 12],
  //   ],
  //   20,
  //   "Weapons",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { Blades: 0 }],
  //     ["Quenching Fluid", { Blades: 30 }],
  //     ["Lesser Illustrious Insight", { ShortBlades: 25 }],
  //   ]
  // );
  // const blackDragonTouchedHammerRecipe = await createRecipe(
  //   "Black Dragon Touched Hammer",
  //   blackDragonTouchedHammer,
  //   1,
  //   blacksmithing,
  //   [
  //     [artisansMettle, 400],
  //     [earthenSoul, 1],
  //     [obsidianSearedAlloy, 7],
  //   ],
  //   null,
  //   "Profession Tools and Accessories",
  //   1,
  //   450,
  //   null,
  //   null,
  //   "World Drop",
  //   "Earth-Warder's Forge",
  //   "Dropped from Rohzor Forgesmash in the Waking Shores.",
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Hafted: 30, Toolsmithing: 30 }],
  //     ["Illustrious Insight", { MacesAndHammers: 25, SpecialtySmithing: 40 }],
  //   ]
  // );
  // const khazgoriteBlacksmithsHammerRecipe = await createRecipe(
  //   "Khaz'gorite Blacksmith's Hammer",
  //   khazgoriteBlacksmithsHammer,
  //   1,
  //   blacksmithing,
  //   [
  //     [artisansMettle, 225],
  //     [primalFlux, 15],
  //     [khazgoriteOre, 40],
  //     [sereviteOre, 100],
  //   ],
  //   null,
  //   "Profession Tools and Accessories",
  //   1,
  //   425,
  //   null,
  //   { MacesAndHammers: 10 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Hafted: 30, Toolsmithing: 30 }],
  //     ["Illustrious Insight", { MacesAndHammers: 25, SpecialtySmithing: 40 }],
  //   ]
  // );
  // const khazgoriteBlacksmithsToolboxRecipe = await createRecipe(
  //   "Khaz'gorite Blacksmith's Toolbox",
  //   khazgoriteBlacksmithsToolbox,
  //   1,
  //   blacksmithing,
  //   [
  //     [artisansMettle, 225],
  //     [primalFlux, 12],
  //     [khazgoriteOre, 40],
  //     [sereviteOre, 100],
  //   ],
  //   null,
  //   "Profession Tools and Accessories",
  //   1,
  //   400,
  //   null,
  //   { Toolsmithing: 10 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Quenching Fluid", { Toolsmithing: 30 }],
  //     ["Illustrious Insight", { SpecialtySmithing: 40 }],
  //   ]
  // );
  // const khazgoriteLeatherworkersKnifeRecipe = await createRecipe(
  //   "Khaz'gorite Leatherworker's Knife",
  //   khazgoriteLeatherworkersKnife,
  //   1,
  //   blacksmithing,
  //   [
  //     [artisansMettle, 225],
  //     [primalFlux, 15],
  //     [khazgoriteOre, 40],
  //     [sereviteOre, 100],
  //   ],
  //   null,
  //   "Profession Tools and Accessories",
  //   1,
  //   425,
  //   { MaruukCentaur: 18 },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
  //     ["Illustrious Insight", { ShortBlades: 25, SpecialtySmithing: 40 }],
  //   ]
  // );
  // const khazgoriteLeatherworkersToolsetRecipe = await createRecipe(
  //   "Khaz'gorite Leatherworker's Toolset",
  //   khazgoriteLeatherworkersToolset,
  //   1,
  //   blacksmithing,
  //   [
  //     [artisansMettle, 300],
  //     [primalFlux, 12],
  //     [khazgoriteOre, 40],
  //     [sereviteOre, 100],
  //   ],
  //   null,
  //   "Profession Tools and Accessories",
  //   1,
  //   400,
  //   { ValdrakkenAccord: 19 },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Quenching Fluid", { Toolsmithing: 30 }],
  //     ["Illustrious Insight", { SpecialtySmithing: 40 }],
  //   ]
  // );
  // const khazgoriteNeedleSetRecipe = await createRecipe(
  //   "Khaz'gorite Needle Set",
  //   khazgoriteNeedleSet,
  //   1,
  //   blacksmithing,
  //   [
  //     [artisansMettle, 300],
  //     [primalFlux, 12],
  //     [khazgoriteOre, 35],
  //     [sereviteOre, 100],
  //   ],
  //   null,
  //   "Profession Tools and Accessories",
  //   1,
  //   400,
  //   { ValdrakkenAccord: 19 },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Quenching Fluid", { Toolsmithing: 30 }],
  //     ["Illustrious Insight", { SpecialtySmithing: 40 }],
  //   ]
  // );
  // const khazgoritePickaxeRecipe = await createRecipe(
  //   "Khaz'gorite Pickaxe",
  //   khazgoritePickaxe,
  //   1,
  //   blacksmithing,
  //   [
  //     [artisansMettle, 300],
  //     [primalFlux, 15],
  //     [khazgoriteOre, 45],
  //     [sereviteOre, 100],
  //   ],
  //   null,
  //   "Profession Tools and Accessories",
  //   1,
  //   425,
  //   null,
  //   { AxesPicksAndPolearms: 10 },
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Hafted: 30, Toolsmithing: 30 }],
  //     [
  //       "Illustrious Insight",
  //       { AxesPicksAndPolearms: 25, SpecialtySmithing: 40 },
  //     ],
  //   ]
  // );
  // const khazgoriteSickleRecipe = await createRecipe(
  //   "Khaz'gorite Sickle",
  //   khazgoriteSickle,
  //   1,
  //   blacksmithing,
  //   [
  //     [artisansMettle, 300],
  //     [primalFlux, 15],
  //     [khazgoriteOre, 40],
  //     [sereviteOre, 100],
  //   ],
  //   null,
  //   "Profession Tools and Accessories",
  //   1,
  //   425,
  //   { ValdrakkenAccord: 19 },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
  //     ["Illustrious Insight", { LongBlades: 25, SpecialtySmithing: 40 }],
  //   ]
  // );
  // const khazgoriteSkinningKnifeRecipe = await createRecipe(
  //   "Khaz'gorite Skinning Knife",
  //   khazgoriteSkinningKnife,
  //   1,
  //   blacksmithing,
  //   [
  //     [artisansMettle, 300],
  //     [primalFlux, 15],
  //     [khazgoriteOre, 40],
  //     [sereviteOre, 100],
  //   ],
  //   null,
  //   "Profession Tools and Accessories",
  //   1,
  //   425,
  //   { MaruukCentaur: 18 },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
  //     ["Illustrious Insight", { ShortBlades: 25, SpecialtySmithing: 40 }],
  //   ]
  // );
  // const draconiumNeedleSetRecipe = await createRecipe(
  //   "Draconium Needle Set",
  //   draconiumNeedleSet,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 3],
  //     [draconiumOre, 4],
  //     [sereviteOre, 10],
  //   ],
  //   30,
  //   "Profession Tools and Accessories",
  //   2,
  //   80,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Quenching Fluid", { Toolsmithing: 30 }],
  //     ["Lesser Illustrious Insight", { SpecialtySmithing: 40 }],
  //   ]
  // );
  // const draconiumLeatherworkersToolsetRecipe = await createRecipe(
  //   "Draconium Leatherworker's Toolset",
  //   draconiumLeatherworkersToolset,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 3],
  //     [sereviteOre, 12],
  //     [draconiumOre, 3],
  //   ],
  //   25,
  //   "Profession Tools and Accessories",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Quenching Fluid", { Toolsmithing: 30 }],
  //     ["Lesser Illustrious Insight", { SpecialtySmithing: 40 }],
  //   ]
  // );
  // const draconiumLeatherworkersKnifeRecipe = await createRecipe(
  //   "Draconium Leatherworker's Knife",
  //   draconiumLeatherworkersKnife,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 4],
  //     [draconiumOre, 3],
  //     [sereviteOre, 12],
  //   ],
  //   20,
  //   "Profession Tools and Accessories",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { ShortBlades: 25, SpecialtySmithing: 40 },
  //     ],
  //   ]
  // );
  // const draconiumBlacksmithsToolboxRecipe = await createRecipe(
  //   "Draconium Blacksmith's Toolbox",
  //   draconiumBlacksmithsToolbox,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 3],
  //     [sereviteOre, 12],
  //     [draconiumOre, 3],
  //   ],
  //   15,
  //   "Profession Tools and Accessories",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Quenching Fluid", { Toolsmithing: 30 }],
  //     ["Lesser Illustrious Insight", { SpecialtySmithing: 40 }],
  //   ]
  // );
  // const draconiumSkinningKnifeRecipe = await createRecipe(
  //   "Draconium Skinning Knife",
  //   draconiumSkinningKnife,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 4],
  //     [draconiumOre, 3],
  //     [sereviteOre, 10],
  //   ],
  //   15,
  //   "Profession Tools and Accessories",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { ShortBlades: 25, SpecialtySmithing: 40 },
  //     ],
  //   ]
  // );
  // const draconiumSickleRecipe = await createRecipe(
  //   "Draconium Sickle",
  //   draconiumSickle,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 4],
  //     [draconiumOre, 2],
  //     [sereviteOre, 10],
  //   ],
  //   10,
  //   "Profession Tools and Accessories",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Blades: 30, Toolsmithing: 30 }],
  //     ["Lesser Illustrious Insight", { LongBlades: 25, SpecialtySmithing: 40 }],
  //   ]
  // );
  // const draconiumPickaxeRecipe = await createRecipe(
  //   "Draconium Pickaxe",
  //   draconiumPickaxe,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 4],
  //     [draconiumOre, 2],
  //     [sereviteOre, 10],
  //   ],
  //   5,
  //   "Profession Tools and Accessories",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Hafted: 30, Toolsmithing: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { AxesPicksAndPolearms: 25, SpecialtySmithing: 40 },
  //     ],
  //   ]
  // );
  // const draconiumBlacksmithsHammerRecipe = await createRecipe(
  //   "Draconium Blacksmith's Hammer",
  //   draconiumBlacksmithsHammer,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 4],
  //     [draconiumOre, 2],
  //     [sereviteOre, 10],
  //   ],
  //   1,
  //   "Profession Tools and Accessories",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   "Learned by default.",
  //   [
  //     ["Missive", {}],
  //     ["Quenching Fluid", { Hafted: 30, Toolsmithing: 30 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { MacesAndHammers: 25, SpecialtySmithing: 40 },
  //     ],
  //   ]
  // );
  // const mastersHammerRecipe = await createRecipe(
  //   "Master's Hammer",
  //   mastersHammer,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 10],
  //     [obsidianSearedAlloy, 1],
  //     [primalMoltenAlloy, 2],
  //     [frostfireAlloy, 2],
  //   ],
  //   null,
  //   "Consumable Tools",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Various Specializations",
  //   "Anvil",
  //   "Similar to Illustrious Insight - any Specialization rank that mentions Master's Hammer gives you this recipe."
  // );
  // const sturdyExpeditionShovelRecipe = await createRecipe(
  //   "Sturdy Expedition Shovel",
  //   sturdyExpeditionShovel,
  //   2,
  //   blacksmithing,
  //   [
  //     [primalFlux, 2],
  //     [sereviteOre, 10],
  //   ],
  //   null,
  //   "Consumable Tools",
  //   1,
  //   null,
  //   { DragonscaleExpedition: "?" },
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [["Quenching Fluid", { Toolsmithing: 30 }]]
  // );
  // const sereviteRepairHammerRecipe = await createRecipe(
  //   "Serevite Repair Hammer",
  //   sereviteRepairHammer,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 3],
  //     [sereviteOre, 8],
  //   ],
  //   15,
  //   "Consumable Tools",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [["Quenching Fluid", { Toolsmithing: 30 }]]
  // );
  // const sereviteSkeletonKeyRecipe = await createRecipe(
  //   "Serevite Skeleton Key",
  //   sereviteSkeletonKey,
  //   5,
  //   blacksmithing,
  //   [
  //     [primalFlux, 3],
  //     [sereviteOre, 20],
  //   ],
  //   5,
  //   "Consumable Tools",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Anvil",
  //   null,
  //   [["Quenching Fluid", { Toolsmithing: 30 }]]
  // );
  // const primalRazorstoneRecipe = await createRecipe(
  //   "Primal Razorstone",
  //   primalRazorstone,
  //   5,
  //   blacksmithing,
  //   [
  //     [glossyStone, 4],
  //     [silkenGemdust, 1],
  //   ],
  //   null,
  //   "Stonework",
  //   1,
  //   325,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  // );
  // const primalWhetstoneRecipe = await createRecipe(
  //   "Primal Whetstone",
  //   primalWhetstone,
  //   5,
  //   blacksmithing,
  //   [
  //     [awakenedFire, 1],
  //     [glossyStone, 4],
  //   ],
  //   35,
  //   "Stonework",
  //   1,
  //   325,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  // );
  // const primalWeightstoneRecipe = await createRecipe(
  //   "Primal Weightstone",
  //   primalWeightstone,
  //   5,
  //   blacksmithing,
  //   [
  //     [awakenedEarth, 1],
  //     [glossyStone, 4],
  //   ],
  //   30,
  //   "Stonework",
  //   1,
  //   325,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { SpecialtySmithing: 40 }]]
  // );
  // const alvinTheAnvilRecipe = await createRecipe(
  //   "Alvin the Anvil",
  //   alvinTheAnvil,
  //   1,
  //   blacksmithing,
  //   [
  //     [earthenSoul, 1],
  //     [primalMoltenAlloy, 6],
  //     [frostfireAlloy, 6],
  //     [infuriousAlloy, 6],
  //   ],
  //   null,
  //   "Pets",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Anvil",
  //   "Drops from 'Powerful Blacksmiths'?"
  // );
  // const prototypeExplorersBardingFrameworkRecipe = await createRecipe(
  //   "Prototype Explorer's Barding Framework",
  //   prototypeExplorersBardingFramework,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 5],
  //     [primalBearSpine, 3],
  //     [sereviteOre, 20],
  //     [primalMoltenAlloy, 1],
  //     [obsidianSearedAlloy, 2],
  //   ],
  //   null,
  //   "Dragon Riding",
  //   1,
  //   null,
  //   { MaruukCentaur: 22 },
  //   null,
  //   null,
  //   "Anvil"
  // );
  // const prototypeRegalBardingFrameworkRecipe = await createRecipe(
  //   "Prototype Regal Barding Framework",
  //   prototypeRegalBardingFramework,
  //   1,
  //   blacksmithing,
  //   [
  //     [primalFlux, 5],
  //     [mastodonTusk, 3],
  //     [sereviteOre, 20],
  //     [frostfireAlloy, 1],
  //     [obsidianSearedAlloy, 2],
  //   ],
  //   null,
  //   "Dragon Riding",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Anvil",
  //   "Drops from Draconic Recipe in a Bottle."
  // );

  // //enchanting recipes - 68 total
  // const illustriousInsightRecipeEnchanting = await createRecipe(
  //   "Illustrious Insight",
  //   illustriousInsight,
  //   1,
  //   enchanting,
  //   [[artisansMettle, 50]],
  //   null,
  //   "Finishing Reagents",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Various Specializations",
  //   "Enchanter's Lectern"
  // );
  // const gracefulAvoidanceRecipe = await createRecipe(
  //   "Graceful Avoidance",
  //   gracefulAvoidance,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 8],
  //     [vibrantShard, 3],
  //   ],
  //   null,
  //   "Cloak Enchantments",
  //   1,
  //   400,
  //   { DragonscaleExpedition: 9 },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const homeboundSpeedRecipe = await createRecipe(
  //   "Homebound Speed",
  //   homeboundSpeed,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 8],
  //     [vibrantShard, 3],
  //   ],
  //   null,
  //   "Cloak Enchantments",
  //   1,
  //   400,
  //   { ValdrakkenAccord: 11 },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const regenerativeLeechRecipe = await createRecipe(
  //   "Regenerative Leech",
  //   regenerativeLeech,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 8],
  //     [vibrantShard, 3],
  //   ],
  //   null,
  //   "Cloak Enchantments",
  //   1,
  //   400,
  //   { IskaaraTuskarr: 10 },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const writOfAvoidanceCloakRecipe = await createRecipe(
  //   "Writ of Avoidance",
  //   writOfAvoidanceCloak,
  //   1,
  //   enchanting,
  //   [[chromaticDust, 12]],
  //   25,
  //   "Cloak Enchantments",
  //   1,
  //   200,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const writOfLeechCloakRecipe = await createRecipe(
  //   "Writ of Leech",
  //   writOfLeechCloak,
  //   1,
  //   enchanting,
  //   [[chromaticDust, 12]],
  //   25,
  //   "Cloak Enchantments",
  //   1,
  //   200,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const writOfSpeedCloakRecipe = await createRecipe(
  //   "Writ of Speed",
  //   writOfSpeedCloak,
  //   1,
  //   enchanting,
  //   [[chromaticDust, 12]],
  //   25,
  //   "Cloak Enchantments",
  //   1,
  //   200,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const acceleratedAgilityRecipe = await createRecipe(
  //   "Accelerated Agility",
  //   acceleratedAgility,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 3],
  //     [resonantCrystal, 2],
  //   ],
  //   null,
  //   "Chest Enchantments",
  //   1,
  //   400,
  //   { IskaaraTuskarr: 10 },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const reserveOfIntellectRecipe = await createRecipe(
  //   "Reserve of Intellect",
  //   reserveOfIntellect,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 4],
  //     [resonantCrystal, 1],
  //   ],
  //   null,
  //   "Chest Enchantments",
  //   1,
  //   400,
  //   null,
  //   { MagicalReinforcement: 20 },
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const sustainedStrengthRecipe = await createRecipe(
  //   "Sustained Strength",
  //   sustainedStrength,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 4],
  //     [resonantCrystal, 2],
  //   ],
  //   null,
  //   "Chest Enchantments",
  //   1,
  //   400,
  //   { MaruukCentaur: 8 },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const wakingStatsRecipe = await createRecipe(
  //   "Waking Stats",
  //   wakingStats,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 8],
  //     [vibrantShard, 3],
  //   ],
  //   null,
  //   "Chest Enchantments",
  //   1,
  //   350,
  //   null,
  //   { MagicalReinforcement: 0 },
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const devotionOfAvoidanceRecipe = await createRecipe(
  //   "Devotion of Avoidance",
  //   devotionOfAvoidance,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 5],
  //     [vibrantShard, 4],
  //   ],
  //   null,
  //   "Bracer Enchantments",
  //   1,
  //   425,
  //   null,
  //   { Adaptive: 0 },
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const devotionOfLeechRecipe = await createRecipe(
  //   "Devotion of Leech",
  //   devotionOfLeech,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 5],
  //     [vibrantShard, 4],
  //   ],
  //   null,
  //   "Bracer Enchantments",
  //   1,
  //   425,
  //   null,
  //   { Adaptive: 10 },
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const devotionOfSpeedRecipe = await createRecipe(
  //   "Devotion of Speed",
  //   devotionOfSpeed,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 5],
  //     [vibrantShard, 4],
  //   ],
  //   null,
  //   "Bracer Enchantments",
  //   1,
  //   425,
  //   null,
  //   { Adaptive: 20 },
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const writOfAvoidanceBracerRecipe = await createRecipe(
  //   "Writ of Avoidance",
  //   writOfAvoidanceBracer,
  //   1,
  //   enchanting,
  //   [[vibrantShard, 1]],
  //   15,
  //   "Bracer Enchantments",
  //   1,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const writOfLeechBracerRecipe = await createRecipe(
  //   "Writ of Leech",
  //   writOfLeechBracer,
  //   1,
  //   enchanting,
  //   [[vibrantShard, 1]],
  //   15,
  //   "Bracer Enchantments",
  //   1,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const writOfSpeedBracerRecipe = await createRecipe(
  //   "Writ of Speed",
  //   writOfSpeedBracer,
  //   1,
  //   enchanting,
  //   [[vibrantShard, 1]],
  //   15,
  //   "Bracer Enchantments",
  //   1,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Adaptive: 30 }]]
  // );
  // const plainsrunnersBreezeRecipe = await createRecipe(
  //   "Plainsrunner's Breeze",
  //   plainsrunnersBreeze,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 4],
  //     [awakenedAir, 1],
  //     [awakenedEarth, 1],
  //   ],
  //   null,
  //   "Boot Enchantments",
  //   1,
  //   450,
  //   { MaruukCentaur: 8 },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Earthen: 10, Wafting: 10 }]]
  // );
  // const ridersReassuranceRecipe = await createRecipe(
  //   "Rider's Reassurance",
  //   ridersReassurance,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 4],
  //     [awakenedAir, 1],
  //     [awakenedEarth, 1],
  //   ],
  //   null,
  //   "Boot Enchantments",
  //   1,
  //   450,
  //   { DragonscaleExpedition: 9 },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Earthen: 10, Wafting: 10 }]]
  // );
  // const watchersLoamRecipe = await createRecipe(
  //   "Watcher's Loam",
  //   watchersLoam,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 4],
  //     [awakenedAir, 1],
  //     [awakenedEarth, 1],
  //   ],
  //   null,
  //   "Boot Enchantments",
  //   1,
  //   450,
  //   { ValdrakkenAccord: 11 },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Earthen: 10, Wafting: 10 }]]
  // );
  // const devotionOfCriticalStrikeRecipe = await createRecipe(
  //   "Devotion of Critical Strike",
  //   devotionOfCriticalStrike,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 5],
  //     [vibrantShard, 3],
  //   ],
  //   35,
  //   "Ring Enchantments",
  //   1,
  //   425,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const devotionOfHasteRecipe = await createRecipe(
  //   "Devotion of Haste",
  //   devotionOfHaste,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 5],
  //     [vibrantShard, 3],
  //   ],
  //   35,
  //   "Ring Enchantments",
  //   1,
  //   425,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const devotionOfMasteryRecipe = await createRecipe(
  //   "Devotion of Mastery",
  //   devotionOfMastery,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 5],
  //     [vibrantShard, 3],
  //   ],
  //   35,
  //   "Ring Enchantments",
  //   1,
  //   425,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const devotionOfVersatilityRecipe = await createRecipe(
  //   "Devotion of Versatility",
  //   devotionOfVersatility,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 5],
  //     [vibrantShard, 3],
  //   ],
  //   30,
  //   "Ring Enchantments",
  //   1,
  //   425,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const writOfCriticalStrikeRecipe = await createRecipe(
  //   "Writ of Critical Strike",
  //   writOfCriticalStrike,
  //   1,
  //   enchanting,
  //   [[chromaticDust, 3]],
  //   5,
  //   "Ring Enchantments",
  //   1,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const writOfHasteRecipe = await createRecipe(
  //   "Writ of Haste",
  //   writOfHaste,
  //   1,
  //   enchanting,
  //   [[chromaticDust, 3]],
  //   5,
  //   "Ring Enchantments",
  //   1,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const writOfMasteryRecipe = await createRecipe(
  //   "Writ of Mastery",
  //   writOfMastery,
  //   1,
  //   enchanting,
  //   [[chromaticDust, 3]],
  //   5,
  //   "Ring Enchantments",
  //   1,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const writOfVersatilityRecipe = await createRecipe(
  //   "Writ of Versatility",
  //   writOfHaste,
  //   1,
  //   enchanting,
  //   [[chromaticDust, 3]],
  //   1,
  //   "Ring Enchantments",
  //   1,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Learned by default.",
  //   [["Lesser Illustrious Insight", { MagicalReinforcement: 30 }]]
  // );
  // const burningDevotionRecipe = await createRecipe(
  //   "Burning Devotion",
  //   burningDevotion,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 5],
  //     [resonantCrystal, 4],
  //     [awakenedFire, 6],
  //     [glowingTitanOrb, 3],
  //   ],
  //   null,
  //   "Weapon Enchantments",
  //   1,
  //   425,
  //   null,
  //   { Burning: 0 },
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Burning: 10 }]]
  // );
  // const earthenDevotionRecipe = await createRecipe(
  //   "Earthen Devotion",
  //   earthenDevotion,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 5],
  //     [resonantCrystal, 4],
  //     [awakenedEarth, 6],
  //     [glowingTitanOrb, 3],
  //   ],
  //   null,
  //   "Weapon Enchantments",
  //   1,
  //   425,
  //   null,
  //   { Earthen: 0 },
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Earthen: 10 }]]
  // );
  // const frozenDevotionRecipe = await createRecipe(
  //   "Frozen Devotion",
  //   frozenDevotion,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 5],
  //     [resonantCrystal, 4],
  //     [awakenedFrost, 6],
  //     [glowingTitanOrb, 3],
  //   ],
  //   null,
  //   "Weapon Enchantments",
  //   1,
  //   425,
  //   null,
  //   { Frozen: 0 },
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Frozen: 10 }]]
  // );
  // const sophicDevotionRecipe = await createRecipe(
  //   "Sophic Devotion",
  //   sophicDevotion,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 5],
  //     [resonantCrystal, 4],
  //     [awakenedOrder, 4],
  //     [glowingTitanOrb, 3],
  //   ],
  //   null,
  //   "Weapon Enchantments",
  //   1,
  //   425,
  //   null,
  //   { Sophic: 0 },
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Sophic: 10 }]]
  // );
  // const waftingDevotionRecipe = await createRecipe(
  //   "Wafting Devotion",
  //   waftingDevotion,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 5],
  //     [resonantCrystal, 4],
  //     [awakenedAir, 6],
  //     [glowingTitanOrb, 3],
  //   ],
  //   null,
  //   "Weapon Enchantments",
  //   1,
  //   425,
  //   null,
  //   { Wafting: 0 },
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Wafting: 10 }]]
  // );
  // const burningWritRecipe = await createRecipe(
  //   "Burning Writ",
  //   burningWrit,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 15],
  //     [resonantCrystal, 2],
  //     [awakenedFire, 4],
  //   ],
  //   50,
  //   "Weapon Enchantments",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Burning: 10 }]]
  // );
  // const earthenWritRecipe = await createRecipe(
  //   "Earthen Writ",
  //   earthenWrit,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 15],
  //     [resonantCrystal, 2],
  //     [awakenedEarth, 4],
  //   ],
  //   50,
  //   "Weapon Enchantments",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Earthen: 10 }]]
  // );
  // const frozenWritRecipe = await createRecipe(
  //   "Frozen Writ",
  //   frozenWrit,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 15],
  //     [resonantCrystal, 2],
  //     [awakenedFrost, 4],
  //   ],
  //   50,
  //   "Weapon Enchantments",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Frozen: 10 }]]
  // );
  // const sophicWritRecipe = await createRecipe(
  //   "Sophic Writ",
  //   sophicWrit,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 15],
  //     [resonantCrystal, 2],
  //     [awakenedOrder, 3],
  //   ],
  //   50,
  //   "Weapon Enchantments",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Sophic: 10 }]]
  // );
  // const waftingWritRecipe = await createRecipe(
  //   "Wafting Writ",
  //   waftingWrit,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 15],
  //     [resonantCrystal, 2],
  //     [awakenedAir, 4],
  //   ],
  //   50,
  //   "Weapon Enchantments",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Wafting: 10 }]]
  // );
  // const draconicDeftnessRecipe = await createRecipe(
  //   "Draconic Deftness",
  //   draconicDeftness,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 4],
  //     [resonantCrystal, 2],
  //     [iridescentPlume, 3],
  //   ],
  //   null,
  //   "Profession Tool Enchantments",
  //   1,
  //   400,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Artistry: 30 }]]
  // );
  // const draconicFinesseRecipe = await createRecipe(
  //   "Draconic Finesse",
  //   draconicFinesse,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 4],
  //     [resonantCrystal, 2],
  //     [iridescentPlume, 3],
  //   ],
  //   null,
  //   "Profession Tool Enchantments",
  //   1,
  //   400,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Artistry: 30 }]]
  // );
  // const draconicInspirationRecipe = await createRecipe(
  //   "Draconic Inspiration",
  //   draconicInspiration,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 4],
  //     [resonantCrystal, 2],
  //     [iridescentPlume, 3],
  //   ],
  //   null,
  //   "Profession Tool Enchantments",
  //   1,
  //   400,
  //   null,
  //   { Artistry: 0 },
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Artistry: 30 }]]
  // );
  // const draconicPerceptionRecipe = await createRecipe(
  //   "Draconic Perception",
  //   draconicPerception,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 4],
  //     [resonantCrystal, 2],
  //     [iridescentPlume, 3],
  //   ],
  //   null,
  //   "Profession Tool Enchantments",
  //   1,
  //   400,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Artistry: 30 }]]
  // );
  // const draconicResourcefulnessRecipe = await createRecipe(
  //   "Draconic Resourcefulness",
  //   draconicResourcefulness,
  //   1,
  //   enchanting,
  //   [
  //     [vibrantShard, 4],
  //     [resonantCrystal, 2],
  //     [iridescentPlume, 3],
  //   ],
  //   null,
  //   "Profession Tool Enchantments",
  //   1,
  //   400,
  //   null,
  //   { Artistry: 15 },
  //   null,
  //   null,
  //   null,
  //   [["Illustrious Insight", { Artistry: 30 }]]
  // );
  // const torchOfPrimalAwakeningRecipe = await createRecipe(
  //   "Torch of Primal Awakening",
  //   torchOfPrimalAwakening,
  //   1,
  //   enchanting,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 120],
  //     [vibrantShard, 2],
  //     [resonantCrystal, 3],
  //     [runedWrithebark, 2],
  //     [primalMoltenAlloy, 2],
  //   ],
  //   null,
  //   "Rods and Wands",
  //   1,
  //   265,
  //   null,
  //   { RodsAndWands: 30 },
  //   null,
  //   "Enchanter's Lectern",
  //   null,
  //   [
  //     ["Missive", { RodsAndWands: 0 }],
  //     ["Primal Infusion", { RodsAndWands: 20 }],
  //     ["Embellishment", {}],
  //     ["Illustrious Insight", { RodsAndWands: 45 }],
  //   ]
  // );
  // const runedKhazgoriteRodRecipe = await createRecipe(
  //   "Runed Khaz'gorite Rod",
  //   runedKhazgoriteRod,
  //   1,
  //   enchanting,
  //   [
  //     [artisansMettle, 300],
  //     [vibrantShard, 5],
  //     [resonantCrystal, 1],
  //     [khazgoriteOre, 4],
  //     [runedWrithebark, 2],
  //   ],
  //   null,
  //   "Rods and Wands",
  //   1,
  //   350,
  //   null,
  //   { RodsAndWands: 10 },
  //   null,
  //   "Enchanter's Lectern",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Illustrious Insight", { RodsAndWands: 45 }],
  //   ]
  // );
  // const runedDraconiumRodRecipe = await createRecipe(
  //   "Runed Draconium Rod",
  //   runedDraconiumRod,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 4],
  //     [draconiumOre, 3],
  //     [writhebark, 2],
  //   ],
  //   10,
  //   "Rods and Wands",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   "Enchanter's Lectern",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Lesser Illustrious Insight", { RodsAndWands: 45 }],
  //   ]
  // );
  // const enchantedWrithebarkWandRecipe = await createRecipe(
  //   "Enchanted Writhebark Wand",
  //   enchantedWrithebarkWand,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 6],
  //     [writhebark, 2],
  //   ],
  //   5,
  //   "Rods and Wands",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   "Enchanter's Lectern",
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { RodsAndWands: 0 }],
  //     ["Lesser Illustrious Insight", { RodsAndWands: 45 }],
  //   ]
  // );
  // const runedSereviteRodRecipe = await createRecipe(
  //   "Runed Serevite Rod",
  //   runedSereviteRod,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 3],
  //     [sereviteRod, 1],
  //   ],
  //   1,
  //   "Rods and Wands",
  //   1,
  //   40,
  //   null,
  //   null,
  //   null,
  //   "Enchanter's Lectern",
  //   "Learned by default.",
  //   [
  //     ["Missive", {}],
  //     ["Lesser Illustrious Insight", { RodsAndWands: 45 }],
  //   ]
  // );
  // const illusionPrimalAirRecipe = await createRecipe(
  //   "Illusion: Primal Air",
  //   illusionPrimalAir,
  //   1,
  //   enchanting,
  //   [
  //     [resonantCrystal, 2],
  //     [awakenedAir, 20],
  //   ],
  //   null,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Enchanter's Lectern",
  //   "Drops during Primal Storms."
  // );
  // const illusionPrimalEarthRecipe = await createRecipe(
  //   "Illusion: Primal Earth",
  //   illusionPrimalEarth,
  //   1,
  //   enchanting,
  //   [
  //     [resonantCrystal, 2],
  //     [awakenedEarth, 20],
  //   ],
  //   null,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Enchanter's Lectern",
  //   "Drops during Primal Storms."
  // );
  // const illusionPrimalFireRecipe = await createRecipe(
  //   "Illusion: Primal Fire",
  //   illusionPrimalFire,
  //   1,
  //   enchanting,
  //   [
  //     [resonantCrystal, 2],
  //     [awakenedFire, 20],
  //   ],
  //   null,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Enchanter's Lectern",
  //   "Drops during Primal Storms."
  // );
  // const illusionPrimalFrostRecipe = await createRecipe(
  //   "Illusion: Primal Frost",
  //   illusionPrimalFrost,
  //   1,
  //   enchanting,
  //   [
  //     [resonantCrystal, 2],
  //     [awakenedFrost, 20],
  //   ],
  //   null,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Enchanter's Lectern",
  //   "Drops during Primal Storms."
  // );
  // const illusionPrimalMasteryRecipe = await createRecipe(
  //   "Illusion: Primal Mastery",
  //   illusionPrimalMastery,
  //   1,
  //   enchanting,
  //   [
  //     [resonantCrystal, 5],
  //     [awakenedAir, 5],
  //     [awakenedEarth, 5],
  //     [awakenedFire, 5],
  //     [awakenedFrost, 5],
  //   ],
  //   null,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Enchanter's Lectern",
  //   "Drops from Kurog Grimtotem in Vault of the Incarnates."
  // );
  // const primalInvocationExtractRecipe = await createRecipe(
  //   "Primal Invocation Extract",
  //   primalInvocationExtract,
  //   1,
  //   enchanting,
  //   [
  //     [awakenedAir, 1],
  //     [awakenedEarth, 1],
  //     [awakenedFire, 1],
  //     [awakenedFrost, 1],
  //     [awakenedOrder, 1],
  //   ],
  //   null,
  //   "Illusory Goods",
  //   1,
  //   300,
  //   null,
  //   null,
  //   "Other",
  //   "Enchanter's Lectern",
  //   "Received from 'Primal Extraction - Glimmers of Insight'?",
  //   [
  //     [
  //       "Lesser Illustrious Insight",
  //       { Burning: 10, Earthen: 10, Sophic: 10, Frozen: 10, Wafting: 10 },
  //     ],
  //   ]
  // );
  // const khadgarsDisenchantingRodRecipe = await createRecipe(
  //   "Khadgar's Disenchanting Rod",
  //   khadgarsDisenchantingRod,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 12],
  //     [vibrantShard, 6],
  //     [resonantCrystal, 3],
  //   ],
  //   null,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   { IllusoryGoods: 30 },
  //   null,
  //   "Enchanter's Lectern"
  // );
  // const illusoryAdornmentOrderRecipe = await createRecipe(
  //   "Illusory Adornment: Order",
  //   illusoryAdornmentOrder,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 2],
  //     [rousingOrder, 2],
  //   ],
  //   null,
  //   "Illusory Goods",
  //   1,
  //   275,
  //   null,
  //   { IllusoryGoods: 20 },
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Sophic: 10 }]]
  // );
  // const illusoryAdornmentAirRecipe = await createRecipe(
  //   "Illusory Adornment: Air",
  //   illusoryAdornmentAir,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 2],
  //     [rousingAir, 2],
  //   ],
  //   40,
  //   "Illusory Goods",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Wafting: 10 }]]
  // );
  // const illusoryAdornmentEarthRecipe = await createRecipe(
  //   "Illusory Adornment: Earth",
  //   illusoryAdornmentEarth,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 2],
  //     [rousingEarth, 2],
  //   ],
  //   40,
  //   "Illusory Goods",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Earthen: 10 }]]
  // );
  // const illusoryAdornmentFireRecipe = await createRecipe(
  //   "Illusory Adornment: Fire",
  //   illusoryAdornmentFire,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 2],
  //     [rousingFire, 2],
  //   ],
  //   40,
  //   "Illusory Goods",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Burning: 10 }]]
  // );
  // const illusoryAdornmentFrostRecipe = await createRecipe(
  //   "Illusory Adornment: Frost",
  //   illusoryAdornmentFrost,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 2],
  //     [rousingFrost, 2],
  //   ],
  //   40,
  //   "Illusory Goods",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { Frozen: 10 }]]
  // );
  // const scepterOfSpectacleOrderRecipe = await createRecipe(
  //   "Scepter of Spectacle: Order",
  //   scepterOfSpectacleOrder,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 1],
  //     [rousingOrder, 3],
  //     [writhebark, 1],
  //   ],
  //   null,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   { IllusoryGoods: 10 },
  //   null,
  //   "Enchanter's Lectern"
  // );
  // const scepterOfSpectacleAirRecipe = await createRecipe(
  //   "Scepter of Spectacle: Air",
  //   scepterOfSpectacleAir,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 1],
  //     [rousingAir, 3],
  //     [writhebark, 1],
  //   ],
  //   20,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Enchanter's Lectern"
  // );
  // const scepterOfSpectacleFrostRecipe = await createRecipe(
  //   "Scepter of Spectacle: Frost",
  //   scepterOfSpectacleFrost,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 1],
  //     [rousingFrost, 3],
  //     [writhebark, 1],
  //   ],
  //   20,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Enchanter's Lectern"
  // );
  // const scepterOfSpectacleEarthRecipe = await createRecipe(
  //   "Scepter of Spectacle: Earth",
  //   scepterOfSpectacleEarth,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 1],
  //     [rousingEarth, 3],
  //     [writhebark, 1],
  //   ],
  //   1,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Enchanter's Lectern",
  //   "Learned by default."
  // );
  // const scepterOfSpectacleFireRecipe = await createRecipe(
  //   "Scepter of Spectacle: Fire",
  //   scepterOfSpectacleFire,
  //   1,
  //   enchanting,
  //   [
  //     [chromaticDust, 1],
  //     [rousingFire, 3],
  //     [writhebark, 1],
  //   ],
  //   1,
  //   "Illusory Goods",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Enchanter's Lectern",
  //   "Learned by default."
  // );
  // const crystallineShatterResonantCrystal = await createRecipe(
  //   "Crystalline Shatter",
  //   vibrantShard,
  //   3,
  //   enchanting,
  //   [[resonantCrystal, 1]],
  //   null,
  //   "Shatters",
  //   0,
  //   null,
  //   null,
  //   { DraconicDisenchantment: 10 }
  // );
  // const crystallineShatterVibrantShard = await createRecipe(
  //   "Crystalline Shatter",
  //   chromaticDust,
  //   3,
  //   enchanting,
  //   [[vibrantShard, 1]],
  //   null,
  //   "Shatters",
  //   0,
  //   null,
  //   null,
  //   { DraconicDisenchantment: 10 }
  // );
  // // const elementalShatter = await(createRecipe("Elemental Shatter", null, 1, enchanting, [[awakenedAir, 1]], null, "Shatters", 0, null, null, {PrimalExtraction: 10}, null, null, "Gain an element's power for 10 minutes."));
  // const sophicAmalgamationRecipe = await createRecipe(
  //   "Sophic Amalgamation",
  //   sophicAmalgamation,
  //   1,
  //   enchanting,
  //   [
  //     [resonantCrystal, 3],
  //     [awakenedOrder, 3],
  //   ],
  //   null,
  //   "Magical Merchandise",
  //   1,
  //   null,
  //   null,
  //   { PrimalExtraction: 20 },
  //   null,
  //   "Enchanter's Lectern"
  // );

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
      ["Missive", { Gear: 20 }],
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
      ["Missive", { Gear: 20 }],
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
      ["Missive", {}],
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
      ["Missive", {}],
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
      ["Missive", {}],
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
      ["Missive", {}],
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
      ["Missive", {}],
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
      ["Missive", {}],
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
  // // const dragonIslesMilling = await(createRecipe("Dragon Isles Milling", shimmeringPigment, 5, inscription, [[hochenblume, 5]], 1, "Inscription Essentials", 1, 250));
  // const cosmicInkRecipe = await createRecipe(
  //   null,
  //   cosmicInk,
  //   2,
  //   inscription,
  //   [
  //     [iridescentWater, 1],
  //     [awakenedFrost, 1],
  //     [sereneInk, 1],
  //     [burnishedInk, 2],
  //     [runedWrithebark, 1],
  //   ],
  //   35,
  //   "Inks",
  //   2,
  //   300,
  //   null,
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, FlawlessInks: 20 }],
  //     ["Blotting Sand", { FlawlessInks: 0 }],
  //   ]
  // );
  // const burnishedInkRecipe = await createRecipe(
  //   null,
  //   burnishedInk,
  //   2,
  //   inscription,
  //   [
  //     [iridescentWater, 1],
  //     [blazingInk, 2],
  //     [flourishingInk, 2],
  //     [sereneInk, 2],
  //   ],
  //   20,
  //   "Inks",
  //   2,
  //   260,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, FlawlessInks: 20 }],
  //     ["Blotting Sand", { FlawlessInks: 0 }],
  //   ]
  // );
  // const blazingInkRecipe = await createRecipe(
  //   null,
  //   blazingInk,
  //   2,
  //   inscription,
  //   [
  //     [iridescentWater, 1],
  //     [shimmeringPigment, 2],
  //     [blazingPigment, 1],
  //     [draconicVial, 1],
  //   ],
  //   1,
  //   "Inks",
  //   1,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Learned by default.",
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, FlawlessInks: 20 }],
  //     ["Blotting Sand", { FlawlessInks: 0 }],
  //   ]
  // );
  // const flourishingInkRecipe = await createRecipe(
  //   null,
  //   flourishingInk,
  //   2,
  //   inscription,
  //   [
  //     [iridescentWater, 1],
  //     [shimmeringPigment, 2],
  //     [flourishingPigment, 1],
  //     [draconicVial, 1],
  //   ],
  //   1,
  //   "Inks",
  //   1,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Learned by default.",
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, FlawlessInks: 20 }],
  //     ["Blotting Sand", { FlawlessInks: 0 }],
  //   ]
  // );
  // const sereneInkRecipe = await createRecipe(
  //   null,
  //   sereneInk,
  //   2,
  //   inscription,
  //   [
  //     [iridescentWater, 1],
  //     [shimmeringPigment, 2],
  //     [serenePigment, 1],
  //     [draconicVial, 1],
  //   ],
  //   1,
  //   "Inks",
  //   1,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Learned by default.",
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, FlawlessInks: 20 }],
  //     ["Blotting Sand", { FlawlessInks: 0 }],
  //   ]
  // );
  // const illustriousInsightRecipeInscription = await createRecipe(
  //   "Illustrious Insight",
  //   illustriousInsight,
  //   1,
  //   inscription,
  //   [[artisansMettle, 50]],
  //   null,
  //   "Reagents",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Various Specializations",
  //   "Scribe's Drafting Table"
  // );
  // const runedWrithebarkRecipe = await createRecipe(
  //   null,
  //   runedWrithebark,
  //   1,
  //   inscription,
  //   [
  //     [rousingAir, 5],
  //     [writhebark, 5],
  //     [flourishingInk, 1],
  //     [chilledRune, 1],
  //   ],
  //   15,
  //   "Reagents",
  //   1,
  //   260,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { RuneMastery: 40 }]]
  // );
  // const chilledRuneRecipe = await createRecipe(
  //   null,
  //   chilledRune,
  //   1,
  //   inscription,
  //   [
  //     [rousingFrost, 5],
  //     [sereneInk, 1],
  //   ],
  //   1,
  //   "Reagents",
  //   1,
  //   260,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Learned by default.",
  //   [["Lesser Illustrious Insight", { RuneMastery: 40 }]]
  // );
  // const draconicMissiveOfTheAuroraRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfTheAurora,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [sereneInk, 1],
  //   ],
  //   45,
  //   "Missives",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfTheFeverflareRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfTheFeverflare,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [blazingInk, 1],
  //   ],
  //   45,
  //   "Missives",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfTheFireflashRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfTheFireflash,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [blazingInk, 1],
  //   ],
  //   45,
  //   "Missives",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfTheHarmoniousRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfTheHarmonious,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [sereneInk, 1],
  //   ],
  //   45,
  //   "Missives",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfThePeerlessRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfThePeerless,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [flourishingInk, 1],
  //   ],
  //   45,
  //   "Missives",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfTheQuickbladeRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfTheQuickblade,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [flourishingInk, 1],
  //   ],
  //   45,
  //   "Missives",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfCraftingSpeedRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfCraftingSpeed,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [flourishingInk, 1],
  //   ],
  //   null,
  //   "Crafting Tool Missives",
  //   1,
  //   275,
  //   { ArtisansConsortium: "Preferred" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfInspirationRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfInspiration,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [blazingInk, 1],
  //   ],
  //   null,
  //   "Crafting Tool Missives",
  //   1,
  //   275,
  //   { ArtisansConsortium: "Preferred" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfMulticraftRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfMulticraft,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [flourishingInk, 1],
  //   ],
  //   null,
  //   "Crafting Tool Missives",
  //   1,
  //   275,
  //   { ArtisansConsortium: "Preferred" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfResourcefulnessRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfResourcefulness,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [blazingInk, 1],
  //   ],
  //   null,
  //   "Crafting Tool Missives",
  //   1,
  //   275,
  //   { ArtisansConsortium: "Preferred" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfDeftnessRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfDeftness,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [sereneInk, 1],
  //   ],
  //   null,
  //   "Gathering Tool Missives",
  //   1,
  //   275,
  //   { ArtisansConsortium: "Preferred" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfFinesseRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfFinesse,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [flourishingInk, 1],
  //   ],
  //   null,
  //   "Gathering Tool Missives",
  //   1,
  //   275,
  //   { ArtisansConsortium: "Preferred" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicMissiveOfPerceptionRecipe = await createRecipe(
  //   null,
  //   draconicMissiveOfPerception,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [chilledRune, 1],
  //     [sereneInk, 1],
  //   ],
  //   null,
  //   "Gathering Tool Missives",
  //   1,
  //   275,
  //   { ArtisansConsortium: "Preferred" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const darkmoonDeckBoxDanceRecipe = await createRecipe(
  //   null,
  //   darkmoonDeckBoxDance,
  //   1,
  //   inscription,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 60],
  //     [darkmoonDeckDance, 1],
  //     [awakenedAir, 10],
  //     [writhebark, 10],
  //     [cosmicInk, 12],
  //   ],
  //   null,
  //   "Trinkets",
  //   3,
  //   360,
  //   null,
  //   { Air: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Primal Infusion", { Archiving: 0 }],
  //     ["Darkmoon Sigil", { Air: 10 }],
  //     ["Illustrious Insight", { RuneMastery: 40, Air: 30 }],
  //     ["Blotting Sand", { Archiving: 30, DarkmoonMysteries: 35 }],
  //   ]
  // );
  // const darkmoonDeckBoxInfernoRecipe = await createRecipe(
  //   null,
  //   darkmoonDeckBoxInferno,
  //   1,
  //   inscription,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 60],
  //     [darkmoonDeckInferno, 1],
  //     [awakenedFire, 10],
  //     [writhebark, 10],
  //     [cosmicInk, 12],
  //   ],
  //   null,
  //   "Trinkets",
  //   3,
  //   360,
  //   null,
  //   { Fire: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Primal Infusion", { Archiving: 0 }],
  //     ["Darkmoon Sigil", { Fire: 10 }],
  //     ["Illustrious Insight", { RuneMastery: 40, Fire: 30 }],
  //     ["Blotting Sand", { Archiving: 30, DarkmoonMysteries: 35 }],
  //   ]
  // );
  // const darkmoonDeckBoxRimeRecipe = await createRecipe(
  //   null,
  //   darkmoonDeckBoxRime,
  //   1,
  //   inscription,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 60],
  //     [darkmoonDeckRime, 1],
  //     [awakenedFrost, 10],
  //     [writhebark, 10],
  //     [cosmicInk, 12],
  //   ],
  //   null,
  //   "Trinkets",
  //   3,
  //   360,
  //   null,
  //   { Frost: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Primal Infusion", { Archiving: 0 }],
  //     ["Darkmoon Sigil", { Frost: 10 }],
  //     ["Illustrious Insight", { RuneMastery: 40, Frost: 30 }],
  //     ["Blotting Sand", { Archiving: 30, DarkmoonMysteries: 35 }],
  //   ]
  // );
  // const darkmoonDeckBoxWatcherRecipe = await createRecipe(
  //   null,
  //   darkmoonDeckBoxWatcher,
  //   1,
  //   inscription,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 60],
  //     [darkmoonDeckWatcher, 1],
  //     [awakenedEarth, 10],
  //     [writhebark, 10],
  //     [cosmicInk, 12],
  //   ],
  //   null,
  //   "Trinkets",
  //   3,
  //   360,
  //   null,
  //   { Earth: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Primal Infusion", { Archiving: 0 }],
  //     ["Darkmoon Sigil", { Earth: 10 }],
  //     ["Illustrious Insight", { RuneMastery: 40, Earth: 30 }],
  //     ["Blotting Sand", { Archiving: 30, DarkmoonMysteries: 35 }],
  //   ]
  // );
  // const crackingCodexOfTheIslesRecipe = await createRecipe(
  //   null,
  //   crackingCodexOfTheIsles,
  //   1,
  //   inscription,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [awakenedAir, 10],
  //     [glitteringParchment, 20],
  //     [cosmicInk, 12],
  //     [runedWrithebark, 5],
  //     [chilledRune, 4],
  //   ],
  //   null,
  //   "Weapons",
  //   2,
  //   300,
  //   null,
  //   { Codexes: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Primal Infusion", { Runebinding: 0 }],
  //     ["Missive", { RunicScripture: 0 }],
  //     ["Embellishment", {}],
  //     ["Illustrious Insight", { RuneMastery: 40, Codexes: 25 }],
  //     ["Blotting Sand", { Ruenbinding: 30 }],
  //   ]
  // );
  // const illuminatingPillarOfTheIslesRecipe = await createRecipe(
  //   null,
  //   illuminatingPillarOfTheIsles,
  //   1,
  //   inscription,
  //   [
  //     [sparkOfIngenuity, 2],
  //     [primalChaos, 160],
  //     [cosmicInk, 6],
  //     [runedWrithebark, 10],
  //     [chilledRune, 8],
  //   ],
  //   null,
  //   "Weapons",
  //   2,
  //   300,
  //   null,
  //   { Staves: 5 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Primal Infusion", { Runebinding: 0 }],
  //     ["Missive", { Woodcarving: 0 }],
  //     ["Embellishment", {}],
  //     ["Illustrious Insight", { RuneMastery: 40, Staves: 25 }],
  //     ["Blotting Sand", { Ruenbinding: 30 }],
  //   ]
  // );
  // const kineticPillarOfTheIslesRecipe = await createRecipe(
  //   null,
  //   kineticPillarOfTheIsles,
  //   1,
  //   inscription,
  //   [
  //     [sparkOfIngenuity, 2],
  //     [primalChaos, 160],
  //     [cosmicInk, 6],
  //     [runedWrithebark, 10],
  //     [chilledRune, 8],
  //   ],
  //   null,
  //   "Weapons",
  //   2,
  //   300,
  //   null,
  //   { Staves: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Primal Infusion", { Runebinding: 0 }],
  //     ["Missive", { Woodcarving: 0 }],
  //     ["Embellishment", {}],
  //     ["Illustrious Insight", { RuneMastery: 40, Staves: 25 }],
  //     ["Blotting Sand", { Ruenbinding: 30 }],
  //   ]
  // );
  // const weatheredExplorersStaveRecipe = await createRecipe(
  //   null,
  //   weatheredExplorersStave,
  //   1,
  //   inscription,
  //   [
  //     [sparkOfIngenuity, 2],
  //     [primalChaos, 160],
  //     [awakenedDecay, 8],
  //     [cosmicInk, 12],
  //     [runedWrithebark, 8],
  //     [chilledRune, 5],
  //   ],
  //   null,
  //   "Weapons",
  //   2,
  //   350,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Dropped from creatures, probably Decayed ones?",
  //   [
  //     ["Primal Infusion", { Runebinding: 0 }],
  //     ["Illustrious Insight", { RuneMastery: 40, Staves: 25 }],
  //     ["Blotting Sand", { Ruenbinding: 30 }],
  //   ]
  // );
  // const coreExplorersCompendiumRecipe = await createRecipe(
  //   null,
  //   coreExplorersCompendium,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 20],
  //     [rousingEarth, 5],
  //     [blazingInk, 1],
  //     [chilledRune, 1],
  //   ],
  //   15,
  //   "Weapons",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Missive", { RunicScripture: 0 }],
  //     ["Embellishment", {}],
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, Codexes: 25 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const overseersWrithebarkStaveRecipe = await createRecipe(
  //   null,
  //   overseersWrithebarkStave,
  //   1,
  //   inscription,
  //   [
  //     [blazingInk, 1],
  //     [runedWrithebark, 1],
  //   ],
  //   15,
  //   "Weapons",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Missive", { Woodcarving: 0 }],
  //     ["Embellishment", {}],
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, Staves: 25 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const pioneersWrithebarkStaveRecipe = await createRecipe(
  //   null,
  //   pioneersWrithebarkStave,
  //   1,
  //   inscription,
  //   [
  //     [sereneInk, 1],
  //     [runedWrithebark, 1],
  //   ],
  //   15,
  //   "Weapons",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Missive", { Woodcarving: 0 }],
  //     ["Embellishment", {}],
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, Staves: 25 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const emberscaleSigilRecipe = await createRecipe(
  //   null,
  //   emberscaleSigil,
  //   1,
  //   inscription,
  //   [
  //     [awakenedFire, 1],
  //     [blazingInk, 1],
  //     [burnishedInk, 2],
  //   ],
  //   null,
  //   "Runes and Sigils",
  //   2,
  //   300,
  //   null,
  //   { EmberscaleSigil: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, ScaleSigils: 20 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const jetscaleSigilRecipe = await createRecipe(
  //   null,
  //   jetscaleSigil,
  //   1,
  //   inscription,
  //   [
  //     [awakenedIre, 1],
  //     [cosmicInk, 1],
  //   ],
  //   null,
  //   "Runes and Sigils",
  //   2,
  //   300,
  //   null,
  //   { JetscaleSigil: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, ScaleSigils: 20 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const sagescaleSigilRecipe = await createRecipe(
  //   null,
  //   sagescaleSigil,
  //   1,
  //   inscription,
  //   [
  //     [awakenedEarth, 1],
  //     [flourishingInk, 1],
  //     [burnishedInk, 2],
  //   ],
  //   null,
  //   "Runes and Sigils",
  //   2,
  //   300,
  //   null,
  //   { SagescaleSigil: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, ScaleSigils: 20 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const azurescaleSigilRecipe = await createRecipe(
  //   null,
  //   azurescaleSigil,
  //   1,
  //   inscription,
  //   [
  //     [awakenedFrost, 1],
  //     [sereneInk, 1],
  //     [burnishedInk, 2],
  //   ],
  //   null,
  //   "Runes and Sigils",
  //   2,
  //   300,
  //   null,
  //   { AzurescaleSigil: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, ScaleSigils: 20 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const bronzescaleSigilRecipe = await createRecipe(
  //   null,
  //   bronzescaleSigil,
  //   1,
  //   inscription,
  //   [
  //     [awakenedOrder, 1],
  //     [burnishedInk, 2],
  //   ],
  //   null,
  //   "Runes and Sigils",
  //   2,
  //   300,
  //   null,
  //   { BronzescaleSigil: 0 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, ScaleSigils: 20 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const vantusRuneVaultOfTheIncarnatesRecipe = await createRecipe(
  //   null,
  //   vantusRuneVaultOfTheIncarnates,
  //   1,
  //   inscription,
  //   [
  //     [burnishedInk, 2],
  //     [chilledRune, 1],
  //   ],
  //   50,
  //   "Runes and Sigils",
  //   1,
  //   360,
  //   null,
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, VantusRunes: 20 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const buzzingRuneRecipe = await createRecipe(
  //   null,
  //   buzzingRune,
  //   2,
  //   inscription,
  //   [[chilledRune, 1]],
  //   25,
  //   "Runes and Sigils",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, FaunaRunes: 20 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const chirpingRuneRecipe = await createRecipe(
  //   null,
  //   chirpingRune,
  //   2,
  //   inscription,
  //   [[chilledRune, 1]],
  //   25,
  //   "Runes and Sigils",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, FaunaRunes: 20 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const howlingRuneRecipe = await createRecipe(
  //   null,
  //   howlingRune,
  //   2,
  //   inscription,
  //   [[chilledRune, 1]],
  //   25,
  //   "Runes and Sigils",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, FaunaRunes: 20 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const alchemistsBrilliantMixingRodRecipe = await createRecipe(
  //   null,
  //   alchemistsBrilliantMixingRod,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 300],
  //     [runedWrithebark, 12],
  //     [draconiumOre, 30],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   375,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const chefsSplendidRollingPinRecipe = await createRecipe(
  //   null,
  //   chefsSplendidRollingPin,
  //   1,
  //   inscription,
  //   [
  //     [runedWrithebark, 12],
  //     [draconiumOre, 30],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   375,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const scribesResplendentQuillRecipe = await createRecipe(
  //   null,
  //   scribesResplendentQuill,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 300],
  //     [contouredFowlfeather, 1],
  //     [runedWrithebark, 12],
  //     [cosmicInk, 4],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   375,
  //   null,
  //   { ProfessionTools: 10 },
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const alchemistsSturdyMixingRodRecipe = await createRecipe(
  //   null,
  //   alchemistsSturdyMixingRod,
  //   1,
  //   inscription,
  //   [
  //     [runedWrithebark, 1],
  //     [sereneInk, 1],
  //   ],
  //   25,
  //   "Profession Equipment",
  //   2,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const chefsSmoothRollingPinRecipe = await createRecipe(
  //   null,
  //   chefsSmoothRollingPin,
  //   1,
  //   inscription,
  //   [
  //     [runedWrithebark, 1],
  //     [blazingInk, 1],
  //   ],
  //   25,
  //   "Profession Equipment",
  //   2,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const scribesFastenedQuillRecipe = await createRecipe(
  //   null,
  //   scribesFastenedQuill,
  //   1,
  //   inscription,
  //   [
  //     [contouredFowlfeather, 1],
  //     [runedWrithebark, 1],
  //     [sereneInk, 1],
  //   ],
  //   25,
  //   "Profession Equipment",
  //   2,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Missive", {}],
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, ProfessionTools: 20 }],
  //     ["Blotting Sand", { Runebinding: 30 }],
  //   ]
  // );
  // const illusionParchmentWhirlingBreezeRecipe = await createRecipe(
  //   null,
  //   illusionParchmentWhirlingBreeze,
  //   5,
  //   inscription,
  //   [
  //     [glitteringParchment, 3],
  //     [iridescentWater, 3],
  //     [awakenedAir, 1],
  //     [flourishingInk, 1],
  //   ],
  //   null,
  //   "Scrolls",
  //   1,
  //   null,
  //   { ValdrakkenAccord: 28 }
  // );
  // const illusionParchmentAquaTorrentRecipe = await createRecipe(
  //   null,
  //   illusionParchmentAquaTorrent,
  //   5,
  //   inscription,
  //   [
  //     [glitteringParchment, 3],
  //     [iridescentWater, 3],
  //     [awakenedFrost, 1],
  //     [sereneInk, 1],
  //   ],
  //   null,
  //   "Scrolls",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   null,
  //   "Drops from Draconic Message in a Bottle."
  // );
  // const illusionParchmentArcaneBurstRecipe = await createRecipe(
  //   null,
  //   illusionParchmentArcaneBurst,
  //   5,
  //   inscription,
  //   [
  //     [glitteringParchment, 3],
  //     [iridescentWater, 3],
  //     [awakenedOrder, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Scrolls",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   null,
  //   "Drops from creatures in Thaldraszus."
  // );
  // const illusionParchmentChillingWindRecipe = await createRecipe(
  //   null,
  //   illusionParchmentChillingWind,
  //   5,
  //   inscription,
  //   [
  //     [glitteringParchment, 3],
  //     [iridescentWater, 3],
  //     [awakenedFrost, 1],
  //     [sereneInk, 1],
  //   ],
  //   null,
  //   "Scrolls",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   null,
  //   "Drops from creatures in The Azure Span."
  // );
  // const illusionParchmentLoveCharmRecipe = await createRecipe(
  //   null,
  //   illusionParchmentLoveCharm,
  //   5,
  //   inscription,
  //   [
  //     [glitteringParchment, 3],
  //     [iridescentWater, 3],
  //     [awakenedIre, 1],
  //   ],
  //   null,
  //   "Scrolls",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Dungeon Drop",
  //   null,
  //   "Drops from 'Deliberately Delinquent Notes' in Algeth'ar Academy."
  // );
  // const illusionParchmentMagmaMissileRecipe = await createRecipe(
  //   null,
  //   illusionParchmentMagmaMissile,
  //   5,
  //   inscription,
  //   [
  //     [glitteringParchment, 3],
  //     [iridescentWater, 3],
  //     [awakenedFire, 1],
  //     [blazingInk, 1],
  //   ],
  //   null,
  //   "Scrolls",
  //   1,
  //   null,
  //   { DragonscaleExpedition: 21 }
  // );
  // const illusionParchmentShadowOrbRecipe = await createRecipe(
  //   null,
  //   illusionParchmentShadowOrb,
  //   5,
  //   inscription,
  //   [
  //     [glitteringParchment, 3],
  //     [iridescentWater, 3],
  //     [awakenedDecay, 1],
  //     [sereneInk, 1],
  //   ],
  //   null,
  //   "Scrolls",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Dungeon Drop",
  //   null,
  //   "Drops from last boss in Algeth'ar Academy."
  // );
  // const illusionParchmentSpellShieldRecipe = await createRecipe(
  //   null,
  //   illusionParchmentSpellShield,
  //   5,
  //   inscription,
  //   [
  //     [glitteringParchment, 3],
  //     [iridescentWater, 3],
  //     [awakenedOrder, 1],
  //     [burnishedInk, 1],
  //   ],
  //   15,
  //   "Scrolls",
  //   1
  // );
  // const scrollOfSalesRecipe = await createRecipe(
  //   null,
  //   scrollOfSales,
  //   2,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [pentagoldSeal, 1],
  //     [sereneInk, 1],
  //   ],
  //   null,
  //   "Scrolls",
  //   1,
  //   150,
  //   { ArtisansConsortium: "Esteemed" }
  // );
  // const bundleOCardsDragonIslesRecipe = await createRecipe(
  //   null,
  //   bundleOCardsDragonIsles,
  //   1,
  //   inscription,
  //   [
  //     [awakenedOrder, 3],
  //     [awakenedAir, 3],
  //     [awakenedEarth, 3],
  //     [awakenedFire, 3],
  //     [awakenedFrost, 3],
  //     [glitteringParchment, 3],
  //   ],
  //   null,
  //   "Mysteries",
  //   1,
  //   null,
  //   null,
  //   { DarkmoonMysteries: 0 }
  // );
  // const blazingFortuneRecipe = await createRecipe(
  //   "Blazing Fortune",
  //   fatedFortuneCard,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [blazingInk, 1],
  //   ],
  //   10,
  //   "Mysteries",
  //   1
  // );
  // const flourishingFortuneRecipe = await createRecipe(
  //   "Flourishing Fortune",
  //   fatedFortuneCard,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [flourishingInk, 1],
  //   ],
  //   10,
  //   "Mysteries",
  //   1
  // );
  // const sereneFortuneRecipe = await createRecipe(
  //   "Serene Fortune",
  //   fatedFortuneCard,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [sereneInk, 1],
  //   ],
  //   10,
  //   "Mysteries",
  //   1
  // );
  // // const extractionAwakenedAir = await(createRecipe("Extraction: Awakened Air", awakenedAir, 1, inscription, [[insert ace through eight of air here, 1]], null, "Mysteries", 1, null, null, {Air: 20}));
  // // const extractionAwakenedEarth = await(createRecipe("Extraction: Awakened Earth", awakenedEarth, 1, inscription, [[insert ace through eight of earth here, 1]], null, "Mysteries", 1, null, null, {Earth: 20}));
  // // const extractionAwakenedFire = await(createRecipe("Extraction: Awakened Fire", awakenedFire, 1, inscription, [[insert ace through eight of fire here, 1]], null, "Mysteries", 1, null, null, {Fire: 20}));
  // // const extractionAwakenedFrost = await(createRecipe("Extraction: Awakened Frost", awakenedFrost, 1, inscription, [[insert ace through eight of frost here, 1]], null, "Mysteries", 1, null, null, {Frost: 20}));
  // const contractArtisansConsortiumRecipe = await createRecipe(
  //   null,
  //   contractArtisansConsortium,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [burnishedInk, 3],
  //   ],
  //   null,
  //   "Contracts",
  //   1,
  //   300,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const contractDragonscaleExpeditionRecipe = await createRecipe(
  //   null,
  //   contractDragonscaleExpedition,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [blazingInk, 1],
  //     [chilledRune, 1],
  //   ],
  //   null,
  //   "Contracts",
  //   1,
  //   300,
  //   { DragonscaleExpedition: 19 },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const contractIskaaraTuskarrRecipe = await createRecipe(
  //   null,
  //   contractIskaaraTuskarr,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [sereneInk, 1],
  //     [chilledRune, 1],
  //   ],
  //   null,
  //   "Contracts",
  //   1,
  //   300,
  //   { IskaaraTuskarr: 25 },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const contractMaruukCentaurRecipe = await createRecipe(
  //   null,
  //   contractMaruukCentaur,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [flourishingInk, 1],
  //     [chilledRune, 1],
  //   ],
  //   null,
  //   "Contracts",
  //   1,
  //   300,
  //   { MaruukCentaur: 22 },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const contractValdrakkenAccordRecipe = await createRecipe(
  //   null,
  //   contractValdrakkenAccord,
  //   1,
  //   inscription,
  //   [
  //     [glitteringParchment, 1],
  //     [burnishedInk, 2],
  //   ],
  //   null,
  //   "Contracts",
  //   1,
  //   300,
  //   { ValdrakkenAccord: 23 },
  //   null,
  //   null,
  //   "Scribe's Drafting Table",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { RuneMastery: 40, SharedKnowledge: 25 }],
  //     ["Blotting Sand", { Archiving: 30 }],
  //   ]
  // );
  // const draconicTreatiseOnAlchemyRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnAlchemy,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedAir, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   null,
  //   "Crafting Other Treatises",
  //   "Scribe's Drafting Table",
  //   "Can be learned when crafting other Draconic Treatises."
  // );
  // const draconicTreatiseOnBlacksmithingRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnBlacksmithing,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedFire, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   null,
  //   "Crafting Other Treatises",
  //   "Scribe's Drafting Table",
  //   "Can be learned when crafting other Draconic Treatises."
  // );
  // const draconicTreatiseOnEnchantingRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnEnchanting,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedFrost, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   null,
  //   "Crafting Other Treatises",
  //   "Scribe's Drafting Table",
  //   "Can be learned when crafting other Draconic Treatises."
  // );
  // const draconicTreatiseOnEngineeringRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnEngineering,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedFire, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   null,
  //   "Crafting Other Treatises",
  //   "Scribe's Drafting Table",
  //   "Can be learned when crafting other Draconic Treatises."
  // );
  // const draconicTreatiseOnHerbalismRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnHerbalism,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedEarth, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   null,
  //   "Crafting Other Treatises",
  //   "Scribe's Drafting Table",
  //   "Can be learned when crafting other Draconic Treatises."
  // );
  // const draconicTreatiseOnInscriptionRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnInscription,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedFrost, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   { DraconicTreatises: 0 },
  //   null,
  //   "Scribe's Drafting Table"
  // );
  // const draconicTreatiseOnJewelcraftingRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnJewelcrafting,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedFire, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   null,
  //   "Crafting Other Treatises",
  //   "Scribe's Drafting Table",
  //   "Can be learned when crafting other Draconic Treatises."
  // );
  // const draconicTreatiseOnLeatherworkingRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnLeatherworking,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedAir, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   null,
  //   "Crafting Other Treatises",
  //   "Scribe's Drafting Table",
  //   "Can be learned when crafting other Draconic Treatises."
  // );
  // const draconicTreatiseOnMiningRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnMining,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedEarth, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   null,
  //   "Crafting Other Treatises",
  //   "Scribe's Drafting Table",
  //   "Can be learned when crafting other Draconic Treatises."
  // );
  // const draconicTreatiseOnSkinningRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnSkinning,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedEarth, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   null,
  //   "Crafting Other Treatises",
  //   "Scribe's Drafting Table",
  //   "Can be learned when crafting other Draconic Treatises."
  // );
  // const draconicTreatiseOnTailoringRecipe = await createRecipe(
  //   null,
  //   draconicTreatiseOnTailoring,
  //   1,
  //   inscription,
  //   [
  //     [artisansMettle, 10],
  //     [rockfangLeather, 1],
  //     [glitteringParchment, 5],
  //     [awakenedFrost, 1],
  //     [burnishedInk, 1],
  //   ],
  //   null,
  //   "Profession Specialization",
  //   2,
  //   null,
  //   null,
  //   null,
  //   "Crafting Other Treatises",
  //   "Scribe's Drafting Table",
  //   "Can be learned when crafting other Draconic Treatises."
  // );
  // const renewedProtoDrakeSilverAndBlueArmorRecipe = await createRecipe(
  //   null,
  //   renewedProtoDrakeSilverAndBlueArmor,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 20],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 8],
  //     [finishedPrototypeRegalBarding, 1],
  //     [rockfangLeather, 10],
  //   ],
  //   null,
  //   "Dragonriding - Renewed Proto-Drake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Dungeon Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from Ruby Life Pools last boss."
  // );
  // const renewedProtoDrakeSteelAndYellowArmorRecipe = await createRecipe(
  //   null,
  //   renewedProtoDrakeSteelAndYellowArmor,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 20],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 8],
  //     [finishedPrototypeExplorersBarding, 1],
  //     [rockfangLeather, 10],
  //   ],
  //   null,
  //   "Dragonriding - Renewed Proto-Drake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from Draconic Recipe in a Bottle."
  // );
  // const renewedProtoDrakeBovineHornsRecipe = await createRecipe(
  //   null,
  //   renewedProtoDrakeBovineHorns,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Renewed Proto-Drake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from creatures on The Waking Shores."
  // );
  // const renewedProtoDrakePredatorPatternRecipe = await createRecipe(
  //   null,
  //   renewedProtoDrakePredatorPattern,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Renewed Proto-Drake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from Draconic Recipe in a Bottle."
  // );
  // const renewedProtoDrakeSpinedCrestRecipe = await createRecipe(
  //   null,
  //   renewedProtoDrakeSpinedCrest,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Renewed Proto-Drake",
  //   1,
  //   null,
  //   { DragonscaleExpedition: 15 },
  //   null,
  //   null,
  //   "Scribe's Drafting Table"
  // );
  // const windborneVelocidrakeSilverAndBlueArmorRecipe = await createRecipe(
  //   null,
  //   windborneVelocidrakeSilverAndBlueArmor,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 20],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 8],
  //     [finishedPrototypeRegalBarding, 1],
  //     [rockfangLeather, 10],
  //   ],
  //   null,
  //   "Dragonriding - Windborne Velocidrake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Dungeon Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from The Nokhud Offensive last boss."
  // );
  // const windborneVelocidrakeSteelAndOrangeArmorRecipe = await createRecipe(
  //   null,
  //   windborneVelocidrakeSteelAndOrangeArmor,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 20],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 8],
  //     [finishedPrototypeExplorersBarding, 1],
  //     [rockfangLeather, 10],
  //   ],
  //   null,
  //   "Dragonriding - Windborne Velocidrake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Purchasable from The Great Swog?"
  // );
  // const windborneVelocidrakeBlackFurRecipe = await createRecipe(
  //   null,
  //   windborneVelocidrakeBlackFur,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Windborne Velocidrake",
  //   1,
  //   null,
  //   { MaruukCentaur: 15 },
  //   null,
  //   null,
  //   "Scribe's Drafting Table"
  // );
  // const windborneVelocidrakeSpinedHeadRecipe = await createRecipe(
  //   null,
  //   windborneVelocidrakeSpinedHead,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Windborne Velocidrake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from Draconic Recipe in a Bottle."
  // );
  // const windborneVelocidrakeWindsweptPatternRecipe = await createRecipe(
  //   null,
  //   windborneVelocidrakeWindsweptPattern,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Windborne Velocidrake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from creatures in the Ohn'ahran Plains."
  // );
  // const highlandDrakeSilverAndBlueArmorRecipe = await createRecipe(
  //   null,
  //   highlandDrakeSilverAndBlueArmor,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 20],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 8],
  //     [finishedPrototypeRegalBarding, 1],
  //     [rockfangLeather, 10],
  //   ],
  //   null,
  //   "Dragonriding - Highland Drake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from creatures in The Azure Span."
  // );
  // const highlandDrakeSteelAndYellowArmorRecipe = await createRecipe(
  //   null,
  //   highlandDrakeSteelAndYellowArmor,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 20],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 8],
  //     [finishedPrototypeRegalBarding, 1],
  //     [rockfangLeather, 10],
  //   ],
  //   null,
  //   "Dragonriding - Highland Drake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Purchasable from The Great Swog?"
  // );
  // const highlandDrakeBlackHairRecipe = await createRecipe(
  //   null,
  //   highlandDrakeBlackHair,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Highland Drake",
  //   1,
  //   null,
  //   { IskaaraTuskarr: 13 },
  //   null,
  //   null,
  //   "Scribe's Drafting Table"
  // );
  // const highlandDrakeSpinedCrestRecipe = await createRecipe(
  //   null,
  //   highlandDrakeSpinedCrest,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Highland Drake",
  //   1,
  //   null,
  //   { CobaltAssembly: "High" },
  //   null,
  //   null,
  //   "Scribe's Drafting Table"
  // );
  // const highlandDrakeSpinedThroatRecipe = await createRecipe(
  //   null,
  //   highlandDrakeSpinedThroat,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Highland Drake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from Draconic Recipe in a Bottle."
  // );
  // const cliffsideWylderdrakeSilverAndBlueArmorRecipe = await createRecipe(
  //   null,
  //   cliffsideWylderdrakeSilverAndBlueArmor,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 20],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 8],
  //     [finishedPrototypeRegalBarding, 1],
  //     [rockfangLeather, 10],
  //   ],
  //   null,
  //   "Dragonriding - Cliffside Wylderdrake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from creatures in Thaldraszus."
  // );
  // const cliffsideWylderdrakeSteelAndYellowArmorRecipe = await createRecipe(
  //   null,
  //   cliffsideWylderdrakeSteelAndYellowArmor,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 20],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 8],
  //     [finishedPrototypeRegalBarding, 1],
  //     [rockfangLeather, 10],
  //   ],
  //   null,
  //   "Dragonriding - Cliffside Wylderdrake",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Purchasable from The Great Swog?"
  // );
  // const cliffsideWylderdrakeConicalHeadRecipe = await createRecipe(
  //   null,
  //   cliffsideWylderdrakeConicalHead,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Cliffside Wylderdrake",
  //   3,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from Draconic Recipe in a Bottle."
  // );
  // const cliffsideWylderdrakeRedHairRecipe = await createRecipe(
  //   null,
  //   cliffsideWylderdrakeRedHair,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Cliffside Wylderdrake",
  //   3,
  //   null,
  //   { ValdrakkenAccord: 15 },
  //   null,
  //   null,
  //   "Scribe's Drafting Table"
  // );
  // const cliffsideWylderdrakeTripleHeadHornsRecipe = await createRecipe(
  //   null,
  //   cliffsideWylderdrakeTripleHeadHorns,
  //   1,
  //   inscription,
  //   [
  //     [wildercloth, 15],
  //     [glitteringParchment, 5],
  //     [iridescentWater, 8],
  //     [flawlessProtoDragonScale, 10],
  //     [awakenedOrder, 4],
  //   ],
  //   null,
  //   "Dragonriding - Cliffside Wylderdrake",
  //   3,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Scribe's Drafting Table",
  //   "Drops from creatures in Thaldraszus."
  // );

  // //jewelcrafting recipes - 82 total
  // // const dragonIslesCrushing = await(createRecipe());
  // // const dragonIslesProspecting = await(createRecipe());
  // const elementalHarmonyRecipe = await createRecipe(
  //   null,
  //   elementalHarmony,
  //   1,
  //   jewelcrafting,
  //   [
  //     [alexstraszite, 1],
  //     [malygite, 1],
  //     [ysemerald, 1],
  //     [neltharite, 1],
  //     [nozdorite, 1],
  //     [primalConvergent, 1],
  //   ],
  //   40,
  //   "Reagents",
  //   1,
  //   275,
  //   null,
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const illustriousInsightRecipeJewelcrafting = await createRecipe(
  //   "Illustrious Insight",
  //   illustriousInsight,
  //   1,
  //   jewelcrafting,
  //   [[artisansMettle, 50]],
  //   null,
  //   "Finishing Reagents",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Various Specializations",
  //   "Jeweler's Bench"
  // );
  // const blottingSandRecipe = await createRecipe(
  //   null,
  //   blottingSand,
  //   2,
  //   jewelcrafting,
  //   [
  //     [rousingFire, 1],
  //     [wildercloth, 1],
  //     [silkenGemdust, 1],
  //   ],
  //   null,
  //   "Reagents",
  //   1,
  //   225,
  //   null,
  //   { Enterprising: 0 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const pounceRecipe = await createRecipe(
  //   null,
  //   pounce,
  //   2,
  //   jewelcrafting,
  //   [
  //     [rousingEarth, 2],
  //     [wildercloth, 1],
  //     [silkenGemdust, 2],
  //   ],
  //   null,
  //   "Reagents",
  //   1,
  //   275,
  //   null,
  //   { Extravagancies: 0 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const emptySoulCageRecipe = await createRecipe(
  //   null,
  //   emptySoulCage,
  //   1,
  //   jewelcrafting,
  //   [
  //     [fracturedGlass, 3],
  //     [rousingAir, 2],
  //     [rousingEarth, 2],
  //     [rousingFire, 2],
  //     [rousingFrost, 2],
  //   ],
  //   null,
  //   "Reagents",
  //   1,
  //   null,
  //   null,
  //   { Enterprising: 15 },
  //   null,
  //   "Jeweler's Bench"
  // );
  // const draconicVialRecipe = await createRecipe(
  //   null,
  //   draconicVial,
  //   5,
  //   jewelcrafting,
  //   [
  //     [rousingFire, 1],
  //     [fracturedGlass, 5],
  //     [draconicStopper, 5],
  //     [silkenGemdust, 1],
  //   ],
  //   20,
  //   "Reagents",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20, Glassware: 10 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const framelessLensRecipe = await createRecipe(
  //   null,
  //   framelessLens,
  //   2,
  //   jewelcrafting,
  //   [
  //     [rousingEarth, 1],
  //     [fracturedGlass, 3],
  //     [silkenGemdust, 2],
  //   ],
  //   10,
  //   "Reagents",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20, Glassware: 10 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const glossyStoneRecipe = await createRecipe(
  //   null,
  //   glossyStone,
  //   2,
  //   jewelcrafting,
  //   [
  //     [crumbledStone, 4],
  //     [rousingEarth, 2],
  //     [eternityAmber, 1],
  //   ],
  //   5,
  //   "Reagents",
  //   1,
  //   200,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const shimmeringClaspRecipe = await createRecipe(
  //   null,
  //   shimmeringClasp,
  //   2,
  //   jewelcrafting,
  //   [
  //     [misshapenFiligree, 1],
  //     [mysticSapphire, 1],
  //   ],
  //   5,
  //   "Reagents",
  //   1,
  //   200,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const craftyQueensRubyRecipe = await createRecipe(
  //   null,
  //   craftyQueensRuby,
  //   1,
  //   jewelcrafting,
  //   [
  //     [rousingAir, 2],
  //     [queensRuby, 2],
  //   ],
  //   15,
  //   "Rudimentary Gems",
  //   1,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Polishing Cloth", { Faceting: 0 }]]
  // );
  // const energizedVibrantEmeraldRecipe = await createRecipe(
  //   null,
  //   energizedVibrantEmerald,
  //   1,
  //   jewelcrafting,
  //   [
  //     [rousingFrost, 2],
  //     [vibrantEmerald, 2],
  //   ],
  //   10,
  //   "Rudimentary Gems",
  //   1,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Polishing Cloth", { Faceting: 0 }]]
  // );
  // const senseisSunderedOnyxRecipe = await createRecipe(
  //   null,
  //   senseisSunderedOnyx,
  //   1,
  //   jewelcrafting,
  //   [
  //     [rousingFire, 2],
  //     [sunderedOnyx, 2],
  //   ],
  //   15,
  //   "Rudimentary Gems",
  //   1,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Polishing Cloth", { Faceting: 0 }]]
  // );
  // const zenMysticSapphireRecipe = await createRecipe(
  //   null,
  //   zenMysticSapphire,
  //   1,
  //   jewelcrafting,
  //   [
  //     [rousingEarth, 2],
  //     [mysticSapphire, 2],
  //   ],
  //   10,
  //   "Rudimentary Gems",
  //   1,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Polishing Cloth", { Faceting: 0 }]]
  // );
  // const solidEternityAmberRecipe = await createRecipe(
  //   null,
  //   solidEternityAmber,
  //   1,
  //   jewelcrafting,
  //   [[eternityAmber, 2]],
  //   1,
  //   "Rudimentary Gems",
  //   1,
  //   150,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Learned by default.",
  //   [["Polishing Cloth", { Faceting: 0 }]]
  // );
  // const craftyAlexstrasziteRecipe = await createRecipe(
  //   null,
  //   craftyAlexstraszite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedAir, 2],
  //     [awakenedFire, 1],
  //     [awakenedOrder, 1],
  //     [alexstraszite, 1],
  //   ],
  //   null,
  //   "Air Gems",
  //   1,
  //   325,
  //   null,
  //   { Air: 10 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Air: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const energizedMalygiteRecipe = await createRecipe(
  //   null,
  //   energizedMalygite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedAir, 2],
  //     [awakenedFrost, 1],
  //     [awakenedOrder, 1],
  //     [malygite, 1],
  //   ],
  //   null,
  //   "Air Gems",
  //   1,
  //   325,
  //   { DragonscaleExpedition: 9 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Air: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const forcefulNozdoriteRecipe = await createRecipe(
  //   null,
  //   forcefulNozdorite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedAir, 1],
  //     [nozdorite, 1],
  //   ],
  //   30,
  //   "Air Gems",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Air: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const keenNelthariteRecipe = await createRecipe(
  //   null,
  //   keenNeltharite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedAir, 2],
  //     [awakenedEarth, 1],
  //     [awakenedOrder, 1],
  //     [neltharite, 1],
  //   ],
  //   null,
  //   "Air Gems",
  //   1,
  //   325,
  //   { DragonscaleExpedition: 9 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Air: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const quickYsemeraldRecipe = await createRecipe(
  //   null,
  //   quickYsemerald,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedAir, 3],
  //     [awakenedOrder, 1],
  //     [ysemerald, 1],
  //   ],
  //   null,
  //   "Air Gems",
  //   1,
  //   325,
  //   null,
  //   { Air: 20 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Air: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const fracturedNelthariteRecipe = await createRecipe(
  //   null,
  //   fracturedNeltharite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedEarth, 3],
  //     [awakenedOrder, 1],
  //     [neltharite, 1],
  //   ],
  //   null,
  //   "Earth Gems",
  //   1,
  //   325,
  //   null,
  //   { Earth: 20 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Earth: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const keenYsemeraldRecipe = await createRecipe(
  //   null,
  //   keenYsemerald,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedEarth, 2],
  //     [awakenedAir, 1],
  //     [awakenedOrder, 1],
  //     [ysemerald, 1],
  //   ],
  //   null,
  //   "Earth Gems",
  //   1,
  //   325,
  //   { IskaaraTuskarr: 10 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Earth: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const puissantNozdoriteRecipe = await createRecipe(
  //   null,
  //   puissantNozdorite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedEarth, 1],
  //     [nozdorite, 1],
  //   ],
  //   30,
  //   "Earth Gems",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Earth: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const senseisAlexstrasziteRecipe = await createRecipe(
  //   null,
  //   senseisAlexstraszite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedEarth, 2],
  //     [awakenedFire, 1],
  //     [awakenedOrder, 1],
  //     [alexstraszite, 1],
  //   ],
  //   null,
  //   "Earth Gems",
  //   1,
  //   325,
  //   { IskaaraTuskarr: 10 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Earth: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const zenMalygiteRecipe = await createRecipe(
  //   null,
  //   zenMalygite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedEarth, 2],
  //     [awakenedFrost, 1],
  //     [awakenedOrder, 1],
  //     [malygite, 1],
  //   ],
  //   null,
  //   "Earth Gems",
  //   1,
  //   325,
  //   null,
  //   { Earth: 10 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Earth: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const craftyYsemeraldRecipe = await createRecipe(
  //   null,
  //   craftyYsemerald,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFire, 2],
  //     [awakenedAir, 1],
  //     [awakenedOrder, 1],
  //     [ysemerald, 1],
  //   ],
  //   null,
  //   "Fire Gems",
  //   1,
  //   325,
  //   null,
  //   { Fire: 10 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Fire: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const deadlyAlexstrasziteRecipe = await createRecipe(
  //   null,
  //   deadlyAlexstraszite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFire, 3],
  //     [awakenedOrder, 1],
  //     [alexstraszite, 1],
  //   ],
  //   null,
  //   "Fire Gems",
  //   1,
  //   325,
  //   null,
  //   { Fire: 20 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Fire: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const jaggedNozdoriteRecipe = await createRecipe(
  //   null,
  //   jaggedNozdorite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFire, 1],
  //     [nozdorite, 1],
  //   ],
  //   30,
  //   "Fire Gems",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Fire: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const radiantMalygiteRecipe = await createRecipe(
  //   null,
  //   radiantMalygite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFire, 2],
  //     [awakenedFrost, 1],
  //     [awakenedOrder, 1],
  //     [malygite, 1],
  //   ],
  //   null,
  //   "Fire Gems",
  //   1,
  //   325,
  //   { DragonscaleExpedition: 9 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Fire: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const senseisNelthariteRecipe = await createRecipe(
  //   null,
  //   senseisNeltharite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFire, 2],
  //     [awakenedEarth, 1],
  //     [awakenedOrder, 1],
  //     [neltharite, 1],
  //   ],
  //   null,
  //   "Fire Gems",
  //   1,
  //   325,
  //   { DragonscaleExpedition: 9 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Fire: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const energizedYsemeraldRecipe = await createRecipe(
  //   null,
  //   energizedYsemerald,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFrost, 2],
  //     [awakenedAir, 1],
  //     [awakenedOrder, 1],
  //     [ysemerald, 1],
  //   ],
  //   null,
  //   "Frost Gems",
  //   1,
  //   325,
  //   { IskaaraTuskarr: 10 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Frost: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const radiantAlexstrasziteRecipe = await createRecipe(
  //   null,
  //   radiantAlexstraszite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFrost, 2],
  //     [awakenedFire, 1],
  //     [awakenedOrder, 1],
  //     [alexstraszite, 1],
  //   ],
  //   null,
  //   "Frost Gems",
  //   1,
  //   325,
  //   { IskaaraTuskarr: 10 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Frost: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const steadyNozdoriteRecipe = await createRecipe(
  //   null,
  //   steadyNozdorite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFrost, 1],
  //     [nozdorite, 1],
  //   ],
  //   30,
  //   "Frost Gems",
  //   1,
  //   300,
  //   null,
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Frost: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const stormyMalygiteRecipe = await createRecipe(
  //   null,
  //   stormyMalygite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFrost, 3],
  //     [awakenedOrder, 1],
  //     [malygite, 1],
  //   ],
  //   null,
  //   "Frost Gems",
  //   1,
  //   325,
  //   null,
  //   { Frost: 20 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Frost: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const zenNelthariteRecipe = await createRecipe(
  //   null,
  //   zenNeltharite,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFrost, 2],
  //     [awakenedEarth, 1],
  //     [awakenedOrder, 1],
  //     [neltharite, 1],
  //   ],
  //   null,
  //   "Frost Gems",
  //   1,
  //   325,
  //   null,
  //   { Frost: 10 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Frost: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const fierceIllimitedDiamondRecipe = await createRecipe(
  //   null,
  //   fierceIllimitedDiamond,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedAir, 1],
  //     [awakenedOrder, 1],
  //     [primalChaos, 20],
  //     [illimitedDiamond, 1],
  //     [ysemerald, 1],
  //   ],
  //   null,
  //   "Primalist Gems",
  //   1,
  //   375,
  //   null,
  //   { Air: 40 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Illustrious Insight", { Air: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const inscribedIllimitedDiamondRecipe = await createRecipe(
  //   null,
  //   inscribedIllimitedDiamond,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFire, 1],
  //     [awakenedOrder, 1],
  //     [primalChaos, 20],
  //     [illimitedDiamond, 1],
  //     [alexstraszite, 1],
  //   ],
  //   null,
  //   "Primalist Gems",
  //   1,
  //   375,
  //   null,
  //   { Fire: 40 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Illustrious Insight", { Fire: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const resplendentIllimitedDiamondRecipe = await createRecipe(
  //   null,
  //   resplendentIllimitedDiamond,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFrost, 1],
  //     [awakenedOrder, 1],
  //     [primalChaos, 20],
  //     [illimitedDiamond, 1],
  //     [malygite, 1],
  //   ],
  //   null,
  //   "Primalist Gems",
  //   1,
  //   375,
  //   null,
  //   { Frost: 40 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Illustrious Insight", { Frost: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const skillfulIllimitedDiamondRecipe = await createRecipe(
  //   null,
  //   skillfulIllimitedDiamond,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedEarth, 1],
  //     [awakenedOrder, 1],
  //     [primalChaos, 20],
  //     [illimitedDiamond, 1],
  //     [neltharite, 1],
  //   ],
  //   null,
  //   "Primalist Gems",
  //   1,
  //   375,
  //   null,
  //   { Earth: 40 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Illustrious Insight", { Earth: 30 }],
  //     ["Polishing Cloth", { Faceting: 0 }],
  //   ]
  // );
  // const tieredMedallionSettingRecipe = await createRecipe(
  //   null,
  //   tieredMedallionSetting,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedOrder, 1],
  //     [illimitedDiamond, 1],
  //     [shimmeringClasp, 1],
  //   ],
  //   null,
  //   "Miscellaneous",
  //   1,
  //   275,
  //   null,
  //   { Setting: 30 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", {}],
  //     ["Polishing Cloth", {}],
  //   ]
  // );
  // const idolOfTheDreamerRecipe = await createRecipe(
  //   null,
  //   idolOfTheDreamer,
  //   1,
  //   jewelcrafting,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 60],
  //     [airySoul, 1],
  //     [ysemerald, 1],
  //     [illimitedDiamond, 1],
  //     [glossyStone, 10],
  //   ],
  //   null,
  //   "Trinkets",
  //   1,
  //   325,
  //   { IskaaraTuskarr: 15 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { Idols: 0 }],
  //     ["Illustrious Insight", { Idols: 30 }],
  //     ["Polishing Cloth", { Carving: 30 }],
  //   ]
  // );
  // const idolOfTheEarthWarderRecipe = await createRecipe(
  //   null,
  //   idolOfTheEarthWarder,
  //   1,
  //   jewelcrafting,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 60],
  //     [earthenSoul, 1],
  //     [neltharite, 1],
  //     [illimitedDiamond, 1],
  //     [glossyStone, 10],
  //   ],
  //   null,
  //   "Trinkets",
  //   1,
  //   325,
  //   { DragonscaleExpedition: 13 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { Idols: 0 }],
  //     ["Illustrious Insight", { Idols: 30 }],
  //     ["Polishing Cloth", { Carving: 30 }],
  //   ]
  // );
  // const idolOfTheLifebinderRecipe = await createRecipe(
  //   null,
  //   idolOfTheLifebinder,
  //   1,
  //   jewelcrafting,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 60],
  //     [fierySoul, 1],
  //     [alexstraszite, 1],
  //     [illimitedDiamond, 1],
  //     [glossyStone, 10],
  //   ],
  //   null,
  //   "Trinkets",
  //   1,
  //   325,
  //   { DragonscaleExpedition: 13 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { Idols: 0 }],
  //     ["Illustrious Insight", { Idols: 30 }],
  //     ["Polishing Cloth", { Carving: 30 }],
  //   ]
  // );
  // const idolOfTheSpellWeaverRecipe = await createRecipe(
  //   null,
  //   idolOfTheSpellWeaver,
  //   1,
  //   jewelcrafting,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 60],
  //     [frostySoul, 1],
  //     [malygite, 1],
  //     [illimitedDiamond, 1],
  //     [glossyStone, 10],
  //   ],
  //   null,
  //   "Trinkets",
  //   1,
  //   325,
  //   { IskaaraTuskarr: 15 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { Idols: 0 }],
  //     ["Illustrious Insight", { Idols: 30 }],
  //     ["Polishing Cloth", { Carving: 30 }],
  //   ]
  // );
  // const chokerOfShieldingRecipe = await createRecipe(
  //   null,
  //   chokerOfShielding,
  //   1,
  //   jewelcrafting,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 30],
  //     [shimmeringClasp, 2],
  //     [illimitedDiamond, 1],
  //     [elementalHarmony, 1],
  //   ],
  //   null,
  //   "Jewelry",
  //   1,
  //   315,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Jeweler's Bench",
  //   "Drops from bosses in Vault of the Incarnates.",
  //   [
  //     ["Missive", { Jewelry: 15 }],
  //     ["Primal Infusion", { Jewelry: 25 }],
  //     ["Illustrious Insight", { Necklaces: 30 }],
  //     ["Polishing Cloth", { Jewelry: 30 }],
  //   ]
  // );
  // const elementalLariatRecipe = await createRecipe(
  //   null,
  //   elementalLariat,
  //   1,
  //   jewelcrafting,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 30],
  //     [shimmeringClasp, 2],
  //     [illimitedDiamond, 1],
  //     [elementalHarmony, 1],
  //   ],
  //   null,
  //   "Jewelry",
  //   1,
  //   315,
  //   null,
  //   null,
  //   "World Drop",
  //   "Jeweler's Bench",
  //   "Drops from 'powerful creatures' in Primal Storms.",
  //   [
  //     ["Missive", { Jewelry: 15 }],
  //     ["Primal Infusion", { Jewelry: 25 }],
  //     ["Illustrious Insight", { Necklaces: 30 }],
  //     ["Polishing Cloth", { Jewelry: 30 }],
  //   ]
  // );
  // const ringBoundHourglassRecipe = await createRecipe(
  //   null,
  //   ringBoundHourglass,
  //   1,
  //   jewelcrafting,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 30],
  //     [shimmeringClasp, 2],
  //     [illimitedDiamond, 1],
  //     [elementalHarmony, 1],
  //     [silkenGemdust, 3],
  //   ],
  //   null,
  //   "Jewelry",
  //   1,
  //   315,
  //   null,
  //   null,
  //   "World Drop",
  //   "Jeweler's Bench",
  //   "Drops from 'Chest of the Elements' in the Primalist Tomorrow zone.",
  //   [
  //     ["Missive", { Jewelry: 15 }],
  //     ["Primal Infusion", { Jewelry: 25 }],
  //     ["Illustrious Insight", { Rings: 30 }],
  //     ["Polishing Cloth", { Jewelry: 30 }],
  //   ]
  // );
  // const signetOfTitanicInsightRecipe = await createRecipe(
  //   null,
  //   signetOfTitanicInsight,
  //   1,
  //   jewelcrafting,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 30],
  //     [shimmeringClasp, 2],
  //     [elementalHarmony, 1],
  //     [ysemerald, 1],
  //   ],
  //   null,
  //   "Jewelry",
  //   1,
  //   280,
  //   null,
  //   { Rings: 0 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Missive", { Jewelry: 15 }],
  //     ["Primal Infusion", { Jewelry: 25 }],
  //     ["Embellishment", { Rings: 15 }],
  //     ["Illustrious Insight", { Rings: 30 }],
  //     ["Polishing Cloth", { Jewelry: 30 }],
  //   ]
  // );
  // const torcOfPassedTimeRecipe = await createRecipe(
  //   null,
  //   torcOfPassedTime,
  //   1,
  //   jewelcrafting,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 30],
  //     [shimmeringClasp, 2],
  //     [elementalHarmony, 1],
  //     [malygite, 1],
  //   ],
  //   null,
  //   "Jewelry",
  //   1,
  //   280,
  //   null,
  //   { Necklaces: 0 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Missive", { Jewelry: 15 }],
  //     ["Primal Infusion", { Jewelry: 25 }],
  //     ["Embellishment", { Necklaces: 15 }],
  //     ["Illustrious Insight", { Necklaces: 30 }],
  //     ["Polishing Cloth", { Jewelry: 30 }],
  //   ]
  // );
  // const crimsonCombatantsJeweledAmuletRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsJeweledAmulet,
  //   1,
  //   jewelcrafting,
  //   [
  //     [rousingIre, 2],
  //     [shimmeringClasp, 1],
  //     [mysticSapphire, 2],
  //   ],
  //   null,
  //   "Jewelry",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Jeweler's Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { Jewelry: 15 }],
  //     ["Lesser Illustrious Insight", { Necklaces: 30 }],
  //     ["Polishing Cloth", { Jewelry: 30 }],
  //   ]
  // );
  // const crimsonCombatantsJeweledSignetRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsJeweledSignet,
  //   1,
  //   jewelcrafting,
  //   [
  //     [rousingIre, 2],
  //     [shimmeringClasp, 1],
  //     [mysticSapphire, 2],
  //   ],
  //   null,
  //   "Jewelry",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Jeweler's Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { Jewelry: 15 }],
  //     ["Lesser Illustrious Insight", { Rings: 30 }],
  //     ["Polishing Cloth", { Jewelry: 30 }],
  //   ]
  // );
  // const bandOfNewBeginningsRecipe = await createRecipe(
  //   null,
  //   bandOfNewBeginnings,
  //   1,
  //   jewelcrafting,
  //   [
  //     [rousingFire, 5],
  //     [shimmeringClasp, 1],
  //     [eternityAmber, 2],
  //   ],
  //   15,
  //   "Jewelry",
  //   2,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Missive", { Jewelry: 15 }],
  //     ["Training Matrix", {}],
  //     ["Lesser Illustrious Insight", { Rings: 30 }],
  //     ["Polishing Cloth", { Jewelry: 30 }],
  //   ]
  // );
  // const pendantOfImpendingPerilsRecipe = await createRecipe(
  //   null,
  //   pendantOfImpendingPerils,
  //   1,
  //   jewelcrafting,
  //   [
  //     [shimmeringClasp, 1],
  //     [sunderedOnyx, 1],
  //   ],
  //   15,
  //   "Jewelry",
  //   2,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Missive", { Jewelry: 15 }],
  //     ["Training Matrix", {}],
  //     ["Lesser Illustrious Insight", { Necklaces: 30 }],
  //     ["Polishing Cloth", { Jewelry: 30 }],
  //   ]
  // );
  // const djaradinsPinataRecipe = await createRecipe(
  //   null,
  //   djaradinsPinata,
  //   3,
  //   jewelcrafting,
  //   [
  //     [awakenedIre, 1],
  //     [markOfHonor, 2],
  //     [glossyStone, 9],
  //     [sunderedOnyx, 6],
  //     [silkenGemdust, 2],
  //     [shimmeringClasp, 3],
  //   ],
  //   null,
  //   "Statues & Carvings",
  //   1,
  //   375,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Jeweler's Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Lesser Illustrious Insight", { Stone: 30 }],
  //     ["Polishing Cloth", { Carving: 30 }],
  //   ]
  // );
  // const narcissistsSculptureRecipe = await createRecipe(
  //   null,
  //   narcissistsSculpture,
  //   1,
  //   jewelcrafting,
  //   [
  //     [awakenedFire, 1],
  //     [glossyStone, 2],
  //     [vibrantEmerald, 1],
  //     [silkenGemdust, 1],
  //     [shimmeringClasp, 1],
  //   ],
  //   null,
  //   "Statues & Carvings",
  //   1,
  //   300,
  //   null,
  //   { Setting: 0 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Stone: 30 }],
  //     ["Polishing Cloth", { Carving: 30 }],
  //   ]
  // );
  // const kaluakFigurineRecipe = await createRecipe(
  //   null,
  //   kaluakFigurine,
  //   1,
  //   jewelcrafting,
  //   [
  //     [scalebellyMackerel, 1],
  //     [glossyStone, 1],
  //     [silkenGemdust, 1],
  //   ],
  //   null,
  //   "Statues & Carvings",
  //   1,
  //   250,
  //   { IskaaraTuskarr: 10 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Stone: 30 }],
  //     ["Polishing Cloth", { Carving: 30 }],
  //   ]
  // );
  // const statueOfTyrsHeraldRecipe = await createRecipe(
  //   null,
  //   statueOfTyrsHerald,
  //   1,
  //   jewelcrafting,
  //   [
  //     [glowingTitanOrb, 1],
  //     [glossyStone, 2],
  //     [mysticSapphire, 1],
  //     [silkenGemdust, 1],
  //     [shimmeringClasp, 1],
  //   ],
  //   null,
  //   "Statues & Carvings",
  //   1,
  //   300,
  //   null,
  //   { Setting: 15 },
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Stone: 30 }],
  //     ["Polishing Cloth", { Carving: 30 }],
  //   ]
  // );
  // const revitalizingRedCarvingRecipe = await createRecipe(
  //   null,
  //   revitalizingRedCarving,
  //   1,
  //   jewelcrafting,
  //   [
  //     [glossyStone, 2],
  //     [queensRuby, 1],
  //     [silkenGemdust, 1],
  //     [shimmeringClasp, 1],
  //   ],
  //   25,
  //   "Statues & Carvings",
  //   1,
  //   250,
  //   null,
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Stone: 30 }],
  //     ["Polishing Cloth", { Carving: 30 }],
  //   ]
  // );
  // const jeweledAmberWhelplingRecipe = await createRecipe(
  //   null,
  //   jeweledAmberWhelpling,
  //   1,
  //   jewelcrafting,
  //   [
  //     [jeweledDragonsHeart, 1],
  //     [glimmeringNozdoriteCluster, 1],
  //     [glossyStone, 1],
  //     [nozdorite, 1],
  //     [elementalHarmony, 2],
  //     [illimitedDiamond, 1],
  //   ],
  //   null,
  //   "Battle Pets",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Jeweler's Bench",
  //   "Drops from 'Treasures of the Dragon Isles.'"
  // );
  // const jeweledEmeraldWhelplingRecipe = await createRecipe(
  //   null,
  //   jeweledEmeraldWhelpling,
  //   1,
  //   jewelcrafting,
  //   [
  //     [jeweledDragonsHeart, 1],
  //     [glimmeringYsemeraldCluster, 1],
  //     [glossyStone, 1],
  //     [ysemerald, 1],
  //     [elementalHarmony, 2],
  //     [illimitedDiamond, 1],
  //   ],
  //   null,
  //   "Battle Pets",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Jeweler's Bench",
  //   "Drops from 'Treasures of the Dragon Isles.'"
  // );
  // const jeweledOnyxWhelplingRecipe = await createRecipe(
  //   null,
  //   jeweledOnyxWhelpling,
  //   1,
  //   jewelcrafting,
  //   [
  //     [jeweledDragonsHeart, 1],
  //     [glimmeringNelthariteCluster, 1],
  //     [glossyStone, 1],
  //     [neltharite, 1],
  //     [elementalHarmony, 2],
  //     [illimitedDiamond, 1],
  //   ],
  //   null,
  //   "Battle Pets",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Jeweler's Bench",
  //   "Drops from 'Treasures of the Dragon Isles.'"
  // );
  // const jeweledRubyWhelplingRecipe = await createRecipe(
  //   null,
  //   jeweledRubyWhelpling,
  //   1,
  //   jewelcrafting,
  //   [
  //     [jeweledDragonsHeart, 1],
  //     [glimmeringAlexstrasziteCluster, 1],
  //     [glossyStone, 1],
  //     [alexstraszite, 1],
  //     [elementalHarmony, 2],
  //     [illimitedDiamond, 1],
  //   ],
  //   null,
  //   "Battle Pets",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Jeweler's Bench",
  //   "Drops from 'Treasures of the Dragon Isles.'"
  // );
  // const jeweledSapphireWhelplingRecipe = await createRecipe(
  //   null,
  //   jeweledSapphireWhelpling,
  //   1,
  //   jewelcrafting,
  //   [
  //     [jeweledDragonsHeart, 1],
  //     [glimmeringMalygiteCluster, 1],
  //     [glossyStone, 1],
  //     [malygite, 1],
  //     [elementalHarmony, 2],
  //     [illimitedDiamond, 1],
  //   ],
  //   null,
  //   "Battle Pets",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Jeweler's Bench",
  //   "Drops from 'Treasures of the Dragon Isles.'"
  // );
  // const convergentPrismRecipe = await createRecipe(
  //   null,
  //   convergentPrism,
  //   1,
  //   jewelcrafting,
  //   [
  //     [glowingTitanOrb, 1],
  //     [illimitedDiamond, 1],
  //     [projectionPrism, 1],
  //     [elementalHarmony, 1],
  //   ],
  //   null,
  //   "Novelties",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Jeweler's Bench",
  //   "Drops from 'Inconspicuous Bookmark' in Thaldraszus."
  // );
  // const jeweledOfferingRecipe = await createRecipe(
  //   null,
  //   convergentPrism,
  //   1,
  //   jewelcrafting,
  //   [
  //     [contouredFowlfeather, 75],
  //     [tuftOfPrimalWool, 2],
  //     [alexstraszite, 1],
  //     [silkenGemdust, 15],
  //     [vibrantWilderclothBolt, 10],
  //   ],
  //   null,
  //   "Novelties",
  //   1,
  //   null,
  //   { Enterprising: 30 },
  //   null,
  //   null,
  //   "Jeweler's Bench"
  // );
  // const projectionPrismRecipe = await createRecipe(
  //   null,
  //   projectionPrism,
  //   "1-2",
  //   jewelcrafting,
  //   [
  //     [fracturedGlass, 7],
  //     [framelessLens, 1],
  //     [silkenGemdust, 1],
  //   ],
  //   null,
  //   "Novelties",
  //   1,
  //   225,
  //   { Glassware: 0 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20, Glassware: 10 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const rhinestoneSunglassesRecipe = await createRecipe(
  //   null,
  //   rhinestoneSunglasses,
  //   1,
  //   jewelcrafting,
  //   [
  //     [ysemerald, 2],
  //     [framelessLens, 2],
  //     [illimitedDiamond, 1],
  //     [elementalHarmony, 1],
  //   ],
  //   null,
  //   "Novelties",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Jeweler's Bench",
  //   "Drops from Draconic Recipe in a Bottle."
  // );
  // const splitLensSpecsRecipe = await createRecipe(
  //   null,
  //   splitLensSpecs,
  //   1,
  //   jewelcrafting,
  //   [
  //     [neltharite, 1],
  //     [framelessLens, 1],
  //     [elementalHarmony, 1],
  //   ],
  //   null,
  //   "Novelties",
  //   1,
  //   null,
  //   { Glassware: 25 },
  //   null,
  //   null,
  //   "Jeweler's Bench"
  // );
  // const alexstrasziteLoupesRecipe = await createRecipe(
  //   null,
  //   alexstrasziteLoupes,
  //   1,
  //   jewelcrafting,
  //   [
  //     [artisansMettle, 225],
  //     [vibrantShard, 2],
  //     [framelessLens, 2],
  //     [shimmeringClasp, 5],
  //     [alexstraszite, 2],
  //   ],
  //   1,
  //   "Profession Equipment",
  //   null,
  //   325,
  //   { ArtisansConsortium: "Valued" },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const finePrintTrifocalsRecipe = await createRecipe(
  //   null,
  //   finePrintTrifocals,
  //   1,
  //   jewelcrafting,
  //   [
  //     [artisansMettle, 225],
  //     [vibrantShard, 2],
  //     [framelessLens, 2],
  //     [shimmeringClasp, 5],
  //     [nozdorite, 2],
  //   ],
  //   1,
  //   "Profession Equipment",
  //   null,
  //   325,
  //   { IskaaraTuskarr: 18 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const magnificentMarginMagnifierRecipe = await createRecipe(
  //   null,
  //   magnificentMarginMagnifier,
  //   1,
  //   jewelcrafting,
  //   [
  //     [artisansMettle, 225],
  //     [framelessLens, 2],
  //     [shimmeringClasp, 2],
  //     [nozdorite, 4],
  //   ],
  //   1,
  //   "Profession Equipment",
  //   null,
  //   325,
  //   { DragonscaleExpedition: 15 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const resonantFocusRecipe = await createRecipe(
  //   null,
  //   resonantFocus,
  //   1,
  //   jewelcrafting,
  //   [
  //     [artisansMettle, 225],
  //     [resonantCrystal, 2],
  //     [vibrantShard, 2],
  //     [shimmeringClasp, 2],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   325,
  //   { IskaaraTuskarr: 18 },
  //   null,
  //   null,
  //   "Jeweler's Bench",
  //   null,
  //   [
  //     ["Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const boldPrintBifocalsRecipe = await createRecipe(
  //   null,
  //   boldPrintBifocals,
  //   1,
  //   jewelcrafting,
  //   [
  //     [framelessLens, 2],
  //     [sereviteOre, 2],
  //   ],
  //   20,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const chromaticFocusRecipe = await createRecipe(
  //   null,
  //   chromaticFocus,
  //   1,
  //   jewelcrafting,
  //   [
  //     [chromaticDust, 4],
  //     [shimmeringClasp, 1],
  //   ],
  //   20,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const leftHandedMagnifyingGlassRecipe = await createRecipe(
  //   null,
  //   leftHandedMagnifyingGlass,
  //   1,
  //   jewelcrafting,
  //   [
  //     [framelessLens, 1],
  //     [draconiumOre, 3],
  //   ],
  //   20,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const sunderedOnyxLoupesRecipe = await createRecipe(
  //   null,
  //   sunderedOnyxLoupes,
  //   1,
  //   jewelcrafting,
  //   [
  //     [framelessLens, 2],
  //     [sereviteOre, 2],
  //     [sunderedOnyx, 1],
  //   ],
  //   20,
  //   "Profession Equipment",
  //   3,
  //   275,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Lesser Illustrious Insight", { Enterprising: 20 }],
  //     ["Polishing Cloth", { Enterprising: 10 }],
  //   ]
  // );
  // const jeweledDragonsHeartRecipe = await createRecipe(
  //   null,
  //   jeweledDragonsHeart,
  //   1,
  //   jewelcrafting,
  //   [
  //     [queensRuby, 1],
  //     [mysticSapphire, 1],
  //     [vibrantEmerald, 1],
  //     [sunderedOnyx, 1],
  //     [eternityAmber, 2],
  //     [silkenGemdust, 3],
  //   ],
  //   null,
  //   "Extravagent Glasswares",
  //   1,
  //   null,
  //   null,
  //   { Glassware: 35 },
  //   null,
  //   "Jeweler's Bench"
  // );
  // const dreamersVisionRecipe = await createRecipe(
  //   null,
  //   dreamersVision,
  //   1,
  //   jewelcrafting,
  //   [
  //     [fracturedGlass, 3],
  //     [vibrantEmerald, 2],
  //     [silkenGemdust, 1],
  //   ],
  //   null,
  //   "Extravagent Glassware",
  //   1,
  //   250,
  //   null,
  //   { Air: 0 },
  //   null,
  //   "Jeweler's Bench"
  // );
  // const earthwardensPrizeRecipe = await createRecipe(
  //   null,
  //   earthwardensPrize,
  //   1,
  //   jewelcrafting,
  //   [
  //     [fracturedGlass, 3],
  //     [sunderedOnyx, 2],
  //     [silkenGemdust, 1],
  //   ],
  //   null,
  //   "Extravagent Glassware",
  //   1,
  //   250,
  //   null,
  //   { Earth: 0 },
  //   null,
  //   "Jeweler's Bench"
  // );
  // const keepersGloryRecipe = await createRecipe(
  //   null,
  //   keepersGlory,
  //   1,
  //   jewelcrafting,
  //   [
  //     [fracturedGlass, 3],
  //     [mysticSapphire, 2],
  //     [silkenGemdust, 1],
  //   ],
  //   null,
  //   "Extravagent Glassware",
  //   1,
  //   250,
  //   null,
  //   { Frost: 0 },
  //   null,
  //   "Jeweler's Bench"
  // );
  // const queensGiftRecipe = await createRecipe(
  //   null,
  //   queensGift,
  //   1,
  //   jewelcrafting,
  //   [
  //     [fracturedGlass, 3],
  //     [queensGift, 2],
  //     [silkenGemdust, 1],
  //   ],
  //   null,
  //   "Extravagent Glassware",
  //   1,
  //   250,
  //   null,
  //   { Fire: 0 },
  //   null,
  //   "Jeweler's Bench"
  // );
  // const timewatchersPatienceRecipe = await createRecipe(
  //   null,
  //   timewatchersPatience,
  //   1,
  //   jewelcrafting,
  //   [
  //     [fracturedGlass, 3],
  //     [eternityAmber, 4],
  //     [silkenGemdust, 1],
  //   ],
  //   25,
  //   "Extravagent Glassware",
  //   1,
  //   250,
  //   null,
  //   null,
  //   null,
  //   "Jeweler's Bench"
  // );

  // //leatherworking recipes - 101 total
  // const lifeBoundBeltRecipe = await createRecipe(
  //   null,
  //   lifeBoundBelt,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [pristineVorquinHorn, 4],
  //     [earthshineScales, 13],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Leather Armor",
  //   1,
  //   280,
  //   null,
  //   { BeltsLeather: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Illustrious Insight", { BeltsLeather: 20 }],
  //     ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
  //   ]
  // );
  // const lifeBoundBindingsRecipe = await createRecipe(
  //   null,
  //   lifeBoundBindings,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 30],
  //     [windsongPlumage, 3],
  //     [earthshineScales, 10],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Leather Armor",
  //   1,
  //   280,
  //   null,
  //   { Wristwraps: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Illustrious Insight", { Wristwraps: 20 }],
  //     ["Curing Agent", { ShapedLeatherArmor: 30 }],
  //   ]
  // );
  // const lifeBoundBootsRecipe = await createRecipe(
  //   null,
  //   lifeBoundBoots,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [crystalspineFur, 4],
  //     [frostbiteScales, 13],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Leather Armor",
  //   1,
  //   280,
  //   null,
  //   { BootsLeather: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Illustrious Insight", { BootsLeather: 20 }],
  //     ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
  //   ]
  // );
  // const lifeBoundCapRecipe = await createRecipe(
  //   null,
  //   lifeBoundCap,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [windsongPlumage, 4],
  //     [mireslushHide, 15],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Leather Armor",
  //   1,
  //   280,
  //   null,
  //   { Helms: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Illustrious Insight", { Helms: 20 }],
  //     ["Curing Agent", { ShapedLeatherArmor: 30 }],
  //   ]
  // );
  // const lifeBoundChestpieceRecipe = await createRecipe(
  //   null,
  //   lifeBoundChestpiece,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [flawlessProtoDragonScale, 4],
  //     [mireslushHide, 15],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Leather Armor",
  //   1,
  //   280,
  //   null,
  //   { Chestpieces: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Illustrious Insight", { Chestpieces: 20 }],
  //     ["Curing Agent", { ShapedLeatherArmor: 30 }],
  //   ]
  // );
  // const lifeBoundGlovesRecipe = await createRecipe(
  //   null,
  //   lifeBoundGloves,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [salamantherScales, 4],
  //     [frostbiteScales, 13],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Leather Armor",
  //   1,
  //   280,
  //   null,
  //   { Gloves: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Illustrious Insight", { Gloves: 20 }],
  //     ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
  //   ]
  // );
  // const lifeBoundShoulderpadsRecipe = await createRecipe(
  //   null,
  //   lifeBoundShoulderpads,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [fireInfusedHide, 4],
  //     [stonecrustHide, 13],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Leather Armor",
  //   1,
  //   280,
  //   null,
  //   { Shoulderpads: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Illustrious Insight", { Shoulderpads: 20 }],
  //     ["Curing Agent", { ShapedLeatherArmor: 30 }],
  //   ]
  // );
  // const lifeBoundTrousersRecipe = await createRecipe(
  //   null,
  //   lifeBoundTrousers,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [cacophonousThunderscale, 4],
  //     [stonecrustHide, 15],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Leather Armor",
  //   1,
  //   280,
  //   null,
  //   { Legguards: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Illustrious Insight", { Legguards: 20 }],
  //     ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
  //   ]
  // );
  // const pioneersPracticedCowlRecipe = await createRecipe(
  //   null,
  //   pioneersPracticedCowl,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 10],
  //     [denseHide, 3],
  //   ],
  //   50,
  //   "Leather Armor",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Helms: 20 }],
  //     ["Curing Agent", { ShapedLeatherArmor: 30 }],
  //   ]
  // );
  // const pioneersPracticedLeggingsRecipe = await createRecipe(
  //   null,
  //   pioneersPracticedLeggings,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 10],
  //     [denseHide, 3],
  //   ],
  //   45,
  //   "Leather Armor",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Legguards: 20 }],
  //     ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
  //   ]
  // );
  // const pioneersPracticedShouldersRecipe = await createRecipe(
  //   null,
  //   pioneersPracticedShoulders,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 16],
  //     [denseHide, 2],
  //   ],
  //   40,
  //   "Leather Armor",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Shoulderpads: 20 }],
  //     ["Curing Agent", { ShapedLeatherArmor: 30 }],
  //   ]
  // );
  // const pioneersPracticedGlovesRecipe = await createRecipe(
  //   null,
  //   pioneersPracticedGloves,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 16],
  //     [denseHide, 2],
  //   ],
  //   25,
  //   "Leather Armor",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Gloves: 20 }],
  //     ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
  //   ]
  // );
  // const pioneersPracticedBeltRecipe = await createRecipe(
  //   null,
  //   pioneersPracticedBelt,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 16],
  //     [denseHide, 2],
  //   ],
  //   20,
  //   "Leather Armor",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { BeltsLeather: 20 }],
  //     ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
  //   ]
  // );
  // const pioneersLeatherTunicRecipe = await createRecipe(
  //   null,
  //   pioneersLeatherTunic,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 25],
  //     [adamantScales, 15],
  //   ],
  //   10,
  //   "Leather Armor",
  //   3,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Chestpieces: 20 }],
  //     ["Curing Agent", { ShapedLeatherArmor: 30 }],
  //   ]
  // );
  // const pioneersLeatherBootsRecipe = await createRecipe(
  //   null,
  //   pioneersLeatherBoots,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 20],
  //     [adamantScales, 10],
  //   ],
  //   5,
  //   "Leather Armor",
  //   3,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { BootsLeather: 20 }],
  //     ["Curing Agent", { EmbroideredLeatherArmor: 30 }],
  //   ]
  // );
  // const pioneersLeatherWristguardsRecipe = await createRecipe(
  //   null,
  //   pioneersLeatherWristguards,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 15],
  //     [adamantScales, 5],
  //   ],
  //   1,
  //   "Leather Armor",
  //   3,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Learned by default.",
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Wristwraps: 20 }],
  //     ["Curing Agent", { ShapedLeatherArmor: 30 }],
  //   ]
  // );
  // const flameTouchedChainRecipe = await createRecipe(
  //   null,
  //   flameTouchedChain,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [crystalspineFur, 4],
  //     [earthshineScales, 14],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Mail Armor",
  //   1,
  //   280,
  //   null,
  //   { BeltsMail: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Illustrious Insight", { BeltsMail: 20 }],
  //     ["Chain Oil", { IntricateMail: 30 }],
  //   ]
  // );
  // const flameTouchedChainmailRecipe = await createRecipe(
  //   null,
  //   flameTouchedChainmail,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [flawlessProtoDragonScale, 4],
  //     [stonecrustHide, 15],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Mail Armor",
  //   1,
  //   280,
  //   null,
  //   { MailShirts: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { LargeMail: 0 }],
  //     ["Illustrious Insight", { MailShirts: 20 }],
  //     ["Chain Oil", { LargeMail: 30 }],
  //   ]
  // );
  // const flameTouchedCuffsRecipe = await createRecipe(
  //   null,
  //   flameTouchedCuffs,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 30],
  //     [windsongPlumage, 4],
  //     [earthshineScales, 10],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Mail Armor",
  //   1,
  //   280,
  //   null,
  //   { Bracers: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { LargeMail: 0 }],
  //     ["Illustrious Insight", { Bracers: 20 }],
  //     ["Chain Oil", { LargeMail: 30 }],
  //   ]
  // );
  // const flameTouchedHandguardsRecipe = await createRecipe(
  //   null,
  //   flameTouchedHandguards,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [rockfangLeather, 4],
  //     [earthshineScales, 13],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Mail Armor",
  //   1,
  //   280,
  //   null,
  //   { Gauntlets: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Illustrious Insight", { Gauntlets: 20 }],
  //     ["Chain Oil", { IntricateMail: 30 }],
  //   ]
  // );
  // const flameTouchedHelmetRecipe = await createRecipe(
  //   null,
  //   flameTouchedHelmet,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [cacophonousThunderscale, 4],
  //     [stonecrustHide, 15],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Mail Armor",
  //   1,
  //   280,
  //   null,
  //   { MailHelms: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { LargeMail: 0 }],
  //     ["Illustrious Insight", { MailHelms: 20 }],
  //     ["Chain Oil", { LargeMail: 30 }],
  //   ]
  // );
  // const flameTouchedLegguardsRecipe = await createRecipe(
  //   null,
  //   flameTouchedLegguards,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [cacophonousThunderscale, 4],
  //     [stonecrustHide, 15],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Mail Armor",
  //   1,
  //   280,
  //   null,
  //   { Greaves: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Illustrious Insight", { Greaves: 20 }],
  //     ["Chain Oil", { IntricateMail: 30 }],
  //   ]
  // );
  // const flameTouchedSpauldersRecipe = await createRecipe(
  //   null,
  //   flameTouchedSpaulders,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [windsongPlumage, 4],
  //     [earthshineScales, 13],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Mail Armor",
  //   1,
  //   280,
  //   null,
  //   { Shoulderguards: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { LargeMail: 0 }],
  //     ["Illustrious Insight", { Shoulderguards: 20 }],
  //     ["Chain Oil", { LargeMail: 30 }],
  //   ]
  // );
  // const flameTouchedTreadsRecipe = await createRecipe(
  //   null,
  //   flameTouchedTreads,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [crystalspineFur, 4],
  //     [earthshineScales, 13],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Mail Armor",
  //   1,
  //   280,
  //   null,
  //   { BootsMail: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Embellishment", {}],
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Illustrious Insight", { BootsMail: 20 }],
  //     ["Chain Oil", { IntricateMail: 30 }],
  //   ]
  // );
  // const trailblazersToughenedCoifRecipe = await createRecipe(
  //   null,
  //   trailblazersToughenedCoif,
  //   1,
  //   leatherworking,
  //   [
  //     [adamantScales, 10],
  //     [lustrousScaledHide, 2],
  //   ],
  //   50,
  //   "Mail Armor",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { LargeMail: 0 }],
  //     ["Lesser Illustrious Insight", { MailHelms: 20 }],
  //     ["Chain Oil", { LargeMail: 30 }],
  //   ]
  // );
  // const trailblazersToughenedLegguardsRecipe = await createRecipe(
  //   null,
  //   trailblazersToughenedLegguards,
  //   1,
  //   leatherworking,
  //   [
  //     [adamantScales, 6],
  //     [lustrousScaledHide, 3],
  //   ],
  //   45,
  //   "Mail Armor",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Lesser Illustrious Insight", { Greaves: 20 }],
  //     ["Chain Oil", { IntricateMail: 30 }],
  //   ]
  // );
  // const trailblazersToughenedSpikesRecipe = await createRecipe(
  //   null,
  //   trailblazersToughenedSpikes,
  //   1,
  //   leatherworking,
  //   [
  //     [adamantScales, 16],
  //     [lustrousScaledHide, 2],
  //   ],
  //   40,
  //   "Mail Armor",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { LargeMail: 0 }],
  //     ["Lesser Illustrious Insight", { Shoulderguards: 20 }],
  //     ["Chain Oil", { LargeMail: 30 }],
  //   ]
  // );
  // const trailblazersToughenedGripsRecipe = await createRecipe(
  //   null,
  //   trailblazersToughenedGrips,
  //   1,
  //   leatherworking,
  //   [
  //     [adamantScales, 16],
  //     [lustrousScaledHide, 2],
  //   ],
  //   25,
  //   "Mail Armor",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Lesser Illustrious Insight", { Gauntlets: 20 }],
  //     ["Chain Oil", { IntricateMail: 30 }],
  //   ]
  // );
  // const trailblazersToughenedChainbeltRecipe = await createRecipe(
  //   null,
  //   trailblazersToughenedChainbelt,
  //   1,
  //   leatherworking,
  //   [
  //     [adamantScales, 16],
  //     [lustrousScaledHide, 2],
  //   ],
  //   20,
  //   "Mail Armor",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Lesser Illustrious Insight", { BeltsMail: 20 }],
  //     ["Chain Oil", { IntricateMail: 30 }],
  //   ]
  // );
  // const trailblazersScaleVestRecipe = await createRecipe(
  //   null,
  //   trailblazersScaleVest,
  //   1,
  //   leatherworking,
  //   [
  //     [adamantScales, 25],
  //     [resilientLeather, 15],
  //   ],
  //   10,
  //   "Mail Armor",
  //   3,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { LargeMail: 0 }],
  //     ["Lesser Illustrious Insight", { MailShirts: 20 }],
  //     ["Chain Oil", { LargeMail: 30 }],
  //   ]
  // );
  // const trailblazersScaleBootsRecipe = await createRecipe(
  //   null,
  //   trailblazersScaleVest,
  //   1,
  //   leatherworking,
  //   [
  //     [adamantScales, 20],
  //     [resilientLeather, 10],
  //   ],
  //   5,
  //   "Mail Armor",
  //   3,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Lesser Illustrious Insight", { BootsMail: 20 }],
  //     ["Chain Oil", { IntricateMail: 30 }],
  //   ]
  // );
  // const trailblazersScaleBracersRecipe = await createRecipe(
  //   null,
  //   trailblazersScaleBracers,
  //   1,
  //   leatherworking,
  //   [
  //     [adamantScales, 15],
  //     [resilientLeather, 5],
  //   ],
  //   1,
  //   "Mail Armor",
  //   3,
  //   40,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Learned by default.",
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", { LargeMail: 0 }],
  //     ["Lesser Illustrious Insight", { Bracers: 20 }],
  //     ["Chain Oil", { LargeMail: 30 }],
  //   ]
  // );
  // const expertAlchemistsHatRecipe = await createRecipe(
  //   null,
  //   expertAlchemistsHat,
  //   1,
  //   leatherworking,
  //   [
  //     [artisansMettle, 225],
  //     [awakenedAir, 12],
  //     [frostbiteScales, 8],
  //     [resilientLeather, 80],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   275,
  //   { MaruukCentaur: 18 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [["Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const expertSkinnersCapRecipe = await createRecipe(
  //   null,
  //   expertSkinnersCap,
  //   1,
  //   leatherworking,
  //   [
  //     [artisansMettle, 225],
  //     [windsongPlumage, 4],
  //     [tuftOfPrimalWool, 2],
  //     [earthshineScales, 10],
  //     [resilientLeather, 80],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   275,
  //   { IskaaraTuskarr: 18 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [["Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const flameproofApronRecipe = await createRecipe(
  //   null,
  //   flameproofApron,
  //   1,
  //   leatherworking,
  //   [
  //     [artisansMettle, 225],
  //     [flawlessProtoDragonScale, 10],
  //     [stonecrustHide, 8],
  //     [adamantScales, 80],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   275,
  //   { MaruukCentaur: 18 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [["Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const lavishFloralPackRecipe = await createRecipe(
  //   null,
  //   lavishFloralPack,
  //   1,
  //   leatherworking,
  //   [
  //     [artisansMettle, 225],
  //     [crystalspineFur, 15],
  //     [mireslushHide, 10],
  //     [resilientLeather, 60],
  //     [omniumDraconis, 5],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   275,
  //   { IskaaraTuskarr: 18 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [["Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const masterworkSmockRecipe = await createRecipe(
  //   null,
  //   masterworkSmock,
  //   1,
  //   leatherworking,
  //   [
  //     [artisansMettle, 225],
  //     [crystalspineFur, 15],
  //     [mireslushHide, 10],
  //     [resilientLeather, 80],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   275,
  //   { MaruukCentaur: 18 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [["Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const reinforcedPackRecipe = await createRecipe(
  //   null,
  //   reinforcedPack,
  //   1,
  //   leatherworking,
  //   [
  //     [artisansMettle, 225],
  //     [pristineVorquinHorn, 15],
  //     [earthshineScales, 10],
  //     [resilientLeather, 80],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   275,
  //   { MaruukCentaur: 18 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [["Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const resplendentCoverRecipe = await createRecipe(
  //   null,
  //   resplendentCover,
  //   1,
  //   leatherworking,
  //   [
  //     [artisansMettle, 225],
  //     [salamantherScales, 20],
  //     [stonecrustHide, 10],
  //     [resilientLeather, 80],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   275,
  //   { IskaaraTuskarr: 18 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [["Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const shockproofGlovesRecipe = await createRecipe(
  //   null,
  //   shockproofGloves,
  //   1,
  //   leatherworking,
  //   [
  //     [artisansMettle, 225],
  //     [rockfangLeather, 15],
  //     [earthshineScales, 10],
  //     [adamantScales, 80],
  //   ],
  //   null,
  //   "Profession Equipment",
  //   1,
  //   275,
  //   { IskaaraTuskarr: 18 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [["Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const alchemistsHatRecipe = await createRecipe(
  //   null,
  //   alchemistsHat,
  //   1,
  //   leatherworking,
  //   [
  //     [lustrousScaledHide, 2],
  //     [resilientLeather, 10],
  //   ],
  //   35,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const smithingApronRecipe = await createRecipe(
  //   null,
  //   smithingApron,
  //   1,
  //   leatherworking,
  //   [
  //     [denseHide, 2],
  //     [adamantScales, 10],
  //   ],
  //   35,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const jewelersCoverRecipe = await createRecipe(
  //   null,
  //   jewelersCover,
  //   1,
  //   leatherworking,
  //   [
  //     [denseHide, 2],
  //     [resilientLeather, 10],
  //   ],
  //   30,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const protectiveGlovesRecipe = await createRecipe(
  //   null,
  //   protectiveGloves,
  //   1,
  //   leatherworking,
  //   [
  //     [lustrousScaledHide, 2],
  //     [adamantScales, 10],
  //   ],
  //   30,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const durablePackRecipe = await createRecipe(
  //   null,
  //   durablePack,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 20],
  //     [denseHide, 1],
  //   ],
  //   15,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const floralBasketRecipe = await createRecipe(
  //   null,
  //   floralBasket,
  //   1,
  //   leatherworking,
  //   [
  //     [denseHide, 2],
  //     [resilientLeather, 5],
  //     [hochenblume, 5],
  //   ],
  //   10,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const skinnersCapRecipe = await createRecipe(
  //   null,
  //   skinnersCap,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 30],
  //     [lustrousScaledHide, 1],
  //   ],
  //   5,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const resilientSmockRecipe = await createRecipe(
  //   null,
  //   resilientSmock,
  //   1,
  //   leatherworking,
  //   [
  //     [resilientLeather, 20],
  //     [adamantScales, 10],
  //   ],
  //   1,
  //   "Profession Equipment",
  //   3,
  //   80,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Learned by default.",
  //   [["Lesser Illustrious Insight", { BondingAndStitching: 25 }]]
  // );
  // const bonewroughtCrossbowRecipe = await createRecipe(
  //   null,
  //   bonewroughtCrossbow,
  //   1,
  //   leatherworking,
  //   [
  //     [pristineVorquinHorn, 2],
  //     [runedWrithebark, 1],
  //     [resilientLeather, 20],
  //   ],
  //   35,
  //   "Weapons",
  //   3,
  //   60,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Training Matrix", {}],
  //     ["Missive", {}],
  //     ["Lesser Illustrious Insight", { BondingAndStitching: 25 }],
  //   ]
  // );
  // const ancestorsDewDrippersRecipe = await createRecipe(
  //   null,
  //   ancestorsDewDrippers,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [crystalspineFur, 10],
  //     [mireslushHide, 18],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Elemental Patterns",
  //   1,
  //   415,
  //   { MaruukCentaur: 13 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Illustrious Insight", { Shoulderguards: 20, ElementalMastery: 25 }],
  //     ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const flaringCowlRecipe = await createRecipe(
  //   null,
  //   flaringCowl,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [fierySoul, 1],
  //     [awakenedFire, 10],
  //     [earthshineScales, 16],
  //     [resilientLeather, 100],
  //   ],
  //   null,
  //   "Elemental Patterns",
  //   1,
  //   415,
  //   null,
  //   { ElementalMastery: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Illustrious Insight", { Helms: 20, ElementalMastery: 25 }],
  //     [
  //       "Curing Agent",
  //       { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const oldSpiritsWristwrapsRecipe = await createRecipe(
  //   null,
  //   oldSpiritsWristwraps,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 30],
  //     [rockfangLeather, 10],
  //     [mireslushHide, 16],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Elemental Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Leatherworker's Tool Bench",
  //   "Drops from bosses in Vault of the Incarnates.",
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Illustrious Insight", { Wristwraps: 20, ElementalMastery: 25 }],
  //     [
  //       "Curing Agent",
  //       { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const scaleReinGripsRecipe = await createRecipe(
  //   null,
  //   scaleReinGrips,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [salamantherScales, 12],
  //     [earthshineScales, 18],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Elemental Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Leatherworker's Tool Bench",
  //   "Drops from bosses in Vault of the Incarnates.",
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Illustrious Insight", { Gauntlets: 20, ElementalMastery: 25 }],
  //     ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const snowballMakersRecipe = await createRecipe(
  //   null,
  //   snowballMakers,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [crystalspineFur, 10],
  //     [frostbiteScales, 20],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Elemental Patterns",
  //   1,
  //   415,
  //   { IskaaraTuskarr: 15 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Illustrious Insight", { Gloves: 20, ElementalMastery: 25 }],
  //     [
  //       "Curing Agent",
  //       { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const stringOfSpiritualKnickKnacksRecipe = await createRecipe(
  //   null,
  //   stringOfSpiritualKnickKnacks,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [salamantherScales, 10],
  //     [mireslushHide, 20],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Elemental Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Leatherworker's Tool Bench",
  //   "Drops from bosses in Vault of the Incarnates.",
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Illustrious Insight", { BeltsLeather: 20, ElementalMastery: 25 }],
  //     [
  //       "Curing Agent",
  //       { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const windSpiritsLassoRecipe = await createRecipe(
  //   null,
  //   windSpiritsLasso,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [awakenedAir, 10],
  //     [mireslushHide, 16],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Elemental Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "Raid Drop",
  //   "Leatherworker's Tool Bench",
  //   "Drops from bosses in Vault of the Incarnates.",
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Illustrious Insight", { BeltsMail: 20, ElementalMastery: 25 }],
  //     ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const alliedHeartwarmingFurCoatRecipe = await createRecipe(
  //   null,
  //   alliedHeartwarmingFurCoat,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [fireInfusedHide, 10],
  //     [tuftOfPrimalWool, 3],
  //     [frostbiteScales, 20],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   415,
  //   { IskaaraTuskarr: 15 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Illustrious Insight", { Chestpieces: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const alliedLegguardsOfSansokKhanRecipe = await createRecipe(
  //   null,
  //   alliedLegguardsOfSansokKhan,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [centaursTrophyNecklace, 1],
  //     [earthshineScales, 20],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   450,
  //   { MaruukCentaur: 13 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Illustrious Insight", { Greaves: 20, BestialPrimacy: 25 }],
  //     ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const bowOfTheDragonHuntersRecipe = await createRecipe(
  //   null,
  //   bowOfTheDragonHunters,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 2],
  //     [primalChaos, 160],
  //     [awakenedAir, 6],
  //     [tallstriderSinew, 2],
  //     [mireslushHide, 10],
  //     [runedWrithebark, 2],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   280,
  //   null,
  //   { BestialPrimacy: 0 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     ["Primal Infusion", {}],
  //     ["Missive", {}],
  //     ["Embellishment", {}],
  //     ["Illustrious Insight", { BondingAndStitching: 25, BestialPrimacy: 25 }],
  //   ]
  // );
  // const infuriousBootsOfReprieveRecipe = await createRecipe(
  //   null,
  //   infuriousBootsOfReprieve,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [centaursTrophyNecklace, 1],
  //     [infuriousHide, 16],
  //     [adamantScales, 100],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Illustrious Insight", { BootsMail: 20, BestialPrimacy: 25 }],
  //     ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const infuriousChainhelmProtectorRecipe = await createRecipe(
  //   null,
  //   infuriousChainhelmProtector,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [centaursTrophyNecklace, 1],
  //     [infuriousScales, 20],
  //     [adamantScales, 100],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Illustrious Insight", { MailHelms: 20, BestialPrimacy: 25 }],
  //     ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const infuriousFootwrapsOfIndemnityRecipe = await createRecipe(
  //   null,
  //   infuriousFootwrapsOfIndemnity,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [crystalspineFur, 8],
  //     [infuriousScales, 16],
  //     [resilientLeather, 100],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Illustrious Insight", { BootsLeather: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const infuriousSpiritsHoodRecipe = await createRecipe(
  //   null,
  //   infuriousSpiritsHood,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 50],
  //     [fireInfusedHide, 8],
  //     [infuriousHide, 20],
  //     [resilientLeather, 100],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Illustrious Insight", { Helms: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const crimsonCombatantsAdamantChainmailRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsAdamantChainmail,
  //   1,
  //   leatherworking,
  //   [
  //     [cacophonousThunderscale, 2],
  //     [infuriousScales, 1],
  //     [adamantScales, 15],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { LargeMail: 0 }],
  //     ["Lesser Illustrious Insight", { MailShirts: 20, BestialPrimacy: 25 }],
  //     ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const crimsonCombatantsAdamantCowlRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsAdamantCowl,
  //   1,
  //   leatherworking,
  //   [
  //     [windsongPlumage, 2],
  //     [infuriousScales, 1],
  //     [adamantScales, 15],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { LargeMail: 0 }],
  //     ["Lesser Illustrious Insight", { MailHelms: 20, BestialPrimacy: 25 }],
  //     ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const crimsonCombatantsAdamantCuffsRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsAdamantCuffs,
  //   1,
  //   leatherworking,
  //   [
  //     [crystalspineFur, 2],
  //     [infuriousScales, 1],
  //     [adamantScales, 10],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { LargeMail: 0 }],
  //     ["Lesser Illustrious Insight", { Bracers: 20, BestialPrimacy: 25 }],
  //     ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const crimsonCombatantsAdamantEpaulettesRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsAdamantEpaulettes,
  //   1,
  //   leatherworking,
  //   [
  //     [fireInfusedHide, 2],
  //     [infuriousScales, 1],
  //     [adamantScales, 12],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { LargeMail: 0 }],
  //     [
  //       "Lesser Illustrious Insight",
  //       { Shoulderguards: 20, BestialPrimacy: 25 },
  //     ],
  //     ["Chain Oil", { LargeMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const crimsonCombatantsAdamantGauntletsRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsAdamantGauntlets,
  //   1,
  //   leatherworking,
  //   [
  //     [salamantherScales, 2],
  //     [infuriousScales, 1],
  //     [adamantScales, 12],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Lesser Illustrious Insight", { Gauntlets: 20, BestialPrimacy: 25 }],
  //     ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const crimsonCombatantsAdamantGirdleRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsAdamantGirdle,
  //   1,
  //   leatherworking,
  //   [
  //     [salamantherScales, 2],
  //     [infuriousScales, 1],
  //     [adamantScales, 10],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Lesser Illustrious Insight", { BeltsMail: 20, BestialPrimacy: 25 }],
  //     ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const crimsonCombatantsAdamantLeggingsRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsAdamantLeggings,
  //   1,
  //   leatherworking,
  //   [
  //     [rockfangLeather, 2],
  //     [infuriousScales, 1],
  //     [adamantScales, 15],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Lesser Illustrious Insight", { Greaves: 20, BestialPrimacy: 25 }],
  //     ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const crimsonCombatantsAdamantTreadsRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsAdamantTreads,
  //   1,
  //   leatherworking,
  //   [
  //     [crystalspineFur, 2],
  //     [infuriousScales, 1],
  //     [adamantScales, 12],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { IntricateMail: 0 }],
  //     ["Lesser Illustrious Insight", { BootsMail: 20, BestialPrimacy: 25 }],
  //     ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const crimsonCombatantsResilientBeltRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsResilientBelt,
  //   1,
  //   leatherworking,
  //   [
  //     [salamantherScales, 2],
  //     [infuriousHide, 1],
  //     [resilientLeather, 10],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { BeltsLeather: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const crimsonCombatantsResilientBootsRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsResilientBelt,
  //   1,
  //   leatherworking,
  //   [
  //     [crystalspineFur, 2],
  //     [infuriousHide, 1],
  //     [resilientLeather, 12],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { BootsLeather: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const crimsonCombatantsResilientChestpieceRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsResilientChestpiece,
  //   1,
  //   leatherworking,
  //   [
  //     [cacophonousThunderscale, 2],
  //     [infuriousHide, 1],
  //     [resilientLeather, 15],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Chestpieces: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const crimsonCombatantsResilientGlovesRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsResilientGloves,
  //   1,
  //   leatherworking,
  //   [
  //     [salamantherScales, 2],
  //     [infuriousHide, 1],
  //     [resilientLeather, 12],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Gloves: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const crimsonCombatantsResilientMaskRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsResilientMask,
  //   1,
  //   leatherworking,
  //   [
  //     [windsongPlumage, 2],
  //     [infuriousHide, 1],
  //     [resilientLeather, 15],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Helms: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const crimsonCombatantsResilientShoulderpadsRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsResilientShoulderpads,
  //   1,
  //   leatherworking,
  //   [
  //     [fireInfusedHide, 2],
  //     [infuriousHide, 1],
  //     [resilientLeather, 12],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Shoulderpads: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const crimsonCombatantsResilientTrousersRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsResilientTrousers,
  //   1,
  //   leatherworking,
  //   [
  //     [rockfangLeather, 2],
  //     [infuriousHide, 1],
  //     [resilientLeather, 15],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { EmbroideredLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Legguards: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const crimsonCombatantsResilientWristwrapsRecipe = await createRecipe(
  //   null,
  //   crimsonCombatantsResilientWristwraps,
  //   1,
  //   leatherworking,
  //   [
  //     [crystalspineFur, 2],
  //     [infuriousHide, 1],
  //     [resilientLeather, 10],
  //   ],
  //   null,
  //   "Bestial Patterns",
  //   1,
  //   120,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     ["Missive", { ShapedLeatherArmor: 0 }],
  //     ["Lesser Illustrious Insight", { Wristwraps: 20, BestialPrimacy: 25 }],
  //     [
  //       "Curing Agent",
  //       { ShapedLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const acidicHailstoneTreadsRecipe = await createRecipe(
  //   null,
  //   acidicHailstoneTreads,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [rockfangLeather, 12],
  //     [frostbiteScales, 18],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Decayed Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "Dungeon Drop",
  //   "Altar of Decay",
  //   "Drops from Decayed Creates in Brackenhide Hollow.",
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Illustrious Insight", { BootsMail: 20, DecayingGrasp: 25 }],
  //     ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const slimyExpulsionBootsRecipe = await createRecipe(
  //   null,
  //   slimyExpulsionBoots,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [salamantherScales, 10],
  //     [stonecrustHide, 18],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Decayed Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "Dungeon Drop",
  //   "Altar of Decay",
  //   "Drops from Decayed Creates in Brackenhide Hollow.",
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Illustrious Insight", { BootsLeather: 20, DecayingGrasp: 25 }],
  //     [
  //       "Curing Agent",
  //       { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const toxicThornFootwrapsRecipe = await createRecipe(
  //   null,
  //   toxicThornFootwraps,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [cacophonousThunderscale, 6],
  //     [frostbiteScales, 18],
  //     [resilientLeather, 150],
  //   ],
  //   null,
  //   "Decayed Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "Dungeon Drop",
  //   "Altar of Decay",
  //   "Drops from Decayed Creates in Brackenhide Hollow.",
  //   [
  //     ["Primal Infusion", { LeatherArmorCrafting: 0 }],
  //     ["Illustrious Insight", { BootsLeather: 20, DecayingGrasp: 25 }],
  //     [
  //       "Curing Agent",
  //       { EmbroideredLeatherArmor: 30, PrimordialLeatherworking: 35 },
  //     ],
  //   ]
  // );
  // const venomSteepedStompersRecipe = await createRecipe(
  //   null,
  //   venomSteepedStompers,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [cacophonousThunderscale, 6],
  //     [stonecrustHide, 18],
  //     [adamantScales, 150],
  //   ],
  //   null,
  //   "Decayed Patterns",
  //   1,
  //   415,
  //   null,
  //   null,
  //   "Dungeon Drop",
  //   "Altar of Decay",
  //   "Drops from Decayed Creates in Brackenhide Hollow.",
  //   [
  //     ["Primal Infusion", { MailArmorCrafting: 0 }],
  //     ["Illustrious Insight", { BootsMail: 20, DecayingGrasp: 25 }],
  //     ["Chain Oil", { IntricateMail: 30, PrimordialLeatherworking: 35 }],
  //   ]
  // );
  // const witherrotTomeRecipe = await createRecipe(
  //   null,
  //   witherrotTome,
  //   1,
  //   leatherworking,
  //   [
  //     [sparkOfIngenuity, 1],
  //     [primalChaos, 40],
  //     [awakenedDecay, 15],
  //     [tallstriderSinew, 2],
  //     [stonecrustHide, 14],
  //     [resilientLeather, 100],
  //   ],
  //   null,
  //   "Decayed Patterns",
  //   1,
  //   300,
  //   null,
  //   { DecayingGrasp: 0 },
  //   null,
  //   "Altar of Decay",
  //   null,
  //   [
  //     ["Primal Infusion", {}],
  //     ["Illustrious Insight", { DecayingGrasp: 25 }],
  //   ]
  // );
  // const finishedPrototypeExplorersBardingRecipe = await createRecipe(
  //   null,
  //   finishedPrototypeExplorersBarding,
  //   1,
  //   leatherworking,
  //   [
  //     [prototypeExplorersBardingFramework, 1],
  //     [tuftOfPrimalWool, 1],
  //     [lustrousScaledHide, 6],
  //     [resilientLeather, 80],
  //   ],
  //   null,
  //   "Reagents",
  //   1,
  //   null,
  //   { MaruukCentaur: 22 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench"
  // );
  // const finishedPrototypeRegalBardingRecipe = await createRecipe(
  //   null,
  //   finishedPrototypeExplorersBarding,
  //   1,
  //   leatherworking,
  //   [
  //     [prototypeRegalBardingFramework, 1],
  //     [tuftOfPrimalWool, 1],
  //     [lustrousScaledHide, 6],
  //     [resilientLeather, 80],
  //   ],
  //   null,
  //   "Reagents",
  //   1,
  //   null,
  //   { IskaaraTuskarr: 29 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench"
  // );
  // const earthshineScalesRecipe = await createRecipe(
  //   null,
  //   earthshineScales,
  //   2,
  //   leatherworking,
  //   [
  //     [awakenedEarth, 1],
  //     [awakenedFrost, 1],
  //     [lustrousScaledHide, 2],
  //   ],
  //   25,
  //   "Reagents",
  //   1,
  //   375,
  //   null,
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     [
  //       "Lesser Illustrious Insight",
  //       { CuringAndTanning: 25, ElementalMastery: 25 },
  //     ],
  //   ]
  // );
  // const frostbiteScalesRecipe = await createRecipe(
  //   null,
  //   frostbiteScales,
  //   2,
  //   leatherworking,
  //   [
  //     [awakenedFrost, 1],
  //     [awakenedDecay, 1],
  //     [lustrousScaledHide, 2],
  //   ],
  //   25,
  //   "Reagents",
  //   1,
  //   375,
  //   null,
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     [
  //       "Lesser Illustrious Insight",
  //       { CuringAndTanning: 25, DecayingGrasp: 25 },
  //     ],
  //   ]
  // );
  // const infuriousHideRecipe = await createRecipe(
  //   null,
  //   infuriousHide,
  //   2,
  //   leatherworking,
  //   [
  //     [awakenedIre, 2],
  //     [denseHide, 2],
  //   ],
  //   null,
  //   "Reagents",
  //   1,
  //   375,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     [
  //       "Lesser Illustrious Insight",
  //       { CuringAndTanning: 25, BestialPrimacy: 25 },
  //     ],
  //   ]
  // );
  // const infuriousScalesRecipe = await createRecipe(
  //   null,
  //   infuriousScales,
  //   2,
  //   leatherworking,
  //   [
  //     [awakenedIre, 2],
  //     [lustrousScaledHide, 2],
  //   ],
  //   null,
  //   "Reagents",
  //   1,
  //   375,
  //   null,
  //   null,
  //   "PvP Victory",
  //   "Leatherworker's Tool Bench",
  //   "Received from Arena, BGs, or WM?",
  //   [
  //     [
  //       "Lesser Illustrious Insight",
  //       { CuringAndTanning: 25, BestialPrimacy: 25 },
  //     ],
  //   ]
  // );
  // const mireslushHideRecipe = await createRecipe(
  //   null,
  //   mireslushHide,
  //   2,
  //   leatherworking,
  //   [
  //     [awakenedEarth, 1],
  //     [awakenedFrost, 1],
  //     [denseHide, 2],
  //   ],
  //   25,
  //   "Reagents",
  //   1,
  //   375,
  //   null,
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     [
  //       "Lesser Illustrious Insight",
  //       { CuringAndTanning: 25, ElementalMastery: 25 },
  //     ],
  //   ]
  // );
  // const stonecrustHideRecipe = await createRecipe(
  //   null,
  //   stonecrustHide,
  //   2,
  //   leatherworking,
  //   [
  //     [awakenedDecay, 1],
  //     [awakenedEarth, 1],
  //     [denseHide, 2],
  //   ],
  //   25,
  //   "Reagents",
  //   1,
  //   375,
  //   null,
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [
  //     [
  //       "Lesser Illustrious Insight",
  //       { CuringAndTanning: 25, DecayingGrasp: 25 },
  //     ],
  //   ]
  // );
  // const fangAdornmentsRecipe = await createRecipe(
  //   null,
  //   fangAdornments,
  //   1,
  //   leatherworking,
  //   [
  //     [rockfangLeather, 2],
  //     [pristineVorquinHorn, 2],
  //     [aquaticMaw, 1],
  //     [mastodonTusk, 1],
  //     [earthshineScales, 3],
  //     [resilientLeather, 60],
  //   ],
  //   null,
  //   "Optional Reagents",
  //   1,
  //   350,
  //   null,
  //   { BestialPrimacy: 20 },
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [["Lesser Illustrious Insight", { BestialPrimacy: 25 }]]
  // );
  // const toxifiedArmorPatchRecipe = await createRecipe(
  //   null,
  //   toxifiedArmorPatch,
  //   1,
  //   leatherworking,
  //   [
  //     [awakenedDecay, 8],
  //     [stonecrustHide, 2],
  //     [adamantScales, 60],
  //   ],
  //   null,
  //   "Optional Reagents",
  //   1,
  //   350,
  //   null,
  //   { DecayingGrasp: 20 },
  //   null,
  //   "Altar of Decay",
  //   null,
  //   [["Lesser Illustrious Insight", { DecayingGrasp: 25 }]]
  // );
  // const illustriousInsightRecipeLeatherworking = await createRecipe(
  //   "Illustrious Insight",
  //   illustriousInsight,
  //   1,
  //   leatherworking,
  //   [[artisansMettle, 50]],
  //   null,
  //   "Finishing Reagents",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Various Specializations",
  //   "Leatherworker's Tool Bench"
  // );
  // const fierceArmorKitRecipe = await createRecipe(
  //   null,
  //   fierceArmorKit,
  //   1,
  //   leatherworking,
  //   [
  //     [awakenedEarth, 10],
  //     [stonecrustHide, 4],
  //     [resilientLeather, 60],
  //   ],
  //   null,
  //   "Armor Kits",
  //   1,
  //   375,
  //   null,
  //   null,
  //   "World Drop",
  //   "Leatherworker's Tool Bench",
  //   "Received from Maruuk Centaur Hunts.",
  //   [["Illustrious Insight", { CuringAndTanning: 25, BestialPrimacy: 25 }]]
  // );
  // const frostedArmorKitRecipe = await createRecipe(
  //   null,
  //   frostedArmorKit,
  //   1,
  //   leatherworking,
  //   [
  //     [awakenedFrost, 10],
  //     [frostbiteScales, 4],
  //     [adamantScales, 60],
  //   ],
  //   null,
  //   "Armor Kits",
  //   1,
  //   375,
  //   { CobaltAssembly: "High" },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench",
  //   null,
  //   [["Illustrious Insight", { CuringAndTanning: 25, ElementalMastery: 25 }]]
  // );
  // const reinforcedArmorKitRecipe = await createRecipe(
  //   null,
  //   reinforcedArmorKit,
  //   1,
  //   leatherworking,
  //   [
  //     [cacophonousThunderscale, 2],
  //     [denseHide, 1],
  //     [resilientLeather, 50],
  //   ],
  //   10,
  //   "Armor Kits",
  //   1,
  //   150,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [["Lesser Illustrious Insight", { CuringAndTanning: 25 }]]
  // );
  // const feralHideDrumsRecipe = await createRecipe(
  //   null,
  //   feralHideDrums,
  //   1,
  //   leatherworking,
  //   [
  //     [denseHide, 1],
  //     [resilientLeather, 10],
  //   ],
  //   15,
  //   "Drums",
  //   1
  // );
  // const artisansSignRecipe = await createRecipe(
  //   null,
  //   artisansSign,
  //   1,
  //   leatherworking,
  //   [
  //     [pentagoldSeal, 4],
  //     [rockfangLeather, 5],
  //     [denseHide, 2],
  //     [runedWrithebark, 4],
  //   ],
  //   null,
  //   "Toys",
  //   1,
  //   null,
  //   { ArtisansConsortium: "Esteemed" },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench"
  // );
  // const gnollTentRecipe = await createRecipe(
  //   null,
  //   gnollTent,
  //   1,
  //   leatherworking,
  //   [
  //     [primalBearSpine, 1],
  //     [denseHide, 20],
  //     [lustrousScaledHide, 15],
  //     [resilientLeather, 200],
  //   ],
  //   null,
  //   "Toys",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Leatherworker's Tool Bench",
  //   "Drops from Gnolls."
  // );
  // const tuskarrBeanBagRecipe = await createRecipe(
  //   null,
  //   tuskarrBeanBag,
  //   1,
  //   leatherworking,
  //   [
  //     [contouredFowlfeather, 100],
  //     [denseHide, 30],
  //     [resilientLeather, 200],
  //   ],
  //   null,
  //   "Toys",
  //   1,
  //   null,
  //   { IskaaraTuskarr: 23 },
  //   null,
  //   null,
  //   "Leatherworker's Tool Bench"
  // );

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
      ["Missive", { Embellishments: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Embellishments: 0 }],
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
      ["Missive", { Outfits: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Outfits: 0 }],
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
      ["Missive", { Embellishments: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Outfits: 0 }],
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
      ["Missive", { Embellishments: 0 }],
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
      ["Missive", { Embellishments: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Outfits: 0 }],
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
      ["Missive", { Embellishments: 0 }],
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
      ["Missive", { Embellishments: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Outfits: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Embellishments: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Outfits: 0 }],
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
      ["Missive", { Outerwear: 0 }],
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
      ["Missive", { Embellishments: 0 }],
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
  // const ooeyGooeyChocolateRecipe = await createRecipe(
  //   null,
  //   ooeyGooeyChocolate,
  //   1,
  //   cooking,
  //   [
  //     [convenientlyPackagedIngredients, 3],
  //     [thaldraszianCocoaPowder, 6],
  //     [pastryPackets, 4],
  //   ],
  //   null,
  //   "Ingredients",
  //   1,
  //   null,
  //   { ArtisansConsortium: "Esteemed" },
  //   null,
  //   null,
  //   "Cooking Fire"
  // );
  // const impossiblySharpCuttingKnifeRecipe = await createRecipe(
  //   null,
  //   impossiblySharpCuttingKnife,
  //   2,
  //   cooking,
  //   [
  //     [saltDeposit, 2],
  //     [sereviteOre, 2],
  //   ],
  //   null,
  //   "Ingredients",
  //   1,
  //   null,
  //   { IskaaraTuskarr: 15 },
  //   null,
  //   null,
  //   "Anvil"
  // );
  // const saladOnTheSideRecipe = await createRecipe(
  //   null,
  //   saladOnTheSide,
  //   2,
  //   cooking,
  //   [
  //     [lavaBeetle, 2],
  //     [hochenblume, 1],
  //     [saxifrage, 1],
  //   ],
  //   null,
  //   "Ingredients",
  //   1,
  //   null,
  //   { DragonscaleExpedition: 13 },
  //   null,
  //   null,
  //   "Anvil"
  // );
  // const assortedExoticSpicesRecipe = await createRecipe(
  //   null,
  //   assortedExoticSpices,
  //   "2-3",
  //   cooking,
  //   [
  //     [lavaBeetle, 2],
  //     [convenientlyPackagedIngredients, 1],
  //   ],
  //   1,
  //   "Ingredients",
  //   1
  // );
  // const pebbledRockSaltsRecipe = await createRecipe(
  //   null,
  //   pebbledRockSalts,
  //   "2-3",
  //   cooking,
  //   [
  //     [saltDeposit, 2],
  //     [convenientlyPackagedIngredients, 1],
  //   ],
  //   1,
  //   "Ingredients",
  //   1
  // );
  // const breakfastOfDraconicChampionsRecipe = await createRecipe(
  //   null,
  //   breakfastOfDraconicChampions,
  //   4,
  //   cooking,
  //   [
  //     [waterfowlFilet, 2],
  //     [hornswogHunk, 2],
  //     [bruffalonFlank, 2],
  //     [basiliskEggs, 2],
  //     [mightyMammothRibs, 2],
  //     [burlyBearHaunch, 2],
  //   ],
  //   45,
  //   "Snacks",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Cooking Fire",
  //   null,
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const mackerelSnackerelRecipe = await createRecipe(
  //   null,
  //   mackerelSnackerel,
  //   4,
  //   cooking,
  //   [[scalebellyMackerel, 4]],
  //   15,
  //   "Snacks",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Cooking Fire",
  //   null,
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const cheeseAndQuackersRecipe = await createRecipe(
  //   null,
  //   cheeseAndQuackers,
  //   4,
  //   cooking,
  //   [
  //     [waterfowlFilet, 2],
  //     [threeCheeseBlend, 1],
  //   ],
  //   10,
  //   "Snacks",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Cooking Fire",
  //   null,
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const probablyProteinRecipe = await createRecipe(
  //   null,
  //   probablyProtein,
  //   4,
  //   cooking,
  //   [
  //     [maybeMeat, 2],
  //     [convenientlyPackagedIngredients, 2],
  //   ],
  //   5,
  //   "Snacks",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Cooking Fire",
  //   null,
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const sweetAndSourClamChowderRecipe = await createRecipe(
  //   null,
  //   sweetAndSourClamChowder,
  //   4,
  //   cooking,
  //   [
  //     [ribbedMolluskMeat, 2],
  //     [convenientlyPackagedIngredients, 2],
  //     [ohnahranPotato, 5],
  //   ],
  //   35,
  //   "Snacks",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Cooking Fire",
  //   null,
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const twiceBakedPotatoRecipe = await createRecipe(
  //   null,
  //   twiceBakedPotato,
  //   4,
  //   cooking,
  //   [
  //     [ohnahranPotato, 4],
  //     [threeCheeseBlend, 2],
  //   ],
  //   1,
  //   "Snacks",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Cooking Fire",
  //   "Learned by default.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const deliciousDragonSpittleRecipe = await createRecipe(
  //   null,
  //   deliciousDragonSpittle,
  //   4,
  //   cooking,
  //   [
  //     [artisanalBerryJuice, 1],
  //     [ribbedMolluskMeat, 1],
  //   ],
  //   25,
  //   "Snacks",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Cooking Fire",
  //   null,
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const churnbellyTeaRecipe = await createRecipe(
  //   null,
  //   churnbellyTea,
  //   1,
  //   cooking,
  //   [
  //     [scalebellyMackerel, 1],
  //     [islefinDorado, 1],
  //     [zestyWater, 1],
  //   ],
  //   null,
  //   "Snacks",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   null,
  //   "Received from Draconic Recipe in a Bottle.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const zestyWaterRecipe = await createRecipe(
  //   null,
  //   zestyWater,
  //   4,
  //   cooking,
  //   [
  //     [ribbedMolluskMeat, 1],
  //     [refreshingSpringWater, 1],
  //   ],
  //   10,
  //   "Snacks",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   null,
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const fatedFortuneCookieRecipe = await createRecipe(
  //   null,
  //   fatedFortuneCookie,
  //   1,
  //   cooking,
  //   [
  //     [fatedFortuneCard, 1],
  //     [thaldraszianCocoaPowder, 3],
  //     [pastryPackets, 5],
  //     [silkenGemdust, 2],
  //   ],
  //   null,
  //   "Desserts",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Fated Fortune Card",
  //   "Cooking Fire",
  //   "Chance to get from a Fated Fortune Card.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const blubberyMuffinRecipe = await createRecipe(
  //   null,
  //   blubberyMuffin,
  //   3,
  //   cooking,
  //   [
  //     [buttermilk, 1],
  //     [basiliskEggs, 2],
  //     [pastryPackets, 3],
  //     [threeCheeseBlend, 1],
  //   ],
  //   null,
  //   "Desserts",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Fishing Vendor",
  //   "Cooking Fire",
  //   "Purchased with some wacky currency from Jinkutuk in The Azure Span.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const celebratoryCakeRecipe = await createRecipe(
  //   null,
  //   celebratoryCake,
  //   1,
  //   cooking,
  //   [
  //     [basiliskEggs, 5],
  //     [pastryPackets, 3],
  //     [thaldraszianCocoaPowder, 10],
  //     [convenientlyPackagedIngredients, 3],
  //   ],
  //   null,
  //   "Desserts",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Quest",
  //   "Cooking Fire",
  //   "Received from the After My Own Heart questline in Ohn'ahran Plains.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const snowInAConeRecipe = await createRecipe(
  //   null,
  //   snowInACone,
  //   4,
  //   cooking,
  //   [
  //     [snowball, 3],
  //     [pastryPackets, 1],
  //     [thaldraszianCocoaPowder, 2],
  //   ],
  //   5,
  //   "Desserts",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   null,
  //   "Snow Covered Scroll in The Azure Span.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const tastyHatchlingsTreatRecipe = await createRecipe(
  //   null,
  //   tastyHatchlingsTreat,
  //   2,
  //   cooking,
  //   [
  //     [maybeMeat, 10],
  //     [basiliskEggs, 3],
  //     [pastryPackets, 2],
  //     [thaldraszianCocoaPowder, 1],
  //   ],
  //   null,
  //   "Desserts",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Cooking Fire",
  //   "Drops from Barrel of Confiscated Treats in Valdrakken.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const braisedBruffalonBrisketRecipe = await createRecipe(
  //   null,
  //   braisedBruffalonBrisket,
  //   4,
  //   cooking,
  //   [
  //     [aileronSeamoth, 1],
  //     [bruffalonFlank, 4],
  //     [assortedExoticSpices, 1],
  //   ],
  //   null,
  //   "Meat Meals",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Cooking Other Food",
  //   "Cooking Fire",
  //   "Can be learned when cooking Charred Hornswog Steaks.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const charredHornswogSteaksRecipe = await createRecipe(
  //   null,
  //   charredHornswogSteaks,
  //   4,
  //   cooking,
  //   [
  //     [maybeMeat, 4],
  //     [hornswogHunk, 4],
  //     [ohnahranPotato, 2],
  //   ],
  //   null,
  //   "Meat Meals",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Cooking Fire",
  //   "Drops from Searing Flame Harchek in The Waking Shores.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const riversidePicnicRecipe = await createRecipe(
  //   null,
  //   riversidePicnic,
  //   4,
  //   cooking,
  //   [
  //     [ceruleanSpinefish, 1],
  //     [burlyBearHaunch, 4],
  //     [assortedExoticSpices, 1],
  //   ],
  //   null,
  //   "Meat Meals",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Cooking Other Food",
  //   "Cooking Fire",
  //   "Can be learned when cooking Scrambled Basilisk Eggs.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const roastDuckDelightRecipe = await createRecipe(
  //   null,
  //   roastDuckDelight,
  //   4,
  //   cooking,
  //   [
  //     [temporalDragonhead, 1],
  //     [waterfowlFilet, 4],
  //     [assortedExoticSpices, 1],
  //   ],
  //   null,
  //   "Meat Meals",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Cooking Other Food",
  //   "Cooking Fire",
  //   "Can be learned when cooking Thrice-Spiced Mammoth Kabob.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const saltedMeatMashRecipe = await createRecipe(
  //   null,
  //   saltedMeatMash,
  //   4,
  //   cooking,
  //   [
  //     [scalebellyMackerel, 1],
  //     [maybeMeat, 6],
  //     [pebbledRockSalts, 1],
  //   ],
  //   40,
  //   "Meat Meals",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Cooking Fire",
  //   null,
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const scrambledBasiliskEggsRecipe = await createRecipe(
  //   null,
  //   scrambledBasiliskEggs,
  //   4,
  //   cooking,
  //   [
  //     [maybeMeat, 2],
  //     [basiliskEggs, 3],
  //     [threeCheeseBlend, 2],
  //   ],
  //   30,
  //   "Meat Meals",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Cooking Fire",
  //   null,
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const thriceSpicedMammothKabobRecipe = await createRecipe(
  //   null,
  //   thriceSpicedMammothKabob,
  //   4,
  //   cooking,
  //   [
  //     [maybeMeat, 4],
  //     [mightyMammothRibs, 4],
  //   ],
  //   null,
  //   "Meat Meals",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Quest",
  //   "Cooking Fire",
  //   "Received from the Honoring Our Ancestors questline in Ohn'ahran Plains.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const hopefullyHealthyRecipe = await createRecipe(
  //   null,
  //   hopefullyHealthy,
  //   4,
  //   cooking,
  //   [
  //     [maybeMeat, 3],
  //     [convenientlyPackagedIngredients, 4],
  //   ],
  //   20,
  //   "Meat Meals",
  //   1,
  //   null,
  //   null,
  //   null,
  //   null,
  //   "Cooking Fire",
  //   null,
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const filetOfFangsRecipe = await createRecipe(
  //   null,
  //   filetOfFangs,
  //   4,
  //   cooking,
  //   [
  //     [thousandbitePiranha, 2],
  //     [ribbedMolluskMeat, 2],
  //     [assortedExoticSpices, 2],
  //   ],
  //   null,
  //   "Simple Fish Dishes",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Quest",
  //   "Cooking Fire",
  //   "Received from the Encroaching Heat quest in The Waking Shores.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const saltBakedFishcakeRecipe = await createRecipe(
  //   null,
  //   saltBakedFishcake,
  //   4,
  //   cooking,
  //   [
  //     [ceruleanSpinefish, 2],
  //     [ribbedMolluskMeat, 2],
  //     [assortedExoticSpices, 2],
  //   ],
  //   null,
  //   "Simple Fish Dishes",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Quest",
  //   "Cooking Fire",
  //   "Received from the Encroaching Heat quest in The Waking Shores.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const seamothSurpriseRecipe = await createRecipe(
  //   null,
  //   seamothSurprise,
  //   4,
  //   cooking,
  //   [
  //     [aileronSeamoth, 2],
  //     [ribbedMolluskMeat, 2],
  //     [assortedExoticSpices, 2],
  //   ],
  //   null,
  //   "Simple Fish Dishes",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Quest",
  //   "Cooking Fire",
  //   "Received from the Encroaching Heat quest in The Waking Shores.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const timelyDemiseRecipe = await createRecipe(
  //   null,
  //   timelyDemise,
  //   4,
  //   cooking,
  //   [
  //     [temporalDragonhead, 2],
  //     [ribbedMolluskMeat, 2],
  //     [pebbledRockSalts, 2],
  //   ],
  //   null,
  //   "Simple Fish Dishes",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Quest",
  //   "Cooking Fire",
  //   "Received from the Encroaching Heat quest in The Waking Shores.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const aromaticSeafoodPlatterRecipe = await createRecipe(
  //   null,
  //   aromaticSeafoodPlatter,
  //   4,
  //   cooking,
  //   [
  //     [aileronSeamoth, 1],
  //     [temporalDragonhead, 1],
  //     [pebbledRockSalts, 3],
  //     [islefinDorado, 1],
  //   ],
  //   null,
  //   "Deluxe Fish Dishes",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Cooking Other Food",
  //   "Cooking Fire",
  //   "Can be learned when cooking Timely Demise or Seamoth Surprise.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const feistyFishSticksRecipe = await createRecipe(
  //   null,
  //   feistyFishSticks,
  //   4,
  //   cooking,
  //   [
  //     [temporalDragonhead, 1],
  //     [thousandbitePiranha, 1],
  //     [pebbledRockSalts, 3],
  //     [islefinDorado, 1],
  //   ],
  //   null,
  //   "Deluxe Fish Dishes",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Cooking Other Food",
  //   "Cooking Fire",
  //   "Can be learned when cooking Timely Demise or Filet of Fangs.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const greatCeruleanSeaRecipe = await createRecipe(
  //   null,
  //   greatCeruleanSea,
  //   4,
  //   cooking,
  //   [
  //     [aileronSeamoth, 1],
  //     [ceruleanSpinefish, 1],
  //     [pebbledRockSalts, 3],
  //     [islefinDorado, 1],
  //   ],
  //   null,
  //   "Deluxe Fish Dishes",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Cooking Other Food",
  //   "Cooking Fire",
  //   "Can be learned when cooking Seamoth Surprise or Salt-Baked Fishcake.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const revengeServedColdRecipe = await createRecipe(
  //   null,
  //   revengeServedCold,
  //   4,
  //   cooking,
  //   [
  //     [aileronSeamoth, 1],
  //     [thousandbitePiranha, 1],
  //     [assortedExoticSpices, 3],
  //     [islefinDorado, 1],
  //   ],
  //   null,
  //   "Deluxe Fish Dishes",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Cooking Other Food",
  //   "Cooking Fire",
  //   "Can be learned when cooking Filet of Fangs or Seamoth Surprise.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const sizzlingSeafoodMedleyRecipe = await createRecipe(
  //   null,
  //   sizzlingSeafoodMedley,
  //   4,
  //   cooking,
  //   [
  //     [temporalDragonhead, 1],
  //     [ceruleanSpinefish, 1],
  //     [assortedExoticSpices, 3],
  //     [islefinDorado, 1],
  //   ],
  //   null,
  //   "Deluxe Fish Dishes",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Cooking Other Food",
  //   "Cooking Fire",
  //   "Can be learned when cooking Timely Demise or Salt-Baked Fishcake.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const thousandboneTongueslicerRecipe = await createRecipe(
  //   null,
  //   thousandboneTongueslicer,
  //   4,
  //   cooking,
  //   [
  //     [thousandbitePiranha, 1],
  //     [ceruleanSpinefish, 1],
  //     [pebbledRockSalts, 3],
  //     [islefinDorado, 1],
  //   ],
  //   null,
  //   "Deluxe Fish Dishes",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Cooking Other Food",
  //   "Cooking Fire",
  //   "Can be learned when cooking Filet of Fangs or Salt-Baked Fishcake.",
  //   [
  //     ["Finishing Touches", {}],
  //     ["Secret Ingredient", {}],
  //   ]
  // );
  // const gralsDevotion = await createRecipe(
  //   "Gral's Devotion",
  //   grandBanquetOfTheKaluak,
  //   2,
  //   cooking,
  //   [
  //     [magmaThresher, 2],
  //     [roastDuckDelight, 4],
  //     [sizzlingSeafoodMedley, 6],
  //     [revengeServedCold, 6],
  //     [mightyMammothRibs, 6],
  //     [celebratoryCake, 1],
  //   ],
  //   null,
  //   "Great Feasts",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Quest",
  //   "Cooking Fire",
  //   "Received from the Community Feast world quest in The Azure Span.",
  //   [["Finishing Touches", {}]]
  // );
  // const gralsReverence = await createRecipe(
  //   "Gral's Reverence",
  //   grandBanquetOfTheKaluak,
  //   2,
  //   cooking,
  //   [
  //     [prismaticLeaper, 2],
  //     [braisedBruffalonBrisket, 4],
  //     [feistyFishSticks, 6],
  //     [greatCeruleanSea, 6],
  //     [hornswogHunk, 6],
  //     [blubberyMuffin, 3],
  //   ],
  //   null,
  //   "Great Feasts",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Quest",
  //   "Cooking Fire",
  //   "Received from the Community Feast world quest in The Azure Span.",
  //   [["Finishing Touches", {}]]
  // );
  // const gralsVeneration = await createRecipe(
  //   "Gral's Veneration",
  //   grandBanquetOfTheKaluak,
  //   2,
  //   cooking,
  //   [
  //     [rimefinTuna, 2],
  //     [riversidePicnic, 4],
  //     [aromaticSeafoodPlatter, 6],
  //     [thousandbitePiranha, 6],
  //     [basiliskEggs, 6],
  //     [snowInACone, 3],
  //   ],
  //   null,
  //   "Great Feasts",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Quest",
  //   "Cooking Fire",
  //   "Received from the Community Feast world quest in The Azure Span.",
  //   [["Finishing Touches", {}]]
  // );
  // const hoardOfDraconicDelicaciesRecipe = await createRecipe(
  //   null,
  //   hoardOfDraconicDelicacies,
  //   1,
  //   cooking,
  //   [
  //     [islefinDorado, 3],
  //     [braisedBruffalonBrisket, 3],
  //     [roastDuckDelight, 3],
  //     [pebbledRockSalts, 2],
  //     [assortedExoticSpices, 2],
  //   ],
  //   null,
  //   "Great Feasts",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "Quest",
  //   "Cooking Fire",
  //   "Received from the What a Long, Sweet Trip It's Been questline in Valdrakken.",
  //   [["Finishing Touches", {}]]
  // );
  // const yusasHeartyStewRecipe = await createRecipe(
  //   null,
  //   yusasHeartyStew,
  //   1,
  //   cooking,
  //   [
  //     [islefinDorado, 1],
  //     [thousandbitePiranha, 1],
  //     [mightyMammothRibs, 1],
  //     [ohnahranPotato, 1],
  //     [assortedExoticSpices, 1],
  //   ],
  //   null,
  //   "Great Feasts",
  //   1,
  //   null,
  //   null,
  //   null,
  //   "World Drop",
  //   "Cooking Fire",
  //   "Elder Yusa discovery? In the Ohn'ahran Plains.",
  //   [["Finishing Touches", {}]]
  // );

  // console.log('Data seeded successfully.'));

  // const professions = await Profession.findAll());
  // console.log("All professions:", JSON.stringify(professions, null, 2));
};

makeTables();
