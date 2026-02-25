import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import Region from "./models/region.model.js";
import User from "./models/user.model.js";
import chef from "./models/chef.model.js";
import Item from "./models/item.model.js";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(source, folder) {
    try {
        const result = await cloudinary.uploader.upload(source, {
            folder: `maakhana/${folder}`,
            transformation: [{ width: 600, height: 600, crop: "fill" }],
        });
        console.log(`  ☁️  Uploaded: ${result.public_id}`);
        return result.secure_url;
    } catch (err) {
        console.log(`  ⚠️  Upload failed, using source: ${err.message}`);
        return source;
    }
}

// ─── Realistic region-specific chef images ───────────────────────
// Each chef has a unique image showing them actively cooking regional cuisine
const CHEF_IMAGES = {
    "Andhra Pradesh_1": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&h=600&fit=crop",
    "Andhra Pradesh_2": "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&h=600&fit=crop",
    "Punjab_1": "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=600&h=600&fit=crop",
    "Punjab_2": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop",
    "Kerala_1": "https://images.unsplash.com/photo-1531123414708-a50afd9c45a1?w=600&h=600&fit=crop",
    "Kerala_2": "https://images.unsplash.com/photo-1618018352910-ec7b4d9ff64c?w=600&h=600&fit=crop",
    "Tamil Nadu_1": "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=600&h=600&fit=crop",
    "Tamil Nadu_2": "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=600&h=600&fit=crop",
    "Rajasthan_1": "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&h=600&fit=crop",
    "Rajasthan_2": "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=600&h=600&fit=crop",
    "Gujarat_1": "https://images.unsplash.com/photo-1615594951167-1110e53ef788?w=600&h=600&fit=crop",
    "Gujarat_2": "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&h=600&fit=crop",
    "Karnataka_1": "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&h=600&fit=crop",
    "Karnataka_2": "https://images.unsplash.com/photo-1618018357354-9556d05fdd58?w=600&h=600&fit=crop",
    "Telangana_1": "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=600&h=600&fit=crop",
    "Telangana_2": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop"
};

