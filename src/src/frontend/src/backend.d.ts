import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface PlatformAnalytics {
    totalProducts: bigint;
    totalOrders: bigint;
    totalHomeBuyers: bigint;
    totalBusinessBuyers: bigint;
    totalUsers: bigint;
    totalRevenue: number;
    totalFarmers: bigint;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    price: number;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    createdAt: Time;
    totalAmount: number;
    buyer: Principal;
    items: Array<OrderItem>;
    farmer: Principal;
}
export interface Product {
    id: bigint;
    imageBlob?: ExternalBlob;
    organic: boolean;
    name: string;
    createdAt: Time;
    unit: ProductUnit;
    description: string;
    available: boolean;
    quantity: bigint;
    category: ProductCategory;
    price: number;
    farmer: Principal;
}
export interface UserProfile {
    contact: string;
    name: string;
    createdAt: Time;
    role: UserRole;
    location: string;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    fulfilled = "fulfilled",
    delivered = "delivered",
    accepted = "accepted"
}
export enum ProductCategory {
    grains = "grains",
    organicFood = "organicFood",
    others = "others",
    fruits = "fruits",
    vegetables = "vegetables",
    dairy = "dairy"
}
export enum ProductUnit {
    kg = "kg",
    pieces = "pieces",
    liters = "liters"
}
export enum UserRole {
    admin = "admin",
    businessBuyer = "businessBuyer",
    homeBuyer = "homeBuyer",
    farmer = "farmer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createProduct(name: string, description: string, category: ProductCategory, price: number, quantity: bigint, unit: ProductUnit, organic: boolean, image: ExternalBlob | null): Promise<Product>;
    createProfile(name: string, contact: string, location: string, role: UserRole): Promise<UserProfile>;
    deleteProduct(productId: bigint): Promise<Product>;
    deleteUserAccount(user: Principal): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getFarmerOrders(): Promise<Array<Order>>;
    getOrder(orderId: bigint): Promise<Order | null>;
    getPlatformAnalytics(): Promise<PlatformAnalytics>;
    getProduct(productId: bigint): Promise<Product | null>;
    getProductsByCategory(category: ProductCategory): Promise<Array<Product>>;
    getProductsByFarmer(farmer: Principal): Promise<Array<Product>>;
    getProfile(): Promise<UserProfile | null>;
    getUserOrders(): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    moderateProduct(productId: bigint, available: boolean): Promise<Product>;
    placeOrder(items: Array<OrderItem>, farmer: Principal): Promise<Order>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
    updateProduct(productId: bigint, name: string, description: string, category: ProductCategory, price: number, quantity: bigint, unit: ProductUnit, organic: boolean, image: ExternalBlob | null): Promise<Product>;
}
