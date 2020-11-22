import { dataSource } from "@graphprotocol/graph-ts";
import {
  ERC20Vault,
  LogAddCollateral,
  LogBurn,
  LogCreateVault,
  LogLiquidateVault,
  LogMint,
  LogRemoveCollateral,
} from "../generated/Vault/ERC20Vault";
import { Vault } from "../generated/schema";

export function handleLogAddCollateral(event: LogAddCollateral): void {
  let vault = Vault.load(
    `${dataSource.address()}-${event.params._id.toString()}`
  );

  if (vault == null) {
    vault = new Vault(`${dataSource.address()}-${event.params._id.toString()}`);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }
  vault.collateral = vault.collateral.plus(event.params._amount);

  let contract = ERC20Vault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._id);
  vault.currentRatio = currentRatio;

  // Entities can be written to the store with `.save()`
  vault.save();

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.DEFAULT_ADMIN_ROLE(...)
  // - contract.INVESTOR_ROLE(...)
  // - contract.TCAPXPrice(...)
  // - contract.TCAPXToken(...)
  // - contract.burnFee(...)
  // - contract.collateralContract(...)
  // - contract.collateralPriceOracle(...)
  // - contract.divisor(...)
  // - contract.getFee(...)
  // - contract.getRoleAdmin(...)
  // - contract.getRoleMember(...)
  // - contract.getRoleMemberCount(...)
  // - contract.getVault(...)
  // - contract.getVaultRatio(...)
  // - contract.hasRole(...)
  // - contract.liquidationPenalty(...)
  // - contract.liquidationReward(...)
  // - contract.owner(...)
  // - contract.paused(...)
  // - contract.ratio(...)
  // - contract.requiredCollateral(...)
  // - contract.requiredLiquidationCollateral(...)
  // - contract.tcapOracle(...)
  // - contract.vaultToUser(...)
  // - contract.vaults(...)
  // - contract.whitelistEnabled(...)
}

export function handleLogBurn(event: LogBurn): void {
  let vault = Vault.load(
    `${dataSource.address()}-${event.params._id.toString()}`
  );

  if (vault == null) {
    vault = new Vault(`${dataSource.address()}-${event.params._id.toString()}`);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }
  vault.debt = vault.debt.minus(event.params._amount);

  let contract = ERC20Vault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._id);
  vault.currentRatio = currentRatio;

  // Entities can be written to the store with `.save()`
  vault.save();

  //TODO: Calculate burn fee
}

export function handleLogCreateVault(event: LogCreateVault): void {
  let vault = new Vault(
    `${dataSource.address()}-${event.params._id.toString()}`
  );
  vault.owner = event.params._owner;
  vault.address = dataSource.address();
  vault.vaultId = event.params._id;

  // Entities can be written to the store with `.save()`
  vault.save();
}

export function handleLogLiquidateVault(event: LogLiquidateVault): void {
  let vault = Vault.load(
    `${dataSource.address()}-${event.params._vaultId.toString()}`
  );

  if (vault == null) {
    vault = new Vault(
      `${dataSource.address()}-${event.params._vaultId.toString()}`
    );
    vault.vaultId = event.params._vaultId;
    vault.address = dataSource.address();
  }
  vault.debt = vault.debt.minus(event.params._liquidationCollateral);
  vault.collateral = vault.collateral.minus(event.params._reward);

  let contract = ERC20Vault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._vaultId);
  vault.currentRatio = currentRatio;

  // Entities can be written to the store with `.save()`
  vault.save();

  //TODO: Calculate burn fee
}

export function handleLogMint(event: LogMint): void {
  let vault = Vault.load(
    `${dataSource.address()}-${event.params._id.toString()}`
  );

  if (vault == null) {
    vault = new Vault(`${dataSource.address()}-${event.params._id.toString()}`);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }
  vault.debt = vault.debt.plus(event.params._amount);

  let contract = ERC20Vault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._id);
  vault.currentRatio = currentRatio;
  // Entities can be written to the store with `.save()`
  vault.save();
}

export function handleLogRemoveCollateral(event: LogRemoveCollateral): void {
  let vault = Vault.load(
    `${dataSource.address()}-${event.params._id.toString()}`
  );

  if (vault == null) {
    vault = new Vault(`${dataSource.address()}-${event.params._id.toString()}`);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }
  vault.collateral = vault.collateral.minus(event.params._amount);

  let contract = ERC20Vault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._id);
  vault.currentRatio = currentRatio;
  // Entities can be written to the store with `.save()`
  vault.save();
}
