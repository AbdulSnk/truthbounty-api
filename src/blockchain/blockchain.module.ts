import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainIndexerService } from './blockchain-indexer.service';
import { ProcessedEvent, TokenBalance, IndexerCheckpoint } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProcessedEvent, TokenBalance, IndexerCheckpoint]),
  ],
  providers: [BlockchainIndexerService],
  exports: [BlockchainIndexerService],
})
export class BlockchainModule {}
import { BlockchainStateService } from './state.service';
import { ReorgDetectorService } from './reorg-detector.service';
import { ReconciliationService } from './reconciliation.service';
import { EventIndexingService } from './event-indexing.service';
import { WeightedVoteResolutionService } from './weighted-vote-resolution.service';
import { BlockchainController } from './blockchain.controller';

@Module({
  providers: [
    BlockchainStateService,
    ReorgDetectorService,
    ReconciliationService,
    EventIndexingService,
    WeightedVoteResolutionService,
  ],
  controllers: [BlockchainController],
  exports: [
    BlockchainStateService,
    ReorgDetectorService,
    ReconciliationService,
    EventIndexingService,
    WeightedVoteResolutionService,
  ],
})
export class BlockchainModule {}
