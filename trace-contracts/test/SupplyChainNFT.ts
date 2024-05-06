const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken", function () {
  let MyToken,
    myToken: {
      deployed: () => any;
      connect: (arg0: any) => {
        (): any;
        new (): any;
        addAuthorizedManufacturer: { (arg0: any): any; new (): any };
        addAuthorizedShipper: { (arg0: any): any; new (): any };
        safeMint: {
          (
            arg0: string,
            arg1: string,
            arg2: string,
            arg3: string,
            arg4: { value: any }
          ): any;
          new (): any;
        };
        shipProduct: { (arg0: any): any; new (): any };
        deliverProduct: { (arg0: any): any; new (): any };
        confirmProductDelivery: { (arg0: any): any; new (): any };
      };
      _authorizedManufacturers: (arg0: any) => any;
      _authorizedShippers: (arg0: any) => any;
      tokenOfOwnerByIndex: (arg0: any, arg1: number) => any;
      _productDetails: (arg0: any) => any;
    },
    owner: any,
    manufacturer: { address: any },
    shipper: { address: any },
    user: { address: any };

  beforeEach(async function () {
    MyToken = await ethers.getContractFactory("MyToken");
    [owner, manufacturer, shipper, user] = await ethers.getSigners();
    myToken = await MyToken.deploy();
    await myToken.deployed();
  });

  describe("Access control", function () {
    it("Should add an authorized manufacturer", async function () {
      await myToken
        .connect(owner)
        .addAuthorizedManufacturer(manufacturer.address);
      expect(
        await myToken._authorizedManufacturers(manufacturer.address)
      ).to.equal(true);
    });

    it("Should add an authorized shipper", async function () {
      await myToken.connect(owner).addAuthorizedShipper(shipper.address);
      expect(await myToken._authorizedShippers(shipper.address)).to.equal(true);
    });
  });

  describe("Minting", function () {
    it("Should mint a new token and store product details", async function () {
      await myToken
        .connect(user)
        .safeMint(
          "productName",
          "productMaterial",
          "productOrigin",
          "productUri",
          { value: ethers.utils.parseEther("0.1") }
        );

      const tokenId = "0"
      const product = await myToken._productDetails(tokenId);

      expect(product.name).to.equal("productName");
      expect(product.material).to.equal("productMaterial");
      expect(product.origin).to.equal("productOrigin");
      expect(product.manufacturer).to.equal(user.address);
      expect(product.stage).to.equal(0);
    });
    it("Should not mint if the price is less", async function () {
      const tx = myToken.connect(user).safeMint(
        "productName",
        "productMaterial",
        "productOrigin",
        "productUri",
        { value: ethers.utils.parseEther("9") }
      );
      await expect(tx).to.be.revertedWith("Product price is not transferred to the manufacturer");
    });
  });

  describe("Shipping and delivery", function () {
    beforeEach(async function () {
      await myToken
        .connect(owner)
        .addAuthorizedManufacturer(manufacturer.address);
      await myToken.connect(owner).addAuthorizedShipper(shipper.address);
      await myToken
        .connect(user)
        .safeMint(
          "productName",
          "productMaterial",
          "productOrigin",
          "productUri",
          { value: ethers.utils.parseEther("0.1") }
        );
    });

    it("Should set product stage to Shipped", async function () {
      const tokenId = "0"
      await myToken.connect(manufacturer).shipProduct(tokenId);

      const product = await myToken._productDetails(tokenId);
      expect(product.stage).to.equal(1);
    });

    it("Shipping should fail if not authorized", async function () {
      const tokenId = "0"
      const tx = myToken.connect(user).shipProduct(tokenId);
      await expect(tx).to.be.revertedWith("Caller is not an authorized manufacturer");
    });

    it("Should set product stage to OutForDelivery", async function () {
      const tokenId = "0"
      await myToken.connect(manufacturer).shipProduct(tokenId);
      await myToken.connect(shipper).deliverProduct(tokenId);

      const product = await myToken._productDetails(tokenId);
      expect(product.stage).to.equal(2);
    });

    it("Delivery should fail if not authorized", async function () {
      const tokenId = "0";
      await myToken.connect(manufacturer).shipProduct(tokenId);
      const tx = myToken.connect(user).deliverProduct(tokenId);
      await expect(tx).to.be.revertedWith("Caller is not an authorized shipper");
    });

    it("Should set product stage to Delivered", async function () {
      const tokenId = "0"
      await myToken.connect(manufacturer).shipProduct(tokenId);
      await myToken.connect(shipper).deliverProduct(tokenId);
      await myToken.connect(user).confirmProductDelivery(tokenId);

      const product = await myToken._productDetails(tokenId);
      expect(product.stage).to.equal(3);
    });

    it("Delivery confirmation should fail if not authorized", async function () {
      const tokenId = "0"
      await myToken.connect(manufacturer).shipProduct(tokenId);
      await myToken.connect(shipper).deliverProduct(tokenId);
      const tx = myToken.connect(shipper).confirmProductDelivery(tokenId);
      await expect(tx).to.be.revertedWith("Not the current owner of the Product");
    });
  });
});
