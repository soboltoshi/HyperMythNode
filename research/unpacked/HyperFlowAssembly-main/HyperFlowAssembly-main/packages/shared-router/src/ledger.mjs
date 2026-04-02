import { createRouterAssignment, createRouterIntent, createRouterQuote, createRouterReceipt } from "./factories.mjs";

export function createRouterLedger() {
  return {
    intents: [],
    quotes: [],
    assignments: [],
    receipts: [],
    events: [],
  };
}

function nowFrom(options = {}) {
  return options.now ?? Date.now;
}

function requireRecord(records, predicate, errorMessage) {
  const match = records.find(predicate);
  if (!match) {
    throw new Error(errorMessage);
  }

  return match;
}

export function recordIntent(ledger, input, options = {}) {
  const now = nowFrom(options);
  const intent = createRouterIntent(input, options);
  ledger.intents.push(intent);
  ledger.events.push({ kind: "intent", recordId: intent.intentId, createdAt: now() });
  return intent;
}

export function recordQuote(ledger, input, options = {}) {
  const now = nowFrom(options);
  requireRecord(ledger.intents, (intent) => intent.intentId === input.intentId, `Unknown intent for quote: ${input.intentId}`);
  const quote = createRouterQuote(input, options);
  ledger.quotes.push(quote);
  ledger.events.push({ kind: "quote", recordId: quote.quoteId, createdAt: now() });
  return quote;
}

export function recordAssignment(ledger, input, options = {}) {
  const now = nowFrom(options);
  requireRecord(ledger.quotes, (quote) => quote.quoteId === input.acceptedQuoteId, `Unknown quote for assignment: ${input.acceptedQuoteId}`);
  const assignment = createRouterAssignment(input, options);
  ledger.assignments.push(assignment);
  ledger.events.push({ kind: "assignment", recordId: assignment.assignmentId, createdAt: now() });
  return assignment;
}

export function recordReceipt(ledger, input, options = {}) {
  const now = nowFrom(options);
  requireRecord(ledger.assignments, (assignment) => assignment.assignmentId === input.assignmentId, `Unknown assignment for receipt: ${input.assignmentId}`);
  const receipt = createRouterReceipt(input, options);
  ledger.receipts.push(receipt);
  ledger.events.push({ kind: "receipt", recordId: receipt.receiptId, createdAt: now() });
  return receipt;
}
