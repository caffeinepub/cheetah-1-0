import OutCall "http-outcalls/outcall";
import Text "mo:core/Text";
import Array "mo:core/Array";



actor {
  let googleSearchEngineId = "a566dfe30b89f4713";
  let googleSearchApiBaseUrl = "https://www.googleapis.com/customsearch/v1";

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    // Apply secure and neutral headers
    let originalOutput = OutCall.transform(input);

    // Replace custom headers with generic ones
    let filteredHeaders = originalOutput.headers.filter(
      func(header) {
        not header.name.contains(#text "X-Cheetah-");
      }
    );

    // Create a new output record with the updated headers
    {
      originalOutput with
      headers = filteredHeaders.concat([{
        name = "Content-Security-Policy";
        value = "default-src 'self'; frame-ancestors 'none'; script-src 'none'; object-src 'none'";
      }]);
    };
  };

  func enforceHttpsScheme(url : Text) : Text {
    let lowerUrl = url.toLower();
    if (lowerUrl.contains(#text "://")) {
      if (lowerUrl.startsWith(#text "http://")) {
        url.replace(#text "http", "https");
      } else {
        url;
      };
    } else {
      let httpsUrl = "https://" # url;
      httpsUrl;
    };
  };

  public shared ({ caller }) func proxyRequest(endpoint : Text) : async Text {
    let secureEndpoint = enforceHttpsScheme(endpoint);
    await OutCall.httpGetRequest(secureEndpoint, [], transform);
  };

  public shared ({ caller }) func searchRequest(searchQuery : Text) : async Text {
    let googleSearchURL = googleSearchApiBaseUrl # "?q=" # searchQuery # "&cx=" # googleSearchEngineId;
    await OutCall.httpGetRequest(googleSearchURL, [], transform);
  };
};
