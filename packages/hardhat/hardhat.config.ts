import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import { task } from 'hardhat/config';
import { HardhatUserConfig } from 'hardhat/types';

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (_args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: '0.8.16',
  paths: {
    artifacts: '../frontend/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // ,
    // rinkeby: {
    //   url: 'https://rinkeby.infura.io/v3/84842078b09946638c03157f83405213',
    //   chainId: 4,
    //   accounts: ['']
    // },
    // goerli: {
    //   url: 'https://goerli.infura.io/v3/84842078b09946638c03157f83405213',
    //   chainId: 5,
    //   accounts: ['']
    // },
    // sepolia: {
    //     url: 'https://sepolia.infura.io/v3/84842078b09946638c03157f83405213',
    //     chainId: 11155111,
    //     accounts: ['']
    // }
  },
  typechain: {
    outDir: '../frontend/types/typechain',
  },
};

export default config;
