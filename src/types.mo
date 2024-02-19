module {
  public type FungibleToken = {
    assetId : Nat;
    symbol : Text;
    name : Text;
    logo : Text;
    createdAt : Int;
    modifiedAt : Int;
  };

  public type CreatePayload = {
    assetId : Nat;
    symbol : Text;
    name : Text;
    logo : Text;
  };

  public type UpdatePayload = {
    symbol : ?Text;
    name : ?Text;
    logo : ?Text;
  };
};
