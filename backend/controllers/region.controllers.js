import Region from "../models/region.model.js";

// GET /api/region/all — Get all regions from the database
export const getAllRegions = async (req, res) => {
    try {
        const regions = await Region.find().sort({ name: 1 });
        return res.status(200).json(regions);
    } catch (error) {
        return res.status(500).json({ message: `get all regions error: ${error}` });
    }
};

// GET /api/region/:regionName — Get a single region by name
export const getRegionByName = async (req, res) => {
    try {
        const { regionName } = req.params;
        const region = await Region.findOne({
            name: { $regex: new RegExp(`^${regionName}$`, "i") }
        });
        if (!region) {
            return res.status(404).json({ message: "Region not found" });
        }
        return res.status(200).json(region);
    } catch (error) {
        return res.status(500).json({ message: `get region error: ${error}` });
    }
};
