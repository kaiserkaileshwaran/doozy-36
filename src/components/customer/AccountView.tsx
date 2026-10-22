'use client';
import { INDIA_STATES } from '../../data/indianLocations';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { InvoiceComponent } from '../common/InvoiceComponent';
import { NotificationToggle } from '../common/NotificationToggle';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  
  Check, 
  ShieldCheck, 
  ShoppingBag, 
  Sparkles,
  ChevronRight,
  Truck,
 
  Eye,
  EyeOff, X
} from 'lucide-react';
import { EmptyState } from '../common/EmptyState';
import { Address } from '../../types';

export const AccountView: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentUser,
    logout,
    orders,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    wishlist,
    products,
    formatPrice,
    addToCart,
    toggleWishlist,
    setSelectedProduct,
    updateUserProfile,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    setCheckoutSessionCart,
    activeAccountTab: activeTab,
    setActiveAccountTab: setActiveTab
  } = useStore();
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
    } else if (!currentUser.username || !currentUser.phone) {
      router.push('/auth'); // Send back to auth to complete onboarding
    }
  }, [currentUser, router]);

  // Address form
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    fullName: currentUser?.name || '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: currentUser?.phone || '',
    isDefault: false
  });

  // Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name || 'Aaradhya Sharma');
  const [profileUsername, setProfileUsername] = useState(currentUser?.username || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileDob, setProfileDob] = useState(currentUser?.dob || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'aaradhya.sharma@doozyatelier.in');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 5) score += 1;
    if (pwd.length > 7) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[@$!%*?&]/.test(pwd)) score += 1;
    return score;
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
    } else {
      addAddress(addressForm);
    }
    setAddressModalOpen(false);
    setEditingAddressId(null);
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: currentUser?.name || '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      phone: currentUser?.phone || '',
      isDefault: addresses.length === 0
    });
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName,
      street: addr.street,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
      isDefault: addr.isDefault
    });
    setAddressModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mandatory fields check
    if (!profileName || !profileEmail || !profileUsername || !profilePhone) {
      setUsernameError('All fields are mandatory.');
      return;
    }

    // Mock check for unique username, email, phone
    if (profileUsername.toLowerCase() === 'admin' || profileUsername.toLowerCase() === 'guest') {
      setUsernameError('This username is already taken. Please choose another one.');
      return;
    }
    if (profileEmail.toLowerCase() === 'admin@doozy.com') {
      setUsernameError('This email is already registered to another account.');
      return;
    }
    if (profilePhone === '+910000000000') {
      setUsernameError('This phone number is already registered.');
      return;
    }

    setUsernameError('');

    updateUserProfile({ 
      name: profileName, 
      email: profileEmail,
      username: profileUsername,
      phone: profilePhone,
      dob: profileDob
    });
    // In a real app, you would also securely update the password in Firebase Auth here
    if (currentPassword && newPassword) {
      setCurrentPassword('');
      setNewPassword('');
    }
    setIsEditingProfile(false);
  };

  const wishedProducts = products.filter(p => wishlist.includes(p.id));

  const myOrders = orders.filter(o => o.customerEmail === currentUser?.email);
    

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="w-12 h-12 border-4 border-stone-200 border-t-[#800020] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-16">
      <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Top Banner with slightly rounded black box */}
        <div className="bg-[#1C1B1A] rounded-xl p-6 sm:p-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4 sm:gap-6">
            <div>
              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-normal text-white">
                {currentUser?.name || 'Aaradhya Sharma'} {currentUser?.username ? <span className="text-stone-400 text-lg sm:text-xl">(@{currentUser.username.replace(/^@/, '')})</span> : ''}
              </h1>
              <p className="text-stone-400 text-xs mt-1">{currentUser?.email || 'aaradhya.sharma@doozyatelier.in'}</p>
              
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-stone-200 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <NotificationToggle />

        {/* Main Content Area */}
        <main className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200/80 shadow-xs space-y-12">
          
          {/* PROFILE SECTION */}
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-4 flex justify-between items-start">
              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Personal Information
                </h3>
                <p className="text-stone-500 text-sm mt-1">Manage your account details and security.</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-[#800020] font-bold uppercase tracking-wider text-[11px] hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {!isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Full Name</p>
                  <p className="font-bold text-stone-900">{currentUser?.name || 'Aaradhya Sharma'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Email Address</p>
                  <p className="font-bold text-stone-900">{currentUser?.email || 'aaradhya.sharma@doozyatelier.in'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Phone Number</p>
                  <p className="font-bold text-stone-900">{currentUser?.phone || '+91 94884 45184'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Date of Birth</p>
                  <p className="font-bold text-stone-900">{currentUser?.dob || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">Account Password</p>
                  <p className="font-bold text-stone-900">••••••••</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5 max-w-4xl py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#800020]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Username (Unique) *</label>
                    <input
                      type="text"
                      required
                      value={profileUsername}
                      onChange={e => {
                        setProfileUsername(e.target.value);
                        setUsernameError('');
                      }}
                      placeholder="@aaradhya"
                      className={`w-full p-3.5 bg-stone-50 border rounded-lg text-xs focus:outline-none ${usernameError ? 'border-red-500 focus:border-red-500' : 'border-stone-200 focus:border-[#800020]'}`}
                    />
                    {usernameError && <p className="text-[10px] text-red-500">{usernameError}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      placeholder="+91"
                      className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#800020]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={e => setProfileEmail(e.target.value)}
                      className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#800020]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">Date of Birth</label>
                    <input
                      type="date"
                      value={profileDob}
                      onChange={e => setProfileDob(e.target.value)}
                      className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#800020]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-200 mt-6">
                  <h4 className="text-xs font-bold text-stone-900 mb-4 uppercase tracking-wider">Change Password</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#800020] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#800020] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {newPassword.length > 0 && (
                        <p className="text-[10px] text-stone-500 mt-2">We recommend a strong password.</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#800020] text-white px-7 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow hover:bg-[#5c0017] cursor-pointer mt-4"
                >
                  Save Profile Changes
                </button>
              </form>
            )}
          </div>

          {/* ADDRESSES SECTION */}
          <div className="space-y-6 pt-8 border-t border-stone-200">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Saved Delivery Addresses
                </h3>
              </div>
              <button
                onClick={openAddAddressModal}
                className="bg-[#800020] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow hover:bg-[#5c0017]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {addresses.length === 0 ? (
                <p className="text-stone-500 text-sm col-span-full">No saved addresses found. Add one above.</p>
              ) : (
                addresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`p-5 rounded-xl border-2 relative space-y-2 transition-colors ${
                      addr.isDefault ? 'border-[#800020] bg-[#800020]/5' : 'border-stone-200 bg-[#FAF9F6] hover:border-stone-300'
                    }`}
                  >
                    {addr.isDefault && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-[#800020] px-2 py-0.5 rounded-full mb-2 inline-block">
                        Default Address
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-stone-900">{addr.fullName}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {addr.street} {addr.apartment && `, ${addr.apartment}`}
                      <br />
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p className="text-xs text-stone-500">Phone: {addr.phone}</p>

                    <div className="pt-3 mt-2 flex items-center gap-3 border-t border-stone-200/80 text-xs">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-[#800020] font-bold hover:underline"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => openEditAddressModal(addr)}
                        className="text-stone-700 font-semibold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-red-600 font-semibold hover:underline ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        {/* ORDERS SECTION */}
          <div className="space-y-6 pt-8 border-t border-stone-200">
            <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
              Your Orders
            </h3>
            <div className="space-y-4">
              {myOrders.filter(o => o.status === 'Delivered').length === 0 ? (
                <p className="text-stone-500 text-sm">Your products has not received yet.</p>
              ) : (
                myOrders.filter(o => o.status === 'Delivered').map(order => (
                  <div key={order.id} className="bg-stone-50 border border-stone-200 rounded-lg p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-stone-900">{order.orderNumber}</h4>
                        <p className="text-xs text-stone-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-stone-200 text-[10px] uppercase font-bold tracking-wider rounded-full">{order.status}</span>
                        <span className="font-bold text-[#800020]">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4 border-t border-b border-stone-200/50 py-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-stone-200 rounded shrink-0 overflow-hidden">
                            {(item as any).product?.images?.[0] || item.image ? (
                              <img src={(item as any).product?.images?.[0] || item.image} alt="" className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-900">{(item as any).product?.title || item.title || 'Product'}</p>
                            <p className="text-[10px] text-stone-500">Qty: {item.quantity} | Size: {item.size || item.selectedSize}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    
                  </div>
                ))
              )}
            </div>
          </div>

          </main>

        {/* Address Edit/Add Modal */}
        {addressModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-xl">
              <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                {editingAddressId ? 'Update Delivery Address' : 'Add New Delivery Address'}
              </h3>

              <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">Street / Building</label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">State</label>
                    <select
                      required
                      value={addressForm.state}
                      onChange={e => setAddressForm({ ...addressForm, state: e.target.value, city: '' })}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs appearance-none"
                    >
                      <option value="" disabled>Select State</option>
                      {Object.keys(INDIA_STATES).sort().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">District / City</label>
                    <select
                      required
                      value={addressForm.city}
                      onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                      disabled={!addressForm.state}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs appearance-none disabled:bg-stone-100 disabled:text-stone-400"
                    >
                      <option value="" disabled>{addressForm.state ? 'Select District' : 'Select State'}</option>
                      {addressForm.state && INDIA_STATES[addressForm.state]?.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={addressForm.postalCode}
                      onChange={e => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(false)}
                    className="px-5 py-2.5 text-stone-600 font-bold uppercase tracking-wider hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#800020] text-white px-5 py-2.5 rounded-lg font-bold uppercase tracking-wider hover:bg-[#5c0017] transition-colors cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
