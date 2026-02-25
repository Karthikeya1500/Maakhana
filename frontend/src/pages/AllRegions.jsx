import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

const AllRegions = () => {
    const navigate = useNavigate();
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/region/all`);
                setRegions(res.data);
            } catch (err) {
                console.error("Failed to fetch regions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRegions();
    }, []);

    return (
        <div className="bg-[#f8f7f6] text-slate-900 min-h-screen" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#f4a462]/10 px-4 lg:px-20 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <div className="w-8 h-8 bg-[#f4a462] rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#221810] font-bold text-lg">restaurant</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight">Maakhana</span>
                    </div>
                    <button onClick={() => navigate("/")} className="bg-[#f4a462] hover:bg-[#f4a462]/90 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer">
                        Back Home
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        Explore All <span className="text-[#f4a462]">Regions</span>
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Discover the diverse flavors of India — from the spicy south to the rich north, every state has a unique culinary story.
                    </p>
                    <div className="h-1.5 w-20 bg-[#f4a462] mx-auto rounded-full mt-6" />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="material-symbols-outlined text-5xl text-[#f4a462] animate-spin">progress_activity</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {regions.map((region) => (
                            <div
                                key={region._id}
                                className="group relative h-56 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                onClick={() => navigate(`/region/${encodeURIComponent(region.name)}`)}
                            >
                                <img
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt={region.name}
                                    src={region.image || "https://via.placeholder.com/400x300?text=" + region.name}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute inset-0 flex flex-col justify-end p-4">
                                    <h3 className="text-white font-bold text-lg leading-tight">{region.name}</h3>
                                    {region.famousDishes?.length > 0 && (
                                        <p className="text-white/70 text-xs mt-1 line-clamp-1">
                                            {region.famousDishes.slice(0, 3).join(" • ")}
                                        </p>
                                    )}
                                </div>
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-[#f4a462] text-lg">arrow_forward</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllRegions;
