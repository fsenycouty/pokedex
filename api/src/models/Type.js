import sequelize from "../config/sequelize.client.js";
import { DataTypes } from "sequelize";

const Type = sequelize.define(
  "Type",
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },

    // 7 caractères : code couleur hexadécimal, format #RRGGBB
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
  },

  { tableName: "type" },
);

export default Type;