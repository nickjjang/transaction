const mongoose = require("mongoose");

const TransactionsSchema = new mongoose.Schema(
  {
    involvesWatchonly: Boolean,
    account: String,
    address: String,
    category: String,
    amount: Number,
    label: String,
    confirmations: Number,
    blockhash: String,
    blockindex: Number,
    blocktime: Date,
    txid: String,
    vout: Number,
    walletconflicts: String,
    time: Date,
    timereceived: Date,
    bip125_replaceable: String,
  },
  { _id: true }
);

const Transactions = mongoose.model("Transactions", TransactionsSchema);

module.exports = Transactions;
