module {
  // Migration function that explicitly drops stable variables from the previous version.
  type OldActor = {
    googleSearchEngineId : Text;
    googleSearchApiBaseUrl : Text;
  };

  type NewActor = {};

  public func run(old : OldActor) : NewActor {
    {};
  };
};
