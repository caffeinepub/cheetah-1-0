import OutCall "http-outcalls/outcall";

actor {
  let googleSearchEngineId = "a566dfe30b89f4713";
  let googleSearchApiBaseUrl = "https://www.googleapis.com/customsearch/v1";

  // Transform callback for HTTP Outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Google Custom Search API integration
  public shared ({ caller }) func proxyGoogleSearch(searchQuery : Text) : async Text {
    let googleSearchUrl = googleSearchApiBaseUrl # "?q=" # searchQuery # "&cx=" # googleSearchEngineId;
    await OutCall.httpGetRequest(googleSearchUrl, [], transform);
  };
};
