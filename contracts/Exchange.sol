pragma solidity ^0.5.0;
import "./Proxy.sol";

interface ITokenInitialize {
  function initialize(string calldata sym,string calldata nm,uint8 dec,uint256 totalSupply) external;
  function transfer(address recipient, uint256 amount) external returns (bool);
}

contract Exchange {

  address public tokenTemplate ;

  uint public totalFees;

  struct TokenExchangeData{
    uint16 collateral_parts_per_10000;
    uint128 total_shares;
    uint64 initial_price_per_1000000000;
    uint total_collateral;
    uint total_tokens;
  }

  mapping (address=>TokenExchangeData) exchangeData;
  mapping(bytes32=>uint128) userShares;


  constructor(address _tokenTemplate) public {
    tokenTemplate = _tokenTemplate;
  }

  function createToken(string memory abb,string memory name,uint256 supply) public {
    Proxy p = new Proxy(tokenTemplate);
    
    ITokenInitialize(address(p)).initialize(abb,name,18,supply);
    emit NewToken(address(p));
    ITokenInitialize(address(p)).transfer(msg.sender,supply);
    
  }

  function addToExchange(address _token,uint _supply,uint16 collateralIn10000, uint256 initialPrice) external payable{
    require(exchangeData[_token].total_shares==0,"token already added");

  }
  function addLiquidity(address _token) external payable{
    require(exchangeData[_token].initial_price_per_1000000000>0,"token does not exist");

  }
  function removeLiquidity(address _token,uint shares_to_redeem) external{
    require(exchangeData[_token].initial_price_per_1000000000>0,"token does not exist");

  }
  function removeAllLiquidity(address _token) external{
    require(exchangeData[_token].initial_price_per_1000000000>0,"token does not exist");

  }
  function buy(address _token,uint amount) external payable{

  }
  function sell(address _token,uint amount) external{
  
  }
  function getSellPrice(address _token,uint amount) external view returns(uint){

  }
  function getBuyPrice(address _token,uint amount) external view returns(uint){

  }
  event NewToken(address tokenAdr);
}
