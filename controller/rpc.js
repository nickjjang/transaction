const Transactions = require("../model/transactions");
const Customers = require("../model/customers");
const transactionsController = require("./transactions");
const customersController = require("./customers");
const mockTranscations1 = require("../utils/transactions-1.json");
const mockTranscations2 = require("../utils/transactions-2.json");
const mockCustomers = require("../utils/customers.json");
const mockTransactions = [mockTranscations1, mockTranscations2];

function runRPC() {
  // get the mock RPC data(customers and transactions) from JSON data and save to the db.
  initCustomerCollection();
  fetchTransactions();

  // read the valid deposits from db and display to the command line.
  setTimeout(() => {
    filterValidTransaction();
  }, 1000);
}

function fetchTransactions() {
  // get the transactions from JSON mock data and save to the transactions collection of db.

  for (let i = 0; i < 2; i++) {
    const transactions = getListSinceBlock(mockTransactions, i);
    transactions.map((data) => {
      saveData = {
        ...data,
        walletconflicts: JSON.stringify(data.walletconflicts),
        bip125_replaceable: data["bip125-replaceable"],
      };
      const transaction = new Transactions(saveData);
      transaction.save();
    });
  }
}

function getListSinceBlock(list, index) {
  return list[index].transactions;
}

function initCustomerCollection() {
  // get the customers from JSON mock data and save to the customers collection of db.
  mockCustomers.map((data) => {
    const customer = new Customers(data);
    customer.save();
  });
}

async function filterValidTransaction() {
  // handle the valid deposits due to respective and unknown customers.

  const customers = await customersController.getCustomers();
  await transactionsController.processValidDepositsFromTransactionsCollection(
    customers
  );
}

module.exports = {
  runRPC,
};
