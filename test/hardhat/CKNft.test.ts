import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'

xdescribe('CKNft Test', function () {
    let CKNft: ContractFactory
    let owner: SignerWithAddress
    let user1: SignerWithAddress
    let user2: SignerWithAddress
    let cknft: Contract
    before(async function () {
        CKNft = await ethers.getContractFactory('CKNft')
        const signers = await ethers.getSigners()

        owner = signers.at(0)!
        user1 = signers.at(1)!
        user2 = signers.at(2)!
    })

    beforeEach(async function () {
        cknft = await CKNft.deploy('CKNft', 'CKN', 100)
    })

    it('should have nft deployed and return name and symbol', async function () {
        expect(await cknft.name()).to.equal('CKNft')
        expect(await cknft.symbol()).to.equal('CKN')
    })
    it('should transfer nft from owner to user1', async function () {
        await cknft.transferFrom(owner.address, user1.address, 1)
        expect(await cknft.ownerOf(1)).to.equal(user1.address)
    })

    it('Should not be able to transfer nft when set transfer disabled', async function () {
        await cknft.setDisableTransfer(true)
        try {
            await cknft.transferFrom(owner.address, user1.address, 1)
        } catch (error: any) {
            expect(error.message).to.equal(
                `VM Exception while processing transaction: reverted with reason string 'Transfer is disabled'`
            )
        }
    })
})
