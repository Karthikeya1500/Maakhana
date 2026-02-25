import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchChefById, clearViewingChef } from '../redux/chefSlice'
import { addToCartAPI } from '../redux/userSlice'

const ChefMenu = () => {
    const { chefId } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { viewingChef, viewingChefLoading } = useSelector(state => state.chef)
    const { userData, cartItems } = useSelector(state => state.user)

    const [addingId, setAddingId] = useState(null)
    const [addedId, setAddedId] = useState(null)
    const [activeCategory, setActiveCategory] = useState(null)

    useEffect(() => {
        dispatch(fetchChefById(chefId))
        return () => dispatch(clearViewingChef())
    }, [chefId, dispatch])

    useEffect(() => {
        if (viewingChef?.items?.length > 0) {
            const cats = [...new Set(viewingChef.items.map(i => i.category))]
            if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0])
        }
    }, [viewingChef])

    const handleAddToCart = async (item) => {
        if (!userData) {
            navigate('/signin')
            return
        }
        setAddingId(item._id)
        try {
            await dispatch(addToCartAPI({
                itemId: item._id,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: 1,
                chef: viewingChef?.name || ''
            })).unwrap()
            setAddedId(item._id)
            setTimeout(() => setAddedId(null), 1500)
        } catch (err) { console.error(err) }
        finally { setAddingId(null) }
    }

    if (viewingChefLoading || !viewingChef) {
        return (
            <div className="min-h-screen bg-[#f8f7f6] flex items-center justify-center" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-[#f4a462] animate-spin mb-4">progress_activity</span>
                    <p className="text-slate-500 font-medium">Loading chef's menu...</p>
                </div>
            </div>
        )
    }

    const chef = viewingChef
    const items = chef.items || []
    const categories = [...new Set(items.map(i => i.category))]
    const filteredItems = activeCategory ? items.filter(i => i.category === activeCategory) : items

    return (
        <div className="bg-[#f8f7f6] text-slate-900 min-h-screen" style={{ fontFamily: "'Work Sans', sans-serif" }}>

            {/* ══ HEADER ══ */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <span className="material-symbols-outlined text-[#f4a462] text-3xl">restaurant</span>
                            <h1 className="text-xl font-bold tracking-tight">Maakhana</h1>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <a className="text-sm font-medium hover:text-[#f4a462] transition-colors cursor-pointer" onClick={() => navigate('/')}>Home</a>
                            <span className="text-sm font-medium text-[#f4a462]">Chef Profile</span>
                            {userData && <a className="text-sm font-medium hover:text-[#f4a462] transition-colors cursor-pointer" onClick={() => navigate('/my-orders')}>My Orders</a>}
                        </nav>
                        <div className="flex items-center gap-4">
                            {userData && (
                                <button className="p-2 rounded-lg bg-slate-100 text-slate-600 relative cursor-pointer" onClick={() => navigate('/cart')}>
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#f4a462] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartItems.length}</span>
                                    )}
                                </button>
                            )}
                            {userData ? (
                                <div className="w-9 h-9 rounded-full bg-[#f4a462] text-white font-bold flex items-center justify-center cursor-pointer shadow-md" onClick={() => navigate('/profile')}>
                                    {userData.fullName?.slice(0, 1).toUpperCase()}
                                </div>
                            ) : (
                                <button onClick={() => navigate('/signin')} className="bg-[#f4a462] text-white text-sm font-bold px-5 py-2 rounded-lg cursor-pointer">Sign In</button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ══ CHEF HERO ══ */}
                <section className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 mb-8">
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 h-64 md:h-auto overflow-hidden bg-[#f4a462]/5 flex items-center justify-center">
                            {chef.image ? (
                                <img src={chef.image} alt={chef.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-8xl text-[#f4a462]/30">person</span>
                            )}
                        </div>
                        <div className="md:w-2/3 p-8 flex flex-col justify-center border-l border-slate-100">
                            <div className="flex flex-wrap items-center gap-4 mb-3">
                                <h2 className="text-3xl font-bold">{chef.name}</h2>
                                {chef.specialty && (
                                    <span className="px-3 py-1 bg-[#f4a462]/20 text-[#f4a462] text-xs font-bold rounded-full uppercase tracking-wider">{chef.specialty}</span>
                                )}
                                <button
                                    onClick={async () => {
                                        if (!userData) return navigate('/signin');
                                        try {
                                            const { default: axios } = await import('axios');
                                            const { serverUrl } = await import('../App');
                                            const res = await axios.post(`${serverUrl}/api/user/favorites/${chefId}`, {}, { withCredentials: true });
                                            dispatch({ type: 'user/setUserData', payload: { ...userData, favoriteChefs: res.data } });
                                        } catch (e) {
                                            console.error(e);
                                        }
                                    }}
                                    className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-all text-sm font-bold cursor-pointer ${userData?.favoriteChefs?.some(c => (c._id || c) === chefId)
                                            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-[#f4a462] hover:text-[#f4a462]'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-lg ${userData?.favoriteChefs?.some(c => (c._id || c) === chefId) ? 'filled' : ''}`}>
                                        favorite
                                    </span>
                                    {userData?.favoriteChefs?.some(c => (c._id || c) === chefId) ? 'Saved to Favorites' : 'Save Chef'}
                                </button>
                            </div>
                            <p className="text-[#f4a462] font-semibold text-lg mb-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">location_on</span>
                                {chef.state}
                                {chef.city && ` • ${chef.city}`}
                                {chef.rating?.average > 0 && ` • ${chef.rating.average.toFixed(1)}/5 Rating`}
                            </p>
                            {chef.experience && <p className="text-slate-500 text-sm mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">work</span>{chef.experience} of experience</p>}
                            {chef.bio && <p className="text-slate-600 leading-relaxed mb-6 max-w-2xl bg-slate-50 p-4 rounded-xl border border-slate-100 italic">"{chef.bio}"</p>}
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-[#f4a462]/5 px-4 py-2 rounded-full border border-[#f4a462]/20">
                                    <span className="material-symbols-outlined text-[#f4a462] text-lg">restaurant_menu</span>
                                    <span className="font-semibold">{items.length} Dishes</span>
                                </div>
                                {chef.mealsServed > 0 && (
                                    <div className="flex items-center gap-2 bg-[#f4a462]/5 px-4 py-2 rounded-full border border-[#f4a462]/20">
                                        <span className="material-symbols-outlined text-[#f4a462] text-lg">delivery_dining</span>
                                        <span className="font-semibold">{chef.mealsServed}+ Meals Served</span>
                                    </div>
                                )}
                                {chef.rating?.count > 0 && (
                                    <div className="flex items-center gap-2 bg-[#f4a462]/5 px-4 py-2 rounded-full border border-[#f4a462]/20">
                                        <span className="material-symbols-outlined text-[#f4a462] text-lg">star</span>
                                        <span className="font-semibold">{chef.rating.count} Reviews</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══ CONTENT ══ */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ── Menu ── */}
                    <div className="flex-1">
                        {/* Category Tabs */}
                        {categories.length > 0 && (
                            <div className="sticky top-16 z-30 bg-[#f8f7f6]/95 py-4 mb-6 border-b border-slate-200 overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: 'none' }}>
                                <div className="flex gap-6">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`pb-2 font-semibold transition-colors cursor-pointer ${activeCategory === cat
                                                ? 'text-[#f4a462] border-b-2 border-[#f4a462]'
                                                : 'text-slate-500 hover:text-[#f4a462]'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Menu Items */}
                        {filteredItems.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center border border-slate-100">
                                <span className="material-symbols-outlined text-5xl text-[#f4a462]/30 mb-4">restaurant_menu</span>
                                <h4 className="text-lg font-bold text-slate-700 mb-2">No dishes available</h4>
                                <p className="text-slate-400">This chef hasn't added any dishes yet. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {filteredItems.map(item => (
                                    <div key={item._id} className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm group hover:shadow-md transition-shadow">
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            {/* Spice Level */}
                                            <div className="absolute top-2 right-2 flex gap-0.5 bg-white/90 px-2 py-1 rounded-full">
                                                {[...Array(3)].map((_, i) => (
                                                    <span key={i} className={`material-symbols-outlined text-sm ${i < (item.spiceLevel || 1) ? 'text-red-500' : 'text-slate-300'}`}>
                                                        local_fire_department
                                                    </span>
                                                ))}
                                            </div>
                                            {/* Food Type Badge */}
                                            <div className="absolute top-2 left-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.foodType === 'veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {item.foodType === 'veg' ? '● VEG' : '● NON-VEG'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-lg">{item.name}</h4>
                                                <span className="font-bold text-[#f4a462] text-lg">₹{item.price}</span>
                                            </div>
                                            {item.description && (
                                                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                                            )}
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={addingId === item._id}
                                                className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${addedId === item._id
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-slate-100 hover:bg-[#f4a462] hover:text-white text-slate-700'
                                                    }`}
                                            >
                                                {addingId === item._id ? (
                                                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                                ) : addedId === item._id ? (
                                                    <><span className="material-symbols-outlined text-sm">check</span> Added!</>
                                                ) : (
                                                    <><span className="material-symbols-outlined text-sm">add_shopping_cart</span> Add to Cart</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <aside className="lg:w-80">
                        <div className="lg:sticky lg:top-24 space-y-6">

                            {/* Chef Info Card */}
                            <div className="bg-white border border-slate-100 rounded-xl p-6">
                                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#f4a462]">info</span> About Chef
                                </h4>
                                <div className="space-y-3 text-sm">
                                    {chef.city && (
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                                            <span className="text-slate-600">{chef.city}, {chef.state}</span>
                                        </div>
                                    )}
                                    {chef.experience && (
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">work_history</span>
                                            <span className="text-slate-600">{chef.experience}</span>
                                        </div>
                                    )}
                                    {chef.specialty && (
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-400 text-lg">restaurant</span>
                                            <span className="text-slate-600">{chef.specialty}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category Quick Links */}
                            {categories.length > 1 && (
                                <div className="bg-white border border-slate-100 rounded-xl p-6">
                                    <h4 className="font-bold text-lg mb-4">Menu Categories</h4>
                                    <ul className="space-y-3">
                                        {categories.map(cat => (
                                            <li key={cat}>
                                                <button
                                                    onClick={() => setActiveCategory(cat)}
                                                    className={`flex items-center gap-3 w-full text-left cursor-pointer transition-colors ${activeCategory === cat ? 'text-[#f4a462] font-semibold' : 'text-slate-600 hover:text-[#f4a462]'}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${activeCategory === cat ? 'bg-[#f4a462]' : 'bg-slate-300'}`} />
                                                    <span className="text-sm">{cat}</span>
                                                    <span className="ml-auto text-xs text-slate-400">
                                                        {items.filter(i => i.category === cat).length}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Back to Region */}
                            {chef.state && (
                                <button
                                    onClick={() => navigate(`/region/${encodeURIComponent(chef.state)}`)}
                                    className="w-full bg-[#f4a462]/5 border border-[#f4a462]/10 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-[#f4a462]/10 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[#f4a462]">explore</span>
                                    <span className="text-sm font-medium text-slate-700">More Chefs in {chef.state}</span>
                                    <span className="material-symbols-outlined text-slate-400 ml-auto">arrow_forward</span>
                                </button>
                            )}
                        </div>
                    </aside>
                </div>
            </main>

            {/* ══ FOOTER ══ */}
            <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 text-white cursor-pointer" onClick={() => navigate('/')}>
                            <span className="material-symbols-outlined text-[#f4a462]">restaurant</span>
                            <span className="text-xl font-bold">Maakhana</span>
                        </div>
                        <div className="flex gap-6 text-sm">
                            <a className="hover:text-white cursor-pointer">Privacy Policy</a>
                            <a className="hover:text-white cursor-pointer">Terms of Service</a>
                            <a className="hover:text-white cursor-pointer">Contact Us</a>
                        </div>
                    </div>
                    <div className="text-center mt-8 text-xs">© 2024 Maakhana Technologies. All rights reserved.</div>
                </div>
            </footer>
        </div>
    )
}

export default ChefMenu
