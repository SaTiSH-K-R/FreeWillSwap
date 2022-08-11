// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./FreeWillPair.sol";
import "./interfaces/IWETH.sol";

contract FreeWillSwap {

    mapping(address => mapping(address => address)) private _getPair;
    address[] private allPairs;

    address public WETH;

    event PairCreated(address indexed pair, address indexed, address indexed);
    event LiquidityAdded(address indexed pairAddress, uint256 amount1, uint256 amount2);
    event LiquidityRemoved(address indexed pairAddress);
    event SwapTokensForTokens(
        address indexed pairAddress,
        address inputToken,
        uint256 inputAmount,
        address outputToken,
        uint256 outputAmount
    );
    event SwapTokensForETH(
        address indexed pairAddress,
        address inputToken,
        uint256 inputAmount,
        uint256 outputEth
    );
    event SwapETHForTokens(
        address indexed pairAddress,
        uint256 inputETH,
        address outputToken,
        uint256 outputAmount 
    );

    constructor(address _WETH) {
        WETH = _WETH;
    }

    function getPair(address token1, address token2) public view returns (address pair) {
        pair = _getPair[token1][token2];
    }

    function getAllPairs() public view returns (address[] memory pairs) {
        pairs =  allPairs;
    }

    function createPair(address tokenA, address tokenB)
        public
        returns (address)
    {
        (address token1, address token2) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token1 != token2, "Same");
        require(
            token1 != address(0) && token2 != address(0),
            "0address"
        );
        require(
            _getPair[token1][token2] == address(0),
            "Exists"
        );
        string memory name1 = IERC20Metadata(token1).symbol();
        string memory name2 = IERC20Metadata(token2).symbol();
        string memory name = string(abi.encodePacked(name1, "-", name2, " LP"));
        bytes32 _salt = keccak256(abi.encodePacked(token1, token2));
        FreeWillPair _contract = new FreeWillPair{salt: bytes32(_salt)}(
            name,
            name
        );
        IFreeWillPair(address(_contract)).initialize(token1, token2);
        _getPair[token1][token2] = address(_contract);
        _getPair[token2][token1] = address(_contract);
        allPairs.push(address(_contract));
        emit PairCreated(address(_contract), token1, token2);
        return address(_contract);
    }

    function createEthPair(address token) public returns (address) {
        address token1 = WETH;
        address token2 = token;
        return createPair(token1, token2);
    }

    function _addLiquidity(
        address token1,
        address token2,
        uint256 amount1,
        uint256 amount2
    )
        internal
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        uint256 lpTokens;
        require(amount1 > 0 && amount2 > 0, "0amount");
        IFreeWillPair pair;
        if (_getPair[token1][token2] == address(0)) {
            pair = IFreeWillPair(createPair(token1, token2));
        } else {
            pair = IFreeWillPair(_getPair[token1][token2]);
        }
        (uint256 reserve1, uint256 reserve2) = pair.getReserves();
        if (reserve1 == 0 && reserve2 == 0) {
            lpTokens = amount1;
            return (amount1, amount2, lpTokens);
        } else {
            uint256 amount2Optimal = (reserve2 * amount1) / reserve1;
            if (amount2Optimal <= amount2) {
                lpTokens =
                    (IERC20(address(pair)).totalSupply() * amount1) /
                    reserve1;
                return (amount1, amount2Optimal, lpTokens);
            } else {
                uint256 amount1Optimal = (reserve1 * amount2) / reserve2;
                assert(amount1Optimal <= amount1);
                lpTokens =
                    (IERC20(address(pair)).totalSupply() * amount1Optimal) /
                    reserve1;
                return (amount1Optimal, amount2, lpTokens);
            }
        }
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    )
        public
        returns (
            uint256 amount1,
            uint256 amount2,
            uint256 lpTokens
        )
    {
        (address token1, address token2) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        (uint256 _amount1, uint256 _amount2) = token1 == tokenA
            ? (amountA, amountB)
            : (amountB, amountA);
        (amount1, amount2, lpTokens) = _addLiquidity(
            token1,
            token2,
            _amount1,
            _amount2
        );
        address pairAddress = _getPair[token1][token2];
        IFreeWillPair pair = IFreeWillPair(pairAddress);
        IERC20(token1).transferFrom(msg.sender, pairAddress, amount1);
        IERC20(token2).transferFrom(msg.sender, pairAddress, amount2);
        pair.addReserves(amount1, amount2);
        pair.mint(msg.sender, lpTokens);
        emit LiquidityAdded(pairAddress, amount1, amount2);
    }

    function addLiquidityEth(address token, uint256 amount)
        public
        payable
        returns (
            uint256 amount1,
            uint256 amount2,
            uint256 lpTokens
        )
    {
        uint256 amountA = msg.value;
        uint256 amountB = amount;
        (address token1, address token2) = WETH < token
            ? (WETH, token)
            : (token, WETH);
        (uint256 _amount1, uint256 _amount2) = token1 == WETH
            ? (amountA, amountB)
            : (amountB, amountA);
        (amount1, amount2, lpTokens) = _addLiquidity(
            token1,
            token2,
            _amount1,
            _amount2
        );
        address pairAddress = _getPair[token1][token2];
        IFreeWillPair pair = IFreeWillPair(pairAddress);
        (uint256 wethAmount, uint256 tokenAmount) = token1 == WETH
            ? (amount1, amount2)
            : (amount2, amount1);
        IWETH(WETH).deposit{value: wethAmount}(pairAddress);
        IERC20(token).transferFrom(msg.sender, pairAddress, tokenAmount);
        pair.addReserves(amount1, amount2);
        pair.mint(msg.sender, lpTokens);
        emit LiquidityAdded(pairAddress, amount1, amount2);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 lpTokens
    ) public returns (uint256 amount1, uint256 amount2) {
        require(lpTokens > 0, "0amount");
        (address token1, address token2) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        address pairAddress = _getPair[token1][token2];
        IFreeWillPair pair = IFreeWillPair(pairAddress);
        (uint256 reserve1, uint256 reserve2) = pair.getReserves();
        uint256 totalLP = IERC20(pairAddress).totalSupply();
        amount1 = (reserve1 * lpTokens) / totalLP;
        amount2 = (reserve2 * lpTokens) / totalLP;
        pair.burn(msg.sender, lpTokens);
        pair.withdrawTokens(msg.sender, msg.sender, amount1, amount2);
        emit LiquidityRemoved(pairAddress);
    }

    function removeLiquidityEth(address token, uint256 lpTokens)
        public
        returns (uint256 amount1, uint256 amount2)
    {
        require(lpTokens > 0, "0amount");
        (address token1, address token2) = WETH < token
            ? (WETH, token)
            : (token, WETH);
        address pairAddress = _getPair[token1][token2];
        IFreeWillPair pair = IFreeWillPair(pairAddress);
        (uint256 reserve1, uint256 reserve2) = pair.getReserves();
        uint256 totalLP = IERC20(pairAddress).totalSupply();
        amount1 = (reserve1 * lpTokens) / totalLP;
        amount2 = (reserve2 * lpTokens) / totalLP;
        pair.burn(msg.sender, lpTokens);
        (address to1, address to2, uint256 ethAmount) = token1 == WETH
            ? (address(this), msg.sender, amount1)
            : (msg.sender, address(this), amount2);
        pair.withdrawTokens(to1, to2, amount1, amount2);
        IWETH(WETH).withdraw(msg.sender, ethAmount);
        emit LiquidityRemoved(pairAddress);
    }

    function swapTokensForTokens(
        address tokenA,
        address tokenB,
        uint256 inputAmount
    ) public returns (uint256 outputAmount) {
        require(
            _getPair[tokenA][tokenB] != address(0),
            "Pair!exist"
        );
        require(
            IERC20(tokenA).allowance(msg.sender, address(this)) >= inputAmount,
            "!allowance"
        );
        (address token1, address token2) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        address pairAddress = _getPair[token1][token2];
        IFreeWillPair pair = IFreeWillPair(pairAddress);
        (uint256 reserve1, uint256 reserve2) = pair.getReserves();
        require(reserve1 > 0 && reserve2 > 0, "NoLiquidity");
        if (tokenA == token1) {
            outputAmount = getOutputAmount(inputAmount, reserve1, reserve2);
            IERC20(token1).transferFrom(msg.sender, pairAddress, inputAmount);
            pair.sendOutputTokens(token2, msg.sender, outputAmount);
            pair.updateReserves(
                reserve1 + inputAmount,
                reserve2 - outputAmount
            );
        } else {
            outputAmount = getOutputAmount(inputAmount, reserve2, reserve1);
            IERC20(token2).transferFrom(msg.sender, pairAddress, inputAmount);
            pair.sendOutputTokens(token1, msg.sender, outputAmount);
            pair.updateReserves(
                reserve1 - outputAmount,
                reserve2 + inputAmount
            );
        }
        emit SwapTokensForTokens(pairAddress, tokenA, inputAmount, tokenB, outputAmount);
    }

    function swapTokensForETH(address token, uint256 inputAmount)
        public
        returns (uint256 outputAmount)
    {
        require(
            _getPair[token][WETH] != address(0),
            "Pair!exist"
        );
        require(
            IERC20(token).allowance(msg.sender, address(this)) >= inputAmount,
            "!allowance"
        );
        (address token1, address token2) = token < WETH
            ? (token, WETH)
            : (WETH, token);
        address pairAddress = _getPair[token1][token2];
        IFreeWillPair pair = IFreeWillPair(pairAddress);
        (uint256 reserve1, uint256 reserve2) = pair.getReserves();
        require(reserve1 > 0 && reserve2 > 0, "NoLiquidity");
        if (token1 == token) {
            outputAmount = getOutputAmount(inputAmount, reserve1, reserve2);
            IERC20(token1).transferFrom(msg.sender, pairAddress, inputAmount);
            pair.sendOutputTokens(token2, address(this), outputAmount);
            IWETH(token2).withdraw(msg.sender, outputAmount);
            pair.updateReserves(
                reserve1 + inputAmount,
                reserve2 - outputAmount
            );
        } else {
            outputAmount = getOutputAmount(inputAmount, reserve2, reserve1);
            IERC20(token2).transferFrom(msg.sender, pairAddress, inputAmount);
            pair.sendOutputTokens(token1, address(this), outputAmount);
            IWETH(token1).withdraw(msg.sender, outputAmount);
            pair.updateReserves(
                reserve1 - outputAmount,
                reserve2 + inputAmount
            );
        }
        emit SwapTokensForETH(pairAddress, token, inputAmount, outputAmount);
    }

    function swapETHForTokens(address token)
        public
        payable
        returns (uint256 outputAmount)
    {
        require(
            _getPair[token][WETH] != address(0),
            "Pair!exist"
        );
        (address token1, address token2) = token < WETH
            ? (token, WETH)
            : (WETH, token);
        address pairAddress = _getPair[token1][token2];
        IFreeWillPair pair = IFreeWillPair(pairAddress);
        (uint256 reserve1, uint256 reserve2) = pair.getReserves();
        require(reserve1 > 0 && reserve2 > 0, "NoLiquidity");
        uint256 inputAmount = msg.value;
        if (token1 == WETH) {
            outputAmount = getOutputAmount(inputAmount, reserve1, reserve2);
            IWETH(token1).deposit{value: inputAmount}(pairAddress);
            pair.sendOutputTokens(token2, msg.sender, outputAmount);
            pair.updateReserves(
                reserve1 + inputAmount,
                reserve2 - outputAmount
            );
        } else {
            outputAmount = getOutputAmount(inputAmount, reserve2, reserve1);
            IWETH(token2).deposit{value: inputAmount}(pairAddress);
            pair.sendOutputTokens(token1, msg.sender, outputAmount);
            pair.updateReserves(
                reserve1 - outputAmount,
                reserve1 + inputAmount
            );
        }
        emit SwapETHForTokens(pairAddress, inputAmount, token, outputAmount);
    }

    function getOutputAmount(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256 outputAmount) {
        uint256 inputAmountWithFee = inputAmount * 997;
        uint256 numerator = outputReserve * inputAmountWithFee;
        uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
        outputAmount = numerator / denominator;
    }

    function getPrice(address FUSD, address token)
        public
        view
        returns (uint256 price)
    {
        (address token1, address token2) = FUSD < token
            ? (FUSD, token)
            : (token, FUSD);
        address pairAddress = _getPair[token1][token2];
        require(pairAddress != address(0), "Pair!exist");
        IFreeWillPair pair = IFreeWillPair(pairAddress);
        (uint256 reserve1, uint256 reserve2) = pair.getReserves();
        if (token1 == FUSD) {
            price = getOutputAmount(1, reserve2, reserve1);
        } else {
            price = getOutputAmount(1, reserve1, reserve2);
        }
    }

    function getPriceEth(address FUSD) public view returns (uint256 price) {
        (address token1, address token2) = FUSD < WETH
            ? (FUSD, WETH)
            : (WETH, FUSD);
        address pairAddress = _getPair[token1][token2];
        require(pairAddress != address(0), "Pair !exist");
        IFreeWillPair pair = IFreeWillPair(pairAddress);
        (uint256 reserve1, uint256 reserve2) = pair.getReserves();
        if (token1 == FUSD) {
            price = getOutputAmount(1, reserve2, reserve1);
        } else {
            price = getOutputAmount(1, reserve1, reserve2);
        }
    }
}
