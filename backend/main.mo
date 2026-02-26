import OutCall "http-outcalls/outcall";

actor {
  // Transform callback for HTTP Outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // No longer Google API specific; acts as a generic HTTP proxy.
  public shared ({ caller }) func proxyUrl(url : Text) : async Text {
    await OutCall.httpGetRequest(url, [], transform);
  };
};
