import { dataSource, log, BigInt } from "@graphprotocol/graph-ts";
import {
  ETHVault,
  CollateralAdded,
  TokensBurned,
  VaultCreated,
  VaultLiquidated,
  TokensMinted,
  CollateralRemoved,
} from "../generated/ETHVault/ETHVault";
import { Vault, State, Protocol } from "../generated/schema";

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

  //State Update
  let state = State.load(dataSource.address().toHex());
  if (state.amountStaked) {
    state.amountStaked = state.amountStaked.plus(event.params._amount);
  } else {
    state.amountStaked = event.params._amount;
  }
  state.save();

  let protocol = Protocol.load("1");
  if (protocol == null) {
    protocol = new Protocol("1");
  }
  if (protocol.totalTransactions) {
    protocol.totalTransactions = protocol.totalTransactions.plus(
      BigInt.fromI32(1)
    );
  } else {
    protocol.totalTransactions = BigInt.fromI32(1);
  }
  protocol.save();
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
  if (vault.debt) vault.debt = vault.debt.minus(event.params._amount);

  vault.currentRatio = getRatio(event.params._id);

  // Entities can be written to the store with `.save()`
  vault.save();

  let protocol = Protocol.load("1");
  if (protocol == null) {
    protocol = new Protocol("1");
  }
  if (protocol.totalTransactions) {
    protocol.totalTransactions = protocol.totalTransactions.plus(
      BigInt.fromI32(1)
    );
  } else {
    protocol.totalTransactions = BigInt.fromI32(1);
  }
  protocol.save();

  //TODO: Calculate burn fee
}

export function handleVaultCreated(event: VaultCreated): void {
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

  let protocol = Protocol.load("1");

  if (protocol == null) {
    protocol = new Protocol("1");
  }
  if (protocol.createdVaults) {
    protocol.createdVaults = protocol.createdVaults.plus(BigInt.fromI32(1));
  } else {
    protocol.createdVaults = BigInt.fromI32(1);
  }
  if (protocol.totalTransactions) {
    protocol.totalTransactions = protocol.totalTransactions.plus(
      BigInt.fromI32(1)
    );
  } else {
    protocol.totalTransactions = BigInt.fromI32(1);
  }
  protocol.save();

  // Entities can be written to the store with `.save()`
  vault.save();
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
  if (vault.debt)
    vault.debt = vault.debt.minus(event.params._liquidationCollateral);
  if (vault.collateral)
    vault.collateral = vault.collateral.minus(event.params._reward);

  let contract = ETHVault.bind(dataSource.address());
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

  let protocol = Protocol.load("1");
  if (protocol == null) {
    protocol = new Protocol("1");
  }
  if (protocol.totalTransactions) {
    protocol.totalTransactions = protocol.totalTransactions.plus(
      BigInt.fromI32(1)
    );
  } else {
    protocol.totalTransactions = BigInt.fromI32(1);
  }
  protocol.save();

  //TODO: Calculate burn fee
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

  let protocol = Protocol.load("1");
  if (protocol.totalTransactions) {
    protocol.totalTransactions = protocol.totalTransactions.plus(
      BigInt.fromI32(1)
    );
  } else {
    protocol.totalTransactions = BigInt.fromI32(1);
  }
  protocol.save();
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
  if (vault.collateral)
    vault.collateral = vault.collateral.minus(event.params._amount);

  vault.currentRatio = getRatio(event.params._id);
  // Entities can be written to the store with `.save()`
  vault.save();

  //State Update
  let state = State.load(dataSource.address().toHex());
  if (state.amountStaked) {
    state.amountStaked = state.amountStaked.minus(event.params._amount);
  }
  state.save();

  let protocol = Protocol.load("1");
  if (protocol == null) {
    protocol = new Protocol("1");
  }
  if (protocol.totalTransactions) {
    protocol.totalTransactions = protocol.totalTransactions.plus(
      BigInt.fromI32(1)
    );
  } else {
    protocol.totalTransactions = BigInt.fromI32(1);
  }
  protocol.save();
}

function getRatio(id: BigInt): BigInt {
  let contract = ETHVault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(id);
  return currentRatio;
}
