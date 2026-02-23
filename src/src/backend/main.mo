import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Set "mo:core/Set";
import Blob "mo:core/Blob";
import List "mo:core/List";
import Option "mo:core/Option";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import ExternalBlob "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  // Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // DATA MODEL
  // User Types
  public type UserRole = {
    #admin;
    #farmer;
    #homeBuyer;
    #businessBuyer;
  };

  public type UserProfile = {
    name : Text;
    contact : Text;
    location : Text;
    role : UserRole;
    createdAt : Time.Time;
  };

  // Product Types
  public type ProductCategory = {
    #fruits;
    #vegetables;
    #grains;
    #organicFood;
    #dairy;
    #others;
  };

  public type ProductUnit = {
    #kg;
    #liters;
    #pieces;
  };

  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    category : ProductCategory;
    price : Float;
    quantity : Nat;
    unit : ProductUnit;
    organic : Bool;
    farmer : Principal;
    imageBlob : ?ExternalBlob.ExternalBlob;
    createdAt : Time.Time;
    available : Bool;
  };

  // Order Types
  public type OrderStatus = {
    #pending;
    #accepted;
    #fulfilled;
    #delivered;
    #cancelled;
  };

  public type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Float;
  };

  public type Order = {
    id : Nat;
    buyer : Principal;
    items : [OrderItem];
    totalAmount : Float;
    status : OrderStatus;
    createdAt : Time.Time;
    farmer : Principal;
  };

  // Analytics Types
  public type PlatformAnalytics = {
    totalUsers : Nat;
    totalFarmers : Nat;
    totalHomeBuyers : Nat;
    totalBusinessBuyers : Nat;
    totalProducts : Nat;
    totalOrders : Nat;
    totalRevenue : Float;
  };

  // Storage
  var nextProductId = 1;
  var nextOrderId = 1;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();

  // MODULES
  // User Module
  module UserProfile {
    public func compare(user1 : UserProfile, user2 : UserProfile) : Order.Order {
      Text.compare(user1.name, user2.name);
    };
  };

  // Product Module
  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      switch (Text.compare(product1.name, product2.name)) {
        case (#equal) {
          switch (Text.compare(product1.description, product2.description)) {
            case (#equal) { Float.compare(product1.price, product2.price) };
            case (result) { result };
          };
        };
        case (result) { result };
      };
    };
  };

  // Helper function to check if user is a farmer
  func isFarmer(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.role == #farmer };
    };
  };

  // Helper function to check if user is a buyer
  func isBuyer(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        profile.role == #homeBuyer or profile.role == #businessBuyer
      };
    };
  };

  func calculateTotalAmount(items : [OrderItem]) : Float {
    var total : Float = 0;
    for (item in items.values()) {
      total += item.price * item.quantity.toFloat(); // Inline float conversion
    };
    total;
  };

  // API FUNCTIONS
  // User Management - Required by frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or be admin");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  // User Management - Application specific
  public shared ({ caller }) func createProfile(name : Text, contact : Text, location : Text, role : UserRole) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    let profile : UserProfile = {
      name;
      contact;
      location;
      role;
      createdAt = Time.now();
    };

    userProfiles.add(caller, profile);
    profile;
  };

  public query ({ caller }) func getProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Admin: Get all users
  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.values().toArray();
  };

  // Product Management
  public shared ({ caller }) func createProduct(name : Text, description : Text, category : ProductCategory, price : Float, quantity : Nat, unit : ProductUnit, organic : Bool, image : ?ExternalBlob.ExternalBlob) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create products");
    };

    let farmerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Farmer profile does not exist") };
      case (?profile) { profile };
    };

    if (farmerProfile.role != #farmer) {
      Runtime.trap("Unauthorized: Only farmers can create products");
    };

    let product : Product = {
      id = nextProductId;
      name;
      description;
      category;
      price;
      quantity;
      unit;
      organic;
      farmer = caller;
      imageBlob = image;
      createdAt = Time.now();
      available = quantity > 0;
    };

    products.add(nextProductId, product);
    nextProductId += 1;
    product;
  };

  public shared ({ caller }) func updateProduct(productId : Nat, name : Text, description : Text, category : ProductCategory, price : Float, quantity : Nat, unit : ProductUnit, organic : Bool, image : ?ExternalBlob.ExternalBlob) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update products");
    };

    let existingProduct = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };

    if (existingProduct.farmer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the product owner or admin can update this product");
    };

    let updatedProduct = {
      existingProduct with
      name;
      description;
      category;
      price;
      quantity;
      unit;
      organic;
      imageBlob = image;
      available = quantity > 0;
    };

    products.add(productId, updatedProduct);
    updatedProduct;
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete products");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?p) { p };
    };

    if (product.farmer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the product owner or admin can delete this product");
    };

    products.remove(productId);
    product;
  };

  // Public query - anyone can view products
  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    products.get(productId);
  };

  // Public query - anyone can view all products
  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Public query - anyone can filter by farmer
  public query ({ caller }) func getProductsByFarmer(farmer : Principal) : async [Product] {
    let filtered = products.values().filter(
      func(product) {
        product.farmer == farmer;
      }
    );
    filtered.toArray();
  };

  // Public query - anyone can filter by category
  public query ({ caller }) func getProductsByCategory(category : ProductCategory) : async [Product] {
    let filtered = products.values().filter(
      func(product) {
        product.category == category;
      }
    );
    filtered.toArray();
  };

  // Admin: Moderate products
  public shared ({ caller }) func moderateProduct(productId : Nat, available : Bool) : async Product {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can moderate products");
    };

    let existingProduct = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };

    let updatedProduct = {
      existingProduct with available;
    };

    products.add(productId, updatedProduct);
    updatedProduct;
  };

  // Order Management
  public shared ({ caller }) func placeOrder(items : [OrderItem], farmer : Principal) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let buyerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Buyer profile does not exist") };
      case (?profile) { profile };
    };

    if (buyerProfile.role != #homeBuyer and buyerProfile.role != #businessBuyer) {
      Runtime.trap("Unauthorized: Only buyers can place orders");
    };

    let totalAmount = calculateTotalAmount(items);

    let order : Order = {
      id = nextOrderId;
      buyer = caller;
      items;
      totalAmount;
      status = #pending;
      createdAt = Time.now();
      farmer;
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order;
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update order status");
    };

    let existingOrder = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) { order };
    };

    let userProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };

    // Buyers can only cancel their own orders
    if (userProfile.role == #homeBuyer or userProfile.role == #businessBuyer) {
      if (existingOrder.buyer != caller) {
        Runtime.trap("Unauthorized: You can only update your own orders");
      };
      if (status != #cancelled) {
        Runtime.trap("Unauthorized: Buyers can only cancel orders");
      };
    };

    // Farmers can only update orders for their products
    if (userProfile.role == #farmer) {
      if (existingOrder.farmer != caller) {
        Runtime.trap("Unauthorized: You can only update orders for your products");
      };
    };

    let updatedOrder = {
      existingOrder with status;
    };
    orders.add(orderId, updatedOrder);
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let order = orders.get(orderId);

    switch (order) {
      case (null) { null };
      case (?o) {
        // Users can only view their own orders (as buyer or farmer) unless admin
        if (o.buyer != caller and o.farmer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getUserOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let filtered = orders.values().filter(
      func(order) {
        order.buyer == caller;
      }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getFarmerOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let userProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };

    if (userProfile.role != #farmer) {
      Runtime.trap("Unauthorized: Only farmers can view farmer orders");
    };

    let filtered = orders.values().filter(
      func(order) {
        order.farmer == caller;
      }
    );
    filtered.toArray();
  };

  // Admin: View all orders
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Admin: Platform Analytics
  public query ({ caller }) func getPlatformAnalytics() : async PlatformAnalytics {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view platform analytics");
    };

    var totalFarmers = 0;
    var totalHomeBuyers = 0;
    var totalBusinessBuyers = 0;
    var totalRevenue : Float = 0;

    for (profile in userProfiles.values()) {
      switch (profile.role) {
        case (#farmer) { totalFarmers += 1 };
        case (#homeBuyer) { totalHomeBuyers += 1 };
        case (#businessBuyer) { totalBusinessBuyers += 1 };
        case (#admin) { };
      };
    };

    for (order in orders.values()) {
      if (order.status == #delivered) {
        totalRevenue += order.totalAmount;
      };
    };

    {
      totalUsers = userProfiles.size();
      totalFarmers;
      totalHomeBuyers;
      totalBusinessBuyers;
      totalProducts = products.size();
      totalOrders = orders.size();
      totalRevenue;
    };
  };

  // Admin: Delete user account
  public shared ({ caller }) func deleteUserAccount(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete user accounts");
    };
    userProfiles.remove(user);
  };
};
