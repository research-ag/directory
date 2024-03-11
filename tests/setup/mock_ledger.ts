import { resolve } from "node:path";
import { PocketIc } from "@hadronous/pic";
import { Principal } from "@dfinity/principal";

import {
  type _SERVICE,
  idlFactory,
} from "@declarations/mock_ledger/mock_ledger.did";

const WASM_PATH = resolve(
  __dirname,
  "..",
  "..",
  ".dfx",
  "local",
  "canisters",
  "mock_ledger",
  "mock_ledger.wasm"
);

interface DeployOptions {
  pic: PocketIc;
  sender?: Principal;
}

export async function deployMockLedger({
  pic,
  sender = Principal.anonymous(),
}: DeployOptions) {
  const fixture = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: WASM_PATH,
    sender,
  });

  const actor = fixture.actor;
  const canisterId = fixture.canisterId;
  return { actor, canisterId };
}
