/**
 * Core types for blockchain event tracking and reorg handling
 */

export interface BlockInfo {
  number: number;
  hash: string;
  timestamp: number;
  parentHash: string;
}

export interface BlockRecord {
  id: string; // blockNumber:blockHash
  blockNumber: number;
  blockHash: string;
  parentHash: string;
  timestamp: number;
  isCanonical: boolean;
  createdAt: Date;
}

export interface PendingEvent {
  id: string;
  blockNumber: number;
  blockHash: string;
  eventType: string;
  data: Record<string, any>;
  transactionHash: string;
  logIndex: number;
  status: 'pending' | 'confirmed' | 'orphaned';
  confirmations: number;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface ReorgEvent {
  detectedAt: Date;
  reorgDepth: number;
  affectedBlockStart: number;
  affectedBlockEnd: number;
  orphanedEvents: string[]; // event IDs
  reprocessedEvents: string[];
}

export interface ChainState {
  lastProcessedBlock: number;
  lastCanonicalHash: string;
  confirmedDepth: number;
  pendingEventCount: number;
  orphanedEventCount: number;
  lastReorgTime?: Date;
}
