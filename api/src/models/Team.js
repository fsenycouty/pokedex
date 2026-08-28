import sequelize from "../config/sequelize.client.js";
import { DataTypes } from "sequelize";

const Team = sequelize.define(
  "Team",
  {
    name: {
      // Contrainte d'unicité globale (pas juste par utilisateur) : voulu, voir Jalon 1
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
    },
  },

  { tableName: "team" },
);

export default Team;