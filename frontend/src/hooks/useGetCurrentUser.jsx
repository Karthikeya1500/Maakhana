import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData, setAuthLoading, fetchCart } from '../redux/userSlice'

function useGetCurrentUser() {
  const dispatch = useDispatch()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
        dispatch(setUserData(result.data))
        // After user is fetched, load their cart from the database
        dispatch(fetchCart())
      } catch (error) {
        console.log(error)
      } finally {
        dispatch(setAuthLoading(false))
      }
    }
    fetchUser()
  }, [])
}

export default useGetCurrentUser
