// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InheritanceSwitch {

struct Switch{
    address beneficiary;
    uint256 pyusdAmount;
    uint256 lastCheckIn;
    string dataCID;
    bool isClaimed;
    bool isActive;
    uint256 timeOutPeriod;
}

modifier activeOwner() {
    require(ownerToSwitch[msg.sender].isActive == true);
_;
}

IERC20 public pyusd;

constructor(address _pyusdAddress) {
    require(_pyusdAddress != address(0), "PYUSD address cannot be zero");
    pyusd = IERC20(_pyusdAddress);
}
//uint256 public constant timeOutPeriod = 180 days;


mapping (address => Switch) public ownerToSwitch;

event switchCreated(address indexed owner, address indexed beneficiary, uint256 amount);
event switchCancelled(address indexed owner, uint256 amount);
event checkedIn(address indexed owner, uint256 timestamp);
event beneficiaryUpdated(address indexed owner,address oldBeneficiary, address newBeneficiary);
event dataCIDUpdated(address indexed owner,string dataCID);
event switchClaimed(address indexed beneficiary, address indexed owner,string dataCID, uint256 amount);

function initializeSwitch(address _beneficiary,uint _pyusdAmount, uint256 _timeOutPeriod) public {  
 // need to call the ERC20 approve function in frontend before calling this function  
    require(ownerToSwitch[msg.sender].isActive == false, "Switch already exists");
    require(_beneficiary != address(0), "Beneficiary cannot be zero address");
    require(_pyusdAmount > 0, "Amount must be greater than zero");
    require(_timeOutPeriod > 0, "Timeout period must be greater than zero");
    pyusd.transferFrom(msg.sender, address(this), _pyusdAmount);
    ownerToSwitch[msg.sender].isActive = true;
    ownerToSwitch[msg.sender].beneficiary = _beneficiary;
    ownerToSwitch[msg.sender].lastCheckIn = block.timestamp;
    ownerToSwitch[msg.sender].pyusdAmount = _pyusdAmount;
    ownerToSwitch[msg.sender].timeOutPeriod = _timeOutPeriod;
    emit switchCreated(msg.sender, _beneficiary, _pyusdAmount);   
}


function cancelSwitch() public activeOwner {
// open the contarct and return  everything to the owner, take a confirmation in frontend before calling this 
    pyusd.transfer( msg.sender, ownerToSwitch[msg.sender].pyusdAmount);
    emit switchCancelled(msg.sender, ownerToSwitch[msg.sender].pyusdAmount);
    delete ownerToSwitch[msg.sender];
}

function getMySwitchDetails() public view activeOwner returns(Switch memory){
    return ownerToSwitch[msg.sender];
}

function getSwitchAmount(address _ownerAddress) public view returns(uint256) {
    require(ownerToSwitch[_ownerAddress].isActive == true);    
    require(msg.sender == _ownerAddress || msg.sender == ownerToSwitch[_ownerAddress].beneficiary);
    return ownerToSwitch[_ownerAddress].pyusdAmount;    
}

function getSwitchDataCID(address _ownerAddress) public view returns(string memory){
    require(ownerToSwitch[_ownerAddress].isActive == true);    
    require(msg.sender == _ownerAddress || msg.sender == ownerToSwitch[_ownerAddress].beneficiary);
    return ownerToSwitch[_ownerAddress].dataCID; 
}


function isClaimable(address _ownerAddress) public view  returns(bool) {
// for anyone to check if a will is claimable    
    bool active = ownerToSwitch[_ownerAddress].isActive;
    bool timeExpired = block.timestamp > ownerToSwitch[_ownerAddress].lastCheckIn + ownerToSwitch[_ownerAddress].timeOutPeriod;
    return active && timeExpired;       
}

function updateDataPointer(string memory _newCID) public activeOwner {
// for updating the addrress on which message is stored in lighthouse
    require(bytes(_newCID).length > 0, "CID cannot be empty");
    ownerToSwitch[msg.sender].dataCID = _newCID;
    emit dataCIDUpdated(msg.sender, _newCID);
}


function checkIn() public activeOwner {
    ownerToSwitch[msg.sender].lastCheckIn = block.timestamp;  
    emit checkedIn(msg.sender, block.timestamp);  
}

function claimAssets(address _ownerAddress) public {
    require(isClaimable(_ownerAddress), "The switch is not claimable at the moment");
    require(msg.sender == ownerToSwitch[_ownerAddress].beneficiary, "You are not the beneficiary of this switch");
    ownerToSwitch[_ownerAddress].isClaimed = true;
    ownerToSwitch[_ownerAddress].isActive = false;
    pyusd.transfer(msg.sender, ownerToSwitch[_ownerAddress].pyusdAmount);
    emit switchClaimed(msg.sender,_ownerAddress, ownerToSwitch[_ownerAddress].dataCID, ownerToSwitch[_ownerAddress].pyusdAmount);     
}

function updateBeneficiary(address _newBeneficiary) public activeOwner {
    require(_newBeneficiary != address(0));
    address oldBeneficiary = ownerToSwitch[msg.sender].beneficiary;   
    ownerToSwitch[msg.sender].beneficiary = _newBeneficiary;
    ownerToSwitch[msg.sender].lastCheckIn = uint256(block.timestamp); // GPT said we shouldn't do this though I don't agree
    emit checkedIn(msg.sender, block.timestamp);
    emit beneficiaryUpdated(msg.sender, oldBeneficiary, _newBeneficiary);
}

function isBeneficiary(address _ownerAddress) public view returns(bool) {
    require(ownerToSwitch[_ownerAddress].isActive == true);
    return (msg.sender == ownerToSwitch[_ownerAddress].beneficiary);
}

function timeOutPeriod(address _ownerAddress) public view returns(uint256){
    require(ownerToSwitch[_ownerAddress].isActive == true);
    return block.timestamp - (ownerToSwitch[_ownerAddress].lastCheckIn + ownerToSwitch[_ownerAddress].timeOutPeriod); 
} 

}