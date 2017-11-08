pragma solidity ^0.4.13;

import './token/PausableToken.sol';
import './token/BurnableToken.sol';

contract PolyMathToken is PausableToken, BurnableToken {

  // Token properties.
  string public constant name = 'PolyMathToken';
  string public constant symbol = 'POLY';
  // ERC20 compliant types
  // (see https://blog.zeppelin.solutions/tierion-network-token-audit-163850fd1787)
  uint8 public constant decimals = 18;
  // 1 billion POLY tokens in units divisible up to 18 decimals.
  uint256 public constant INITIAL_SUPPLY = 1000 * (10**6) * (10**uint256(decimals));

  uint256 public constant PRESALE_SUPPLY =    150000000 * (10**uint256(decimals));
  uint256 public constant PUBLICSALE_SUPPLY = 150000000 * (10**uint256(decimals));
  uint256 public constant FOUNDER_SUPPLY =    150000000 * (10**uint256(decimals));
  uint256 public constant BDMARKET_SUPPLY =   25000000 * (10**uint256(decimals));
  uint256 public constant ADVISOR_SUPPLY =    25000000 * (10**uint256(decimals));
  uint256 public constant RESERVE_SUPPLY =    500000000 * (10**uint256(decimals));

  function PolyMathToken(address _presale_wallet) {
    require(_presale_wallet != 0x0);
    totalSupply = INITIAL_SUPPLY;
    balances[_presale_wallet] = PRESALE_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY.sub(PRESALE_SUPPLY);
  }

  function setOwner(address _owner) onlyOwner {
    pause();
    balances[owner] = INITIAL_SUPPLY.sub(PUBLICSALE_SUPPLY);// Confused here, by setting owner at a later date, can't i increase my funs back to 850 million?
    owner = _owner;
    balances[owner] = PUBLICSALE_SUPPLY; //and then here we make it public sale? so we set it to 150 million?
  }

  function issueTokens(address _to, uint256 _value) onlyOwner returns (bool) {
    balances[owner] = balances[owner].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(owner, _to, _value);
    return true;
  }

  // Don't accept calls to the contract address; must call a method.
  function () {
    revert();
  }

}
