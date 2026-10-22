export type UserRole = 'admin' | 'customer' | 'guest';

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  images: string[];
  model3dUrl?: string;
  reelUrl?: string;
  sizes: string[];
  colors: { name: string; hex: string; imageIndex?: number }[];
  stockQuantity: number;
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  rating: number;
  reviewsCount: number;
  tags: string[];
  slug?: string;
  subCategory?: string;
  craft?: string;
  fabric?: string;
  occasion?: string;
  sku?: string;
  sizeChart?: any[];
  seo?: any;
  createdAt?: string;
  details: any;
}

export interface CartItem {
  id?: string;
  product?: Product;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: { name: string; hex: string } | null;
  // Admin dashboard backwards compatibility:
  title?: string;
  image?: string;
  productId?: string;
  size?: string;
  color?: string;
  price?: number;
}

export interface Address {
  id: string;
  fullName: string;
  street: string;
  apartment?: string;
  landmark?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  createdAt?: string;
  shippingAddress: Address;
  trackingNumber?: string;
  trackingLink?: string;
  estimatedDelivery?: string;
  paymentMethod?: string;
}

export interface Customer {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  username?: string;
  joinedDate: string;
  ordersCount: number;
  totalSpent: number;
  tier: 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Premium Member';
  status?: string;
  avatar?: string;
  role?: UserRole;
  addresses?: Address[];
  defaultAddress?: Address;
}

export interface FilterState {
  category: string;
  sizes: string[];
  colors: string[];
  craft?: string[];
  fabric?: string[];
  occasion?: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating';
  inStockOnly: boolean;
  searchQuery: string;
}

export type StoreView = 'home' | 'catalog' | 'product' | 'cart' | 'checkout' | 'account';
export type AdminView = 'analytics' | 'catalog' | 'orders' | 'customers' | 'cms' | 'dashboard';

export type HeroSlide = {
  subtitle?: string;
  description?: string;
  id: string;
  desktopImage: string;
  mobileImage: string;
  title?: string;
  link?: string;
};

export type HomepageConfig = {
  whatsappNumber?: string;
  sectionOrder: string[]; 
  heroSlides?: HeroSlide[];
  hero: {
    desktopImage: string;
    mobileImage: string;
    title?: string;
    subtitle: string;
    description?: string;
  };
  about: {
    image: string;
    title?: string;
    description?: string;
  };
  visibleCategories: string[];
  megaMenuPoster?: {
    image: string;
    title?: string;
    subtitle: string;
  };
};

export interface Category {
  id: string;
  order?: number;
  name: string;
  slug: string;
  tagline: string;
  image: string;
  itemCount: string;
}

export interface Review {
  productId?: string;
  customerName?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  id: string;
  source?: string;
  tag?: string;
  quote?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Hidden';
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  address: string;
  mapLink: string;
  phone: string;
  openTime?: string;
  closeTime?: string;
  inChargeName?: string;
  inChargeNumber?: string;
  isMainBranch?: boolean;
  status?: 'open' | 'closed' | 'holiday';
  workingDays?: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  date: string; createdAt?: string;
}

export interface Announcement {
  id: string;
  text: string;
  type?: string;
  isActive?: boolean;
  code?: string;
  discountPercentage?: number;
  isHidden?: boolean;
}

export interface PromotionSlide {
  desktopImage: string;
  mobileImage: string;
  link?: string;
}

export interface Promotion {
  id: string;
  images?: string[]; // Legacy
  slides?: PromotionSlide[];
  title?: string;
  description?: string;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}



export interface StoreSettings {
  adminName: string;
  adminEmail: string;
  supportWhatsApp: string;
  taxRate: number;
}

export interface ShortReel {
  id: string;
  videoUrl: string;
  order: number;
  thumbnailUrl?: string;
  caption?: string;
  productId?: string;
}
