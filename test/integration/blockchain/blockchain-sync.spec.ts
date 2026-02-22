import { getRepository } from 'typeorm';
import { BlockchainEvent } from '../../../src/blockchain/entities/blockchain-event.entity';
import { EventProcessorService } from '../../../src/blockchain/processors/event-processor.service';
import { StateSyncService } from '../../../src/blockchain/synchronizers/state-sync.service';
import { mockEvents } from './fixtures/mock-events';
import { mockReorgEvents } from './fixtures/mock-reorg';

describe('Blockchain Sync Integration', () => {
  let processor: EventProcessorService;
  let syncService: StateSyncService;
  let eventRepo;

  beforeAll(async () => {
    eventRepo = getRepository(BlockchainEvent);
    processor = new EventProcessorService(eventRepo);
    syncService = new StateSyncService();
  });

  afterEach(async () => {
    await eventRepo.clear();
  });

  it('should persist events correctly', async () => {
    for (const evt of mockEvents) {
      await processor.processEvent(evt);
      await syncService.syncState(evt.payload);
    }

    const saved = await eventRepo.find();
    expect(saved.length).toBe(2);
    expect(saved[0].eventId).toBe('evt1');
    expect(saved[1].eventId).toBe('evt2');
  });

  it('should handle reorg scenarios', async () => {
    // Process initial events
    for (const evt of mockEvents) {
      await processor.processEvent(evt);
    }

    // Simulate reorg
    await eventRepo.clear();
    for (const evt of mockReorgEvents) {
      await processor.processEvent(evt);
    }

    const saved = await eventRepo.find();
    expect(saved.length).toBe(2);
    expect(saved.find(e => e.eventId === 'evt2b')).toBeDefined();
  });
});
