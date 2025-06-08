# TrackIt

Real-time Ethereum Wallet Monitoring & Email Alerts

### Overview

TrackIt is a lightweight Ethereum address monitoring tool that notifies users via email when a wallet they care about receives or sends native ETH, ERC-20, ERC-721, or ERC-1155 tokens.

TrackIt enables users to track wallet activity on Ethereum. Simply enter an address and an email — and you’ll receive real-time alerts whenever that wallet is involved in any transaction.

> Ideal for crypto users, traders, researchers, and protocol teams who want to stay informed of on-chain movements.

Powered by [Nodit Streams & Webhooks](https://nodit.io) for high-speed blockchain event delivery.

### Features

- **Real-time Monitoring**: Get instant notifications for incoming and outgoing transactions.
- **Token Support**: Monitor native ETH, ERC-20, ERC-721, and ERC-1155 token transfers.
- **Email Alerts**: Receive detailed email notifications for each transaction.
- **User-Friendly Interface**: Simple and intuitive UI for adding and managing addresses.

#### Proposed Features

- **Whale Alerts**: Get notified of large transactions to Email, X, Telegram or Discord.
- **Balance Alerts**: Get notified when a wallet's balance changes by a certain threshold.
- **Success/Failure Alerts**: Receive notifications for successful or failed transactions.
- **Multichain Support**: Extend monitoring to other blockchains(Polygon, Arbitrum, Optimism, Base, Bitcoin).
- **Contract Events/Logs**: Track specific contract events or logs
- **Telegram/Discord Notifications**: Receive real-time alerts on transactions, token transfers, and address activity directly in your preferred messaging app.

### Architecture

## Getting Started

1. Create a webhook on [nodit](https://nodit.lambda256.io/webhooks) and copy the webhook Id and signing key.

2. Install dependencies, set up the environment, and run the development server.

> Copy the `.env.example` file to `.env` and fill in the required environment variables.

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run the development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to see the app in action.

### Screenshots

## Built With

- [Nodit](https://nodit.io/) - The leading Web3 data and development platform for building Web3& AI applications
- [Next.js](https://nextjs.org/) - The React Framework for Production
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js and TypeScript
- [Ant Design](https://ant.design/) - A design system for enterprise-level products

## References

- [Nodit Webhooks Documentation](https://developer.nodit.io/docs/webhook)
- [Nodit Webhook How-To Guide](https://developer.nodit.io/reference/how-to-use-webhook)
- [Nodit Webhook API Documentation](https://developer.nodit.io/reference/createwebhook)
- [Nodit Webhook Security & Reliability](https://developer.nodit.io/reference/security-reliability)
- [Nodit API Documentation](https://developer.nodit.io/docs/nodit-overview)
- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Route Handlers Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Roadmap

- [x] ETH native transaction alerts(Incoming/outgoing)
- [x] ERC20, ERC721, ERC1155 support
- [x] Email notifications
- [ ] Whale alerts() to Telegram / Discord
- [ ] Balance change alerts
- [ ] Success/Failure transaction alerts
- [ ] Multichain support
- [ ] Contract events/Transactions alerts
- [ ] Telegram / Discord notifications on transactions, token transfers, address activity, etc.

## Safety & Security

This is an experimental software and subject to change over time.

This is a proof of concept and is not ready for production use. It is not audited and has not been tested for security. Use at your own risk. I do not give any warranties and will not be liable for any loss incurred through any use of this codebase.

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
