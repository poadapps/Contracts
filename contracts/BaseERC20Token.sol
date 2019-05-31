pragma solidity ^0.5.0;
import "/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract BaseERC20Token is ERC20Mintable {
  string private _name;
    string private _symbol;
    uint8 private _decimals;

    /**
     * @dev Sets the values for `name`, `symbol`, and `decimals`. All three of
     * these values are immutable: they can only be set once during
     * construction.
     */
    constructor (string memory name, string memory symbol, uint8 decimals) public {
    }
    
    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
  }
  function initialize(string memory sym,string memory nm,uint8 dec,uint256 totalSupply)public {
      require(bytes(symbol()).length==0);
        _name = nm;
        _symbol = sym;
        _decimals = dec;
        mint(msg.sender,totalSupply);
  }
}
