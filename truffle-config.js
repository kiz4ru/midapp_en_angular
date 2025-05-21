/**
 * Truffle Configuration File
 * 
 * This file configures the Truffle environment for deploying
 * smart contracts to different networks.
 */

module.exports = {
  // Configure networks where your contracts should be deployed
  networks: {
    // Ganache network (local)
    ganache: { // Renombrado de development a ganache
      host: "127.0.0.1",
      port: 7545,          // Ganache default port
      network_id: "1337",  // Explicitly set to 1337
    },
    
    // Sepolia testnet config (optional)
    sepolia: {
      //provider: () => new HDWalletProvider(
      //  process.env.MNEMONIC,
      //  `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
      //),
      //network_id: 11155111,
       //gas: 5500000,
       //confirmations: 2,
      // timeoutBlocks: 200,
       //skipDryRun: true
    },
  },

  // Configure compilers for solidity versions
  compilers: {
    solc: {
      version: "0.8.19",    // Fetch exact version from solc-bin
      settings: {
        optimizer: {
          enabled: true,
          runs: 200         // Optimize for runtime gas usage
        },
      }
    }
  },
  
  // Configure db for storing deployments
  db: {
    enabled: false
  },
  
  // Configure plugins (optional)
  plugins: [
    'truffle-plugin-verify'
  ]
};