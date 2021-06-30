const Customers = require("../model/customers");

async function getCustomers() {
  return await Customers.find({}).exec();
}

module.exports = {
  getCustomers,
};
