/**
 * Standardizes error responses by returning expected errors as normal messages while masking unexpected errors
 * @dev Nextjs server actions hides both expected and unexpected errors from the client. This function helps to standardize error responses.
 * by returning expected errors as normal messages while masking unexpected errors.
 * @param {Error|string} error - The Error object or error message.
 * @param {number} [statusCode=500] - The HTTP status code for the error response.
 * @param {boolean} [isExpected=false] - Indicates if the error is expected.
 * @returns {{statusCode: number, error: string}} Standardized error response object.
 * @example
 * // Expected error
 * errorResponse("User not found", 404, true);
 * // Unexpected error
 * errorResponse(new Error("Database connection failed"));
 */
export const errorResponse = (error, statusCode = 500, isExpected = false) => {
  console.log("error handler:", { error, statusCode, isExpected });
  let message = isExpected ? error?.message || error : "Something went wrong!";
  return { statusCode, error: message };
};

export function parseNoditMessage(message) {
  const type = message.type === "transaction" ? "native" : message.type;

  const from = message.from_address;
  const to = message.to_address;

  const base = {
    type,
    from,
    to,
    txHash: message.hash || message.transaction_hash || "0xUnknownTxHash",
    block: message.block_number,
    timestamp: message.block_timestamp
  };

  if (type === "erc721") {
    return {
      ...base,
      tokenAddress: message.token_address,
      tokenId: message.token_id
    };
  }

  if (type === "erc20" || type === "erc1155") {
    return {
      ...base,
      tokenAddress: message.token_address,
      value: message.value
    };
  }

  if (type === "native") {
    return {
      ...base,
      value: message.value
    };
  }

  return base;
}
