import { Router } from "express";
import serveAssetLinks from "@src/controllers/assetLinkController/serveAssetLinks";

const assetLinkRouter: Router = Router();

assetLinkRouter.get("/.well-known/assetlinks.json", serveAssetLinks);

export default assetLinkRouter;
