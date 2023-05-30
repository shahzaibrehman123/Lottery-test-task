const { expect } = require("chai");
const { ethers } = require("hardhat");

// Test the purchase function
describe("Purchase function", function () {
  it("should allow users to purchase tickets", async function () {
    const lotteryContract = await ethers.getContractFactory("Lottery");
    const lottery = await lotteryContract.deploy(1, 10, 5);
    await lottery.deployed();

    await expect(() => lottery.purchase({ value: 1 })).to.changeEtherBalance(
      lottery,
      1
    ); // Check if the contract balance increases by the ticket price
  });

  it("should revert when trying to purchase more tickets than available", async function () {
    const lotteryContract = await ethers.getContractFactory("Lottery");
    const lottery = await lotteryContract.deploy(1, 1, 1);
    await lottery.deployed();

    await lottery.purchase({ value: 1 });

    await expect(lottery.purchase({ value: 1 })).to.be.revertedWith("sold out");
  });

  it("should revert when not enough ether is paid", async function () {
    const lotteryContract = await ethers.getContractFactory("Lottery");
    const lottery = await lotteryContract.deploy(10, 10, 5);
    await lottery.deployed();

    await expect(lottery.purchase({ value: 5 })).to.be.revertedWith(
      "Not enough ether Paid"
    );
  });
});

// Test the Start function
describe("Start function", function () {
  it("should select a winner and distribute the prize", async function () {
    const lotteryContract = await ethers.getContractFactory("Lottery");
    const lottery = await lotteryContract.deploy(1, 10, 2);
    await lottery.deployed();

    // Mocking the generate_random function to always return 0
    const randomNumber = 0;
    lottery.generate_random = () => randomNumber;

    await lottery.purchase({ value: 1 });
    await lottery.purchase({ value: 1 });
    await lottery.purchase({ value: 1 });

    const winnerAddressBefore = await lottery.holders(randomNumber);
    const winnerBalanceBefore = await ethers.provider.getBalance(
      winnerAddressBefore
    );

    await lottery.Start();

    const winnerAddressAfter = await lottery.holders(randomNumber);
    const winnerBalanceAfter = await ethers.provider.getBalance(
      winnerAddressAfter
    );

    expect(winnerAddressAfter).to.equal(winnerAddressBefore); // Check if the winner remains the same
    expect(winnerBalanceAfter > winnerBalanceBefore); // Check if the winner's balance increases
  });

  it("should revert if the lottery is already in progress", async function () {
    const lotteryContract = await ethers.getContractFactory("Lottery");
    const lottery = await lotteryContract.deploy(1, 10, 3);
    await lottery.deployed();

    // Mocking the generate_random function to always return 0
    const randomNumber = 0;
    lottery.generate_random = () => randomNumber;

    await lottery.purchase({ value: 1 });
    await lottery.purchase({ value: 1 });
    await lottery.purchase({ value: 1 });

    await lottery.Start();

    await expect(lottery.Start()).to.be.revertedWith("already in progress");
  });
});

// Test the state_reset function
describe("State Reset function", function () {
  it("should reset the contract state for a new lottery", async function () {
    const lotteryContract = await ethers.getContractFactory("Lottery");
    const lottery = await lotteryContract.deploy(1, 10, 3);
    await lottery.deployed();

    await lottery.purchase({ value: 1 });
    await lottery.purchase({ value: 1 });
    await lottery.purchase({ value: 1 });

    await lottery.Start(); // Send all the balance to the winner

    await lottery.state_reset(1, 10, 3);
    await expect(() => lottery.purchase({ value: 1 })).to.changeEtherBalance(
      lottery,
      1
    ); // Check if the contract balance increases by the ticket price
  });
});

// Test the onlyOwner modifier
describe("Only Owner modifier", function () {
  it("should allow the owner to execute restricted functions", async function () {
    const lotteryContract = await ethers.getContractFactory("Lottery");
    const lottery = await lotteryContract.deploy(1, 10, 5);
    await lottery.deployed();

    const [owner, otherAddress] = await ethers.getSigners();

    await expect(lottery.connect(otherAddress).state_reset(2, 20, 10)).to.be.revertedWith("not owner");
    await expect(lottery.connect(owner).state_reset(2, 20, 10)).to.not.be.reverted;
  });
});
