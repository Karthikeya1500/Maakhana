import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'

const NAV_ITEMS = [
    { icon: 'person', label: 'Profile Details', key: 'profile' },
    { icon: 'location_on', label: 'Saved Addresses', key: 'addresses' },
    { icon: 'shopping_bag', label: 'Order History', key: 'orders' },
    { icon: 'favorite', label: 'Saved Chefs', key: 'chefs' },
]

const statusStyle = {
    delivered: 'bg-green-100 text-green-800',
    processing: 'bg-[#f4a462]/10 text-[#f4a462]',
    cancelled: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
}

const Profile = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { userData, myOrders } = useSelector(state => state.user)

    const [activeTab, setActiveTab] = useState('profile')
    const [form, setForm] = useState({
        fullName: userData?.fullName || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        dob: userData?.dob || '',
    })

    // Address state
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [addressForm, setAddressForm] = useState({
        label: 'Home', fullAddress: '', city: '', state: '', pincode: '', phone: '', isDefault: false
    })

    const handleLogout = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
            navigate('/')
        } catch (e) {
            console.log(e)
        }
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.put(`${serverUrl}/api/user/profile`, form, { withCredentials: true })
            dispatch(setUserData({ ...userData, ...res.data }))
            alert('Profile updated successfully!')
        } catch (error) {
            alert('Failed to update profile.')
            console.error(error)
        }
    }

    const handleAddressSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.post(`${serverUrl}/api/user/address`, addressForm, { withCredentials: true })
            dispatch(setUserData({ ...userData, addresses: res.data }))
            setShowAddressForm(false)
            setAddressForm({ label: 'Home', fullAddress: '', city: '', state: '', pincode: '', phone: '', isDefault: false })
            alert('Address saved!')
        } catch (error) {
            alert('Failed to save address.')
        }
    }

    const deleteAddress = async (id) => {
        try {
            const res = await axios.delete(`${serverUrl}/api/user/address/${id}`, { withCredentials: true })
            dispatch(setUserData({ ...userData, addresses: res.data }))
        } catch (error) {
            console.error(error)
        }
    }

    const memberSince = userData?.createdAt
        ? new Date(userData.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        : 'Recently'

    return (
        <div
            className="flex h-screen overflow-hidden bg-[#f8f7f6] text-slate-900"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
            {/* ═══════════════ SIDEBAR ═══════════════ */}
            <aside className="w-72 bg-white border-r border-[#f4a462]/10 flex-col hidden md:flex">
                <div className="p-8">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 mb-10 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-10 h-10 bg-[#f4a462] rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">restaurant</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight text-[#f4a462]">MAAKHANA</span>
                    </div>

                    {/* Nav */}
                    <nav className="space-y-2">
                        {NAV_ITEMS.map(({ icon, label, key }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeTab === key
                                    ? 'bg-[#f4a462] text-white shadow-lg shadow-[#f4a462]/20'
                                    : 'text-slate-600 hover:bg-[#f4a462]/10 hover:text-[#f4a462]'
                                    }`}
                            >
                                <span className="material-symbols-outlined">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Logout */}
                <div className="mt-auto p-8 border-t border-[#f4a462]/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium cursor-pointer"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* ═══════════════ MAIN CONTENT ═══════════════ */}
            <main className="flex-1 overflow-y-auto p-4 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* ── Header ── */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 leading-none">
                                {NAV_ITEMS.find(n => n.key === activeTab)?.label || 'Profile Details'}
                            </h1>
                            <p className="text-slate-500 mt-2">Update your personal information and preferences.</p>
                        </div>

                        {/* Avatar block */}
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-[#f4a462] border-4 border-white shadow-xl flex items-center justify-center text-white text-4xl font-black select-none">
                                    {userData?.fullName?.slice(0, 1).toUpperCase() || 'U'}
                                </div>
                                <button className="absolute bottom-0 right-0 bg-[#f4a462] text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center cursor-pointer">
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                            </div>
                            <div>
                                <p className="text-xl font-bold">{userData?.fullName || 'User'}</p>
                                <p className="text-slate-500 text-sm">Member since {memberSince}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Profile Details tab ── */}
                    {activeTab === 'profile' && (
                        <>
                            <section className="bg-white rounded-xl p-8 shadow-sm border border-[#f4a462]/5">
                                <form
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    onSubmit={handleProfileUpdate}
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                        <input
                                            className="w-full h-12 rounded-lg border border-slate-200 px-4 focus:border-[#f4a462] focus:ring-2 focus:ring-[#f4a462]/20 outline-none transition-all"
                                            type="text"
                                            value={form.fullName}
                                            onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Email Address (Readonly)</label>
                                        <input
                                            className="w-full h-12 rounded-lg border border-slate-200 bg-slate-50 cursor-not-allowed px-4 outline-none transition-all"
                                            type="email"
                                            value={form.email}
                                            readOnly
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Mobile Number</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">+91</span>
                                            <input
                                                className="w-full h-12 pl-14 rounded-lg border border-slate-200 focus:border-[#f4a462] focus:ring-2 focus:ring-[#f4a462]/20 outline-none transition-all"
                                                type="tel"
                                                value={form.phone}
                                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                                placeholder="98765 43210"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Date of Birth</label>
                                        <input
                                            className="w-full h-12 rounded-lg border border-slate-200 px-4 focus:border-[#f4a462] focus:ring-2 focus:ring-[#f4a462]/20 outline-none transition-all"
                                            type="date"
                                            value={form.dob}
                                            onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            className="bg-[#f4a462] hover:bg-[#f4a462]/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-[#f4a462]/20 transition-all cursor-pointer"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </section>

                            {/* Recent Orders Overview */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">Recent Orders</h2>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className="text-[#f4a462] font-semibold hover:underline text-sm cursor-pointer"
                                    >
                                        View All Orders
                                    </button>
                                </div>
                                <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-[#f4a462]/5">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="p-4 font-semibold text-slate-600 text-sm">Order ID</th>
                                                    <th className="p-4 font-semibold text-slate-600 text-sm">Date</th>
                                                    <th className="p-4 font-semibold text-slate-600 text-sm">Items</th>
                                                    <th className="p-4 font-semibold text-slate-600 text-sm">Amount</th>
                                                    <th className="p-4 font-semibold text-slate-600 text-sm">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {myOrders && myOrders.length > 0 ? (
                                                    myOrders.slice(0, 5).map(order => {
                                                        const status = order.shopOrders?.status || 'pending'
                                                        const cls = statusStyle[status] || 'bg-slate-100 text-slate-600'
                                                        const itemNames = order.items?.map(i => i.name).join(', ') || '—'
                                                        const date = order.createdAt
                                                            ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                            : '—'
                                                        return (
                                                            <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                                                <td className="p-4 font-medium">#{order._id?.slice(-8).toUpperCase()}</td>
                                                                <td className="p-4 text-slate-600">{date}</td>
                                                                <td className="p-4 text-slate-600 max-w-[180px] truncate">{itemNames}</td>
                                                                <td className="p-4 font-bold">₹{order.totalAmount}</td>
                                                                <td className="p-4">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
                                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td className="p-4 font-medium text-slate-400" colSpan={5}>
                                                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                                                <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
                                                                <span className="text-slate-400 font-medium">No orders placed yet</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {/* ── Order History tab ── */}
                    {activeTab === 'orders' && (
                        <section className="bg-white rounded-xl shadow-sm border border-[#f4a462]/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="p-4 font-semibold text-slate-600 text-sm">Order ID</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">Date</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">Items</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">Amount</th>
                                            <th className="p-4 font-semibold text-slate-600 text-sm">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {myOrders && myOrders.length > 0 ? myOrders.map(order => {
                                            const status = order.shopOrders?.status || 'pending'
                                            const cls = statusStyle[status] || 'bg-slate-100 text-slate-600'
                                            const items = order.items?.map(i => i.name).join(', ') || '—'
                                            const date = order.createdAt
                                                ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : '—'
                                            return (
                                                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 font-medium">#{order._id?.slice(-8).toUpperCase()}</td>
                                                    <td className="p-4 text-slate-600">{date}</td>
                                                    <td className="p-4 text-slate-600 max-w-[200px] truncate">{items}</td>
                                                    <td className="p-4 font-bold">₹{order.totalAmount}</td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        }) : (
                                            <tr>
                                                <td colSpan={5}>
                                                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                                                        <span className="material-symbols-outlined text-5xl text-slate-300">receipt_long</span>
                                                        <span className="text-slate-400 font-medium">No orders placed yet</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* ── Saved Addresses tab ── */}
                    {activeTab === 'addresses' && (
                        <section className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Your Addresses</h2>
                                {!showAddressForm && (
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="bg-[#f4a462] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#f4a462]/90 transition shadow-sm cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Add New
                                    </button>
                                )}
                            </div>

                            {showAddressForm && (
                                <form onSubmit={handleAddressSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-[#f4a462]/5 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700">Label (Home, Work)</label>
                                            <input type="text" value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full h-10 border rounded-lg px-3 mt-1" required />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700">Phone</label>
                                            <input type="text" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full h-10 border rounded-lg px-3 mt-1" required />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-semibold text-slate-700">Full Address</label>
                                            <textarea value={addressForm.fullAddress} onChange={e => setAddressForm({ ...addressForm, fullAddress: e.target.value })} className="w-full border rounded-lg p-3 mt-1 h-20" required />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700">City</label>
                                            <input type="text" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full h-10 border rounded-lg px-3 mt-1" required />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700">Pincode</label>
                                            <input type="text" value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} className="w-full h-10 border rounded-lg px-3 mt-1" required />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-4 h-4 text-[#f4a462] rounded border-slate-300 focus:ring-[#f4a462]" />
                                        <label htmlFor="isDefault" className="text-sm font-medium text-slate-700">Make this my default address</label>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 rounded-lg text-slate-500 font-medium hover:bg-slate-100">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-[#f4a462] text-white rounded-lg font-bold">Save Address</button>
                                    </div>
                                </form>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userData?.addresses?.length > 0 ? (
                                    userData.addresses.map((addr) => (
                                        <div key={addr._id} className="bg-white p-5 rounded-xl border border-[#f4a462]/10 relative group hover:shadow-md transition">
                                            {addr.isDefault && (
                                                <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Default</span>
                                            )}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-symbols-outlined text-[#f4a462]">{addr.label.toLowerCase() === 'home' ? 'home' : 'work'}</span>
                                                <h3 className="font-bold text-lg">{addr.label}</h3>
                                            </div>
                                            <p className="text-slate-600 text-sm mb-1">{addr.fullAddress}</p>
                                            <p className="text-slate-600 text-sm mb-3">{addr.city}, {addr.pincode}</p>
                                            <p className="text-slate-800 font-medium text-sm">Phone: {addr.phone}</p>
                                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                <button onClick={() => deleteAddress(addr._id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    !showAddressForm && (
                                        <div className="md:col-span-2 flex flex-col items-center justify-center py-16 gap-3 text-slate-400 bg-white rounded-xl border border-[#f4a462]/5 shadow-sm">
                                            <span className="material-symbols-outlined text-5xl">location_off</span>
                                            <p className="font-semibold">No saved addresses yet</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── Saved Chefs tab ── */}
                    {activeTab === 'chefs' && (
                        <section className="space-y-4 pb-12">
                            <h2 className="text-2xl font-bold">Favorite Chefs</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {userData?.favoriteChefs?.length > 0 ? (
                                    userData.favoriteChefs.map(chef => (
                                        <div onClick={() => navigate(`/chef/${chef._id}`)} key={chef._id} className="bg-white p-4 rounded-xl border border-[#f4a462]/10 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                                            <img src={chef.image} alt={chef.name} className="w-14 h-14 rounded-full object-cover" />
                                            <div>
                                                <p className="font-bold text-slate-900 group-hover:text-[#f4a462] transition line-clamp-1">{chef.name}</p>
                                                <p className="text-xs text-slate-500 font-medium line-clamp-1">{chef.specialty}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-[#f4a462]/5 shadow-sm gap-2">
                                        <span className="material-symbols-outlined text-5xl">heart_broken</span>
                                        <p className="font-semibold">No favorite chefs saved</p>
                                        <button onClick={() => navigate('/')} className="mt-2 text-[#f4a462] hover:underline font-medium cursor-pointer">Explore Chefs</button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                </div>
            </main>
        </div>
    )
}

export default Profile
