import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("InheritanceSwitch", function () {
  let owner: any;
  let beneficiary: any;
  let newBeneficiary: any;
  let switchContract: any;
  let pyusd: any;

  const { ethers } = hre;

  beforeEach(async function () {
    [owner, beneficiary, newBeneficiary] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    pyusd = await MockToken.deploy("PYUSD", "PYUSD");
    
    await pyusd.waitForDeployment();

    // Deploy InheritanceSwitch (main contract apna)
    const Switch = await ethers.getContractFactory("InheritanceSwitch");
    switchContract = await Switch.deploy(await pyusd.getAddress());
    await switchContract.waitForDeployment();

    // Give owner some tokens
    await pyusd.mint(owner.address, ethers.parseEther("100"));
  });

  it("should initialize a new switch", async function () {
    await pyusd.connect(owner).approve(await switchContract.getAddress(), ethers.parseEther("10"));
    await switchContract.connect(owner).initializeSwitch(beneficiary.address, ethers.parseEther("10"));

    const sw = await switchContract.getMySwitchDetails();
    expect(sw.beneficiary).to.equal(beneficiary.address);
    expect(sw.pyusdAmount).to.equal(ethers.parseEther("10"));
  });

  it("should allow beneficiary to claim after timeout", async function () {
    await pyusd.connect(owner).approve(await switchContract.getAddress(), ethers.parseEther("10"));
    await switchContract.connect(owner).initializeSwitch(beneficiary.address, ethers.parseEther("10"));

    // Fast forward 180 days (to test timeout)
    await hre.network.provider.send("evm_increaseTime", [180 * 24 * 60 * 60 + 1]);
    await hre.network.provider.send("evm_mine", []);

    await switchContract.connect(beneficiary).claimAssets(owner.address);
    const bal = await pyusd.balanceOf(beneficiary.address);
    expect(bal).to.equal(ethers.parseEther("10"));
  });
  it("should NOT allow beneficiary to claim before timeout", async function () {
    // 1. Initialize the switch
    await pyusd.connect(owner).approve(await switchContract.getAddress(), ethers.parseEther("10"));
    await switchContract.connect(owner).initializeSwitch(beneficiary.address, ethers.parseEther("10"));
    
    // 2. Do NOT fast-forward time
    
    // 3. Expect the transaction to be reverted with the specific error message
    //This checks your require() statement in claimAssets
    await expect(
      switchContract.connect(beneficiary).claimAssets(owner.address)
    ).to.be.revertedWith("The switch is not claimable at the moment");
  });

  it("should allow the owner to update the beneficiary", async function () {
    // 1. Initialize the switch
    await pyusd.connect(owner).approve(await switchContract.getAddress(), ethers.parseEther("10"));
    await switchContract.connect(owner).initializeSwitch(beneficiary.address, ethers.parseEther("10"));

    // 2. Get the timestamp *before* the update
    const sw_before = await switchContract.getMySwitchDetails();
    const oldTimestamp = sw_before.lastCheckIn;

    // 3. Update the beneficiary to the new address
    await switchContract.connect(owner).updateBeneficiary(newBeneficiary.address);

    // 4. Check that the beneficiary address was updated
    const sw_after = await switchContract.getMySwitchDetails();
    expect(sw_after.beneficiary).to.equal(newBeneficiary.address);
    
    // 5. Check that the lastCheckIn timestamp was reset
    expect(sw_after.lastCheckIn).to.be.greaterThan(oldTimestamp);
  });
});