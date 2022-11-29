import { Address, dataSource, BigInt } from "@graphprotocol/graph-ts";
import {
  WBTCVault,
  CollateralAdded,
  TokensBurned,
  VaultCreated,
  VaultLiquidated,
  TokensMinted,
  CollateralRemoved,
} from "../generated/WBTCVault/WBTCVault";
import {
  HardWBTCVault
} from "../generated/HardWBTCVault/HardWBTCVault";
import { Vault } from "../generated/schema";
import {
  updateVaultCreated,
  updateVaultCollateralTotals,
  updateVaultDebtTotals,
  addToStateAmountStaked,
  substractFromStateAmountStaked
} from "./utils/helpers";
import { PROTOCOL_ENTITY_WBTC_ID, HARD_WBTC_VAULT_ADDRESS, BIGINT_ZERO } from "./utils/constants";
import { getTokenSymbol } from "./utils/tokens";

function isHardVault(): boolean {
  return Address.fromHexString(HARD_WBTC_VAULT_ADDRESS).equals(dataSource.address());;
}

export function handleVaultCreated(event: VaultCreated): void {
  updateVaultCreated(dataSource.network(), PROTOCOL_ENTITY_WBTC_ID, event.address);
  
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._id.toString());
  let vault = new Vault(id);
  vault.owner = event.params._owner;
  vault.address = dataSource.address();
  vault.vaultId = event.params._id;
  vault.collateral = new BigInt(0);
  vault.debt = new BigInt(0);
  vault.currentRatio = new BigInt(0);
  vault.underlyingProtocol = PROTOCOL_ENTITY_WBTC_ID;
  vault.tokenSymbol = getTokenSymbol(PROTOCOL_ENTITY_WBTC_ID);
  vault.blockTS = event.block.timestamp;
  vault.hardVault = isHardVault();
  
  // Entities can be written to the store with `.save()`
  vault.save();
}

export function handleCollateralAdded(event: CollateralAdded): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._id.toString());
  let vault = Vault.load(id);

  if (vault == null) {
    vault = new Vault(id);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }
  if (vault.collateral) {
    vault.collateral = vault.collateral.plus(event.params._amount);
  } else {
    vault.collateral = event.params._amount;
  }
  vault.currentRatio = getRatio(event.params._id);
  vault.save();

  addToStateAmountStaked(dataSource.address(), event.params._amount);  
  updateVaultCollateralTotals(PROTOCOL_ENTITY_WBTC_ID, event.address, event.params._amount, true);
}

export function handleTokensBurned(event: TokensBurned): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._id.toString());
  let vault = Vault.load(id);

  if (vault == null) {
    vault = new Vault(id);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }
  if (vault.debt) {
    vault.debt = vault.debt.minus(event.params._amount);
  }
  vault.currentRatio = getRatio(event.params._id);

  // Entities can be written to the store with `.save()`
  vault.save();

  //Get burn fee
  let burnFee = getFee(event.params._amount);
  
  updateVaultDebtTotals(PROTOCOL_ENTITY_WBTC_ID, event.address, event.params._amount, false, burnFee);
}

export function handleVaultLiquidated(event: VaultLiquidated): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._vaultId.toString());
  let vault = Vault.load(id);

  if (vault == null) {
    vault = new Vault(id);
    vault.vaultId = event.params._vaultId;
    vault.address = dataSource.address();
  }

  if (vault.debt) {
    vault.debt = vault.debt.minus(event.params._liquidationCollateral);
  }

  if (vault.collateral) {
    vault.collateral = vault.collateral.minus(event.params._reward);
  }

  let currentRatio = getRatio(event.params._vaultId);
  vault.currentRatio = currentRatio;

  // Entities can be written to the store with `.save()`
  vault.save();
  
  // State update
  substractFromStateAmountStaked(dataSource.address(), event.params._reward);  
    
  //Get burn fee
  let burnFee = getFee(event.params._liquidationCollateral);
  
  updateVaultCollateralTotals(PROTOCOL_ENTITY_WBTC_ID, event.address, event.params._reward, false);
  updateVaultDebtTotals(PROTOCOL_ENTITY_WBTC_ID, event.address, event.params._liquidationCollateral, false, burnFee)
}

export function handleTokensMinted(event: TokensMinted): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._id.toString());
  let vault = Vault.load(id);

  if (vault == null) {
    vault = new Vault(id);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }
  if (vault.debt) {
    vault.debt = vault.debt.plus(event.params._amount);
  } else {
    vault.debt = event.params._amount;
  }
  vault.currentRatio = getRatio(event.params._id);
  // Entities can be written to the store with `.save()`
  vault.save();

  updateVaultDebtTotals(PROTOCOL_ENTITY_WBTC_ID, event.address, event.params._amount, true, BigInt.fromI32(0));
}

export function handleCollateralRemoved(event: CollateralRemoved): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._id.toString());
  let vault = Vault.load(id);

  if (vault == null) {
    vault = new Vault(id);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }

  if (vault.collateral) {
    vault.collateral = vault.collateral.minus(event.params._amount);
  }
  vault.currentRatio = getRatio(event.params._id);
  // Entities can be written to the store with `.save()`
  vault.save();

  substractFromStateAmountStaked(dataSource.address(), event.params._amount);  
  updateVaultCollateralTotals(PROTOCOL_ENTITY_WBTC_ID, event.address, event.params._amount, false);
}

function getRatio(id: BigInt): BigInt {
  let currentRatio = BIGINT_ZERO;
  if (isHardVault()) {
    let contract = HardWBTCVault.bind(dataSource.address());
    currentRatio = contract.getVaultRatio(id);
  } else {
    let contract = WBTCVault.bind(dataSource.address());
    currentRatio = contract.getVaultRatio(id);
  }
  
  return currentRatio;
}

function getFee(amount: BigInt): BigInt {
  let burnFee = BIGINT_ZERO;
  if (isHardVault()) {
    let contract = HardWBTCVault.bind(dataSource.address());
    burnFee = contract.getFee(amount);
  } else {
    let contract = WBTCVault.bind(dataSource.address());
    burnFee = contract.getFee(amount);
  }

  return burnFee;
}