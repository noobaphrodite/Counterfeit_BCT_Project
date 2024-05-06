
# MediNFT Assignment

### Time Taken ~6hrs

### A NFT Project consisting of four actors
- Buyers
- Owner
- Manufacturer
- Shipper

## How to run locally
- Clone the contracts repo `` git clone https://github.com/Arch0125/trace-contracts``
- Install dependencies ``npm i``
- Add ``PRIVATE_KEY`` to .env file in the root folder
- Deploy the contract using ``npx hardhat deploy``
- Copy the deployed address

- Clone the frontend repo ``git clone https://github.com/Arch0125/trace-interface``

- Install dependencies ``npm i``
- Replace the contract address in the files 
- Start the server ``npm run dev``

## Userflow
- Login as Admin and set the manufacturer and shipper address
- Login as customer and mint the NFT (for demo the NFT data is same for all token ids)
- Go back to admin panel switch to Manufacturer account and update the status of the product
- Now change to Shipper Account and change the status of the product.
- Finally, change to customer account and confirm product delivered

## Testing the contract locally
- Go to contracts folder
- Run the script ``npx hardhat test``


