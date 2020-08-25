// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Vault extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Vault entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Vault entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Vault", id.toString(), this);
  }

  static load(id: string): Vault | null {
    return store.get("Vault", id) as Vault | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get owner(): Bytes | null {
    let value = this.get("owner");
    if (value === null) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set owner(value: Bytes | null) {
    if (value === null) {
      this.unset("owner");
    } else {
      this.set("owner", Value.fromBytes(value as Bytes));
    }
  }

  get collateral(): BigInt | null {
    let value = this.get("collateral");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set collateral(value: BigInt | null) {
    if (value === null) {
      this.unset("collateral");
    } else {
      this.set("collateral", Value.fromBigInt(value as BigInt));
    }
  }

  get debt(): BigInt | null {
    let value = this.get("debt");
    if (value === null) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set debt(value: BigInt | null) {
    if (value === null) {
      this.unset("debt");
    } else {
      this.set("debt", Value.fromBigInt(value as BigInt));
    }
  }

  get currentRatio(): i32 {
    let value = this.get("currentRatio");
    return value.toI32();
  }

  set currentRatio(value: i32) {
    this.set("currentRatio", Value.fromI32(value));
  }
}

export class State extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save State entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save State entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("State", id.toString(), this);
  }

  static load(id: string): State | null {
    return store.get("State", id) as State | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get owner(): Bytes | null {
    let value = this.get("owner");
    if (value === null) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set owner(value: Bytes | null) {
    if (value === null) {
      this.unset("owner");
    } else {
      this.set("owner", Value.fromBytes(value as Bytes));
    }
  }

  get isPaused(): boolean {
    let value = this.get("isPaused");
    return value.toBoolean();
  }

  set isPaused(value: boolean) {
    this.set("isPaused", Value.fromBoolean(value));
  }

  get hasWishlist(): boolean {
    let value = this.get("hasWishlist");
    return value.toBoolean();
  }

  set hasWishlist(value: boolean) {
    this.set("hasWishlist", Value.fromBoolean(value));
  }

  get tcapContract(): Bytes | null {
    let value = this.get("tcapContract");
    if (value === null) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set tcapContract(value: Bytes | null) {
    if (value === null) {
      this.unset("tcapContract");
    } else {
      this.set("tcapContract", Value.fromBytes(value as Bytes));
    }
  }

  get collateralContract(): Bytes | null {
    let value = this.get("collateralContract");
    if (value === null) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set collateralContract(value: Bytes | null) {
    if (value === null) {
      this.unset("collateralContract");
    } else {
      this.set("collateralContract", Value.fromBytes(value as Bytes));
    }
  }

  get ethContract(): Bytes | null {
    let value = this.get("ethContract");
    if (value === null) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set ethContract(value: Bytes | null) {
    if (value === null) {
      this.unset("ethContract");
    } else {
      this.set("ethContract", Value.fromBytes(value as Bytes));
    }
  }

  get tcapOracle(): Bytes | null {
    let value = this.get("tcapOracle");
    if (value === null) {
      return null;
    } else {
      return value.toBytes();
    }
  }

  set tcapOracle(value: Bytes | null) {
    if (value === null) {
      this.unset("tcapOracle");
    } else {
      this.set("tcapOracle", Value.fromBytes(value as Bytes));
    }
  }

  get burnFee(): i32 {
    let value = this.get("burnFee");
    return value.toI32();
  }

  set burnFee(value: i32) {
    this.set("burnFee", Value.fromI32(value));
  }

  get liquidationPenalty(): i32 {
    let value = this.get("liquidationPenalty");
    return value.toI32();
  }

  set liquidationPenalty(value: i32) {
    this.set("liquidationPenalty", Value.fromI32(value));
  }

  get ratio(): i32 {
    let value = this.get("ratio");
    return value.toI32();
  }

  set ratio(value: i32) {
    this.set("ratio", Value.fromI32(value));
  }

  get divisor(): i32 {
    let value = this.get("divisor");
    return value.toI32();
  }

  set divisor(value: i32) {
    this.set("divisor", Value.fromI32(value));
  }
}
