//PACKAGES
const express = require('express')
const parser = require('body-parser')
const {Sequelize,DataTypes} = require('sequelize')
const sequelize = new Sequelize('postgres://conrad:password@localhost:5432/df_professions')
const app = express()

//SETTING UP APP
app.use(parser.urlencoded({extended: true}))

//MEAT & POTATOES