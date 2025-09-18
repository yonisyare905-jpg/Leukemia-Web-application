import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function UnAuthenticatedRoute({children, redirectTo="/"}){

    const {isLoggedIn, isLoading}=useAuth();

    if(isLoading){
        return(
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 
                border-b-2 border-orange-500"></div>
            </div>
        )
    }

    if(isLoggedIn){
        return <Navigate to={redirectTo} replace/>
    }
    return children;
}