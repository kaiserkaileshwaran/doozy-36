'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Share2, Heart, Sparkles, Check, Copy, ShoppingBag, Eye } from 'lucide-react';
import { profileService, UserProfileData } from '../../services/profileService';
import { Product } from '../../types';

interface PublicProfileViewProps {
  username?: string;
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({ username = 'priya' }) => {
  const router = useRouter();
  const { products, addToCart, setQuickViewProduct, formatPrice, showToast } = useStore();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const data = await profileService.getPublicProfile(username);
      if (data) {
        setProfile(data);
      } else {
        // Fallback demo patron profile
        setProfile({
          uid: 'demo-uid',
          name: 'Priya Sundaram',
          username: username,
          email: 'priya@example.com',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
          role: 'customer',
          bio: 'Connoisseur of Chanderi silks, Banarasi weaves, and contemporary ethnic co-ords. Curating timeless styles for Indian celebrations.',
          publicProfile: true,
          wishlistIds: [products[0]?.id, products[1]?.id, products[2]?.id].filter(Boolean),
          createdAt: '2026-01-15'
        });
      }
      setLoading(false);
    };

    loadProfile();
  }, [username, products]);

  const shareProfile = async () => {
    const shareUrl = window.location.origin + `/u/${username}`;
    const shareData = {
      title: `${profile?.name || 'DOOZY Customer'}'s Curated Ethnic Collection | DOOZY`,
      text: `Discover ${profile?.name || 'DOOZY Customer'}'s favorite luxury Indian ethnic wear & festive picks on DOOZY.`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Shared Successfully', 'Profile link shared via native share.', 'success');
      } catch (err) {
        // Fallback to copy
        copyLink(shareUrl);
      }
    } else {
      copyLink(shareUrl);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Link Copied', 'Profile URL copied to your clipboard.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const shareViaWhatsApp = () => {
    const shareUrl = window.location.origin + `/u/${username}`;
    const text = encodeURIComponent(`Take a look at ${profile?.name}'s handpicked DOOZY ethnic wardrobe favorites:\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const favoriteProducts: Product[] = products.filter(p => 
    profile?.wishlistIds?.includes(p.id) || ['prod-1', 'prod-2', 'prod-3'].includes(p.id)
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[5120px] mx-auto space-y-10">
        {/* Profile Banner Card */}
        <div className="bg-white rounded-sm p-8 sm:p-10 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">


            {/* Patron Bio & Identity */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-[#800020] uppercase tracking-widest mb-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Verified Premium Member
                  </div>
                  <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900">
                    {profile?.name}
                  </h1>
                  <p className="text-sm font-mono text-stone-500 mt-0.5">
                    @{profile?.username || username}
                  </p>
                </div>

                {/* Share Actions */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow hover:bg-[#1EBE5D] transition-all cursor-pointer"
                  >
                    WhatsApp Share
                  </button>
                  <button
                    onClick={shareProfile}
                    className="flex items-center gap-2 bg-[#800020] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow hover:bg-[#5c0017] transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    <span>{copied ? 'Link Copied' : 'Share Profile'}</span>
                  </button>
                </div>
              </div>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                {profile?.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Curated Wishlist Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2.5">
                <Heart className="w-6 h-6 text-[#800020] fill-[#800020]" />
                Curated Ethnic Wardrobe
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Products and styles recommended by {profile?.name}.
              </p>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="text-xs font-bold uppercase tracking-wider text-[#800020] hover:underline"
            >
              Explore Full Boutique →
            </button>
          </div>

          {favoriteProducts.length === 0 ? (
            <div className="bg-white rounded-sm p-12 text-center border border-stone-200">
              <p className="text-stone-500 text-sm">No public picks published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map(product => (
                <div 
                  key={product.id}
                  className="bg-white rounded-sm overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div className="relative aspect-3/4 overflow-hidden bg-stone-100">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                      <span>{product.category}</span>
                      <span className="text-[#800020] font-bold">{product.fabric || 'Pure Silk'}</span>
                    </div>

                    <h3 className="font-serif-luxury text-base font-bold text-stone-900 line-clamp-1 group-hover:text-[#800020] transition-colors">
                      {product.title}
                    </h3>

                    <div className="flex items-baseline justify-between pt-2 border-t border-stone-100">
                      <span className="font-serif-luxury text-lg font-bold text-[#800020]">
                        {formatPrice(product.price)}
                      </span>
                      <button
                        onClick={() => router.push('/products/' + (product.slug || product.id))}
                        className="inline-flex items-center gap-1.5 bg-[#800020] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow hover:bg-[#5c0017] transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Select Size
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
