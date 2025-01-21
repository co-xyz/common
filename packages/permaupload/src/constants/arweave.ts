import { type Chain, zeroAddress } from "viem";
import {
  mainnet,
  polygon,
  bsc,
  avalanche,
  arbitrum,
  scroll,
  linea,
  iotex,
  base,
} from "wagmi/chains";

type IrysArweaveToken = {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chain: Chain;
  decimals: number;
};

export const IRYS_TOKENS_EVM: IrysArweaveToken[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    address: zeroAddress,
    decimals: 18,
    chain: mainnet,
  },
  {
    id: "usdc-eth",
    name: "USD Coin",
    symbol: "USDC",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    chain: mainnet,
  },
  // {
  //   id: "chainlink",
  //   name: "ChainLink",
  //   symbol: "LINK",
  //   address: "0x514910771af9ca656af840dff83e8264ecf986ca",
  //   decimals: 18,
  //   chain: mainnet,
  // },
  {
    id: "matic",
    name: "Matic",
    symbol: "MATIC",
    address: zeroAddress,
    decimals: 18,
    chain: polygon,
  },
  // {
  //   id: "usdc-polygon",
  //   name: "USD Coin",
  //   symbol: "USDC",
  //   address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
  //   decimals: 6,
  //   chain: polygon,
  // },
  {
    id: "bnb",
    name: "Binance Coin",
    symbol: "BNB",
    address: zeroAddress,
    chain: bsc,
    decimals: 18,
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    address: zeroAddress,
    chain: avalanche,
    decimals: 18,
  },
  {
    id: "arbitrum",
    name: "Ether",
    symbol: "ETH",
    address: zeroAddress,
    chain: arbitrum,
    decimals: 18,
  },
  {
    id: "base-eth",
    name: "Ethereum",
    symbol: "ETH",
    address: zeroAddress,
    chain: base,
    decimals: 18,
  },
  {
    id: "scroll-eth",
    name: "Ethereum",
    symbol: "ETH",
    address: zeroAddress,
    chain: scroll,
    decimals: 18,
  },
  {
    id: "linea-eth",
    name: "Ethereum",
    symbol: "ETH",
    address: zeroAddress,
    chain: linea,
    decimals: 18,
  },
  {
    id: "iotex",
    name: "IoTeX",
    symbol: "IOTX",
    address: zeroAddress,
    chain: iotex,
    decimals: 18,
  },
  // {
  //   id: "fantom",
  //   name: "Fantom",
  //   symbol: "FTM",
  //   address: zeroAddress,
  //   chain: fantom,
  //   decimals: 18,
  // },
  // {
  //   id: "boba",
  //   name: "Boba",
  //   symbol: "BOBA",
  //   address: zeroAddress,
  //   chain: boba,
  //   decimals: 18,
  // },
  // {
  //   id: "boba-eth",
  //   name: "Ether",
  //   symbol: "ETH",
  //   address: zeroAddress,
  //   chain: boba,
  //   decimals: 18,
  // },
];

export const IRYS_ARWEAVE_SUPPORTED_CHAINS = [
  ...new Set(IRYS_TOKENS_EVM.map((token) => token.chain)),
];

export const IRYS_TOKENS_OTHER = [
  {
    id: "arweave",
    name: "Arweave",
    symbol: "AR",
    address: undefined,
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    address: undefined,
  },
  {
    id: "algorand",
    name: "Algorand",
    symbol: "ALGO",
    address: undefined,
  },
  {
    id: "aptos",
    name: "Aptos",
    symbol: "APTOS",
    address: undefined,
  },
];
