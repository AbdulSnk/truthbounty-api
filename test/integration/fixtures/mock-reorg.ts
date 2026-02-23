export const mockReorgEvents = [
  {
    eventId: 'evt1',
    contract: 'escrow',
    type: 'ConditionFulfilled',
    payload: { conditionId: 'cond1' },
    blockNumber: 100,
    timestamp: new Date(),
  },
  // Reorg replaces evt2 with evt2b
  {
    eventId: 'evt2b',
    contract: 'escrow',
    type: 'EscrowFunded',
    payload: { escrowId: 'esc1', amount: 200 },
    blockNumber: 101,
    timestamp: new Date(),
  },
];
