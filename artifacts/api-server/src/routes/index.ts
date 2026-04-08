import { Router, type IRouter } from "express";
import healthRouter from "./health";
import countriesRouter from "./countries";
import comparisonRouter from "./comparison";
import metadataRouter from "./metadata";

const router: IRouter = Router();

router.use(healthRouter);
router.use(countriesRouter);
router.use(comparisonRouter);
router.use(metadataRouter);

export default router;
