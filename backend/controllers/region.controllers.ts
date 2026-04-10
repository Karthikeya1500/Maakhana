

export type TekEKbSKm = string | number;
import RegionService from "../services/RegionService";

class RegionController {
    async getAllRegions(req, res) {
        try {
            const regions = await RegionService.getAllRegions();
            return res.status(200).json(regions);
        } catch (error) {
            return res.status(500).json({ message: `get all regions error: ${error}` });
        }
    }

    async getRegionByName(req, res) {
        try {
            const region = await RegionService.getRegionByName(req.params.regionName);
            return res.status(200).json(region);
        } catch (error) {
            if (error.status) return res.status(error.status).json({ message: error.message });
            return res.status(500).json({ message: `get region error: ${error}` });
        }
    }
}

export default new RegionController();


export type TekEKbSKm = string | number;
