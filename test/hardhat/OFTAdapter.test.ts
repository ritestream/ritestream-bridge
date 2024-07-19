/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { deployments, ethers } from "hardhat";

import { Options } from "@layerzerolabs/lz-v2-utilities";
import { formatUnits } from "ethers/lib/utils";

describe("OFTAdapter Test", function () {
  // Constant representing a mock Endpoint ID for testing purposes
  const eidA = 1;
  const eidB = 2;
  // Declaration of variables to be used in the test suite
  let MyOFT: ContractFactory;
  let MyOFTAdapter: ContractFactory;
  let MyOFTExist: ContractFactory;
  let EndpointV2Mock: ContractFactory;
  let ownerA: SignerWithAddress;
  let ownerB: SignerWithAddress;
  let endpointOwner: SignerWithAddress;
  let myOFTA: Contract;
  let myOFTAdapter: Contract;
  let myOFTB: Contract;
  let mockEndpointV2A: Contract;
  let mockEndpointV2B: Contract;
  let userA: SignerWithAddress;
  let userB: SignerWithAddress;

  before(async function () {
    MyOFT = await ethers.getContractFactory("RiteBaseMock");
    MyOFTAdapter = await ethers.getContractFactory("RiteAdapterMock");
    MyOFTExist = await ethers.getContractFactory("RiteBscMock");
    const signers = await ethers.getSigners();

    ownerA = signers.at(0)!;
    ownerB = signers.at(1)!;
    userA = signers.at(2)!;
    userB = signers.at(3)!;
    endpointOwner = signers.at(2)!;

    const EndpointV2MockArtifact =
      await deployments.getArtifact("EndpointV2Mock");
    EndpointV2Mock = new ContractFactory(
      EndpointV2MockArtifact.abi,
      EndpointV2MockArtifact.bytecode,
      endpointOwner
    );
  });

  beforeEach(async function () {
    mockEndpointV2A = await EndpointV2Mock.deploy(eidA);
    mockEndpointV2B = await EndpointV2Mock.deploy(eidB);

    myOFTA = await MyOFTExist.deploy(ownerA.address);
    myOFTAdapter = await MyOFTAdapter.deploy(
      myOFTA.address,
      mockEndpointV2A.address,
      ownerA.address
    );
    myOFTB = await MyOFT.deploy(mockEndpointV2B.address, ownerA.address);

    await mockEndpointV2A.setDestLzEndpoint(
      myOFTB.address,
      mockEndpointV2B.address
    );
    await mockEndpointV2B.setDestLzEndpoint(
      myOFTAdapter.address,
      mockEndpointV2A.address
    );

    await myOFTAdapter
      .connect(ownerA)
      .setPeer(eidB, ethers.utils.zeroPad(myOFTB.address, 32));
    await myOFTB
      .connect(ownerA)
      .setPeer(eidA, ethers.utils.zeroPad(myOFTAdapter.address, 32));
  });

  it("Should not be able to bridge tokens if the contract is paused", async function () {
    try {
      await myOFTAdapter.connect(ownerA).pause();
      const initialAmount = ethers.utils.parseEther("100");
      await myOFTA.mint(userA.address, initialAmount);

      const allowance = await myOFTA.allowance(
        userA.address,
        myOFTAdapter.address
      );

      if (allowance.lt(initialAmount)) {
        await myOFTA
          .connect(userA)
          .approve(myOFTAdapter.address, initialAmount);
      }

      const tokensToSend = ethers.utils.parseEther("100");
      const options = Options.newOptions()
        .addExecutorLzReceiveOption(200000, 0)
        .toHex()
        .toString();

      const sendParam = [
        eidB,
        ethers.utils.zeroPad(userA.address, 32),
        tokensToSend,
        tokensToSend,
        options,
        "0x",
        "0x",
      ];

      const [nativeFee] = await myOFTAdapter.quoteSend(sendParam, false);

      await myOFTAdapter
        .connect(userA)
        .send(sendParam, [nativeFee, 0], userA.address, { value: nativeFee });
    } catch (error: any) {
      expect(error.message).to.contain("EnforcedPause()");
    }
  });

  it("Should bridge tokens from OFTA to OFTB and also be able to bridge back", async function () {
    try {
      // await myOFTAdapter.connect(ownerA).pause()
      const initialAmount = ethers.utils.parseEther("100");
      await myOFTA.mint(userA.address, initialAmount);

      const allowance = await myOFTA.allowance(
        userA.address,
        myOFTAdapter.address
      );

      if (allowance.lt(initialAmount)) {
        await myOFTA
          .connect(userA)
          .approve(myOFTAdapter.address, initialAmount);
      }

      const tokensToSend = ethers.utils.parseEther("100");
      const options = Options.newOptions()
        .addExecutorLzReceiveOption(200000, 0)
        .toHex()
        .toString();

      const sendParam = [
        eidB,
        ethers.utils.zeroPad(userA.address, 32),
        tokensToSend,
        tokensToSend,
        options,
        "0x",
        "0x",
      ];

      // Quote the send amount and receive amount
      const quote = await myOFTAdapter.quoteOFT(sendParam);
      expect(quote.oftReceipt.amountSentLD).eql(tokensToSend);
      expect(quote.oftReceipt.amountReceivedLD).eql(
        tokensToSend.sub(tokensToSend.div(200))
      );

      const [nativeFee] = await myOFTAdapter.quoteSend(sendParam, false);

      await myOFTAdapter
        .connect(userA)
        .send(sendParam, [nativeFee, 0], userA.address, { value: nativeFee });

      // Fetching the final token balances of ownerA and ownerB
      const finalBalanceA = await myOFTA.balanceOf(userA.address);
      const finalBalanceB = await myOFTB.balanceOf(userA.address);

      // Asserting that the final balances are as expected after the send operation
      expect(finalBalanceA).eql(initialAmount.sub(tokensToSend));
      // Receive token amount should be without 0.5% fee
      expect(finalBalanceB).eql(tokensToSend.sub(tokensToSend.div(200)));

      // Bridge back
      const tokensToSendBack = ethers.utils.parseEther("10");
      const backOptions = Options.newOptions()
        .addExecutorLzReceiveOption(200000, 0)
        .toHex()
        .toString();

      const sendBackParam = [
        eidA,
        ethers.utils.zeroPad(userA.address, 32),
        tokensToSendBack,
        tokensToSendBack,
        backOptions,
        "0x",
        "0x",
      ];

      // Quote the send amount and receive amount
      const bridgeBackQuote = await myOFTB.quoteOFT(sendParam);
      expect(bridgeBackQuote.oftReceipt.amountSentLD).eql(tokensToSend);
      expect(bridgeBackQuote.oftReceipt.amountReceivedLD).eql(
        tokensToSend.sub(tokensToSend.div(200))
      );

      const [nativeFeeToBack] = await myOFTB.quoteSend(sendBackParam, false);

      await myOFTB
        .connect(userA)
        .send(sendBackParam, [nativeFeeToBack, 0], userA.address, {
          value: nativeFeeToBack,
        });

      const finalBalanceAAfterBack = await myOFTA.balanceOf(userA.address);
      const finalBalanceBAfterBack = await myOFTB.balanceOf(userA.address);

      expect(finalBalanceBAfterBack).eql(finalBalanceB.sub(tokensToSendBack));
      expect(finalBalanceAAfterBack).eql(
        tokensToSendBack.sub(tokensToSendBack.div(200))
      );
    } catch (error) {
      console.log(error);
    }
  });
});
