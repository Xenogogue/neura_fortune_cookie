# 🥠 Fortune Cookie

A decentralized application that generates and displays fortune cookie messages on the blockchain.

## Features

- Generate unique fortune cookie messages
- Store fortunes on the blockchain
- View your fortune history
- Modern, responsive UI

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fortune-cookie.git
cd fortune-cookie
```

2. Install dependencies:
```bash
yarn install
```

3. Run a local network in the first terminal:
```bash
yarn chain
```

4. Deploy the smart contract in a second terminal:
```bash
yarn deploy
```

5. Start the frontend in a third terminal:
```bash
yarn start
```

Visit your app on: `http://localhost:3000`

## Development

- Smart contracts are located in `packages/hardhat/contracts/`
- Frontend code is in `packages/nextjs/`
- Contract deployment scripts are in `packages/hardhat/deploy/`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
