// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IFreeWillPair.sol";

contract FreeWillPair is IFreeWillPair, ERC20 {

    address public token1;
    address public token2;
    address public handler;

    uint256 private reserve1;
    uint256 private reserve2;

    modifier onlyHandler {
        require(msg.sender == handler, "FreeWillPair: FORBIDDEN");
        _;
    }

    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {
        handler = msg.sender;
    }

    function initialize(
        address _token1,
        address _token2
    ) external onlyHandler {
        token1 = _token1;
        token2 = _token2;
    }

    function getReserves() public view returns (uint256, uint256) {
        return (reserve1, reserve2);
    }

    function mint(address to, uint256 amount) public onlyHandler {
        _mint(to, amount);
    }

    function burn(
        address from,
        uint256 lp
    ) public onlyHandler {
        _burn(from, lp);
    }

    function withdrawTokens(
        address to1,
        address to2,
        uint256 amount1,
        uint256 amount2
    ) public onlyHandler {
        reserve1 -= amount1;
        reserve2 -= amount2;
        IERC20(token1).transfer(to1, amount1);
        IERC20(token2).transfer(to2, amount2);
    }

    function addReserves(
        uint256 amount1,
        uint256 amount2
    ) public onlyHandler {
        reserve1 += amount1;
        reserve2 += amount2;
    }

    function updateReserves(
        uint256 amount1,
        uint256 amount2
    ) public onlyHandler {
        reserve1 = amount1;
        reserve2 = amount2;
    }

    function sendOutputTokens(
        address token,
        address to,
        uint256 amount
    ) public onlyHandler {
        IERC20(token).transfer(to, amount);
    }

}