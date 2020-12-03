import { dataSource, log, BigInt } from "@graphprotocol/graph-ts";
import {
  ERC20Vault,
  LogAddCollateral,
  LogBurn,
  LogCreateVault,
  LogLiquidateVault,
  LogMint,
  LogRemoveCollateral,
} from "../generated/Vault/ERC20Vault";
import { Vault, State } from "../generated/schema";

export function handleLogAddCollateral(event: LogAddCollateral): void {
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
  let contract = ERC20Vault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._id);
  vault.currentRatio = currentRatio;
  vault.save();

  //State Update
  let state = State.load(dataSource.address().toHex());
  if (state.amountStaked) {
    state.amountStaked = state.amountStaked.plus(event.params._amount);
  } else {
    state.amountStaked = event.params._amount;
  }
  state.save();
}

export function handleLogBurn(event: LogBurn): void {
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

  let contract = ERC20Vault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._id);
  vault.currentRatio = currentRatio;

  // Entities can be written to the store with `.save()`
  vault.save();

  //TODO: Calculate burn fee
}

export function handleLogCreateVault(event: LogCreateVault): void {
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

  // Entities can be written to the store with `.save()`
  vault.save();
}

export function handleLogLiquidateVault(event: LogLiquidateVault): void {
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

  let contract = ERC20Vault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._vaultId);
  vault.currentRatio = currentRatio;

  // Entities can be written to the store with `.save()`
  vault.save();

  //State Update
  let state = State.load(dataSource.address().toHex());
  if (state.amountStaked) {
    state.amountStaked = state.amountStaked.minus(event.params._reward);
  }
  state.save();

  //TODO: Calculate burn fee
}

export function handleLogMint(event: LogMint): void {
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

  let contract = ERC20Vault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._id);
  vault.currentRatio = currentRatio;
  // Entities can be written to the store with `.save()`
  vault.save();
}

export function handleLogRemoveCollateral(event: LogRemoveCollateral): void {
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

  let contract = ERC20Vault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._id);
  vault.currentRatio = currentRatio;
  // Entities can be written to the store with `.save()`
  vault.save();

  //State Update
  let state = State.load(dataSource.address().toHex());
  if (state.amountStaked) {
    state.amountStaked = state.amountStaked.minus(event.params._amount);
  }
  state.save();
}
