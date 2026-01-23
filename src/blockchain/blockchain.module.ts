import { Module } from '@nestjs/common';
import { BlockchainStateService } from './state.service';
import { ReorgDetectorService } from './reorg-detector.service';
import { ReconciliationService } from './reconciliation.service';
import { EventIndexingService } from './event-indexing.service';
import { BlockchainController } from './blockchain.controller';

@Module({
  providers: [
    BlockchainStateService,
    ReorgDetectorService,
    ReconciliationService,
    EventIndexingService,
  ],
  controllers: [BlockchainController],
  exports: [
    BlockchainStateService,
    ReorgDetectorService,
    ReconciliationService,
    EventIndexingService,
  ],
})
export class BlockchainModule {}
