import { Address } from "@graphprotocol/graph-ts";
import { PROTOCOL_ENTITY_ETH_ID } from "./constants";

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


export function getTokenAddress(network: string, token_id: string): Address {
    if (network == "mainnet") {
        if (token_id == PROTOCOL_ENTITY_ETH_ID)
            return Address.fromString(WETH_ADDRESS_MAINNET);
        else
            return Address.fromString(DAI_ADDRESS_MAINNET);
    }
    else {
        if (token_id == PROTOCOL_ENTITY_ETH_ID)
            return Address.fromString(WETH_ADDRESS_RINKEBY);
        else
            return Address.fromString(DAI_ADDRESS_RINKEBY);
    }
}

export function getTokenName(token_id: string): string {
    if (token_id == PROTOCOL_ENTITY_ETH_ID)
        return WETH_NAME;
    else
        return DAI_NAME;
}

export function getTokenSymbol(token_id: string): string {
    if (token_id == PROTOCOL_ENTITY_ETH_ID)
        return WETH_SYMBOL;
    else
        return DAI_SYMBOL;
}

export function getTokenDecimals(token_id: string): string {
    if (token_id == PROTOCOL_ENTITY_ETH_ID)
        return WETH_DECIMALS;
    else
        return DAI_DECIMALS;
}