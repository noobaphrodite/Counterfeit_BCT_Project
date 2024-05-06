import { nftabi } from "@/abi/NFTABI";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import * as React from "react";
import { useAccount, useProvider, useSigner } from "wagmi";

const Customer = () => {
  //a fixed nft is minted for demo
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const contract = new ethers.Contract(
    "0xC103bd111523cf32E303474810D126d1D7Fd18aa",
    nftabi,
    signer || provider
  );
  const [tokenid, setTokenId] = React.useState<String>("");
  const [productname, setProductName] = React.useState<String>("");
  const [productmaterial, setProductMaterial] = React.useState<String>("");
  const [productorigin, setProductOrigin] = React.useState<String>("");
  const [productStatus, setProductStatus] = React.useState<String>("");
  const [productowner, setProductOwner] = React.useState<String>("");
  const [rewards, setRewards] = React.useState<String>("");

  const mintnft = async () => {
    try {
      const tx = await contract.safeMint(
        "Product 1",
        "Material 1",
        "Origin 1",
        "https://ipfs.io/ipfs/bafybeibnsoufr2renqzsh347nrx54wcubt5lgkeivez63xvivplfwhtpym/metadata.json",
        { value: ethers.utils.parseUnits("0.1", "ether") }
      );
      const receipt = await tx.wait();
      console.log(receipt);
    } catch (err) {
      console.log(err);
    }
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
    setProductOwner(String(tx[3]).toLowerCase());
    console.log(productowner);
  };

  const confirmDelivery = async () => {
    const contract = new ethers.Contract(
      "0xC103bd111523cf32E303474810D126d1D7Fd18aa",
      nftabi,
      signer || provider
    );
    const tx = await contract.confirmProductDelivery(tokenid);
    const receipt = await tx.wait();
    console.log(receipt);
  };

  const getrewards = async () => {
    const contract = new ethers.Contract(
      "0xC103bd111523cf32E303474810D126d1D7Fd18aa",
      nftabi,
      signer || provider
    );
    const tx = await contract.rewardPoints(address);
    console.log(tx);
    setRewards(String(ethers.utils.formatEther(tx)));
  };

  React.useEffect(() => {
    getrewards();
  }, [address]);
  return (
    <div className="flex flex-row h-screen w-screen justify-center items-center">
      <div className="flex flex-col h-screen w-1/2 justify-center items-center">
        <p className="text-4xl font-bold">Mint your purchase here</p>
        <ConnectButton />
        <p className="text-2xl font-bold mt-4">Rewards : {rewards}</p>
        <button
          className="bg-blue-600 text-white font-bold py-2 px-4 mx-2 rounded-xl mt-4"
          onClick={() => mintnft()}
        >
          Mint
        </button>
      </div>
      <div className="flex flex-col h-screen w-1/2 justify-center items-center">
        <p className="text-4xl font-bold">Track your purchase here</p>
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
          Refresh Status
        </button>
        {address?.toString().toLowerCase() ===
        productowner.toString().toLowerCase() ? (
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
            {productStatus == "2" ? (
              <button
                className="bg-blue-600 text-white font-bold py-2 px-4 mx-2 rounded-xl mt-4"
                onClick={() => confirmDelivery()}
              >
                Confirm Delivery
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Customer;
