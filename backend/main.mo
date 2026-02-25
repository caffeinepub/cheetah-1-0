import OutCall "http-outcalls/outcall";
import Text "mo:core/Text";

actor {
  let googleSearchEngineId = "a566dfe30b89f4713";
  let googleSearchApiBaseUrl = "https://www.googleapis.com/customsearch/v1";

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
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
    let googleSearchURL = googleSearchApiBaseUrl
      # "?q="
      # searchQuery
      # "&cx="
      # googleSearchEngineId;

    await OutCall.httpGetRequest(googleSearchURL, [], transform);
  };
};
