import Error "mo:base/Error";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import RBTree "mo:base/RBTree";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Vector "mo:vector/Class";

import Base64 "./base64";
import Types "./types";

actor class Directory(initialOwner : ?Principal) {
  type TokenIdx = Nat;

  let ownersMap = RBTree.RBTree<Principal, ()>(Principal.compare);
  let assetIdMap = RBTree.RBTree<Nat, TokenIdx>(Nat.compare);
  let keyMap = RBTree.RBTree<Text, TokenIdx>(Text.compare);
  let tokens = Vector.Vector<Types.FungibleToken>();

  stable var stableOwnersMap = ownersMap.share();
  stable var stableAssetIdMap = assetIdMap.share();
  stable var stableKeyMap = keyMap.share();
  stable var stableTokens = tokens.share();

  ignore do ? { ownersMap.put(initialOwner!, ()) };

  let freezingPeriod_ = 86_400_000_000_000; // 1 day

  public query func owners() : async [Principal] {
    ownersMap.entries()
    |> Iter.map<(Principal, ()), Principal>(_, func(x) = x.0)
    |> Iter.toArray<Principal>(_);
  };

  public query func freezingPeriod() : async Nat {
    freezingPeriod_;
  };

  public query func nTokens() : async Nat {
    tokens.size();
  };

  public query func allTokens() : async [Types.FungibleToken] {
    Vector.toArray(tokens);
  };

  public query func tokenByAssetId(assetId : Nat) : async ?Types.FungibleToken {
    Option.map(assetIdMap.get(assetId), tokens.get);
  };

  public query func tokenBySymbol(symbol : Text) : async ?Types.FungibleToken {
    Option.map(keyMap.get(Text.toUppercase(symbol)), tokens.get);
  };

  public shared ({ caller }) func addOwner(principal : Principal) : async () {
    await* assertion.ownerAccess(caller);
    ownersMap.put(principal, ());
  };

  public shared ({ caller }) func removeOwner(principal : Principal) : async () {
    await* assertion.ownerAccess(caller);
    ownersMap.delete(principal);
  };

  public shared ({ caller }) func addToken(args : Types.CreatePayload) : async () {
    let { assetId; symbol; name; logo } = args;
    let key = Text.toUppercase(symbol);

    await* assertion.ownerAccess(caller);
    await* assertion.validSymbol(symbol);
    await* assertion.validName(name);
    await* assertion.validImage(logo);
    await* assertion.tokenNew(assetId, key);

    let newIndex = tokens.size();
    assetIdMap.put(assetId, newIndex);
    keyMap.put(key, newIndex);

    { args with 
    createdAt = Time.now(); modifiedAt = Time.now() }
    |> tokens.add(_);
  };

  /// Update symbol by asset id
  public shared ({ caller }) func correctSymbol(assetId : Nat, newSymbol : Text) : async () {
    await* assertion.ownerAccess(caller);
    await* assertion.validSymbol(newSymbol);

    let ?index = assetIdMap.get(assetId) else throw Error.reject("Asset id does not exist");
    let token = tokens.get(index);
    let prevKey = Text.toUppercase(token.symbol);
    let newKey = Text.toUppercase(newSymbol);

    await* assertion.timeNotExpired(token);

    if (newSymbol == token.symbol) throw Error.reject("New token symbol is the same as the current one");

    if (prevKey != newKey) {
      if (keyMap.get(newKey) != null) throw Error.reject("New token symbol already exists");
      keyMap.delete(prevKey);
      keyMap.put(newKey, index);
    };

    {
      token with
      symbol = newSymbol;
      modifiedAt = Time.now();
    }
    |> tokens.put(index, _);
  };

  /// Update asset id by symbol
  public shared ({ caller }) func correctAssetId(symbol : Text, newAssetId : Nat) : async () {
    await* assertion.ownerAccess(caller);

    let key = Text.toUppercase(symbol);
    let ?index = keyMap.get(key) else throw Error.reject("Symbol does not exist");
    let token = tokens.get(index);

    await* assertion.timeNotExpired(token);

    if (newAssetId == token.assetId) throw Error.reject("New asset id is the same as the current one");
    if (assetIdMap.get(newAssetId) != null) throw Error.reject("New asset id already exists");

    assetIdMap.delete(token.assetId);
    assetIdMap.put(newAssetId, index);

    {
      token with
      assetId = newAssetId;
      modifiedAt = Time.now();
    }
    |> tokens.put(index, _);
  };

  /// Update token info by asset id
  public shared ({ caller }) func updateToken(assetId : Nat, update : Types.UpdatePayload) : async () {
    await* assertion.ownerAccess(caller);

    // existing token
    let ?index = assetIdMap.get(assetId) else throw Error.reject("Asset id does not exist");
    let token = tokens.get(index);

    // check update payload
    ignore do ? {
      await* assertion.validSymbol(update.symbol!);
      await* assertion.validName(update.name!);
      await* assertion.validImage(update.logo!);
      if (Text.toUppercase(update.symbol!) != Text.toUppercase(token.symbol)) {
        throw Error.reject("Only symbol capitalization can be updated");
      };
    };

    {
      token with
      symbol = Option.get(update.symbol, token.symbol);
      name = Option.get(update.name, token.name);
      logo = Option.get(update.logo, token.logo);
      modifiedAt = Time.now();
    }
    |> tokens.put(index, _);

  };

  let assertion = module {
    // All functions in this module are async* so that they can throw

    public func ownerAccess(principal : Principal) : async* () {
      if (ownersMap.get(principal) == null) {
        throw Error.reject("No Access for this principal " # Principal.toText(principal));
      };
    };

    public func tokenNew(assetId : Nat, key : Text) : async* () {
      if (assetIdMap.get(assetId) != null) throw Error.reject("Asset id already exists");
      if (keyMap.get(key) != null) throw Error.reject("Token symbol already exists");
    };

    public func timeNotExpired(token : Types.FungibleToken) : async* () {
      if (Time.now() - token.createdAt >= freezingPeriod_) {
        throw Error.reject("Time to correct token has expired");
      };
    };

    public func validSymbol(symbol : Text) : async* () {
      if (symbol.size() > 8) {
        throw Error.reject("Token symbol cannot be longer than 8 characters");
      };
      if (Text.contains(symbol, #predicate(func(c) { c > 'Z' or (c < 'A' and c > 'z') or (c < 'a' and c > '9') or (c < '0') }))) {
        throw Error.reject("Token symbol can only contain letters and digits");
      };
    };

    public func validName(name : Text) : async* () {
      if (name.size() > 64) {
        throw Error.reject("Token name cannot be longer than 64 characters");
      };
    };

    public func validImage(image : Text) : async* () {
      switch (Base64.validateImage(image)) {
        case (#err msg) throw Error.reject(msg);
        case (_) {};
      };
    };
  };

  system func preupgrade() {
    stableOwnersMap := ownersMap.share();
    stableAssetIdMap := assetIdMap.share();
    stableKeyMap := keyMap.share();
    stableTokens := tokens.share();
  };

  system func postupgrade() {
    ownersMap.unshare(stableOwnersMap);
    assetIdMap.unshare(stableAssetIdMap);
    keyMap.unshare(stableKeyMap);
    tokens.unshare(stableTokens);
  };

};
