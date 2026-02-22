import { Module } from '@nestjs/common';
import { IpfsService } from './ipfs.service';
import { ipfsProviderFactory } from './ipfs.providers';
import { IpfsConfigService } from './ipfs.config';

@Module({
  providers: [IpfsConfigService, ipfsProviderFactory, IpfsService],
  exports: [IpfsService],
})
export class IpfsModule {}
