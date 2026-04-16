import Region from "../models/region.model.js";

/**
 * RegionRepository
 * Encapsulates all raw database operations for the Region collection.
 */
class RegionRepository {
    async findAll() {
        return Region.find().sort({ name: 1 });
    }

    async findByName(name) {
        return Region.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    }
}

export default new RegionRepository();
