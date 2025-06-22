import { useState } from "react";
import Card from "./Card";
import ModalWrapper from "./ModalWrapper";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useWallet, useWalletData } from "../hooks/useWallet";
import { motion, AnimatePresence } from "framer-motion";

export const WalletList = () => {
  const { wallets } = useWalletData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const [walletOpen, setWalletOpen] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);

  const {
    walletName,
    setWalletName,
    balance,
    setBalance,
    editWallet,
    deleteWallet,
    loading,
    error,
  } = useWallet();

  const paginate = (newDirection: "left" | "right") => {
    setDirection(newDirection);
    setCurrentIndex((prev) =>
      newDirection === "right"
        ? (prev + 1) % wallets.length
        : prev === 0
        ? wallets.length - 1
        : prev - 1
    );
  };

  const currentWallet = wallets[currentIndex];

  const openEditModal = (walletId: string, name: string, bal: number) => {
    setEditingWalletId(walletId);
    setWalletName(name);
    setBalance(bal);
    setWalletOpen(true);
  };

  const handleWalletSubmit = async () => {
    if (editingWalletId) {
      const result = await editWallet(editingWalletId, {
        name: walletName,
        balance: Number(balance),
      });
      if (result.success) {
        setWalletOpen(false);
      }
    }
  };

  const handleDelete = async (walletId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this wallet?");
    if (confirmed) {
      const res = await deleteWallet(walletId);
      if (!res.success) {
        alert("Failed to delete wallet.");
      }
    }
  };

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    { offset }: { offset: { x: number } }
  ) => {
    if (offset.x < -100) paginate("right");
    else if (offset.x > 100) paginate("left");
  };

  const variants = {
    enter: (direction: string) => ({
      x: direction === "right" ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: string) => ({
      x: direction === "right" ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full max-w-xl mx-auto px-2 sm:px-6 py-4">
      {/* Left Arrow */}
      {wallets.length > 1 && (
        <button
          onClick={() => paginate("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full"
        >
          <ChevronLeft className="w-3 h-3 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Animated Card */}
      <div className="flex justify-center">
        <AnimatePresence custom={direction} mode="wait">
          {currentWallet && (
            <motion.div
              key={currentWallet.id}
              className="relative w-full max-w-md sm:max-w-lg h-[180px] sm:h-[340px]"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              {/* Edit/Delete Buttons */}
              <div className="absolute top-2 right-3 z-20 flex space-x-3">
                <button
                  onClick={() =>
                    openEditModal(currentWallet.id, currentWallet.name, currentWallet.balance)
                  }
                  className="text-blue-500 hover:text-blue-400 transition"
                  title="Edit Wallet"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => handleDelete(currentWallet.id)}
                  className="text-red-500 hover:text-red-400 transition"
                  title="Delete Wallet"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <Card
                name={currentWallet.name}
                total={currentWallet.balance || 0}
                income={currentWallet.income || 0}
                expense={currentWallet.expense || 0}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Arrow */}
      {wallets.length > 1 && (
        <button
          onClick={() => paginate("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-1 sm:p-2"
        >
          <ChevronRight className="w-3 h-3 sm:w-5 sm:h-5" />
        </button>
      )}

      {/* Edit Wallet Modal */}
      <ModalWrapper open={walletOpen} onClose={() => setWalletOpen(false)}>
        <h2 className="text-2xl font-bold mb-4 text-black text-center">Edit Wallet</h2>

        <div className="flex flex-col gap-3 py-2">
          <label className="text-lg font-bold text-black text-left">Wallet Name</label>
          <input
            className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
            placeholder="Enter name"
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 py-2">
          <label className="text-lg font-bold text-black text-left">Balance</label>
          <input
            className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
            placeholder="Enter balance"
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-md mt-4 mx-auto block"
          disabled={loading}
          onClick={handleWalletSubmit}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </ModalWrapper>
    </div>
  );
};