// Authentic Indian food images (royalty-free)
const DISH_SOURCE_IMGS = {
    "Hyderabadi Dum Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop",
    "Gongura Chicken": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop",
    "Pesarattu": "https://images.unsplash.com/photo-1627308595229-7830f5c90683?w=600&h=400&fit=crop",
    "Andhra Fish Curry": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop",
    "Pulihora": "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=600&h=400&fit=crop",
    "Butter Chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop",
    "Sarson Ka Saag": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=400&fit=crop",
    "Amritsari Kulcha": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=400&fit=crop",
    "Kerala Fish Curry": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop",
    "Appam with Stew": "https://images.unsplash.com/photo-1627308595229-7830f5c90683?w=600&h=400&fit=crop",
    "Puttu and Kadala": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
    "Shorshe Ilish": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    "Kosha Mangsho": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop",
    "Mishti Doi": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&h=400&fit=crop",
    "Vada Pav": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Vada_Pav-Indian_street_food.JPG/960px-Vada_Pav-Indian_street_food.JPG",
    "Misal Pav": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop",
    "Puran Poli": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=400&fit=crop",
    "Chettinad Chicken": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&h=400&fit=crop",
    "Masala Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=400&fit=crop",
    "Filter Coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop",
    "Dal Baati Churma": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/DalBati.jpg/960px-DalBati.jpg",
    "Laal Maas": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Lal_maans_authentic.jpg/960px-Lal_maans_authentic.jpg",
    "Ghewar": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&h=400&fit=crop",
    "Dhokla": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    "Undhiyu": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    "Poha": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=400&fit=crop",
    "Gujarati Thali": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop",
    "Bisi Bele Bath": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Bisi_Bele_Bath.JPG/800px-Bisi_Bele_Bath.JPG",
    "Mysore Pak": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Mysore_pak.jpg/800px-Mysore_pak.jpg",
    "Ragi Mudde": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Ragi_Mudde_and_Mutton_Saaru.jpg/800px-Ragi_Mudde_and_Mutton_Saaru.jpg",
    "Haleem": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Haleem_at_Hussain_Umar_Lodge.jpg/800px-Haleem_at_Hussain_Umar_Lodge.jpg",
    "Double Ka Meetha": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Double_Ka_Meetha.JPG/800px-Double_Ka_Meetha.JPG",
    "Hyderabadi Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/A_plate_of_Hyderabadi_biryani.jpg/800px-A_plate_of_Hyderabadi_biryani.jpg",
    "Lucknowi Biryani": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Awadhi_Mutton_Biryani.jpg/800px-Awadhi_Mutton_Biryani.jpg",
    "Galouti Kebab": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Galouti_Kebab_with_Ulta_Tawa_Paratha.jpg/800px-Galouti_Kebab_with_Ulta_Tawa_Paratha.jpg",
    "Bedmi Puri": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bedmi_Poori_%28Deep_Fried_Lentil_Bread%29.JPG/800px-Bedmi_Poori_%28Deep_Fried_Lentil_Bread%29.JPG",
    "Fish Curry Rice": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Goan_Fish_Curry.jpg/800px-Goan_Fish_Curry.jpg",
    "Vindaloo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Pork_vindaloo.jpg/800px-Pork_vindaloo.jpg",
    "Bebinca": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Bebinca.jpg/800px-Bebinca.jpg",
    "Litti Chokha": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Litti_Chokha_Dish.jpg/800px-Litti_Chokha_Dish.jpg",
    "Sattu Paratha": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sattu_Paratha.jpg/800px-Sattu_Paratha.jpg",
    "Thekua": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Thekua-Bihar.jpg/800px-Thekua-Bihar.jpg",
    "Dal Bafla": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Dal_Bafla.JPG/800px-Dal_Bafla.JPG",
    "Bhutte Ka Kees": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bhutte_Ka_Kees.JPG/800px-Bhutte_Ka_Kees.JPG",
    "Dalma": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Dalma.JPG/800px-Dalma.JPG",
    "Chhena Poda": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Chhena_Poda.jpg/800px-Chhena_Poda.jpg",
    "Pakhala": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Pakhala_Thali.jpg/800px-Pakhala_Thali.jpg",
    "Appam": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Appam_with_Egg_Roast_and_Vegetable_Stew.jpg/800px-Appam_with_Egg_Roast_and_Vegetable_Stew.jpg",
    "Fish Curry": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Kerala_Fish_Curry.jpg/800px-Kerala_Fish_Curry.jpg",
    "Puttu": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Puttu_with_kadala_curry.jpg/800px-Puttu_with_kadala_curry.jpg",
    "Macher Jhol": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Macher_Jhol.jpg/800px-Macher_Jhol.jpg",
    "Luchi": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Luchi_Alur_Dom.jpg/800px-Luchi_Alur_Dom.jpg",
    "Rosogolla": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Rasgulla.jpg/800px-Rasgulla.jpg",
    "Pav Bhaji": "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=600&h=400&fit=crop",
    "Dosa": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Dosa_and_chutney.jpg/800px-Dosa_and_chutney.jpg",
    "Idli": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Idli_Sambar.jpg/800px-Idli_Sambar.jpg",
    "Thepla": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Thepla.jpg/800px-Thepla.jpg",
    "default": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
};


