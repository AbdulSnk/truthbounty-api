import { Inject, Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import { IPFS_PROVIDER, IpfsAddResult, IpfsProvider } from './interfaces';

/**
 * High-level IPFS service providing deterministic, provider-agnostic uploads.
 * - Accepts streams to remain memory-safe
 * - Returns deterministic content-addressed IDs (CID-like)
 */
@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);

  constructor(@Inject(IPFS_PROVIDER) private provider: IpfsProvider) {}

  async uploadStream(stream: Readable, filename?: string): Promise<IpfsAddResult> {
    this.logger.debug('Uploading stream to IPFS provider');
    const result = await this.provider.add(stream, { filename });
    return result;
  }

  async uploadBuffer(buffer: Buffer, filename?: string): Promise<IpfsAddResult> {
    const stream = Readable.from(buffer);
    return this.uploadStream(stream, filename);
  }

  getGatewayUrl(cid: string): string | undefined {
    if (typeof this.provider.getUrl === 'function') return this.provider.getUrl(cid);
    return undefined;
  }
}
