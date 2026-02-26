import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchChefsByState, clearStateChefs } from '../redux/chefSlice'

/* ─────────────────────────────────────────────────────────
   Per-state metadata: hero description + culinary tags
───────────────────────────────────────────────────────── */
const STATE_META = {
    'Andhra Pradesh': {
        desc: 'Known for its bold spices and rich culinary heritage, from the fiery curries of Rayalaseema to the coastal delicacies of Godavari. Discover the true essence of South Indian spice.',
        tags: [
            { icon: 'local_fire_department', label: 'Fiery Spices' },
            { icon: 'set_meal', label: 'Coastal Delicacies' },
            { icon: 'history_edu', label: 'Traditional Recipes' },
        ],
    },
    'Punjab': {
        desc: 'The land of butter, wheat, and vibrant flavours — from creamy dal makhani to tandoor-fresh naan. Rich, hearty North Indian cuisine at its finest.',
        tags: [
            { icon: 'breakfast_dining', label: 'Tandoori Classics' },
            { icon: 'local_dining', label: 'Dairy-Rich Dishes' },
            { icon: 'history_edu', label: 'Heritage Recipes' },
        ],
    },
    'Kerala': {
        desc: 'God\'s Own Country brings coconut-infused curries, fresh seafood and spice-route flavours to your plate. A culinary journey through the backwaters.',
        tags: [
            { icon: 'set_meal', label: 'Seafood Specials' },
            { icon: 'local_fire_department', label: 'Coconut Curries' },
            { icon: 'eco', label: 'Ayurvedic Touch' },
        ],
    },
    'West Bengal': {
        desc: 'Where mustard oil meets hilsa fish and mishti doi melts on your tongue. Bengali cuisine is poetry on a plate — subtle, sophisticated, and deeply rooted.',
        tags: [
            { icon: 'set_meal', label: 'River Fish Delights' },
            { icon: 'cake', label: 'Sweet Specialties' },
            { icon: 'history_edu', label: 'Ancient Recipes' },
        ],
    },
    'Maharashtra': {
        desc: 'From the spicy vada pav of Mumbai streets to the rich kolhapuri gravies — Maharashtra\'s cuisine is as diverse as its landscape.',
        tags: [
            { icon: 'storefront', label: 'Street Food Icons' },
            { icon: 'local_fire_department', label: 'Kolhapuri Spice' },
            { icon: 'set_meal', label: 'Coastal Konkani' },
        ],
    },
    'Tamil Nadu': {
        desc: 'Rice, lentils and tamarind form the backbone of Tamil Nadu\'s food culture — filter coffee, crispy dosas and fragrant chettinad masalas await.',
        tags: [
            { icon: 'local_cafe', label: 'Filter Coffee' },
            { icon: 'set_meal', label: 'Chettinad Delicacies' },
            { icon: 'eco', label: 'Temple Prasadams' },
        ],
    },
    'Rajasthan': {
        desc: 'The royal kitchens of Rajputana gifted India dal baati churma, laal maas and ker sangri — a desert cuisine of royal opulance and bold flavours.',
        tags: [
            { icon: 'local_fire_department', label: 'Laal Maas Special' },
            { icon: 'history_edu', label: 'Royal Recipes' },
            { icon: 'brightness_7', label: 'Desert Delicacies' },
        ],
    },
    'Gujarat': {
        desc: 'A predominantly vegetarian cuisine bursting with sweetness, spice and tang — dhokla, thepla and undhiyu are just the beginning.',
        tags: [
            { icon: 'eco', label: 'Pure Vegetarian' },
            { icon: 'cake', label: 'Farsan Snacks' },
            { icon: 'local_dining', label: 'Thali Feasts' },
        ],
    },
}

