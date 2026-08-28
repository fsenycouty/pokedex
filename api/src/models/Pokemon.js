import sequelize from "../config/sequelize.client.js";
import { DataTypes } from "sequelize";

const Pokemon = sequelize.define(
  "Pokemon",
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },

    hp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    atk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    def: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    atk_spe: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    def_spe: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    speed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

  { tableName: "pokemon" },
);

export default Pokemon;