import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, deleteDoc, doc, increment, updateDoc } from "firebase/firestore";


// Goal is to have a customizable expense type
export const useExpense = () => {
    const [expenseType, setExpenseType] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ user ] = useAuthState(auth);
    const [expenseAmount, setExpenseAmount] = useState(0);
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");

    const handleCreateExpenseType = async () => {
        if(!user) {
            setError("User not authenticated");
            return {success: false};
        }

        if (!expenseType) {
            setError("Please fill out all the fields");
            return { success: false };
        }

        setLoading(true);
        try {
            const expenseTypeRef = collection(db, 'users', user.uid, 'expenseList');
            await addDoc(expenseTypeRef, {
                name: expenseType,
            });

            // Reset fields
            setExpenseType("");
            setError(null);

            return {success: true};
        } catch(err:unknown) {
            if (err instanceof Error) {
                setError("Failed to create expense type");
            } 
            return {success: false};
        } finally {
                setLoading(false);
        }
    }

    const expenseUpdate = async (expenseType: string, walletId: string, walletType: string) => {
        if (!user) {
            setError("User not authenticated");
            return { success: false };
        }

        setLoading(true);
        try {
            // 1. Update expense collection in db
            const expenseRef = collection(db, "users", user.uid, "expenses");
            await addDoc(expenseRef, {
                expenseType: expenseType,
                amount: expenseAmount,
                walletName: walletType,
                description,
                date,
            });

            // 2. Update wallet
            const walletDocRef = doc(db, "users", user.uid, "wallet", walletId);
            await updateDoc(walletDocRef, {
                expense: increment(expenseAmount),
                balance: increment(-expenseAmount)
            });

            setExpenseAmount(0);
            setDescription("");
            setDate("");
            setError(null);

            return { success: true };
        } catch (err: unknown) {
            if (err instanceof Error) {
            setError("Failed to update expense amount");
            }
            return { success: false };
        } finally {
            setLoading(false);
        }
    };



    const handleDeleteExpenseType = async(id: string) => {
        if (!user) {
            setError("User not authenticated");
            return {success: false};
        }

        if (!id) {
            setError("No expense type ID provided");
            return {success: false};
        }

        setLoading(true);
        try {
            const docRef = doc(db, 'users', user.uid, 'expenses', id);
            await deleteDoc(docRef);
            setError(null);
            return {success: true};
        } catch (err:unknown) {
            if (err instanceof Error) {
                setError("Failed to delete expense type");
            }
            return { success: false};
        } finally {
            setLoading(false);
        }
    };

    
    return {
        expenseType,
        setExpenseType,
        expenseAmount,
        setExpenseAmount,
        loading,
        error,
        handleCreateExpenseType,
        handleDeleteExpenseType,
        expenseUpdate,
        date,
        setDate,
        description,
        setDescription
    }
}


