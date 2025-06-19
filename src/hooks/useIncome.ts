import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, deleteDoc, doc, increment, updateDoc } from "firebase/firestore";


export const useIncome = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ incomeType, setIncomeType ] = useState("");
    const [ user ] = useAuthState(auth);
    const [ incomeAmount, setIncomeAmount ] = useState(0);
    const [ description, setDescription ] = useState("");
    const [ date, setDate ] = useState("");

    const handleCreateIncomeType = async() => {
        
        if(!user) {
            setError("User not authenticated");
            return { success: false };
        }

        if(!incomeType) {
            setError("Please fill out all the fields");
            return { success: false};
        }

        setLoading(true);
        try {
            const incomeTypeRef = collection(db, 'users', user.uid, 'incomeList');
            await addDoc(incomeTypeRef, {
                name: incomeType
            });

            // Reset fields
            setIncomeType("");
            setError(null);

            return { success: true };
        } catch(err: unknown) {
            if (err instanceof Error) {
                setError("Failed to create expense type")
            }

            return { success: false };
        }  finally {
            setLoading(false);
        }
    }

    const incomeUpdate = async(incomeType: string, walletId: string, walletType: string) => {
        if (!user) {
            setError("User not authenticated");
            return { success: false };
        }

        setLoading(true);

        try {
            // 1. Update income collection in db
            const incomeRef = collection(db, 'users', user.uid, 'income');
            await addDoc(incomeRef, {
                incomeType: incomeType,
                amount: increment(incomeAmount),
                walletName: walletType,
                description,
                date,
            });

            // 2. Update wallet
            const walletRef = doc(db, 'users', user.uid, 'wallet', walletId);
            await updateDoc(walletRef, {
                income: increment(incomeAmount),
                balance: increment(incomeAmount),
            });

            setIncomeAmount(0);
            setDescription("");
            setDate("");
            setError(null);

            return { success: true };
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError("Failed to update income");
            }
            return { success: false} 
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteIncome = async(id: string) => {
        if(!user) {
            setError("User not authenticated");
            return { success: false }
        }

        if(!id) {
            setError("No income type ID provided");
            return { success: false };
        };

        setLoading(true);
        try {
            const docRef = doc(db, 'users', user.uid, 'income', id);
            await deleteDoc(docRef);
            setError(null);
            return { success: true };
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError("Failed to delete income type");
            }
            return { success: false};
        } finally {
            setLoading(false);
        }
    }

    return {
        incomeType,
        setIncomeType,
        incomeAmount,
        setIncomeAmount,
        loading,
        error,
        handleCreateIncomeType,
        handleDeleteIncome,
        incomeUpdate,
        date,
        description,
        setDate,
        setDescription
    }
}