// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SupplyChainNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    enum Stage {
        OrderReceived,
        Shipped,
        OutForDelivery,
        Delivered
    }

    struct Product {
        string name;
        string material;
        string origin;
        address manufacturer;
        Stage stage;
    }

    mapping(uint256 => Product) public _productDetails;
    mapping(address => bool) public _authorizedManufacturers;
    mapping(address => bool) public _authorizedShippers;
    mapping(address => uint256) public rewardPoints;

    constructor() ERC721("MyToken", "MTK") {}

    modifier onlyAuthorizedManufacturers() {
        require(
            _authorizedManufacturers[msg.sender],
            "Caller is not an authorized manufacturer"
        );
        _;
    }

    modifier onlyAuthorizedShippers() {
        require(
            _authorizedShippers[msg.sender],
            "Caller is not an authorized shipper"
        );
        _;
    }


    function addAuthorizedManufacturer(address manufacturer) external onlyOwner
    {
        _authorizedManufacturers[manufacturer] = true;
    }

    function addAuthorizedShipper(address shipper) external onlyOwner {
        _authorizedShippers[shipper] = true;
    }

    function safeMint(string memory name, string memory material, string memory origin, string memory uri) public payable {
        require(msg.value == 0.1 ether, "Product price is not transferred to the manufacturer");
        rewardPoints[msg.sender]+=(msg.value * 10)/100;
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        Product memory product = Product(
            name,
            material,
            origin,
            msg.sender,
            Stage.OrderReceived
        );
        _productDetails[tokenId] = product;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function shipProduct(uint256 tokenId) external onlyAuthorizedManufacturers {
        require(
            _productDetails[tokenId].stage == Stage.OrderReceived,
            "Product is not in the Manufactured stage"
        );
        _productDetails[tokenId].stage = Stage.Shipped;
    }

    function deliverProduct(uint256 tokenId) external onlyAuthorizedShippers {
        require(
            _productDetails[tokenId].stage == Stage.Shipped,
            "Product is not in the Shipped stage"
        );
        _productDetails[tokenId].stage = Stage.OutForDelivery;
    }

    function confirmProductDelivery(uint256 tokenId) external {
        require(
            _productDetails[tokenId].stage == Stage.OutForDelivery,
            "Product is not in the Out for Delivery stage"
        );
        require(msg.sender == ownerOf(tokenId),"Not the current owner of the Product");
        _productDetails[tokenId].stage = Stage.Delivered;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    fallback() external payable {}
    
}
