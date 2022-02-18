import { Address } from "@graphprotocol/graph-ts";
import {
  PROTOCOL_ENTITY_ETH_ID,
  PROTOCOL_ENTITY_ERC_ID,
  PROTOCOL_ENTITY_AAVE_ID,
  PROTOCOL_ENTITY_LINK_ID
} from "./constants";

const WETH_ADDRESS_MAINNET = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const WETH_ADDRESS_RINKEBY = "0x5D3E425A099c2863224d6D63b330Df0F22B299b9";
const WETH_NAME = "Wrapped Ether";
const WETH_SYMBOL = "WETH";
const WETH_DECIMALS = "18";
const DAI_ADDRESS_MAINNET = "0x6b175474e89094c44da98b954eedeac495271d0f";
const DAI_ADDRESS_RINKEBY = "0x118a4238E4086FAE2621D0336C0E6cdC1257BE82";
const DAI_NAME = "Dai Stablecoin";
const DAI_SYMBOL = "DAI";
const DAI_DECIMALS = "18";
const AAVE_ADDRESS_MAINNET = "0x8B4A041A619aC26B33e5BAEe9585e569387ec837";
const AAVE_ADDRESS_RINKEBY = "0x8B4A041A619aC26B33e5BAEe9585e569387ec837";
const AAVE_NAME = "AAVE";
const AAVE_SYMBOL = "AAVE";
const AAVE_DECIMALS = "18";
const LINK_ADDRESS_MAINNET = "0x5717DC7Cc0489dCc00316bcDB7e752aec664673e";
const LINK_ADDRESS_RINKEBY = "0x5717DC7Cc0489dCc00316bcDB7e752aec664673e";
const LINK_NAME = "LINK";
const LINK_SYMBOL = "LINK";
const LINK_DECIMALS = "18";


export function getProtocolId(network: string, contractAddress: string): string {
    if (network == "mainnet") {
      if (contractAddress == WETH_ADDRESS_MAINNET)
        return PROTOCOL_ENTITY_ETH_ID
      else if (contractAddress == DAI_ADDRESS_MAINNET)
        return PROTOCOL_ENTITY_ERC_ID
      else if (contractAddress == AAVE_ADDRESS_MAINNET)
        return PROTOCOL_ENTITY_AAVE_ID
      else
        return PROTOCOL_ENTITY_LINK_ID  
    } else {
      if (contractAddress == WETH_ADDRESS_RINKEBY)
        return PROTOCOL_ENTITY_ETH_ID
      else if (contractAddress == DAI_ADDRESS_RINKEBY)
        return PROTOCOL_ENTITY_ERC_ID
      else if (contractAddress == AAVE_ADDRESS_RINKEBY)
        return PROTOCOL_ENTITY_AAVE_ID
      else
        return PROTOCOL_ENTITY_LINK_ID
    }
}

export function getTokenAddress(network: string, token_id: string): Address {
    if (network == "mainnet") {
        if (token_id == PROTOCOL_ENTITY_ETH_ID)
            return Address.fromString(WETH_ADDRESS_MAINNET);
        if (token_id == PROTOCOL_ENTITY_AAVE_ID)
            return Address.fromString(AAVE_ADDRESS_MAINNET);
        if (token_id == PROTOCOL_ENTITY_LINK_ID)
            return Address.fromString(LINK_ADDRESS_MAINNET);
        else
            return Address.fromString(DAI_ADDRESS_MAINNET);
    }
    else {
        if (token_id == PROTOCOL_ENTITY_ETH_ID)
            return Address.fromString(WETH_ADDRESS_RINKEBY);
        if (token_id == PROTOCOL_ENTITY_AAVE_ID)
            return Address.fromString(AAVE_ADDRESS_RINKEBY);
        if (token_id == PROTOCOL_ENTITY_LINK_ID)
            return Address.fromString(LINK_ADDRESS_RINKEBY);
        else
            return Address.fromString(DAI_ADDRESS_RINKEBY);
    }
}

export function getTokenName(token_id: string): string {
    if (token_id == PROTOCOL_ENTITY_ETH_ID)
        return WETH_NAME;
    if (token_id == PROTOCOL_ENTITY_AAVE_ID)
        return AAVE_NAME;
    if (token_id == PROTOCOL_ENTITY_LINK_ID)
        return LINK_NAME;
    else
        return DAI_NAME;
}

export function getTokenSymbol(token_id: string): string {
    if (token_id == PROTOCOL_ENTITY_ETH_ID)
        return WETH_SYMBOL;
    if (token_id == PROTOCOL_ENTITY_AAVE_ID)
        return AAVE_SYMBOL;
    if (token_id == PROTOCOL_ENTITY_LINK_ID)
        return LINK_SYMBOL;
    else
        return DAI_SYMBOL;
}

export function getTokenDecimals(token_id: string): string {
    if (token_id == PROTOCOL_ENTITY_ETH_ID)
        return WETH_DECIMALS;
    if (token_id == PROTOCOL_ENTITY_AAVE_ID)
        return AAVE_DECIMALS;
    if (token_id == PROTOCOL_ENTITY_LINK_ID)
        return LINK_DECIMALS;
    else
        return DAI_DECIMALS;
}