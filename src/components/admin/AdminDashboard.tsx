
'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { InvoiceComponent } from '../common/InvoiceComponent';
import { 
  BarChart3, Package, ShoppingBag, Users, TrendingUp, Plus, Edit3, Trash2, Search, CheckCircle, Check, 
  Clock, Truck, AlertTriangle, ArrowUpRight, ArrowUp, ArrowDown, DollarSign, Sparkles, ExternalLink, ChevronRight, ChevronDown, ChevronLeft, X, 
  Filter, Star, Eye, EyeOff, LogOut, Layers, MessageSquare, LayoutDashboard, Menu, Link as LinkIcon,
  MapPin, BookOpen, Megaphone, Gift, Settings, GripVertical, Phone, RefreshCw, Award
, Shield, Film, ChevronUp } from 'lucide-react';
import { Product, Order, Customer, HomepageConfig, Category, Review, Branch, Article, Announcement, Promotion } from '../../types';
import { INDIA_STATES } from '../../data/indianLocations';
import { broadcastPush } from '../../lib/pushClient';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const {
    shortReels, addShortReel, deleteShortReel, updateShortReelsOrder,
    storeSettings, updateStoreSettings,
    currentUser, updateUserProfile,
    products, addProduct, updateProduct, deleteProduct,
    orders, updateOrderStatus, updateOrderTrackingLink,
    customers,
    homepageConfig, updateHomepageConfig,
    categories, addCategory, updateCategory, deleteCategory,
    reviews, addReview, updateReview, deleteReview,
    branches, addBranch, updateBranch, deleteBranch, setBranchesList,
    articles, addArticle, updateArticle, deleteArticle,
    announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, setAnnouncementsList,
    promotion, updatePromotion, activityLogs, backedUpLogs, clearActivityLogs, logActivity,
    adminSidebarTabs, setAdminSidebarTabs,
    formatPrice,
    shippingRates, updateShippingRate,

  } = useStore();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [analyticsView, setAnalyticsView] = useState<"date"|"time"|"product"|"client">("date");
  const [analyticsChartType, setAnalyticsChartType] = useState<"bar"|"line"|"pie">("bar");
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<"7d"|"1m"|"6m"|"1y"|"all">("7d");
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  const [newReelUrl, setNewReelUrl] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsSidebarCollapsed(true);
  }, []);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [viewingReview, setViewingReview] = useState<Review | null>(null); 
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      const timer = setTimeout(() => {
        if (!localStorage.getItem('doozy_role') || localStorage.getItem('doozy_role') !== 'admin') {
          router.push('/auth');
        } else {
          setIsAuthorized(true);
        }
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsAuthorized(true);
    }
  }, [currentUser, updateUserProfile, router]);

  const logout = () => {
    localStorage.removeItem('doozy_user');
    localStorage.removeItem('doozy_role');
    window.location.href = '/auth';
  };

  const ALL_TABS = {
    dashboard: { icon: LayoutDashboard, label: 'Dashboard' },
    orders: { icon: ShoppingBag, label: 'Orders' },
    products: { icon: Package, label: 'Products' },
    offers: { icon: Gift, label: 'Offers & Discounts' },
    categories: { icon: Layers, label: 'Categories' },
    reels: { icon: Film, label: 'Shorts / Reels' },
    customers: { icon: Users, label: 'Client Details' },
    reviews: { icon: MessageSquare, label: 'Reviews' },
    branches: { icon: MapPin, label: 'Branches' },
        announcements: { icon: Megaphone, label: 'Coupons / Banner' },
    cms: { icon: Sparkles, label: 'Home Page CMS' },
    promotion: { icon: Eye, label: 'Promotional Popup' },
    settings: { icon: Settings, label: 'Settings' },
    logs: { icon: Clock, label: 'Activity Logs' },
    shipping: { icon: Truck, label: 'Shipping Rules' }
  };

  // Smart Layout Enforcer & Cleaner
  useEffect(() => {
    if (!adminSidebarTabs || adminSidebarTabs.length === 0) return;
    
    // If the layout has old dead tabs (like articles) or is missing new essential tabs like shipping, 
    // we snap it to the premium default layout once.
    if (adminSidebarTabs.includes('articles') || adminSidebarTabs[0] !== 'dashboard' || !adminSidebarTabs.includes('promotion') || !adminSidebarTabs.includes('shipping') || !adminSidebarTabs.includes('reels')) {
      const premiumLayout = ['dashboard', 'orders', 'products', 'categories', 'reels', 'customers', 'announcements', 'shipping', 'promotion', 'branches', 'reviews', 'offers', 'cms', 'logs', 'settings'];
      
      // Only update if it's actually different from what we want to enforce
      if (JSON.stringify(adminSidebarTabs) !== JSON.stringify(premiumLayout)) {
        setAdminSidebarTabs(premiumLayout);
      }
    }
  }, [adminSidebarTabs, setAdminSidebarTabs]);

  

  const [viewingImage, setViewingImage] = useState<string | null>(null);
  
  const lastMouseY = useRef<number>(0);
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      lastMouseY.current = e.clientY;
    };
    window.addEventListener('dragover', handleGlobalDragOver);
    return () => window.removeEventListener('dragover', handleGlobalDragOver);
  }, []);

  const startAutoScroll = (area: 'main' | 'sidebar' = 'main') => {
    if (scrollInterval.current) return;
    scrollInterval.current = setInterval(() => {
      const y = lastMouseY.current;
      if (y <= 0) return;
      const scrollSpeed = 5; // slower scroll speed
      
      if (area === 'main') {
        // Auto-scroll Main Area
        const mainContainer = document.querySelector('#admin-main-content');
        if (mainContainer) {
          const rect = mainContainer.getBoundingClientRect();
          const dynamicThreshold = rect.height * 0.4; // 40% threshold triggers when crossing midpoint
          if (y < rect.top + dynamicThreshold) mainContainer.scrollTop -= scrollSpeed;
          else if (y > rect.bottom - dynamicThreshold && y < rect.bottom + 100) mainContainer.scrollTop += scrollSpeed;
        }
      } else if (area === 'sidebar') {
        // Auto-scroll Sidebar Area
        const sidebarContainer = document.querySelector('aside .overflow-y-auto');
        if (sidebarContainer) {
          const rect = sidebarContainer.getBoundingClientRect();
          const dynamicThreshold = rect.height * 0.4;
          if (y < rect.top + dynamicThreshold) sidebarContainer.scrollTop -= scrollSpeed;
          else if (y > rect.bottom - dynamicThreshold && y < rect.bottom + 100) sidebarContainer.scrollTop += scrollSpeed;
        }
      }
    }, 16);
  };

  const stopAutoScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);

  const getCategoryDragDirection = (targetId: string) => {
    if (!draggedCategoryId) return null;
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const dragIdx = sorted.findIndex(c => c.id === draggedCategoryId);
    const dropIdx = sorted.findIndex(c => c.id === targetId);
    if (dragIdx === -1 || dropIdx === -1 || dragIdx === dropIdx) return null;
    return dragIdx < dropIdx ? 'down' : 'up';
  };

  const handleCategoryDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCategoryId(id);
    e.dataTransfer.effectAllowed = 'move';
    startAutoScroll('main');
  };
  
  const handleCategoryDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCategoryId !== id) setDragOverCategoryId(id);
  };
  
  const handleDropCategory = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    stopAutoScroll();
    if (!draggedCategoryId || draggedCategoryId === targetId) {
      setDraggedCategoryId(null);
      setDragOverCategoryId(null);
      return;
    }
    
    const sorted = [...categories].sort((a,b) => (a.order || 0) - (b.order || 0));
    const draggedIdx = sorted.findIndex(c => c.id === draggedCategoryId);
    const targetIdx = sorted.findIndex(c => c.id === targetId);
    
    if (draggedIdx > -1 && targetIdx > -1) {
      const draggedItem = sorted[draggedIdx];
      sorted.splice(draggedIdx, 1);
      sorted.splice(targetIdx, 0, draggedItem);
      
      sorted.forEach((cat, index) => {
        if (cat.order !== index) {
          updateCategory({ ...cat, order: index });
        }
      });
    }
    
    setDraggedCategoryId(null);
    setDragOverCategoryId(null);
  };

  // --- Branches Drag & Drop ---
  const [draggedBranchId, setDraggedBranchId] = useState<string | null>(null);
  const [dragOverBranchId, setDragOverBranchId] = useState<string | null>(null);

  const getBranchDragDirection = (targetId: string) => {
    if (!draggedBranchId) return null;
    const dragIdx = branches.findIndex(b => b.id === draggedBranchId);
    const dropIdx = branches.findIndex(b => b.id === targetId);
    if (dragIdx === -1 || dropIdx === -1 || dragIdx === dropIdx) return null;
    return dragIdx < dropIdx ? 'down' : 'up';
  };

  const handleBranchDragStart = (e: React.DragEvent, id: string) => {
    setDraggedBranchId(id);
    e.dataTransfer.effectAllowed = 'move';
    startAutoScroll('main');
  };

  const handleBranchDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverBranchId !== id) setDragOverBranchId(id);
  };

  const handleDropBranch = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    stopAutoScroll();
    if (!draggedBranchId || draggedBranchId === targetId) {
      setDraggedBranchId(null);
      setDragOverBranchId(null);
      return;
    }
    const dragIdx = branches.findIndex(b => b.id === draggedBranchId);
    const dropIdx = branches.findIndex(b => b.id === targetId);
    if (dragIdx !== -1 && dropIdx !== -1) {
      const newBranches = [...branches];
      const [draggedItem] = newBranches.splice(dragIdx, 1);
      newBranches.splice(dropIdx, 0, draggedItem);
      setBranchesList(newBranches);
    }
    setDraggedBranchId(null);
    setDragOverBranchId(null);
  };

  // --- Announcements Drag & Drop ---
  const [draggedAnnouncementId, setDraggedAnnouncementId] = useState<string | null>(null);
  const [dragOverAnnouncementId, setDragOverAnnouncementId] = useState<string | null>(null);

  const getAnnouncementDragDirection = (targetId: string) => {
    if (!draggedAnnouncementId) return null;
    const dragIdx = announcements.findIndex(a => a.id === draggedAnnouncementId);
    const dropIdx = announcements.findIndex(a => a.id === targetId);
    if (dragIdx === -1 || dropIdx === -1 || dragIdx === dropIdx) return null;
    return dragIdx < dropIdx ? 'down' : 'up';
  };

  const handleAnnouncementDragStart = (e: React.DragEvent, id: string) => {
    setDraggedAnnouncementId(id);
    e.dataTransfer.effectAllowed = 'move';
    startAutoScroll('main');
  };

  const handleAnnouncementDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverAnnouncementId !== id) setDragOverAnnouncementId(id);
  };

  const handleDropAnnouncement = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    stopAutoScroll();
    if (!draggedAnnouncementId || draggedAnnouncementId === targetId) {
      setDraggedAnnouncementId(null);
      setDragOverAnnouncementId(null);
      return;
    }
    const dragIdx = announcements.findIndex(a => a.id === draggedAnnouncementId);
    const dropIdx = announcements.findIndex(a => a.id === targetId);
    if (dragIdx !== -1 && dropIdx !== -1) {
      const newAnnouncements = [...announcements];
      const [draggedItem] = newAnnouncements.splice(dragIdx, 1);
      newAnnouncements.splice(dropIdx, 0, draggedItem);
      setAnnouncementsList(newAnnouncements);
    }
    setDraggedAnnouncementId(null);
    setDragOverAnnouncementId(null);
  };

  
  const [draggedReel, setDraggedReel] = useState<string | null>(null);
  const [dragOverReel, setDragOverReel] = useState<string | null>(null);

  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);

  
  const getReelDragDirection = (targetId: string) => {
    if (!draggedReel) return null;
    const dragIdx = shortReels.findIndex(r => r.id === draggedReel);
    const dropIdx = shortReels.findIndex(r => r.id === targetId);
    if (dragIdx === -1 || dropIdx === -1 || dragIdx === dropIdx) return null;
    return dragIdx < dropIdx ? 'down' : 'up';
  };

  const handleReelDragStart = (e: React.DragEvent, id: string) => {
    setDraggedReel(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleReelDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverReel(id); };
  const handleReelDragLeave = () => setDragOverReel(null);
  const handleReelDrop = (e: React.DragEvent, targetId: string) => {
    setDragOverReel(null);
    e.preventDefault();
    if (!draggedReel || draggedReel === targetId) return;
    const newReels = [...shortReels];
    const draggedIdx = newReels.findIndex(r => r.id === draggedReel);
    const targetIdx = newReels.findIndex(r => r.id === targetId);
    const item = newReels.splice(draggedIdx, 1)[0];
    newReels.splice(targetIdx, 0, item);
    
    // update order numbers
    newReels.forEach((r, idx) => r.order = idx);
    updateShortReelsOrder(newReels);
    setDraggedReel(null);
  };

  const getTabDragDirection = (targetId: string) => {
    if (!draggedTab) return null;
    const dragIdx = adminSidebarTabs.indexOf(draggedTab);
    const dropIdx = adminSidebarTabs.indexOf(targetId);
    if (dragIdx === -1 || dropIdx === -1 || dragIdx === dropIdx) return null;
    return dragIdx < dropIdx ? 'down' : 'up';
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTab(id);
    e.dataTransfer.effectAllowed = 'move';
    startAutoScroll('sidebar');
  };
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverTab(id); };
  const handleDragLeave = () => setDragOverTab(null);
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    setDragOverTab(null);
    e.preventDefault();
    stopAutoScroll();
    if (!draggedTab || draggedTab === targetId) return;
    const newTabs = [...adminSidebarTabs];
    const draggedIdx = newTabs.indexOf(draggedTab);
    const targetIdx = newTabs.indexOf(targetId);
    newTabs.splice(draggedIdx, 1);
    newTabs.splice(targetIdx, 0, draggedTab);
    setAdminSidebarTabs(newTabs);
    setDraggedTab(null);
  };

  // Rest of states...
  const defaultCms: HomepageConfig = { sectionOrder: ['hero', 'about', 'categories', 'suggestions', 'offers', 'reviews'], hero: { desktopImage: '', mobileImage: '', title: '', subtitle: '', description: '' }, about: { image: '', title: '', description: '' }, visibleCategories: [] };
  const [localCms, setLocalCms] = useState<HomepageConfig>(homepageConfig || defaultCms);
  useEffect(() => { 
    const config = JSON.parse(JSON.stringify(homepageConfig || defaultCms));
    // Repair section order if it's missing crucial blocks
    const requiredSections = ['hero', 'about', 'categories', 'suggestions', 'offers', 'reviews'];
    const currentSections = config.sectionOrder || [];
    const missingSections = requiredSections.filter(s => !currentSections.includes(s));
    
    if (missingSections.length > 0) {
      config.sectionOrder = [...currentSections, ...missingSections];
      // Optional: enforce exact order to fix broken layouts
      config.sectionOrder = requiredSections.filter(s => config.sectionOrder.includes(s));
    }
    
    setLocalCms(config); 
  }, [homepageConfig]);

  // Product, Category, Branch, Article Forms (omitted in this block, same as before)
  // Re-use logic for brevity:
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const handleOpenProduct = (p?: Product) => { if(p) {setEditingProduct(p); setProductForm(p);} else {setEditingProduct(null); setProductForm({title:'', subtitle:'', description:'', category: categories[0]?.name||'Ethnic', price:0, stockQuantity:10, discountPercentage:0, images:[''], sizes:['S','M','L'], colors:[], isNew:true});} setProductModalOpen(true); };
  const isSavingProductRef = useRef(false);
  const handleSaveProduct = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (isSavingProductRef.current) return;
    isSavingProductRef.current = true;
    if (editingProduct) updateProduct(editingProduct.id, productForm); 
    else addProduct(productForm as any); 
    setProductModalOpen(false); 
    setTimeout(() => { isSavingProductRef.current = false; }, 500);
  };

  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({});
  const handleOpenCategory = (c?: Category) => { if(c) {setEditingCategory(c); setCategoryForm(c);} else {setEditingCategory(null); setCategoryForm({name:'', image:'', tagline:'', order:categories.length+1});} setCategoryModalOpen(true); };
  const isSavingCategoryRef = useRef(false);
  const handleSaveCategory = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (isSavingCategoryRef.current) return;
    isSavingCategoryRef.current = true;
    setIsSaving(true);
    // simulate network delay for better UX
    await new Promise(r => setTimeout(r, 600));
    const slug = categoryForm.name?.toLowerCase().replace(/\s+/g, '-')||''; 
    if (editingCategory) updateCategory({...editingCategory, ...categoryForm, slug} as any); 
    else addCategory({...categoryForm, id: 'cat-'+Date.now(), slug} as any); 
    setIsSaving(false);
    setCategoryModalOpen(false); 
    isSavingCategoryRef.current = false;
  };

  const [isBranchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState<Partial<Branch>>({});
  const handleOpenBranch = (b?: Branch) => { if(b) {setEditingBranch(b); setBranchForm(b);} else {setEditingBranch(null); setBranchForm({name:'', location:'', address:'', mapLink:'', phone:'', workingDays:'Monday - Saturday', openTime:'09:00', closeTime:'18:00', inChargeName:'', inChargeNumber:'', isMainBranch: false, status: 'open'});} setBranchModalOpen(true); };
  const isSavingBranchRef = useRef(false);
  const handleSaveBranch = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (isSavingBranchRef.current) return;
    isSavingBranchRef.current = true;
    if (editingBranch) updateBranch({...editingBranch, ...branchForm} as any); 
    else addBranch({...branchForm, id: 'br-'+Date.now()} as any); 
    setBranchModalOpen(false); 
    setTimeout(() => { isSavingBranchRef.current = false; }, 500);
  };

  const [isArticleModalOpen, setArticleModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [viewingImagesForProduct, setViewingImagesForProduct] = useState<any>(null);
  const [imageSlideIndex, setImageSlideIndex] = useState(0);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [announcementForm, setAnnouncementForm] = useState<Partial<Announcement>>({ id: '', text: '', code: '', discountPercentage: 0 });
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingAnnouncement) return;
    setIsSavingAnnouncement(true);
    if (editingAnnouncement) {
      updateAnnouncement(announcementForm.id!, announcementForm);
    } else {
      addAnnouncement({ 
        ...announcementForm, 
        text: announcementForm.text || '',
        id: 'ann-'+Date.now()+'-'+Math.random().toString(36).substr(2, 5), 
        type: 'info', 
        isActive: true 
      } as Announcement);
    }
    setAnnouncementModalOpen(false);
    setTimeout(() => { setIsSavingAnnouncement(false); }, 500);
  };
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleForm, setArticleForm] = useState<Partial<Article>>({});
  const handleOpenArticle = (a?: Article) => { if(a) {setEditingArticle(a); setArticleForm(a);} else {setEditingArticle(null); setArticleForm({title:'', description:'', image:'', link:'', date: new Date().toISOString().split('T')[0]});} setArticleModalOpen(true); };
  const isSavingArticleRef = useRef(false);
  const handleSaveArticle = (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (isSavingArticleRef.current) return;
    isSavingArticleRef.current = true;
    if (editingArticle) updateArticle({...editingArticle, ...articleForm} as any); 
    else addArticle({...articleForm, id: 'ar-'+Date.now()} as any); 
    setArticleModalOpen(false); 
    setTimeout(() => { isSavingArticleRef.current = false; }, 500);
  };

  const [orderFilter, setOrderFilter] = useState<'All' | 'Processing' | 'Shipped' | 'Delivered'>('All');
  const filteredOrders = orders.filter(o => orderFilter === 'All' ? true : o.status === orderFilter);
  const validCustomers = customers.filter(c => c.role !== 'admin');

  // Promotion
  const [promoForm, setPromoForm] = useState<Promotion>(promotion || { id: 'promo-1', images: [''], title: 'Special Promotion', isActive: false });
  const [viewingBackups, setViewingBackups] = useState(false);
  const isSavingPromoRef = useRef(false);
  const handleSavePromo = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (isSavingPromoRef.current) return;
    isSavingPromoRef.current = true;
    updatePromotion(promoForm); 
    
    // Let subscribed customers know a new offer is live
    let notified = false;
    if (promoForm.isActive) {
      notified = await broadcastPush({
        title: promoForm.title || 'A new offer is live',
        body: promoForm.description || 'Tap to see the latest offer.',
        url: promoForm.slides?.[0]?.link || '/'
      });
    }
    
    alert(notified ? 'Offer saved and customers have been notified.' : 'Offer saved.'); 
    setTimeout(() => { isSavingPromoRef.current = false; }, 500);
  };

  // Client Details Order History Modal
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [trackingSaved, setTrackingSaved] = useState<Record<string, boolean>>({});
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const [rateInputs, setRateInputs] = useState<Record<string, string>>({});
  const [rateSaved, setRateSaved] = useState<Record<string, boolean>>({});
  const [shippingSearch, setShippingSearch] = useState('');
  const clientOrders = selectedClient ? orders.filter(o => o.customerName === selectedClient.name) : [];

  if (!isAuthorized) return <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-2xl font-serif-luxury">Authenticating...</div>;

  return (
    <div className="h-screen overflow-hidden bg-[#FDFBF7] text-stone-900 flex font-sans">
      <aside 
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-stone-200 flex flex-col fixed h-screen top-0 z-10 shadow-sm transition-all duration-300`}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="p-4 border-b border-stone-100 flex items-center justify-between h-[73px]">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity text-left bg-transparent border-none p-0 outline-none w-full"
            title="Go to Homepage"
          >
            <img src="/logo.jpg" alt="DOOZY" className="w-10 h-10 shrink-0 object-contain rounded-sm shadow-md bg-white p-1" />
            {!isSidebarCollapsed && (
              <div className="whitespace-nowrap">
                <h1 className="font-serif-luxury font-bold text-lg text-stone-900 leading-tight">DOOZY</h1>
                <p className="text-[9px] uppercase tracking-widest text-stone-500 font-bold">Admin OS</p>
              </div>
            )}
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-hide">
          {adminSidebarTabs.map(tabId => {
            const tab = ALL_TABS[tabId as keyof typeof ALL_TABS];
            if (!tab) return null;
            const Icon = tab.icon;
            return (
              <div 
                key={tabId} 
                draggable={!isSidebarCollapsed}
                onDragStart={(e) => handleDragStart(e, tabId)}
                onDrag={(e) => { if (e.clientY > 0) lastMouseY.current = e.clientY; }}
                onDragOver={(e) => handleDragOver(e, tabId)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, tabId)}
                onDragEnd={() => { stopAutoScroll(); setDraggedTab(null); setDragOverTab(null); }}
                className={`relative flex items-center gap-2 group transition-all duration-200 ${
                  dragOverTab === tabId && draggedTab !== tabId 
                    ? getTabDragDirection(tabId) === 'down'
                      ? "before:content-[''] before:absolute before:-bottom-1 before:left-0 before:right-0 before:h-[2px] before:bg-[#800020] before:z-20 after:content-[''] after:absolute after:-bottom-[5px] after:-left-1 after:w-2.5 after:h-2.5 after:rounded-full after:bg-[#800020] after:z-20"
                      : "before:content-[''] before:absolute before:-top-1 before:left-0 before:right-0 before:h-[2px] before:bg-[#800020] before:z-20 after:content-[''] after:absolute after:-top-[5px] after:-left-1 after:w-2.5 after:h-2.5 after:rounded-full after:bg-[#800020] after:z-20" 
                    : ""
                }`}
              >
                {!isSidebarCollapsed && (
                  <div className="cursor-grab opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-stone-700 active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>
                )}
                <button
                  onClick={() => setActiveTab(tabId)}
                  title={isSidebarCollapsed ? tab.label : ''}
                  className={`flex-1 flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-sm text-sm font-semibold transition-all duration-700 ease-[0.22,1,0.36,1] ${activeTab === tabId ? 'bg-[#800020] text-white shadow-md' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isSidebarCollapsed && <span className="whitespace-nowrap truncate">{tab.label}</span>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t border-stone-100 space-y-2">
          <button onClick={() => setAdminSidebarTabs(['dashboard', 'orders', 'products', 'categories', 'reels', 'customers', 'announcements', 'promotion', 'branches', 'reviews', 'offers', 'cms', 'logs', 'settings'])} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-sm text-sm font-bold`} title="Reset Sidebar Layout">
            <RefreshCw className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Reset Layout</span>}
          </button>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-sm text-sm font-bold`}>
            <Menu className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Collapse</span>}
          </button>
          <button onClick={logout} className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-sm text-sm font-bold`}>
            <LogOut className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main 
        id="admin-main-content"
        className={`flex-1 ${isSidebarCollapsed ? "ml-20" : "ml-64"} p-4 sm:p-8 transition-all duration-300 h-screen overflow-y-auto pb-24 w-full overflow-x-hidden`}
        onDragOver={(e) => e.preventDefault()}
      >
        
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Command Center</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-[15px] border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><DollarSign className="w-6 h-6" /></div>
                <div><p className="text-[10px] font-bold uppercase text-stone-500">Total Revenue</p><p className="text-2xl font-bold font-serif-luxury">{formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}</p></div>
              </div>
              <div className="bg-white p-6 rounded-[15px] border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><ShoppingBag className="w-6 h-6" /></div>
                <div><p className="text-[10px] font-bold uppercase text-stone-500">Total Orders</p><p className="text-2xl font-bold font-serif-luxury">{orders.length}</p></div>
              </div>
              <div className="bg-white p-6 rounded-[15px] border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><Package className="w-6 h-6" /></div>
                <div><p className="text-[10px] font-bold uppercase text-stone-500">Inventory</p><p className="text-2xl font-bold font-serif-luxury">{products.length}</p></div>
              </div>
              <div className="bg-white p-6 rounded-[15px] border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><Users className="w-6 h-6" /></div>
                <div><p className="text-[10px] font-bold uppercase text-stone-500">Total Clients</p><p className="text-2xl font-bold font-serif-luxury">{validCustomers.length}</p></div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-8 rounded-[15px] border border-stone-200 shadow-sm mt-8 w-full overflow-hidden">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                <div>
                  <h3 className="font-serif-luxury text-2xl font-bold text-stone-900 shrink-0">Advanced Analytics</h3>
                  <p className="text-stone-500 text-sm mt-1">Visualize your revenue streams in detail.</p>
                </div>
                
                
                <div className="flex flex-wrap gap-2 sm:gap-4 w-full xl:w-auto overflow-x-auto pb-2 hide-scrollbar">
                  

                  {/* Time Range Selector */}
                  <div className="flex bg-stone-50 p-1 rounded-lg border border-stone-200 shrink-0 shadow-sm">
                    {[{id: '7d', l: '7 Days'}, {id: '1m', l: '1 Month'}, {id: '6m', l: '6 Months'}, {id: '1y', l: '1 Year'}, {id: 'all', l: 'All Time'}].map((t) => (
                      <button 
                        key={t.id} 
                        onClick={() => setAnalyticsTimeRange(t.id as any)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${analyticsTimeRange === t.id ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'}`}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>

                  {/* View Selector */}
                  <div className="flex bg-stone-50 p-1 rounded-lg border border-stone-200 shrink-0 shadow-sm">
                    {['date', 'time', 'product', 'client'].map((v) => (
                      <button 
                        key={v} 
                        onClick={() => setAnalyticsView(v as any)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${analyticsView === v ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'}`}
                      >
                        By {v}
                      </button>
                    ))}
                  </div>

                  {/* Chart Type Selector */}
                  <div className="flex bg-stone-50 p-1 rounded-lg border border-stone-200 shrink-0 shadow-sm">
                    {['bar', 'line', 'pie'].map((v) => (
                      <button 
                        key={v} 
                        onClick={() => setAnalyticsChartType(v as any)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${analyticsChartType === v ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[400px] w-full min-w-0 mt-4">
                {(() => {
                  const now = new Date();
                  const filteredOrders = orders.filter(o => {
                    if (analyticsTimeRange === 'all') return true;
                    const orderDate = new Date(o.createdAt || o.date);
                    const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
                    if (analyticsTimeRange === '7d') return diffDays <= 7;
                    if (analyticsTimeRange === '1m') return diffDays <= 30;
                    if (analyticsTimeRange === '6m') return diffDays <= 180;
                    if (analyticsTimeRange === '1y') return diffDays <= 365;
                    return true;
                  });

                  let chartData: { name: string; value: number }[] = [];
                  
                  if (analyticsView === 'date') {
                    if (analyticsTimeRange === 'all') {
                      let oldestDate = new Date();
                      if (orders.length > 0) {
                        const validTimes = orders.map(o => new Date(o.createdAt || o.date).getTime()).filter(t => !isNaN(t));
                        if (validTimes.length > 0) oldestDate = new Date(Math.min(...validTimes));
                        if (oldestDate.getTime() > new Date().getTime()) oldestDate = new Date(); // prevent future date bugs
                      }
                      oldestDate.setDate(oldestDate.getDate() - 1); // Start one day before
                      const now = new Date();
                      const diffDays = Math.max(1, Math.ceil((now.getTime() - oldestDate.getTime()) / (1000 * 3600 * 24)));
                      
                      if (diffDays <= 60) {
                        const days = diffDays + 1;
                        const dateArr = Array.from({length: days}).map((_, i) => {
                          const d = new Date(now);
                          d.setDate(d.getDate() - ((days - 1) - i));
                          return d;
                        });
                        chartData = dateArr.map(d => {
                          const dayOrders = filteredOrders.filter(o => new Date(o.createdAt || o.date).toDateString() === d.toDateString());
                          return { name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0) };
                        });
                      } else {
                        const monthsDiff = Math.max(1, (now.getFullYear() - oldestDate.getFullYear()) * 12 + (now.getMonth() - oldestDate.getMonth()) + 1);
                        const dateArr = Array.from({length: monthsDiff}).map((_, i) => {
                          const d = new Date(now);
                          d.setDate(1); // Fix month rollover bug for 31-day months
                          d.setMonth(d.getMonth() - ((monthsDiff - 1) - i));
                          return d;
                        });
                        chartData = dateArr.map(d => {
                          const monthOrders = filteredOrders.filter(o => {
                            const od = new Date(o.createdAt || o.date);
                            return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
                          });
                          return { name: d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }), value: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0) };
                        });
                      }
                    } else if (analyticsTimeRange === '7d' || analyticsTimeRange === '1m') {
                      const days = analyticsTimeRange === '7d' ? 7 : 30;
                      const dateArr = Array.from({length: days}).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - ((days - 1) - i));
                        return d;
                      });
                      chartData = dateArr.map(d => {
                        const dayOrders = filteredOrders.filter(o => new Date(o.createdAt || o.date).toDateString() === d.toDateString());
                        return { 
                          name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
                          value: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0) 
                        };
                      });
                    } else {
                      const months = analyticsTimeRange === '6m' ? 6 : 12;
                      const monthArr = Array.from({length: months}).map((_, i) => {
                        const d = new Date();
                        d.setDate(1); // Fix month rollover bug for 31-day months
                        d.setMonth(d.getMonth() - ((months - 1) - i));
                        return d;
                      });
                      chartData = monthArr.map(d => {
                        const monthOrders = filteredOrders.filter(o => {
                          const od = new Date(o.createdAt || o.date);
                          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
                        });
                        return { 
                          name: d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }), 
                          value: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0) 
                        };
                      });
                    }
                  } else if (analyticsView === 'time') {
                    const blocks = [{ l: 'Morning (6am-12pm)', h: [6,12] }, { l: 'Afternoon (12pm-5pm)', h: [12,17] }, { l: 'Evening (5pm-9pm)', h: [17,21] }, { l: 'Night (9pm-6am)', h: [21,6] }];
                    chartData = blocks.map(b => {
                      const blockOrders = filteredOrders.filter(o => {
                        const h = new Date(o.createdAt || o.date).getHours();
                        return b.h[0] < b.h[1] ? (h >= b.h[0] && h < b.h[1]) : (h >= b.h[0] || h < b.h[1]);
                      });
                      return { name: b.l, value: blockOrders.reduce((sum, o) => sum + (o.total || 0), 0) };
                    });
                  } else if (analyticsView === 'product') {
                    const productSales: Record<string, number> = {};
                    filteredOrders.forEach(o => {
                      if (o.items && Array.isArray(o.items)) {
                        o.items.forEach(i => { 
                          const title = i?.product?.title || i?.title || 'Unknown Product';
                          const price = i?.product?.price || i?.price || 0;
                          const qty = i?.quantity || 1;
                          productSales[title] = (productSales[title] || 0) + (price * qty); 
                        });
                      }
                    });
                    const sorted = Object.entries(productSales).sort((a,b) => b[1] - a[1]).slice(0, 5);
                    chartData = sorted.length ? sorted.map(([title, val]) => ({ name: title.length > 20 ? title.substring(0,17)+'...' : title, value: val })) : [{ name: 'No Products', value: 0 }];
                  } else if (analyticsView === 'client') {
                    const clientSales: Record<string, number> = {};
                    filteredOrders.forEach(o => { 
                      const email = o.customerEmail || 'Guest Client';
                      clientSales[email] = (clientSales[email] || 0) + (o.total || 0); 
                    });
                    const sorted = Object.entries(clientSales).sort((a,b) => b[1] - a[1]).slice(0, 5);
                    chartData = sorted.length ? sorted.map(([email, val]) => ({ name: email.split('@')[0].substring(0,15), value: val })) : [{ name: 'No Clients', value: 0 }];
                  }

                  // If empty (except when we explicitly handled empty state like Product/Client), ensure there's a baseline
                  if (chartData.every(d => d.value === 0) && analyticsChartType === 'pie') {
                     // Pie charts can't render 0 data well, give a fallback gray slice
                     chartData = [{ name: 'No Revenue Data', value: 1 }];
                  }

                  const PIE_COLORS = ['#800020', '#A3334E', '#C4667B', '#E099A8', '#F5CCD3', '#F9E6E9', '#D1C4A5'];

                  const formatTooltip = (val: number) => {
                     if (chartData.length === 1 && chartData[0].name === 'No Revenue Data') return formatPrice(0);
                     return formatPrice(val);
                  };

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      {analyticsChartType === 'bar' ? (
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <defs>
                            <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#800020" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#800020" stopOpacity={0.6} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" opacity={0.6} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c', fontWeight: 600 }} dy={15} angle={-35} textAnchor="end" interval="preserveStartEnd" height={60} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#78716c' }} tickFormatter={(v) => `${v}`} dx={-10} />
                          <RechartsTooltip cursor={{ fill: '#fafaf9' }} formatter={(v: any) => [formatPrice(v), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#1c1917', marginBottom: '4px' }} />
                          <Bar dataKey="value" fill="url(#barColor)" radius={[6, 6, 0, 0]} maxBarSize={60} />
                        </BarChart>
                      ) : analyticsChartType === 'line' ? (
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" opacity={0.6} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c', fontWeight: 600 }} dy={15} angle={-35} textAnchor="end" interval="preserveStartEnd" height={60} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#78716c' }} tickFormatter={(v) => `${v}`} dx={-10} />
                          <RechartsTooltip formatter={(v: any) => [formatPrice(v), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#1c1917', marginBottom: '4px' }} />
                          <Line type="monotone" dataKey="value" stroke="#800020" strokeWidth={4} dot={{ r: 5, fill: '#800020', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, fill: '#800020', stroke: '#fff', strokeWidth: 3 }} />
                        </LineChart>
                      ) : (
                        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={130}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.name === 'No Revenue Data' ? '#f5f5f4' : PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(v: any) => [formatTooltip(v), 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                          <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#78716c' }} iconType="circle" />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        
        {/* Reels Tab */}
        {activeTab === 'reels' && (
          <div className="space-y-6 animate-in fade-in duration-500 w-full">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Shorts / Reels Manager</h2>
                <p className="text-stone-500 mt-1">Add video links to feature in the visual stories section on the homepage.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[15px] border border-stone-200 shadow-sm flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">New Video URL (mp4, webm, etc)</label>
                <input type="text" value={newReelUrl} onChange={e => setNewReelUrl(e.target.value)} placeholder="https://example.com/video.mp4" className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2.5 px-4 text-sm focus:outline-none focus:border-[#800020]" />
              </div>
              <button onClick={() => {
                if(newReelUrl.trim()) {
                  addShortReel({ id: 'reel-'+Date.now(), videoUrl: newReelUrl.trim(), order: shortReels.length });
                  setNewReelUrl('');
                }
              }} className="px-6 py-2.5 bg-[#800020] text-white text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#5c0017] transition-colors whitespace-nowrap">
                Add Reel
              </button>
            </div>

            <div className="space-y-4">
              {shortReels.map((reel, idx) => (
                <div 
                  key={reel.id || idx} 
                  draggable
                  onDragStart={(e) => handleReelDragStart(e, reel.id)}
                  onDragOver={(e) => handleReelDragOver(e, reel.id)}
                  onDragLeave={handleReelDragLeave}
                  onDrop={(e) => handleReelDrop(e, reel.id)}
                  onDragEnd={() => { setDraggedReel(null); setDragOverReel(null); }}
                  className={`bg-white p-4 rounded-sm border shadow-sm flex items-center gap-4 cursor-grab active:cursor-grabbing relative transition-all duration-200 ${
                    dragOverReel === reel.id && draggedReel !== reel.id 
                      ? getReelDragDirection(reel.id) === 'down'
                        ? "border-[#800020] border-b-2"
                        : "border-[#800020] border-t-2" 
                      : "border-stone-200"
                  }`}
                >
                  <div className="text-stone-400 p-2">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  
                  
                  <div className="w-16 h-24 bg-stone-900 rounded overflow-hidden shrink-0">
                    <video src={reel.videoUrl} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{reel.videoUrl}</p>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Order: {idx + 1}</p>
                  </div>

                  <button onClick={() => {
                    const newUrl = prompt('Edit Video URL:', reel.videoUrl);
                    if (newUrl && newUrl.trim()) {
                      addShortReel({ ...reel, videoUrl: newUrl.trim() });
                    }
                  }} className="p-2 text-stone-400 hover:text-[#800020] transition-colors" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button onClick={() => deleteShortReel(reel.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {shortReels.length === 0 && <p className="text-stone-500 text-center py-8">No reels added yet.</p>}
            </div>
          </div>
        )}


        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Categories</h2>
                <p className="text-stone-500 mt-1">Manage product collections and designs.</p>
              </div>
              <button onClick={() => { setEditingCategory(null); setCategoryForm({ id: '', name: '', image: '', tagline: '', isSpecial: false } as any); setCategoryModalOpen(true); }} className="bg-[#800020] text-white px-6 py-3 rounded-[15px] text-sm font-bold shadow-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>
            
            <div className="bg-white rounded-[15px] border border-stone-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-500">
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Designs Label</th>
                    <th className="p-4 font-bold">Tagline</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {categories.map((cat, idx) => (
                    <tr 
                      key={cat.id || idx} 
                      draggable 
                      onDragStart={(e) => handleCategoryDragStart(e, cat.id)}
                      onDrag={(e) => { if (e.clientY > 0) lastMouseY.current = e.clientY; }}
                      
                      onDragOver={(e) => handleCategoryDragOver(e, cat.id)}
                      onDragLeave={() => setDragOverCategoryId(null)}
                      onDrop={(e) => handleDropCategory(e, cat.id)}
                      onDragEnd={() => { stopAutoScroll(); setDraggedCategoryId(null); setDragOverCategoryId(null); }}
                      className={`hover:bg-stone-50/50 transition-colors duration-700 ease-[0.22,1,0.36,1] group ${
                        dragOverCategoryId === cat.id && draggedCategoryId !== cat.id
                          ? getCategoryDragDirection(cat.id) === 'down'
                            ? '[&>td]:shadow-[inset_0_-2px_0_0_#800020] relative [&>td:first-child]:before:content-[\'\'] [&>td:first-child]:before:absolute [&>td:first-child]:before:-left-1 [&>td:first-child]:before:-bottom-[3px] [&>td:first-child]:before:w-2 [&>td:first-child]:before:h-2 [&>td:first-child]:before:rounded-full [&>td:first-child]:before:bg-[#800020] [&>td:first-child]:before:z-20 [&>td:first-child]:relative'
                            : '[&>td]:shadow-[inset_0_2px_0_0_#800020] relative [&>td:first-child]:before:content-[\'\'] [&>td:first-child]:before:absolute [&>td:first-child]:before:-left-1 [&>td:first-child]:before:-top-[3px] [&>td:first-child]:before:w-2 [&>td:first-child]:before:h-2 [&>td:first-child]:before:rounded-full [&>td:first-child]:before:bg-[#800020] [&>td:first-child]:before:z-20 [&>td:first-child]:relative'
                          : ''
                      }`} 
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-stone-200 rounded-md text-stone-400 hover:text-stone-600 transition-colors" title="Drag to reorder">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div 
                            onClick={(e) => { e.stopPropagation(); setViewingImage(cat.image || 'https://via.placeholder.com/300'); }}
                            className="relative w-12 h-12 rounded-lg overflow-hidden border border-stone-200 cursor-zoom-in group/img shrink-0 shadow-sm"
                            title="View full image"
                          >
                            <img src={cat.image || 'https://via.placeholder.com/300'} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110 bg-stone-100" />
                            <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                               <Search className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          </div>
                          <p className="font-bold text-stone-900">{cat.name}</p>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-stone-700">{products.filter(p => p.category === cat.name).length} Designs</td>
                      <td className="p-4 text-stone-500">{cat.tagline}</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); setCategoryForm(cat as any); setCategoryModalOpen(true); }}
                          className="p-2 text-stone-400 hover:text-[#800020] transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(confirm('Delete category?')) deleteCategory(cat.id); }} 
                          className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categories.length === 0 && (
                <div className="p-10 text-center text-stone-500">
                  <p>No categories found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clients */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Client Details</h2>
            <div className="bg-white rounded-[15px] border border-stone-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-500">
                    <th className="py-4 px-6 font-bold">Client Name</th>
                    <th className="py-4 px-6 font-bold">Email</th>
                    <th className="py-4 px-6 font-bold">Phone Number</th>
                    
                    <th className="py-4 px-6 font-bold text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {validCustomers.map(c => {
                    const cOrders = orders.filter(o => o.customerEmail === c.email);
                    const spent = cOrders.reduce((sum, o) => sum + o.total, 0);
                    const isVIP = spent > 50000;
                    return (
                    <tr key={c.id} onClick={() => { setSelectedClient(c); logActivity('Inspected Client', `Opened profile and order history for ${c.name}`); }} className="hover:bg-stone-50 cursor-pointer transition-colors duration-700 ease-[0.22,1,0.36,1] group">
                      <td className="py-4 px-6 font-bold text-[#800020] group-hover:underline flex items-center gap-2">
                        {c.name}
                        {isVIP && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] uppercase tracking-wider rounded-sm font-bold flex items-center gap-1"><Award className="w-3 h-3" /> VIP</span>}
                      </td>
                      <td className="py-4 px-6">{c.email}</td>
                      <td className="py-4 px-6 font-medium text-stone-700">{c.phone || "Not Provided"}</td>
                      
                      <td className="py-4 px-6 font-bold text-stone-900 text-right">
                        {formatPrice(spent)}
                      </td>
                    </tr>
                  )})}

                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Client Orders Modal */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-sm w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8 border border-stone-200 shadow-md relative">
              <button onClick={() => setSelectedClient(null)} className="absolute top-6 right-6 w-8 h-8 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full flex items-center justify-center transition-colors">✕</button>
              <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-2">{selectedClient.name}'s History</h2>
              <p className="text-sm text-stone-500 mb-6">{selectedClient.email} | {selectedClient.phone || 'No phone'}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-8 bg-stone-50 p-4 border border-stone-200 rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#800020] opacity-5 rounded-bl-full pointer-events-none"></div>
                <div>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><Package className="w-3 h-3"/> Total Orders</p>
                  <p className="text-2xl font-serif-luxury font-bold text-stone-900">{clientOrders.length}</p>
                </div>
                <div className="border-l border-stone-200 pl-4">
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Lifetime Value</p>
                  <p className="text-2xl font-serif-luxury font-bold text-[#800020]">{formatPrice(clientOrders.reduce((sum, o) => sum + (o.total || 0), 0))}</p>
                </div>
                
              </div>
              
              
              
              <div className="space-y-4">
                {clientOrders.length === 0 ? <p className="text-stone-500 text-center py-8">No orders found for this client.</p> : 
                  clientOrders.map((o, idx) => (
                    <div key={o.id || idx} className="border border-stone-200 rounded-sm p-4 bg-stone-50">
                      <div className="flex justify-between items-center font-bold text-stone-900 mb-2 border-b border-stone-200 pb-2">
                        <div>
                          <span>Order</span>
                          <span className="block text-[10px] text-stone-500 uppercase tracking-widest mt-1 font-normal">
                            {o.createdAt ? new Date(o.createdAt).toLocaleString() : new Date(o.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-right"><span className="text-[#800020] block">{formatPrice(o.total || (o as any).totalAmount || 0)}</span><span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200 px-2 py-0.5 rounded-sm mt-1 inline-block">{o.status || 'Ordered'}</span></div>
                      </div>
                      <div className="space-y-2 mt-3 text-sm">
                        {o.items?.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-stone-700 group cursor-pointer" onClick={() => window.open(`/products/${item.productId}`, '_blank')}>
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt="" className="w-8 h-8 rounded object-cover border border-stone-200 group-hover:border-[#800020] transition-colors" />
                              <span className="group-hover:text-[#800020] group-hover:underline transition-colors">{item.quantity}x {item.title} ({item.size} / {item.color || (item as any).selectedColor?.name || 'Default'})</span>
                            </div>
                            <span className="font-medium">{formatPrice((item.price || 0) * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Product Offers</h2>
            <p className="text-stone-500 mt-1">Manage discounts for individual products independently of global coupon codes.</p>
            <div className="bg-white rounded-[15px] border border-stone-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-500">
                    <th className="py-4 px-6 font-bold">Product</th>
                    <th className="py-4 px-6 font-bold">Base Price</th>
                    <th className="py-4 px-6 font-bold">Discount %</th>
                    <th className="py-4 px-6 font-bold">Final Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-stone-50 transition-colors duration-700 ease-[0.22,1,0.36,1]">
                      <td className="py-4 px-6 flex items-center gap-4">
                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-stone-200" />
                        <span className="font-bold text-stone-900">{p.title}</span>
                      </td>
                      <td className="py-4 px-6">{formatPrice(p.price)}</td>
                      <td className="py-4 px-6">
                        <input type="number" min="0" max="100" value={p.discountPercentage || 0} onChange={e => updateProduct(p.id, { discountPercentage: Number(e.target.value) })} className="w-20 bg-white border border-stone-200 rounded p-2 text-center text-sm font-bold text-[#800020] focus:outline-none focus:border-[#800020]" />
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-700">
                        {p.discountPercentage ? formatPrice(p.price - (p.price * (p.discountPercentage/100))) : formatPrice(p.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Promotional Popup Tab */}
        {activeTab === 'promotion' && (
          <div className="space-y-6 animate-in fade-in duration-500 w-full">
            <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Promotional Floating Modal</h2>
            <p className="text-stone-500 mt-1">Configure the welcome popup displayed when users enter the website.</p>
            <form onSubmit={handleSavePromo} className="bg-white p-8 rounded-[15px] border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
                <label className="text-sm font-bold text-stone-900 flex-1">Enable Promotion Modal</label>
                <div 
                  onClick={() => setPromoForm({...promoForm, isActive: !promoForm.isActive})}
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${promoForm.isActive ? 'bg-emerald-500' : 'bg-stone-300'}`}
                >
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${promoForm.isActive ? 'translate-x-6' : ''}`} />
                </div>
              </div>
              <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Promotion Slides</label>
                <div className="space-y-6">
                  {(promoForm.slides || (promoForm.images ? promoForm.images.map(img => ({ desktopImage: img, mobileImage: img, link: '' })) : [])).map((slide, i, arr) => (
                    <div key={i} className="p-4 border border-stone-100 bg-stone-50 rounded-sm relative">
                      <button type="button" onClick={() => {
                        const newSlides = [...arr];
                        newSlides.splice(i, 1);
                        setPromoForm({...promoForm, slides: newSlides});
                      }} className="absolute top-4 right-4 text-stone-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <h4 className="text-sm font-bold text-stone-700 mb-4">Slide {i + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Desktop Image URL</label>
                          <input type="text" required value={slide.desktopImage || ''} onChange={e => {
                            const newSlides = [...arr];
                            newSlides[i] = { ...slide, desktopImage: e.target.value };
                            setPromoForm({...promoForm, slides: newSlides});
                          }} className="w-full bg-white border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" placeholder="https://..." />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Mobile Image URL</label>
                          <input type="text" required value={slide.mobileImage || ''} onChange={e => {
                            const newSlides = [...arr];
                            newSlides[i] = { ...slide, mobileImage: e.target.value };
                            setPromoForm({...promoForm, slides: newSlides});
                          }} className="w-full bg-white border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" placeholder="https://..." />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Redirect Link (Optional)</label>
                          <input type="text" value={slide.link || ''} onChange={e => {
                            const newSlides = [...arr];
                            newSlides[i] = { ...slide, link: e.target.value };
                            setPromoForm({...promoForm, slides: newSlides});
                          }} className="w-full bg-white border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" placeholder="e.g. /categories/Ethnic or /products/123" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const currentSlides = promoForm.slides || (promoForm.images ? promoForm.images.map(img => ({ desktopImage: img, mobileImage: img, link: '' })) : []);
                    setPromoForm({...promoForm, slides: [...currentSlides, { desktopImage: '', mobileImage: '', link: '' }]});
                  }} className="w-full py-3 bg-stone-50 border border-dashed border-stone-300 rounded-[15px] text-stone-500 font-bold uppercase text-[10px] tracking-wider hover:bg-stone-100 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-3 h-3" /> Add Slide
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-[#800020] hover:bg-[#5c0017] text-white px-8 py-4 rounded-sm text-sm font-bold shadow-lg transition-colors">Save Promotion Settings</button>
            </form>
          </div>
        )}

        
        {/* Activity Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-in fade-in duration-500 w-full">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">{viewingBackups ? 'Deleted Backup Logs' : 'Activity Log'}</h2>
                <p className="text-stone-500 mt-1">{viewingBackups ? 'Historical logs awaiting automated 7-day deletion.' : 'Audit trail of all administrative actions taken in the system.'}</p>
              </div>
              <div className="flex gap-2">
                {viewingBackups ? (
                  <button onClick={() => setViewingBackups(false)} className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase rounded-[10px] flex items-center gap-2 shadow-sm transition-colors">
                    Back to Active Logs
                  </button>
                ) : (
                  <>
                    {backedUpLogs.length > 0 && (
                      <button onClick={() => setViewingBackups(true)} className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold uppercase rounded-[10px] flex items-center gap-2 shadow-sm transition-colors">
                        View Deleted Backups
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (confirm("Move all active logs to backup storage? They will auto-delete in 7 days.")) {
                          clearActivityLogs();
                        }
                      }} 
                      disabled={activityLogs.length === 0}
                      className={`px-4 py-2 text-xs font-bold uppercase rounded-[10px] flex items-center gap-2 transition-colors ${activityLogs.length === 0 ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-[#800020] hover:bg-[#5c0017] text-white shadow-sm'}`}
                    >
                      Clear Logs
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-[15px] border border-stone-200 shadow-sm overflow-hidden p-6 space-y-4">
              {(viewingBackups ? backedUpLogs : activityLogs).length === 0 ? (
                <p className="text-center text-stone-500 py-8">No activities logged yet.</p>
              ) : (
                (viewingBackups ? backedUpLogs : activityLogs).map((log, idx) => (
                  <div key={log.id || idx} className="flex gap-4 p-4 border border-stone-100 rounded-sm hover:border-stone-200 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-stone-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <span className="font-bold text-stone-900 text-sm">{log.action}</span>
                        <span className="text-[10px] uppercase font-bold text-stone-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-stone-500 text-sm break-words">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-500 w-full">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">System Settings</h2>
                <p className="text-stone-500 mt-1">Configure core operating parameters and administrative details.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-[15px] border border-stone-200 shadow-sm p-8 space-y-10">
              
              {/* Admin Profile */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Users className="w-5 h-5 text-stone-500" /> Administrative Account
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Admin Name</label>
                    <input type="text" value={storeSettings.adminName} onChange={e => updateStoreSettings({ adminName: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-[#800020] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Admin Email ID</label>
                    <input type="email" value={storeSettings.adminEmail} onChange={e => updateStoreSettings({ adminEmail: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-[#800020] transition-colors" />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Shield className="w-5 h-5 text-stone-500" /> Security Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-[#800020] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">New Password</label>
                    <input type="password" placeholder="Enter new password" className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-[#800020] transition-colors" />
                  </div>
                </div>
                <button onClick={() => alert('Password updated securely.')} className="mt-4 px-4 py-2 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors cursor-pointer">
                  Update Password
                </button>
              </div>

              {/* Store Config */}
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Settings className="w-5 h-5 text-stone-500" /> Store Configurations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Support WhatsApp Number</label>
                    <input type="text" value={storeSettings.supportWhatsApp} onChange={e => updateStoreSettings({ supportWhatsApp: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-[#800020] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Global Tax Rate (%)</label>
                    <div className="relative">
                      <input type="number" min="0" max="100" value={storeSettings.taxRate} onChange={e => updateStoreSettings({ taxRate: Number(e.target.value) })} className="w-full bg-stone-50 border border-stone-200 rounded-sm py-2.5 px-4 text-sm font-bold text-[#800020] focus:outline-none focus:border-[#800020] transition-colors" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">%</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-2">This tax rate is automatically applied to all customer checkouts.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button onClick={() => { alert('System configurations have been updated successfully.'); logActivity('System', 'Updated system settings'); }} className="px-8 py-3 bg-[#800020] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#5c0017] transition-colors cursor-pointer shadow-md">
                  Save All Settings
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Order Management</h2>
              </div>
              <div className="flex bg-white border border-stone-200 p-1 rounded-sm shadow-sm">
                {['All', 'Processing', 'Shipped', 'Delivered'].map(status => (
                  <button key={status} onClick={() => setOrderFilter(status as any)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${orderFilter === status ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}>{status}</button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredOrders.length === 0 ? <p className="text-stone-500">No orders found.</p> : filteredOrders.map((order, idx) => (
                <div key={order.id || idx} className="bg-white border border-stone-200 rounded-sm p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-stone-900">Customer Order</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Processing' ? 'bg-slate-100 text-slate-800' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>{order.status}</span>
                    </div>
                    <p className="text-sm text-stone-500">Placed on {new Date(order.date).toLocaleDateString()} by <span className="font-bold text-stone-700">{order.customerName}</span></p>
                    
                    <div className="bg-stone-50 border border-stone-100 rounded-sm p-4 space-y-3">
                      <p className="text-[10px] uppercase font-bold text-stone-500">Ordered Products</p>
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 cursor-pointer group" onClick={() => window.open(`/products/${item.productId}`, '_blank')}>
                          {item.image || (item as any).product?.images?.[0] ? <img src={item.image || (item as any).product?.images?.[0]} alt="" className="w-10 h-10 object-cover rounded shadow-sm border border-stone-200 group-hover:border-[#800020] transition-colors" /> : <div className="w-10 h-10 bg-stone-200 rounded group-hover:border-[#800020] transition-colors" />}
                          <div className="flex-1">
                            <p className="text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-[#800020] group-hover:underline transition-colors">{item.title || (item as any).product?.title || 'Unknown Product'}</p>
                            <p className="text-xs text-stone-500">Qty: {item.quantity} | Size: {item.size || item.selectedSize} | Color: {item.color || (item as any).selectedColor?.name || 'Default'}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 grid grid-cols-2 gap-8 text-sm">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Shipping Details</p>
                        <p className="text-stone-700 font-medium">{order.shippingAddress?.fullName}<br/>{order.shippingAddress?.street}, {order.shippingAddress?.city}<br/>Phone: {order.shippingAddress?.phone}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Total</p>
                        <p className="font-bold text-stone-900 text-lg">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-stone-100">
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-2">Tracking URL</p>
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          placeholder="e.g. https://www.bluedart.com/tracking..." 
                          value={trackingInputs[order.id] !== undefined ? trackingInputs[order.id] : (order.trackingLink || '')}
                          onChange={(e) => {
                            setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value });
                            setTrackingSaved({ ...trackingSaved, [order.id]: false });
                          }}
                          className="flex-1 bg-stone-50 border border-stone-200 rounded-sm p-2 text-xs focus:outline-none focus:border-[#800020]"
                        />
                        <button
                          onClick={() => {
                            const val = trackingInputs[order.id] !== undefined ? trackingInputs[order.id] : (order.trackingLink || '');
                            updateOrderTrackingLink(order.id, val);
                            setTrackingSaved({ ...trackingSaved, [order.id]: true });
                            setTimeout(() => setTrackingSaved(prev => ({...prev, [order.id]: false})), 3000);
                          }}
                          className={`flex items-center justify-center w-8 h-8 rounded-sm transition-colors ${trackingSaved[order.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-800 text-white hover:bg-stone-900'}`}
                          title="Save Tracking Link"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        {order.trackingLink && (
                          <a href={order.trackingLink} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 bg-stone-100 text-stone-700 rounded-sm hover:bg-stone-200" title="Test Link">
                            <ExternalLink className="w-3.5 h-3.5"/>
                          </a>
                        )}
                      </div>
                      <p className="text-[9px] text-stone-400 mt-1">Click the tick icon to permanently save this tracking link.</p>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto bg-stone-50 rounded-sm p-4 border border-stone-200 shrink-0 space-y-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-500 mb-3 text-center">Update Status</p>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => updateOrderStatus(order.id, 'Processing')} className="w-full px-4 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg text-center cursor-pointer hover:bg-slate-200">Processing</button>
                        <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="w-full px-4 py-2 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg text-center cursor-pointer hover:bg-blue-200">Shipped</button>
                        <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="w-full px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg text-center cursor-pointer hover:bg-emerald-200">Delivered</button>
                        </div>
                    </div>
                    {/* Invoice Button */}
                    <div className="border-t border-stone-200 pt-4 mt-2">
                      <button onClick={() => setViewingInvoice(order)} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-sm transition-colors"><ExternalLink className="w-3 h-3"/> View Invoice</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {/* CMS TAB */}
        {activeTab === 'cms' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Home Page CMS</h2>
              <button onClick={() => updateHomepageConfig(localCms)} className="bg-[#800020] text-white px-8 py-3 rounded-sm text-sm font-bold shadow-lg">Save All Changes</button>
            </div>
            <div className="grid grid-cols-1 w-full gap-8">
              <div className="bg-white p-8 rounded-[15px] border border-stone-200 shadow-sm space-y-5">
                <h3 className="font-serif-luxury text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">Hero Slideshow</h3>
                <div className="space-y-6">
                  {(localCms.heroSlides || []).map((slide, idx) => (
                    <div key={slide.id || idx} className="p-4 border border-stone-100 bg-stone-50 rounded-sm relative">
                      <button type="button" onClick={() => {
                        const newSlides = [...(localCms.heroSlides || [])];
                        newSlides.splice(idx, 1);
                        setLocalCms({...localCms, heroSlides: newSlides});
                      }} className="absolute top-4 right-4 text-stone-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <h4 className="text-sm font-bold text-stone-700 mb-4">Slide {idx + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Desktop Image URL</label>
                          <input type="text" value={slide.desktopImage} onChange={e => {
                            const newSlides = [...(localCms.heroSlides || [])];
                            newSlides[idx] = {...slide, desktopImage: e.target.value};
                            setLocalCms({...localCms, heroSlides: newSlides});
                          }} className="w-full bg-white border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Mobile Image URL</label>
                          <input type="text" value={slide.mobileImage} onChange={e => {
                            const newSlides = [...(localCms.heroSlides || [])];
                            newSlides[idx] = {...slide, mobileImage: e.target.value};
                            setLocalCms({...localCms, heroSlides: newSlides});
                          }} className="w-full bg-white border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Title</label>
                          <input type="text" value={slide.title || ''} onChange={e => {
                            const newSlides = [...(localCms.heroSlides || [])];
                            newSlides[idx] = {...slide, title: e.target.value};
                            setLocalCms({...localCms, heroSlides: newSlides});
                          }} className="w-full bg-white border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Redirect Link (e.g., /products/123)</label>
                          <input type="text" value={slide.link || ''} onChange={e => {
                            const newSlides = [...(localCms.heroSlides || [])];
                            newSlides[idx] = {...slide, link: e.target.value};
                            setLocalCms({...localCms, heroSlides: newSlides});
                          }} className="w-full bg-white border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const newSlides = [...(localCms.heroSlides || [])];
                    newSlides.push({ id: 'slide-' + Date.now(), desktopImage: '', mobileImage: '', title: '', link: '' });
                    setLocalCms({...localCms, heroSlides: newSlides});
                  }} className="w-full py-3 bg-stone-50 border border-dashed border-stone-300 rounded-[15px] text-stone-500 font-bold uppercase text-[10px] tracking-wider hover:bg-stone-100 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-3 h-3" /> Add Slide
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      

      
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Products</h2>
                <p className="text-stone-500 mt-1">Manage your catalog.</p>
              </div>
              <button onClick={() => { setEditingProduct(null); setProductForm({ id: '', title: '', subtitle: '', price: 0, category: categories[0]?.name || '', images: [], sizes: [], colors: [], stockQuantity: 0 }); setProductModalOpen(true); }} className="bg-[#800020] text-white px-6 py-3 rounded-[15px] text-sm font-bold shadow-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
            <div className="bg-white rounded-[15px] border border-stone-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase tracking-wider text-stone-500">
                    <th className="p-4 font-bold">Product</th>
                    <th className="p-4 font-bold">Category</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Stock</th>
                    <th className="p-4 font-bold">Images</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((product, idx) => (
                    <tr key={product.id} className={`${product.stockQuantity <= 0 ? 'bg-rose-50/80 hover:bg-rose-100 border-l-4 border-l-rose-600' : 'hover:bg-stone-50/50'} transition-colors duration-700 ease-[0.22,1,0.36,1] group`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={(e) => { e.stopPropagation(); setViewingImage(product.images?.[0] || 'https://via.placeholder.com/300'); }}
                            className={`relative w-12 h-12 rounded-lg overflow-hidden border cursor-zoom-in group/img shrink-0 shadow-sm ${product.stockQuantity <= 0 ? 'border-rose-200' : 'border-stone-200'}`}
                            title="View full image"
                          >
                            <img src={product.images?.[0] || 'https://via.placeholder.com/300'} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110 bg-stone-100" />
                            <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                               <Search className="w-5 h-5 text-white drop-shadow-md" />
                            </div>
                          </div>
                          <div>
                            <p className={`font-bold ${product.stockQuantity <= 0 ? 'text-rose-900' : 'text-stone-900'}`}>{product.title}</p>
                            {product.stockQuantity <= 0 && (
                              <span className="text-[9px] text-white font-bold uppercase tracking-widest bg-rose-600 px-1.5 py-0.5 rounded-sm inline-block mt-0.5 mr-1 shadow-sm">Out of Stock</span>
                            )}
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <span className="text-[9px] text-rose-600 font-bold uppercase tracking-widest bg-rose-50 px-1.5 py-0.5 rounded-sm inline-block mt-0.5">Sale</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><span className={`text-xs ${product.stockQuantity <= 0 ? 'bg-rose-100/50 text-rose-700' : 'bg-stone-100 text-stone-600'} px-2 py-1 rounded-md font-medium`}>{product.category}</span></td>
                      <td className={`p-4 font-serif-luxury font-bold text-base ${product.stockQuantity <= 0 ? 'text-rose-800' : 'text-[#800020]'}`}>{formatPrice(product.price)}</td>
                      <td className="p-4">
                        <span className={`font-bold ${product.stockQuantity <= 0 ? 'text-rose-600' : 'text-stone-900'}`}>{product.stockQuantity} units</span>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingImagesForProduct(product); setImageSlideIndex(0); }}
                          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-[#800020] transition-colors border border-stone-200 px-2 py-1 rounded-md bg-white hover:bg-stone-50"
                        >
                          <Eye className="w-3.5 h-3.5" /> View ({product.images?.length || 0})
                        </button>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setProductForm(product as any); setProductModalOpen(true); }}
                          className="p-2 text-stone-400 hover:text-[#800020] transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(confirm('Delete product?')) deleteProduct(product.id); }} 
                          className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      
        {/* Branches Tab */}
        {activeTab === 'branches' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Branches</h2>
                <p className="text-stone-500 mt-1">Manage physical store locations.</p>
              </div>
              <button onClick={() => { setEditingBranch(null); setBranchForm({ id: '', name: '', location: '', address: '', phone: '', status: 'open', isMainBranch: false, workingDays: 'Monday - Saturday', openTime: '09:00', closeTime: '18:00', mapLink: '', inChargeName: '', inChargeNumber: '' }); setBranchModalOpen(true); }} className="bg-[#800020] text-white px-6 py-3 rounded-[15px] text-sm font-bold shadow-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Branch
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {branches.map((branch, idx) => (
                <div 
                  key={branch.id || idx} 
                  draggable
                  onDragStart={(e) => handleBranchDragStart(e, branch.id)}
                  onDrag={(e) => { if (e.clientY > 0) lastMouseY.current = e.clientY; }}
                  onDragOver={(e) => handleBranchDragOver(e, branch.id)}
                  onDragLeave={() => setDragOverBranchId(null)}
                  onDrop={(e) => handleDropBranch(e, branch.id)}
                  onDragEnd={() => { stopAutoScroll(); setDraggedBranchId(null); setDragOverBranchId(null); }}
                  className={`group bg-white p-8 border border-stone-200 relative transition-all duration-300 hover:shadow-lg rounded-[15px] cursor-pointer ${
                    dragOverBranchId === branch.id && draggedBranchId !== branch.id
                      ? getBranchDragDirection(branch.id) === 'down'
                        ? "before:content-[''] before:absolute before:-bottom-[13px] before:left-0 before:right-0 before:h-[3px] before:bg-[#800020] before:z-50 before:rounded-full after:content-[''] after:absolute after:-bottom-[17px] after:-left-[5px] after:w-[11px] after:h-[11px] after:rounded-full after:bg-[#800020] after:z-50 after:border-[2px] after:border-white after:shadow-sm"
                        : "before:content-[''] before:absolute before:-top-[13px] before:left-0 before:right-0 before:h-[3px] before:bg-[#800020] before:z-50 before:rounded-full after:content-[''] after:absolute after:-top-[17px] after:-left-[5px] after:w-[11px] after:h-[11px] after:rounded-full after:bg-[#800020] after:z-50 after:border-[2px] after:border-white after:shadow-sm"
                      : ''
                  }`}
                >
                  
                  <div className="relative z-10 flex flex-col lg:flex-row gap-8 justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#800020] mb-2 block">{branch.location}</span>
                          <h3 className="font-serif-luxury text-3xl text-stone-900 mb-2 flex items-center gap-3">
                            {branch.name}
                            {branch.isMainBranch && <span className="text-[9px] bg-[#800020] text-white px-2 py-1 rounded-sm uppercase tracking-widest font-sans shadow-sm">Main</span>}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`w-2 h-2 rounded-full ${branch.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{branch.status === 'open' ? 'Currently Open' : (branch.status === 'holiday' ? 'Holiday (Closed)' : 'Closed')}</span>
                            {(branch.workingDays || (branch.openTime && branch.closeTime)) && (
                               <span className="text-xs text-stone-400 ml-2">({branch.workingDays ? branch.workingDays + ' ' : ''}{branch.openTime || ''} {branch.openTime && branch.closeTime ? '-' : ''} {branch.closeTime || ''})</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingBranch(branch); setBranchForm(branch as any); setBranchModalOpen(true); }} className="p-2 text-stone-400 hover:text-[#800020] bg-stone-50 rounded-full shadow-sm"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => { if(confirm('Delete?')) deleteBranch(branch.id); }} className="p-2 text-stone-400 hover:text-rose-600 bg-rose-50 rounded-full shadow-sm"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-100">
                        <div className="space-y-4">
                          <div className="flex gap-3 items-start">
                            <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-1" />
                            <div>
                              <p className="text-xs uppercase font-bold text-stone-400 mb-1">Address</p>
                              <p className="text-sm font-medium text-stone-700 leading-relaxed">{branch.address}</p>
                              {branch.mapLink && <a href={branch.mapLink} target="_blank" rel="noreferrer" className="text-xs text-[#800020] hover:underline mt-1 inline-block">View on Maps</a>}
                            </div>
                          </div>
                          <div className="flex gap-3 items-start">
                            <Phone className="w-4 h-4 text-stone-400 shrink-0 mt-1" />
                            <div>
                              <p className="text-xs uppercase font-bold text-stone-400 mb-1">Contact</p>
                              <p className="text-sm font-medium text-stone-700">{branch.phone}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-100">
                          <div className="flex gap-3 items-start">
                            <Users className="w-4 h-4 text-stone-400 shrink-0 mt-1" />
                            <div>
                              <p className="text-xs uppercase font-bold text-stone-400 mb-1">Store Manager</p>
                              <p className="text-sm font-medium text-stone-900">{branch.inChargeName || 'Not Assigned'}</p>
                            </div>
                          </div>
                          {branch.inChargeNumber && (
                            <div className="flex gap-3 items-start">
                              <Phone className="w-4 h-4 text-stone-400 shrink-0 mt-1" />
                              <div>
                                <p className="text-xs uppercase font-bold text-stone-400 mb-1">Manager Direct</p>
                                <p className="text-sm font-medium text-stone-700">{branch.inChargeNumber}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (

          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Reviews</h2>
                <p className="text-stone-500 mt-1">Manage customer feedback and testimonials.</p>
              </div>
              <button onClick={() => setEditingReview({ id: 'rev-'+Date.now(), status: 'Accepted', rating: 5, customerName: '', comment: '' })} className="px-6 py-2.5 bg-[#800020] text-white text-[11px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#5c0017] transition-colors whitespace-nowrap">
                Add Review
              </button>
            </div>
            <div className="bg-white rounded-[15px] border border-stone-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-stone-100">
                {reviews.map((review, idx) => (
                  <div key={review.id || idx} className="p-4 flex items-center justify-between hover:bg-stone-50">
                    <div>
                      <h4 className="font-bold text-stone-900">{review.customerName || review.source}</h4>
                      <p className="text-sm text-stone-600 mt-1 truncate max-w-xl">"{review.comment || review.quote}"</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded text-[10px] uppercase font-bold ${review.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : review.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{review.status || 'Pending'}</span>
                      <button onClick={() => setEditingReview(review)} className="text-stone-500 text-sm font-bold uppercase hover:text-stone-900 mr-3">Edit</button> <button onClick={() => setViewingReview(review)} className="text-[#800020] text-sm font-bold uppercase hover:underline">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end bg-white/40 p-6 rounded-[24px] border border-white/60 shadow-sm backdrop-blur-md">
              <div>
                <h2 className="font-serif-luxury text-4xl font-bold text-stone-900 tracking-tight">Coupons & Banners</h2>
                <p className="text-stone-500 mt-2 text-sm font-medium">Manage public store announcements and exclusive VIP promotions.</p>
              </div>
              <button onClick={() => { 
                setEditingAnnouncement(null);
                setAnnouncementForm({ id: '', text: '', code: '', discountPercentage: 0 });
                setAnnouncementModalOpen(true);
              }} className="bg-gradient-to-r from-[#800020] to-[#5c0017] text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-[0_4px_15px_rgba(128,0,32,0.25)] hover:shadow-[0_8px_25px_rgba(128,0,32,0.35)] hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-white/20">
                <Plus className="w-4 h-4" /> Create New
              </button>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Public Banners Column */}
              <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-stone-100 p-8 flex flex-col relative overflow-hidden group/panel">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-100/40 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3 transition-transform duration-700 group-hover/panel:scale-110"></div>
                
                <div className="mb-8 relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-[#800020] mb-4 shadow-sm border border-rose-100/50">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-luxury text-3xl font-bold text-stone-900 tracking-tight">Website Banners</h3>
                  <p className="text-xs font-bold text-stone-400 mt-2 uppercase tracking-[0.2em]">Publicly Scrolling Announcements</p>
                </div>
                
                {/* Custom Webkit Scrollbar embedded using arbitrary variants */}
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-3 relative z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-stone-50/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-stone-300 transition-colors pb-4">
                  {announcements.filter(a => !a.isHidden).map((ann, idx) => (
                    <div 
                      key={ann.id || idx} 
                      draggable
                      onDragStart={(e) => handleAnnouncementDragStart(e, ann.id)}
                      onDrag={(e) => { if (e.clientY > 0) lastMouseY.current = e.clientY; }}
                      onDragOver={(e) => handleAnnouncementDragOver(e, ann.id)}
                      onDragLeave={() => setDragOverAnnouncementId(null)}
                      onDrop={(e) => handleDropAnnouncement(e, ann.id)}
                      onDragEnd={() => { stopAutoScroll(); setDraggedAnnouncementId(null); setDragOverAnnouncementId(null); }}
                      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[16px] bg-white border border-stone-100 border-l-[4px] border-l-[#800020] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-grab active:cursor-grabbing ${
                        dragOverAnnouncementId === ann.id && draggedAnnouncementId !== ann.id
                          ? getAnnouncementDragDirection(ann.id) === 'down'
                            ? "before:content-[''] before:absolute before:-bottom-[12px] before:left-0 before:right-0 before:h-[4px] before:bg-[#800020] before:z-50 before:rounded-full after:content-[''] after:absolute after:-bottom-[16px] after:-left-[8px] after:w-[12px] after:h-[12px] after:rounded-full after:bg-[#800020] after:z-50 after:border-[3px] after:border-white after:shadow-md"
                            : "before:content-[''] before:absolute before:-top-[12px] before:left-0 before:right-0 before:h-[4px] before:bg-[#800020] before:z-50 before:rounded-full after:content-[''] after:absolute after:-top-[16px] after:-left-[8px] after:w-[12px] after:h-[12px] after:rounded-full after:bg-[#800020] after:z-50 after:border-[3px] after:border-white after:shadow-md"
                          : ''
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -ml-2">
                        <GripVertical className="w-4 h-4 text-stone-300" />
                      </div>
                      <div className="flex-1 ml-4 sm:ml-6">
                        <p className="font-serif-luxury text-xl text-stone-900 leading-tight mb-3">{ann.text}</p>
                        
                        {(ann.code || ann.discountPercentage) && (
                          <div className="flex flex-wrap items-center gap-2">
                            {ann.code && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#800020]/5 text-[10px] font-bold text-[#800020] uppercase tracking-[0.2em] border border-[#800020]/10">
                                Code: {ann.code}
                              </span>
                            )}
                            {ann.discountPercentage && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-stone-100 text-[10px] font-bold text-stone-600 uppercase tracking-[0.2em]">
                                {ann.discountPercentage}% OFF
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 sm:static">
                        <button onClick={() => { setEditingAnnouncement(ann); setAnnouncementForm(ann as any); setAnnouncementModalOpen(true); }} className="p-2 text-stone-400 hover:text-[#800020] hover:bg-stone-50 rounded-full transition-all duration-200"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => { if(confirm('Delete banner?')) deleteAnnouncement(ann.id); }} className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all duration-200"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {announcements.filter(a => !a.isHidden).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-stone-100 rounded-[20px] bg-stone-50/50">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                        <Megaphone className="w-6 h-6 text-stone-300" />
                      </div>
                      <p className="text-stone-900 text-base font-bold font-serif-luxury">No Active Banners</p>
                      <p className="text-stone-400 text-xs mt-1 max-w-[200px] text-center">Add a banner to broadcast your latest collections.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hidden / VIP Coupons Column */}
              <div className="bg-gradient-to-b from-stone-900 to-stone-950 rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.2)] border border-stone-800 p-8 flex flex-col relative overflow-hidden group/panel">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C5A059]/10 rounded-full blur-3xl -z-10 -translate-y-1/3 translate-x-1/4 transition-transform duration-700 group-hover/panel:scale-110"></div>
                
                <div className="mb-8 relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-800/80 text-[#C5A059] mb-4 shadow-inner border border-stone-700/50">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-luxury text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    Social Media Coupons
                  </h3>
                  <p className="text-xs font-bold text-stone-500 mt-2 uppercase tracking-[0.2em]">Exclusive Checkout Codes</p>
                </div>
                
                {/* Dark mode custom scrollbar */}
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-3 relative z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-stone-900/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-stone-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-stone-600 transition-colors pb-4">
                  {announcements.filter(a => a.isHidden).map((ann, idx) => (
                    <div 
                      key={ann.id || idx} 
                      draggable
                      onDragStart={(e) => handleAnnouncementDragStart(e, ann.id)}
                      onDrag={(e) => { if (e.clientY > 0) lastMouseY.current = e.clientY; }}
                      onDragOver={(e) => handleAnnouncementDragOver(e, ann.id)}
                      onDragLeave={() => setDragOverAnnouncementId(null)}
                      onDrop={(e) => handleDropAnnouncement(e, ann.id)}
                      onDragEnd={() => { stopAutoScroll(); setDraggedAnnouncementId(null); setDragOverAnnouncementId(null); }}
                      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[16px] bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 border-l-[4px] border-l-[#C5A059] shadow-sm hover:bg-stone-800 hover:shadow-lg hover:border-stone-600 hover:-translate-y-0.5 transition-all duration-300 cursor-grab active:cursor-grabbing ${
                        dragOverAnnouncementId === ann.id && draggedAnnouncementId !== ann.id
                          ? getAnnouncementDragDirection(ann.id) === 'down'
                            ? "before:content-[''] before:absolute before:-bottom-[12px] before:left-0 before:right-0 before:h-[4px] before:bg-[#C5A059] before:z-50 before:rounded-full after:content-[''] after:absolute after:-bottom-[16px] after:-left-[8px] after:w-[12px] after:h-[12px] after:rounded-full after:bg-[#C5A059] after:z-50 after:border-[3px] after:border-stone-900 after:shadow-md"
                            : "before:content-[''] before:absolute before:-top-[12px] before:left-0 before:right-0 before:h-[4px] before:bg-[#C5A059] before:z-50 before:rounded-full after:content-[''] after:absolute after:-top-[16px] after:-left-[8px] after:w-[12px] after:h-[12px] after:rounded-full after:bg-[#C5A059] after:z-50 after:border-[3px] after:border-stone-900 after:shadow-md"
                          : ''
                      }`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -ml-2">
                        <GripVertical className="w-4 h-4 text-stone-500" />
                      </div>
                      <div className="flex-1 ml-4 sm:ml-6">
                        <p className="font-serif-luxury text-xl text-white leading-tight mb-3">{ann.text}</p>
                        
                        {(ann.code || ann.discountPercentage) && (
                          <div className="flex flex-wrap items-center gap-2">
                            {ann.code && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-gradient-to-r from-[#C5A059] to-[#D4B372] text-[10px] font-bold text-stone-900 uppercase tracking-[0.2em] shadow-[0_2px_10px_rgba(197,160,89,0.2)]">
                                Code: {ann.code}
                              </span>
                            )}
                            {ann.discountPercentage && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-stone-900/50 border border-stone-700 text-[10px] font-bold text-stone-300 uppercase tracking-[0.2em]">
                                {ann.discountPercentage}% OFF
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 sm:static">
                        <button onClick={() => { setEditingAnnouncement(ann); setAnnouncementForm(ann as any); setAnnouncementModalOpen(true); }} className="p-2 text-stone-500 hover:text-[#C5A059] hover:bg-stone-700/50 rounded-full transition-all duration-200"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => { if(confirm('Delete promo?')) deleteAnnouncement(ann.id); }} className="p-2 text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-full transition-all duration-200"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {announcements.filter(a => a.isHidden).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-stone-800 rounded-[20px] bg-stone-900/30">
                      <div className="w-16 h-16 rounded-full bg-stone-800/80 flex items-center justify-center shadow-inner border border-stone-700/50 mb-4">
                        <Sparkles className="w-6 h-6 text-stone-600" />
                      </div>
                      <p className="text-white text-base font-bold font-serif-luxury">No VIP Promos</p>
                      <p className="text-stone-500 text-xs mt-1 max-w-[200px] text-center">Generate exclusive checkout codes here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="font-serif-luxury text-3xl font-bold text-stone-900">Regional Delivery Rules</h2>
                <p className="text-stone-500 mt-1">Configure precise delivery rates per state and district.</p>
              </div>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-[25px] border border-stone-200 shadow-sm space-y-8">
              


              {/* State Accordions */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="font-serif-luxury text-xl font-bold text-stone-900">State & District Rates (₹)</h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input 
                      type="text"
                      placeholder="Search district or state..."
                      value={shippingSearch}
                      onChange={e => setShippingSearch(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-[10px] py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#800020] transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.keys(INDIA_STATES)
                  .filter(state => {
                    if (!shippingSearch) return true;
                    const searchLower = shippingSearch.toLowerCase();
                    if (state.toLowerCase().includes(searchLower)) return true;
                    return INDIA_STATES[state].some(d => d.toLowerCase().includes(searchLower));
                  })
                  .map(state => {
                    let districts = INDIA_STATES[state];
                    if (shippingSearch && !state.toLowerCase().includes(shippingSearch.toLowerCase())) {
                      districts = districts.filter(d => d.toLowerCase().includes(shippingSearch.toLowerCase()));
                    }
                    const isExpanded = shippingSearch ? true : expandedState === state;
                    const configuredCount = Object.keys(shippingRates[state] || {}).length;
                    
                    return (
                      <div key={state} className="border border-stone-200 rounded-[15px] overflow-hidden bg-white shadow-sm transition-all duration-300">
                        {/* Header */}
                        <button 
                          onClick={() => setExpandedState(isExpanded ? null : state)}
                          className={`w-full flex justify-between items-center p-5 transition-colors ${isExpanded ? 'bg-[#800020]/5' : 'hover:bg-stone-50'}`}
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-bold text-stone-900">{state}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                              {configuredCount} / {INDIA_STATES[state].length} Districts Configured
                            </span>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm border border-stone-200 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown className="w-4 h-4 text-stone-600" />
                          </div>
                        </button>
                        
                        {/* Body - Framer Motion for smooth height animation */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-stone-100 bg-stone-50/50 overflow-hidden"
                            >
                              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {districts.map(district => {
                                  const rateKey = `${state}-${district}`;
                                  const existingRate = shippingRates[state]?.[district];
                                  const displayValue = rateInputs[rateKey] !== undefined ? rateInputs[rateKey] : (existingRate !== undefined ? String(existingRate) : '');
                                  
                                  return (
                                    <div key={district} className="flex items-center justify-between bg-white p-3 rounded-[10px] border border-stone-200 shadow-sm hover:border-[#800020]/30 transition-colors">
                                      <span className="text-sm font-medium text-stone-700 pr-2 w-[55%] break-words">{district}</span>
                                      <div className="flex gap-2 w-[45%] shrink-0">
                                        <div className="relative flex-1">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">₹</span>
                                          <input 
                                            type="number" 
                                            value={displayValue}
                                            onChange={e => {
                                              setRateInputs({ ...rateInputs, [rateKey]: e.target.value });
                                              setRateSaved({ ...rateSaved, [rateKey]: false });
                                            }}
                                            placeholder="--"
                                            className="w-full bg-stone-50 border border-stone-200 rounded-md py-1.5 pl-6 pr-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] transition-all"
                                          />
                                        </div>
                                        <button 
                                          onClick={() => {
                                            const val = rateInputs[rateKey] !== undefined ? rateInputs[rateKey] : (existingRate !== undefined ? String(existingRate) : '');
                                            if (true) {
                                              updateShippingRate(state, district, val === '' ? null : Number(val));
                                              setRateSaved({ ...rateSaved, [rateKey]: true });
                                              setTimeout(() => setRateSaved(prev => ({...prev, [rateKey]: false})), 2000);
                                            }
                                          }}
                                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${rateSaved[rateKey] ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : (displayValue && displayValue !== String(existingRate) ? 'bg-[#800020] text-white shadow-sm' : 'bg-stone-100 text-stone-400 border border-stone-200 hover:bg-stone-200 hover:text-stone-600')}`}
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        )}
      </main>
      {/* Modals for Branch, Article, etc. */}
      {/* Announcement Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white text-stone-900 rounded-[25px] w-full max-w-md p-8 shadow-md border border-stone-200">
            <h2 className="font-serif-luxury text-2xl font-bold mb-6">{editingAnnouncement ? 'Edit Banner' : 'New Banner'}</h2>
            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Display Text</label>
                <input type="text" required value={announcementForm.text || ''} onChange={e => setAnnouncementForm({...announcementForm, text: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[10px] p-3 text-sm focus:border-[#800020] outline-none" placeholder="e.g. SUMMER SALE - 20% OFF" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Promo Code (Optional)</label>
                  <input type="text" value={announcementForm.code || ''} onChange={e => setAnnouncementForm({...announcementForm, code: e.target.value.toUpperCase()})} className="w-full bg-stone-50 border border-stone-200 rounded-[10px] p-3 text-sm focus:border-[#800020] outline-none" placeholder="e.g. SUMMER20" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Discount %</label>
                  <input type="number" min="0" max="100" value={announcementForm.discountPercentage || 0} onChange={e => setAnnouncementForm({...announcementForm, discountPercentage: Number(e.target.value)})} className="w-full bg-stone-50 border border-stone-200 rounded-[10px] p-3 text-sm focus:border-[#800020] outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-200 rounded-[10px]">
                <input 
                  type="checkbox" 
                  id="isHidden" 
                  checked={announcementForm.isHidden || false} 
                  onChange={e => setAnnouncementForm({...announcementForm, isHidden: e.target.checked})}
                  className="w-4 h-4 text-[#800020] rounded border-stone-300 focus:ring-[#800020]" 
                />
                <label htmlFor="isHidden" className="text-xs text-stone-700 font-medium">
                  Hide from Website Banner
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setAnnouncementModalOpen(false)} className="flex-1 px-4 py-3 border border-stone-200 text-stone-600 rounded-[10px] font-bold uppercase text-xs hover:bg-stone-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSavingAnnouncement} className="flex-1 px-4 py-3 bg-[#800020] text-white rounded-[10px] font-bold uppercase text-xs hover:bg-[#5c0017] transition-colors shadow-lg disabled:opacity-50">{isSavingAnnouncement ? "Saving..." : "Save Banner"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white text-stone-900 rounded-[25px] w-full max-w-md p-8 shadow-md border border-stone-200">
            <h2 className="font-serif-luxury text-2xl font-bold mb-6">{editingBranch ? 'Edit Branch' : 'New Branch'}</h2>
            <form onSubmit={handleSaveBranch} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Branch Name</label>
                  <input type="text" required value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Location / City</label>
                  <input type="text" required value={branchForm.location} onChange={e => setBranchForm({...branchForm, location: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Address</label>
                <textarea rows={2} required value={branchForm.address} onChange={e => setBranchForm({...branchForm, address: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Branch Phone</label>
                  <input type="text" required value={branchForm.phone} onChange={e => setBranchForm({...branchForm, phone: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Store Status</label>
                  <button type="button" onClick={() => setBranchForm({...branchForm, status: (branchForm.status === 'holiday' || branchForm.status === 'closed') ? 'open' : 'holiday'})} className={`w-full flex items-center justify-center p-3 rounded-[15px] text-sm font-bold transition-colors ${(branchForm.status === 'holiday' || branchForm.status === 'closed') ? 'bg-stone-200 text-stone-600' : 'bg-green-100 text-green-700'}`}>
                    {(branchForm.status === 'holiday' || branchForm.status === 'closed') ? '🔴 Closed (Holiday)' : '🟢 Store Open'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">In-Charge Name</label>
                  <input type="text" value={branchForm.inChargeName || ''} onChange={e => setBranchForm({...branchForm, inChargeName: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">In-Charge Phone</label>
                  <input type="text" value={branchForm.inChargeNumber || ''} onChange={e => setBranchForm({...branchForm, inChargeNumber: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Working Days</label>
                  <input type="text" placeholder="e.g., Monday - Saturday" required value={branchForm.workingDays || ''} onChange={e => setBranchForm({...branchForm, workingDays: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Open Time</label>
                    <input type="time" required value={branchForm.openTime || ''} onChange={e => setBranchForm({...branchForm, openTime: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Close Time</label>
                    <input type="time" required value={branchForm.closeTime || ''} onChange={e => setBranchForm({...branchForm, closeTime: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Google Maps ID / Place URL</label>
                <input type="text" placeholder="e.g. Map Place ID or Google Maps Share Link" required value={branchForm.mapLink} onChange={e => setBranchForm({...branchForm, mapLink: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
              </div>
              <div className="flex items-center gap-2 py-2">
                <input type="checkbox" id="isMainBranch" checked={branchForm.isMainBranch || false} onChange={e => setBranchForm({...branchForm, isMainBranch: e.target.checked})} className="w-4 h-4 accent-[#800020]" />
                <label htmlFor="isMainBranch" className="text-sm font-bold text-stone-700">Set as Main Branch</label>
              </div>
              <div className="flex gap-4 pt-4 mt-2 border-t border-stone-100">
                <button type="button" onClick={() => setBranchModalOpen(false)} className="flex-1 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-[15px] font-bold uppercase text-xs">Cancel</button>
                
<button type="submit" disabled={isSaving} className="flex-1 flex justify-center items-center py-3 bg-[#800020] hover:bg-[#5c0017] text-white rounded-[15px] font-bold uppercase text-xs tracking-wider shadow-lg transition-colors disabled:opacity-50">
  {isSaving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : 'Save'}
</button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Modal */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white text-stone-900 rounded-[25px] w-full max-w-md p-8 shadow-md border border-stone-200">
            <h2 className="font-serif-luxury text-2xl font-bold mb-6">{editingArticle ? 'Edit Article' : 'New Article'}</h2>
            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Title</label>
                <input type="text" required value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Description</label>
                <textarea rows={3} required value={articleForm.description} onChange={e => setArticleForm({...articleForm, description: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Image Link</label>
                <input type="text" required value={articleForm.image} onChange={e => setArticleForm({...articleForm, image: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Attached Link (e.g. /products/1)</label>
                <input type="text" required value={articleForm.link} onChange={e => setArticleForm({...articleForm, link: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm outline-none" />
              </div>
              <div className="flex gap-4 pt-4 mt-2 border-t border-stone-100">
                <button type="button" onClick={() => setArticleModalOpen(false)} className="flex-1 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-[15px] font-bold uppercase text-xs">Cancel</button>
                
<button type="submit" disabled={isSaving} className="flex-1 flex justify-center items-center py-3 bg-[#800020] hover:bg-[#5c0017] text-white rounded-[15px] font-bold uppercase text-xs tracking-wider shadow-lg transition-colors disabled:opacity-50">
  {isSaving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : 'Save'}
</button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* (Product and Category Modals assumed added below, same as previous script logic) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white text-stone-900 rounded-[25px] w-full max-w-md p-8 shadow-md border border-stone-200">
            <h2 className="font-serif-luxury text-2xl font-bold mb-6">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Category Name</label>
                <input type="text" required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Image URL (Link)</label>
                <input type="text" required value={categoryForm.image} onChange={e => setCategoryForm({...categoryForm, image: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Tagline</label>
                <input type="text" required value={categoryForm.tagline} onChange={e => setCategoryForm({...categoryForm, tagline: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" />
              </div>
              <div className="flex gap-4 pt-4 mt-2 border-t border-stone-100">
                <button type="button" onClick={() => setCategoryModalOpen(false)} className="flex-1 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-[15px] font-bold uppercase text-xs tracking-wider transition-colors">Cancel</button>
                
<button type="submit" disabled={isSaving} className="flex-1 flex justify-center items-center py-3 bg-[#800020] hover:bg-[#5c0017] text-white rounded-[15px] font-bold uppercase text-xs tracking-wider shadow-lg transition-colors disabled:opacity-50">
  {isSaving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : 'Save'}
</button>

              </div>
            </form>
          </div>
        </div>
      )}
      
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white text-stone-900 rounded-[25px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-md p-8 border border-stone-200">
            <h2 className="font-serif-luxury text-3xl font-bold mb-8">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Product Title</label>
                  <input type="text" required value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Subtitle</label>
                  <input type="text" value={productForm.subtitle} onChange={e => setProductForm({...productForm, subtitle: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Detailed Description</label>
                  <textarea rows={3} required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Category</label>
                  <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none">
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Price (INR)</label>
                  <input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Stock / Inventory</label>
                  <input type="number" required value={productForm.stockQuantity} onChange={e => setProductForm({...productForm, stockQuantity: Number(e.target.value)})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Discount %</label>
                  <input type="number" value={productForm.discountPercentage || 0} onChange={e => setProductForm({...productForm, discountPercentage: Number(e.target.value)})} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Product Images</label>
                  <div className="space-y-3">
                    {(productForm.images || []).map((img, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <input type="text" required value={img} onChange={e => {
                            const newImages = [...(productForm.images || [])];
                            newImages[i] = e.target.value;
                            setProductForm({...productForm, images: newImages});
                          }} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none pr-10" placeholder="https://..." />
                        </div>
                        <button type="button" onClick={() => {
                          const newImages = [...(productForm.images || [])];
                          newImages.splice(i, 1);
                          setProductForm({...productForm, images: newImages});
                        }} className="p-3 text-stone-400 hover:text-rose-500 transition-colors shrink-0 bg-stone-50 rounded-[15px] border border-stone-200 hover:bg-rose-50 hover:border-rose-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setProductForm({...productForm, images: [...(productForm.images || []), '']})} className="w-full py-3 bg-stone-50 border border-dashed border-stone-300 rounded-[15px] text-stone-500 font-bold uppercase text-[10px] tracking-wider hover:bg-stone-100 transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-3 h-3" /> Add Image Link
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2 flex justify-between">
                    <span>3D Model Link (Optional)</span>
                    <span className="text-stone-400">Must be a .glb URL</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. https://example.com/models/product.glb"
                    value={productForm.model3dUrl || ''} 
                    onChange={e => setProductForm({...productForm, model3dUrl: e.target.value})} 
                    className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" 
                  />
                  <p className="text-[10px] text-stone-400 mt-2 leading-relaxed">
                    Upload a .glb link here to enable the "View in 3D" button for this product.
                  </p>
                </div>


                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Sizes Available</label>
                  <div className="space-y-3">
                    {(productForm.sizes || []).map((size, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <input type="text" required value={size} onChange={e => {
                          const newSizes = [...(productForm.sizes || [])];
                          newSizes[i] = e.target.value.toUpperCase();
                          setProductForm({...productForm, sizes: newSizes});
                        }} className="w-full bg-stone-50 border border-stone-200 rounded-[15px] p-3 text-sm focus:border-[#800020] outline-none" placeholder="e.g. XL" />
                        <button type="button" onClick={() => {
                          const newSizes = [...(productForm.sizes || [])];
                          newSizes.splice(i, 1);
                          setProductForm({...productForm, sizes: newSizes});
                        }} className="p-3 text-stone-400 hover:text-rose-500 transition-colors shrink-0 bg-stone-50 rounded-[15px] border border-stone-200 hover:bg-rose-50 hover:border-rose-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setProductForm({...productForm, sizes: [...(productForm.sizes || []), '']})} className="w-full py-3 bg-stone-50 border border-dashed border-stone-300 rounded-[15px] text-stone-500 font-bold uppercase text-[10px] tracking-wider hover:bg-stone-100 transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-3 h-3" /> Add Size
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-2">Color Options</label>
                  <div className="space-y-3">
                    {(productForm.colors || []).map((color, i) => (
                      <div key={i} className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-[15px] p-2">
                        <input type="color" value={color.hex} onChange={e => {
                          const newColors = [...(productForm.colors || [])];
                          newColors[i] = { ...newColors[i], hex: e.target.value };
                          setProductForm({...productForm, colors: newColors});
                        }} className="w-10 h-10 rounded-[10px] cursor-pointer border-0 p-0 bg-transparent shrink-0" />
                        
                        <input type="text" required value={color.name} onChange={e => {
                          const newColors = [...(productForm.colors || [])];
                          newColors[i] = { ...newColors[i], name: e.target.value };
                          setProductForm({...productForm, colors: newColors});
                        }} className="w-full bg-transparent p-2 text-sm focus:outline-none placeholder:text-stone-400" placeholder="Color Name" />
                        
                        <button type="button" onClick={() => {
                          const newColors = [...(productForm.colors || [])];
                          newColors.splice(i, 1);
                          setProductForm({...productForm, colors: newColors});
                        }} className="p-2 text-stone-400 hover:text-rose-500 transition-colors shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setProductForm({...productForm, colors: [...(productForm.colors || []), {name: '', hex: '#000000'}]})} className="w-full py-3 bg-stone-50 border border-dashed border-stone-300 rounded-[15px] text-stone-500 font-bold uppercase text-[10px] tracking-wider hover:bg-stone-100 transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-3 h-3" /> Add Color
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-6 border-t border-stone-100">
                <button type="button" onClick={() => setProductModalOpen(false)} className="flex-1 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-[15px] font-bold uppercase text-xs tracking-wider transition-colors">Cancel</button>
                
<button type="submit" disabled={isSaving} className="flex-1 flex justify-center items-center py-3 bg-[#800020] hover:bg-[#5c0017] text-white rounded-[15px] font-bold uppercase text-xs tracking-wider shadow-lg transition-colors disabled:opacity-50">
  {isSaving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> : 'Save'}
</button>

              </div>
            </form>
          </div>
        </div>
      )}
    

      
      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setEditingReview(null)} />
          <div className="relative bg-white rounded-[20px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">{editingReview.createdAt ? 'Edit Review' : 'Add New Review'}</h3>
              <button onClick={() => setEditingReview(null)} className="p-2 text-stone-400 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Customer Name / Source</label>
                <input type="text" value={editingReview.customerName || editingReview.source || ''} onChange={e => setEditingReview({...editingReview, customerName: e.target.value})} className="w-full bg-white border border-stone-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#800020]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={editingReview.rating || 5} onChange={e => setEditingReview({...editingReview, rating: Number(e.target.value)})} className="w-full bg-white border border-stone-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#800020]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Status</label>
                  <select value={editingReview.status} onChange={e => setEditingReview({...editingReview, status: e.target.value as any})} className="w-full bg-white border border-stone-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#800020]">
                    <option value="Accepted">Accepted</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Review Content / Quote</label>
                <textarea rows={4} value={editingReview.comment || editingReview.quote || ''} onChange={e => setEditingReview({...editingReview, comment: e.target.value})} className="w-full bg-white border border-stone-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#800020] resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex gap-3">
              <button onClick={() => setEditingReview(null)} className="flex-1 py-3 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-lg font-bold uppercase text-xs tracking-wider transition-colors">Cancel</button>
              <button onClick={() => {
                if (editingReview.createdAt) {
                  updateReview(editingReview as Review);
                } else {
                  addReview({ ...editingReview, createdAt: new Date().toISOString() } as Review);
                }
                setEditingReview(null);
              }} className="flex-1 py-3 bg-[#800020] text-white hover:bg-[#5c0017] rounded-lg font-bold uppercase text-xs tracking-wider transition-colors shadow-md">Save Review</button>
            </div>
          </div>
        </div>
      )}


      {viewingReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[25px] w-full max-w-lg p-8 shadow-2xl border border-stone-200">
            <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-6">Review Details</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Customer</p>
                <p className="font-bold text-stone-900 text-lg">{viewingReview.customerName || viewingReview.source || 'Anonymous'}</p>
              </div>

              {viewingReview.rating && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Rating</p>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < viewingReview.rating! ? 'fill-current' : 'text-stone-200'}`} />)}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Comment</p>
                <div className="p-4 bg-stone-50 border border-stone-100 rounded-[15px]">
                  <p className="text-stone-700 italic leading-relaxed text-sm">"{viewingReview.comment || viewingReview.quote}"</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Status</p>
                  <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase ${viewingReview.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : viewingReview.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{viewingReview.status || 'Pending'}</span>
                </div>
                {viewingReview.createdAt && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Date Submitted</p>
                    <p className="text-sm font-bold text-stone-700">{new Date(viewingReview.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-stone-100">
              <button onClick={() => { updateReview({...viewingReview, status: 'Accepted'}); setViewingReview(null); }} className="flex-1 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-[15px] font-bold uppercase text-xs tracking-wider transition-colors">Accept</button>
              <button onClick={() => { updateReview({...viewingReview, status: 'Rejected'}); setViewingReview(null); }} className="flex-1 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-[15px] font-bold uppercase text-xs tracking-wider transition-colors">Reject</button>
              <button onClick={() => { if(confirm('Delete permanently?')) { deleteReview(viewingReview.id); setViewingReview(null); } }} className="flex-1 py-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-[15px] font-bold uppercase text-xs tracking-wider transition-colors">Delete</button>
              <button onClick={() => setViewingReview(null)} className="flex-none px-4 py-3 bg-stone-900 text-white hover:bg-black rounded-[15px] font-bold uppercase text-xs tracking-wider transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    

      {isSaving && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-stone-200 border-t-[#800020] rounded-full animate-spin mb-4"></div>
          <p className="font-serif-luxury text-[#800020] font-bold tracking-widest animate-pulse">SAVING CHANGES...</p>
        </div>
      )}
      {viewingInvoice && (
        <InvoiceComponent order={viewingInvoice} onClose={() => setViewingInvoice(null)} />
      )}
      {viewingImagesForProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl flex flex-col items-center justify-center">
            <button 
              onClick={() => { setViewingImagesForProduct(null); setImageSlideIndex(0); }}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 transition-colors z-[101]"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full flex items-center justify-center">
              {viewingImagesForProduct.images?.length > 1 && (
                <button 
                  onClick={() => setImageSlideIndex(prev => (prev - 1 + viewingImagesForProduct.images.length) % viewingImagesForProduct.images.length)}
                  className="absolute left-4 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors z-[101]"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <img 
                src={viewingImagesForProduct.images?.[imageSlideIndex] || 'https://via.placeholder.com/300'} 
                alt="Product Slide" 
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl relative z-[100]" 
              />
              {viewingImagesForProduct.images?.length > 1 && (
                <button 
                  onClick={() => setImageSlideIndex(prev => (prev + 1) % viewingImagesForProduct.images.length)}
                  className="absolute right-4 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors z-[101]"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
            {viewingImagesForProduct.images?.length > 1 && (
              <div className="flex gap-2 mt-6 overflow-x-auto p-2 max-w-full">
                {viewingImagesForProduct.images.map((img: string, idx: number) => (
                  <img 
                    key={idx} 
                    src={img} 
                    onClick={() => setImageSlideIndex(idx)}
                    className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition-all ${idx === imageSlideIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {viewingImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-[5120px] max-h-[90vh] w-full flex flex-col items-center justify-center">
            <button 
              onClick={() => setViewingImage(null)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 transition-colors z-[101]"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={viewingImage} alt="Full screen view" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/20 relative z-[100]" />
          </div>
        </div>
      )}
    </div>
  );
};