// Route guard component for authenticated routes
import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { userData } = useSelector((state) => state.user)

  if (!userData) {
    return <Navigate to="/auth" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/home" replace />
  }

  return children
}

export default ProtectedRoute
