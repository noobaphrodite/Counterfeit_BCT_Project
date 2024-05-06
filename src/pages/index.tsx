import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col h-screen w-screen justify-center items-center">
        <p className="text-4xl font-bold">
          Welcome to <span className="text-blue-600">MediNFT</span>
        </p>
        <p className="text-2xl font-bold">
          Mint your purchases as NFT and track their authenticity
        </p>
        <div className="flex flex-row">
          <Link href={'./customer'}><button className="bg-blue-600 text-white font-bold py-2 px-4 mx-2 rounded mt-4">
            Login as Customer
          </button></Link>
          <Link href={'./admin'}><button className="bg-blue-600 text-white font-bold py-2 px-4 mx-2 rounded mt-4">
            Login as Merchant
          </button></Link>
        </div>
      </div>
    </>
  );
}