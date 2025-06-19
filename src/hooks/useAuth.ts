import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, } from "firebase/auth";
import { useEffect, useState } from "react"
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export  function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signUp = async(email:string, password:string, name:string) => {
        setLoading(true);
        setError(null);
        try{
            const userCreate = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCreate?.user;

            await setDoc(doc(db, 'users', user?.uid), {
                name,
                email,
                createdAt: new Date().toISOString(),
            })
            return {success: true};
        }catch(err:unknown){
            if(err instanceof Error) {
                setError(err.message);
                return {success: false, msg: err.message};
            }

        }
        setLoading(false);


    }

    const login = async(email:string, password:string) => {
        setLoading(true);
        setError(null);
        try{
            await signInWithEmailAndPassword(auth, email, password);
            return {success: true}
        }catch(err:unknown){
            if(err instanceof Error) {
                return {success: false, msg: err.message};
            }
        }
        setLoading(false);
    }


    return { signUp, login, loading, error };
    
};

interface ExtendedUser {
    uid: string,
    email: string,
    name: string
}

export function useAuthState() {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [loading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            const fetchUserData
             = async () => {
                if(firebaseUser) {
                    const docRef = doc(db, "users", firebaseUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email ?? "",
                            name: data.name ?? ""
                        })
                    } else{
                        setUser(null);
                    }
                }
            }
            fetchUserData();
        })

        return () => unsubscribe();
    }, []);

    return {user, loading};
};

