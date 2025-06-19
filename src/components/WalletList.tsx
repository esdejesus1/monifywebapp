import { useState } from "react";
import Card from "./Card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWalletData } from "../hooks/useWallet";
import { motion, AnimatePresence } from "framer-motion";

export const WalletList = () => {
  const { wallets } = useWalletData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

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

  const swipeConfidenceThreshold = 100;

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    { offset }: { offset: { x: number } }
  ) => {
    if (offset.x < -swipeConfidenceThreshold) {
      paginate("right");
    } else if (offset.x > swipeConfidenceThreshold) {
      paginate("left");
    }
  };

  const currentWallet = wallets[currentIndex];

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
          <ChevronLeft className="w-3 h-3 sm:w-5 sm:h-5"/>
        </button>
      )}

      {/* Animated Card */}
      <div className="flex justify-center ">
        <AnimatePresence custom={direction} mode="wait">
          {currentWallet && (
            <motion.div
              key={currentWallet.id}
              className="w-full max-w-md sm:max-w-lg h-[180px] sm:h-[340px]"
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
          <ChevronRight className="w-3 h-3 sm:w-5 sm:h-5"/>
        </button>
      )}
    </div>
  );
};
