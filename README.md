# Candy Machine v2 Minting CLI

## Overview

This command-line application, developed in Node.js, enables users to effortlessly mint NFTs from a Candy Machine v2 program on the Solana blockchain. By utilizing this tool, users can expedite the minting process by directly interacting with the blockchain, bypassing the need for a frontend interface.

## Features

- **Efficient Minting**: Mint NFTs quickly and efficiently, reducing wait times compared to using a frontend.

- **Configuration File**: Users can customize their minting experience by providing their wallet's private keys, specifying the Candy Machine v2 address, the number of NFTs to mint, a Solana API endpoint to avoid rate limits, and a maximum price threshold. 

## Prerequisites

Before using this application, make sure you have the following prerequisites installed:

- Node.js: [Download Node.js](https://nodejs.org/)
- npm (Node Package Manager): Included with Node.js installation

## Installation

1. Clone this GitHub repository to your local machine:

```bash
git clone https://github.com/alessandrobernieri/solana-cm-v2-mint.git
```

2. Navigate to the project directory:

```bash
cd solana-cm-v2-mint
```

3. Install the required dependencies:

```bash
npm install
```

## Usage

1. Configure the application by editing the `config.json` file:

   - Provide your wallet's private keys.
   - Specify the Candy Machine v2 address you want to mint from.
   - Set the number of NFTs you want to mint.
   - Optionally, define a Solana API endpoint to avoid rate limits.
   - Set a maximum price threshold to prevent minting if the price exceeds this limit.

2. Run the minting process:

```bash
node src/app.js
```

## Contribution

Contributions are welcome! If you have any suggestions or improvements, please open an issue or create a pull request on this GitHub repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note**: Be cautious when dealing with private keys and sensitive information. Keep your private keys secure and do not share them publicly.
