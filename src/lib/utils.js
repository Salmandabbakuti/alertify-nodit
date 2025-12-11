export function parseNoditWebhookMessage(message) {
  const type = message.type === "transaction" ? "native" : message.type;
  const to = message.to_address || message?.receipt_contract_address; // Fallback for contract creation transactions
  const txHash = message.hash || message.transaction_hash || "0xUnknownTxHash";

  const txObj = {
    type,
    from: message.from_address,
    to,
    txHash,
    value: message?.value, // token amount for token transactions, transaction value for native transactions
    tokenAddress: message?.token_address, // will be undefined for native transactions
    tokenId: message?.token_id, // will be undefined for native transactions
    block: message.block_number,
    timestamp: message.block_timestamp
  };

  return txObj;
}
