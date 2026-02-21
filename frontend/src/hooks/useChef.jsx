// Custom hook for chef-specific operations
import { useSelector } from "react-redux"
import axios from "axios"
import { serverUrl } from "../config"

const useChef = () => {
  const { userData } = useSelector((state) => state.user)
  const chefData = useSelector((state) => state.chef?.chefData)

  const isChef = userData?.role === "HomeCook"
  const hasKitchen = !!chefData?.kitchenName

  const fetchChefOrders = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/order/chef-orders`, {
        withCredentials: true
      })
      return res.data
    } catch (error) {
      console.error("Failed to fetch chef orders:", error)
      return []
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await axios.put(
        `${serverUrl}/api/order/update-status/${orderId}`,
        { status },
        { withCredentials: true }
      )
      return res.data
    } catch (error) {
      console.error("Failed to update order:", error)
      throw error
    }
  }

  return {
    isChef,
    hasKitchen,
    chefData,
    fetchChefOrders,
    updateOrderStatus
  }
}

export default useChef
