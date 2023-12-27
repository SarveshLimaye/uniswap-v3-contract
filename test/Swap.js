const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

async function getSigner() {
  const [signer] = await ethers.getSigners();
  return signer;
}

describe("Uniswap V3 Swap", function () {
  it("Should swap DAI for WETH9", async function () {
    const signer = await getSigner();
    const weth = await ethers.getContractAt("IWETH", WETH9);
    const dai = await ethers.getContractAt("IERC20", DAI);
    const SingleSwap = await ethers.getContractFactory("SingleSwap");
    const singleSwap = await SingleSwap.deploy();
    await singleSwap.deployed();

    const amountIn = ethers.utils.parseEther("10").toString();

    // Deposit WETH
    await weth.deposit({ value: amountIn });
    const wethBalance = await weth.balanceOf(signer.address);
    console.log("WETH balance", ethers.utils.formatEther(wethBalance));

    const inputamt = ethers.utils.parseEther("5").toString();

    //Approve weth to smartcontract
    const tx = await weth.approve(singleSwap.address, inputamt);

    tx.wait(1);

    //Check allowance
    const allowance = await weth.allowance(signer.address, singleSwap.address);

    expect(allowance).to.equal(inputamt);

    console.log("Allowance", ethers.utils.formatEther(allowance));

    // Swap
    const tx2 = await singleSwap.swapExactInputSingle(inputamt);

    const daibalance = await dai.balanceOf(signer.address);

    console.log(
      "DAI balance is + ",
      hre.ethers.utils.formatUnits(daibalance, 18)
    );

    expect(
      parseFloat(hre.ethers.utils.formatUnits(daibalance, 18))
    ).to.be.above(0);
  });
});
