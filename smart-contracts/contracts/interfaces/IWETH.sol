// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface IWETH {

    function deposit(address) external payable;

    function withdraw(address, uint256) external;

}