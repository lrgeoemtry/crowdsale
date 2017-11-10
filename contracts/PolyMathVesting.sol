pragma solidity ^0.4.13;

import './PolyMathToken.sol';

contract PolyMathVesting {

  // Contract holds ERC20 POLY tokens.
  // Tokens to be deposited for team and advisors.
  // Tokens to be deposited for bounties.
  PolyMathToken token;
  // Date to release tokens.
  uint64 releaseTime;

  // Beneficiary mapping similar to approach used in the BAT token sale
  // https://github.com/brave-intl/basic-attention-token-crowdsale/blob/master/contracts/BATSafe.sol
  mapping (address => uint256) allocations;

  uint256 vestingAmount = 1000000000000000000; //18 zeros

  function PolyMathVesting(address _token, uint64 _releaseTime, address _vestingAddress) {
    require(_releaseTime > getBlockTimestamp());
    token = PolyMathToken(_token);
    releaseTime = _releaseTime;

  // Allocated token balances for vesting (18 decimals required)
    allocations[_vestingAddress] = vestingAmount;
  }

  function release() {
    require(getBlockTimestamp() >= releaseTime);

    uint256 entitled = allocations[msg.sender];
    allocations[msg.sender] = 0;

    uint256 amount = token.balanceOf(this);
    require(amount > 0);
    //should alos require amount >= however much poly this contract hold 

    require(token.transfer(msg.sender, entitled)); 
  }

   function getBlockTimestamp() internal constant returns (uint256) {
     return block.timestamp;
   }
}


//Type of Vesting We Need
  //Advisor - 1 time on August 23rd, 2018
  //Founders - 6 month vesting , with 5% of Total for each founder
  //Biz Dev - 1 year starting with 1/12 on day One (day one of the token being created)

//Non Vesting
  //Pre sale A B
  //Public sale
  //Reserve, bounty, 

  /*
what is the best way to build these out?

I would say set up a pre sale contract with the 20 or so addresses that allows them to withdraw
this way if someone sends us an incorrect address, we could potentially fix it .. if we made sure we could

public sale is set up!

then set up a reserve & bounty contract



  */
