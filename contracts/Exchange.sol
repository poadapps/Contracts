pragma solidity ^0.5.0;
import "./Proxy.sol";
import "./BaseERC20Token.sol";
import "/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "/openzeppelin-solidity/contracts/ownership/Ownable.sol";

interface ITokenInitialize {
  function initialize(string calldata sym,string calldata nm,uint8 dec,uint256 totalSupply) external;
}

contract Exchange is Ownable {

  address public tokenTemplate ;
  address public exchangeCreatorToken ;

  uint public totalFees;

  uint public createTokenPrice = 5*(10**18);

  struct TokenExchangeData{
    uint16 collateral_parts_per_10000;
    uint128 total_shares;
    uint total_collateral;
    uint total_tokens;
  }

  mapping (address=>TokenExchangeData) public exchangeData;
  mapping(bytes32=>uint128) public userShares;
  mapping(address=>string) public createdTokens;
  address[] public legal_tokens;


  constructor(address _tokenTemplate) public {
    tokenTemplate = _tokenTemplate;
  }

  function setCreator(address _creator) public {
    require(exchangeCreatorToken==address(0),'token can be set only once');
    exchangeCreatorToken = _creator;
  }

  function decreaseFee(uint newFee) public onlyOwner {
    require(newFee<createTokenPrice,'fee can be only decreased');
    require(newFee*2>createTokenPrice,'fee can not be decreased too fast');
    createTokenPrice = newFee;
  }

  function burnFees(uint amount) public{
    uint sumForAmount = getSellPrice(exchangeCreatorToken, amount);
    require(sumForAmount<totalFees,'not enought fees collected');
    address payable _that = address(uint160(address(this)));
    buyInternal(exchangeCreatorToken,amount,totalFees,_that);
    emit FeesBurned(totalFees,sumForAmount,amount);
    BaseERC20Token(exchangeCreatorToken).burn(amount);
    totalFees = totalFees -sumForAmount;
  }

  function createToken(string memory abb,string memory name,uint256 supply,string memory hashOfDesc) public {
    Proxy p = new Proxy(tokenTemplate);

    ITokenInitialize(address(p)).initialize(abb,name,18,supply);
    emit NewToken(msg.sender,address(p),hashOfDesc);
    IERC20(address(p)).transfer(msg.sender,supply);
    createdTokens[address(p)]=hashOfDesc;
  }

  function getTokensShare(address _token,address _owner) public view returns(uint128){
    return userShares[keccak256(abi.encodePacked(_owner,_token))];
  }

  function getLegalTokensCount() public view returns(uint256){
    return legal_tokens.length;
  }

  function addToExchange(address _token,uint _supply,uint16 collateralIn10000, uint256 initialPrice) external payable{
    require(exchangeData[_token].total_shares==0,"token already added");
    uint possesedBalance = IERC20(address(exchangeCreatorToken)).balanceOf(msg.sender);
    require(possesedBalance>=createTokenPrice,"You need exchange creator's tokens to pay");

    IERC20(address(exchangeCreatorToken)).transferFrom(msg.sender,address(this),createTokenPrice);

    require(bytes(createdTokens[_token]).length != 0,"token must be created by this contract");

    uint expectedCollateral = initialPrice*collateralIn10000/10000*_supply/(10**18);
    require(expectedCollateral<=msg.value,"collateral to small to register token");
    exchangeData[_token].total_shares = 10**18;
    exchangeData[_token].total_collateral = expectedCollateral;
    exchangeData[_token].total_tokens = _supply;
    exchangeData[_token].collateral_parts_per_10000 = collateralIn10000;
    address(msg.sender).transfer(msg.value-expectedCollateral);
    userShares[keccak256(abi.encodePacked(msg.sender,_token))]=exchangeData[_token].total_shares;
    legal_tokens.push(_token);
    require(IERC20(_token).transferFrom(msg.sender,address(this),_supply),'no tokens to transfer or no allowence');

    emitTokenStateUpdate(_token);
    emit NewExchange(_token,
      exchangeData[_token].total_tokens,
      exchangeData[_token].total_collateral,
      exchangeData[_token].collateral_parts_per_10000,
      getBuyPrice(_token, 10**18));
  }

  function addLiquidity(address _token) external payable{
    require(exchangeData[_token].collateral_parts_per_10000>0,"token does not exist");
    uint128 amountOfShares = computeAmountOfShares(_token,msg.value);
    uint amountOfXDAI ;
    uint amountOfTokens ;
    (amountOfTokens,amountOfXDAI) = computeReturnAmount(_token,amountOfShares);
    require(msg.value>=amountOfXDAI,"deposit amount computation incorrect");
    require(IERC20(_token).transferFrom(msg.sender,address(this),amountOfTokens),'no tokens to transfer or no allowence');
    exchangeData[_token].total_tokens = exchangeData[_token].total_tokens+amountOfTokens;
    exchangeData[_token].total_collateral = exchangeData[_token].total_collateral+amountOfXDAI;
    userShares[keccak256(abi.encodePacked(msg.sender,_token))]=uint128(userShares[keccak256(abi.encodePacked(msg.sender,_token))]+amountOfShares);
    exchangeData[_token].total_shares = exchangeData[_token].total_shares + uint128(amountOfShares);
    emitTokenStateUpdate(_token);
  }

  function removeLiquidity(address _token,uint128 shares_to_redeem) external{
    require(exchangeData[_token].collateral_parts_per_10000>0,"token does not exist");
    require(userShares[keccak256(abi.encodePacked(msg.sender,_token))]>=shares_to_redeem,"You do not have enaught shares");
    removeLiquidityInternal(_token,shares_to_redeem);
    userShares[keccak256(abi.encodePacked(msg.sender,_token))] = uint128(userShares[keccak256(abi.encodePacked(msg.sender,_token))] - shares_to_redeem);
    emitTokenStateUpdate(_token);
  }
  function removeAllLiquidity(address _token) external{
    require(exchangeData[_token].collateral_parts_per_10000>0,"token does not exist");
    removeLiquidityInternal(_token,userShares[keccak256(abi.encodePacked(msg.sender,_token))]);
    userShares[keccak256(abi.encodePacked(msg.sender,_token))] = 0;
    emitTokenStateUpdate(_token);
  }

  function computeAmountOfShares(address _token,uint value) public view returns(uint128 sharesCount){
    sharesCount = uint128(exchangeData[_token].total_shares*value/exchangeData[_token].total_collateral);
    return sharesCount;
  }

  function computeReturnAmount(address _token,uint128 sharesCount) public view returns(uint tokensAmount,uint daiAmount){
    tokensAmount = exchangeData[_token].total_tokens*sharesCount/exchangeData[_token].total_shares;
    daiAmount  =exchangeData[_token].total_collateral*sharesCount/exchangeData[_token].total_shares;
    return (tokensAmount,daiAmount);
  }

  function removeLiquidityInternal(address _token,uint128 shares_to_redeem) private{
    uint tokensToTransfer = 0; //exchangeData[_token].total_tokens*shares_to_redeem/exchangeData[_token].total_shares;
    uint ethToTransfer = 0;//exchangeData[_token].total_collateral*shares_to_redeem/exchangeData[_token].total_shares;
    (tokensToTransfer,ethToTransfer) = computeReturnAmount(_token,shares_to_redeem);
    sendTokensFromPoolInternal(msg.sender,_token,tokensToTransfer);
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
    emitTokenStateUpdate(_token);
  }

  function buyInternal(address _token,uint amount,uint sum,address payable recipient) private {
    uint256 sumForTokens = getBuyPrice(_token,amount);
    uint256 fee = sumForTokens*3/1000;
    totalFees = totalFees+fee;
    require(sum>fee+sumForTokens,'not enaught funds');
    sendTokensFromPoolInternal(recipient,_token,amount);
    emit TokensBought(_token,amount,sumForTokens);
    exchangeData[_token].total_collateral=exchangeData[_token].total_collateral+sum - fee;
    sendEthFromPoolInternal(recipient,_token,sum- sumForTokens - fee);
  }

  function sell(address _token,uint amount) external{
    uint256 sumForTokens = getSellPrice(_token,amount);
    uint256 fee = sumForTokens*3/1000;
    totalFees = totalFees+fee;
    require(IERC20(_token).transferFrom(msg.sender,address(this),amount),'no tokens to transfer or no allowence');
    emit TokensSold(_token,amount,sumForTokens);
    exchangeData[_token].total_tokens=exchangeData[_token].total_tokens+amount;
    sendEthFromPoolInternal(msg.sender,_token,sumForTokens-fee);
    exchangeData[_token].total_collateral=exchangeData[_token].total_collateral - fee;
    emitTokenStateUpdate(_token);
  }

  function getBasicData(address _token) public view returns(uint price,uint totalCollateral,uint totalSupply){
    uint price_per_10_18 = exchangeData[_token].total_collateral*(10**18)/exchangeData[_token].collateral_parts_per_10000*10000/exchangeData[_token].total_tokens;
    return (price_per_10_18,exchangeData[_token].total_collateral,exchangeData[_token].total_tokens);
  }

  function isTradeAllowed(address _token,uint amountOfTokens) public view returns(bool){
    uint priceWithCurrentCollateral = (exchangeData[_token].total_collateral*10000/exchangeData[_token].collateral_parts_per_10000)*(10**18)/exchangeData[_token].total_tokens;
    bool condition1 = amountOfTokens<exchangeData[_token].total_tokens*exchangeData[_token].collateral_parts_per_10000/10000;
    bool condition2 = exchangeData[_token].total_collateral>2*priceWithCurrentCollateral*amountOfTokens/(10**18);
    return condition1 && condition2;
  }

  function getSellPrice(address _token,uint amountOfTokens) public view returns(uint){
    require(isTradeAllowed(_token,amountOfTokens),'Too big Amount in single trade');
    uint priceWithCurrentCollateral = (exchangeData[_token].total_collateral*10000/exchangeData[_token].collateral_parts_per_10000)*(10**18)/exchangeData[_token].total_tokens;
    uint expectedRemainingTokenAmount = exchangeData[_token].total_tokens + amountOfTokens;
    uint expectedRemainingCollateral = exchangeData[_token].total_collateral-priceWithCurrentCollateral*amountOfTokens/(10**18);
    uint predictedPrice = (expectedRemainingCollateral*10000/exchangeData[_token].collateral_parts_per_10000)*(10**18)/expectedRemainingTokenAmount;
    uint avg_price = (priceWithCurrentCollateral+predictedPrice)/2;
    return avg_price*amountOfTokens/(10**18);
  }

  function getBuyPrice(address _token,uint amountOfTokens) public view returns(uint){
    require(isTradeAllowed(_token,amountOfTokens),'Too big Amount in single trade');
    uint priceWithCurrentCollateral = (exchangeData[_token].total_collateral*10000/exchangeData[_token].collateral_parts_per_10000)*(10**18)/exchangeData[_token].total_tokens;
    uint expectedRemainingTokenAmount = exchangeData[_token].total_tokens - amountOfTokens;
    uint expectedRemainingCollateralUpperBound = exchangeData[_token].total_collateral+2*priceWithCurrentCollateral*amountOfTokens/(10**18);
    uint predictedPrice = (expectedRemainingCollateralUpperBound*10000/exchangeData[_token].collateral_parts_per_10000)*(10**18)/expectedRemainingTokenAmount;
    uint avg_price = (priceWithCurrentCollateral+predictedPrice)/2;
    return avg_price*amountOfTokens/(10**18);
  }

  function getAllPrices(address[] memory tokens) public view returns(uint256[] memory){
    uint[] memory retVals = new uint[](tokens.length);
    for(uint i=0;i<tokens.length;i++){
      retVals[i]=getBuyPrice(tokens[i],1);
    }
    return retVals;
  }

  function emitTokenStateUpdate(address _token) private {

    uint price ;
    (price,,) = getBasicData(_token);
    emit ExchangeDetails(_token,
      exchangeData[_token].total_tokens,
      exchangeData[_token].total_collateral,
      exchangeData[_token].collateral_parts_per_10000,
      price);
  }

  event NewToken(address indexed creator,address tokenAdr,string hashOfDesc);
  event TokensBought(address indexed token,uint amount,uint totalSpent);
  event TokensSold(address indexed token,uint amount,uint totalSpent);
  event ExchangeDetails(address indexed token,uint token_supply,uint collateral_supply,uint16 collateral_per_10000,uint buyPrice);
  event NewExchange(address indexed token,uint token_supply,uint collateral_supply,uint16 collateral_per_10000,uint buyPrice);
  event FeesBurned(uint initial_amount,uint amount_burned,uint tokens_amount_burned);
}
