import { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import Dropdown from "./Dropdown";
import ExpenseList from "./ExpenseList";
import IncomeList from "./IncomeList";

type TransactionType = "Income" | "Expense";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    walletId: string;
    walletName: string;
    category: string;
    amount: number;
    date: string;
    description: string;
  }) => void;
  wallets: { id: string; name: string }[];
  incomeTypes: { id: string; name: string }[];
  expenseTypes: { id: string; name: string }[];
  initialData?: {
    type: "income" | "expense";
    walletId: string;
    walletName: string;
    category: string;
    amount: number;
    date: string;
    description: string;
  };
  loadIncome: () => void;
  loadExpenses: () => void;
};

export default function TransactionModal({
  open,
  mode,
  onClose,
  onSubmit,
  wallets,
  incomeTypes,
  expenseTypes,
  initialData,
  loadIncome,
  loadExpenses,
}: Props) {
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<{ id: string; name: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>("");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTransactionType(initialData.type === "income" ? "Income" : "Expense");
      setSelectedWallet({ id: initialData.walletId, name: initialData.walletName });
      setSelectedCategory(initialData.category);
      setAmount(initialData.amount);
      setDate(initialData.date);
      setDescription(initialData.description);
    } else if (mode === "create") {
      setTransactionType(null);
      setSelectedWallet(null);
      setSelectedCategory(undefined)
      setAmount(0);
      setDate("");
      setDescription("");
    }
  }, [mode, initialData]);

  const handleSubmit = () => {
    if (!transactionType || !selectedWallet || !selectedCategory || !date || !description) {
      alert("Please fill all required fields.");
      return;
    }

    onSubmit({
      type: transactionType,
      walletId: selectedWallet.id,
      walletName: selectedWallet.name,
      category: selectedCategory,
      amount,
      date,
      description,
    });
  };

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <h2 className="text-2xl font-bold mb-4 text-black text-center">
        {mode === "edit" ? "Edit Transaction" : "Create Transaction"}
      </h2>

      {/* Transaction Type */}
      <div className="flex flex-col gap-3 py-2">
        <label className="text-lg font-bold text-black text-left">Transaction Type</label>
        <Dropdown
          items={[
            { label: "Expense", value: "Expense" },
            { label: "Income", value: "Income" },
          ]}
          onSelect={(val) => setTransactionType(val as TransactionType)}
          defaultValue={transactionType ?? undefined}
        />
      </div>

      {/* Wallet */}
      <div className="flex flex-col gap-3 py-2">
        <label className="text-lg font-bold text-black text-left">Select Wallet</label>
        <Dropdown
          items={wallets.map((w) => ({ label: w.name, value: w.id }))}
          onSelect={(walletId) => {
            const found = wallets.find((w) => w.id === walletId) ?? null;
            setSelectedWallet(found);
          }}
          defaultValue={selectedWallet?.id}
        />
      </div>

      {/* Income / Expense Type */}
      {transactionType === "Expense" && (
        <div className="flex flex-col gap-3 py-2">
          <label className="text-lg font-bold text-black text-left">Expense Type</label>
          <ExpenseList
            items={expenseTypes}
            onSelect={(item) => setSelectedCategory(item.name)}
            onNewItemAdded={loadExpenses}
            selected={selectedCategory}
          />
        </div>
      )}
      {transactionType === "Income" && (
        <div className="flex flex-col gap-3 py-2">
          <label className="text-lg font-bold text-black text-left">Income Type</label>
          <IncomeList
            items={incomeTypes}
            onSelect={(item) => setSelectedCategory(item.name)}
            onNewItemAdded={loadIncome}
            selected={selectedCategory}
          />
        </div>
      )}

      {/* Amount */}
      <div className="flex flex-col gap-3 py-2">
        <label className="text-lg font-bold text-black text-left">Amount</label>
        <input
          className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-3 py-2">
        <label className="text-lg font-bold text-black text-left">Date</label>
        <input
          className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-3 py-2">
        <label className="text-lg font-bold text-black text-left">Description</label>
        <input
          className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
          type="text"
          maxLength={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Submit */}
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded-md mt-4 mx-auto block"
        onClick={handleSubmit}
      >
        {mode === "edit" ? "Update" : "Submit"}
      </button>
    </ModalWrapper>
  );
}
