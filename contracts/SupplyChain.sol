// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;

contract SupplyChain {
    struct Product {
        uint productId;
        string productType;
        uint productionDate;
        address producer;
        string status;
        string location;
    }

    mapping(uint => Product) public products;
    uint public productCount;

    // Constructor to initialize the supply chain
    constructor() public {
        productCount = 0;
    }

    // Function to add a new product to the supply chain
    function addProduct(string memory _productType, string memory _status, string memory _location) public {
        productCount++;
        products[productCount] = Product(productCount, _productType, block.timestamp, msg.sender, _status, _location);
    }

    // Function to get product details based on ID
    function getProduct(uint _productId) public view returns (uint, string memory, uint, address, string memory, string memory) {
        Product memory product = products[_productId];
        return (product.productId, product.productType, product.productionDate, product.producer, product.status, product.location);
    }

    // Function to update product status and location
    function updateProduct(uint _productId, string memory _status, string memory _location) public {
        require(_productId > 0 && _productId <= productCount, "Invalid product ID");
        Product storage product = products[_productId];
        product.status = _status;
        product.location = _location;
    }
}
