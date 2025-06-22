import { DollarSign, Coins, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import Dropdown from "./Dropdown";
import ExpenseList from "./ExpenseList";
import IncomeList from "./IncomeList";
import { useExpense } from "../hooks/useExpense";
import { useIncome } from "../hooks/useIncome";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useWalletData } from "../hooks/useWallet";

type Transaction = {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  walletName: string;
  description: string;
  date: string;
};

type Props = {
  transactions: Transaction[];
  deleteTransaction: (id: string, type: "income" | "expense") => Promise<void>;
  editTransaction: (updatedTransaction: Transaction) => Promise<{ success: boolean } | undefined>;
};

const TransactionList = ({
  transactions,
  deleteTransaction,
  editTransaction,
}: Props) => {
  const [user] = useAuthState(auth);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [expenseTypes, setExpenseTypes] = useState<{ id: string; name: string }[]>([]);
  const [incomeTypes, setIncomeTypes] = useState<{ id: string; name: string }[]>([]);
  const { wallets } = useWalletData();

  const {
    expenseAmount,
    setExpenseAmount,
    description,
    setDescription,
    date,
    setDate,
  } = useExpense();

  const {
    incomeAmount,
    setIncomeAmount,
    description: incomeDescription,
    setDescription: setIncomeDescription,
    date: incomeDate,
    setDate: setIncomeDate,
  } = useIncome();

  const [transactionType, setTransactionType] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<{ id: string; name: string } | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<{ id: string; name: string } | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<{ id: string; name: string } | null>(null);

  const loadExpenses = useCallback(async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, "users", user.uid, "expenseList"));
    const types = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    setExpenseTypes(types);
  }, [user]);

  const loadIncome = useCallback(async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, "users", user.uid, "incomeList"));
    const types = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
    setIncomeTypes(types);
  }, [user]);

  useEffect(() => {
    loadExpenses();
    loadIncome();
  }, [loadExpenses, loadIncome]);

  const handleDelete = async (tx: Transaction) => {
    const confirm = window.confirm("Are you sure you want to delete this transaction?");
    if (confirm) {
      await deleteTransaction(tx.id, tx.type);
    }
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTransactionOpen(true);
    setTransactionType(tx.type === "income" ? "Income" : "Expense");

    const wallet = wallets.find(w => w.name === tx.walletName) || null;
    setSelectedWallet(wallet);

    if (tx.type === "expense") {
      setSelectedExpense({ id: "", name: tx.category });
      setExpenseAmount(tx.amount);
      setDescription(tx.description);
      setDate(tx.date);
    } else {
      setSelectedIncome({ id: "", name: tx.category });
      setIncomeAmount(tx.amount);
      setIncomeDescription(tx.description);
      setIncomeDate(tx.date);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingTransaction || !selectedWallet) return;

    const updatedTransaction: Transaction = {
      ...editingTransaction,
      type: transactionType === "Income" ? "income" : "expense",
      category:
        transactionType === "Income"
          ? selectedIncome?.name || ""
          : selectedExpense?.name || "",
      amount: transactionType === "Income" ? incomeAmount : expenseAmount,
      walletName: selectedWallet.name,
      description: transactionType === "Income" ? incomeDescription : description,
      date: transactionType === "Income" ? incomeDate : date,
    };

    await editTransaction(updatedTransaction);
    setTransactionOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="p-2">
      <ul className="space-y-1">
        {transactions.map((tx) => (
          <li
            key={tx.id}
            className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900 text-white"
          >
            <div className="flex items-center gap-3">
              {tx.type === "income" ? (
                <DollarSign className="text-green-500 w-5 h-5" />
              ) : (
                <Coins className="text-red-500 w-5 h-5" />
              )}
              <div className="text-sm leading-tight">
                <p className="font-medium">
                  {tx.category}{" "}
                  <span className="text-xs text-gray-400">({tx.type})</span>
                </p>
                <p className="text-left text-xs text-gray-400">{tx.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    tx.type === "income" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  ₱{tx.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(tx.date).toLocaleDateString()}
                </p>
              </div>

              <button onClick={() => handleEditClick(tx)} title="Edit">
                <Pencil className="w-4 h-4 text-blue-400 hover:text-blue-500" />
              </button>
              <button onClick={() => handleDelete(tx)} title="Delete">
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal for Editing */}
      {transactionOpen && (
        <ModalWrapper open={transactionOpen} onClose={() => setTransactionOpen(false)}>
          <h2 className="text-2xl font-bold mb-4 text-black text-center">Edit Transaction</h2>

          <div className="flex flex-col gap-3 py-2">
            <label className="text-lg font-bold text-black text-left">Transaction Type</label>
            <Dropdown
              items={[
                { label: "Expense", value: "Expense" },
                { label: "Income", value: "Income" },
              ]}
              onSelect={(val) => setTransactionType(val)}
              selected={transactionType || undefined}
            />
          </div>

          <div className="flex flex-col gap-3 py-2">
            <label className="text-lg font-bold text-black text-left">Select Wallet</label>
            <Dropdown
              items={wallets.map(w => ({ label: w.name, value: w.id }))}
              onSelect={(walletId) => {
                const found = wallets.find(w => w.id === walletId) ?? null;
                setSelectedWallet(found);
              }}
              selected={selectedWallet?.id}
            />
          </div>

          {transactionType === "Expense" && (
            <div className="flex flex-col gap-3 py-2">
              <label className="text-lg font-bold text-black text-left">Expense Type</label>
              <ExpenseList
                items={expenseTypes}
                onSelect={(item) => setSelectedExpense(item)}
                onNewItemAdded={loadExpenses}
                selected={selectedExpense}
              />
            </div>
          )}

          {transactionType === "Income" && (
            <div className="flex flex-col gap-3 py-2">
              <label className="text-lg font-bold text-black text-left">Income Type</label>
              <IncomeList
                items={incomeTypes}
                onSelect={(item) => setSelectedIncome(item)}
                onNewItemAdded={loadIncome}
                selected={selectedIncome}
              />
            </div>
          )}


          <div className="flex flex-col gap-3 py-2">
            <label className="text-lg font-bold text-black text-left">Amount</label>
            <input
              className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
              type="number"
              value={transactionType === "Expense" ? expenseAmount : incomeAmount}
              onChange={
                transactionType === "Expense"
                  ? (e) => setExpenseAmount(Number(e.target.value))
                  : (e) => setIncomeAmount(Number(e.target.value))
              }
            />
          </div>

          <div className="flex flex-col gap-3 py-2">
            <label className="text-lg font-bold text-black text-left">Date</label>
            <input
              className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
              type="date"
              value={transactionType === "Expense" ? date : incomeDate}
              onChange={
                transactionType === "Expense"
                  ? (e) => setDate(e.target.value)
                  : (e) => setIncomeDate(e.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-3 py-2">
            <label className="text-lg font-bold text-black text-left">Description</label>
            <input
              className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
              type="text"
              maxLength={50}
              value={transactionType === "Expense" ? description : incomeDescription}
              onChange={
                transactionType === "Expense"
                  ? (e) => setDescription(e.target.value)
                  : (e) => setIncomeDescription(e.target.value)
              }
            />
          </div>

          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md mt-4 mx-auto block"
            onClick={handleEditSubmit}
          >
            Save Changes
          </button>
        </ModalWrapper>
      )}
    </div>
  );
};

export default TransactionList;
