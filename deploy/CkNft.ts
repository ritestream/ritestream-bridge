import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'CkNft'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            'CryptoKnights Season 1', // name
            'CKS1', // symbol
            6998, // total supply
            '0xbFC73db7dB2916bAA1e825Ed6d73590a55B72643', //safe address
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
}

deploy.tags = [contractName]

export default deploy
