import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { createMockStake, createMockStakes } from '../fixtures/contracts/staking.fixture';
import { createMockReward, createMockRewards } from '../fixtures/contracts/rewards.fixture';
import { createMockDispute, createMockDisputes } from '../fixtures/contracts/dispute.fixture';
import { Stake } from '../../src/staking/entities/stake.entity';
import { Reward } from '../../src/rewards/entities/reward.entity';
import { Dispute } from '../../src/dispute/entities/dispute.entity';

/**
 * Test Utilities and Helpers
 * Provides common testing utilities for setting up test environments
 */

/**
 * Create a test module with Prisma service
 */
export async function createTestingModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [PrismaModule],
  }).compile();
}

/**
 * Clear all database tables
 */
export async function clearDatabase(prisma: PrismaService): Promise<void> {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

/**
 * Seed database with test data
 */
export async function seedTestData(
  prisma: PrismaService,
  options: {
    stakes?: number;
    rewards?: number;
    disputes?: number;
  } = {}
): Promise<{
  stakes: Stake[];
  rewards: Reward[];
  disputes: Dispute[];
}> {
  const { stakes = 5, rewards = 3, disputes = 2 } = options;
  
  // Create mock data
  const mockStakes = createMockStakes(stakes);
  const mockRewards = createMockRewards(rewards);
  const mockDisputes = createMockDisputes(disputes);

  // Insert into database
  const createdStakes = await Promise.all(
    mockStakes.map(stake => 
      prisma.stake.create({
        data: {
          userId: stake.userId,
          walletAddress: stake.walletAddress,
          amount: stake.amount,
          stakedAt: stake.stakedAt,
          unstakedAt: stake.unstakedAt,
          isActive: stake.isActive,
          totalRewards: stake.totalRewards,
        },
      })
    )
  );

  const createdRewards = await Promise.all(
    mockRewards.map(reward => 
      prisma.reward.create({
        data: {
          title: reward.title,
          description: reward.description,
          totalAmount: reward.totalAmount,
          tokenAddress: reward.tokenAddress,
          creatorAddress: reward.creatorAddress,
          createdAt: reward.createdAt,
          expiresAt: reward.expiresAt,
          isActive: reward.isActive,
        },
      })
    )
  );

  const createdDisputes = await Promise.all(
    mockDisputes.map(dispute => 
      prisma.dispute.create({
        data: {
          claimId: dispute.claimId,
          creatorAddress: dispute.creatorAddress,
          evidenceCID: dispute.evidenceCID,
          description: dispute.description,
          createdAt: dispute.createdAt,
          expiresAt: dispute.expiresAt,
          totalVotesFor: dispute.totalVotesFor,
          totalVotesAgainst: dispute.totalVotesAgainst,
          totalStakeFor: dispute.totalStakeFor,
          totalStakeAgainst: dispute.totalStakeAgainst,
          outcome: dispute.outcome,
          resolvedAt: dispute.resolvedAt,
          resolutionBlock: dispute.resolutionBlock,
        },
      })
    )
  );

  return {
    stakes: createdStakes,
    rewards: createdRewards,
    disputes: createdDisputes,
  };
}

/**
 * Wait for a specified time
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random hex string
 */
export function randomHex(length: number = 32): string {
  return '0x' + Array.from({ length }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 * Generate random address
 */
export function randomAddress(): string {
  return '0x' + Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

/**
 * Mock console methods for testing
 */
export function mockConsole(): {
  log: jest.SpyInstance;
  warn: jest.SpyInstance;
  error: jest.SpyInstance;
} {
  return {
    log: jest.spyOn(console, 'log').mockImplementation(() => {}),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
    error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  };
}

/**
 * Restore console methods
 */
export function restoreConsole(mocks: {
  log: jest.SpyInstance;
  warn: jest.SpyInstance;
  error: jest.SpyInstance;
}): void {
  mocks.log.mockRestore();
  mocks.warn.mockRestore();
  mocks.error.mockRestore();
}

/**
 * Mock Date for testing
 */
export function mockDate(date: Date | string | number): jest.SpyInstance {
  const mockDate = new Date(date);
  return jest
    .spyOn(global.Date, 'now')
    .mockImplementation(() => mockDate.getTime());
}

/**
 * Advance time by specified milliseconds
 */
export function advanceTime(ms: number): void {
  jest.advanceTimersByTime(ms);
}

/**
 * Reset all mocks
 */
export function resetAllMocks(): void {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}