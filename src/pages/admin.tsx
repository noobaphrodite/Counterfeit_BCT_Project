import { ConnectButton } from "@rainbow-me/rainbowkit";
import * as React from "react";
import { nftabi } from "../abi/NFTABI";
import { ethers } from "ethers";
import { useProvider, useSigner } from "wagmi";

const Admin = () => {
  const provider = useProvider();
  const { data: signer } = useSigner();

  const [manufacturerAddress, setManufacturerAddress] =
    React.useState<String>("");
  const [shipperAddress, setShipperAddress] = React.useState<String>("");
  const [tokenid, setTokenId] = React.useState<String>("");
  const [productname, setProductName] = React.useState<String>("");
  const [productmaterial, setProductMaterial] = React.useState<String>("");
  const [productorigin, setProductOrigin] = React.useState<String>("");
  const [productStatus, setProductStatus] = React.useState<String>("");

  const addManufacturer = async () => {
    const contract = new ethers.Contract(
      "0xC103bd111523cf32E303474810D126d1D7Fd18aa",
      nftabi,
      signer || provider
    );
    const tx = await contract.addAuthorizedManufacturer(manufacturerAddress);
    const receipt = await tx.wait();
    console.log(receipt);
  };

  const addShipper = async () => {
    const contract = new ethers.Contract(
      "0xC103bd111523cf32E303474810D126d1D7Fd18aa",
      nftabi,
      signer || provider
    );
    const tx = await contract.addAuthorizedShipper(shipperAddress);
    const receipt = await tx.wait();
    console.log(receipt);
  };

  const getProductDetails = async (tokenid: String) => {
    const contract = new ethers.Contract(
      "0xC103bd111523cf32E303474810D126d1D7Fd18aa",
      nftabi,
      signer || provider
    );
    const tx = await contract._productDetails(tokenid);
    console.log(tx);
    setProductName(tx.name);
    setProductMaterial(tx.material);
    setProductOrigin(tx.origin);
    setProductStatus(tx.stage);
    console.log(productname);
  };

  const changetoshipped = async () => {
    const contract = new ethers.Contract(
      "0xC103bd111523cf32E303474810D126d1D7Fd18aa",
      nftabi,
      signer || provider
    );
    const tx = await contract.shipProduct(tokenid);
    const receipt = await tx.wait();
    console.log(receipt);
  }

  const changetooutfordelivery = async () => {
    const contract = new ethers.Contract(
      "0xC103bd111523cf32E303474810D126d1D7Fd18aa",
      nftabi,
      signer || provider
    );
    const tx = await contract.deliverProduct(tokenid);
    const receipt = await tx.wait();
    console.log(receipt);
  }

  return (
    <div className="flex flex-row h-screen w-screen justify-center items-center">
      <div className="flex flex-col h-screen w-1/2 justify-center items-center">
        <ConnectButton />
        <p className="text-4xl font-bold">Add Authorities here</p>
        <div className="flex flex-row">
          <input
            type="text"
            placeholder="Enter Manufacturer Address"
            className="border-2 border-blue-600 rounded-xl p-2 mt-4"
            onChange={(e) => setManufacturerAddress(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white font-bold py-2 px-4 mx-2 rounded-xl mt-4"
            onClick={() => addManufacturer()}
          >
            Add
          </button>
        </div>
        <div className="flex flex-row">
          <input
            type="text"
            placeholder="Enter Shipper Address"
            className="border-2 border-blue-600 rounded-xl p-2 mt-4"
            onChange={(e) => setShipperAddress(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white font-bold py-2 px-4 mx-2 rounded-xl mt-4"
            onClick={() => addShipper()}
          >
            Add
          </button>
        </div>
      </div>
      <div className="flex flex-col h-screen w-1/2 justify-center items-center">
        <p className="text-4xl font-bold">Update Product Status here</p>
        <input
          type="text"
          placeholder="Enter Product ID"
          className="border-2 border-blue-600 rounded-xl p-2 mt-4"
          onChange={(e) => setTokenId(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white font-bold py-2 px-4 mx-2 rounded-xl mt-4"
          onClick={() => getProductDetails(tokenid)}
        >
          View Product
        </button>
        {productname.length > 0 ? (
          <div className="flex flex-col mt-7">
            <p className="text-2xl font-bold">Product Name: {productname}</p>
            <p className="text-2xl font-bold">
              Product Material: {productmaterial}
            </p>
            <p className="text-2xl font-bold">
              Product Origin: {productorigin}
            </p>
            <p className="text-2xl font-bold">
              Product Status:{" "}
              {productStatus == "0"
                ? "Order Received"
                : productStatus == "1"
                ? "Shipped"
                : productStatus == "2"
                ? "Out for Delivery"
                : "Delivered"}
            </p>
          </div>
        ) : null}

        {productStatus == "0" ? (
            <button className="bg-blue-600 text-white font-bold py-2 px-4 mx-2 rounded-xl mt-4" onClick={()=>changetoshipped()}>
                Change to Shipped
            </button>
        ) : productStatus == "1" ? (
            <button className="bg-blue-600 text-white font-bold py-2 px-4 mx-2 rounded-xl mt-4" onClick={()=>changetooutfordelivery()}>
                Change to Out for Delivery
            </button>
        ) : null
        }
      </div>
    </div>
  );
};

export default Admin;
