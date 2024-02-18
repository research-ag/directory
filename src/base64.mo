import Result "mo:base/Result";
import Text "mo:base/Text";

module {
  public func validateImage(base64String : Text) : Result.Result<(), Text> {
    let pngPrefix = "data:image/png;base64,";
    let svgPrefix = "data:image/svg+xml;base64,";
    let jpegPrefix = "data:image/jpeg;base64,";

    let prefixes : [Text] = [pngPrefix, svgPrefix, jpegPrefix];

    for (prefix in prefixes.vals()) {
      if (Text.startsWith(base64String, #text(prefix))) {
        let imageData = Text.stripStart(base64String, #text(prefix));

        switch (imageData) {
          case (null) {
            return #err("Token logo image is corrupted");
          };
          case (?data) {
            if (Text.size(data) > 0) {
              let encodedSize = Text.size(data);
              let decodedSize = (encodedSize * 3) / 4;

              if (decodedSize > 32_000) {
                return #err("Token logo image must be no larger than 32 kB");
              };

              if (Text.contains(data, #predicate(notBase64Char))) {
                return #err("Token logo image is corrupted");
              };

              return #ok();
            };
          };
        };

      };
    };

    return #err("Token logo image must be passed in base64 format");
  };

  func isBase64Char(char : Char) : Bool {
    (char >= 'A' and char <= 'Z') or (char >= 'a' and char <= 'z') or (char >= '0' and char <= '9') or char == '+' or char == '/' or char == '=';
  };

  func notBase64Char(char : Char) : Bool {
    not isBase64Char(char);
  };
};
