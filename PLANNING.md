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
