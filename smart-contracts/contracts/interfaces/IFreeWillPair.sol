// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

interface IFreeWillPair {

    function initialize(address, address) external;

    function getReserves() external view returns(uint256, uint256);

    function mint(address, uint256) external;

    function burn(address, uint256) external;

    function withdrawTokens(address, address, uint256, uint256) external;

    function addReserves(uint256, uint256) external;

    function updateReserves(uint256, uint256) external;

    function sendOutputTokens(address, address, uint256) external;

}