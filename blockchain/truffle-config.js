module.exports = {
  contracts_directory: './src/contracts/',
  migrations_directory: './migrations',

  networks: {
    development: {
      host: "ganache",
      port: 8545,
      network_id: "5777",
      gas: 6721975,
      gasPrice: 20000000000,
    },
  },

  contracts_build_directory: './build/contracts/',
  compilers: {
    solc: {
      version: "0.8.13",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
