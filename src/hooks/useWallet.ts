import { useState } from "react";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export const useWallet = () => {
  const [walletName, setWalletName] = useState("");
  const [balance, setBalance] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAuthState(auth);

  const handleCreateWallet = async () => {
    if (!user) {
      setError("User not authenticated");
      return { success: false };
    }

    if (!walletName || balance === "") {
      setError("Please fill out all fields");
      return { success: false };
    }

    setLoading(true);
    try {
      const walletRef = collection(db, "users", user.uid, "wallet");
      await addDoc(walletRef, {
        name: walletName,
        balance: Number(balance),
      });

      setWalletName("");
      setBalance("");
      setError(null);

      return { success: true };
    } catch (err: unknown) {
      console.error("Error adding wallet:", err);
      if (err instanceof Error) {
        setError("Failed to create wallet");
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const editWallet = async (
    id: string,
    updatedData: { name: string; balance: number }
  ): Promise<{ success: boolean }> => {
    if (!user) {
      setError("User not authenticated");
      return { success: false };
    }

    if (!updatedData.name || updatedData.balance === null || updatedData.balance === undefined) {
      setError("Please fill out all fields");
      return { success: false };
    }

    setLoading(true);
    try {
      const walletDocRef = doc(db, "users", user.uid, "wallet", id);
      await updateDoc(walletDocRef, {
        name: updatedData.name,
        balance: updatedData.balance,
      });
      setError(null);
      return { success: true };
    } catch (err: unknown) {
      console.error("Error updating wallet:", err);
      if (err instanceof Error) {
        setError("Failed to update wallet");
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteWallet = async (id: string): Promise<{ success: boolean }> => {
    if (!user) {
      setError("User not authenticated");
      return { success: false };
    }

    setLoading(true);
    try {
      const walletDocRef = doc(db, "users", user.uid, "wallet", id);
      await deleteDoc(walletDocRef);
      setError(null);
      return { success: true };
    } catch (err: unknown) {
      console.error("Error deleting wallet:", err);
      if (err instanceof Error) {
        setError("Failed to delete wallet");
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    walletName,
    setWalletName,
    balance,
    setBalance,
    handleCreateWallet,
    editWallet,
    deleteWallet,
    loading,
    error,
  };
};


// Add this to the bottom of useWallet.ts (or a new file)
import { useEffect } from "react";
import { onSnapshot, QuerySnapshot } from "firebase/firestore";

interface Wallet {
  id: string;
  name: string;
  balance: number;
  income: number;
  expense: number;
}

export const useWalletData = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) {
      setWallets([]);
      setLoading(false);
      return;
    }

    const walletRef = collection(db, "users", user.uid, "wallet");

    const unsubscribe = onSnapshot(
      walletRef,
      (snapshot: QuerySnapshot) => {
        const walletList: Wallet[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          income: 0,
          expense: 0,
          ...doc.data(),
        })) as Wallet[];
        setWallets(walletList);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch wallet data:", err);
        setError("Failed to fetch wallets");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { wallets, loading, error };
};
