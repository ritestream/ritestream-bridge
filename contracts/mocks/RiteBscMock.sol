// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { RiteBsc } from "../RiteBsc.sol";

contract RiteBscMock is RiteBsc {
    constructor(address initialOwner) RiteBsc(initialOwner) {}
}
