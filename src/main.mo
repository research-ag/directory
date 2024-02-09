import Vector "mo:vector/Class";
import RBTree "mo:base/RBTree";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Bool "mo:base/Bool";
import Option "mo:base/Option";
import Error "mo:base/Error";

import Types "./types"

actor class Directory(initial_owner : Principal) {
  private let ownersMap : RBTree.RBTree<Principal, ()> = RBTree.RBTree<Principal, ()>(Principal.compare);
  private stable var stableOwnersMap = ownersMap.share();

  ownersMap.put(initial_owner, ());

  private let assetIdMap : RBTree.RBTree<Nat, Nat> = RBTree.RBTree<Nat, Nat>(Nat.compare);
  private stable var stableAssetIdMap = assetIdMap.share();

  private let keyMap : RBTree.RBTree<Text, Nat> = RBTree.RBTree<Text, Nat>(Text.compare);
  private stable var stableKeyMap = keyMap.share();

  private let tokens : Vector.Vector<Types.FungibleToken> = Vector.Vector<Types.FungibleToken>();
  private stable var stableTokens = tokens.share();

  public query func getTokens() : async [Types.FungibleToken] {
    return Vector.toArray(tokens);
  };

  public query func getTokenByAssetId(assetId : Nat) : async ?Types.FungibleToken {
    return Option.map(assetIdMap.get(assetId), tokens.get);
  };

  public shared ({ caller }) func addOwner(principal : Principal) : async () {
    await* assertOwnerAccess(caller);
    ownersMap.put(principal, ());
  };

  public shared ({ caller }) func removeOwner(principal : Principal) : async () {
    await* assertOwnerAccess(caller);
    ownersMap.delete(principal);
  };

  public shared ({ caller }) func addToken({ assetId; symbol; name; logo } : Types.CreateFungibleTokenPayload) : async () {
    await* assertOwnerAccess(caller);

    await* validateTokenSymbol(symbol);
    await* validateTokenName(name);

    let key = Text.toUppercase(symbol);

    await* assertTokenNew({
      assetId;
      key;
    });

    let token : Types.FungibleToken = {
      assetId;
      symbol;
      name;
      logo;
      createdAt = Time.now();
      modifiedAt = null;
    };

    let tokensSize = tokens.size();
    assetIdMap.put(assetId, tokensSize);
    keyMap.put(key, tokensSize);
    tokens.add(token);
  };

  /// Update symbol by asset id
  public shared ({ caller }) func correctSymbol(assetId : Nat, symbol : Text) : async () {
    await* assertOwnerAccess(caller);

    let ?tokenIndex = assetIdMap.get(assetId) else throw Error.reject("Asset id does not exist");

    await* validateTokenSymbol(symbol);

    let token = tokens.get(tokenIndex);

    await* assertTimeNotExpired(token);

    let prevKey = Text.toUppercase(token.symbol);
    let newKey = Text.toUppercase(symbol);

    if (symbol == token.symbol) throw Error.reject("Token symbol is the same as the current one");

    if (prevKey != newKey) {
      if (keyMap.get(newKey) != null) throw Error.reject("Token symbol already exists");
      keyMap.delete(prevKey);
      keyMap.put(newKey, tokenIndex);
    };

    let updatedToken : Types.FungibleToken = {
      assetId = token.assetId;
      symbol;
      name = token.name;
      logo = token.logo;
      createdAt = token.createdAt;
      modifiedAt = ?Time.now();
    };

    tokens.put(tokenIndex, updatedToken);
  };

  /// Update asset id by symbol
  public shared ({ caller }) func correctAssetId(symbol : Text, assetId : Nat) : async () {
    await* assertOwnerAccess(caller);

    let key = Text.toUppercase(symbol);

    let ?tokenIndex = keyMap.get(key) else throw Error.reject("Symbol does not exist");

    let token = tokens.get(tokenIndex);

    await* assertTimeNotExpired(token);

    if (assetId == token.assetId) throw Error.reject("Asset id is the same as the current one");

    if (assetIdMap.get(assetId) != null) throw Error.reject("Asset id already exists");

    assetIdMap.delete(token.assetId);
    assetIdMap.put(assetId, tokenIndex);

    let updatedToken : Types.FungibleToken = {
      assetId;
      symbol = token.symbol;
      name = token.name;
      logo = token.logo;
      createdAt = token.createdAt;
      modifiedAt = ?Time.now();
    };

    tokens.put(tokenIndex, updatedToken);
  };

  /// Update token info by asset id
  public shared ({ caller }) func updateToken(assetId : Nat, updatePayload : Types.UpdateFungibleTokenPayload) : async () {
    await* assertOwnerAccess(caller);

    let ?tokenIndex = assetIdMap.get(assetId) else throw Error.reject("Asset id does not exist");

    ignore do ? { await* validateTokenSymbol(updatePayload.symbol!) };

    ignore do ? { await* validateTokenName(updatePayload.name!) };

    let token = tokens.get(tokenIndex);

    let symbol = switch (updatePayload.symbol) {
      case null { token.symbol };
      case (?newSymbol) {
        let prevKey = Text.toUppercase(token.symbol);
        let newKey = Text.toUppercase(newSymbol);

        if (newSymbol == token.symbol) {
          throw Error.reject("Token symbol is the same as the current one");

        };

        if (newKey != prevKey) {
          return throw Error.reject("Only symbol capitalization can be changed");
        };

        newSymbol;
      };
    };

    let name = Option.get(updatePayload.name, token.name);

    let logo = Option.get(updatePayload.logo, token.logo);

    let updatedToken : Types.FungibleToken = {
      assetId = token.assetId;
      symbol;
      name;
      logo;
      createdAt = token.createdAt;
      modifiedAt = ?Time.now();
    };

    tokens.put(tokenIndex, updatedToken);
  };

  private func assertOwnerAccess(principal : Principal) : async* () {
    if (ownersMap.get(principal) == null) {
      throw Error.reject("No Access for this principal " # Principal.toText(principal));
    };
  };

  private func assertTokenNew({ assetId; key } : { assetId : Nat; key : Text }) : async* () {
    if (assetIdMap.get(assetId) != null) throw Error.reject("Asset id already exists");
    if (keyMap.get(key) != null) throw Error.reject("Token symbol already exists");
  };

  private func assertTimeNotExpired(token : Types.FungibleToken) : async* () {
    if ((Time.now() - token.createdAt) >= 86_400_000_000_000) {
      throw Error.reject("Time to correct token has expired");
    };
  };

  private func validateTokenSymbol(symbol : Text) : async* () {
    if (symbol.size() >= 64) {
      throw Error.reject("Token symbol must be lower or equal to 64 characters");
    };
  };

  private func validateTokenName(name : Text) : async* () {
    if (name.size() >= 64) {
      throw Error.reject("Token name must be lower or equal to 64 characters");
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
