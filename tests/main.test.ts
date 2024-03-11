import { Actor, PocketIc, createIdentity } from "@hadronous/pic";

import { _SERVICE } from "@declarations/directory/directory.did";

import {
  btcCreatePayload,
  icpCreatePayload,
  ethCreatePayload,
  ethereumLogoBase64,
  bitcoinlogoBase64,
} from "./constants";
import { deployDirectory } from "./setup";

const userIdentity1 = createIdentity("user1"); // initial owner
const userIdentity2 = createIdentity("user2");
const userIdentity3 = createIdentity("user3");
const userIdentity4 = createIdentity("user4");

const inverseCapitalization = (str: string) => {
  const mapChar = (c: string) => {
    const isLowerCase = c === c.toLowerCase();
    return isLowerCase ? c.toUpperCase() : c.toLowerCase();
  };

  return str.split("").map(mapChar).join("");
};

describe("Directory", () => {
  let pic: PocketIc;
  let actor: Actor<_SERVICE>;

  beforeEach(async () => {
    ({ pic, actor } = await deployDirectory({
      initArgs: { initialOwner: userIdentity1.getPrincipal() },
      sender: userIdentity1.getPrincipal(),
    }));
  });

  afterEach(async () => {
    await pic.tearDown();
  });

  test("should allow users to get tokens", async () => {
    let tokens, isArray;

    actor.setIdentity(userIdentity2);
    tokens = await actor.allTokens();
    isArray = Array.isArray(tokens);
    expect(isArray && tokens.length === 0).toEqual(true);

    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);
    await actor.addToken(icpCreatePayload);
    await actor.addToken(ethCreatePayload);

    actor.setIdentity(userIdentity2);
    tokens = await actor.allTokens();
    isArray = Array.isArray(tokens);
    expect(isArray && tokens.length === 3).toEqual(true);
  });

  test("should allow users to get token by asset id", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);

    actor.setIdentity(userIdentity2);
    const [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    expect(token?.assetId === btcCreatePayload.assetId).toEqual(true);
  });

  test("should allow users to get token by symbol", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);

    actor.setIdentity(userIdentity2);
    const [token] = await actor.tokenBySymbol(btcCreatePayload.symbol);
    expect(token?.symbol === btcCreatePayload.symbol).toEqual(true);
  });

  test("should allow users to get freezing period", async () => {
    actor.setIdentity(userIdentity2);
    const freezingPeriod = await actor.freezingPeriod();
    expect(!Number.isNaN(Number(freezingPeriod))).toEqual(true);
    expect(Number(freezingPeriod) === 365 * 86_400_000_000_000).toEqual(true);
  });

  test("should allow owners to add new owner", async () => {
    actor.setIdentity(userIdentity2);
    await expect(actor.addToken(btcCreatePayload)).rejects.toThrow();

    actor.setIdentity(userIdentity1);
    await actor.addOwner(userIdentity2.getPrincipal());

    actor.setIdentity(userIdentity2);
    await actor.addToken(btcCreatePayload);
  });

  test("should allow owners to remove owner", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addOwner(userIdentity2.getPrincipal());

    actor.setIdentity(userIdentity2);
    await actor.addToken(btcCreatePayload);

    actor.setIdentity(userIdentity1);
    await actor.removeOwner(userIdentity2.getPrincipal());

    actor.setIdentity(userIdentity2);
    await expect(actor.addToken(ethCreatePayload)).rejects.toThrow();
  });

  test("should not allow owners to remove themselves", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addOwner(userIdentity1.getPrincipal());
    await expect(
      actor.removeOwner(userIdentity1.getPrincipal())
    ).rejects.toThrow("Cannot remove yourself from owners");
  });

  test("should allow owners to add new token", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);
  });

  test("should allow owners to correct symbol", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);
    let [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    const newSymbol = "XXX";
    expect(token?.symbol !== newSymbol).toEqual(true);
    await actor.correctSymbol(btcCreatePayload.assetId, newSymbol);
    [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    expect(token?.symbol === newSymbol).toEqual(true);
  });

  test("should allow owners to correct asset id", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);
    let [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    const newAssetId = 100n;
    expect(token?.assetId !== newAssetId).toEqual(true);
    await actor.correctAssetId(btcCreatePayload.symbol, newAssetId);
    [token] = await actor.tokenBySymbol(btcCreatePayload.symbol);
    expect(token?.assetId === newAssetId).toEqual(true);
  });

  test("should prevent token correction after freezing period", async () => {
    actor.setIdentity(userIdentity1);
    const freezingPeriod = Number(await actor.freezingPeriod()) / 1_000_000; // in milliseconds
    await actor.addToken(btcCreatePayload);
    const [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    const createdTime = Number(token!.createdAt) / 1_000_000;
    let newAssetId = 10n;
    await actor.correctAssetId(btcCreatePayload.symbol, newAssetId++);
    await pic.setTime(createdTime + freezingPeriod - 10_000);
    await actor.correctAssetId(btcCreatePayload.symbol, newAssetId++);
    await pic.setTime(createdTime + freezingPeriod);
    const promise = actor.correctAssetId(btcCreatePayload.symbol, newAssetId++);
    await expect(promise).rejects.toThrow();
  });

  test("should allow owners to update token non-id info at any time", async () => {
    actor.setIdentity(userIdentity1);
    const freezingPeriod = Number(await actor.freezingPeriod()) / 1_000_000; // in milliseconds
    await actor.addToken(btcCreatePayload);
    let [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    const createdTime = Number(token!.createdAt) / 1_000_000;
    await pic.setTime(createdTime + freezingPeriod);
    const newLogo = ethereumLogoBase64;
    const newName = "XXX1";
    const newSymbol = inverseCapitalization(token!.symbol);
    expect(token?.logo !== newLogo).toEqual(true);
    expect(token?.name !== newName).toEqual(true);
    expect(token?.symbol !== newSymbol).toEqual(true);
    await actor.updateToken(token!.assetId, {
      logo: [newLogo],
      name: [newName],
      symbol: [newSymbol],
    });
    [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    expect(token?.logo === newLogo).toEqual(true);
    expect(token?.name === newName).toEqual(true);
    expect(token?.symbol === newSymbol).toEqual(true);
  });

  test("should not allow non-owners to manage owners", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addOwner(userIdentity3.getPrincipal());

    actor.setIdentity(userIdentity2);
    let promise = actor.addOwner(userIdentity4.getPrincipal());
    await expect(promise).rejects.toThrow();
    promise = actor.removeOwner(userIdentity3.getPrincipal());
    await expect(promise).rejects.toThrow();
  });

  test("should not allow non-owners to manage tokens", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);

    actor.setIdentity(userIdentity2);
    let promise = actor.addToken(ethCreatePayload);
    await expect(promise).rejects.toThrow();
    promise = actor.correctAssetId(ethCreatePayload.symbol, 10n);
    await expect(promise).rejects.toThrow();
    promise = actor.correctSymbol(ethCreatePayload.assetId, "XXX");
    await expect(promise).rejects.toThrow();
    promise = actor.updateToken(ethCreatePayload.assetId, {
      logo: [],
      name: ["XXX"],
      symbol: [],
    });
    await expect(promise).rejects.toThrow();
  });

  test("should not allow owners to add token with invalid input", async () => {
    actor.setIdentity(userIdentity1);
    let logo =
      bitcoinlogoBase64.slice(0, 100) + "!" + bitcoinlogoBase64.slice(102);
    let promise = actor.addToken({ ...btcCreatePayload, logo });
    await expect(promise).rejects.toThrow();
    logo = "x".repeat(100);
    promise = actor.addToken({ ...btcCreatePayload, logo });
    await expect(promise).rejects.toThrow();
    const name = "x".repeat(100);
    promise = actor.addToken({ ...btcCreatePayload, name });
    await expect(promise).rejects.toThrow();
    const symbol = "x".repeat(10);
    promise = actor.addToken({ ...btcCreatePayload, symbol });
    await expect(promise).rejects.toThrow();
  });

  test("should not allow owners to add existing token", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);
    const [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    let promise = actor.addToken({
      ...btcCreatePayload,
      assetId: token!.assetId,
      symbol: "XXX",
    });
    await expect(promise).rejects.toThrow();
    promise = actor.addToken({
      ...btcCreatePayload,
      assetId: 100n,
      symbol: token!.symbol,
    });
    await expect(promise).rejects.toThrow();
  });

  test("should not allow owners to add token with asset id not existing in the ledger", async () => {
    actor.setIdentity(userIdentity1);
    let promise = actor.addToken({ ...btcCreatePayload, assetId: BigInt(101) }); // Mock ledger returns 100 of assets
    await expect(promise).rejects.toThrow(
      "Asset id does not exist in the ledger"
    );
  });

  test("should not allow owners to correct token with invalid input", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);
    const [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    let promise = actor.correctSymbol(token!.assetId, "x".repeat(100));
    await expect(promise).rejects.toThrow();
  });

  test("should not allow owners to correct token with existing asset id / key", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);
    await actor.addToken(ethCreatePayload);
    let promise = actor.correctAssetId(
      btcCreatePayload.symbol,
      ethCreatePayload.assetId
    );
    await expect(promise).rejects.toThrow();
    promise = actor.correctSymbol(
      btcCreatePayload.assetId,
      ethCreatePayload.symbol
    );
    await expect(promise).rejects.toThrow();
  });

  test("should allow owners to update symbol capitalization after freezing period", async () => {
    actor.setIdentity(userIdentity1);
    const freezingPeriod = Number(await actor.freezingPeriod()) / 1_000_000; // in milliseconds
    await actor.addToken(btcCreatePayload);
    let [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    const createdTime = Number(token!.createdAt) / 1_000_000;
    await pic.setTime(createdTime + freezingPeriod);
    const newSymbol = inverseCapitalization(token!.symbol);
    await actor.updateToken(token!.assetId, {
      logo: [],
      name: [],
      symbol: [newSymbol],
    });
    [token] = await actor.tokenByAssetId(btcCreatePayload.assetId);
    await expect(token?.symbol === newSymbol).toEqual(true);
  });

  test("should not allow owners to update token with invalid input", async () => {
    actor.setIdentity(userIdentity1);
    await actor.addToken(btcCreatePayload);
    let logo =
      bitcoinlogoBase64.slice(0, 100) + "!" + bitcoinlogoBase64.slice(102);
    let promise = actor.updateToken(btcCreatePayload.assetId, {
      logo: [logo],
      name: [],
      symbol: [],
    });
    await expect(promise).rejects.toThrow();
    logo = "x".repeat(100);
    promise = actor.updateToken(btcCreatePayload.assetId, {
      logo: [logo],
      name: [],
      symbol: [],
    });
    await expect(promise).rejects.toThrow();
    const name = "x".repeat(100);
    promise = actor.updateToken(btcCreatePayload.assetId, {
      logo: [],
      name: [name],
      symbol: [],
    });
    await expect(promise).rejects.toThrow();
    const symbol = "x".repeat(10);
    promise = actor.updateToken(btcCreatePayload.assetId, {
      logo: [],
      name: [],
      symbol: [symbol],
    });
    await expect(promise).rejects.toThrow();
  });
});
