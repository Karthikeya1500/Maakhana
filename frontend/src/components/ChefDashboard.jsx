import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyShop, createEditShop, addItem, editItem, deleteItem, fetchChefOrders, updateOrderStatusAPI } from '../redux/chefSlice'
import { setUserData } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'

const CATEGORIES = [
    "Breakfast", "Main Course", "Snacks", "Desserts", "Sides & Pickles",
    "South Indian", "North Indian", "Chinese", "Fast Food", "Beverages",
    "Pizza", "Burgers", "Sandwiches", "Others"
]

const STATES = [
    "Andhra Pradesh", "Punjab", "Kerala", "West Bengal", "Maharashtra",
    "Tamil Nadu", "Rajasthan", "Gujarat", "Karnataka", "Telangana",
    "Uttar Pradesh", "Bihar", "Madhya Pradesh", "Odisha", "Goa", "Others"
]

const CATEGORY_COLORS = {
    "Snacks": { text: "text-[#f4a462]", bg: "bg-[#f4a462]/10" },
    "Breakfast": { text: "text-green-600", bg: "bg-green-100" },
    "Main Course": { text: "text-blue-600", bg: "bg-blue-100" },
    "Desserts": { text: "text-purple-600", bg: "bg-purple-100" },
    "Sides & Pickles": { text: "text-amber-600", bg: "bg-amber-100" },
    "South Indian": { text: "text-teal-600", bg: "bg-teal-100" },
    "North Indian": { text: "text-rose-600", bg: "bg-rose-100" },
    "Chinese": { text: "text-red-600", bg: "bg-red-100" },
    "Fast Food": { text: "text-orange-600", bg: "bg-orange-100" },
    "Beverages": { text: "text-cyan-600", bg: "bg-cyan-100" },
    "Others": { text: "text-slate-600", bg: "bg-slate-100" },
}

const ChefDashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { myShop, myShopLoading, chefOrders, chefOrdersLoading } = useSelector(state => state.chef)
    const { userData } = useSelector(state => state.user)

    const [activeTab, setActiveTab] = useState('menu')
    const [activeCategory, setActiveCategory] = useState('all')

    // Shop form state
    const [showShopForm, setShowShopForm] = useState(false)
    const [shopForm, setShopForm] = useState({
        name: '', city: '', state: '', address: '', bio: '', specialty: '', experience: ''
    })
    const [shopImage, setShopImage] = useState(null)
    const [shopSaving, setShopSaving] = useState(false)

    // Item form state
    const [showItemForm, setShowItemForm] = useState(false)
    const [itemForm, setItemForm] = useState({
        name: '', description: '', category: 'Main Course', foodType: 'veg', price: '', spiceLevel: 1
    })
    const [itemImage, setItemImage] = useState(null)
    const [itemSaving, setItemSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [togglingId, setTogglingId] = useState(null)
    const [editingId, setEditingId] = useState(null)

    // Reviews state
    const [chefReviews, setChefReviews] = useState([])
    const [reviewsLoading, setReviewsLoading] = useState(false)

    // Toast
    const [toast, setToast] = useState(null)

    useEffect(() => {
        dispatch(fetchMyShop())
        dispatch(fetchChefOrders())
    }, [dispatch])

    useEffect(() => {
        if (activeTab === 'reviews' && myShop) {
            const fetchReviews = async () => {
                setReviewsLoading(true)
                try {
                    const res = await axios.get(`${serverUrl}/api/review/chef/${myShop._id}`)
                    setChefReviews(res.data)
                } catch (err) { console.error(err) }
                finally { setReviewsLoading(false) }
            }
            fetchReviews()
        }
    }, [activeTab, myShop])

    useEffect(() => {
        if (myShop) {
            setShopForm({
                name: myShop.name || '',
                city: myShop.city || '',
                state: myShop.state || '',
                address: myShop.address || '',
                bio: myShop.bio || '',
                specialty: myShop.specialty || '',
                experience: myShop.experience || ''
            })
        }
    }, [myShop])

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
        } catch (error) { console.log(error) }
    }

    const handleShopSubmit = async (e) => {
        e.preventDefault()
        setShopSaving(true)
        const fd = new FormData()
        Object.entries(shopForm).forEach(([k, v]) => fd.append(k, v))
        if (shopImage) fd.append('image', shopImage)
        try {
            await dispatch(createEditShop(fd)).unwrap()
            setShowShopForm(false)
            setShopImage(null)
            showToast('Kitchen profile saved!')
        } catch (err) { console.error(err) }
        finally { setShopSaving(false) }
    }

    const handleItemSubmit = async (e) => {
        e.preventDefault()
        setItemSaving(true)
        const fd = new FormData()
        Object.entries(itemForm).forEach(([k, v]) => fd.append(k, v))
        if (itemImage) fd.append('image', itemImage)

        try {
            if (editingId) {
                await dispatch(editItem({ itemId: editingId, formData: fd })).unwrap()
                showToast(`${itemForm.name} updated!`)
            } else {
                await dispatch(addItem(fd)).unwrap()
                showToast('New dish added to menu!')
            }
            setShowItemForm(false)
            setEditingId(null)
            setItemForm({ name: '', description: '', category: 'Main Course', foodType: 'veg', price: '', spiceLevel: 1 })
            setItemImage(null)
        } catch (err) {
            console.error(err)
            showToast(typeof err === 'string' ? err : `Failed to ${editingId ? 'update' : 'add'} dish. Please try again.`)
        }
        finally { setItemSaving(false) }
    }

    const handleEditItemClick = (item) => {
        setEditingId(item._id)
        setItemForm({
            name: item.name || '',
            description: item.description || '',
            category: item.category || 'Main Course',
            foodType: item.foodType || 'veg',
            price: item.price || '',
            spiceLevel: item.spiceLevel || 1
        })
        setItemImage(null)
        setShowItemForm(true)
    }

    const handleDelete = async (itemId) => {
        if (!window.confirm('Delete this dish from your menu?')) return
        setDeletingId(itemId)
        try {
            await dispatch(deleteItem(itemId)).unwrap()
            showToast('Dish removed from menu')
        } catch (err) { console.error(err) }
        finally { setDeletingId(null) }
    }

    const handleToggleAvailability = async (item) => {
        setTogglingId(item._id)
        const fd = new FormData()
        fd.append('isAvailable', !item.isAvailable)
        fd.append('name', item.name)
        fd.append('category', item.category)
        fd.append('foodType', item.foodType)
        fd.append('price', item.price)
        try {
            await dispatch(editItem({ itemId: item._id, formData: fd })).unwrap()
            showToast(`${item.name} is now ${item.isAvailable ? 'out of stock' : 'available'}`)
        } catch (err) { console.error(err) }
        finally { setTogglingId(null) }
    }

    // ── Loading State ──
    if (myShopLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8f7f6]" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-[#f4a462] animate-spin">progress_activity</span>
                    <p className="text-slate-500 font-medium mt-4">Loading your kitchen...</p>
                </div>
            </div>
        )
    }

    // ── No shop yet → Onboarding ──
    if (!myShop && !showShopForm) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8f7f6]" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                <div className="bg-white rounded-2xl shadow-xl border border-[#f4a462]/10 p-12 text-center max-w-lg mx-4">
                    <div className="w-20 h-20 bg-[#f4a462]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-[#f4a462]">storefront</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3">Set Up Your Kitchen</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Welcome, Chef {userData?.fullName}! Create your shop profile so customers in your region can discover your delicious dishes.
                    </p>
                    <button
                        onClick={() => setShowShopForm(true)}
                        className="bg-[#f4a462] text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#f4a462]/90 transition-all flex items-center gap-2 mx-auto cursor-pointer active:scale-95"
                    >
                        <span className="material-symbols-outlined">add_business</span>
                        Create My Kitchen
                    </button>
                </div>
            </div>
        )
    }

    // ── Shop Form ──
    if (showShopForm) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8f7f6] px-4" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                <div className="w-full max-w-2xl">
                    <button onClick={() => { if (myShop) { setShowShopForm(false); setShopImage(null); } else navigate('/') }}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#f4a462] mb-6 cursor-pointer">
                        <span className="material-symbols-outlined">arrow_back</span> Back
                    </button>
                    <div className="bg-white rounded-2xl shadow-lg border border-[#f4a462]/10 p-8">
                        <h2 className="text-2xl font-bold mb-6">{myShop ? 'Edit' : 'Create'} Your Kitchen</h2>
                        <form onSubmit={handleShopSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kitchen Name *</label>
                                    <input type="text" required value={shopForm.name} onChange={e => setShopForm({ ...shopForm, name: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none" placeholder="e.g. Lakshmi's Kitchen" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Specialty</label>
                                    <input type="text" value={shopForm.specialty} onChange={e => setShopForm({ ...shopForm, specialty: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none" placeholder="e.g. Andhra Cuisine" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">State *</label>
                                    <select required value={shopForm.state} onChange={e => setShopForm({ ...shopForm, state: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none">
                                        <option value="">Select State</option>
                                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">City *</label>
                                    <input type="text" required value={shopForm.city} onChange={e => setShopForm({ ...shopForm, city: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none" placeholder="e.g. Hyderabad" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Address *</label>
                                <input type="text" required value={shopForm.address} onChange={e => setShopForm({ ...shopForm, address: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none" placeholder="Full address" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Experience</label>
                                <input type="text" value={shopForm.experience} onChange={e => setShopForm({ ...shopForm, experience: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none" placeholder="e.g. 12 Years" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">About Your Kitchen</label>
                                <textarea value={shopForm.bio} onChange={e => setShopForm({ ...shopForm, bio: e.target.value })} rows={3}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none resize-none"
                                    placeholder="Tell customers about your cooking style, family recipes, etc." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Kitchen Photo</label>
                                <input type="file" accept="image/*" onChange={e => setShopImage(e.target.files[0])}
                                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#f4a462]/10 file:text-[#f4a462] file:font-semibold hover:file:bg-[#f4a462]/20 cursor-pointer" />
                            </div>
                            <button type="submit" disabled={shopSaving}
                                className="w-full bg-[#f4a462] text-white font-bold py-4 rounded-xl text-lg hover:bg-[#f4a462]/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]">
                                {shopSaving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
                                {shopSaving ? 'Saving...' : 'Save Kitchen'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    // ── Main Dashboard with Sidebar ──
    const items = myShop?.items || []
    const allCategories = [...new Set(items.map(i => i.category))]
    const filteredItems = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory)
    const activeItems = items.filter(i => i.isAvailable !== false)
    const outOfStockItems = items.filter(i => i.isAvailable === false)

    return (
        <div className="flex min-h-screen bg-[#f8f7f6]" style={{ fontFamily: "'Work Sans', sans-serif" }}>

            {/* ════════ SIDEBAR ════════ */}
            <aside className="w-72 bg-white border-r border-[#f4a462]/10 flex-col sticky top-0 h-screen hidden lg:flex">
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f4a462] flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">restaurant_menu</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-none">Maakhana Chef</h1>
                        <p className="text-xs text-slate-500">{myShop.specialty || 'Home Kitchen'}</p>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {[
                        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
                        { id: 'menu', icon: 'restaurant', label: 'My Menu' },
                        { id: 'orders', icon: 'receipt_long', label: 'Orders' },
                        { id: 'reviews', icon: 'reviews', label: 'Reviews' },
                        { id: 'analytics', icon: 'analytics', label: 'Analytics' },
                        { id: 'profile', icon: 'person', label: 'Profile' },
                    ].map(nav => (
                        <button
                            key={nav.id}
                            onClick={() => {
                                if (nav.id === 'profile') { setShowShopForm(true); return }
                                setActiveTab(nav.id)
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full cursor-pointer ${activeTab === nav.id
                                ? 'bg-[#f4a462]/15 text-[#f4a462]'
                                : 'hover:bg-[#f4a462]/10 text-slate-500 hover:text-[#f4a462]'
                                }`}
                        >
                            <span className="material-symbols-outlined">{nav.icon}</span>
                            <span className="font-medium text-sm">{nav.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-[#f4a462]/10">
                    <button
                        onClick={handleLogOut}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* ════════ MAIN CONTENT ════════ */}
            <main className="flex-1 p-4 md:p-8 overflow-auto">

                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-[#f4a462] flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                        </div>
                        <span className="font-bold text-lg">Maakhana Chef</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowShopForm(true)} className="p-2 rounded-lg bg-slate-100 text-slate-600 cursor-pointer">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                        <button onClick={handleLogOut} className="p-2 rounded-lg bg-red-50 text-red-500 cursor-pointer">
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </div>

                {/* ── DASHBOARD TAB ── */}
                {activeTab === 'dashboard' && (
                    <div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">Dashboard</h2>
                        <p className="text-slate-500 mb-8">Overview of your kitchen • {myShop.city}, {myShop.state}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[
                                { icon: 'restaurant', label: 'Total Dishes', value: items.length, color: 'text-[#f4a462] bg-[#f4a462]/10' },
                                { icon: 'receipt_long', label: 'Total Orders', value: chefOrders.length, color: 'text-blue-500 bg-blue-50' },
                                { icon: 'star', label: 'Avg Rating', value: myShop.rating?.average?.toFixed(1) || 'N/A', color: 'text-yellow-500 bg-yellow-50' },
                                { icon: 'delivery_dining', label: 'Meals Served', value: myShop.mealsServed || 0, color: 'text-green-500 bg-green-50' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 border border-[#f4a462]/5 shadow-sm">
                                    <div className={`w-12 h-12 rounded-full ${s.color} flex items-center justify-center mb-3`}>
                                        <span className="material-symbols-outlined">{s.icon}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{s.label}</p>
                                    <p className="text-2xl font-black mt-1">{s.value}</p>
                                </div>
                            ))}
                        </div>
                        <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                        {chefOrders.length === 0 ? (
                            <p className="text-slate-400">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {chefOrders.slice(0, 5).map(order => (
                                    <div key={order._id} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold">{order.customer?.fullName || 'Customer'}</p>
                                            <p className="text-xs text-slate-400">{order.items?.length || 0} items • ₹{order.totalAmount}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${{ pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', preparing: 'bg-orange-100 text-orange-700', ready: 'bg-green-100 text-green-700', delivered: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-red-100 text-red-700' }[order.status] || 'bg-slate-100'}`}>{order.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ORDERS TAB ── */}
                {activeTab === 'orders' && (
                    <div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">Orders</h2>
                        <p className="text-slate-500 mb-8">Manage incoming orders</p>
                        {chefOrdersLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <span className="material-symbols-outlined text-4xl text-[#f4a462] animate-spin">progress_activity</span>
                            </div>
                        ) : chefOrders.length === 0 ? (
                            <div className="text-center py-16">
                                <span className="material-symbols-outlined text-5xl text-[#f4a462]/30">receipt_long</span>
                                <p className="text-slate-400 mt-4">No orders received yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {chefOrders.map(order => (
                                    <div key={order._id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-bold text-lg">{order.customer?.fullName || 'Customer'}</p>
                                                <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-[#f4a462] text-lg">₹{order.totalAmount}</span>
                                                <select
                                                    value={order.status}
                                                    onChange={e => dispatch(updateOrderStatusAPI({ orderId: order._id, status: e.target.value }))}
                                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none focus:border-[#f4a462] cursor-pointer"
                                                >
                                                    {['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(s => (
                                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 text-sm">
                                                    <span className="text-slate-400">×{item.quantity}</span>
                                                    <span className="font-medium">{item.name}</span>
                                                    <span className="ml-auto text-slate-500">₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.rating && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                                                <span className="text-xs text-slate-400">Customer Rating:</span>
                                                <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => (<span key={s} className={`material-symbols-outlined text-xs ${s <= order.rating ? 'text-yellow-500' : 'text-slate-300'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>))}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ANALYTICS TAB ── */}
                {activeTab === 'analytics' && (
                    <div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">Analytics</h2>
                        <p className="text-slate-500 mb-8">Performance insights</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-xl p-6 border border-slate-100">
                                <p className="text-sm text-slate-500 font-bold uppercase">Total Revenue</p>
                                <p className="text-3xl font-black text-[#f4a462] mt-2">₹{chefOrders.reduce((s, o) => s + (o.totalAmount || 0), 0)}</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 border border-slate-100">
                                <p className="text-sm text-slate-500 font-bold uppercase">Avg Order Value</p>
                                <p className="text-3xl font-black mt-2">₹{chefOrders.length > 0 ? Math.round(chefOrders.reduce((s, o) => s + (o.totalAmount || 0), 0) / chefOrders.length) : 0}</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 border border-slate-100">
                                <p className="text-sm text-slate-500 font-bold uppercase">Completed Orders</p>
                                <p className="text-3xl font-black text-green-500 mt-2">{chefOrders.filter(o => o.status === 'delivered').length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── REVIEWS TAB ── */}
                {activeTab === 'reviews' && (
                    <div className="animate-in fade-in duration-500">
                        <h2 className="text-3xl font-black tracking-tight mb-2">Customer Reviews</h2>
                        <p className="text-slate-500 mb-8">Direct feedback from your diners</p>

                        {reviewsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <span className="material-symbols-outlined text-4xl text-[#f4a462] animate-spin">progress_activity</span>
                            </div>
                        ) : chefReviews.length === 0 ? (
                            <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">reviews</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No Reviews Yet</h3>
                                <p className="text-slate-400 max-w-xs mx-auto">Focus on quality and service, and the reviews will start pouring in!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {chefReviews.map(review => (
                                    <div key={review._id} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[#f4a462]/10 flex items-center justify-center font-bold text-[#f4a462] text-sm group-hover:scale-110 transition-transform">
                                                    {(review.customer?.fullName || 'A').split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{review.customer?.fullName}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5 bg-yellow-50 px-3 py-1.5 rounded-full">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <span key={s} className={`material-symbols-outlined text-xs ${s <= review.rating ? 'text-yellow-500' : 'text-slate-200'}`} style={{ fontVariationSettings: `\"FILL\" 1` }}>star</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute -top-2 -left-3 text-slate-100 text-4xl -z-0">format_quote</span>
                                            <p className="text-slate-600 text-sm italic leading-relaxed relative z-10">"{review.comment}"</p>
                                        </div>
                                        {review.isTopComment && (
                                            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                                                <span className="material-symbols-outlined text-[14px]">verified</span> Featured Review
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── MENU TAB ── */}
                {activeTab === 'menu' && (
                    <>
                        {/* ── Header Section ── */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight">My Menu</h2>
                                <p className="text-slate-500">Manage your dishes • {myShop.city}, {myShop.state}</p>
                            </div>
                            <button
                                onClick={() => setShowItemForm(true)}
                                className="bg-[#f4a462] hover:bg-[#f4a462]/90 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-[#f4a462]/20 cursor-pointer"
                            >
                                <span className="material-symbols-outlined">add</span>
                                <span>Add New Dish</span>
                            </button>
                        </header>

                        {/* ── Category Tabs ── */}
                        <div className="flex items-center gap-4 md:gap-6 border-b border-[#f4a462]/10 mb-8 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={`pb-4 border-b-2 font-bold text-sm whitespace-nowrap cursor-pointer transition-colors ${activeCategory === 'all'
                                    ? 'border-[#f4a462] text-[#f4a462]'
                                    : 'border-transparent text-slate-500 hover:text-[#f4a462]'
                                    }`}
                            >
                                All Dishes ({items.length})
                            </button>
                            {allCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`pb-4 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer transition-colors ${activeCategory === cat
                                        ? 'border-[#f4a462] text-[#f4a462] font-bold'
                                        : 'border-transparent text-slate-500 hover:text-[#f4a462]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* ── Dish Grid ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map(item => {
                                const catColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Others']
                                const isAvailable = item.isAvailable !== false
                                return (
                                    <div
                                        key={item._id}
                                        className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-[#f4a462]/5 group ${deletingId === item._id ? 'opacity-40' : ''}`}
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            {item.image ? (
                                                <div
                                                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 ${!isAvailable ? 'opacity-60 grayscale' : ''}`}
                                                    style={{ backgroundImage: `url('${item.image}')` }}
                                                />
                                            ) : (
                                                <div className={`absolute inset-0 bg-[#f4a462]/10 flex items-center justify-center ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
                                                    <span className="material-symbols-outlined text-6xl text-[#f4a462]/40">lunch_dining</span>
                                                </div>
                                            )}
                                            {/* Edit / Delete Buttons */}
                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <button
                                                    className="p-2 bg-white/90 rounded-full shadow-md hover:text-[#f4a462] transition-colors cursor-pointer"
                                                    onClick={() => handleEditItemClick(item)}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    className="p-2 bg-white/90 rounded-full shadow-md hover:text-red-500 transition-colors cursor-pointer"
                                                    onClick={() => handleDelete(item._id)}
                                                    disabled={deletingId === item._id}
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                            {/* Out of Stock Overlay */}
                                            {!isAvailable && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="bg-zinc-900/80 text-white px-4 py-2 rounded-lg font-bold text-sm">OUT OF STOCK</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-5">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${catColor.text} ${catColor.bg} px-2 py-0.5 rounded-full mb-1 inline-block`}>
                                                        {item.category}
                                                    </span>
                                                    <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                                                </div>
                                                <span className="text-[#f4a462] font-bold text-lg">₹{item.price}</span>
                                            </div>
                                            {item.description && (
                                                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{item.description}</p>
                                            )}
                                            {!item.description && <div className="mb-4" />}

                                            {/* Availability Toggle */}
                                            <div className="flex items-center justify-between pt-4 border-t border-[#f4a462]/5">
                                                <span className={`text-sm font-medium ${isAvailable ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {isAvailable ? 'Available' : 'Sold Out'}
                                                </span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={isAvailable}
                                                        disabled={togglingId === item._id}
                                                        onChange={() => handleToggleAvailability(item)}
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f4a462]"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* ── Add New Dish Card ── */}
                            <div
                                onClick={() => setShowItemForm(true)}
                                className="border-2 border-dashed border-[#f4a462]/20 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-[#f4a462]/5 hover:bg-[#f4a462]/10 transition-colors cursor-pointer group min-h-[280px]"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#f4a462]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[#f4a462] text-4xl">add_circle</span>
                                </div>
                                <h4 className="font-bold text-slate-800">New Offering?</h4>
                                <p className="text-sm text-slate-500 mt-2">Click here to add your latest recipe to the menu</p>
                            </div>
                        </div>

                        {/* ── Stats/Summary Footer ── */}
                        <div className="mt-12 bg-white rounded-xl p-6 border border-[#f4a462]/10 flex flex-wrap gap-8 items-center justify-center md:justify-start">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#f4a462]/10 rounded-full flex items-center justify-center text-[#f4a462]">
                                    <span className="material-symbols-outlined">restaurant</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Dishes</p>
                                    <p className="text-xl font-black">{items.length} Items</p>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-[#f4a462]/10 hidden md:block" />
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <span className="material-symbols-outlined">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Active</p>
                                    <p className="text-xl font-black">{activeItems.length} Items</p>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-[#f4a462]/10 hidden md:block" />
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                                    <span className="material-symbols-outlined">cancel</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Out of Stock</p>
                                    <p className="text-xl font-black">{outOfStockItems.length} Items</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* ════════ ADD ITEM MODAL ════════ */}
            {showItemForm && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShowItemForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">{editingId ? 'Edit Dish' : 'Add New Dish'}</h3>
                            <button onClick={() => { setShowItemForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleItemSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Dish Name *</label>
                                <input type="text" required value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none" placeholder="e.g. Hyderabadi Biryani" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                <textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} rows={2}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none resize-none"
                                    placeholder="Describe your dish" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                                    <select value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Food Type *</label>
                                    <select value={itemForm.foodType} onChange={e => setItemForm({ ...itemForm, foodType: e.target.value })}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none">
                                        <option value="veg">Vegetarian</option>
                                        <option value="non veg">Non-Vegetarian</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Price (₹) *</label>
                                    <input
                                        type="text"
                                        required
                                        value={itemForm.price}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setItemForm({ ...itemForm, price: val });
                                        }}
                                        onKeyDown={(e) => {
                                            if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                                        }}
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#f4a462]/50 outline-none"
                                        placeholder="₹"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Spice Level</label>
                                    <div className="flex items-center gap-2 pt-2">
                                        {[1, 2, 3].map(l => (
                                            <button key={l} type="button" onClick={() => setItemForm({ ...itemForm, spiceLevel: l })}
                                                className={`p-2 rounded-lg cursor-pointer transition-colors ${l <= itemForm.spiceLevel ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-300'}`}>
                                                <span className="material-symbols-outlined text-lg">local_fire_department</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Dish Photo {editingId ? '(Optional)' : '*'}</label>
                                <input type="file" accept="image/*" onChange={e => setItemImage(e.target.files[0])}
                                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#f4a462]/10 file:text-[#f4a462] file:font-semibold hover:file:bg-[#f4a462]/20 cursor-pointer" />
                            </div>
                            <button type="submit" disabled={itemSaving}
                                className="w-full bg-[#f4a462] text-white font-bold py-4 rounded-xl text-lg hover:bg-[#f4a462]/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]">
                                {itemSaving ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">{editingId ? 'save' : 'add_circle'}</span>}
                                {itemSaving ? (editingId ? 'Saving...' : 'Adding...') : (editingId ? 'Save Changes' : 'Add to Menu')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════ TOAST ════════ */}
            {toast && (
                <div className="fixed bottom-8 right-8 z-50 bg-zinc-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-[slideUp_0.3s_ease-out]">
                    <span className="material-symbols-outlined text-[#f4a462]">check_circle</span>
                    <div>
                        <p className="text-sm font-bold">Menu Updated</p>
                        <p className="text-xs opacity-70">{toast}</p>
                    </div>
                    <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default ChefDashboard
