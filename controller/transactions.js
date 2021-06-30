const Promise = require("bluebird");
const Transactions = require("../model/transactions");

async function getTransactions() {
  return await Transactions.find({}).exec();
}

async function processValidDepositsFromTransactionsCollection(customers) {
  // get valid whole deposits from the transactions collection and display in command line.

  const validTransactionsForRespectiveCustomer =
    await getValidTransactionsForRespectiveCustomer(customers);
  const validAllTransaction = await getValidAllTransactions();
  const validTransactionsForUnknowCustomer =
    await getValidTransactionsForUnknowCustomer(
      validAllTransaction,
      validTransactionsForRespectiveCustomer
    );
  const customerValidtransaction = await transformValidTransaction(
    validTransactionsForRespectiveCustomer,
    customers
  );
  const validSmallestDeposits = await getValidSmallestDeposit();
  const validLargestDeposits = await getValidLargestDeposit();

  displayValidAllTransactions(
    customerValidtransaction,
    validTransactionsForUnknowCustomer,
    validSmallestDeposits,
    validLargestDeposits
  );
}

async function getValidTransactionsForRespectiveCustomer(customers) {
  //get valid transactions of respective customer from the tracsaction collection.
  let validTransactionsForRespectiveCustomer = [];
  for (let i = 0; i < customers.length; i++) {
    let validTransaction = await Transactions.aggregate(
      [
        {
          $match: {
            confirmations: { $gte: 6 },
            address: customers[i].address,
          },
        },
        {
          $group: {
            _id: "$address",
            sum: {
              $sum: "$amount",
            },
            count: { $sum: 1 },
          },
        },
      ],
      function (err, result) {
        if (err) {
          console.error("get valid transaction error: ", err);
        }
        return result;
      }
    );
    validTransactionsForRespectiveCustomer.push(validTransaction);
  }
  return validTransactionsForRespectiveCustomer;
}

async function getValidAllTransactions() {
  // get valid whole transactions from trasactions collection.

  return await Transactions.aggregate(
    [
      {
        $match: {
          confirmations: { $gte: 6 },
        },
      },
      {
        $group: {
          _id: "null",
          sum: {
            $sum: "$amount",
          },
          count: { $sum: 1 },
        },
      },
    ],
    function (err, result) {
      if (err) {
        console.error("get valid all transaction error: ", err);
      }
      return result;
    }
  );
}

async function getValidTransactionsForUnknowCustomer(
  validAllTransaction,
  validTransaction
) {
  // get valid transactions for unknown customer from the transactions collection.

  const validTransactionsForUnknowCustomer = await validTransaction.reduce(
    (accumulator, currentValue) => {
      return {
        sum: accumulator.sum + currentValue[0].sum,
        count: accumulator.count + currentValue[0].count,
      };
    },
    { sum: 0, count: 0 }
  );
  return {
    sum: validAllTransaction[0].sum - validTransactionsForUnknowCustomer.sum,
    count:
      validAllTransaction[0].count - validTransactionsForUnknowCustomer.count,
  };
}

async function getValidSmallestDeposit() {
  // get valid smallest deposit.

  const min = await Transactions.find({
    confirmations: { $gte: 6 },
  })
    .sort({ amount: 1 })
    .limit(1)
    .then((transactions) => transactions[0].amount);

  return {
    deposit: min,
  };
}

async function getValidLargestDeposit() {
  // get valid lagest deposit.

  const max = await Transactions.find({
    confirmations: { $gte: 6 },
  })
    .sort({ amount: -1 })
    .limit(1)
    .then((transactions) => transactions[0].amount);

  return {
    deposit: max,
  };
}

async function displayValidAllTransactions(
  validTransactionsForRespectiveCustomer,
  validTransactionsForUnknowCustomer,
  validSmallestDeposit,
  validLargestDeposit
) {
  // display valid whole deposits informations to the command line

  validTransactionsForRespectiveCustomer.map((transaction) => {
    console.log(
      `Deposited for ${transaction.name}: count=${transaction.count} sum=${transaction.sum}`
    );
  });

  console.log(
    `Deposited without reference: count=${validTransactionsForUnknowCustomer.count} sum=${validTransactionsForUnknowCustomer.sum}`
  );

  console.log(`Smallest valid deposit: ${validSmallestDeposit.deposit}`);
  console.log(`Largest valid deposit: ${validLargestDeposit.deposit}`);
}

async function transformValidTransaction(
  validTransactionsForRespectiveCustomer,
  customers
) {
  // join the customer and valid transactions.

  return await validTransactionsForRespectiveCustomer.reduce(
    (accumulator, currentValue) => {
      let newAcc = accumulator;
      const custom = customers.filter(
        (customer) => customer.address === currentValue[0]._id
      );
      newAcc.push({
        ...currentValue[0],
        name: custom[0].name,
      });
      return newAcc;
    },
    []
  );
}

module.exports = {
  getTransactions,
  processValidDepositsFromTransactionsCollection,
};
