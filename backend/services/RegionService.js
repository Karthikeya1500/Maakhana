import RegionRepository from "../repositories/RegionRepository.js";

/**
 * RegionService
 * Contains all business logic for region lookup operations.
 * Does NOT import or use Express — fully framework-agnostic.
 */
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
