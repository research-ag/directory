import Vector "mo:vector/Class";
import RBTree "mo:base/RBTree";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Option "mo:base/Option";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Types "./types";
import Base64 "./base64";

actor class Directory(initialOwner : ?Principal) {
  let ownersMap = RBTree.RBTree<Principal, ()>(Principal.compare);
  stable var stableOwnersMap = ownersMap.share();

  ignore do ? { ownersMap.put(initialOwner!, ()) };

  type TokenIdx = Nat;

  let assetIdMap = RBTree.RBTree<Nat, TokenIdx>(Nat.compare);
  stable var stableAssetIdMap = assetIdMap.share();

  let keyMap = RBTree.RBTree<Text, TokenIdx>(Text.compare);
  stable var stableKeyMap = keyMap.share();

  let tokens = Vector.Vector<Types.FungibleToken>();
  stable var stableTokens = tokens.share();

  let freezingPeriod = 86_400_000_000_000;

  public query func getFreezingPeriod() : async Nat {
    freezingPeriod;
  };

  public query func getTokens() : async [Types.FungibleToken] {
    Vector.toArray(tokens);
  };

  public query func getTokenByAssetId(assetId : Nat) : async ?Types.FungibleToken {
    Option.map(assetIdMap.get(assetId), tokens.get);
  };

  public query func getTokenBySymbol(symbol : Text) : async ?Types.FungibleToken {
    Option.map(keyMap.get(Text.toUppercase(symbol)), tokens.get);
  };

  public shared ({ caller }) func addOwner(principal : Principal) : async () {
    await* assertOwnerAccess(caller);
    ownersMap.put(principal, ());
  };

  public shared ({ caller }) func removeOwner(principal : Principal) : async () {
    await* assertOwnerAccess(caller);
    ownersMap.delete(principal);
  };

  public shared ({ caller }) func addToken(args : Types.CreateFungibleTokenPayload) : async () {
    let { assetId; symbol; name; logo } = args;
    let key = Text.toUppercase(symbol);

    await* assertOwnerAccess(caller);
    await* assertSymbolLength(symbol);
    await* assertNameLength(name);
    await* assertValidBase64Image(logo);
    await* assertTokenNew(assetId, key);

    let currentTime = Time.now();

    let token : Types.FungibleToken = {
      args with
      createdAt = currentTime;
      modifiedAt = currentTime;
    };

    let tokensSize = tokens.size();
    assetIdMap.put(assetId, tokensSize);
    keyMap.put(key, tokensSize);
    tokens.add(token);
  };

  /// Update symbol by asset id
  public shared ({ caller }) func correctSymbol(assetId : Nat, newSymbol : Text) : async () {
    await* assertOwnerAccess(caller);

    let ?tokenIndex = assetIdMap.get(assetId) else throw Error.reject("Asset id does not exist");

    await* assertSymbolLength(newSymbol);

    let token = tokens.get(tokenIndex);

    await* assertTimeNotExpired(token);

    let prevKey = Text.toUppercase(token.symbol);
    let newKey = Text.toUppercase(newSymbol);

    if (newSymbol == token.symbol) throw Error.reject("New token symbol is the same as the current one");

    if (prevKey != newKey) {
      if (keyMap.get(newKey) != null) throw Error.reject("New token symbol already exists");
      keyMap.delete(prevKey);
      keyMap.put(newKey, tokenIndex);
    };

    let updatedToken : Types.FungibleToken = {
      token with
      symbol = newSymbol;
      modifiedAt = Time.now();
    };

    tokens.put(tokenIndex, updatedToken);
  };

  /// Update asset id by symbol
  public shared ({ caller }) func correctAssetId(symbol : Text, newAssetId : Nat) : async () {
    await* assertOwnerAccess(caller);

    let key = Text.toUppercase(symbol);

    let ?tokenIndex = keyMap.get(key) else throw Error.reject("Symbol does not exist");

    let token = tokens.get(tokenIndex);

    await* assertTimeNotExpired(token);

    if (newAssetId == token.assetId) throw Error.reject("New asset id is the same as the current one");

    if (assetIdMap.get(newAssetId) != null) throw Error.reject("New asset id already exists");

    assetIdMap.delete(token.assetId);
    assetIdMap.put(newAssetId, tokenIndex);

    let updatedToken : Types.FungibleToken = {
      token with
      assetId = newAssetId;
      modifiedAt = Time.now();
    };

    tokens.put(tokenIndex, updatedToken);
  };

  /// Update token info by asset id
  public shared ({ caller }) func updateToken(assetId : Nat, updatePayload : Types.UpdateFungibleTokenPayload) : async () {
    await* assertOwnerAccess(caller);

    // existing token
    let ?tokenIndex = assetIdMap.get(assetId) else throw Error.reject("Asset id does not exist");
    let token = tokens.get(tokenIndex);

    // check update payload
    ignore do ? { await* assertSymbolLength(updatePayload.symbol!) };
    ignore do ? { await* assertNameLength(updatePayload.name!) };
    ignore do ? { await* assertValidBase64Image(updatePayload.logo!) };

    switch (updatePayload.symbol) {
      case (?newSymbol) {
        if (Text.toUppercase(newSymbol) != Text.toUppercase(token.symbol)) {
          return throw Error.reject("Only symbol capitalization can be updated");
        };
      };
      case null {};
    };

    let updatedToken : Types.FungibleToken = {
      token with
      symbol = Option.get(updatePayload.symbol, token.symbol);
      name = Option.get(updatePayload.name, token.name);
      logo = Option.get(updatePayload.logo, token.logo);
      modifiedAt = Time.now();
    };

    tokens.put(tokenIndex, updatedToken);
  };

  // async* required for throw
  func assertOwnerAccess(principal : Principal) : async* () {
    if (ownersMap.get(principal) == null) {
      throw Error.reject("No Access for this principal " # Principal.toText(principal));
    };
  };

  // async* required for throw
  func assertTokenNew(assetId : Nat, key : Text) : async* () {
    if (assetIdMap.get(assetId) != null) throw Error.reject("Asset id already exists");
    if (keyMap.get(key) != null) throw Error.reject("Token symbol already exists");
  };

  // async* required for throw
  func assertTimeNotExpired(token : Types.FungibleToken) : async* () {
    if ((Time.now() - token.createdAt) >= freezingPeriod) {
      throw Error.reject("Time to correct token has expired");
    };
  };

  // async* required for throw
  func assertSymbolLength(symbol : Text) : async* () {
    if (symbol.size() >= 8) {
      throw Error.reject("Token symbol cannot be longer than 8 characters");
    };
  };

  // async* required for throw
  func assertNameLength(name : Text) : async* () {
    if (name.size() >= 64) {
      throw Error.reject("Token name cannot be longer than 64 characters");
    };
  };

  // async* required for throw
  func assertValidBase64Image(base64String : Text) : async* () {
    switch (Base64.validateImage(base64String)) {
      case (#ok()) {};
      case (#err(msg)) { throw Error.reject(msg) };
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
