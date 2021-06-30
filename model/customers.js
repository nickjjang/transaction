const mongoose = require("mongoose");

const CustomersSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
  },
  { _id: true }
);

const Customers = mongoose.model("Customers", CustomersSchema);

module.exports = Customers;
