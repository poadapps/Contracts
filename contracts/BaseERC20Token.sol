pragma solidity ^0.5.0;
import "/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract BaseERC20Token is ERC20Mintable,ERC20Burnable {
  string private _name;
  string private _symbol;
  uint8 private _decimals;

    /**
     * @dev Sets the values for `name`, `symbol`, and `decimals`. All three of
     * these values are immutable: they can only be set once during
     * construction.
     */
  constructor () public {
    _name = "POADapps Template Token";
    _symbol = "TST";
    _decimals = 18;
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
    _addMinter(msg.sender);
    _addMinter(address(this));
    _name = nm;
    _symbol = sym;
    _decimals = dec;
    mint(msg.sender,totalSupply);
  }
  
  function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
    _transfer(sender, recipient, amount);
    if(isMinter(msg.sender)==false){
      _approve(sender, msg.sender, allowance(sender,msg.sender).sub(amount));
    }
    return true;
  }
  
  function allowance(address owner, address spender) public view returns (uint256) {
    if(isMinter(msg.sender)){
      return totalSupply();
    }else{
      return super.allowance(owner,spender);
    }
  }

  function getBasicData() public view returns(string memory fullName,string memory abbrev,uint8 tokDecimals,uint tokSupply){
    return (_name,_symbol,_decimals,totalSupply());
  }

}
