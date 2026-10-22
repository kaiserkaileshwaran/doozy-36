import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from 'react';
import { VolumeX, Volume2, Maximize, Minimize } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HorizontalScroll } from './Homepage';
import { DoozyLogo } from '../common/DoozyLogo';

const SingleShort = ({ reel }: { reel: any }) => {
  const { products, formatPrice } = useStore();
  const router = useRouter();
  const product = products?.find(p => p.id === reel.productId);

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const isIntersectingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?]+)/);
    return match ? match[1] : null;
  };

  const isYoutube = reel.videoUrl.includes('youtube.com') || reel.videoUrl.includes('youtu.be');
  const ytId = isYoutube ? getYouTubeId(reel.videoUrl) : null;
  
  const isInstagram = reel.videoUrl.includes('instagram.com');
  const getInstagramEmbed = (url: string) => {
    if (url.includes('/embed')) return url;
    const clean = url.split('?')[0].replace(/\/$/, '');
    return `${clean}/embed`;
  };
  const igEmbedUrl = isInstagram ? getInstagramEmbed(reel.videoUrl) : null;

  const safeUrl = (isYoutube || isInstagram) ? '' : reel.videoUrl;

  const handleEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const parent = containerRef.current?.parentElement;
      if (!parent) return;

      if (parent.dataset.isAutoScrolling === "true") return;
      parent.dataset.isAutoScrolling = "true";
      setTimeout(() => { parent.dataset.isAutoScrolling = "false" }, 1500);

      const nextEl = containerRef.current?.nextElementSibling;
      if (nextEl) {
        if (window.innerWidth >= 1024) {
          parent.scrollBy({ left: parent.clientWidth * 0.8, behavior: 'smooth' });
        } else {
          nextEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      } else {
        const firstEl = parent.firstElementChild;
        if (firstEl) {
          firstEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
      }
    }, 1500);
  };

  // Global Mute Event Listener
  useEffect(() => {
    const handleMuteAll = (e: any) => {
      if (e.detail !== reel.id) {
        setIsMuted(true);
        if (videoRef.current) {
          videoRef.current.muted = true;
        }
        if (ytPlayerRef.current && typeof ytPlayerRef.current.mute === 'function') {
          ytPlayerRef.current.mute();
        }
      }
    };
    window.addEventListener('muteAllShorts', handleMuteAll);
    return () => window.removeEventListener('muteAllShorts', handleMuteAll);
  }, [reel.id]);

  // Active Short Listener for center-screen playback
  useEffect(() => {
    const handleActiveChange = (e: any) => {
      const isActive = e.detail === reel.id;
      isIntersectingRef.current = isActive; // Reuse the ref for onReady

      if (isActive) {
        setIsPlaying(true);
        if (videoRef.current) {
          if (videoRef.current.ended) {
             videoRef.current.currentTime = 0;
          }
          videoRef.current.play().catch(() => setIsPlaying(false));
        }
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
          const state = ytPlayerRef.current.getPlayerState();
          if (state === 0 /* ENDED */) {
            ytPlayerRef.current.seekTo(0, true);
          }
          ytPlayerRef.current.playVideo();
        }
        setIsEnded(false);
      } else {
        setIsPlaying(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
        if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          ytPlayerRef.current.pauseVideo();
        }
      }
    };

    window.addEventListener('activeShortChange', handleActiveChange);
    return () => window.removeEventListener('activeShortChange', handleActiveChange);
  }, [reel.id]);

  // Suppress uncaught promise rejections from play() API (like Safari background throttling)
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.name === 'NotAllowedError') {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  // YouTube Native Iframe API
  useEffect(() => {
    if (!isYoutube || !ytId) return;

    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;
      ytPlayerRef.current = new (window as any).YT.Player(`yt-${reel.id}`, {
        videoId: ytId,
        playerVars: { 
          autoplay: 0, 
          mute: 1, 
          controls: 0, 
          playsinline: 1, 
          modestbranding: 1,
          rel: 0,
          loop: 0,
          origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
        },
        events: {
          onReady: (e: any) => {
            e.target.mute();
            if (isIntersectingRef.current) {
              e.target.playVideo();
              setIsPlaying(true);
            }
          },
          onStateChange: (e: any) => {
            if (e.data === 0 /* YT.PlayerState.ENDED */) {
              handleEnded();
            } else if (e.data === 2 /* YT.PlayerState.PAUSED */) {
              setIsPlaying(false);
            } else if (e.data === 1 /* YT.PlayerState.PLAYING */) {
              setIsPlaying(true);
              setHasStartedPlaying(true);
            }
          },
          onError: () => {}
        }
      });
    };

    if (!(window as any).YT) {
      if (!document.getElementById('yt-api')) {
        const script = document.createElement('script');
        script.id = 'yt-api';
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
      }
      
      const prev = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initPlayer();
      };
    } else if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    }
  }, [isYoutube, ytId, reel.id]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    if (isEnded) {
      setIsEnded(false);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        ytPlayerRef.current.seekTo(0, true);
        ytPlayerRef.current.playVideo();
      }
      return;
    }

    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (videoRef.current) {
      if (nextState) videoRef.current.play().catch(() => setIsPlaying(false));
      else videoRef.current.pause();
    }

    if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
      if (nextState) ytPlayerRef.current.playVideo();
      else ytPlayerRef.current.pauseVideo();
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newMuteState = !isMuted;
    
    // IF we are UNMUTING, tell all other videos to mute!
    if (!newMuteState) {
      window.dispatchEvent(new CustomEvent('muteAllShorts', { detail: reel.id }));
    }

    setIsMuted(newMuteState);
    
    if (videoRef.current) {
      videoRef.current.muted = newMuteState;
      if (!newMuteState) {
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(e => console.warn(e));
      }
    }
    
    if (ytPlayerRef.current && typeof ytPlayerRef.current.unMute === 'function') {
      if (newMuteState) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(100);
        // Force play to satisfy safari
        ytPlayerRef.current.playVideo();
      }
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoObj = containerRef.current;
    
    if (!document.fullscreenElement) {
      if (videoObj?.requestFullscreen) videoObj.requestFullscreen();
      else if ((videoObj as any)?.webkitRequestFullscreen) (videoObj as any).webkitRequestFullscreen();
      else if ((videoObj as any)?.msRequestFullscreen) (videoObj as any).msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    }
  };

  return (
    <div 
      ref={containerRef}
      data-short-id={reel.id}
      className="single-short-container relative group snap-center shrink-0 h-[65vh] sm:h-[450px] lg:h-[500px] w-auto aspect-[9/16] bg-black rounded-[20px] overflow-hidden shadow-2xl transition-transform duration-500 hover:-translate-y-2 cursor-pointer"
      onClick={togglePlayPause}
    >
      <div className={`absolute inset-0 w-full h-full flex items-center justify-center bg-stone-900 overflow-hidden`}>
        <div className={`${isFullscreen ? 'h-full aspect-[9/16]' : 'w-full h-full'} relative ${isInstagram ? '' : 'pointer-events-none'} flex items-center justify-center`}>
          {isInstagram && igEmbedUrl ? (
            <iframe 
              src={igEmbedUrl}
              className="w-full h-full object-cover"
              frameBorder="0"
              scrolling="no"
              allowTransparency={true}
              allow="encrypted-media"
            />
          ) : isYoutube && ytId ? (
            <div className="w-[400%] h-full max-w-none pointer-events-none flex items-center justify-center relative">
               <div id={`yt-${reel.id}`} className="w-full h-full" />
               {!hasStartedPlaying && (
                 <div className="absolute inset-0 bg-stone-900 z-0" />
               )}
            </div>
          ) : (
            <video 
              ref={videoRef}
              src={safeUrl} 
              muted={isMuted} 
              playsInline 
              onEnded={handleEnded}
              className={`w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'}`}
            />
          )}
        </div>
      </div>

      {!isPlaying && !isInstagram && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/20 transition-all">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30 shadow-xl">
            <DoozyLogo variant="icon" size="xl" className="opacity-90 scale-125" />
          </div>
        </div>
      )}
      
      {!isInstagram && (
        <div className={`absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 bg-gradient-to-t from-black/60 via-transparent to-black/30 transition-opacity duration-300 ${isFullscreen ? 'opacity-100' : 'opacity-100 sm:opacity-0 group-hover:opacity-100'}`}>
          <div className="flex justify-end">
            <button onClick={toggleFullscreen} className="pointer-events-auto w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors shadow-lg border border-white/30">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <button onClick={toggleMute} className="pointer-events-auto flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white/40 transition-colors shadow-lg border border-white/30">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isMuted ? 'Unmute' : 'Muted'}
              </button>
            </div>
            
            {product && (
              <div 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  router.push('/products/' + (product.slug || product.id)); 
                }}
                className="pointer-events-auto flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-[20px] w-full max-w-[280px] hover:bg-white/20 transition-all cursor-pointer group/card shadow-xl mb-2"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl overflow-hidden shrink-0">
                  <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex flex-col justify-center overflow-hidden pr-2 text-left">
                  <p className="text-white font-bold text-xs truncate w-full">{product.title}</p>
                  <p className="text-white/80 text-[10px] font-semibold">{formatPrice(product.price)}</p>
                </div>
                <div className="ml-auto w-8 h-8 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg shrink-0 group-hover/card:scale-110 transition-transform">
                  <span className="text-[10px] font-bold">Shop</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ShortsViewer: React.FC = () => {
  const { shortReels } = useStore();

  useEffect(() => {
    if (!shortReels || shortReels.length === 0) return;
    
    let lastActiveId: string | null = null;
    
    const checkCenter = () => {
      const elements = document.querySelectorAll('.single-short-container');
      let minDistance = Infinity;
      let closestId: string | null = null;
      
      const centerX = window.innerWidth / 2;
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Skip if not horizontally visible at all
        if (rect.right < 0 || rect.left > window.innerWidth) return;
        
        const elCenterX = rect.left + rect.width / 2;
        const distance = Math.abs(centerX - elCenterX);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestId = el.getAttribute('data-short-id');
        }
      });
      
      if (closestId && closestId !== lastActiveId) {
        lastActiveId = closestId;
        window.dispatchEvent(new CustomEvent('activeShortChange', { detail: closestId }));
      }
    };
    
    const interval = setInterval(checkCenter, 300);
    // Initial check
    setTimeout(checkCenter, 100);
    
    return () => clearInterval(interval);
  }, [shortReels]);

  if (!shortReels || shortReels.length === 0) return null;

  return (
    <section className="py-4 sm:py-5 bg-white overflow-hidden">
      <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4 sm:mb-6">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-2 block">Visual Stories</span>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-stone-900">DOOZY Shorts</h2>
        </div>
        
        <HorizontalScroll arrowTop="top-1/2" theme="light" gapClass="gap-4 sm:gap-6">
          {shortReels.map((reel) => (
            <SingleShort key={reel.id} reel={reel} />
          ))}
        </HorizontalScroll>
      </div>
    </section>
  );
};
