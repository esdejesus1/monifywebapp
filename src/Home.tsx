import Header from "./components/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useState } from "react";
import ModalWrapper from "./components/ModalWrapper";
import { useWallet, useWalletData } from "./hooks/useWallet";
import { WalletList } from "./components/WalletList";
import Dropdown from "./components/Dropdown";
import ExpenseList from "./components/ExpenseList";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useExpense } from "./hooks/useExpense";
import IncomeList from "./components/IncomeList";
import { useIncome } from "./hooks/useIncome";
import TransactionList from "./components/TransactionList";
import { useTransaction } from "./hooks/useTransaction";

function Home() {
  const [walletOpen, setWalletOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [expenseTypes, setExpenseTypes] = useState<{ id: string; name: string }[]>([]);
  const [incomeTypes, setIncomeTypes] = useState<{ id: string; name: string }[]>([]);
  const [user] = useAuthState(auth);
  const [transactionType, setTransactionType] = useState<string | null>(null);
  const { expenseAmount, setExpenseAmount, expenseUpdate, description, setDescription, date, setDate } = useExpense();
  const { incomeAmount, setIncomeAmount, incomeUpdate, description: incomeDescription, setDescription: incomeSetDescription, date: incomeDate, setDate: incomeSetDate } = useIncome();
  const [selectedExpense, setSelectedExpense] = useState<{ id: string; name: string } | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<{ id: string; name: string } | null>(null);
  const [selectedWallet, setSelectedwallet] = useState<{ id: string; name: string } | null>(null);
  const {
    transactions,
    deleteTransaction,
    fetchTransactions,
    editTransaction
  } = useTransaction();



  const transactionOptions = [
  { label: "Expense", value: "Expense" },
  { label: "Income", value: "Income" },
  ];


  const loadExpenses = useCallback(async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, "users", user.uid, "expenseList"));
    const types = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setExpenseTypes(types);
  }, [user]);

  const loadIncome = useCallback(async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, "users", user.uid, "incomeList"));
    const types = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setIncomeTypes(types);
  }, [user]);

  useEffect(() => {
    loadExpenses();
    loadIncome();
  }, [loadExpenses,loadIncome]);


  const {
    walletName,
    setWalletName,
    balance,
    setBalance,
    handleCreateWallet,
    loading,
    error
  } = useWallet();
  const {wallets} = useWalletData();

  const onWalletSubmit = async () => {
    const result = await handleCreateWallet();
    if (result.success) {
      setWalletOpen(false);
    }
  };

  const onTransactionSubmit = async () => {
    if (!selectedWallet) {
      alert("Please select a wallet.");
      return;
    }

    if (transactionType === "Expense") {
      if (!selectedExpense) {
        alert("Please select an expense type.");
        return;
      }

      const result = await expenseUpdate(selectedExpense.name, selectedWallet.id, selectedWallet.name);
      if (result.success) {
        setTransactionOpen(false);
        await fetchTransactions(); // refresh the list
      }
    }

    if (transactionType === "Income") {
      if (!selectedIncome) {
        alert("Please select an income type.");
        return;
      }

      const result = await incomeUpdate(selectedIncome.name, selectedWallet.id, selectedWallet.name);
      if (result.success) {
        setTransactionOpen(false);
        await fetchTransactions(); // refresh the list
      }
    }
  };

  

  // const totalBalance = wallets.reduce(
  //   (acc, wallet) => acc + (wallet.balance || 0),
  //   0
  // );

  return (
    <div className="flex flex-col min-h-screen w-screen text-white text-center">
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-10 ">

        <Header title="Home" />

        {/* Wallets Header */}
        <div className="flex justify-between items-center px-4 py-4 sm:px-6 md:px-10">
          <h3 className="text-2xl sm:text-3xl font-bold">Wallets</h3>
          <FontAwesomeIcon
            icon={faPlus}
            size="lg"
            className="cursor-pointer hover:text-blue-400 transition-colors"
            onClick={() => setWalletOpen(true)}
          />
        </div>

        {/* Wallet Cards Carousel */}
        <WalletList />

        {/* Recent Transactions Header */}
        <div className="flex justify-between items-center px-4 mt-15 sm:px-6 md:px-10">
          <h3 className="text-xl sm:text-2xl font-bold">Recent Transactions</h3>
          <FontAwesomeIcon 
          icon={faPlus} 
          size="lg" 
          className="cursor-pointer hover:text-blue-400 transition-colors" 
          onClick={() => setTransactionOpen(true)}
          />
        </div>

        <TransactionList
          transactions={transactions}
          deleteTransaction={deleteTransaction}
          editTransaction={editTransaction}
        />


        {/* Wallet Modal */}
        <ModalWrapper open={walletOpen} onClose={() => setWalletOpen(false)}>
          <h2 className="text-2xl font-bold mb-4 text-black text-center">
            Create Wallet
          </h2>

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
            onClick={onWalletSubmit}
          >
            {loading ? "Creating..." : "Submit"}
          </button>
        </ModalWrapper>

        {/* Transaction Modal */}
        <ModalWrapper open={transactionOpen} onClose={() => setTransactionOpen(false)}>
          <h2 className="text-2xl font-bold mb-4 text-black text-center">
            Create Transaction
          </h2>

          <div className="flex flex-col gap-3 py-2">
            <label className="text-lg font-bold text-black text-left">Transaction Type</label>
            <Dropdown
              items={transactionOptions}
              onSelect={(val) => {
                setTransactionType(val);
              }}
            />
          </div>

          <div className="flex flex-col gap-3 py-2">
            <label className="text-lg font-bold text-black text-left">Select Wallet</label>
            <Dropdown
              items={wallets.map(w => ({ label: w.name, value: w.id }))}
              onSelect={(walletId) => {
                const found = wallets.find(w => w.id === walletId) ?? null;
                setSelectedwallet(found);
              }}
            />
          </div>
          
          {transactionType === "Expense" && (
            <div className="flex flex-col gap-3 py-2">
              <label className="text-lg font-bold text-black text-left">Expense Type</label>
              <ExpenseList
                items={expenseTypes}
                onSelect={(item) => setSelectedExpense(item)}
                onNewItemAdded={() => {
                  loadExpenses();
                }}
              />
            </div>
          )}

          {transactionType === "Income" && (
            <div className="flex flex-col gap-3 py-2">
              <label className="text-lg font-boldd text-black text-left">Income Type</label>
              <IncomeList
                items={incomeTypes}
                onSelect={(item) => setSelectedIncome(item)}
                onNewItemAdded={() => {
                  loadIncome();
                }}
              />
            </div>
          )}

          <div className="flex flex-col gap-3 py-2">
            <label className="text-lg font-bold text-black text-left">Amount</label>
            <input
              className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
              placeholder="Enter balance"
              type="number"
              value={transactionType === 'Expense' ? expenseAmount : incomeAmount}
              onChange={transactionType === 'Expense' ? (e) => setExpenseAmount(Number(e.target.value))
                : (e) => setIncomeAmount(Number(e.target.value))
              }
            />
          </div>

          <div className="flex flex-col gap-3 py-2">
            <label className="text-lg font-bold text-black text-left">Date</label>
            <input
              className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
              type="date"
              value={transactionType === 'Expense' ? date : incomeDate}
              onChange={transactionType === 'Expense' ? (e) => setDate(e.target.value)
                : (e) => incomeSetDate(e.target.value)
              }
            />
          </div>

          <div className="flex flex-col gap-3 py-2">
            <label className="text-lg font-bold text-black text-left">Description</label>
            <input
              className="text-black outline-2 w-full rounded-lg px-3 py-2 border border-gray-300"
              placeholder="Enter description"
              type="text"
              maxLength={10}
              value={transactionType === 'Expense' ? description : incomeDescription}
              onChange={transactionType === 'Expense' ? (e) => setDescription(e.target.value)
                : (e) => incomeSetDescription(e.target.value)
              }
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md mt-4 mx-auto block"
            disabled={loading}
            onClick={onTransactionSubmit}
          >
            {loading ? "Creating..." : "Submit"}
          </button>
        </ModalWrapper>
      </div>
    </div>
  );
}

export default Home;
