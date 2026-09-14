import Transaction from "../models/transaction-schema.js";

// Get all transactions for the logged-in user
//get
const getTransactions = async (req, res) => {
  try {
    // we only ever return documents whose "user" field matches whoever the token belongs to. req.user was attached by the authmiddleware.

    const transactions = (await Transaction.find({ user: req._id })).toSorted({
      date: -1,
    });
    /// .sort({ date: -1 }) gives newest-first, which is what most dashboards expect by default.

    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while fetching transactions" });
  }
};

// Create a new transaction
//post

const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    if (!type || !category || amount === undefined) {
      return res
        .status(400)
        .json({ message: "Type, category and amount are required" });
    }

    const transaction = await Transaction.create({
      user: req.user._id, // this is what ties the new document to the logged-in user
      type,
      category,
      amount,
      description,
      date,
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while creating transaction" });
  }
};

// Update a transaction
//put

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found " });

    //Only the person who created this transaction can update it
    if (transaction.user.toString() != req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this transaction" });
    }

    const { type, category, amount, description, date } = req.body;

    // Update only provided fields, keep existing values if undefined
    transaction.type = type ?? transaction.type;
    transaction.category = category ?? transaction.category;
    transaction.amount = amount ?? transaction.amount;
    transaction.description = description ?? transaction.description;
    transaction.date = date ?? transaction.date;

    const updated = await transaction.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while updating transaction" });
  }
};

// Delete a transaction
//delete

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this transaction" });
    }

    await transaction.deleteOne();
    res.status(200).json({ message: "Transaction removed", id: req.params.id });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while deleting transaction" });
  }
};

export {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
