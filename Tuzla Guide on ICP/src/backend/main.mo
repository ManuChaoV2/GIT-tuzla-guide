import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";

actor TuzlaGuide {
  
  // Types
  type UserId = Principal;
  type AttractionId = Nat;
  type ReviewId = Nat;
  type PaymentId = Text;
  
  type Location = {
    latitude : Float;
    longitude : Float;
  };
  
  type Attraction = {
    id : AttractionId;
    name : Text;
    description : Text;
    location : Location;
    category : Text; // "museum", "restaurant", "park", "historical", etc.
    imageUrl : Text;
    audioUrl : Text;
    rating : Float;
    price : Nat; // in cents
    languages : [Text];
    tags : [Text];
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };
  
  type Review = {
    id : ReviewId;
    attractionId : AttractionId;
    userId : UserId;
    rating : Nat; // 1-5
    comment : Text;
    photos : [Text];
    createdAt : Time.Time;
  };
  
  type UserProfile = {
    id : UserId;
    username : Text;
    email : Text;
    preferredLanguage : Text;
    visitedAttractions : [AttractionId];
    favoriteAttractions : [AttractionId];
    totalSpent : Nat; // in cents
    createdAt : Time.Time;
  };
  
  type PaymentTransaction = {
    id : PaymentId;
    userId : UserId;
    attractionId : AttractionId;
    amount : Nat; // in cents
    currency : Text;
    paymentMethod : Text; // "icp", "ckbtc", "crypto", "fiat"
    status : Text; // "pending", "completed", "failed"
    qrCodeData : Text;
    createdAt : Time.Time;
  };
  
  // State
  private var attractions : Trie.Trie<AttractionId, Attraction> = Trie.empty();
  private var reviews : Trie.Trie<ReviewId, Review> = Trie.empty();
  private var users : Trie.Trie<UserId, UserProfile> = Trie.empty();
  private var payments : Trie.Trie<PaymentId, PaymentTransaction> = Trie.empty();
  
  private var nextAttractionId : AttractionId = 0;
  private var nextReviewId : ReviewId = 0;
  
  // Initialize with sample data
  private func initSampleData() : () {
    let sampleAttractions = [
      {
        id = 0;
        name = "Panonsko Jezero";
        description = "The famous salt lake in the heart of Tuzla, perfect for swimming and relaxation.";
        location = { latitude = 44.5387; longitude = 18.6766 };
        category = "natural";
        imageUrl = "/images/panonsko-jezero.jpg";
        audioUrl = "/audio/panonsko-jezero-guide.mp3";
        rating = 4.8;
        price = 500; // 5 EUR
        languages = ["en", "bs", "de"];
        tags = ["lake", "swimming", "salt-water", "family"];
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = 1;
        name = "Gradska Tržnica Tuzla";
        description = "Historic city market offering local produce and traditional crafts.";
        location = { latitude = 44.5417; longitude = 18.6739 };
        category = "historical";
        imageUrl = "/images/trznica.jpg";
        audioUrl = "/audio/trznica-guide.mp3";
        rating = 4.5;
        price = 0; // Free
        languages = ["en", "bs", "de", "hr"];
        tags = ["market", "shopping", "local", "historical"];
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = 2;
        name = "Muzej Soli Tuzla";
        description = "Salt Museum showcasing Tuzla's rich salt mining history.";
        location = { latitude = 44.5400; longitude = 18.6750 };
        category = "museum";
        imageUrl = "/images/muzej-soli.jpg";
        audioUrl = "/audio/muzej-soli-guide.mp3";
        rating = 4.7;
        price = 300; // 3 EUR
        languages = ["en", "bs", "de", "hr", "sr"];
        tags = ["museum", "history", "salt", "educational"];
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = 3;
        name = "Kapija Graduša";
        description = "Historic gate and cultural landmark in the old town.";
        location = { latitude = 44.5420; longitude = 18.6720 };
        category = "historical";
        imageUrl = "/images/kapija-gradusa.jpg";
        audioUrl = "/audio/kapija-gradusa-guide.mp3";
        rating = 4.3;
        price = 0; // Free
        languages = ["en", "bs", "de"];
        tags = ["historical", "gate", "architecture", "photo-spot"];
        createdAt = Time.now();
        updatedAt = Time.now();
      },
      {
        id = 4;
        name = "Restoran Dvorište";
        description = "Traditional Bosnian restaurant with authentic local cuisine.";
        location = { latitude = 44.5395; longitude = 18.6745 };
        category = "restaurant";
        imageUrl = "/images/dvoriste.jpg";
        audioUrl = "/audio/dvoriste-guide.mp3";
        rating = 4.6;
        price = 2500; // 25 EUR average meal
        languages = ["en", "bs", "de", "hr"];
        tags = ["restaurant", "traditional", "bosnian", "dining"];
        createdAt = Time.now();
        updatedAt = Time.now();
      }
    ];
    
    for (attraction in sampleAttractions.vals()) {
      attractions := Trie.put(attractions, attraction.id, Nat.equal, attraction).0;
      nextAttractionId := nextAttractionId + 1;
    };
  };
  
  system func preupgrade() {
    Debug.print("Pre-upgrade hook executed");
  };
  
  system func postupgrade() {
    initSampleData();
    Debug.print("Post-upgrade hook executed - Sample data initialized");
  };
  
  // Public functions
  
  // Get all attractions
  public query func getAttractions() : async [Attraction] {
    var result = List.nil<Attraction>();
    for ((id, attraction) in Trie.iter(attractions)) {
      result := List.push(attraction, result);
    };
    List.toArray(result);
  };
  
  // Get attraction by ID
  public query func getAttraction(id : AttractionId) : async ?Attraction {
    Trie.get(attractions, id, Nat.equal);
  };
  
  // Search attractions
  public query func searchAttractions(query : Text, category : ?Text, language : ?Text) : async [Attraction] {
    var results = List.nil<Attraction>();
    let lowerQuery = Text.toLowerCase(query);
    
    for ((id, attraction) in Trie.iter(attractions)) {
      var matches = true;
      
      // Search in name and description
      if (not (Text.contains(Text.toLowerCase(attraction.name), #text lowerQuery) or 
               Text.contains(Text.toLowerCase(attraction.description), #text lowerQuery) or
               List.some<Text>(List.fromArray(attraction.tags), func(tag) { 
                 Text.contains(Text.toLowerCase(tag), #text lowerQuery) 
               }))) {
        matches := false;
      };
      
      // Filter by category
      switch (category) {
        case (?cat) {
          if (attraction.category != cat) {
            matches := false;
          };
        };
        case null {};
      };
      
      // Filter by language
      switch (language) {
        case (?lang) {
          if (not List.some<Text>(List.fromArray(attraction.languages), func(l) { l == lang })) {
            matches := false;
          };
        };
        case null {};
      };
      
      if (matches) {
        results := List.push(attraction, results);
      };
    };
    List.toArray(results);
  };
  
  // Get reviews for an attraction
  public query func getReviews(attractionId : AttractionId) : async [Review] {
    var result = List.nil<Review>();
    for ((id, review) in Trie.iter(reviews)) {
      if (review.attractionId == attractionId) {
        result := List.push(review, result);
      };
    };
    List.toArray(result);
  };
  
  // Add review
  public func addReview(attractionId : AttractionId, rating : Nat, comment : Text, photos : [Text]) : async Result.Result<ReviewId, Text> {
    let userId = Principal.fromActor(this);
    
    // Validate rating
    if (rating < 1 or rating > 5) {
      return #err("Rating must be between 1 and 5");
    };
    
    // Check if attraction exists
    switch (Trie.get(attractions, attractionId, Nat.equal)) {
      case null {
        return #err("Attraction not found");
      };
      case (?attraction) {
        let reviewId = nextReviewId;
        nextReviewId := nextReviewId + 1;
        
        let review = {
          id = reviewId;
          attractionId = attractionId;
          userId = userId;
          rating = rating;
          comment = comment;
          photos = photos;
          createdAt = Time.now();
        };
        
        reviews := Trie.put(reviews, reviewId, Nat.equal, review).0;
        
        // Update attraction rating
        let allReviews = getReviewsInternal(attractionId);
        let totalRating = List.foldl<Review, Nat>(allReviews, 0, func(acc, r) { acc + r.rating });
        let newRating = Float.fromInt(totalRating) / Float.fromInt(List.size(allReviews));
        
        let updatedAttraction = {
          attraction with
          rating = newRating;
          updatedAt = Time.now();
        };
        attractions := Trie.put(attractions, attractionId, Nat.equal, updatedAttraction).0;
        
        return #ok(reviewId);
      };
    };
  };
  
  // Create payment transaction
  public func createPayment(attractionId : AttractionId, amount : Nat, currency : Text, paymentMethod : Text) : async Result.Result<PaymentTransaction, Text> {
    let userId = Principal.fromActor(this);
    
    // Check if attraction exists
    switch (Trie.get(attractions, attractionId, Nat.equal)) {
      case null {
        return #err("Attraction not found");
      };
      case (?attraction) {
        let paymentId = generatePaymentId();
        
        // Generate QR code data for off-chain payment
        let qrCodeData = generateQRCodeData(attraction.name, amount, currency);
        
        let payment = {
          id = paymentId;
          userId = userId;
          attractionId = attractionId;
          amount = amount;
          currency = currency;
          paymentMethod = paymentMethod;
          status = "pending";
          qrCodeData = qrCodeData;
          createdAt = Time.now();
        };
        
        payments := Trie.put(payments, paymentId, Text.equal, payment).0;
        
        return #ok(payment);
      };
    };
  };
  
  // Update payment status
  public func updatePaymentStatus(paymentId : PaymentId, status : Text) : async Result.Result<(), Text> {
    switch (Trie.get(payments, paymentId, Text.equal)) {
      case null {
        return #err("Payment not found");
      };
      case (?payment) {
        let updatedPayment = { payment with status = status };
        payments := Trie.put(payments, paymentId, Text.equal, updatedPayment).0;
        return #ok(());
      };
    };
  };
  
  // Get user profile
  public query func getUserProfile() : async ?UserProfile {
    let userId = Principal.fromActor(this);
    Trie.get(users, userId, Principal.equal);
  };
  
  // Create or update user profile
  public func updateUserProfile(username : Text, email : Text, preferredLanguage : Text) : async () {
    let userId = Principal.fromActor(this);
    let now = Time.now();
    
    let profile = switch (Trie.get(users, userId, Principal.equal)) {
      case null {
        {
          id = userId;
          username = username;
          email = email;
          preferredLanguage = preferredLanguage;
          visitedAttractions = [];
          favoriteAttractions = [];
          totalSpent = 0;
          createdAt = now;
        };
      };
      case (?existing) {
        {
          existing with
          username = username;
          email = email;
          preferredLanguage = preferredLanguage;
        };
      };
    };
    
    users := Trie.put(users, userId, Principal.equal, profile).0;
  };
  
  // Helper functions
  private func getReviewsInternal(attractionId : AttractionId) : List.List<Review> {
    var result = List.nil<Review>();
    for ((id, review) in Trie.iter(reviews)) {
      if (review.attractionId == attractionId) {
        result := List.push(review, result);
      };
    };
    result;
  };
  
  private func generatePaymentId() : PaymentId {
    let timestamp = Time.now();
    let random = Int.abs(Time.now() % 10000);
    Text.concat("tx_", Text.concat(Nat.toText(timestamp), Nat.toText(random)));
  };
  
  private func generateQRCodeData(attractionName : Text, amount : Nat, currency : Text) : Text {
    // Generate QR code data for NowPayments API
    let description = Text.concat("Tuzla Guide - ", attractionName);
    let amountText = Nat.toText(amount);
    
    // This would be integrated with NowPayments API in production
    // For now, return a mock QR code data string
    Text.concat("nowpayments:", Text.concat(amountText, Text.concat("-", currency)));
  };
  
  // Initialize on first deployment
  init {
    initSampleData();
    Debug.print("Tuzla Guide backend initialized with sample data");
  };
};