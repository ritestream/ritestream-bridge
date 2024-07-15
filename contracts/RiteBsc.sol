// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract RiteBsc is ERC20, Ownable, ERC20Permit {
    constructor(address initialOwner) ERC20("Rite token bsc", "RITE") Ownable(initialOwner) ERC20Permit("RiteToken") {}

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }
}
