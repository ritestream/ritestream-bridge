// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { RiteBase } from "../RiteBase.sol";

contract RiteBaseMock is RiteBase {
    constructor(
        address _layerZeroEndpoint, // local endpoint address
        address _owner // token owner used as a delegate in LayerZero Endpoint
    ) RiteBase(_layerZeroEndpoint, _owner) {}
}
