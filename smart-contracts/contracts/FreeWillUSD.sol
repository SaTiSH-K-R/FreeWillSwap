// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FreeWillUSD is ERC20, Ownable {

    bool public isStableToken = true;

    constructor() ERC20("FreeWillUSD", "FUSD") {
        _mint(_msgSender(), 1000000 * (10 ** 18));
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
    
}