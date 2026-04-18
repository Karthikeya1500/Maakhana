import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FiShoppingCart } from "react-icons/fi";
import axios from "axios";
import { serverUrl } from "../App";
import { setUserData, setMyOrders, addToCartAPI, fetchTopChefsAPI, fetchMostOrderedAPI } from "../redux/userSlice";

const LandingPage = ({ isAuthenticated: propAuth = false }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData, cartItems, topChefs, mostOrderedDishes } = useSelector(state => state.user);
    const isAuthenticated = !!userData || propAuth;
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [addingDishIdx, setAddingDishIdx] = useState(null);
    const [addedDishIdx, setAddedDishIdx] = useState(null);

    useEffect(() => {
        dispatch(fetchTopChefsAPI());
        dispatch(fetchMostOrderedAPI());
    }, [dispatch]);

    const handleAddDish = async (dish, idx) => {
        if (!isAuthenticated) {
            navigate("/signin");
            return;
        }
        setAddingDishIdx(idx);
        try {
            await dispatch(addToCartAPI({
                itemId: `landing-dish-${idx}`,
                name: dish.name,
                image: dish.img,
                price: Number(dish.price.replace(/[₹,]/g, "")),
                quantity: 1,
                chef: dish.chef.split("•")[0].replace("By ", "").trim()
            })).unwrap();
            setAddedDishIdx(idx);
            setTimeout(() => setAddedDishIdx(null), 1500);
        } catch (err) {
            console.error("Add to cart failed:", err);
        } finally {
            setAddingDishIdx(null);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
            dispatch(setUserData(null));
            dispatch(setMyOrders([]));
            setShowProfileMenu(false);
        } catch (error) {
            console.log(error);
        }
    };

    const dishes = [
        {
            name: "Hyderabadi Dum Biryani",
            price: "₹349",
            chef: "By Chef Aruna Reddy • Authentic Andhra Style",
            rating: 5,
            reviews: "120+",
            badge: "Best Seller",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOfibWh71T5evJZVCl2Glgy-Dr1tXEKnizrf0SAwjxVImphGJbfcJP7He-ByMBkZt7v50OX6OLf6SF-7ZhAyFg7Sh7DG3tKBSD08IlKmTiqZifJwVL1X0FyfdLCFdMkspmvS9GSULE368bQsDwekCkepqSY2_nMXfsx2LLmnCnZ2Dfg3Z2GBd4V6RGnydstmM7553pqlo9dCEDlBxWxSYgfwU3MYLwYH-QbdNQb_1IDaf_jQ0xpX36QF6308Iq0p6ZFSyDOe2yB5o",
        },
        {
            name: "Old Delhi Butter Chicken",
            price: "₹299",
            chef: "By Chef Jaspreet Singh • Traditional Spice Mix",
            rating: 4.5,
            reviews: "85+",
            badge: null,
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWcRwx9JUeiYVH1zAOGpY5whTSZLkmYiZdgBUyjWeHdCGfGko4bnLn_K-01NlLhF0VR7DassKWcDWISob4PYc0w0ISThbdlgwHNwQFx8sNVLRkWHhMidUczcaPERRwPyanKkx2frPbjtOjdS79FTRsIuWmpsIUJpPamSgr9cUl_k65jo8FnvafTVmXSOemISK0gx6xU0x9xCFIm9yZd5ysHkpFrBIrZEJ366PWII80D4tihz0hA8uKxBWXIHFaK5phpeWyVDtwrKU",
        },
        {
            name: "Shorshe Ilish (Fish)",
            price: "₹420",
            chef: "By Chef Debasree Das • Mustard Oil Base",
            rating: 5,
            reviews: "50+",
            badge: null,
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCszNu7uGgdLH0MMSXDE_b7ilV2DKk3Hun-4aUmftDAXwx9Cfb12fvN0RifzyiEJEKeCU1gWNGJ7sKHENo-2kPsLhkn4_aDNDbX1OpMIk5poXcP9NKlDg7VPMbpXeVKvGh0NwSL2jm4luN2PhNI3UsCRAxVQqrWkBKGTsjIpzRHAP2TCqHDtWxqaBfqvzBoK-klcN6V9PA3ZMDkTPFDFlPfHMOVOYqx9bafRPBrMPnvCaa4MfxrLfEzKhw7uZPq_XDHP2OBD2DTIrM",
        },
    ];

    return (
        <div
            className="bg-[#f8f7f6] text-slate-900 min-h-screen"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
            {/* ══════════ UNIFIED STICKY NAVBAR ══════════ */}
            {/* Same header for all users — right side adapts based on auth state */}
            <header className="sticky top-0 z-50 w-full border-b border-[#f4a462]/10 bg-[#f8f7f6]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-8 h-8 bg-[#f4a462] rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#221810] font-bold text-lg">
                                    restaurant
                                </span>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-slate-900">
                                Maakhana
                            </span>
                        </div>

                        {/* Nav Links */}
                        <nav className="hidden md:flex items-center gap-8">
                            <a className="text-sm font-semibold hover:text-[#f4a462] transition-colors cursor-pointer" href="#hero">Home</a>
                            <a className="text-sm font-semibold hover:text-[#f4a462] transition-colors cursor-pointer" href="#explore">Explore</a>
                            <a className="text-sm font-semibold hover:text-[#f4a462] transition-colors cursor-pointer" href="#about">About</a>
                            <a className="text-sm font-semibold hover:text-[#f4a462] transition-colors cursor-pointer" onClick={() => navigate("/signup")}>Become a Chef</a>
                        </nav>

                        {/* Right side: cart+profile when logged in, login buttons when guest */}
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                {/* Cart Icon */}
                                <div
                                    className="relative cursor-pointer p-1"
                                    onClick={() => navigate('/cart')}
                                >
                                    <FiShoppingCart size={22} className="text-slate-700 hover:text-[#f4a462] transition-colors" />
                                    {cartItems?.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f4a462] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </div>

                                {/* My Orders */}
                                <button
                                    className="hidden sm:flex text-sm font-bold px-4 py-2 rounded-lg bg-[#f4a462]/10 text-[#f4a462] hover:bg-[#f4a462]/20 transition-colors cursor-pointer"
                                    onClick={() => navigate('/my-orders')}
                                >
                                    My Orders
                                </button>

                                {/* Profile Avatar — click goes to full Profile page */}
                                <div
                                    className="w-9 h-9 rounded-full bg-[#f4a462] text-white font-bold flex items-center justify-center cursor-pointer shadow-md hover:brightness-95 transition-all select-none"
                                    onClick={() => navigate('/profile')}
                                    title="View Profile"
                                >
                                    {userData?.fullName?.slice(0, 1).toUpperCase()}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <button
                                    className="hidden sm:flex text-sm font-bold px-4 py-2 hover:text-[#f4a462] transition-colors cursor-pointer"
                                    onClick={() => navigate("/signin")}
                                >
                                    Login
                                </button>
                                <button
                                    className="bg-[#f4a462] text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer"
                                    style={{ boxShadow: "0 8px 20px rgba(244, 164, 98, 0.25)" }}
                                    onClick={() => navigate("/signup")}
                                >
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ══════════ HERO SECTION ══════════ */}
            <section id="hero" className="relative h-[600px] w-full flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        className="w-full h-full object-cover"
                        alt="Vibrant variety of Indian regional dishes spread on a table"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB92zAj6McwpqC7Drbzc2Mtzq-h5VyK9bJBpFOyJNxaHSp8GrMQq9Mpxz6ecNgvV89pq8EGX7OSWOsvlyR5h9CAWy86yn_YGIZr7SV-vdTJCRNemUG_69YiFPC9OG1Uuo-AbsBLcalvVtLwd1c_CvoRPDZVRUEux3WKfUX6woMzTMxRO0N4KY03vKPVsk3LFEwsQVXcZ0HYP2STWdQC3bdSakWXpjGG_DSieMiKLwBfbg_eQg2NyjjjZ_pDCq7tdtUKBchHkhqONQA"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl space-y-6">
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                            Authentic Regional Home Food{" "}
                            <span className="text-[#f4a462]">Delivered.</span>
                        </h1>
                        <p className="text-xl text-slate-200 font-medium max-w-lg">
                            Taste home, wherever you are. Connecting you with passionate home
                            chefs from every corner of India.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                className="bg-[#f4a462] hover:bg-[#f4a462]/90 text-slate-900 font-bold px-8 py-4 rounded-xl text-lg shadow-xl flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
                                style={{ boxShadow: "0 12px 30px rgba(244, 164, 98, 0.35)" }}
                                onClick={() => navigate("/signin")}
                            >
                                Order Now{" "}
                                <span className="material-symbols-outlined">shopping_bag</span>
                            </button>
                            <button
                                className="bg-[#4ade80]/20 hover:bg-[#4ade80]/30 text-[#4ade80] border border-[#4ade80]/30 backdrop-blur-md font-bold px-8 py-4 rounded-xl text-lg flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
                                onClick={() => navigate("/signup")}
                            >
                                Become a Home Chef{" "}
                                <span className="material-symbols-outlined">chef_hat</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ HOW IT WORKS ══════════ */}
            <section className="py-20 bg-[#f8f7f6]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            How It Works
                        </h2>
                        <div className="h-1.5 w-20 bg-[#f4a462] mx-auto rounded-full" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: "map",
                                title: "Select Region",
                                desc: "Pick your favorite Indian state or specific regional cuisine you're craving today.",
                            },
                            {
                                icon: "person_search",
                                title: "Choose Chef",
                                desc: "Browse verified home chefs, check their specialties, and read community reviews.",
                            },
                            {
                                icon: "delivery_dining",
                                title: "Get Food",
                                desc: "Enjoy freshly cooked, authentic home meals delivered right to your doorstep.",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center space-y-4 p-8 rounded-xl bg-white shadow-sm border border-[#f4a462]/5 hover:shadow-md transition-shadow"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#f4a462]/10 flex items-center justify-center text-[#f4a462] mb-2">
                                    <span className="material-symbols-outlined text-4xl">
                                        {item.icon}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ EXPLORE BY REGION ══════════ */}
            <section className="py-20 bg-[#f4a462]/5" id="explore">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">
                                Explore Home Chefs by State
                            </h2>
                            <p className="text-slate-600 italic">
                                Discover the diverse flavors of India's states
                            </p>
                        </div>
                        <button className="text-[#f4a462] font-bold flex items-center gap-1 hover:underline cursor-pointer" onClick={() => navigate('/regions')}>
                            View all regions{" "}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[
                            {
                                name: "Andhra Pradesh",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHci6X1DLpnKqU7URaaZMZimwTWHks_K61HaPAJ2a2iaAD8ynh59oWXMgg5ITn2DtrjYjbWDv-1L7LsimSErhml7omXfLeSJb9Inw2_PC2XPuvfbfi26X6g_Ra-HE5N34IhgrXAMb3I7-IIm-ULKnzAWGgDnhzu1wTZg09DJck9_I_MEEABKb4U1n7ZoFrVjwEDbsRwuZyz59uodwcYZONsORZfS7FJ4ZtWkhYHOYs22RD4J-REJxhpRIxTn98JmvUHUX1SXqZ3eE",
                            },
                            {
                                name: "Punjab",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKOayKb2q5DmpdjihVX3vSx7RQT7gRZb4UmRqR2E6PDw8gC7f9deSYJkcx-MTQhJjxAikSDqNuRnKBp_ObM4yxEIInu0Sr7Fj8NPv4X4n1e5l-jHaxm4t0OWFSWoS6mpYzJeWGD1JozkbDD_W8jM5TYoHlCGVKm_MY57bmrp25Ds67Zf6BkBU8FoZJYYhkFPrNgziR_xgYBJpc1jl5Zd3HhG_1ymtGf3Mh71tHCtQ9gB4VDdhozoqIv9Oj3uDUZnCV5zo-DI0gxPY",
                            },
                            {
                                name: "Kerala",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQboMU5eQ-_GHBSAD5PNEMQ1edTOVNoerj6ewaop690IkCn4FuntKrp2ZVPSgJyjoyU1hxqlP-5UTd-45bF7W2yYzdpVxr7EUhjw3aLh1zc5KdtV0-GOeDcsf5rR5ae9Y0SAStqoNBe5w7yqNySxErLaTD1WYXUJYW34l6wjpp9b-vddvcMzXpQygxIdKb_NBUMwOXL6ypr-tdZIdEWdvgihKoxyrJtx6TjH0swzbZ8SpbeiKqIIyoPpUcQPWoar70mmyzjUlB4n8",
                            },
                            {
                                name: "West Bengal",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNytZULHsXY5jNOYJjL6b1g-_gS6SXYO44y4HbqvT4OGvL-hm2NlAy3OmeDgA4IMyaoRwH94a7w1dLUIaynUqJgD7y1tyjpt_fBRygLzJRSvqSbnP-VHHWIgrCeMqQugYMne2Dork5f4pP2z0YnLTcWSU8LZZpN3l8z61mGLYPRS7eNxLSkqTQw_qAlCigZa5lfdhtET-WqJw11y4YKNg2_4ffSt3CcTMqqgYGWSKw523arut4jwRu_lGewwa1cVK1MzplNt7RZIE",
                            },
                            {
                                name: "Maharashtra",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuApslgpNOf6TBFR1SqwL6dL_yc7TCDmq9KG3FAcoWKGTS7cJ4DNXsZZorh1bqufGO9hsWMVBqlQy9W2CF3Um8M3m6LmZcgMZvwiOnwrSO5I7Rp6cg6zQdP7CVj8yW3dM3pYCWKXekpGohwprre7KNdOHMi8wgDqQaCVZDa9T8lJFITWfK4aAwoNBPoNAYkhYEXgws3OZr_f2fGVx3BW88ppkrLbLSKTqQ2bXVG0gCldjLWPk4VEEEI5DYImV7_RYVB8YOho2LOGwoE",
                            },
                            {
                                name: "Tamil Nadu",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVRtm80ubthpJOeVjIXqvT1Dx5VmQPFHyzq4P3nMbowCqIZm7vltBRsHBW0dJ4kG50YM2Lh67a26kh_LI0-tILanYcDaLC_fcGitOL2rN4Skqc2--Gp5mMwWcRod8wu8b2dxICyJ7pTBpGLGb8reHEW9iaNGKEOoe9RgP-MvzAf-aimuz9FDTpBlsu3BTX1Y7QXQlBKFvWE_zqT-HjpbOYN5DtOimLob7qD6zOYwuoaqodYGR5edOML1MC9ETnHrE1CFAjrYxoVFE",
                            },
                            {
                                name: "Rajasthan",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDmh-Yfim8pqC-czh4zNisVo4aINcS_CfXInFDGJrjaMEOQUYOATp-AxXJbsO6O7gTg5vk1lR0dvtBe-twcZuvIly_dd1_H--zcxxW1fk6YTrK1XMVENwv9iJqCNRps5DsJEb3jHwKAGDbThU8tA4qDGrSzzzd6WPpWoWIfwK95o-PEoSgyXUt8kwqmxJ46_1WwBFXoq7duVwvsvk9DKxoCzaKZP6mZG7El_zmsZVmdopgGcwrwWgBZTheWdDZL_q4tYcKzNbdGcI",
                            },
                            {
                                name: "Gujarat",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDa4IPV8U7PCS3EZ5cO9vw39DwPfp9B_iuqHX0aTfQcXmct44duRHHnocUbz8nN0ziifvWUg0mpSdglNie-LfZDTrFQZxgmqNKmnBsIH08S2eocAEyEde4pGMfCAE9tw-jSdGe4oEWrUWlNVlpfv70lxy1OFX9ghF3zcOJ1JnnU_3qfzDDSACylW7bTC6P6raxTBHA1j37RvBtTNcZUl9S8o6GNeB-bau87q1cslHwNtOKFn1iDTjuOHM3qEHOv7k_hXkNkSQY_3dI",
                            },
                        ].map((region, i) => (
                            <div
                                key={i}
                                className="group relative h-48 rounded-xl overflow-hidden cursor-pointer"
                                onClick={() => navigate(`/region/${encodeURIComponent(region.name)}`)}
                            >
                                <img
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt={region.name}
                                    src={region.img}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                    <h3 className="text-white font-bold text-lg">
                                        {region.name}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ MOST ORDERED DISHES (from DB) ══════════ */}
            <section className="py-20 bg-[#f8f7f6]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">Most Ordered Dishes</h2>
                        <p className="text-slate-600 italic">Dishes our community can't get enough of</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(mostOrderedDishes.length > 0 ? mostOrderedDishes : dishes).map((dish, i) => {
                            const isDB = !!dish._id;
                            const dishName = isDB ? dish.name : dish.name;
                            const dishPrice = isDB ? `₹${dish.price}` : dish.price;
                            const dishImg = isDB ? (dish.image || 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(dish.name)) : dish.img;
                            const dishChef = isDB ? `By ${dish.shop?.name || 'Chef'} • ${dish.shop?.state || ''}` : dish.chef;
                            const dishRating = isDB ? (dish.rating?.average || 0) : dish.rating;
                            const dishReviews = isDB ? `${dish.orderCount || 0} orders` : dish.reviews;
                            return (
                                <div key={dish._id || i} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-[#f4a462]/10">
                                    <div className="h-56 relative group overflow-hidden cursor-pointer" onClick={() => isDB && dish.shop?._id ? navigate(`/chef/${dish.shop._id}`) : null}>
                                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={dishName} src={dishImg} />
                                        {isDB && dish.orderCount > 50 && (
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#f4a462] shadow-sm">Best Seller</div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold">{dishName}</h3>
                                            <span className="text-lg font-bold text-[#f4a462]">{dishPrice}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-4">{dishChef}</p>
                                        <div className="flex items-center gap-1 mb-6 text-yellow-500">
                                            {Array.from({ length: Math.floor(dishRating) }).map((_, j) => (
                                                <span key={j} className="material-symbols-outlined text-sm">star</span>
                                            ))}
                                            {dishRating % 1 >= 0.25 && (<span className="material-symbols-outlined text-sm">star_half</span>)}
                                            <span className="text-xs text-slate-400 ml-1">({dishReviews})</span>
                                        </div>
                                        <button
                                            className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${addedDishIdx === i ? 'bg-green-500 text-white' : 'bg-[#f4a462] text-slate-900 hover:bg-[#f4a462]/90'}`}
                                            onClick={() => {
                                                if (isDB) {
                                                    if (!isAuthenticated) { navigate('/signin'); return; }
                                                    setAddingDishIdx(i);
                                                    dispatch(addToCartAPI({ itemId: dish._id, name: dish.name, image: dish.image || '', price: dish.price, quantity: 1, chef: dish.shop?.name || '' })).unwrap().then(() => { setAddedDishIdx(i); setTimeout(() => setAddedDishIdx(null), 1500); }).catch(console.error).finally(() => setAddingDishIdx(null));
                                                } else { handleAddDish(dish, i); }
                                            }}
                                            disabled={addingDishIdx === i}
                                        >
                                            {addingDishIdx === i ? (<span className="material-symbols-outlined animate-spin">progress_activity</span>) : addedDishIdx === i ? (<><span className="material-symbols-outlined">check</span> Added to Cart</>) : (<><span className="material-symbols-outlined">add_shopping_cart</span> Add to Cart</>)}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════ TOP CHEFS (from DB) ══════════ */}
            <section className="py-20 bg-[#f8f7f6]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Top Home Chefs</h2>
                        <p className="text-slate-600 max-w-xl mx-auto italic">Real people, secret family recipes, and a passion for feeding others.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {(topChefs.length > 0 ? topChefs : []).map((c) => (
                            <div key={c._id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center border border-[#f4a462]/5">
                                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-[#f4a462]/20 bg-[#f4a462]/10 flex items-center justify-center">
                                    {c.image ? (<img className="w-full h-full object-cover" alt={c.name} src={c.image} />) : (<span className="material-symbols-outlined text-5xl text-[#f4a462]/40">person</span>)}
                                </div>
                                <h3 className="text-lg font-bold">{c.name}</h3>
                                <p className="text-[#f4a462] text-sm font-semibold mb-1">{c.specialty || c.state}</p>
                                <p className="text-slate-400 text-xs mb-3">{c.city}, {c.state}</p>
                                <div className="flex items-center gap-1 text-yellow-500 mb-6">
                                    <span className="material-symbols-outlined text-sm">star</span>
                                    <span className="font-bold text-sm">{c.rating?.average?.toFixed(1) || 'New'}</span>
                                    <span className="text-slate-400 text-sm font-normal ml-1">({c.mealsServed || 0} meals)</span>
                                </div>
                                <button className="w-full py-2 bg-slate-100 font-bold rounded-lg text-sm hover:bg-[#f4a462] hover:text-slate-900 transition-colors cursor-pointer" onClick={() => navigate(`/chef/${c._id}`)}>
                                    View Menu
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ WHY CHOOSE MAAKHANA ══════════ */}
            <section className="py-24 bg-[#221810] text-white" id="about">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                Why Choose{" "}
                                <span className="text-[#f4a462]">Maakhana?</span>
                            </h2>
                            <p className="text-slate-400 text-lg mb-10">
                                We're on a mission to bring back the nostalgia of homemade meals
                                while empowering home cooks across the country.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {[
                                    {
                                        icon: "restaurant",
                                        title: "Authentic Taste",
                                        desc: "Secret family recipes passed through generations.",
                                    },
                                    {
                                        icon: "health_and_safety",
                                        title: "100% Hygienic",
                                        desc: "Strict quality checks & kitchen sanitization.",
                                    },
                                    {
                                        icon: "payments",
                                        title: "Affordable",
                                        desc: "Delicious home meals that don't break the bank.",
                                    },
                                    {
                                        icon: "volunteer_activism",
                                        title: "Support Local",
                                        desc: "Directly supporting local home entrepreneurs.",
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="p-2 bg-[#f4a462]/20 rounded-lg text-[#f4a462]">
                                            <span className="material-symbols-outlined">
                                                {item.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{item.title}</h4>
                                            <p className="text-slate-400 text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    className="w-full h-[500px] object-cover"
                                    alt="Traditional kitchen setting with fresh ingredients"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBzIAMynzl8sC7WsR_F3vIV_eefDaVuiqqr1gr6EXrfLemVUGEldtZvWnmou2ZGWlxJaM6YJytM09FTp_2T_xkoTgG_c7yAWYu0KmlaSnSVDvxYeE3z4pvoNnR4u-EMZVMnFcKWGAjLYeAmugJZFdQS27kKQCHULHnGBJ2B0yesKZNtPLhaxLspiZ2t6QWzv0R_epHgpCElYudvBLPd-m0CBSJXJH3kYmZwWwAamcIhwiPfXP9TdReBTaHSv2GRnkgxanqIcYWY7E"
                                />
                            </div>
                            <div
                                className="absolute -bottom-8 -left-8 bg-[#f4a462] p-8 rounded-2xl shadow-xl hidden md:block"
                            >
                                <p className="text-slate-900 font-black text-4xl mb-1">
                                    5000+
                                </p>
                                <p className="text-slate-900 font-bold opacity-80">
                                    Verified Home Chefs
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ TESTIMONIALS ══════════ */}
            <section className="py-20 bg-[#f8f7f6]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            What Our Foodies Say
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                quote:
                                    "Living away from home in Bangalore, I missed my mom's cooking every single day. Maakhana brought that taste back into my life. The Kerala beef roast was just like home!",
                                name: "Rahul Krishnan",
                                role: "Software Engineer",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-rcfPXBkHgZmvggVsMz8B2qLvXdjZgbsj1I5jpPYmOxCNUsqFvHX6KLEu87o9Q-GxAlz9J0SZ9Auz-ljEIwNOt9Evvgk6HNXkKyd1QNXWQy9LH56LbOJCqEfkiE5ms_SDEH3JaVuq0jEbhPrBQoO76jWeRlde90bNJoyiCRWJR7BkBvoycGj6PKqZrc96fZJ_K1z9-SfErBUfktZCUz167ItEX2p4_eTdHyIlySm5Y4rp8H7ch8SF0TEixKK4ViHnJ9NItpodd7g",
                            },
                            {
                                quote:
                                    "The variety is incredible. One day I'm having authentic Rajasthani Dal Baati, and the next day I'm exploring Naga cuisine. Everything is so fresh and clean.",
                                name: "Priya Sharma",
                                role: "Food Blogger",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCvLixxO48EnXTRT0npbH9T_bIUO_g6Hp0NGcZTQTA1fehGYws2ry4-bKaYK7ps2j2Dc-cGCWJGjyBH3eNtwAhmqt9jXJSYleAKfwJ_Le0clFNRayTokUb_7yFk5oo0TQYg9fHD6wQKo5v6QoVWhz2Yvch6cndi_54VVNUEAmcbnmfCweKwIj0-RwV0AupXckfCHNGbeaxUYBHEx7iITZ_1bZNbS3scGDtbhnqfxWRrio1KoqVXNuL-QEUaLfK9CFwdfZoqmzHQ7U",
                            },
                            {
                                quote:
                                    "As a home chef, Maakhana has given me a platform to share my passion for cooking with the world. It's wonderful to see people enjoying my family recipes.",
                                name: "Mrs. Verma",
                                role: "Home Chef Partner",
                                img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3n0veShD9QmLIE5_ghncCs6Y59Mmcz2FzHBWwF4w4BmQs8GP6NZ5cxdGeM9i9XAL40Pro3WSeBxY2lF7f3L2N2aRzRzQ3-DY6-rvOGAIfxRn4j5mwyJLPFIk-Nn-3SGC6ECn8C3hixBsVNrJZzhtweoF2XTDT8O3NODcu3G6Qhou5Mjhl-acUPo3IQCczK1wXDSVzaAFQ7OdK077cQnSzvUt2eOXmLko14KlmdO6fIn-CNWCZiCGrbo3A3qsFxxSkxPFGbPOzm20",
                            },
                        ].map((testimonial, i) => (
                            <div
                                key={i}
                                className="bg-white p-8 rounded-xl shadow-sm border border-[#f4a462]/10"
                            >
                                <div className="text-[#f4a462] mb-4">
                                    <span className="material-symbols-outlined">
                                        format_quote
                                    </span>
                                </div>
                                <p className="text-slate-600 mb-8 italic">
                                    "{testimonial.quote}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden">
                                        <img
                                            className="w-full h-full object-cover"
                                            alt={testimonial.name}
                                            src={testimonial.img}
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{testimonial.name}</h4>
                                        <p className="text-xs text-slate-500">
                                            {testimonial.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ FOOTER ══════════ */}
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
                        <a className="hover:text-[#f4a462] cursor-pointer transition-colors" href="#hero">Home</a>
                        <a className="hover:text-[#f4a462] cursor-pointer transition-colors" href="#about">About</a>
                        <a className="hover:text-[#f4a462] cursor-pointer transition-colors" onClick={() => navigate('/regions')}>Regions</a>
                        <a className="hover:text-[#f4a462] cursor-pointer transition-colors">Privacy Policy</a>
                        <a className="hover:text-[#f4a462] cursor-pointer transition-colors">Contact</a>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs text-center md:text-left">
                    <p>© 2024 Maakhana Foods Pvt Ltd. All rights reserved.</p>
                    <p className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">favorite</span> Celebrating Indian Regional Heritage</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
