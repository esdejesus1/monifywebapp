import AuthForm from "./components/AuthForm";
import Home from "./Home";
import { useAuthState } from "./hooks/useAuth";



export default function App() {
  const { user } = useAuthState();
  return(
    <div>
      { user ? <Home/> : <AuthForm /> }
    </div>
  )
}