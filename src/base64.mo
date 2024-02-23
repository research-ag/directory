import Array "mo:base/Array";
import Result "mo:base/Result";
import Text "mo:base/Text";

module {
  public func validateImage(imageStr : Text) : Result.Result<(), Text> {
    let ?data = do ? {
      Array.find<Text>(
        [
          "data:image/png;base64,",
          "data:image/svg+xml;base64,",
          "data:image/jpeg;base64,",
        ],
        func(x) = Text.startsWith(imageStr, #text x),
      )!
      |> Text.stripStart(imageStr, #text _)!;
    } else return #err("Logo image must be in PNG, JPEG, or SVG format");

    let byteSize = (Text.size(data) * 3) / 4;
    if (byteSize > 32_768) {
      return #err("Logo image must be no larger than 32 kB");
    };

    if (Text.contains(data, #predicate isNotBase64)) {
      return #err("Logo image is corrupted");
    };

    return #ok;
  };

  func isBase64(c : Char) : Bool {
    (c >= 'A' and c <= 'Z') or (c >= 'a' and c <= 'z') or (c >= '0' and c <= '9') or c == '+' or c == '/' or c == '=';
  };

  func isNotBase64(c : Char) : Bool {
    c > 'z' or (c < 'a' and c > 'Z') or (c < 'A' and c > '9' and c != '=') or (c < '/' and c != '+');
  };
};
