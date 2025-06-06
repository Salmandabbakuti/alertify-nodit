const io = require("socket.io-client");
require("dotenv").config();

const NODIT_API_KEY = process.env.NODIT_API_KEY;
const messageId = "{Your websocket message ID}";
const params = {
  description: "{description about your websocket}",
  condition: {
    addresses: ["0x0000000000000000000000000000000000000000"] // You can set this to any integer greater than zero. This could be used to specify the frequency of events, such as receiving an event every 'n' blocks.
  }
};
// eventType specifies the type of event you want to subscribe to on the blockchain. For example, "BLOCK_PERIOD" could be used to receive events related to blockchain block timings.
const eventType = "ADDRESS_ACTIVITY";
// Options for the WebSocket connection.
const options = {
  rejectUnauthorized: false, // This should be true in production for better security unless your server uses a self-signed certificate.
  transports: ["websocket"],
  path: "/v1/websocket/",
  auth: {
    apiKey: NODIT_API_KEY // Replace this with your actual API key provided by the service.
  },
  query: {
    protocol: "ethereum", // Replace this with the blockchain protocol you are interacting with, e.g., "ethereum", "arbitrum", etc.
    network: "mainnet" // Replace this with the specific network you are targeting, e.g., "mainnet", "testnet".
  }
};

const socket = io("wss://web3.nodit.io/v1/websocket", options);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("subscription_registered", (message) => {
    console.log("registered", message);
  });

  socket.on("subscription_connected", (message) => {
    console.log("subscription_connected", message);

    // Emit a subscription message with your specific messageId, eventType, and parameters.
    socket.emit("subscription", messageId, eventType, JSON.stringify(params));
  });

  socket.on("subscription_error", (message) => {
    console.error(`nodit_subscription_error: ${message}`);
  });

  socket.on("subscription_event", (message) => {
    console.log("subscription Event : ", message);
  });
});

socket.on("disconnect", () => {
  console.log("disconnected from server");
});

socket.on("connect_error", (error) => {
  console.error(`nodit_connect_error: ${error}`);
});
