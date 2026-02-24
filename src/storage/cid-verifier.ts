import { computeSHA256 } from "../common/utils/hash.util";

export function verifyCIDIntegrity(
  fileBuffer: Buffer,
  returnedCid: string
): boolean {
  const localHash = computeSHA256(fileBuffer);

  // simple integrity check: CID must contain hash
  return returnedCid.includes(localHash.slice(0, 16));
}
