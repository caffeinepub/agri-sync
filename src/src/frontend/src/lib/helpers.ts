import { ProductCategory, ProductUnit, OrderStatus, UserRole } from '../backend';

// Category helpers - use translation keys
export const CATEGORY_TRANSLATION_KEYS: Record<ProductCategory, string> = {
  [ProductCategory.fruits]: 'categories.fruits',
  [ProductCategory.vegetables]: 'categories.vegetables',
  [ProductCategory.grains]: 'categories.grains',
  [ProductCategory.dairy]: 'categories.dairy',
  [ProductCategory.organicFood]: 'categories.organicFood',
  [ProductCategory.others]: 'categories.others',
};

// Backward compatibility - English labels
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  [ProductCategory.fruits]: 'Fruits',
  [ProductCategory.vegetables]: 'Vegetables',
  [ProductCategory.grains]: 'Grains',
  [ProductCategory.dairy]: 'Dairy',
  [ProductCategory.organicFood]: 'Organic Food',
  [ProductCategory.others]: 'Others',
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  [ProductCategory.fruits]: '🍎',
  [ProductCategory.vegetables]: '🥬',
  [ProductCategory.grains]: '🌾',
  [ProductCategory.dairy]: '🥛',
  [ProductCategory.organicFood]: '🌱',
  [ProductCategory.others]: '📦',
};

// Unit helpers
export const UNIT_LABELS: Record<ProductUnit, string> = {
  [ProductUnit.kg]: 'kg',
  [ProductUnit.liters]: 'L',
  [ProductUnit.pieces]: 'pcs',
};

// Order status helpers
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: 'Pending',
  [OrderStatus.accepted]: 'Accepted',
  [OrderStatus.fulfilled]: 'Fulfilled',
  [OrderStatus.delivered]: 'Delivered',
  [OrderStatus.cancelled]: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: 'bg-accent text-accent-foreground',
  [OrderStatus.accepted]: 'bg-secondary text-secondary-foreground',
  [OrderStatus.fulfilled]: 'bg-primary text-primary-foreground',
  [OrderStatus.delivered]: 'bg-success text-success-foreground',
  [OrderStatus.cancelled]: 'bg-destructive text-destructive-foreground',
};

// Role helpers
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.farmer]: 'Farmer',
  [UserRole.homeBuyer]: 'Home Buyer',
  [UserRole.businessBuyer]: 'Business Buyer',
  [UserRole.admin]: 'Admin',
};

// Format price
export function formatPrice(price: number): string {
  return `₹${price.toFixed(2)}`;
}

// Format date
export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000); // nanoseconds to milliseconds
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format relative time
export function formatRelativeTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
}

// Convert image blob to URL
export async function convertBlobToURL(blob: any): Promise<string> {
  if (!blob) return '';
  
  try {
    // If it's an ExternalBlob, use getDirectURL
    if (blob.getDirectURL) {
      return blob.getDirectURL();
    }
    
    // Fallback: convert bytes to blob URL
    const bytes = await blob.getBytes();
    const imageBlob = new Blob([bytes], { type: 'image/jpeg' });
    return URL.createObjectURL(imageBlob);
  } catch (error) {
    console.error('Error converting blob:', error);
    return '';
  }
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
