import User from "../models/user.model.js"
import Chef from "../models/chef.model.js"

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        if (!userId) {
            return res.status(400).json({ message: "userId is not found" })
        }
        const user = await User.findById(userId).populate({
            path: 'favoriteChefs',
            select: 'name specialty image city state rating'
        })
        if (!user) {
            return res.status(400).json({ message: "user is not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `get current user error ${error}` })
    }
}

export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lon } = req.body
        const user = await User.findByIdAndUpdate(req.userId, {
            location: {
                type: 'Point',
                coordinates: [lon, lat]
            }
        }, { new: true })
        if (!user) {
            return res.status(400).json({ message: "user is not found" })
        }

        return res.status(200).json({ message: 'location updated' })
    } catch (error) {
        return res.status(500).json({ message: `update location user error ${error}` })
    }
}

// ── Update Profile (name, phone, dob) ──
export const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, dob } = req.body
        const user = await User.findByIdAndUpdate(
            req.userId,
            { fullName, phone, dob },
            { new: true }
        )
        if (!user) return res.status(404).json({ message: "User not found" })
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `Update profile error: ${error}` })
    }
}

// ── Add Address ──
export const addAddress = async (req, res) => {
    try {
        const { label, fullAddress, city, state, pincode, phone, isDefault } = req.body
        if (!fullAddress) return res.status(400).json({ message: "Full address is required" })

        const user = await User.findById(req.userId)
        if (!user) return res.status(404).json({ message: "User not found" })

        // If setting as default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(a => a.isDefault = false)
        }
        // If first address, make it default
        const makeDefault = user.addresses.length === 0 ? true : !!isDefault

        user.addresses.push({ label, fullAddress, city, state, pincode, phone, isDefault: makeDefault })
        await user.save()
        return res.status(201).json(user.addresses)
    } catch (error) {
        return res.status(500).json({ message: `Add address error: ${error}` })
    }
}

// ── Update Address ──
export const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params
        const updates = req.body
        const user = await User.findById(req.userId)
        if (!user) return res.status(404).json({ message: "User not found" })

        const addr = user.addresses.id(addressId)
        if (!addr) return res.status(404).json({ message: "Address not found" })

        if (updates.isDefault) {
            user.addresses.forEach(a => a.isDefault = false)
        }
        Object.assign(addr, updates)
        await user.save()
        return res.status(200).json(user.addresses)
    } catch (error) {
        return res.status(500).json({ message: `Update address error: ${error}` })
    }
}

// ── Delete Address ──
export const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params
        const user = await User.findById(req.userId)
        if (!user) return res.status(404).json({ message: "User not found" })

        user.addresses = user.addresses.filter(a => a._id.toString() !== addressId)
        await user.save()
        return res.status(200).json(user.addresses)
    } catch (error) {
        return res.status(500).json({ message: `Delete address error: ${error}` })
    }
}

// ── Toggle Favorite Chef ──
export const toggleFavoriteChef = async (req, res) => {
    try {
        const { chefId } = req.params
        const user = await User.findById(req.userId)
        if (!user) return res.status(404).json({ message: "User not found" })

        const idx = user.favoriteChefs.findIndex(id => id.toString() === chefId)
        if (idx > -1) {
            user.favoriteChefs.splice(idx, 1)
        } else {
            user.favoriteChefs.push(chefId)
        }
        await user.save()

        // Return populated favorites
        const populated = await User.findById(req.userId).populate({
            path: 'favoriteChefs',
            select: 'name specialty image city state rating'
        })
        return res.status(200).json(populated.favoriteChefs)
    } catch (error) {
        return res.status(500).json({ message: `Toggle favorite error: ${error}` })
    }
}

// ── Get Favorite Chefs ──
export const getFavoriteChefs = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate({
            path: 'favoriteChefs',
            select: 'name specialty image city state rating'
        })
        if (!user) return res.status(404).json({ message: "User not found" })
        return res.status(200).json(user.favoriteChefs)
    } catch (error) {
        return res.status(500).json({ message: `Get favorites error: ${error}` })
    }
}
