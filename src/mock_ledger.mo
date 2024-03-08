import Types "./types";

actor MockLedger : Types.LedgerActor = {
  public query func nFtAssets() : async Nat { 100 };
};
