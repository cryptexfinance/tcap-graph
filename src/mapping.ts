// import { BigInt } from "@graphprotocol/graph-ts";
// import {
//   Contract,
//   LogAddCollateral,
//   LogBurn,
//   LogCreateVault,
//   LogEnableWhitelist,
//   LogLiquidateVault,
//   LogMint,
//   LogRemoveCollateral,
//   LogRetrieveFees,
//   LogSetBurnFee,
//   LogSetCollateralContract,
//   LogSetCollateralPriceOracle,
//   LogSetDivisor,
//   LogSetLiquidationPenalty,
//   LogSetRatio,
//   LogSetTCAPOracle,
//   LogSetTCAPXContract,
//   OwnershipTransferred,
//   Paused,
//   RoleGranted,
//   RoleRevoked,
//   Unpaused,
// } from "../generated/Contract/Contract";
// import { Vault } from "../generated/schema";

// export function handleLogAddCollateral(event: LogAddCollateral): void {
//   // Entities can be loaded from the store using a string ID; this ID
//   // needs to be unique across all entities of the same type
//   let entity = Vault.load(event.transaction.from.toHex());

//   // Entities only exist after they have been saved to the store;
//   // `null` checks allow to create entities on demand
//   if (entity == null) {
//     entity = new ExampleEntity(event.transaction.from.toHex());

//     // Entity fields can be set using simple assignments
//     entity.count = BigInt.fromI32(0);
//   }

//   // BigInt and BigDecimal math are supported
//   entity.count = entity.count + BigInt.fromI32(1);

//   // Entity fields can be set based on event parameters
//   entity._owner = event.params._owner;
//   entity._id = event.params._id;

//   // Entities can be written to the store with `.save()`
//   entity.save();

//   // Note: If a handler doesn't require existing field values, it is faster
//   // _not_ to load the entity from the store. Instead, create it fresh with
//   // `new Entity(...)`, set the fields that should be updated and save the
//   // entity back to the store. Fields that were not set or unset remain
//   // unchanged, allowing for partial updates to be applied.

//   // It is also possible to access smart contracts from mappings. For
//   // example, the contract that has emitted the event can be connected to
//   // with:
//   //
//   // let contract = Contract.bind(event.address)
//   //
//   // The following functions can then be called on this contract to access
//   // state variables and other data:
//   //
//   // - contract.DEFAULT_ADMIN_ROLE(...)
//   // - contract.INVESTOR_ROLE(...)
//   // - contract.TCAPXPrice(...)
//   // - contract.TCAPXToken(...)
//   // - contract.burnFee(...)
//   // - contract.collateralContract(...)
//   // - contract.collateralPriceOracle(...)
//   // - contract.divisor(...)
//   // - contract.getFee(...)
//   // - contract.getRoleAdmin(...)
//   // - contract.getRoleMember(...)
//   // - contract.getRoleMemberCount(...)
//   // - contract.getVault(...)
//   // - contract.getVaultRatio(...)
//   // - contract.hasRole(...)
//   // - contract.liquidationPenalty(...)
//   // - contract.liquidationReward(...)
//   // - contract.owner(...)
//   // - contract.paused(...)
//   // - contract.ratio(...)
//   // - contract.requiredCollateral(...)
//   // - contract.requiredLiquidationCollateral(...)
//   // - contract.tcapOracle(...)
//   // - contract.vaultToUser(...)
//   // - contract.vaults(...)
//   // - contract.whitelistEnabled(...)
// }

// export function handleLogBurn(event: LogBurn): void {}

// export function handleLogCreateVault(event: LogCreateVault): void {}

// export function handleLogEnableWhitelist(event: LogEnableWhitelist): void {}

// export function handleLogLiquidateVault(event: LogLiquidateVault): void {}

// export function handleLogMint(event: LogMint): void {}

// export function handleLogRemoveCollateral(event: LogRemoveCollateral): void {}

// export function handleLogRetrieveFees(event: LogRetrieveFees): void {}

// export function handleLogSetBurnFee(event: LogSetBurnFee): void {}

// export function handleLogSetCollateralContract(
//   event: LogSetCollateralContract
// ): void {}

// export function handleLogSetCollateralPriceOracle(
//   event: LogSetCollateralPriceOracle
// ): void {}

// export function handleLogSetDivisor(event: LogSetDivisor): void {}

// export function handleLogSetLiquidationPenalty(
//   event: LogSetLiquidationPenalty
// ): void {}

// export function handleLogSetRatio(event: LogSetRatio): void {}

// export function handleLogSetTCAPOracle(event: LogSetTCAPOracle): void {}

// export function handleLogSetTCAPXContract(event: LogSetTCAPXContract): void {}

// export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

// export function handlePaused(event: Paused): void {}

// export function handleRoleGranted(event: RoleGranted): void {}

// export function handleRoleRevoked(event: RoleRevoked): void {}

// export function handleUnpaused(event: Unpaused): void {}
