import { DEFAULT_SHIPPING_RATES } from '../data/indianLocations';
import { broadcastPush } from '../lib/pushClient';
import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';

import { useRouter, usePathname } from 'next/navigation';
import { 
  Product, 
  CartItem, 
  Customer, 
  Order, 
  Address, 
  FilterState, 
  StoreView, 
  AdminView, 
  UserRole,
  HomepageConfig,
  Category,
  Review, Branch, Article, Announcement, Promotion, ActivityLog, StoreSettings, ShortReel 
} from '../types';
import { initialProducts, initialOrders, initialCustomers, categoriesData, initialAddress,
  initialHomepageConfig } from '../data/mockData';
import { 
  auth, 
  database, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  ref, 
  set, 
  get, 
  child,
  onValue,
  update
} from '../lib/firebase';
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signInAnonymously, User as FirebaseUser } from 'firebase/auth';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // relative to INR (base = 1)
  name: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', rate: 1, name: 'Indian Rupee (INR)'}
};

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

const initialAdminSidebarTabs = ['dashboard', 'orders', 'products', 'offers', 'categories', 'customers', 'reviews', 'branches', 'announcements', 'shipping', 'cms', 'settings', 'logs'];

interface StoreContextType {
  // Navigation & UI state
  activeAccountTab: "profile" | "orders" | "addresses" | "wishlist" | "cart";
  setActiveAccountTab: (tab: "profile" | "orders" | "addresses" | "wishlist" | "cart") => void;
  adminActiveTab: AdminView;
  setAdminActiveTab: (tab: AdminView) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  guestPromptOpen: boolean;
  setGuestPromptOpen: (open: boolean) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  sizeChartOpen: boolean;
  setSizeChartOpen: (open: boolean) => void;
  
  // Catalog State
  products: Product[];
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilter: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Cart State (Optimistic & Persistent)
  cart: CartItem[];
  addToCart: (product: Product, selectedSize?: string, selectedColor?: { name: string; hex: string} | null, quantity?: number, openDrawer?: boolean) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartShipping: number;
  cartTax: number;
  cartDiscount: number;
  cartTotal: number;
  discountRate: number;
  checkoutSessionCart: CartItem[] | null;
  setCheckoutSessionCart: (cart: CartItem[] | null) => void;
  appliedPromoCode: string | null;
  applyPromoCode: (code: string) => boolean;

