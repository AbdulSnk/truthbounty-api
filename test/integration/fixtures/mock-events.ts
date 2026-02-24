export const mockEvents = [
  {
    eventId: 'evt1',
    contract: 'escrow',
    type: 'ConditionFulfilled',
    payload: { conditionId: 'cond1' },
    blockNumber: 100,
    timestamp: new Date(),
  },
  {
    eventId: 'evt2',
    contract: 'escrow',
    type: 'EscrowFunded',
    payload: { escrowId: 'esc1', amount: 100 },
    blockNumber: 101,
    timestamp: new Date(),
  },
];
