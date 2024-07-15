// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import { RiteAdapter } from "../RiteAdapter.sol";

contract RiteAdapterMock is RiteAdapter {
    constructor(
        address _token, // a deployed, already existing ERC20 token address
        address _layerZeroEndpoint, // local endpoint address
        address _owner // token owner used as a delegate in LayerZero Endpoint
    ) RiteAdapter(_token, _layerZeroEndpoint, _owner) {}
}
