import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyOrdersAPI, rateOrderAPI } from '../redux/userSlice'

const MyOrders = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { myOrders, ordersLoading } = useSelector(state => state.user)
    const [ratingOrder, setRatingOrder] = useState(null)
    const [ratingValue, setRatingValue] = useState(5)
    const [reviewText, setReviewText] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => { dispatch(fetchMyOrdersAPI()) }, [dispatch])

    const handleRate = async () => {
        if (!ratingOrder) return
        setSubmitting(true)
        try {
            await dispatch(rateOrderAPI({ orderId: ratingOrder, rating: ratingValue, review: reviewText })).unwrap()
            setRatingOrder(null)
            setRatingValue(5)
            setReviewText('')
        } catch (err) { console.error(err) }
        finally { setSubmitting(false) }
    }

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        preparing: 'bg-orange-100 text-orange-700',
        ready: 'bg-green-100 text-green-700',
        delivered: 'bg-emerald-100 text-emerald-700',
        cancelled: 'bg-red-100 text-red-700',
    }

    return (
        <div className="bg-[#f8f7f6] text-slate-900 min-h-screen" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#f4a462]/10 px-4 lg:px-8 py-3">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-[#f4a462] rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#221810] font-bold text-lg">restaurant</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight">Maakhana</span>
                    </div>
                    <button onClick={() => navigate('/')} className="bg-[#f4a462] text-white px-5 py-2 rounded-xl text-sm font-bold cursor-pointer">Back Home</button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
                <h1 className="text-3xl font-black mb-8">My Orders</h1>

                {ordersLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="material-symbols-outlined text-5xl text-[#f4a462] animate-spin">progress_activity</span>
                    </div>
                ) : myOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-[#f4a462]/30 mb-4">receipt_long</span>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No orders yet</h3>
                        <p className="text-slate-400 mb-6">Start ordering delicious home-cooked meals!</p>
                        <button onClick={() => navigate('/')} className="bg-[#f4a462] text-white font-bold px-6 py-3 rounded-xl cursor-pointer">Explore Food</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {myOrders.map(order => (
                            <div key={order._id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg">{order.chef?.name || 'Chef'}</h3>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <span className="text-xl font-bold text-[#f4a462]">₹{order.totalAmount}</span>
                                </div>
                                <div className="p-5">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 py-2">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f4a462]/10 flex-shrink-0">
                                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-[#f4a462]/40 flex items-center justify-center w-full h-full">lunch_dining</span>}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{item.name}</p>
                                                <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-sm">₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* Rating Section */}
                                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                                    {order.rating ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-500">Your Rating:</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <span key={s} className={`material-symbols-outlined text-sm ${s <= order.rating ? 'text-yellow-500' : 'text-slate-300'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                ))}
                                            </div>
                                            {order.review && <span className="text-xs text-slate-400 ml-2">"{order.review}"</span>}
                                        </div>
                                    ) : order.status === 'delivered' ? (
                                        ratingOrder === order._id ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">Rate this order:</span>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <button key={s} onClick={() => setRatingValue(s)} className="cursor-pointer">
                                                                <span className={`material-symbols-outlined ${s <= ratingValue ? 'text-yellow-500' : 'text-slate-300'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <input type="text" placeholder="Write a review (optional)" value={reviewText} onChange={e => setReviewText(e.target.value)}
                                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#f4a462]" />
                                                <div className="flex gap-2">
                                                    <button onClick={handleRate} disabled={submitting}
                                                        className="bg-[#f4a462] text-white font-bold px-4 py-2 rounded-lg text-sm cursor-pointer disabled:opacity-50">
                                                        {submitting ? 'Submitting...' : 'Submit Rating'}
                                                    </button>
                                                    <button onClick={() => setRatingOrder(null)} className="text-slate-400 px-4 py-2 rounded-lg text-sm cursor-pointer">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => setRatingOrder(order._id)} className="text-[#f4a462] font-bold text-sm flex items-center gap-1 cursor-pointer hover:underline">
                                                <span className="material-symbols-outlined text-lg">star</span> Rate this order
                                            </button>
                                        )
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default MyOrders
