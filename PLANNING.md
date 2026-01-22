# Maakhana - Project Planning

## Overview
A home chef food delivery platform connecting home cooks with local food lovers.

## Core Features
- User authentication (email + Google)
- Chef registration and menu management
- Region-based food exploration
- Cart and order placement
- Real-time order tracking

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Auth:** JWT + Firebase (Google)

## Tech Stack Research

### Why React + Vite?
- Fast HMR for better dev experience
- Tree-shaking for smaller bundles
- Good ecosystem for UI components

### Why MongoDB?
- Flexible schema for varying dish attributes
- Easy to model nested data (chef -> dishes)
- Good with Node.js via Mongoose

### Why Firebase for Google Auth?
- Simple integration with React
- Handles OAuth flow out of the box
- Free tier is generous enough

## Database Schema Design

### Users Collection
- name, email, password, role (customer/chef), avatar, phone

### Chefs Collection
- userId (ref), bio, region, speciality, rating, kitchenName

### Items Collection
- chefId (ref), name, description, price, image, category, spiceLevel

### Orders Collection
- userId, items[], totalAmount, status, deliveryAddress

### Regions Collection
- name, image, description, state

## Final Requirements Checklist
- [x] User auth with email and Google
- [x] Role-based access (customer vs chef)
- [x] Chef can add, edit, delete dishes
- [x] Customers can browse by region
- [x] Shopping cart with quantity management
- [x] Order placement and tracking
- [x] Image uploads via Cloudinary
- [x] Responsive design for mobile
- [x] OTP based password reset
- [x] Search and filter functionality
