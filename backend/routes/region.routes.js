import express from "express";
import { getAllRegions, getRegionByName } from "../controllers/region.controllers.js";

const regionRouter = express.Router();

regionRouter.get("/all", getAllRegions);
regionRouter.get("/:regionName", getRegionByName);

export default regionRouter;
