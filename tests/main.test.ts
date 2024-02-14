import { AnonymousIdentity } from "@dfinity/agent";
import { Actor, PocketIc, createIdentity } from "@hadronous/pic";
import equal from "fast-deep-equal";

import {
  CreateFungibleTokenPayload,
  _SERVICE,
} from "../declarations/directory.did";
import { logoBase64 } from "./base64Images";
import { deployCanister } from "./setup";

const anonymousIdentity = new AnonymousIdentity();
const userIdentity1 = createIdentity("user1"); // initial owner
const userIdentity2 = createIdentity("user2");
const userIdentity3 = createIdentity("user3");

describe("Directory", () => {
  let pic: PocketIc;
  let actor: Actor<_SERVICE>;

  beforeEach(async () => {
    ({ pic, actor } = await deployCanister({
      initArgs: { initialOwner: userIdentity1.getPrincipal() },
      sender: userIdentity1.getPrincipal(),
    }));
  });

  afterEach(async () => {
    await pic.tearDown();
  });

  test("should allow users to get tokens list", async () => {
    actor.setIdentity(userIdentity2);

    const tokens = await actor.getTokens();
    const isArray = Array.isArray(tokens);
    expect(isArray && tokens.length === 0).toEqual(true);
  });

  test("should allow users to get freezing period", async () => {
    actor.setIdentity(userIdentity2);

    const freezingPeriod = await actor.getFreezingPeriod();

    expect(!Number.isNaN(Number(freezingPeriod))).toEqual(true);

    expect(Number(freezingPeriod) === 86_400_000_000_000).toEqual(true);
  });

  test("should allow owner to add new token", async () => {
    actor.setIdentity(userIdentity1);

    const tokenToAdd: CreateFungibleTokenPayload = {
      assetId: 1n,
      name: "Bitcoin",
      symbol: "BTC",
      logo: logoBase64,
    };

    let tokens = await actor.getTokens();

    const tokenExists = tokens.some((token) => equal(token, tokenToAdd));

    expect(tokenExists).toEqual(false);

    await actor.addToken(tokenToAdd);

    tokens = await actor.getTokens();

    const foundToken = tokens.find(
      (token) => token.assetId == tokenToAdd.assetId
    );

    expect(foundToken).toBeDefined();
    expect(foundToken?.assetId).toEqual(tokenToAdd.assetId);
    expect(foundToken?.name).toEqual(tokenToAdd.name);
    expect(foundToken?.symbol).toEqual(tokenToAdd.symbol);
    expect(foundToken?.logo).toEqual(tokenToAdd.logo);
  });

  test("should allow owner to add new owner", async () => {
    actor.setIdentity(userIdentity1);

    await actor.addOwner(userIdentity2.getPrincipal());

    actor.setIdentity(userIdentity2);

    await actor.addOwner(userIdentity3.getPrincipal());
  });

  test("should now allow non-owner to add new owner", async () => {
    actor.setIdentity(userIdentity2);

    const promise = actor.addOwner(userIdentity3.getPrincipal());
    expect(promise).rejects.toBeInstanceOf(Error);
  });
});
