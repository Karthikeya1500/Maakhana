# Database Seeding

## Prerequisites
- MongoDB connection string in `.env`
- Cloudinary credentials in `.env`

## How to Run
```bash
cd backend
node seed.js
```

## What it Creates
- **8 Regions:** Andhra Pradesh, Tamil Nadu, Kerala, Karnataka, Rajasthan, Punjab, Gujarat, Bengal
- **16 Chefs:** 2 chefs per region with profile photos
- **32 Dishes:** 2 dishes per chef with food images

## Notes
- Running seed.js again will clear existing data and reseed
- All images are uploaded to Cloudinary during seeding
- Seed takes about 30-60 seconds depending on network speed
