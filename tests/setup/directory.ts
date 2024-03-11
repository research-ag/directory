import { IDL } from "@dfinity/candid";
import { resolve } from "node:path";
import { PocketIc } from "@hadronous/pic";
import { Principal } from "@dfinity/principal";

import {
  type _SERVICE,
  idlFactory,
  init,
} from "@declarations/directory/directory.did";

import { deployMockLedger } from "./mock_ledger";

interface InitArgs {
  initialOwner?: Principal;
}

const WASM_PATH = resolve(
  __dirname,
  "..",
  "..",
  ".dfx",
  "local",
  "canisters",
  "directory",
  "directory.wasm"
);

interface DeployOptions {
  initArgs: InitArgs;
  sender?: Principal;
}

export async function deployDirectory({
  initArgs: { initialOwner = Principal.anonymous() },
  sender = Principal.anonymous(),
}: DeployOptions) {
  const pic = await PocketIc.create();

  const { canisterId: mockLedgerCanisterId } = await deployMockLedger({
    pic,
    sender,
  });

  const encodedInitArgs = IDL.encode(init({ IDL }), [
    mockLedgerCanisterId,
    [initialOwner],
  ]);

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