  // Wishlist State (Optimistic)
  wishlist: string[]; // array of product ids
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Auth & Profile State
  currentUser: Customer | null;
  firebaseUser: FirebaseUser | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  signupWithEmail: (name: string, email: string, password?: string, username?: string, phone?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<{ success: boolean; needsOnboarding: boolean }>;
  logout: () => void;
  switchUserRole: () => void;
  updateUserProfile: (updated: Partial<Customer>) => void;
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Orders State
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderTrackingLink: (id: string, link: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Customers State (Admin)
  customers: Customer[];



  // Reels / Shorts
  shortReels: ShortReel[];
  addShortReel: (reel: ShortReel) => void;
  deleteShortReel: (id: string) => void;
  updateShortReelsOrder: (reels: ShortReel[]) => void;

  // System Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;

  // Toast Notifications
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Currency
  currency: CurrencyConfig;
  setCurrencyCode: (code: string) => void;
  formatPrice: (amountInINR: number) => string;
  homepageConfig: HomepageConfig | null;
  updateHomepageConfig: (config: HomepageConfig) => void;
  categories: Category[];
  addCategory: (cat: Category) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  reviews: Review[];
  addReview: (r: Review) => void;
  updateReview: (r: Review) => void;
  deleteReview: (id: string) => void;
  branches: Branch[];
  addBranch: (b: Branch) => void;
  updateBranch: (b: Branch) => void;
  deleteBranch: (id: string) => void;

  articles: Article[];
  addArticle: (a: Article) => void;
  updateArticle: (a: Article) => void;
  deleteArticle: (id: string) => void;

  announcements: Announcement[];
  addAnnouncement: (a: Announcement) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  setBranchesList: (branches: Branch[]) => void;
  setAnnouncementsList: (announcements: Announcement[]) => void;

  promotion: Promotion | null;
  updatePromotion: (p: Promotion) => void;
  // added sidebar tabs
  adminSidebarTabs: string[];
  setAdminSidebarTabs: (tabs: string[]) => void;

  activityLogs: ActivityLog[];
  backedUpLogs: ActivityLog[];
  clearActivityLogs: () => void;
  logActivity: (action: string, details: string) => void;
  shippingOrigin: string;
  setShippingOrigin: (origin: string) => void;
  shippingRates: Record<string, Record<string, number>>;
  updateShippingRate: (state: string, district: string, amount: number | null) => void;




}

const defaultFilter: FilterState = {
  category: 'All',
  sizes: [],
  colors: [],
  minPrice: 0,
  maxPrice: 30000,
  sortBy: 'featured',
  inStockOnly: false,
  searchQuery: ''
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);


const initialReviewsData: Review[] = [
  { id: 'rev-1', source: "Vogue India", tag: "Festive Haute Edit", quote: "DOOZY redefines how the modern woman wears Indian ethnic couture—sharp, uncompromisingly luxurious, and breathable.", status: 'Accepted' },
  { id: 'rev-2', source: "Harper's Bazaar Bride", tag: "Couture Excellence Awards", quote: "The Royal Burgundy Chanderi suit sets are breathtaking heirlooms that honor Varanasi and Lucknow artisans with majestic contemporary poise.", status: 'Accepted' },
  { id: 'rev-3', source: "Elle India", tag: "Style & Sustainability", quote: "Their breathable Mulmul kurtas and modal silk co-ords transition effortlessly from high-stakes boardroom meetings to weekend celebrations.", status: 'Accepted' },
  { id: 'rev-4', source: "Cosmopolitan", tag: "Modern Heritage", quote: "A masterclass in modernizing traditional weaves. The precision in their cuts and the quality of their zari is truly unmatched in this era.", status: 'Accepted' },
  { id: 'rev-5', source: "Grazia", tag: "Luxe Loungewear", quote: "Who knew traditional Indian wear could feel this effortless? DOOZY is proving that heritage craft belongs in our everyday wardrobes.", status: 'Accepted' }
];


const initialBranches: Branch[] = [
  { id: 'b1', name: 'Delhi Flagship', location: 'New Delhi', address: '123 Couture Avenue, Vasant Kunj', mapLink: 'https://maps.google.com', phone: '+91 98765 43210' }
];

const initialArticles: Article[] = [
  { id: 'a1', title: 'The Winter Edit', description: 'Explore our latest launch.', image: 'https://images.unsplash.com/photo-1583391733958-d66811568f9e?auto=format&fit=crop&q=80', link: '/products', date: '2026-10-15' }
];

const initialAnnouncements: Announcement[] = [
  { id: 'an1', text: 'USE CODE: DOOZY10 FOR 10% OFF' },
  { id: 'an2', text: 'FREE SHIPPING ON ORDERS OVER ₹5000' }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shippingOrigin, setShippingOrigin] = useState<string>('Doozy Flagship Hub, Erode, Tamil Nadu');
  const [shippingRates, setShippingRates] = useState<Record<string, Record<string, number>>>(DEFAULT_SHIPPING_RATES);

  const updateShippingRate = (state: string, district: string, amount: number | null) => {
    setShippingRates(prev => {
      const stateObj = { ...(prev[state] || {}) };
      if (amount === null || isNaN(amount)) {
        delete stateObj[district];
      } else {
        stateObj[district] = amount;
      }
      return {
        ...prev,
        [state]: stateObj
      };
    });
  };
  const router = useRouter();
  // Navigation & UI State
  const [activeAccountTab, setActiveAccountTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist' | 'cart'>('orders');
  const [adminActiveTab, setAdminActiveTab] = useState<AdminView>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);

  // Catalog State


  const [reviews, setReviews] = useState<Review[]>([]);
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'br-1', name: 'Erode Central Hub', location: 'Erode', address: 'Surampatti, Erode', phone: '+91 9876543210', mapLink: "" },
    { id: 'br-2', name: 'Thindal Branch', location: 'Erode', address: 'Thindal, Erode', phone: '+91 9876543210', mapLink: "" },
    { id: 'br-3', name: 'Perundurai Branch', location: 'Erode', address: 'Perundurai, Erode', phone: '+91 9876543210', mapLink: "" }
  ]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  const [backedUpLogs, setBackedUpLogs] = useState<ActivityLog[]>([]);
  
  const clearActivityLogs = () => {
    if (activityLogs.length === 0) return;
    setBackedUpLogs(prev => [...activityLogs, ...prev]);
    setActivityLogs([{ id: 'log-' + Date.now() + Math.random(), timestamp: new Date().toISOString(), action: 'Cleared Logs', details: 'Active logs were successfully moved to backup storage.' }]);
  };

  // Auto-cleanup logs older than 7 days
  useEffect(() => {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    if (activityLogs.length > 0) {
      const filtered = activityLogs.filter(log => (now - new Date(log.timestamp).getTime()) < SEVEN_DAYS);
      if (filtered.length !== activityLogs.length) setActivityLogs(filtered);
    }
    
    if (backedUpLogs.length > 0) {
      const filtered = backedUpLogs.filter(log => (now - new Date(log.timestamp).getTime()) < SEVEN_DAYS);
      if (filtered.length !== backedUpLogs.length) setBackedUpLogs(filtered);
    }
  }, [activityLogs, backedUpLogs]);

  const logActivity = (action: string, details: string) => {
    const log: ActivityLog = { id: 'log-' + Date.now() + Math.random(), timestamp: new Date().toISOString(), action, details };
    setActivityLogs(prev => [log, ...prev]);
  };
  const notifyCustomersViaWhatsApp = (message: string) => {
    const validCustomers = customers.filter(c => c.phone || c.email); // using what we have
    if (validCustomers.length === 0) return;
    
    // Simulate WhatsApp API Delay
    setTimeout(() => {
      showToast("WhatsApp Alert Sent", `${validCustomers.length} customers notified: "${message}"`, 'success');
      logActivity('whatsapp_campaign', `Sent WhatsApp alert to ${validCustomers.length} customers: ${message}`);
    }, 1500);
  };


  const [adminSidebarTabs, setAdminSidebarTabs] = useState<string[]>(['dashboard', 'orders', 'products', 'categories', 'customers', 'announcements', 'promotion', 'branches', 'reviews', 'offers', 'cms', 'logs', 'settings']);

  const addBranch = (b: Branch) => { 
    setBranches(prev => {
      const next = [...prev, b];
      pushToFirebase('branches', next);
      return next;
    }); 
    logActivity('Created Branch', `Added branch ${b.name}`);
    notifyCustomersViaWhatsApp(`We have launched a new location in ${b.location}, ${b.name}. Visit our new store!`); 
  };
  const updateBranch = (b: Branch) => { 
    setBranches(prev => {
      const next = prev.map(x => x.id === b.id ? b : x);
      pushToFirebase('branches', next);
      return next;
    }); 
    logActivity('Updated Branch', `Modified branch ${b.name}`); 
  };
  const deleteBranch = (id: string) => { 
    setBranches(prev => {
      const next = prev.filter(x => x.id !== id);
      pushToFirebase('branches', next);
      return next;
    }); 
    logActivity('Deleted Branch', `Removed branch ${id}`); 
  };

  const addArticle = (a: Article) => { 
    setArticles(prev => {
      const next = [...prev, a];
      pushToFirebase('articles', next);
      return next;
    }); 
    logActivity('Created Article', `Added article ${a.title}`); 
  };
  const updateArticle = (a: Article) => { 
    setArticles(prev => {
      const next = prev.map(x => x.id === a.id ? a : x);
      pushToFirebase('articles', next);
      return next;
    }); 
    logActivity('Updated Article', `Modified article ${a.title}`); 
  };
  const deleteArticle = (id: string) => { 
    setArticles(prev => {
      const next = prev.filter(x => x.id !== id);
      pushToFirebase('articles', next);
      return next;
    }); 
    logActivity('Deleted Article', `Removed article ${id}`); 
  };

  const addAnnouncement = (a: Announcement) => { 
    setAnnouncements(prev => {
      const next = [...prev, a];
      pushToFirebase('announcements', next);
      return next;
    }); 
    logActivity('Added Announcement', `New announcement: ${a.text}`); 
  };
  const updateAnnouncement = (id: string, updated: Partial<Announcement>) => { 
    setAnnouncements(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...updated } : a);
      pushToFirebase('announcements', next);
      return next;
    }); 
    logActivity('Updated Announcement', `Modified announcement ${id}`); 
  };
  const setBranchesList = (list: Branch[]) => {
    setBranches(list);
    pushToFirebase('branches', list);
    logActivity('Reordered Branches', 'Updated branches order');
  };

  const setAnnouncementsList = (list: Announcement[]) => {
    setAnnouncements(list);
    pushToFirebase('announcements', list);
    logActivity('Reordered Announcements', 'Updated announcements order');
  };

  const deleteAnnouncement = (id: string) => { 
    setAnnouncements(prev => {
      const next = prev.filter(x => x.id !== id);
      pushToFirebase('announcements', next);
      return next;
    }); 
    logActivity('Deleted Announcement', `Removed announcement`); 
  };

  const updatePromotion = (p: Promotion | null) => {
    if (promotion && p) {
      const changes: string[] = [];
      if (promotion.isActive !== p.isActive) {
        changes.push(`Status: ${promotion.isActive ? 'Active' : 'Inactive'} → ${p.isActive ? 'Active' : 'Inactive'}`);
      }
      
      const oldSlides = promotion.slides || [];
      const newSlides = p.slides || [];
      
      if (oldSlides.length !== newSlides.length) {
        changes.push(`Slides count: ${oldSlides.length} → ${newSlides.length}`);
      }
      
      newSlides.forEach((newSlide, i) => {
        const oldSlide = oldSlides[i];
        if (oldSlide) {
          if (oldSlide.desktopImage !== newSlide.desktopImage) changes.push(`Slide ${i+1} Desktop Image updated`);
          if (oldSlide.mobileImage !== newSlide.mobileImage) changes.push(`Slide ${i+1} Mobile Image updated`);
          if (oldSlide.link !== newSlide.link) changes.push(`Slide ${i+1} Link: ${oldSlide.link || 'None'} → ${newSlide.link || 'None'}`);
        } else {
          changes.push(`Added Slide ${i+1}`);
        }
      });

      if (changes.length > 0) {
        logActivity('Updated Promotion', changes.join(' | '));
      } else {
        logActivity('Updated Promotion', 'Configuration saved with no changes');
      }
    }
    setPromotion(p);
  };



  const addReview = (r: Review) => {
    setReviews(prev => [...prev, r]);
    safeSet(ref(database, `doozy_core/reviews/${r.id}`), r).catch(e => console.error(e));
    showToast('Review Added', 'Your review has been submitted.', 'success');
  };

  const updateReview = (r: Review) => {
    setReviews(prev => {
      const next = prev.map(item => item.id === r.id ? r : item);
      
      return next;
    });
    showToast('Review Updated', 'Testimonial has been updated.', 'success');
    logActivity('Updated Review', `Changed review status for ${r.customerName || r.source}`);
  };

  const deleteReview = (id: string) => {
    setReviews(prev => {
      const next = prev.filter(item => item.id !== id);
      
      return next;
    });
    showToast('Review Deleted', 'Testimonial removed.', 'success');
    logActivity('Deleted Review', `Removed review ${id}`);
  };

  const [categories, setCategories] = useState<Category[]>([]);

  const addCategory = (cat: Category) => {
    setCategories(prev => {
      const next = [...prev, cat].sort((a, b) => (a.order || 0) - (b.order || 0));
      pushToFirebase('categories', next);
      return next;
    });
    showToast('Category Added', cat.name + ' has been created.', 'success');
    notifyCustomersViaWhatsApp(`A new category has been added: ${cat.name}! Shop our new collection.`);
    logActivity('Added Category', `Created new category ${cat.name}`);
  };

  const updateCategory = (cat: Category) => {
    setCategories(prev => {
      const next = prev.map(c => c.id === cat.id ? cat : c).sort((a, b) => (a.order || 0) - (b.order || 0));
      pushToFirebase('categories', next);
      return next;
    });
    showToast('Category Updated', cat.name + ' has been updated.', 'success');
    logActivity('Updated Category', `Modified category ${cat.name}`);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      pushToFirebase('categories', next);
      return next;
    });
    showToast('Category Deleted', 'Category removed.', 'success');
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<FilterState>(defaultFilter);

  // Currency State
  const [currencyCode, setCurrencyCodeState] = useState<string>('INR');
  const [homepageConfig, setHomepageConfigState] = useState<HomepageConfig | null>(null);

  const updateHomepageConfig = (config: HomepageConfig) => {
    setHomepageConfigState(config);
    showToast("CMS Updated", "Homepage layout and content saved successfully", "success");
    notifyCustomersViaWhatsApp(`Time to grab the best deal! Check out our latest homepage updates.`);
    logActivity('Updated CMS', 'Modified Home Page CMS Settings');
  };


  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;

  const setCurrencyCode = (code: string) => {
    if (SUPPORTED_CURRENCIES[code]) {
      setCurrencyCodeState(code);
      localStorage.setItem('doozy_currency', code);
    }
  };

  const formatPrice
    
     = (amountInINR: number): string => {
    if (isNaN(amountInINR) || amountInINR === null) return `${currency.symbol}0`;
    const converted = amountInINR * currency.rate;
    
    if (currency.code === 'INR') {
      return `₹${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${currency.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCart = localStorage.getItem('doozy_cart');
        return storedCart ? JSON.parse(storedCart) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [checkoutSessionCart, setCheckoutSessionCart] = useState<CartItem[] | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('doozy_checkout_cart');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);

  // Wishlist State with LocalStorage sync
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<Customer | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [shortReels, setShortReels] = useState<ShortReel[]>([]);

  // Fetch reels from Firebase
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reelsRef = ref(database, 'doozy_core/reels');
    const unsub = onValue(reelsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as ShortReel[];
        setShortReels(data.sort((a,b) => (a.order||0) - (b.order||0)));
      } else {
        setShortReels([]);
      }
    });
    return () => unsub();
  }, []);

  const addShortReel = (reel: ShortReel) => {
    safeUpdate(ref(database, `doozy_core/reels/${reel.id}`), reel).catch(console.error);
    showToast('Reel Added', 'Short reel successfully added.', 'success');
  };

  const deleteShortReel = (id: string) => {
    set(ref(database, `doozy_core/reels/${id}`), null).catch(console.error);
    showToast('Reel Deleted', 'Short reel successfully removed.', 'success');
  };

  const updateShortReelsOrder = (reels: ShortReel[]) => {
    const updates: Record<string, any> = {};
    reels.forEach(r => {
      updates[`doozy_core/reels/${r.id}/order`] = r.order;
    });
    safeUpdate(ref(database), updates).catch(console.error);
    setShortReels(reels.sort((a,b) => (a.order||0) - (b.order||0)));
  };

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    adminName: 'Admin User',
    adminEmail: 'admin@doozy.com',
    supportWhatsApp: '+919876543210',
    taxRate: 18
  });

  // Fetch settings from Firebase
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const settingsRef = ref(database, 'doozy_core/settings');
    const unsub = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setStoreSettings(prev => ({ ...prev, ...snapshot.val() }));
      }
    });
    return () => unsub();
  }, []);

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    safeUpdate(ref(database, 'doozy_core/settings'), newSettings).catch(console.error);
    setStoreSettings(prev => ({ ...prev, ...newSettings }));
  };

  const [toasts, setToasts] = useState<Toast[]>([]);
  // Live Orders Sync via Firebase RTDB
  useEffect(() => {
    try {
      if (database) {
        const ordersRef = ref(database, 'doozy_core/orders');
        const unsubOrders = onValue(ordersRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const ordersArray = Object.values(data) as Order[];
            // Sort by date descending
            ordersArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(ordersArray);
          }
        });

        const usersRef = ref(database, 'doozy_core/users');
        const unsubUsers = onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const customersArray = Object.values(data).map((u: any) => u.profile).filter(Boolean) as Customer[];
            setCustomers(customersArray);
          }
        });

        return () => {
          unsubOrders();
          unsubUsers();
        };
      }
    } catch(e) {}
  }, []);

  
  const isHydrated = useRef(false);
  const skipNextSync = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    try {
      const local = localStorage.getItem('doozy_store_local_backup');
      if (local) {
        const data = JSON.parse(local);
        if (data.announcements && data.announcements.length > 0) setAnnouncements(data.announcements);
      }
    } catch(e) {}
  }, []);

  const pushToFirebase = (key: string, data: any) => {
    if (!isHydrated.current || currentRole !== 'admin') return;
    skipNextSync.current[key] = true;
    safeSet(ref(database, `doozy_core/${key}`), data).catch(err => {
      console.error("Firebase write failed for " + key, err);
      showToast("Database Error", "Failed to save to Firebase. Please check your Database Rules.", "error");
    });
  };

  useEffect(() => {
    const storeRef = ref(database, 'doozy_core');
    const unsubscribe = onValue(storeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (!skipNextSync.current["categories"]) { const cats = data.categories ? (Array.isArray(data.categories) ? data.categories : Object.values(data.categories)) as any[] : []; setCategories(cats.sort((a, b) => (a.order || 0) - (b.order || 0))); }
        if (!skipNextSync.current["products"]) setProducts(data.products ? (Array.isArray(data.products) ? data.products : Object.values(data.products)) : []);
        if (!skipNextSync.current['branches']) setBranches(data.branches ? (Array.isArray(data.branches) ? data.branches : Object.values(data.branches)) : []);
        if (!skipNextSync.current['articles']) setArticles(data.articles ? (Array.isArray(data.articles) ? data.articles : Object.values(data.articles)) : []);
        if (!skipNextSync.current["announcements"]) setAnnouncements(data.announcements ? (Array.isArray(data.announcements) ? data.announcements : Object.values(data.announcements)) : []);
        
        if (!skipNextSync.current['promotion']) setPromotion(data.promotion || null);
        if (!skipNextSync.current['activityLogs']) setActivityLogs(data.activityLogs || []);
        if (!skipNextSync.current['backedUpLogs']) setBackedUpLogs(data.backedUpLogs || []);
        if (!skipNextSync.current['reviews']) setReviews(data.reviews ? (Array.isArray(data.reviews) ? data.reviews : Object.values(data.reviews)) : []);
        if (!skipNextSync.current['homepageConfig']) setHomepageConfigState(data.homepageConfig || null);
        if (!skipNextSync.current['adminSidebarTabs']) setAdminSidebarTabs(data.adminSidebarTabs || ['dashboard', 'orders', 'products', 'categories', 'customers', 'announcements', 'promotion', 'branches', 'reviews', 'offers', 'cms', 'logs', 'settings']);
        if (!skipNextSync.current['shippingRates']) setShippingRates(data.shippingRates || DEFAULT_SHIPPING_RATES);
        if (!skipNextSync.current['shippingOrigin']) setShippingOrigin(data.shippingOrigin || 'Doozy Flagship Hub, Erode, Tamil Nadu');
        
        skipNextSync.current = {};
      } else {
        // DO NOT PUSH MOCK DATA. DB IS EMPTY.
      }
      isHydrated.current = true;
    }, (error) => {
      console.error("Firebase read failed:", error);
      isHydrated.current = true;
    });
    return () => unsubscribe();
  }, []);

  // Sync effect block
  useEffect(() => { pushToFirebase('categories', categories); }, [categories]);
  useEffect(() => { pushToFirebase('products', products); }, [products]);
  useEffect(() => { pushToFirebase('branches', branches); }, [branches]);
  useEffect(() => { pushToFirebase('articles', articles); }, [articles]);
  useEffect(() => { pushToFirebase('announcements', announcements); 
    try { 
      const local = JSON.parse(localStorage.getItem('doozy_store_local_backup') || '{}');
      local.announcements = announcements;
      localStorage.setItem('doozy_store_local_backup', JSON.stringify(local));
    } catch(e) {}
  }, [announcements]);
  useEffect(() => { pushToFirebase('promotion', promotion); }, [promotion]);
  useEffect(() => { pushToFirebase('activityLogs', activityLogs); }, [activityLogs]);
  useEffect(() => { pushToFirebase('shippingOrigin', shippingOrigin); }, [shippingOrigin]);
  useEffect(() => { pushToFirebase('shippingRates', shippingRates); }, [shippingRates]);
  useEffect(() => { pushToFirebase('backedUpLogs', backedUpLogs); }, [backedUpLogs]);
  useEffect(() => { pushToFirebase('reviews', reviews); }, [reviews]);
  useEffect(() => { if (homepageConfig) pushToFirebase('homepageConfig', homepageConfig); }, [homepageConfig]);
  useEffect(() => { pushToFirebase('adminSidebarTabs', adminSidebarTabs); }, [adminSidebarTabs]);
  




  
  

  // Sync to LocalStorage

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('doozy_user', JSON.stringify(currentUser));
      localStorage.setItem('doozy_role', currentRole);
    }
 }, [currentUser, currentRole]);

  useEffect(() => {
    localStorage.setItem('doozy_products', JSON.stringify(products));
 }, [products]);

  useEffect(() => {
    localStorage.setItem('doozy_cart', JSON.stringify(cart));
 }, [cart]);
  // Keep cart items synchronized with live product catalog (prices, stock, etc.)
  useEffect(() => {
    if (products.length === 0 || cart.length === 0) return;
    
    let needsUpdate = false;
    const syncedCart = cart.map(item => {
      const liveProduct = products.find(p => p.id === item.product?.id);
      if (liveProduct && (
          liveProduct.price !== item.product?.price || 
          liveProduct.stockQuantity !== item.product?.stockQuantity ||
          liveProduct.title !== item.product?.title
      )) {
        needsUpdate = true;
        return { ...item, product: liveProduct };
      }
      return item;
    });

    if (needsUpdate) {
      setCart(syncedCart);
    }
  }, [products, cart]);


  useEffect(() => {
    localStorage.setItem('doozy_wishlist', JSON.stringify(wishlist));
 }, [wishlist]);

  useEffect(() => {
    if (checkoutSessionCart) {
      localStorage.setItem('doozy_checkout_cart', JSON.stringify(checkoutSessionCart));
    } else {
      localStorage.removeItem('doozy_checkout_cart');
    }
  }, [checkoutSessionCart]);
  // Keep checkout session cart synchronized with live product catalog
  useEffect(() => {
    if (products.length === 0 || !checkoutSessionCart || checkoutSessionCart.length === 0) return;
    
    let needsUpdate = false;
    const syncedCart = checkoutSessionCart.map(item => {
      const liveProduct = products.find(p => p.id === item.product?.id);
      if (liveProduct && (
          liveProduct.price !== item.product?.price || 
          liveProduct.stockQuantity !== item.product?.stockQuantity ||
          liveProduct.title !== item.product?.title
      )) {
        needsUpdate = true;
        return { ...item, product: liveProduct };
      }
      return item;
    });

    if (needsUpdate) {
      setCheckoutSessionCart(syncedCart);
    }
  }, [products, checkoutSessionCart]);



  useEffect(() => {
    localStorage.setItem('doozy_addresses', JSON.stringify(addresses));
 }, [addresses]);




  // Handle Redirect Result for Mobile Emulation (COOP Bypass)
  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        showToast("Authenticated via Google", `Welcome, ${result.user.displayName || 'Customer'}`, 'success');
      }
    }).catch((error) => {
      showToast("Sign In Issue", error.message || "Failed to sign in.", 'error');
    });
 }, []);

  // Firebase Auth Listener & Live User Data Sync
  useEffect(() => {
    let dbUnsubscribe: (() => void) | undefined;
    
    try {
      const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setFirebaseUser(user);
          const userRef = ref(database, `doozy_core/users/${user.uid}`);
          
          dbUnsubscribe = onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              if (data.profile) setCurrentUser(data.profile);
              if (data.cart) setCart(data.cart || []);
              if (data.wishlist) setWishlist(data.wishlist || []);
              if (data.addresses) setAddresses(data.addresses || []);
            } else {
              const newProfile: Customer = {
                id: user.uid,
                name: user.displayName || user.email?.split('@')[0] || 'Royal Patron',
                email: user.email || 'guest@doozy.fashion',
                phone: user.phoneNumber || '',
                avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                role: user.email?.includes('admin') ? 'admin' : 'customer',
                joinedDate: new Date().toISOString().split('T')[0],
                totalSpent: 0,
                ordersCount: 0,
                tier: 'Premium Member',
                status: 'Active'
              };
              set(userRef, {
                profile: newProfile,
                cart: [],
                wishlist: [],
                addresses: []
              });
            }
          });
        } else {
          setFirebaseUser(null);
          if (dbUnsubscribe) dbUnsubscribe();
          
          // Check for persistent offline session (e.g. testing admin)
          try {
            const storedUser = localStorage.getItem('doozy_user');
            const storedRole = localStorage.getItem('doozy_role');
            if (storedUser && storedRole) {
              setCurrentUser(JSON.parse(storedUser));
              setCurrentRole(storedRole as UserRole);
            } else {
              setCurrentUser(null);
              setCart([]);
              setWishlist([]);
              setAddresses([]);
            }
          } catch(e) {
            setCurrentUser(null);
          }
        }
      });
      return () => {
        authUnsubscribe();
        if (dbUnsubscribe) dbUnsubscribe();
      };
    } catch (e) {
      console.error(e);
    }
 }, []);

  // Toast Helper
  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().substring(2, 5);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
   }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Reset Filters
  const resetFilter = () => {
    setFilter(defaultFilter);
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => {
      const next = [newProduct, ...prev];
      pushToFirebase('products', next);
      return next;
    });
    showToast("Product Added", `"${newProduct.title}" has been published to the catalog.`, 'success');
    notifyCustomersViaWhatsApp(`A new product has been launched: ${newProduct.title}! Check it out now.`);
    broadcastPush({
      title: 'New launch at DOOZY',
      body: `${newProduct.title} has just arrived. Take a look.`,
      url: `/products/${newProduct.slug || newProduct.id}`,
      icon: newProduct.images?.[0],
    });
    logActivity('Added Product', `Created new product ${newProduct.title}`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updated } : p);
      pushToFirebase('products', next);
      return next;
    });
    showToast("Product Updated", "Garment details saved successfully.", 'success'); logActivity('Updated Product', 'Modified product details');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      pushToFirebase('products', next);
      return next;
    });
    showToast("Product Removed", "Garment archived from active catalog.", 'info'); logActivity('Deleted Product', 'Removed product from catalog');
  };


  // Guest Welcome & Action Reminder Logic
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      const hasSeen = sessionStorage.getItem('doozy_guest_welcome');
      if (!currentUser && !hasSeen) {
        setGuestPromptOpen(true);
        sessionStorage.setItem('doozy_guest_welcome', 'true');
      }
   }, 5500); // 5.5 seconds (after splash screen finishes)
    return () => clearTimeout(timer);
 }, [currentUser]);

  const notifyGuestAction = (): boolean => {
    if (currentUser) return false;
    if (typeof window === 'undefined') return false;
    
    let count = parseInt(sessionStorage.getItem('doozy_guest_actions') || '0', 10);
    count++;
    sessionStorage.setItem('doozy_guest_actions', count.toString());
    
    // Force login modal every time as requested
    setGuestPromptOpen(true);
    return true; // True means they were blocked
  };

  // Cart Logic
  const addToCart = (
    product: Product, 
    selectedSize: string = product.sizes?.[0] || 'Default', 
    selectedColor: { name: string; hex: string } | null = product.colors?.[0] || null, 
    quantity: number = 1,
    openDrawer: boolean = true
  ) => {
    const isGuest = notifyGuestAction(); // notify but do not block
    if (product.stockQuantity <= 0) {
      showToast("Out of Stock", "Sorry, this product is currently out of stock.", "error");
      return;
    }
    
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor?.name?.replace(/\s+/g, '') || 'Default'}`;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      let newCart;
      if (existing) {
        newCart = prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: quantity } // SET exactly the quantity selected instead of accumulating
            : item
        );
      } else {
        newCart = [...prev, {
          id: cartItemId,
          product,
          selectedSize: selectedSize || null,
          selectedColor: selectedColor || null,
          quantity
        }];
      }
      if (currentUser) safeUpdate(ref(database, `doozy_core/users/${currentUser.id}`), { cart: newCart });
      return newCart;
    });

    if (openDrawer && !isGuest) setCartDrawerOpen(true);
    showToast("Added to Bag", `${product.title} (${selectedSize}${selectedColor ? ', ' + selectedColor.name : ''}) has been placed in your shopping bag.`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    const item = cart.find(i => i.id === cartItemId);
    if (item && item.product && quantity > (item.product.stockQuantity || 0)) {
      showToast("Stock Limit Reached", `Only ${item.product.stockQuantity} units available.`, "error");
      return;
    }
    setCart(prev => {
      const newCart = prev.map(item => item.id === cartItemId ? { ...item, quantity } : item);
      if (currentUser) safeUpdate(ref(database, `doozy_core/users/${currentUser.id}`), { cart: newCart });
      return newCart;
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== cartItemId);
      if (currentUser) safeUpdate(ref(database, `doozy_core/users/${currentUser.id}`), { cart: newCart });
      return newCart;
    });
    showToast("Item Removed", "Item removed from shopping bag.", 'info');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('doozy_cart');
    if (currentUser) safeUpdate(ref(database, `doozy_core/users/${currentUser.id}`), { cart: [] });
  };

  // Promo Code
  const applyPromoCode = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    
    if (cleanCode === '') {
      setAppliedPromoCode(null);
      localStorage.removeItem('doozy_promo');
      showToast("Promo Code Removed", "Discount code has been removed from your order.", 'info');
      return true;
    }

    const validPromo = announcements.find(a => a.code === cleanCode && a.isActive !== false);

    if (validPromo && validPromo.discountPercentage) {
      setAppliedPromoCode(cleanCode);
      localStorage.setItem('doozy_promo', cleanCode);
      showToast("Promo Code Applied", `Discount code ${cleanCode} active.`, 'success');
      return true;
    }

    // Fallback for hardcoded codes
    if (cleanCode === 'DOOZYVIP20' || cleanCode === 'UTSAV10' || cleanCode === 'FIRST15') {
      setAppliedPromoCode(cleanCode);
      localStorage.setItem('doozy_promo', cleanCode);
      showToast("Promo Code Applied", `Complimentary discount code ${cleanCode} active.`, 'success');
      return true;
    }
    showToast("Invalid Code", "The promo code entered is either expired or inapplicable.", 'error');
    return false;
  };

  // Cart Calculations (in base INR ₹)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  
  let cartShipping = 0;
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
  if (cartSubtotal > 0 && cartSubtotal < 5000) {
    if (defaultAddress && defaultAddress.state && defaultAddress.city) {
      const stateKey = Object.keys(shippingRates).find(s => s.toLowerCase() === defaultAddress.state!.toLowerCase());
      if (stateKey && shippingRates[stateKey]) {
        let matchKey = Object.keys(shippingRates[stateKey]).find(
          k => k.toLowerCase() === defaultAddress.city.toLowerCase()
        );
        if (!matchKey) {
          matchKey = Object.keys(shippingRates[stateKey]).find(
            k => k.toLowerCase().includes(defaultAddress.city.toLowerCase()) || defaultAddress.city.toLowerCase().includes(k.toLowerCase())
          );
        }
        cartShipping = matchKey ? shippingRates[stateKey][matchKey] : 150;
      } else {
        cartShipping = 150;
      }
    } else {
      cartShipping = 150; // default estimated shipping
    }
  } else if (cartSubtotal >= 5000) {
    cartShipping = 0;
  }
  
  // 5% GST for luxury apparel in India
  const cartTax = Math.round(cartSubtotal * (storeSettings.taxRate / 100));

  let discountRate = 0;
  const activePromo = announcements.find(a => a.code === appliedPromoCode && a.isActive !== false);
  if (activePromo && activePromo.discountPercentage) {
    discountRate = activePromo.discountPercentage / 100;
  } else if (appliedPromoCode === 'DOOZYVIP20') discountRate = 0.20;
  else if (appliedPromoCode === 'UTSAV10') discountRate = 0.10;
  else if (appliedPromoCode === 'FIRST15') discountRate = 0.15;

  const cartDiscount = Math.round(cartSubtotal * discountRate);
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartShipping + cartTax);

  const toggleWishlist = (productId: string) => {
    if (notifyGuestAction()) return; // block action if guest (wishlist requires login)
    setWishlist(prev => {
      const exists = prev.includes(productId);
      let newWishlist;
      if (exists) {
        showToast("Removed from Wishlist", "Item removed from your curated wish vault.", 'info');
        newWishlist = prev.filter(id => id !== productId);
      } else {
        showToast("Saved to Wishlist", "Item preserved in your private wishlist.", 'success');
        newWishlist = [...prev, productId];
      }
      if (currentUser) safeUpdate(ref(database, `doozy_core/users/${currentUser.id}`), { wishlist: newWishlist });
      return newWishlist;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Auth Operations
  const loginWithEmail = async (email: string, password?: string): Promise<boolean> => {
    try {
      let isFbAuthed = false;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password || 'password123');
        if (userCredential.user) {
          isFbAuthed = true;
        }
      } catch (fbErr: any) {
        // If the user doesn't exist in Firebase yet, let's create them!
        if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
          try {
            const newUser = await createUserWithEmailAndPassword(auth, email, password || 'password123');
            if (newUser.user) {
               // Write their admin profile explicitly to database so rules pass
               if (email.includes('admin')) {
                 await safeSet(ref(database, `doozy_core/users/${newUser.user.uid}`), {
                   profile: { id: newUser.user.uid, role: 'admin', email }
                 });
               }
               isFbAuthed = true;
            }
          } catch(createErr) {}
        }
      }

      if (isFbAuthed) {
         showToast("Welcome Back", `Signed in securely.`, 'success');
         // The onAuthStateChanged listener will handle setCurrentUser!
         return true;
      }

      if ((email.toLowerCase() === 'admin' || email.toLowerCase() === 'admin@gmail.com') && password === 'admin123') {
        let anonUid = 'admin-hardcoded';
        try {
          const anonAuth = await signInAnonymously(auth);
          anonUid = anonAuth.user.uid;
          await safeSet(ref(database, `doozy_core/users/${anonUid}`), {
            role: 'admin',
            email: 'admin@doozy.com'
          });
        } catch (e) {}
        
        const userObj: Customer = {
          id: anonUid,
          name: 'DOOZY Admin',
          email: 'admin@doozy.com',
          role: 'admin',
          username: 'admin',
          phone: '+91 9999999999',
          joinedDate: new Date().toISOString().split('T')[0],
          totalSpent: 0,
          ordersCount: 0,
          tier: 'Premium Member',
          status: 'Active'
        };
        setCurrentUser(userObj);
        setCurrentRole('admin');
        
        return true;
      }

      // Check against mock database
      const found = initialCustomers.find(c => c.email.toLowerCase() === email.toLowerCase());
      const role: UserRole = email.includes('admin') ? 'admin' : (found?.role || 'customer');
      
      const userObj: Customer = found || {
        id: `user-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email,
        phone: '+91 94884 45184',
        role: role,
        joinedDate: new Date().toISOString().split('T')[0],
        totalSpent: 18499,
        ordersCount: 1,
        tier: 'Premium Member',
        status: 'Active'
      };

      setCurrentUser(userObj);
      setCurrentRole(userObj.role || 'customer');
      showToast("Access Granted", `Welcome to DOOZY, ${userObj.name}`, 'success');
      return true;
    } catch (err: any) {
      showToast("Sign In Issue", err.message || "Failed to sign in.", 'error');
      return false;
    }
  };

  const signupWithEmail = async (name: string, email: string, password: string = 'password123', username: string = '', phone: string = ''): Promise<boolean> => {
    try {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          showToast("Account Created", `Welcome to the House of DOOZY, ${name}`, 'success');
        }
      } catch (fbErr) {
        
      }

      const newUser: Customer = {
        id: `cust-${Date.now()}`,
        name: name,
        username: username,
        email: email,
        phone: phone || '+91 98450 00000',
        role: 'customer',
        joinedDate: new Date().toISOString().split('T')[0],
        totalSpent: 0,
        ordersCount: 0,
        tier: 'Premium Member',
        status: 'Active'
      };

      setCurrentUser(newUser);
      setCurrentRole('customer');
      showToast("Membership Active", `Welcome to DOOZY, ${name}. Your premium account is ready.`, 'success');
      return true;
    } catch (err: any) {
      showToast("Signup Error", err.message || "Could not register account.", 'error');
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; needsOnboarding: boolean }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        const snapshot = await get(ref(database, `doozy_core/users/${user.uid}`));
        const data = snapshot.val();
        const needsOnboarding = !data || !data.profile || !data.profile.phone || !data.profile.name || data.profile.name === 'Customer' || data.profile.name.includes('@');
        
        showToast("Authenticated via Google", `Welcome, ${user.displayName || 'Customer'}`, 'success');
        return { success: true, needsOnboarding };
      }
      return { success: false, needsOnboarding: false };
    } catch (e: any) {
      if (e.code !== 'auth/popup-closed-by-user') {
        showToast("Sign In Issue", e.message || "Failed to sign in with Google.", 'error');
      }
      return { success: false, needsOnboarding: false };
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setCurrentUser(prev => prev?.role === 'admin' ? prev : null);
    setFirebaseUser(null);
    setCurrentRole('customer');
    localStorage.removeItem('doozy_user');
    showToast("Signed Out", "You have been safely signed out from DOOZY.", 'info');
    if (typeof window !== 'undefined') window.location.href = '/auth';
  };

  const switchUserRole = () => {
    const newRole: UserRole = currentRole === 'admin' ? 'customer' : 'admin';
    setCurrentRole(newRole);
    if (newRole === 'admin') {
      if (typeof window !== 'undefined') window.location.href = '/admin';
      showToast("Admin OS Mode", "Switched to DOOZY Executive Command Center.", 'info');
    } else {
      if (typeof window !== 'undefined') window.location.href = '/';
      showToast("Client Home Page", "Switched to DOOZY Customer Boutique.", 'info');
    }
  };

  const updateUserProfile = (updated: Partial<Customer>) => {
    if (currentUser && currentUser.role === 'admin') {
      const changes: string[] = [];
      if (updated.name && updated.name !== currentUser.name) {
        changes.push(`Name: ${currentUser.name || 'Admin'} → ${updated.name}`);
      }
      if (updated.email && updated.email !== currentUser.email) {
        changes.push(`Email: ${currentUser.email} → ${updated.email}`);
      }
      if (changes.length > 0) {
        logActivity('Admin Profile Modified', changes.join(' | '));
      }
    }
    
    setCurrentUser(prev => {
      const newUser = prev ? { ...prev, ...updated } : null;
      if (newUser) {
        safeUpdate(ref(database, `doozy_core/users/${newUser.id}`), { profile: newUser });
      }
      return newUser;
    });
    showToast("Profile Updated", "Your account details have been updated.", 'success');
  };

  // Address CRUD
  const isAddingAddress = useRef(false);
  const addAddress = (addr: Omit<Address, 'id'>) => {
    if (isAddingAddress.current) return;
    isAddingAddress.current = true;
    setTimeout(() => { isAddingAddress.current = false; }, 1500);

    // Generate a mathematically unique ID using crypto random to prevent strict mode collisions
    const newAddr: Address = { ...addr, id: `addr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}` };
    
    // Process new array OUTSIDE the setAddresses callback to avoid Strict Mode double execution
    const newAddresses = newAddr.isDefault 
      ? addresses.map(a => ({ ...a, isDefault: false })).concat(newAddr)
      : [...addresses, newAddr];
      
    // Mutate state locally and sync to Firebase precisely ONCE
    setAddresses(newAddresses);
    if (currentUser) {
      safeUpdate(ref(database, `doozy_core/users/${currentUser.id}`), { addresses: newAddresses });
    }
    showToast("Address Saved", "Delivery destination added to your vault.", 'success');
  };

  const updateAddress = (id: string, updated: Partial<Address>) => {
    const newAddresses = addresses.map(a => a.id === id ? { ...a, ...updated } : a);
    setAddresses(newAddresses);
    if (currentUser) {
      safeUpdate(ref(database, `doozy_core/users/${currentUser.id}`), { addresses: newAddresses });
    }
    showToast("Address Updated", "Delivery destination updated.", 'success');
  };

  const deleteAddress = (id: string) => {
    const newAddresses = addresses.filter(a => a.id !== id);
    setAddresses(newAddresses);
    if (currentUser) {
      safeUpdate(ref(database, `doozy_core/users/${currentUser.id}`), { addresses: newAddresses });
    }
    showToast("Address Removed", "Address removed from your address book.", 'info');
  };

  const setDefaultAddress = (id: string) => {
    const newAddresses = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(newAddresses);
    if (currentUser) {
      safeUpdate(ref(database, `doozy_core/users/${currentUser.id}`), { addresses: newAddresses });
    }
    showToast("Default Address Set", "Primary dispatch destination updated.", 'success');
  };

  const updateOrderTrackingLink = (id: string, link: string) => {
    safeUpdate(ref(database, `doozy_core/orders/${id}`), { trackingLink: link }).catch(console.error);
    const newOrders = orders.map(o => o.id === id ? { ...o, trackingLink: link } : o);
    setOrders(newOrders);
  };

  const createOrder = (orderData: Partial<Order>): Order => {
    const orderNum = `DZ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalCart = checkoutSessionCart || cart;
    const finalSubtotal = checkoutSessionCart ? checkoutSessionCart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) : cartSubtotal;
    const finalShipping = orderData.shipping !== undefined ? orderData.shipping : cartShipping;
    const finalTax = checkoutSessionCart ? Math.round(finalSubtotal * 0.05) : cartTax;
    const finalDiscount = checkoutSessionCart ? Math.round(finalSubtotal * (cartSubtotal > 0 ? (cartDiscount / cartSubtotal) : 0)) : cartDiscount;
    const finalTotal = checkoutSessionCart ? Math.max(0, finalSubtotal - finalDiscount + finalShipping + finalTax) : cartTotal;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString(),
      customerName: currentUser?.name || 'Valued Customer',
      customerEmail: currentUser?.email || 'customer@doozy.fashion',
      items: finalCart.map(c => ({
        productId: c.product?.id || null,
        title: c.product?.title || 'Unknown Product',
        image: c.product?.images?.[0] || null,
        size: c.selectedSize || null,
        color: c.selectedColor?.name || null,
        price: c.product?.price || 0,
        quantity: c.quantity || 1
      })) as any as CartItem[],
      total: finalTotal,
      subtotal: finalSubtotal,
      shipping: finalShipping,
      tax: finalTax,
      discount: finalDiscount,
      status: 'Processing',
      shippingAddress: addresses.find(a => a.isDefault) || addresses[0],
      paymentMethod: orderData.paymentMethod || 'UPI / NetBanking',
      estimatedDelivery: '3 to 5 business days with complimentary white-glove packaging',
      ...orderData
    };


    // Inventory Management: Deduct Stock
    finalCart.forEach(item => {
      if (item.product) {
        updateProduct(item.product.id, {
          stockQuantity: Math.max(0, item.product.stockQuantity - item.quantity)
        });
      }
    });

    setOrders(prev => [newOrder, ...prev]);
    safeSet(ref(database, `doozy_core/orders/${newOrder.id}`), newOrder);

    if (checkoutSessionCart) {
      setCheckoutSessionCart(null);
    } else {
      clearCart();
    }
    
    // Increment user stats
    if (currentUser) {
      setCurrentUser(prev => prev ? {
        ...prev,
        ordersCount: prev.ordersCount + 1,
        totalSpent: prev.totalSpent + newOrder.total
      } : null);
    }

    // Try saving order to Firebase Realtime Database
    try {
      if (database) {
        const orderRef = ref(database, `doozy_core/orders/${newOrder.id}`);
        set(orderRef, newOrder);
      }
    } catch (dbErr) {
      
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    safeUpdate(ref(database, `doozy_core/orders/${orderId}`), { status });
    showToast("Order Status Updated", `Order ${orderId} marked as ${status}.`, 'info');
    logActivity('Updated Order Status', `Order #${orderId} status changed to ${status}`);
  };

  const computedShortReels = useMemo(() => {
    const productReels = products
      .filter(p => !!p.reelUrl)
      .map(p => ({
         id: 'product-reel-' + p.id,
         videoUrl: p.reelUrl as string,
         productId: p.id,
         order: 999
      }));
    
    // Filter out product reels that might already be manually added to shortReels to avoid duplicates
    const existingUrls = new Set(shortReels.map(r => r.videoUrl));
    const uniqueProductReels = productReels.filter(r => !existingUrls.has(r.videoUrl));
    
    return [...shortReels, ...uniqueProductReels].sort((a,b) => (a.order||0) - (b.order||0));
  }, [shortReels, products]);

  return (
    <StoreContext.Provider value={{
      activeAccountTab,
      setActiveAccountTab,
      adminActiveTab,
      setAdminActiveTab,
      selectedProduct,
      setSelectedProduct,
      cartDrawerOpen,
      setCartDrawerOpen,
      guestPromptOpen,
      setGuestPromptOpen,
      searchModalOpen,
      setSearchModalOpen,
      quickViewProduct,
      setQuickViewProduct,
      sizeChartOpen,
      setSizeChartOpen,
      
      products,
      filter,
      setFilter,
      resetFilter,
      addProduct,
      updateProduct,
      deleteProduct,

      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartSubtotal,
      cartShipping,
      cartTax,
      cartDiscount,
      cartTotal,
      discountRate,
      checkoutSessionCart,
      setCheckoutSessionCart,
      appliedPromoCode,
      applyPromoCode,

      wishlist,
      toggleWishlist,
      isInWishlist,

      currentUser,
      firebaseUser,
      currentRole,
      setCurrentRole,
      loginWithEmail,
      signupWithEmail,
      loginWithGoogle,
      logout,
      switchUserRole,
      updateUserProfile,
      addresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,

      orders,
      createOrder,
      updateOrderTrackingLink,
      updateOrderStatus,

      customers,

      shortReels: computedShortReels,
      addShortReel,
      deleteShortReel,
      updateShortReelsOrder,
      storeSettings,
      updateStoreSettings,
      toasts,
      showToast,
      removeToast,

      currency,
      setCurrencyCode,
      formatPrice,
      homepageConfig,
      updateHomepageConfig,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      reviews, addReview,
      branches, addBranch, updateBranch, deleteBranch, setBranchesList,
      articles, addArticle, updateArticle, deleteArticle,
      announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, setAnnouncementsList, promotion, updatePromotion, adminSidebarTabs, setAdminSidebarTabs, activityLogs, backedUpLogs, clearActivityLogs, logActivity, shippingOrigin, setShippingOrigin, shippingRates, updateShippingRate, 
      updateReview,
      deleteReview
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};// Firebase strictly crashes on `undefined` values. 
// These wrappers use JSON serialization to seamlessly strip all undefined properties from complex objects before writing to DB.
const safeSet = (dbRef: any, data: any) => {
  return set(dbRef, JSON.parse(JSON.stringify(data)));
};

const safeUpdate = (dbRef: any, data: any) => {
  return update(dbRef, JSON.parse(JSON.stringify(data)));
};


