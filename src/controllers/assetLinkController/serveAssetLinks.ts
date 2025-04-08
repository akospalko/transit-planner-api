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
          package_name: "com.yourcompany.yourapp",
          sha256_cert_fingerprints: ["<YOUR_SHA256_FINGERPRINT>"],
        },
      },
    ]);
  }
);

export default serveAssetLinks;
