// Custom hook for authentication state and actions
import { useSelector, useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"
import axios from "axios"
import { serverUrl } from "../config"

const useAuth = () => {
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)

  const isAuthenticated = !!userData
  const isChef = userData?.role === "HomeCook"
  const isCustomer = userData?.role === "Customer"

  const logout = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/signOut`, {}, { withCredentials: true })
      dispatch(setUserData(null))
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return {
    user: userData,
    isAuthenticated,
    isChef,
    isCustomer,
    logout
  }
}

export default useAuth
