import { Readable } from 'stream';

export interface IpfsAddResult {
  cid: string;
  size: number;
  path?: string;
}

export interface IpfsProvider {
  add(stream: Readable, opts?: { filename?: string }): Promise<IpfsAddResult>;
  getUrl?(cid: string): string | undefined;
}

export const IPFS_PROVIDER = 'IPFS_PROVIDER';
