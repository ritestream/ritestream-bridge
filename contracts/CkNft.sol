// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.26;

import { IERC721A, ERC721A } from "erc721a/contracts/ERC721A.sol";
import { ERC721AQueryable } from "erc721a/contracts/extensions/ERC721AQueryable.sol";
import { Ownable } from "openzeppelin-contracts/access/Ownable.sol";

contract CkNft is ERC721AQueryable, Ownable {
    /** @dev The base NFT URI. **/
    string private baseURI;
    /** @dev Value for disable transfer */
    bool private disableTransfer;
    /** @dev Number of seed round */
    uint256 private _seedRound = 860;
    /** @dev Number of private round */
    uint256 private _privateRound = 1078;
    /** @dev Number of team */
    uint256 private _teamRound = 5060;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initQuantity,
        address _toAddress
    ) ERC721A(name, symbol) {
        require(initQuantity > 0, "Quantity must be greater than 0");
        require(_toAddress != address(0), "Invalid address");
        _mint(_toAddress, initQuantity);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721A, IERC721A) returns (string memory) {
        require(_exists(tokenId), "Token Id does not exist");
        if (tokenId < _seedRound) {
            return string(abi.encodePacked(baseURI, "QmTWAsSs2ZeWNd5mBrJowrzDMpWvZQbYZUioVAZ43h94mh"));
        } else if (tokenId >= _seedRound && tokenId < _privateRound + _seedRound) {
            return string(abi.encodePacked(baseURI, "QmSaYT6jfCmhvoGryxf4URjQUzezcGK8Tq6RvLy6gxr1vi"));
        } else {
            return string(abi.encodePacked(baseURI, "QmVRGGpczxzCjTKHRKB4qxW9pH2n8PoN3P3PKgU83xAoNN"));
        }
    }

    function setBaseUri(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function setDisableTransfer(bool _disableTransfer) external onlyOwner {
        disableTransfer = _disableTransfer;
        emit TransferDisabled(_disableTransfer);
    }

    function _beforeTokenTransfers(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal view override {
        require(!disableTransfer, "Transfer is disabled");
    }

    /** @dev Emits event for when base URI changes */
    event BaseUriChanged(string indexed newBaseUri);
    /** @dev Emits event for disable transfer */
    event TransferDisabled(bool indexed disableTransfer);
}
