// hooks/useWallet.ts
import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, QuerySnapshot } from "firebase/firestore";
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

      // Reset fields
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


  return {
    walletName,
    setWalletName,
    balance,
    setBalance,
    handleCreateWallet,
    loading,
    error,
  };
};

interface Wallet {
  id: string;
  name: string;
  balance: number;
  expense: number;
  income: number;
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