/* ─────────────────────────────────────────────────────────
   Placeholder chef data (shown when DB has no results)
───────────────────────────────────────────────────────── */
const PLACEHOLDER_CHEFS = [
    { _id: 'p1', name: 'Chef Priya', rating: { average: 4.7, count: 98 }, experience: '10 Years', mealsServed: 600, specialty: 'Regional Specialist', isPureVeg: true, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSWTxNxahFlEOToSfExfeJWQEMxCZqQIy7T6kX7rh0E1p5kA15enBGjRJoNtaQIG8-GBLIIso0bgaqeoQFiBwWKG0SWAxT2FawMTT-vANSgd0NyZstLBmrOTs4BpbDJ9qdPwqLxrnR_KxQrIL5ePGzPR64q6ZtBBrm3D3Fzh67yCyxMr-8xu82FjuDYnReslZeT6Nb7VG0FGdDRUxLiglesVCL_t3_g1-R11ccHm2j0u39LrhniQAT0YFQQy6w7WGjkFfERxWwY8M' },
    { _id: 'p2', name: 'Chef Ravi', rating: { average: 4.8, count: 156 }, experience: '12 Years', mealsServed: 1000, specialty: 'Heritage Cuisine', isPureVeg: false, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4sDeHK9MOl5YRa3ffQfmnzqiigdvE5Qgd6Anbs7aLE2SzPxPcou1caR0LTlEV5qjLvlDKU25sbz_lVprwvzXEriC8Ac3xp9tO8uDkaJRZMfWM02uQVwE9nWIw-fKaX_izKmzfBKetf2PmA34odDRMyJxel0vrlOd7ioO4H_YguG7SoMd-ls88EEqm_O-h7Jq7qpRE5ICY0ygUJ7k4zAEili3pdnvHqbXjEvbbC-qLF6Jx2PzCV3P1rAWcG1PPvHW4fZruyXJKyLc' },
    { _id: 'p3', name: 'Chef Meena', rating: { average: 4.6, count: 72 }, experience: '7 Years', mealsServed: 400, specialty: 'Traditional Cook', isPureVeg: true, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDINP1CtiCwK5ZlhGM8Bq2IV5chHbtrD8Y6TMCi5T0x1kBoyaTnm3kiWZ4-oPvGWnMYo0Ts6uZu3S42YR64pE3u6ES6fOOZAUEUhDWicgF8iReoW8HOuHXqb6-xEVP6b6zwIo1TZxB7DCY8fxiloW-4UpiWydMp25rOWlyvMVQkQch0WjqgCEnGsQKvKPBQ5jM35mDZcuoEt-Rq2O1arbQqXYrvTJNynVgKiypE3r5hk278G2FqFLqWqGl53vRiav73vmK6IP88NXI' },
]


const RegionChefs = () => {
    const { stateName } = useParams()
    const decodedState = decodeURIComponent(stateName || '')
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { stateChefs, stateChefsLoading } = useSelector(state => state.chef)

    const meta = STATE_META[decodedState] || { desc: `Explore authentic home-cooked flavours from ${decodedState}.`, tags: [] }

    const [vegOnly, setVegOnly] = useState(false)
    const [nonVeg, setNonVeg] = useState(false)
    const [rating, setRating] = useState('')
    const [priceRange, setPriceRange] = useState(50)
    const [expFilter, setExpFilter] = useState([])

    useEffect(() => {
        dispatch(fetchChefsByState(decodedState))
        return () => dispatch(clearStateChefs())
    }, [decodedState, dispatch])

    const isPlaceholder = stateChefs.length === 0 && !stateChefsLoading
    const baseChefs = stateChefs.length > 0 ? stateChefs : PLACEHOLDER_CHEFS

    // ══ FILTER LOGIC ══
    const chefs = baseChefs.filter(chef => {
        // Dietary Filter (Exclusive)
        if (vegOnly && !nonVeg) {
            if (chef.isPureVeg !== true) return false
        }
        if (nonVeg && !vegOnly) {
            if (chef.isPureVeg === true) return false
        }

        // Rating Filter
        if (rating) {
            if ((chef.rating?.average || 0) < parseFloat(rating)) return false
        }

        return true
    })

    return (
        <div className="bg-[#f8f7f6] text-slate-900 min-h-screen" style={{ fontFamily: "'Work Sans', sans-serif" }}>

            {/* ══ HEADER ══ */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#f4a462]/10 px-4 lg:px-20 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-[#f4a462] cursor-pointer" onClick={() => navigate('/')}>
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                            <h2 className="text-slate-900 text-xl font-bold tracking-tight">Maakhana</h2>
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <button onClick={() => navigate('/')} className="text-slate-600 hover:text-[#f4a462] transition-colors text-sm font-medium cursor-pointer">Explore</button>
                            <span className="text-[#f4a462] text-sm font-semibold">Regions</span>
                            <span className="text-slate-600 text-sm font-medium">Chefs</span>
                            <span className="text-slate-600 text-sm font-medium">About</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-3 py-1.5 border border-transparent focus-within:border-[#f4a462]/30 transition-all">
                            <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                            <input className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-slate-400 ml-1" placeholder="Search cuisines or chefs" type="text" />
                        </div>
                        <button onClick={() => navigate('/')} className="bg-[#f4a462] hover:bg-[#f4a462]/90 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer">
                            Back Home
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 lg:px-20 py-8">

                {/* ══ BREADCRUMB ══ */}
                <nav className="flex items-center gap-2 text-sm mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <button onClick={() => navigate('/')} className="text-slate-500 hover:text-[#f4a462] flex items-center gap-1 cursor-pointer">
                        <span className="material-symbols-outlined text-lg">home</span> Home
                    </button>
                    <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
                    <button onClick={() => navigate('/')} className="text-slate-500 hover:text-[#f4a462] cursor-pointer">Explore by Region</button>
                    <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
                    <span className="text-[#f4a462] font-semibold">{decodedState}</span>
                </nav>

                {/* ══ HERO BANNER ══ */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#f4a462]/10 to-transparent p-8 md:p-12 mb-12 border border-[#f4a462]/5">
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                            Authentic Flavors of <span className="text-[#f4a462]">{decodedState}</span>
                        </h1>
                        <p className="text-slate-600 text-lg leading-relaxed">{meta.desc}</p>
                        {meta.tags.length > 0 && (
                            <div className="flex flex-wrap gap-4 mt-8">
                                {meta.tags.map((tag, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-[#f4a462]/10">
                                        <span className="material-symbols-outlined text-[#f4a462] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{tag.icon}</span>
                                        <span className="text-sm font-medium">{tag.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[#f4a462]/5 rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* ══ FILTERS + CHEFS GRID ══ */}
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* ── Sidebar Filters ── */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#f4a462]">tune</span> Filters
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <p className="text-sm font-semibold mb-3">Dietary Preference</p>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" checked={vegOnly} onChange={e => setVegOnly(e.target.checked)} className="rounded border-slate-300 w-5 h-5 accent-[#f4a462]" />
                                            <span className="text-sm text-slate-600 group-hover:text-[#f4a462] transition-colors">Vegetarian</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" checked={nonVeg} onChange={e => setNonVeg(e.target.checked)} className="rounded border-slate-300 w-5 h-5 accent-[#f4a462]" />
                                            <span className="text-sm text-slate-600 group-hover:text-[#f4a462] transition-colors">Non-Vegetarian</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <p className="text-sm font-semibold mb-3">Rating</p>
                                    <div className="space-y-2">
                                        {['4.5', '4.0'].map(r => (
                                            <label key={r} className="flex items-center gap-3 cursor-pointer">
                                                <input type="radio" name="rating" value={r} checked={rating === r} onChange={e => setRating(e.target.value)} className="border-slate-300 w-5 h-5 accent-[#f4a462]" />
                                                <span className="text-sm text-slate-600 flex items-center gap-1">
                                                    {r}+ <span className="material-symbols-outlined text-[#f4a462] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ── Chef Cards Grid ── */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Top Chefs in {decodedState}</h2>
                            <p className="text-sm text-slate-500">
                                {stateChefsLoading ? 'Loading...' : `${chefs.length} chef${chefs.length !== 1 ? 's' : ''} available`}
                            </p>
                        </div>

                        {stateChefsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <span className="material-symbols-outlined text-4xl text-[#f4a462] animate-spin">progress_activity</span>
                            </div>
                        ) : (
                            <>
                                {isPlaceholder && (
                                    <div className="bg-[#f4a462]/5 border border-[#f4a462]/10 rounded-xl p-4 mb-6 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#f4a462]">info</span>
                                        <p className="text-sm text-slate-600">No chefs registered from {decodedState} yet. Showing sample chefs. <strong>Are you a chef from {decodedState}?</strong></p>
                                        <button onClick={() => navigate('/signup')} className="ml-auto bg-[#f4a462] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap">Join Now</button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {chefs.map(chef => (
                                        <div key={chef._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 group">
                                            <div className="relative h-48">
                                                <img
                                                    src={chef.image || 'https://via.placeholder.com/400x300?text=Chef'}
                                                    alt={chef.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Removed specialty tag to clear face */}
                                            </div>
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900">{chef.name}</h3>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <span className="material-symbols-outlined text-[#f4a462] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                            <span className="text-sm font-bold">{chef.rating?.average?.toFixed(1) || 'New'}</span>
                                                            {chef.rating?.count > 0 && <span className="text-xs text-slate-400">({chef.rating.count} reviews)</span>}
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#f4a462]/10 text-[#f4a462] p-2 rounded-lg">
                                                        <span className="material-symbols-outlined text-xl">verified</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 my-4">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${chef.isPureVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {chef.isPureVeg ? '● PURE VEG' : '● NON-VEG'}
                                                    </span>
                                                    {chef.experience && <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-1 rounded-md">{chef.experience} Exp</span>}
                                                    {chef.mealsServed > 0 && <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-1 rounded-md">{chef.mealsServed}+ Meals</span>}
                                                    {chef.items?.length > 0 && <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-1 rounded-md">{chef.items.length} Dishes</span>}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (!isPlaceholder) navigate(`/chef/${chef._id}`)
                                                        else navigate('/signup')
                                                    }}
                                                    className="w-full bg-[#f4a462] hover:bg-[#f4a462]/90 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 group cursor-pointer"
                                                >
                                                    View Menu
                                                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* ══ FOOTER ══ */}
            <footer className="bg-white border-t border-slate-200 py-12 mt-20 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Brand */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-[#f4a462] rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#221810] font-bold text-lg">restaurant</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight">Maakhana</span>
                    </div>

                    {/* Simple Links */}
                    <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-slate-500">
                        <button onClick={() => navigate('/')} className="hover:text-[#f4a462] cursor-pointer transition-colors bg-transparent border-none">Home</button>
                        <button onClick={() => navigate('/regions')} className="hover:text-[#f4a462] cursor-pointer transition-colors bg-transparent border-none">Regions</button>
                        <a className="hover:text-[#f4a462] cursor-pointer transition-colors">Privacy Policy</a>
                        <a className="hover:text-[#f4a462] cursor-pointer transition-colors">Terms of Service</a>
                        <a className="hover:text-[#f4a462] cursor-pointer transition-colors">Contact Us</a>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs text-center md:text-left">
                    <p>© 2024 Maakhana Foods Pvt Ltd. All rights reserved.</p>
                    <p className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">favorite</span> Celebrating Indian Regional Heritage</p>
                </div>
            </footer>
        </div>
    )
}

export default RegionChefs
