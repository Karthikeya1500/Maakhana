

export interface IkyjGxCGRProps {
    id?: string;
}
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateQuantityAPI, removeFromCartAPI, placeOrderAPI } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'

const Cart = () => {
    const { cartItems, totalAmount, userData, cartLoading } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [coupon, setCoupon] = useState('')
    const [updatingId, setUpdatingId] = useState(null)
    const [placing, setPlacing] = useState(false)

    const TAX_RATE = 0.05
    const tax = +(totalAmount * TAX_RATE).toFixed(2)
    const grandTotal = +(totalAmount + tax).toFixed(2)

    const handleIncrease = async (item) => {
        setUpdatingId(item.id)
        try {
            await dispatch(updateQuantityAPI({ itemId: item.id, quantity: item.quantity + 1 })).unwrap()
        } catch (err) {
            console.error("Update quantity failed:", err)
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDecrease = async (item) => {
        setUpdatingId(item.id)
        try {
            if (item.quantity === 1) {
                await dispatch(removeFromCartAPI(item.id)).unwrap()
            } else {
                await dispatch(updateQuantityAPI({ itemId: item.id, quantity: item.quantity - 1 })).unwrap()
            }
        } catch (err) {
            console.error("Update quantity failed:", err)
        } finally {
            setUpdatingId(null)
        }
    }

    const handleRemove = async (itemId) => {
        setUpdatingId(itemId)
        try {
            await dispatch(removeFromCartAPI(itemId)).unwrap()
        } catch (err) {
            console.error("Remove item failed:", err)
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div
            className="bg-[#f8f7f6] text-slate-900 min-h-screen"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#f4a462]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <div className="text-[#f4a462]">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.1288 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-slate-900">Maakhana</span>
                        </div>

                        {/* Right: Continue Shopping + Avatar */}
                        <div className="flex items-center gap-6">
                            <button
                                className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#f4a462] transition-colors cursor-pointer"
                                onClick={() => navigate('/')}
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Continue Shopping
                            </button>
                            <div className="w-10 h-10 rounded-full bg-[#f4a462] border-2 border-[#f4a462]/20 flex items-center justify-center text-white font-bold text-sm shadow-md select-none">
                                {userData?.fullName?.slice(0, 1).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Main ── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Title */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        My Cart{' '}
                        <span className="text-[#f4a462] font-normal text-2xl ml-2">
                            ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                        </span>
                    </h1>
                </div>

                {cartLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <span className="material-symbols-outlined text-5xl text-[#f4a462] animate-spin mb-4">progress_activity</span>
                        <p className="text-slate-500 font-medium">Loading your cart...</p>
                    </div>
                ) : cartItems.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl shadow-sm border border-[#f4a462]/5">
                        <span className="material-symbols-outlined text-7xl text-[#f4a462]/40 mb-4">shopping_cart</span>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Your cart is empty</h3>
                        <p className="text-slate-400 mb-8">Add some delicious food to get started!</p>
                        <button
                            className="px-8 py-3 bg-[#f4a462] text-white font-bold rounded-xl hover:brightness-95 transition-all cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            Browse Food
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* ── Left: Cart Items ── */}
                        <div className="lg:col-span-2 space-y-6">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-xl p-6 shadow-sm border border-[#f4a462]/5 flex flex-col sm:flex-row items-center gap-6 group transition-opacity ${updatingId === item.id ? 'opacity-60' : ''}`}
                                >
                                    {/* Image */}
                                    <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 border border-[#f4a462]/10">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-[#f4a462]/10 flex items-center justify-center text-4xl">
                                                🍽️
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow space-y-1 text-center sm:text-left">
                                        <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                                        {item.chef && (
                                            <p className="text-slate-500 text-sm">
                                                Chef: <span className="text-[#f4a462]/80 font-medium">{item.chef}</span>
                                            </p>
                                        )}
                                        {/* Quantity Controls */}
                                        <div className="pt-4 flex items-center justify-center sm:justify-start gap-4">
                                            <div className="flex items-center bg-[#f8f7f6] rounded-full px-3 py-1 border border-[#f4a462]/10">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f4a462]/20 transition-colors cursor-pointer disabled:opacity-50"
                                                    onClick={() => handleDecrease(item)}
                                                    disabled={updatingId === item.id}
                                                >
                                                    <span className="material-symbols-outlined text-lg">remove</span>
                                                </button>
                                                <span className="w-8 text-center font-bold">{item.quantity}</span>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f4a462]/20 transition-colors text-[#f4a462] cursor-pointer disabled:opacity-50"
                                                    onClick={() => handleIncrease(item)}
                                                    disabled={updatingId === item.id}
                                                >
                                                    <span className="material-symbols-outlined text-lg">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price + Delete */}
                                    <div className="flex flex-col items-end justify-between self-stretch">
                                        <button
                                            className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                                            onClick={() => handleRemove(item.id)}
                                            disabled={updatingId === item.id}
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                        <p className="text-2xl font-black text-slate-900">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Right: Order Summary ── */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-28 space-y-6">
                                {/* Summary Card */}
                                <div className="bg-white rounded-xl p-8 shadow-xl shadow-[#f4a462]/5 border border-[#f4a462]/10">
                                    <h2 className="text-xl font-bold mb-6 text-slate-900 border-b border-[#f8f7f6] pb-4">
                                        Order Summary
                                    </h2>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-slate-600">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-slate-900">₹{totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>Delivery Fee</span>
                                            <span className="text-green-500 font-medium">FREE</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>Tax (GST 5%)</span>
                                            <span className="font-medium text-slate-900">₹{tax.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-4 border-t border-[#f8f7f6] flex justify-between items-center">
                                            <span className="text-lg font-bold">Total Amount</span>
                                            <span className="text-3xl font-black text-[#f4a462]">₹{grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Coupon */}
                                    <div className="mb-8">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                            Have a Coupon?
                                        </label>
                                        <div className="relative flex items-center">
                                            <input
                                                className="w-full bg-[#f8f7f6] border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-[#f4a462]/50 transition-all uppercase font-bold text-sm outline-none"
                                                placeholder="Enter code"
                                                type="text"
                                                value={coupon}
                                                onChange={(e) => setCoupon(e.target.value)}
                                            />
                                            <button className="absolute right-2 px-4 py-1.5 bg-[#f4a462] text-white text-xs font-bold rounded-md hover:bg-[#f4a462]/90 transition-colors cursor-pointer">
                                                APPLY
                                            </button>
                                        </div>
                                    </div>

                                    {/* Checkout Button */}
                                    <button
                                        className="w-full bg-[#f4a462] hover:bg-[#f4a462]/90 text-white py-4 rounded-xl font-black text-lg tracking-wide shadow-lg shadow-[#f4a462]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                        disabled={placing || cartItems.length === 0}
                                        onClick={async () => {
                                            setPlacing(true)
                                            try {
                                                await dispatch(placeOrderAPI({ paymentMethod: 'cod' })).unwrap()
                                                navigate('/my-orders')
                                            } catch (err) { console.error(err) }
                                            finally { setPlacing(false) }
                                        }}
                                    >
                                        {placing ? (<><span className="material-symbols-outlined animate-spin">progress_activity</span> Placing Order...</>) : (<>PLACE ORDER <span className="material-symbols-outlined">arrow_forward</span></>)}
                                    </button>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                                        <span className="material-symbols-outlined text-sm">verified_user</span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest">
                                            Secure Checkout Powered by Stripe
                                        </span>
                                    </div>
                                </div>

                                {/* Free Shipping Badge */}
                                <div className="bg-[#f4a462]/5 rounded-xl p-4 border border-[#f4a462]/10 flex gap-3 items-center">
                                    <div className="w-10 h-10 bg-[#f4a462]/20 rounded-full flex items-center justify-center flex-shrink-0 text-[#f4a462]">
                                        <span className="material-symbols-outlined">local_shipping</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600">
                                        You qualify for{' '}
                                        <span className="text-[#f4a462] font-bold">Free Shipping</span> on this order!
                                        Estimated delivery: 2–3 days.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-12 text-center text-slate-400 text-sm">
                <p>© 2024 Maakhana Premium Snacks. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default Cart


export interface IkyjGxCGRProps {
    id?: string;
}
