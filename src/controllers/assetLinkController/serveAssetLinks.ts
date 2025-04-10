import { Request, Response } from "express";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";

// TODO Data is coming from .env
const serveAssetLinks = errorHandlerMiddleware(
  async (_: Request, res: Response) => {
    res.json([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: process.env.APP_PACKAGE_NAME,
          sha256_cert_fingerprints: [process.env.APP_SHA256_CERT_FINGERPRINT],
        },
      },
    ]);
  }
);

export default serveAssetLinks;
