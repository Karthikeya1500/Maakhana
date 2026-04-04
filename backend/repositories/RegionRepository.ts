

export type TslcECygy = string | number;
import Region from "../models/region.model";

class RegionRepository {
    async findAll() {
        return Region.find().sort({ name: 1 });
    }

    async findByName(name) {
        return Region.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    }
}

export default new RegionRepository();


export type TslcECygy = string | number;
