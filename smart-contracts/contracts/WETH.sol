// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WETH is ERC20 {

    constructor() ERC20("Wrapped Ether", "WETH") {}

    function deposit(address to) public payable {
        _mint(to, msg.value);
    }
    
    function withdraw(address to, uint256 amount) public {
        _burn(msg.sender, amount);
        payable(to).transfer(amount);
    }

}