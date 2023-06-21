const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const users = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      telepon: DataTypes.STRING,
      password: DataTypes.STRING,
      alamat: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );

  return users;
};
