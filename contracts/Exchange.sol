pragma solidity ^0.5.0;
import "./Proxy.sol";
import "/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

interface ITokenInitialize {
  function initialize(string calldata sym,string calldata nm,uint8 dec,uint256 totalSupply) external;
}

contract Exchange {

  address public tokenTemplate ;

  uint public totalFees;

  struct TokenExchangeData{
    uint16 collateral_parts_per_10000;
    uint128 total_shares;
    uint total_collateral;
    uint total_tokens;
  }

  mapping (address=>TokenExchangeData) exchangeData;
  mapping(bytes32=>uint) userShares;


  constructor(address _tokenTemplate) public {
    tokenTemplate = _tokenTemplate;
  }

  function createToken(string memory abb,string memory name,uint256 supply) public {
    Proxy p = new Proxy(tokenTemplate);
    
    ITokenInitialize(address(p)).initialize(abb,name,18,supply);
    emit NewToken(address(p));
    IERC20(address(p)).transfer(msg.sender,supply);
    
  }

  function addToExchange(address _token,uint _supply,uint16 collateralIn10000, uint256 initialPrice) external payable{
    require(exchangeData[_token].total_shares==0,"token already added");
    uint expectedCollateral = initialPrice*collateralIn10000/100000*_supply/(10**18);
    require(expectedCollateral<=msg.value,"collateral to small to register token");
    require(IERC20(_token).transferFrom(msg.sender,address(this),_supply),'no tokens to transfer or no allowence');
    exchangeData[_token].total_shares = 10**18;
    exchangeData[_token].total_collateral = expectedCollateral;
    exchangeData[_token].total_tokens = _supply;
    exchangeData[_token].collateral_parts_per_10000 = collateralIn10000;
    address(msg.sender).transfer(msg.value-expectedCollateral);
    userShares[keccak256(abi.encodePacked(msg.sender,_token))]=exchangeData[_token].total_shares;

  }
  function addLiquidity(address _token) external payable{
    require(exchangeData[_token].collateral_parts_per_10000>0,"token does not exist");
    uint currentPriceFor18 = exchangeData[_token].total_collateral/exchangeData[_token].collateral_parts_per_10000*10000*(10**18)/exchangeData[_token].total_tokens;
    uint expectedAmount = msg.value*(10**18)/currentPriceFor18;
    require(IERC20(_token).transferFrom(msg.sender,address(this),expectedAmount),'no tokens to transfer or no allowence');
    uint newShares = expectedAmount*exchangeData[_token].total_shares/exchangeData[_token].total_tokens;
    exchangeData[_token].total_tokens = exchangeData[_token].total_tokens+expectedAmount;
    exchangeData[_token].total_collateral = exchangeData[_token].total_collateral+msg.value;
    userShares[keccak256(abi.encodePacked(msg.sender,_token))]=userShares[keccak256(abi.encodePacked(msg.sender,_token))]+newShares;

  }
  function removeLiquidity(address _token,uint shares_to_redeem) external{
    require(exchangeData[_token].collateral_parts_per_10000>0,"token does not exist");
    require(userShares[keccak256(abi.encodePacked(msg.sender,_token))]>=shares_to_redeem,"You do not have enaught shares");
    removeLiquidityInternal(_token,shares_to_redeem);
  }
  function removeAllLiquidity(address _token) external{
    require(exchangeData[_token].collateral_parts_per_10000>0,"token does not exist");
    removeLiquidityInternal(_token,userShares[keccak256(abi.encodePacked(msg.sender,_token))]);
  }

  function removeLiquidityInternal(address _token,uint shares_to_redeem) private{
    uint tokensToTransfer = 0;
    uint ethToTransfer =0 ;
    require(IERC20(_token).transfer(address(msg.sender),tokensToTransfer),'no tokens to transfer or no allowence');
    address(msg.sender).transfer(ethToTransfer);
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
