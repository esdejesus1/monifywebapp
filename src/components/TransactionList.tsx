import { DollarSign, Coins, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

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
};

const TransactionList = ({ transactions, deleteTransaction }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = async (tx: Transaction) => {
    const confirm = window.confirm("Are you sure you want to delete this transaction?");
    if (confirm) {
      await deleteTransaction(tx.id, tx.type);
    }
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

              <button onClick={() => setEditingId(tx.id)} title="Edit">
                <Pencil className="w-4 h-4 text-blue-400 hover:text-blue-500" />
              </button>
              <button onClick={() => handleDelete(tx)} title="Delete">
                <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editingId && (
        <div className="mt-4 p-3 border border-gray-300 rounded bg-white text-sm">
          <p className="mb-2 text-gray-700">
            Editing transaction ID: <code>{editingId}</code>
          </p>
          <button
            className="text-blue-500 underline hover:text-blue-700"
            onClick={() => setEditingId(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
