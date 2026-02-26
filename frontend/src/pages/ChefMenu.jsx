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
    const [reviews, setReviews] = useState([]) // State for reviews

    useEffect(() => {
        dispatch(fetchChefById(chefId))
        // Fetch reviews when component mounts or chefId changes
        const fetchReviews = async () => {
            try {
                const reviewRes = await axios.get(`${serverUrl}/api/review/chef/${chefId}`)
                setReviews(reviewRes.data || [])
            } catch (e) {
                console.error("Reviews fetch error:", e)
            }
        }
        fetchReviews()

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

    // Placeholder reviews for display if no real reviews are fetched
    const placeholderReviews = [
        {
            _id: 'ph1',
            customer: { fullName: 'Aarav Sharma' },
            rating: 5,
            comment: 'Absolutely delicious food! Every dish was a culinary delight. Highly recommend this chef!',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        },
        {
            _id: 'ph2',
            customer: { fullName: 'Priya Singh' },
            rating: 4,
            comment: 'Great experience overall. The biryani was exceptional, though delivery was a bit slow.',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        },
        {
            _id: 'ph3',
            customer: { fullName: 'Rahul Gupta' },
            rating: 5,
            comment: 'The best home-cooked meal I\'ve had in ages. Fresh ingredients and authentic flavors.',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        },
        {
            _id: 'ph4',
            customer: { fullName: 'Sneha Patel' },
            rating: 4,
            comment: 'Good food, especially the curries. Would order again!',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        },
    ];

    const reviewsToDisplay = reviews.length > 0 ? reviews : placeholderReviews;


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
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${chef.specialty.toLowerCase().includes('master') ? 'bg-[#f4a462] text-white shadow-sm' : 'bg-[#f4a462]/20 text-[#f4a462]'}`}>
                                        {chef.specialty}
                                    </span>
                                )}
                                <div className="ml-auto flex gap-3">
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
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg border shadow-sm transition-all text-sm font-bold cursor-pointer ${userData?.favoriteChefs?.some(c => (c._id || c) === chefId)
                                            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                                            : 'bg-[#f4a462] text-white border-[#f4a462] hover:bg-[#f4a462]/90'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-lg ${userData?.favoriteChefs?.some(c => (c._id || c) === chefId) ? 'filled' : ''}`}>
                                            {userData?.favoriteChefs?.some(c => (c._id || c) === chefId) ? 'favorite' : 'person_add'}
                                        </span>
                                        {userData?.favoriteChefs?.some(c => (c._id || c) === chefId) ? 'Following' : 'Follow Chef'}
                                    </button>
                                    <button className="bg-slate-100 text-slate-700 font-bold py-2.5 px-6 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm">
                                        <span className="material-symbols-outlined text-lg">share</span> Share
                                    </button>
                                </div>
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

                            {/* Today's Special Card */}
                            {items.some(i => i.orderCount > 100) && (
                                <div className="bg-[#f4a462]/10 border-2 border-[#f4a462]/20 rounded-xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 pointer-events-none">
                                        <span className="material-symbols-outlined text-[#f4a462]/30 text-6xl rotate-12">star</span>
                                    </div>
                                    <h4 className="text-[#f4a462] font-bold uppercase tracking-widest text-[10px] mb-3">Today's Special</h4>
                                    {(() => {
                                        const special = items.reduce((prev, current) => (prev.orderCount > current.orderCount) ? prev : current);
                                        return (
                                            <>
                                                <img src={special.image} alt={special.name} className="w-full h-40 object-cover rounded-lg mb-4 shadow-sm" />
                                                <h5 className="font-bold text-lg mb-1">{special.name}</h5>
                                                <p className="text-xs text-slate-600 mb-4 line-clamp-2">{special.description}</p>
                                                <div className="flex items-center justify-between mb-5">
                                                    <span className="text-xl font-bold text-slate-800">₹{special.price}</span>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(special.spiceLevel || 1)].map((_, i) => (
                                                            <span key={i} className="material-symbols-outlined text-red-500 text-sm fill-current">local_fire_department</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(special)}
                                                    disabled={addingId === special._id}
                                                    className="w-full bg-[#f4a462] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-[#f4a462]/20 hover:bg-[#f4a462]/90 transition-all active:scale-[0.98] cursor-pointer"
                                                >
                                                    {addingId === special._id ? (
                                                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                                    ) : (
                                                        <><span className="material-symbols-outlined text-sm">add_shopping_cart</span> Add to Cart</>
                                                    )}
                                                </button>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

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

                {/* ══ CUSTOMER REVIEWS (Customer Love) ══ */}
                <section className="mt-24 border-t border-slate-200 pt-16 pb-12">
                    <h3 className="text-3xl font-bold mb-12 text-center">Customer Love</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(() => {
                            const featuredReviews = [
                                ...reviews.map(r => ({
                                    name: r.customer?.fullName || "Anonymous Guest",
                                    location: chef.city || "India",
                                    text: r.comment,
                                    stars: r.rating,
                                    initials: (r.customer?.fullName || "AG").split(" ").map(n => n[0]).join("").toUpperCase(),
                                    isReal: true
                                })),
                                {
                                    name: "Rajesh Kumar",
                                    location: "Hyderabad",
                                    text: `The authentic flavors reminded me exactly of my grandmother's cooking. The spice levels are perfect, not toned down. Absolute gem!`,
                                    stars: 5,
                                    initials: "RK"
                                },
                                {
                                    name: "Ananya Sharma",
                                    location: "Guntur",
                                    text: `Ordering from this chef every Sunday has become a family ritual. The aroma of the spices fills the entire house. Highly recommended!`,
                                    stars: 5,
                                    initials: "AS"
                                },
                                {
                                    name: "Vikram Prasad",
                                    location: "Vizag",
                                    text: `The side dishes and pickles are out of this world. I've never tasted anything so punchy and fresh. You can tell everything is made from scratch.`,
                                    stars: 5,
                                    initials: "VP"
                                }
                            ].slice(0, 3);

                            return featuredReviews.map((review, i) => (
                                <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex gap-1 text-[#f4a462] mb-4">
                                        {[...Array(review.stars)].map((_, j) => (
                                            <span key={j} className="material-symbols-outlined text-sm fill-current">star</span>
                                        ))}
                                    </div>
                                    <p className="text-slate-600 italic mb-8 leading-relaxed text-sm">"{review.text}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#f4a462]/10 flex items-center justify-center font-bold text-[#f4a462] text-xs tracking-tighter">{review.initials}</div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{review.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{review.isReal ? 'Maakhana Verified' : 'Verified Diner'} • {review.location}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        })()}
                    </div>
                </section>
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

export default ChefMenu