const REGIONS = [
    { name: "Andhra Pradesh", description: "Known for bold spices and rich culinary heritage.", sourceImg: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop", famousDishes: ["Biryani", "Gongura Chicken"], tags: [{ icon: "local_fire_department", label: "Fiery Spices" }, { icon: "set_meal", label: "Coastal Delicacies" }] },
    { name: "Punjab", description: "Land of butter, wheat, and vibrant flavours.", sourceImg: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop", famousDishes: ["Butter Chicken", "Sarson Ka Saag"], tags: [{ icon: "breakfast_dining", label: "Tandoori Classics" }, { icon: "local_dining", label: "Dairy-Rich Dishes" }] },
    { name: "Kerala", description: "Coconut-infused curries and spice-route flavours.", sourceImg: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&h=400&fit=crop", famousDishes: ["Appam", "Fish Curry"], tags: [{ icon: "set_meal", label: "Seafood Specials" }, { icon: "eco", label: "Ayurvedic Touch" }] },
    { name: "Tamil Nadu", description: "Filter coffee, crispy dosas and chettinad masalas.", sourceImg: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&h=400&fit=crop", famousDishes: ["Dosa", "Chettinad Chicken"], tags: [{ icon: "local_cafe", label: "Filter Coffee" }, { icon: "set_meal", label: "Chettinad Delicacies" }] },
    { name: "Rajasthan", description: "Royal kitchens gifted dal baati churma and laal maas.", sourceImg: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop", famousDishes: ["Dal Baati", "Laal Maas"], tags: [{ icon: "local_fire_department", label: "Laal Maas" }, { icon: "history_edu", label: "Royal Recipes" }] },
    { name: "Gujarat", description: "Vegetarian cuisine bursting with sweetness and spice.", sourceImg: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop", famousDishes: ["Dhokla", "Undhiyu"], tags: [{ icon: "eco", label: "Pure Vegetarian" }, { icon: "local_dining", label: "Thali Feasts" }] },
    { name: "Karnataka", description: "Mysore pak, Bisi Bele Bath and filter coffee culture.", sourceImg: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop", famousDishes: ["Bisi Bele Bath", "Mysore Pak"], tags: [{ icon: "local_cafe", label: "Coffee Culture" }, { icon: "eco", label: "Millet Cuisine" }] },
    { name: "Telangana", description: "Hyderabadi biryani and fiery Telangana curries.", sourceImg: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop", famousDishes: ["Hyderabadi Biryani", "Haleem"], tags: [{ icon: "local_fire_department", label: "Spicy Curries" }, { icon: "set_meal", label: "Biryani Capital" }] }
];

const CHEF_DATA = {
    "Andhra Pradesh": [
        {
            name: "Swathi Reddy", city: "Hyderabad", specialty: "Andhra Cuisine", bio: "Third-generation cook keeping her grandmother's fiery Andhra spice blends alive.", experience: "15 Years", dishes: [
                { name: "Hyderabadi Dum Biryani", category: "Main Course", foodType: "non veg", price: 349, spiceLevel: 3, description: "Slow-cooked basmati rice with tender meat.", orderCount: 120 },
                { name: "Gongura Chicken", category: "Main Course", foodType: "non veg", price: 279, spiceLevel: 3, description: "Tangy sorrel leaves curry with chicken.", orderCount: 85 }
            ]
        },
        {
            name: "Bhavani Kumari", city: "Vijayawada", specialty: "Coastal Andhra", bio: "Grew up on the Krishna riverbank learning to cook fresh seafood.", experience: "10 Years", dishes: [
                { name: "Andhra Fish Curry", category: "Main Course", foodType: "non veg", price: 320, spiceLevel: 3, description: "Fiery tamarind fish curry.", orderCount: 95 },
                { name: "Pulihora", category: "Main Course", foodType: "veg", price: 149, spiceLevel: 2, description: "Tangy tamarind rice with peanuts.", orderCount: 70 }
            ]
        }
    ],
    "Punjab": [
        {
            name: "Harpreet Kaur", city: "Amritsar", specialty: "Punjabi Cuisine", bio: "Born in the bylanes of Amritsar, learnt tandoori cooking from her father.", experience: "20 Years", dishes: [
                { name: "Butter Chicken", category: "Main Course", foodType: "non veg", price: 299, spiceLevel: 2, description: "Creamy tomato-based chicken curry.", orderCount: 150 },
                { name: "Sarson Ka Saag", category: "Main Course", foodType: "veg", price: 199, spiceLevel: 1, description: "Mustard greens with makki ki roti.", orderCount: 90 }
            ]
        },
        {
            name: "Kuldeep Singh", city: "Ludhiana", specialty: "Dhaba Style", bio: "Master of highway dhaba classics.", experience: "15 Years", dishes: [
                { name: "Amritsari Kulcha", category: "Breakfast", foodType: "veg", price: 129, spiceLevel: 1, description: "Stuffed kulcha with chole.", orderCount: 110 },
                { name: "Dal Baati Churma", category: "Main Course", foodType: "veg", price: 179, spiceLevel: 1, description: "Dhaba dal.", orderCount: 130 }
            ]
        }
    ],
    "Kerala": [
        {
            name: "Deepa Krishnan", city: "Kochi", specialty: "Kerala Cuisine", bio: "Raised in a Tharavad kitchen in Kochi.", experience: "12 Years", dishes: [
                { name: "Kerala Fish Curry", category: "Main Course", foodType: "non veg", price: 350, spiceLevel: 2, description: "Coconut milk fish curry with raw mango.", orderCount: 100 },
                { name: "Appam with Stew", category: "Breakfast", foodType: "veg", price: 149, spiceLevel: 1, description: "Lacy rice pancakes with vegetable stew.", orderCount: 80 }
            ]
        },
        {
            name: "Mathew Thomas", city: "Trivandrum", specialty: "Syrian Catholic", bio: "Specialist in Syrian Christian specialties.", experience: "18 Years", dishes: [
                { name: "Puttu and Kadala", category: "Breakfast", foodType: "veg", price: 119, spiceLevel: 1, description: "Steamed rice cake with black chickpea curry.", orderCount: 65 },
                { name: "Chettinad Chicken", category: "Main Course", foodType: "non veg", price: 289, spiceLevel: 3, description: "Spicy chicken roast.", orderCount: 140 }
            ]
        }
    ],
    "Tamil Nadu": [
        {
            name: "Meenakshi Sundaram", city: "Chennai", specialty: "South Indian", bio: "Chettinad roots and a Mylapore kitchen.", experience: "16 Years", dishes: [
                { name: "Chettinad Chicken", category: "Main Course", foodType: "non veg", price: 310, spiceLevel: 3, description: "Fiery chicken curry.", orderCount: 95 },
                { name: "Masala Dosa", category: "Breakfast", foodType: "veg", price: 89, spiceLevel: 1, description: "Crispy dosa with potato filling and chutneys.", orderCount: 160 }
            ]
        },
        {
            name: "Karthik Iyer", city: "Madurai", specialty: "Madurai Delicacies", bio: "Specializes in authentic Madurai street food.", experience: "8 Years", dishes: [
                { name: "Filter Coffee", category: "Beverages", foodType: "veg", price: 39, spiceLevel: 0, description: "Traditional South Indian filter coffee.", orderCount: 250 },
                { name: "Andhra Fish Curry", category: "Main Course", foodType: "non veg", price: 249, spiceLevel: 2, description: "Coastal curry.", orderCount: 110 }
            ]
        }
    ],
    "Rajasthan": [
        {
            name: "Kamla Devi Shekhawat", city: "Jaipur", specialty: "Rajasthani Cuisine", bio: "Learnt royal Rajputana recipes in her grandmother's haveli.", experience: "11 Years", dishes: [
                { name: "Dal Baati Churma", category: "Main Course", foodType: "veg", price: 249, spiceLevel: 2, description: "Baked wheat balls with lentil curry.", orderCount: 85 },
                { name: "Laal Maas", category: "Main Course", foodType: "non veg", price: 399, spiceLevel: 3, description: "Fiery red meat curry with mathania chillies.", orderCount: 70 }
            ]
        },
        {
            name: "Vikram Singh", city: "Jodhpur", specialty: "Marwari Thali", bio: "Marwari sweet and savory expert.", experience: "20 Years", dishes: [
                { name: "Ghewar", category: "Desserts", foodType: "veg", price: 149, spiceLevel: 0, description: "Disc-shaped sweet cake soaked in sugar syrup.", orderCount: 55 },
                { name: "Butter Chicken", category: "Main Course", foodType: "non veg", price: 189, spiceLevel: 2, description: "Chicken special.", orderCount: 45 }
            ]
        }
    ],
    "Gujarat": [
        {
            name: "Hemaben Joshi", city: "Ahmedabad", specialty: "Gujarati Cuisine", bio: "A Kathiawadi home cook who believes every meal should balance sweet, sour and spice.", experience: "13 Years", dishes: [
                { name: "Dhokla", category: "Snacks", foodType: "veg", price: 69, spiceLevel: 1, description: "Steamed chickpea flour cake with mustard tempering.", orderCount: 140 },
                { name: "Undhiyu", category: "Main Course", foodType: "veg", price: 219, spiceLevel: 2, description: "Mixed vegetable casserole cooked underground.", orderCount: 65 }
            ]
        },
        {
            name: "Nita Patel", city: "Surat", specialty: "Surati Street Food", bio: "Queen of Surti delicacies.", experience: "9 Years", dishes: [
                { name: "Gujarati Thali", category: "Main Course", foodType: "veg", price: 299, spiceLevel: 1, description: "Complete meal with dal, kadhi, rotli, rice.", orderCount: 100 },
                { name: "Pesarattu", category: "Snacks", foodType: "veg", price: 49, spiceLevel: 1, description: "Green dosa.", orderCount: 120 }
            ]
        }
    ],
    "Karnataka": [
        {
            name: "Manjunath Hegde", city: "Mangalore", specialty: "Karnataka Cuisine", bio: "A Udupi Brahmin cook mastering both temple-style vegetarian fare and coastal seafood.", experience: "14 Years", dishes: [
                { name: "Bisi Bele Bath", category: "Main Course", foodType: "veg", price: 179, spiceLevel: 2, description: "Spicy rice and lentil dish with vegetables.", orderCount: 80 },
                { name: "Mysore Pak", category: "Desserts", foodType: "veg", price: 99, spiceLevel: 0, description: "Rich ghee-based sweet from Mysore.", orderCount: 95 }
            ]
        },
        {
            name: "Gowri Rao", city: "Bangalore", specialty: "Oota", bio: "Traditional Karnataka oota expert.", experience: "12 Years", dishes: [
                { name: "Ragi Mudde", category: "Main Course", foodType: "veg", price: 129, spiceLevel: 1, description: "Finger millet dumpling served with saaru.", orderCount: 55 },
                { name: "Masala Dosa", category: "Breakfast", foodType: "veg", price: 79, spiceLevel: 1, description: "Soft lacy rice crepes.", orderCount: 85 }
            ]
        }
    ],
    "Telangana": [
        {
            name: "Surekha Begum", city: "Hyderabad", specialty: "Telangana Cuisine", bio: "Old city Hyderabadi flavours in every pot.", experience: "17 Years", dishes: [
                { name: "Hyderabadi Biryani", category: "Main Course", foodType: "non veg", price: 369, spiceLevel: 3, description: "Aromatic kachchi biryani slow-cooked in a sealed handi.", orderCount: 140 },
                { name: "Haleem", category: "Main Course", foodType: "non veg", price: 249, spiceLevel: 2, description: "Slow-simmered wheat and meat stew.", orderCount: 110 }
            ]
        },
        {
            name: "Rahul Goud", city: "Warangal", specialty: "Spicy Telugu", bio: "Bringing Warangal's fiery spice mixes to life.", experience: "6 Years", dishes: [
                { name: "Double Ka Meetha", category: "Desserts", foodType: "veg", price: 89, spiceLevel: 0, description: "Fried bread pudding soaked in sweetened milk.", orderCount: 60 },
                { name: "Hyderabadi Dum Biryani", category: "Main Course", foodType: "non veg", price: 349, spiceLevel: 3, description: "Super spicy regional mutton curry.", orderCount: 90 }
            ]
        }
    ]
};

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB for seeding...\n");

        // 0. Clean up old seeded data
        console.log("🧹 Cleaning old seeded data...");
        const oldChefs = await chef.find({});
        for (const ch of oldChefs) {
            await Item.deleteMany({ shop: ch._id });
        }
        await chef.deleteMany({});
        await Region.deleteMany({});
        await User.deleteMany({ email: /@maakhana\.com$/ });
        console.log(`  Removed ${oldChefs.length} old chefs, their items, old regions, and seeded user accounts.\n`);

        // 1. Seed Regions — upload images to Cloudinary
        console.log("📍 Seeding regions with Cloudinary images...");
        for (const r of REGIONS) {
            console.log(`  Region: ${r.name}`);
            const cloudUrl = await uploadToCloudinary(r.sourceImg, "regions");
            const { sourceImg, ...regionData } = r;
            regionData.image = cloudUrl;
            await Region.findOneAndUpdate({ name: r.name }, regionData, { upsert: true, new: true });
        }
        console.log(`✅ ${REGIONS.length} regions seeded\n`);

        // 2. Seed Chefs + Dishes — upload images to Cloudinary
        const hashedPw = await bcrypt.hash("chef12345", 10);
        let totalChefs = 0, totalDishes = 0;

        for (const [stateName, chefs] of Object.entries(CHEF_DATA)) {
            let chefIdx = 0;
            for (const c of chefs) {
                chefIdx++;
                console.log(`👨‍🍳 Chef: ${c.name} (${stateName})`);
                const email = `${c.name.toLowerCase().replace(/[^a-z]/g, "")}@maakhana.com`;
                let user = await User.findOne({ email });
                if (!user) {
                    user = await User.create({ fullName: c.name, email, password: hashedPw, role: "HomeCook" });
                }

                // Look up region-specific chef image
                const imgKey = `${stateName}_${chefIdx}`;
                const chefSourceImg = CHEF_IMAGES[imgKey] || CHEF_IMAGES[`${stateName}_1`] || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=600&fit=crop";
                console.log(`  📸 Using image: ${imgKey}`);

                const chefCloudUrl = await uploadToCloudinary(chefSourceImg, "chefs");

                let shop = await chef.findOne({ homechef: user._id });
                if (shop) {
                    shop.image = chefCloudUrl;
                    await shop.save();
                } else {
                    shop = await chef.create({
                        name: c.name, city: c.city, state: stateName, address: `${c.city}, ${stateName}`,
                        bio: c.bio, specialty: c.specialty, experience: c.experience,
                        homechef: user._id, rating: { average: 3.5 + Math.random() * 1.5, count: Math.floor(20 + Math.random() * 100) },
                        mealsServed: Math.floor(50 + Math.random() * 500), image: chefCloudUrl
                    });
                }

                for (const d of c.dishes) {
                    console.log(`    🍛 Dish: ${d.name}`);
                    const dishSourceImg = DISH_SOURCE_IMGS[d.name] || DISH_SOURCE_IMGS.default;
                    const dishCloudUrl = await uploadToCloudinary(dishSourceImg, "dishes");

                    let item = await Item.findOne({ name: d.name, shop: shop._id });
                    if (item) {
                        item.image = dishCloudUrl;
                        await item.save();
                    } else {
                        item = await Item.create({
                            ...d, shop: shop._id, image: dishCloudUrl,
                            rating: { average: 3.5 + Math.random() * 1.5, count: Math.floor(10 + Math.random() * 80) }
                        });
                        shop.items.push(item._id);
                    }
                    totalDishes++;
                }
                await shop.save();
                totalChefs++;
            }
        }
        console.log(`\n✅ ${totalChefs} chefs with Cloudinary images`);
        console.log(`✅ ${totalDishes} dishes with Cloudinary images`);
        console.log("🎉 Seeding complete — all images stored in Cloudinary!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seed();
