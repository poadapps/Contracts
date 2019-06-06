pragma solidity ^0.5.0;
import "./Proxy.sol";
import "./BaseERC20Token.sol";
import "/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

interface ITokenInitialize {
  function initialize(string calldata sym,string calldata nm,uint8 dec,uint256 totalSupply) external;
}

contract Exchange {

  address public tokenTemplate ;
  address public exchangeCreatorToken ;

  uint public totalFees;

  struct TokenExchangeData{
    uint16 collateral_parts_per_10000;
    uint128 total_shares;
    uint total_collateral;
    uint total_tokens;
  }

  mapping (address=>TokenExchangeData) exchangeData;
  mapping(bytes32=>uint128) userShares;


  constructor(address _tokenTemplate) public {
    tokenTemplate = _tokenTemplate;
  }

  function setCreator(address _creator) public {
    require(exchangeCreatorToken==address(0),'token can be set only once');
    exchangeCreatorToken = _creator;
  }

  function burnFees(uint amount) public{
    uint sumForAmount = getSellPrice(exchangeCreatorToken, amount);
    require(sumForAmount<totalFees,'not enought fees collected');
    address payable _that = address(uint160(address(this)));
    buyInternal(exchangeCreatorToken,amount,totalFees,_that);
    BaseERC20Token(exchangeCreatorToken).burn(BaseERC20Token(exchangeCreatorToken).balanceOf(address(this)));
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
    userShares[keccak256(abi.encodePacked(msg.sender,_token))]=uint128(userShares[keccak256(abi.encodePacked(msg.sender,_token))]+newShares);

  }
  function removeLiquidity(address _token,uint128 shares_to_redeem) external{
    require(exchangeData[_token].collateral_parts_per_10000>0,"token does not exist");
    require(userShares[keccak256(abi.encodePacked(msg.sender,_token))]>=shares_to_redeem,"You do not have enaught shares");
    removeLiquidityInternal(_token,shares_to_redeem);
    userShares[keccak256(abi.encodePacked(msg.sender,_token))] = uint128(userShares[keccak256(abi.encodePacked(msg.sender,_token))] - shares_to_redeem);
  }
  function removeAllLiquidity(address _token) external{
    require(exchangeData[_token].collateral_parts_per_10000>0,"token does not exist");
    removeLiquidityInternal(_token,userShares[keccak256(abi.encodePacked(msg.sender,_token))]);
    userShares[keccak256(abi.encodePacked(msg.sender,_token))] = 0;
  }

  function removeLiquidityInternal(address _token,uint128 shares_to_redeem) private{
    uint tokensToTransfer = exchangeData[_token].total_tokens*shares_to_redeem/exchangeData[_token].total_shares;
    sendTokensFromPoolInternal(msg.sender,_token,tokensToTransfer);
    uint ethToTransfer = exchangeData[_token].total_collateral*shares_to_redeem/exchangeData[_token].total_shares;
    sendEthFromPoolInternal(msg.sender,_token,ethToTransfer);
    exchangeData[_token].total_shares = exchangeData[_token].total_shares - shares_to_redeem;
  }

  function sendTokensFromPoolInternal(address payable recipient,address _token,uint256 amountToSend) private{
    require(IERC20(_token).transfer(address(recipient),amountToSend),'no tokens to transfer or no allowence');
    exchangeData[_token].total_tokens=exchangeData[_token].total_tokens-amountToSend;
  }

  function sendEthFromPoolInternal(address payable recipient,address _token,uint256 amountToSend) private{
    if(recipient != address(this) ){
      recipient.transfer(amountToSend);
    }
    exchangeData[_token].total_collateral=exchangeData[_token].total_collateral-amountToSend;
  }

  function buy(address _token,uint amount) public payable{
    buyInternal(_token,amount,msg.value,msg.sender);
  }

  function buyInternal(address _token,uint amount,uint sum,address payable recipient) private {
    uint256 sumForTokens = getBuyPrice(_token,amount);
    uint256 fee = sumForTokens*3/10000;
    totalFees = totalFees+fee;
    require(sum>fee+sumForTokens,'not enaught funds');
    sendTokensFromPoolInternal(recipient,_token,amount);
    exchangeData[_token].total_collateral=exchangeData[_token].total_collateral+sum;
    sendEthFromPoolInternal(recipient,_token,sum- sumForTokens - fee);
  }

  function sell(address _token,uint amount) external{
    uint256 sumForTokens = getSellPrice(_token,amount);
    uint256 fee = sumForTokens*3/10000;
    totalFees = totalFees+fee;
    require(IERC20(_token).transferFrom(msg.sender,address(this),amount),'no tokens to transfer or no allowence');
    exchangeData[_token].total_tokens=exchangeData[_token].total_tokens+amount;
    sendEthFromPoolInternal(msg.sender,_token,sumForTokens-fee);
  }
  function getSellPrice(address _token,uint amount) public view returns(uint){
    uint price_per_10_18 = (exchangeData[_token].total_collateral*10000/exchangeData[_token].collateral_parts_per_10000)*(10**18)/(exchangeData[_token].total_tokens+amount*10000/exchangeData[_token].collateral_parts_per_10000);
    return price_per_10_18*amount/(10**18);
  }
  function getBuyPrice(address _token,uint amount) public view returns(uint){
    uint price_per_10_18 = (exchangeData[_token].total_collateral*10000/exchangeData[_token].collateral_parts_per_10000)*(10**18)/(exchangeData[_token].total_tokens-amount*10000/exchangeData[_token].collateral_parts_per_10000);
    return price_per_10_18*amount/(10**18);
  }
  event NewToken(address tokenAdr);
}
