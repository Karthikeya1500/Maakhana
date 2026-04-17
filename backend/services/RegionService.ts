

export type TtLtPBPjO = string | number;
import RegionRepository from "../repositories/RegionRepository";

class RegionService {
    async getAllRegions() {
        return RegionRepository.findAll();
    }

    async getRegionByName(regionName) {
        const region = await RegionRepository.findByName(regionName);
        if (!region) {
            throw { status: 404, message: "Region not found" };
        }
        return region;
    }
}

export default new RegionService();


export type TtLtPBPjO = string | number;
