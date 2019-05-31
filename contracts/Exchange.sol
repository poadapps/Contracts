pragma solidity ^0.5.0;


contract Exchange {
  constructor() public {
  }

  function createToken(string memory abb,string memory name,uint256 supply) public {
    emit NewToken(address(0));
  }
  event NewToken(address adr);
}
