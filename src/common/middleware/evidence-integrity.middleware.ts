import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { verifyCIDIntegrity } from "../../storage/cid-verifier";

@Injectable()
export class EvidenceIntegrityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(EvidenceIntegrityMiddleware.name);

  use(req: any, res: any, next: () => void) {
    const file = req.file;
    const cid = req.body.cid;

    if (!file || !cid) {
      return next();
    }

    const isValid = verifyCIDIntegrity(file.buffer, cid);

    if (!isValid) {
      this.logger.warn(
        `Evidence hash mismatch detected. CID: ${cid}`
      );

      return res.status(400).json({
        message: "Evidence integrity verification failed",
      });
    }

    next();
  }
}
