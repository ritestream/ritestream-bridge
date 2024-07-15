// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import '@nomicfoundation/hardhat-verify'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'

// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
      ? [PRIVATE_KEY]
      : undefined

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    etherscan: {
        apiKey: {
            sepolia: 'UVESKF27KD36V9JHX88BRG462TMGDB352S',
            bscTestnet: 'PYFMDPNYJAB7NBKC2V683TG15I39G3KRXN',
            baseSepolia: 'IXC7UXWG77UY7ZKTZ4N7BE9JFE2B4CGFZE',
            bsc: 'PYFMDPNYJAB7NBKC2V683TG15I39G3KRXN',
        },
    },
    sourcify: {
        enabled: true,
    },
    solidity: {
        compilers: [
            {
                version: '0.8.26',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        binance: {
            eid: EndpointId.BSC_V2_MAINNET,
            url: process.env.RPC_URL_BINANCE || 'https://bsc-dataseed.binance.org/',
            accounts,
        },
        sepolia: {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: process.env.RPC_URL_SEPOLIA || 'https://rpc.sepolia.org/',
            accounts,
        },
        bscTest: {
            eid: EndpointId.BSC_V2_TESTNET,
            url: process.env.RPC_URL_BSC_TEST || 'https://data-seed-prebsc-1-s1.binance.org:8545/',
            accounts,
        },
        baseTest: {
            eid: EndpointId.BASE_V2_TESTNET,
            url: process.env.RPC_URL_BASE_TEST || 'https://sepolia.base.org',
            accounts,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
    },
}

export default config
