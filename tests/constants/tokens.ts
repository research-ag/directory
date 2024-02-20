import {
  FungibleToken,
  CreatePayload,
} from "../../declarations/directory.did";
import { bitcoinlogoBase64 } from "./base64Images";

export const btc: FungibleToken = {
  assetId: BigInt(1),
  symbol: "BTC",
  name: "Bitcoin",
  logo: bitcoinlogoBase64,
  createdAt: BigInt(Date.now()),
  modifiedAt: BigInt(Date.now()),
};

export const btcCreatePayload: CreatePayload = { ...btc };

export const icp: FungibleToken = {
  assetId: BigInt(2),
  symbol: "ICP",
  name: "Internet Computer",
  logo: bitcoinlogoBase64,
  createdAt: BigInt(Date.now()),
  modifiedAt: BigInt(Date.now()),
};

export const icpCreatePayload: CreatePayload = { ...icp };

export const eth: FungibleToken = {
  assetId: BigInt(3),
  symbol: "ETH",
  name: "Ethereum",
  logo: bitcoinlogoBase64,
  createdAt: BigInt(Date.now()),
  modifiedAt: BigInt(Date.now()),
};

export const ethCreatePayload: CreatePayload = { ...eth };
