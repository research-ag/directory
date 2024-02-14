import { IDL } from "@dfinity/candid";
import { idlFactory, init } from "../declarations/directory.did";
import type { _SERVICE } from "../declarations/directory.did";
import { resolve } from "node:path";
import { PocketIc } from "@hadronous/pic";
import { Principal } from "@dfinity/principal";

interface InitArgs {
  initialOwner?: Principal;
}

const WASM_PATH = resolve(
  __dirname,
  "..",
  ".dfx",
  "local",
  "canisters",
  "directory",
  "directory.wasm"
);

interface DeployOptions {
  initArgs?: InitArgs;
  sender?: Principal;
}

export async function deployCanister({
  initArgs: { initialOwner } = { initialOwner: Principal.anonymous() },
  sender = Principal.anonymous(),
}: DeployOptions) {
  const encodedInitArgs = IDL.encode(init({ IDL }), [[initialOwner]]);
  const pic = await PocketIc.create();

  const fixture = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: WASM_PATH,
    arg: encodedInitArgs,
    sender,
  });

  const actor = fixture.actor;
  const canisterId = fixture.canisterId;
  return { pic, actor, canisterId };
}
