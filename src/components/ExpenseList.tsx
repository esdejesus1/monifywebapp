import { useState } from "react";
import { useExpense } from "../hooks/useExpense";
import { Trash2 } from "lucide-react";

type ExpenseItem = {
  id: string;
  name: string;
};

const ExpenseList = ({
  items,
  onSelect,
  onNewItemAdded,
}: {
  items: ExpenseItem[];
  onSelect: (item: { id: string; name: string }) => void;
  onNewItemAdded: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>("Select Option");
  const [showModal, setShowModal] = useState(false);

  const {
    expenseType,
    setExpenseType,
    loading,
    error,
    handleCreateExpenseType,
    handleDeleteExpenseType,
  } = useExpense();

  const handleSelect = (item: ExpenseItem) => {
    setSelected(item.name);
    setIsOpen(false);
    onSelect(item);
  };

  const handleAddItem = async () => {
    const result = await handleCreateExpenseType();
    if (result.success) {
      setShowModal(false);
      onNewItemAdded();
    }
  };

  return (
    <div className="relative w-full">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black border border-gray-300 text-white py-2 px-4 rounded-md text-left"
      >
        {selected}
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <ul className="absolute w-full bg-black border mt-1 rounded shadow z-10 max-h-60 overflow-y-auto">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center p-2 hover:bg-gray-700 text-white"
            >
              <span
                onClick={() => handleSelect(item)}
                className="cursor-pointer flex-1 text-left pl-3"
              >
                {item.name}
              </span>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const res = await handleDeleteExpenseType(item.id);
                  if (res.success) {
                    onNewItemAdded();
                  }
                }}
                className="ml-2 text-red-500 hover:text-red-300"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
          <li
            onClick={() => {
              setShowModal(true);
              setIsOpen(false);
            }}
            className="p-2 hover:bg-gray-700 cursor-pointer text-green-400 border-t border-gray-500"
          >
            + Add new expense type
          </li>
        </ul>
      )}

      {/* Add New Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Add New Expense Type
            </h2>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded mb-2 text-black"
              placeholder="e.g. Food"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
            />
            {error && (
              <p className="text-red-500 text-sm mb-2">{error}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleAddItem}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
