import { useState } from "react";
import { useAuth } from "../hooks/useAuth";




export default function AuthForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const { signUp: signUpUser, login: loginUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleRegister = async() => {
        if (!email || !password || !name) {
            alert("Please fill all the fields!");
            return;
        }
        setLoading(true);
        const res = await signUpUser(
            email,
            password,
            name,
        );
        if(!res) return;
        setLoading(false);
        if(!res.success){
            alert(res.msg ?? "Unknown error");
        } else {
            alert('Successfully Registered!');
        }
        
    }

    const handleLogin = async() => {
        if(!email || !password) {
            alert("Please fill all the fields");
            return;
        }
        setLoading(true);
        const res = await loginUser(
            email,
            password
        );
        if(!res) return;
        setLoading(false);
        if(!res.success) {
            alert(res.msg ?? 'Unknown error');
        } else {
            alert('Logged In!');
        }
    }

    return (
        <div className="p-8 text-white items-center absolute inset-0 flex tracking-[.2em]">
            <div className="mx-auto space-y-12">
                <h1 className="text-3xl font-bold text-center"> Welcome to Monify! </h1>
                <div className="flex flex-row">
                    <h3 className="text-1xl text-left font-bold basis-32"> Email </h3>  
                    <input
                        type="email"
                        placeholder="Enter email..."
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full border"
                    />
                </div>
                <div className="flex flex-row">
                    <h3 className="text-1xl text-left font-bold basis-32"> Name </h3>  
                    <input
                        type="name"
                        placeholder="Enter name..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border"
                    />
                </div>
                <div className="flex flex-row">
                    <h3 className="text-1xl text-left font-bold basis-32"> Password </h3>
                    <input
                        type="password"
                        placeholder="Enter password..."
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full border"
                    />
                </div>
                <div className="flex flex-row gap-8">
                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className="flex-1"
                    >
                        Sign Up
                    </button>
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="flex-1"
                    >
                        Sign In
                    </button>

                </div>
            </div>
        </div>
    )
};
