module {
  public type FungibleToken = {
    assetId : Nat;
    symbol : Text;
    name : Text;
    logo : Text;
    createdAt : Int;
    modifiedAt : Int;
  };

  public type CreateFungibleTokenPayload = {
    assetId : Nat;
    symbol : Text;
    name : Text;
    logo : Text;
  };

  public type UpdateFungibleTokenPayload = {
    symbol : ?Text;
    name : ?Text;
    logo : ?Text;
  };
};
