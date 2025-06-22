import { useEffect, useState, useCallback } from "react";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

type Transaction = {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  walletName: string;
  description: string;
  date: string;
};

export const useTransaction = () => {
  const [user] = useAuthState(auth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const incomeSnap = await getDocs(collection(db, "users", user.uid, "income"));
      const expenseSnap = await getDocs(collection(db, "users", user.uid, "expenses"));

      const incomeData = incomeSnap.docs.map(doc => ({
        id: doc.id,
        type: "income" as const,
        category: doc.data().incomeType,
        amount: doc.data().amount,
        walletName: doc.data().walletName,
        description: doc.data().description,
        date: doc.data().date,
      }));

      const expenseData = expenseSnap.docs.map(doc => ({
        id: doc.id,
        type: "expense" as const,
        category: doc.data().expenseType,
        amount: doc.data().amount,
        walletName: doc.data().walletName,
        description: doc.data().description,
        date: doc.data().date,
      }));

      const allTransactions = [...incomeData, ...expenseData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(allTransactions);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Failed to fetch transactions");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteTransaction = async (id: string, type: "income" | "expense") => {
    if (!user) return;

    const col = type === "income" ? "income" : "expenses";
    const docRef = doc(db, "users", user.uid, col, id);
    await deleteDoc(docRef);

    await fetchTransactions(); // refresh after deletion
  };

  const editTransaction = async(updatedTransaction: Transaction) => {
    if(!user) return;

    const col = updatedTransaction.type === 'income' ? 'income' : 'expenses';
    const docRef = doc(db, 'users', user.uid, col, updatedTransaction.id);

    try {
      const updatedData = 
        updatedTransaction.type === 'income'
        ? {
          incomeType: updatedTransaction.category,
          amount: updatedTransaction.amount,
          walletName: updatedTransaction.walletName,
          description: updatedTransaction.description,
          date: updatedTransaction.date,
        }
        : {
          expenseType: updatedTransaction.category,
          amount: updatedTransaction.amount,
          walletName: updatedTransaction.walletName,
          description: updatedTransaction.description,
          date: updatedTransaction.date,
        };

        await updateDoc(docRef, updatedData);
        await fetchTransactions();
        return {success: true}
    } catch (err:unknown) {
      if (err instanceof Error) {
        setError("Failed to update transaction");
      }
      return {success: false}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, deleteTransaction, editTransaction, loading, error, fetchTransactions };
};
