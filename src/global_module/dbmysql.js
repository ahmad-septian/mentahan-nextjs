const { Sequelize } = require("sequelize");

// Option 1: Passing a connection URI
const handle = {
  connect: async () => {
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      "",
      {
        host: process.env.DB_HOST,
        dialect: process.env.DB_ENGINE,
      }
    );

    try {
      await sequelize.authenticate();
      return { sequelize };
    } catch (error) {
      return null;
    }
  },
  scopeConnect: async (callback) => {
    const { sequelize } = await handle.connect();
    const transaction = await sequelize.transaction();
    try {
      await callback({
        sequelize,
        transaction,
      });
      await transaction.commit();
    } catch (ex) {
      await transaction.rollback();

      throw ex;
    } finally {
      await sequelize.close();
    }
  },
};
module.exports = handle;
