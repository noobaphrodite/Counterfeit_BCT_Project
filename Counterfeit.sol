// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
pragma experimental ABIEncoderV2;

import "./Ownable.sol";

contract Counterfeit is Ownable {
    address private sideContract = address(0);

    constructor() {
        products.push(Product(0, 0, 'dummyProduct', true));
        sellers.push(sellerDetails(0,"dummySeller","dummySeller"));
        emit constructorSet(msg.sender);
    }

    //----------------Events----------------//
    event constructorSet(address setter);
    event newProductAdded(uint256 productId, address owner);
    event productPurchasedByConsumer(uint256 productId, address buyer);
    event productSoldSuccessfully(
        uint256 productId,
        address seller,
        address buyer
    );
    event newSellerRegistered(string name, address seller);
    event sideContractSet(address setter, address setTo);

    //------------Variables---------------//
    Product[] private products;
    sellerDetails[] private sellers;

    mapping(address => uint256) sellerAddressToSellerIndex;
    mapping(uint256 => uint256) private productIdToProductIndex;
    mapping(bytes32 => uint256) private secretIdToProductIndex;
    mapping(address => uint256) private ownerProductCount;
    mapping(uint256 => address) private productToOwner;

    //-------------Modifiers--------------//
    modifier sellerCheck(uint256 _productId) {
        address productOwner = productToOwner[_productId];
        require(msg.sender == productOwner, "You do not own this product");
        _;
    }

    modifier soldCheck(uint256 _productId) {
        uint256 productIndex = productIdToProductIndex[_productId];
        bool isSold = products[productIndex].isSold;
        require(!isSold, "Product is already sold");
        _;
    }

    modifier onlySideContract() {
        require(msg.sender == sideContract, "You are not the side contract");
        require(sideContract != address(0), "Side contract is not set yet");
        _;
    }

    //------------Functions---------------//

    function setSideContract(address _sideContract) external onlyOwner {
        sideContract = _sideContract;
        emit sideContractSet(msg.sender, _sideContract);
    }

    function registerSeller(string memory _name, string memory _details)
        external
        returns (string memory status)
    {
        require(
            sellerAddressToSellerIndex[msg.sender] == 0,
            "You are already registered"
        );

        sellers.push(sellerDetails(0, _name, _details));

        sellerAddressToSellerIndex[msg.sender] = sellers.length - 1;

        emit newSellerRegistered(_name, msg.sender);
        return "Seller registered successfully";
    }

    function buyProduct(bytes32 _secretId)
        external
        onlySideContract
        returns (bool)
    {
        uint256 productIndex = secretIdToProductIndex[_secretId];
        uint256 productId = products[productIndex].productId;
        address productOwner = productToOwner[productId];

        require(ownerProductCount[productOwner] > 0, "Seller product count is 0");
        require(!products[productIndex].isSold, "Secret id is scanned before");

        products[productIndex].isSold = true;
        productToOwner[productId] = address(0);
        ownerProductCount[productOwner]--;

        emit productPurchasedByConsumer(productId, msg.sender);

        return true;
    }

    function getAllProducts() public view returns (Product[] memory) {
        uint256 productCount = ownerProductCount[msg.sender];
        require(productCount > 0, "No products");

        Product[] memory ownedProducts = new Product[](productCount);
        uint256 j = 0;

        for (uint256 i = 0; i < products.length; i++) {
            if (productToOwner[products[i].productId] == msg.sender) {
                ownedProducts[j] = products[i];
                j++;
            }
        }
        return ownedProducts;
    }

    function sellProduct(uint256 _productId, address _buyerAddress)
        external
        sellerCheck(_productId)
        soldCheck(_productId)
        returns (bool)
    {
        require(msg.sender != _buyerAddress, "You already own this product");
        require(ownerProductCount[msg.sender] > 0, "You own 0 products");
        require(
            sellerAddressToSellerIndex[_buyerAddress] != 0,
            "Buyer is not registered as a seller"
        );

        productToOwner[_productId] = _buyerAddress;

        ownerProductCount[msg.sender]--;
        ownerProductCount[_buyerAddress]++;

        emit productSoldSuccessfully(_productId, msg.sender, _buyerAddress);

        return true;
    }

    function addProduct(
        uint256 _productId,
        bytes32 _secretId,
        uint256 _price,
        string memory _name
    ) external onlyOwner returns (bool) {
        require(productIdToProductIndex[_productId] == 0, "Product id is used before");
        require(secretIdToProductIndex[_secretId] == 0, "Secret id is used before");

        productToOwner[_productId] = msg.sender;
        ownerProductCount[msg.sender]++;

        products.push(Product(_productId, _price, _name, false));

        productIdToProductIndex[_productId] = products.length - 1;
        secretIdToProductIndex[_secretId] = products.length - 1;

        emit newProductAdded(_productId, msg.sender);

        return true;
    }

    function productSeller(uint256 _productId)
        external
        view
        returns (string memory name, string memory details)
    {
        address sellerAddress = productToOwner[_productId];
        uint256 sellerIndex = sellerAddressToSellerIndex[sellerAddress];
        require(sellerIndex != 0, "Seller might not be registered");

        sellerDetails memory seller = sellers[sellerIndex];
        return (seller.name, seller.details);
    }

    function productDetails(uint256 _productId)
        external
        view
        returns (
            string memory name,
            uint256 price,
            bool isSold
        )
    {
        uint256 index = productIdToProductIndex[_productId];
        Product memory tP = products[index];
        return (tP.name, tP.price, tP.isSold);
    }

    //----------Dev Only Owner-------------//

    function productLength()
        public
        view
        onlyOwner
        returns (uint256 _productArrayLength)
    {
        return products.length;
    }

    function sellersLength()
        public
        view
        onlyOwner
        returns (uint256 _sellerArrayLength)
    {
        return sellers.length;
    }
}

struct Product {
    uint256 productId;
    uint256 price;
    string name;
    bool isSold;
}

struct sellerDetails {
    uint256 sellerId;
    string name;
    string details;
}
