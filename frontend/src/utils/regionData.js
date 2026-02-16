// Indian region data for food exploration

export const REGIONS = [
  { state: "Andhra Pradesh", cuisine: "Andhra", famous: "Biryani, Pulihora, Pesarattu" },
  { state: "Tamil Nadu", cuisine: "Tamil", famous: "Dosa, Idli, Chettinad Chicken" },
  { state: "Kerala", cuisine: "Kerala", famous: "Appam, Puttu, Fish Curry" },
  { state: "Karnataka", cuisine: "Karnataka", famous: "Bisi Bele Bath, Mysore Pak" },
  { state: "Rajasthan", cuisine: "Rajasthani", famous: "Dal Baati, Laal Maas" },
  { state: "Punjab", cuisine: "Punjabi", famous: "Butter Chicken, Sarson ka Saag" },
  { state: "Gujarat", cuisine: "Gujarati", famous: "Dhokla, Thepla, Undhiyu" },
  { state: "Bengal", cuisine: "Bengali", famous: "Rasgulla, Macher Jhol" }
]

export const getRegionByCuisine = (cuisine) => {
  return REGIONS.find(r => r.cuisine.toLowerCase() === cuisine.toLowerCase())
}

export const getRegionByState = (state) => {
  return REGIONS.find(r => r.state.toLowerCase() === state.toLowerCase())
}
