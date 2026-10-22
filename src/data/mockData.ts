import { Product, Order, Customer, Address } from '../types';

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    title: 'The Royal Burgundy Chanderi Chudithar Set',
    subtitle: 'Hand-embroidered Zardozi neckline with woven Banarasi silk dupatta',
    slug: 'royal-burgundy-chanderi-chudithar-set',
    price: 14999,
    compareAtPrice: 18500,
    discountPercentage: 19,
    description: 'Immerse in regal heritage with this signature DOOZY 3-piece Chudithar set. Handcrafted in pure Chanderi silk with delicate pita and zardozi threadwork across the yoke, paired with fitted churidar bottoms and an opulent Banarasi kadwa weave dupatta in royal burgundy and antique gold.',
    category: 'Chudithar & Salwar Sets',
    subCategory: 'Anarkali & Straight Chudithar',
    craft: 'Zardozi & Banarasi Weave',
    fabric: 'Pure Chanderi Silk',
    occasion: 'Festive & Wedding',
    tags: ['Signature Burgundy', 'Chudithar Set', 'Festive Edit', 'Banarasi Silk', 'Handcrafted'],
    sizes: ['XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
    colors: [
      { name: 'Royal Burgundy', hex: '#800020', imageIndex: 0 },
      { name: 'Deep Wine Plum', hex: '#4A0E17', imageIndex: 1 },
      { name: 'Gilded Ochre', hex: '#C59B27', imageIndex: 2 }
    ],
    
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85'
    ],
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    stockQuantity: 18,
    sku: 'DZ-CHU-001-BUR',
    rating: 4.9,
    reviewsCount: 42,
    details: {
      fabric: 'Kurta & Bottom: 100% Handloom Chanderi Silk. Dupatta: Pure Katan Silk Banarasi Weave.',
      fit: 'Graceful straight fit with comfortable side slits and tapered chudithar gather bottoms.',
      work: 'Intricate dabka, resham thread, and cutdana hand-embroidery by master Lucknow artisans.',
      neckline: 'Sweetheart Mandarin Collar with Keyhole',
      sleeves: 'Three-Quarter Sleeves with Scallop Borders',
      bottomStyle: 'Traditional Pleated Chudithar with Drawstring',
      dupattaFabric: 'Banarasi Kadwa Silk with Tassel Finish',
      care: 'Dry clean only. Store in breathable muslin bag to protect pure zari threads.',
      shipping: 'Complimentary express dispatch across India within 48 hours. Worldwide courier available.'
    },
    sizeChart: [
      { size: 'XS (34)', bustInches: 34, waistInches: 28, hipInches: 36, kurtaLengthInches: 46, bottomLengthInches: 44 },
      { size: 'S (36)', bustInches: 36, waistInches: 30, hipInches: 38, kurtaLengthInches: 46, bottomLengthInches: 44 },
      { size: 'M (38)', bustInches: 38, waistInches: 32, hipInches: 40, kurtaLengthInches: 47, bottomLengthInches: 45 },
      { size: 'L (40)', bustInches: 40, waistInches: 34, hipInches: 42, kurtaLengthInches: 47, bottomLengthInches: 45 },
      { size: 'XL (42)', bustInches: 42, waistInches: 36, hipInches: 44, kurtaLengthInches: 48, bottomLengthInches: 46 },
      { size: 'XXL (44)', bustInches: 44, waistInches: 38, hipInches: 46, kurtaLengthInches: 48, bottomLengthInches: 46 }
    ],
    seo: {
      metaTitle: 'The Royal Burgundy Chanderi Chudithar Set | DOOZY Ethnic Couture',
      metaDescription: 'Shop DOOZY Royal Burgundy 3-Piece Chudithar Set in Chanderi Silk with Banarasi Dupatta. Authentic luxury ethnic wear.',
      keywords: ['burgundy chudithar set', 'chanderi silk suit', 'banarasi dupatta set', 'indian ethnic wear']
    },
    createdAt: '2026-08-01'
  },
  {
    id: 'prod-2',
    title: 'Lucknowi Chikankari Angrakha Kurta',
    subtitle: 'Pure Mulmul cotton with shadow-work embroidery and mother-of-pearl latkans',
    slug: 'lucknowi-chikankari-angrakha-kurta',
    price: 6499,
    compareAtPrice: 7999,
    discountPercentage: 18,
    description: 'An ode to Awadhi grace. Cut from breathable hand-spun mulmul, this crossover Angrakha kurta showcases 32 distinct Chikankari stitch patterns—including Keel Kangan, Murri, and Bakhiya—finished with handmade silk dori ties and handcrafted latkans.',
    category: 'Kurtas & Kurtis',
    subCategory: 'Angrakha & A-Line',
    craft: 'Lucknowi Chikankari Hand Embroidery',
    fabric: 'Pure Mulmul Cotton',
    occasion: 'Office & Casual',
    tags: ['Chikankari', 'Angrakha', 'Mulmul', 'Breathable', 'Handmade'],
    sizes: ['XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
    colors: [
      { name: 'Ivory Pearl', hex: '#F9F8F4', imageIndex: 0 },
      { name: 'Burgundy Rose', hex: '#8B263E', imageIndex: 1 },
      { name: 'Sage Mint', hex: '#A3B18A', imageIndex: 2 }
    ],
    
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85'
    ],
    isNew: true,
    isBestseller: false,
    isFeatured: true,
    stockQuantity: 24,
    sku: 'DZ-KUR-002-CHK',
    rating: 4.8,
    reviewsCount: 31,
    details: {
      fabric: '100% Organic Mulmul Cotton with attached soft cotton voile slip.',
      fit: 'Flattering flared A-line Angrakha wrap with adjustable tie closure.',
      work: 'Hand-done Lucknowi Chikankari featuring subtle sequin highlights.',
      neckline: 'Overlapping V-Neck with Dori Ties',
      sleeves: 'Full Bell Sleeves with Floral Jaal',
      care: 'Gentle hand wash inside out in mild detergent. Line dry in shade.',
      shipping: 'Ready to ship in 24 hours.'
    },
    createdAt: '2026-08-10'
  },
  {
    id: 'prod-3',
    title: 'Gulmarg Silk Peplum & Flared Trousers Co-ord',
    subtitle: 'Contemporary 2-piece modal silk co-ord set with geometric thread embroidery',
    slug: 'gulmarg-silk-peplum-flared-trousers-coord',
    price: 8999,
    compareAtPrice: 10500,
    discountPercentage: 14,
    description: 'Designed for the modern connoisseur of fusion luxury. This lustrous modal silk co-ord features an architectural peplum tunic with hidden button placket, cinched waist belt with brass buckle, and breezy wide-leg trousers for effortless day-to-night elegance.',
    category: 'Ethnic & Casual Co-ords',
    subCategory: 'Tunic & Trouser Sets',
    craft: 'Aari & Resham Threadwork',
    fabric: 'Premium Modal Silk',
    occasion: 'Evening Cocktail',
    tags: ['Co-ord Set', 'Modal Silk', 'Modern Festive', 'Burgundy Luxe'],
    sizes: ['XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    colors: [
      { name: 'Deep Burgundy Wine', hex: '#631322', imageIndex: 0 },
      { name: 'Emerald Forest', hex: '#1B4332', imageIndex: 1 },
      { name: 'Sand Dunes Beige', hex: '#D4A373', imageIndex: 2 }
    ],
    
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85'
    ],
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    stockQuantity: 16,
    sku: 'DZ-CRD-003-MOD',
    rating: 4.9,
    reviewsCount: 38,
    details: {
      fabric: '100% High-Grade Modal Silk with buttery soft drape.',
      fit: 'Fitted tailored bodice with peplum flare; relaxed high-waist straight trousers.',
      work: 'Minimalist metallic threadwork and handcrafted fabric buttons.',
      neckline: 'Mandarin Band Collar with Concealed Placket',
      sleeves: 'Straight Cuffed Sleeves with Gold Button Accents',
      bottomStyle: 'High-Rise Flared Palazzo Trousers with Elastic Back',
      care: 'Dry clean recommended or gentle cold machine wash.',
      shipping: 'Dispatched in signature DOOZY luxury gift box.'
    },
    createdAt: '2026-08-12'
  },
  {
    id: 'prod-4',
    title: 'Tiered Bandhani Silk Maxi Dress with Gilded Belt',
    subtitle: 'Hand-tied Kutch Bandhani in fluid crepe silk with gathered ruffle tiers',
    slug: 'tiered-bandhani-silk-maxi-dress',
    price: 11499,
    compareAtPrice: 13999,
    discountPercentage: 17,
    description: 'A celebration of Gujarat’s ancient tie-dye heritage reimagined into a modern evening style. Features hundreds of micro hand-tied dots forming floral vortexes, cascading tiered skirt volume, and an embroidered velvet waistbelt.',
    category: 'Dresses & Indo-Western',
    subCategory: 'Festive Maxi Dresses',
    craft: 'Authentic Kutch Bandhani',
    fabric: 'Pure Silk Crepe',
    occasion: 'Festive & Wedding',
    tags: ['Bandhani', 'Maxi Dress', 'Indo-Western', 'Silk', 'Festive Gown'],
    sizes: ['XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    colors: [
      { name: 'Heritage Crimson Burgundy', hex: '#800020', imageIndex: 0 },
      { name: 'Midnight Indigo', hex: '#1D2A44', imageIndex: 1 },
      { name: 'Mustard Marigold', hex: '#D48C28', imageIndex: 2 }
    ],
    
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85'
    ],
    isNew: false,
    isBestseller: true,
    isFeatured: true,
    stockQuantity: 12,
    sku: 'DZ-DRS-004-BAN',
    rating: 5.0,
    reviewsCount: 54,
    details: {
      fabric: 'Pure Silk Crepe with Mulmul lining.',
      fit: 'Fit-and-flare floor-length maxi with 4.5 meter sweeping bottom flare.',
      work: 'Authentic Traditional Bandhani resist tie-dye done by artisan families in Bhuj.',
      neckline: 'Deep Sweetheart Neck with Gold Piping',
      sleeves: 'Elbow-Length Fitted Sleeves',
      care: 'Specialist dry clean only to maintain texture and dye integrity.',
      shipping: 'Complimentary insured shipping.'
    },
    createdAt: '2026-07-20'
  },
  {
    id: 'prod-5',
    title: 'Noorani Handwoven Banarasi Katan Silk Dupatta',
    subtitle: 'Classic antique gold zari Kadwa floral jaal with meenakari accents',
    slug: 'noorani-handwoven-banarasi-katan-silk-dupatta',
    price: 9499,
    compareAtPrice: 12000,
    discountPercentage: 20,
    description: 'An heirloom textile woven over 28 days on traditional pit looms in Varanasi. Features high-density real zari kadwa floral motifs interspersed with delicate silk meenakari threads and heavy woven pallu ends.',
    category: 'Occasionwear & Dupattas',
    subCategory: 'Heritage Dupattas',
    craft: 'Varanasi Kadwa Handloom Weave',
    fabric: '100% Pure Katan Silk',
    occasion: 'Festive & Wedding',
    tags: ['Banarasi', 'Katan Silk', 'Zari', 'Heirloom', 'Dupatta'],
    sizes: ['Free Size (2.5 Meters)'],
    colors: [
      { name: 'Royal Burgundy & Gold', hex: '#800020', imageIndex: 0 },
      { name: 'Rani Magenta', hex: '#C2185B', imageIndex: 1 },
      { name: 'Antique Ivory Gold', hex: '#EADBB6', imageIndex: 2 }
    ],
    
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85'
    ],
    isNew: false,
    isBestseller: true,
    isFeatured: true,
    stockQuantity: 9,
    sku: 'DZ-DUP-005-BAN',
    rating: 4.9,
    reviewsCount: 27,
    details: {
      fabric: 'Pure Katan Silk with certified Silk Mark authenticity.',
      fit: 'Generous 2.5m length by 36-inch width drape.',
      work: 'Intricate Kadwa hand-weaving with non-protruding reverse finish.',
      care: 'Dry clean only. Roll in muslin fabric; do not hang.',
      shipping: 'Shipped in velvet keepsake presentation box.'
    },
    createdAt: '2026-07-28'
  },
  {
    id: 'prod-6',
    title: 'Breezy Bagru Hand-Block Mulmul Daily Kurti',
    subtitle: 'Natural indigo and madder vegetable dye hand-block printed cotton',
    slug: 'breezy-bagru-hand-block-mulmul-daily-kurti',
    price: 3299,
    compareAtPrice: 3999,
    discountPercentage: 17,
    description: 'The definitive daily luxury. Made from featherlight 100s count Mulmul cotton, block printed by master craftsmen of Bagru using eco-friendly natural plant dyes. Designed with airy side slits and deep functional pockets for everyday ease.',
    category: 'Everyday Casuals',
    subCategory: 'Short & Straight Kurtis',
    craft: 'Bagru Natural Dabu Block Print',
    fabric: '100% Organic Mulmul Cotton',
    occasion: 'Office & Casual',
    tags: ['Daily Wear', 'Hand Block', 'Mulmul', 'Comfort', 'Pocket Kurti'],
    sizes: ['XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)', 'XXL (44)', '3XL (46)'],
    colors: [
      { name: 'Indigo & Madder', hex: '#263D5C', imageIndex: 0 },
      { name: 'Earth Terracotta', hex: '#A84832', imageIndex: 1 },
      { name: 'Kashish Olive Grey', hex: '#5A6251', imageIndex: 2 }
    ],
    
    images: [
      'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85'
    ],
    isNew: true,
    isBestseller: false,
    isFeatured: false,
    stockQuantity: 35,
    sku: 'DZ-CAS-006-BAG',
    rating: 4.7,
    reviewsCount: 19,
    details: {
      fabric: 'Super combed featherweight Mulmul cotton.',
      fit: 'Relaxed straight fit with side vents and dual concealed side pockets.',
      work: 'Multi-stage wooden block printing with natural fermented mud resist.',
      neckline: 'Notched Round Neck with Wooden Buttons',
      sleeves: 'Roll-Up Three-Quarter Sleeves with Button Tab',
      care: 'First wash dry clean or cold gentle hand wash separately.',
      shipping: 'Dispatches in 24 hours.'
    },
    createdAt: '2026-08-15'
  },
  {
    id: 'prod-7',
    title: 'Zari Gota Patti Georgette Anarkali Chudithar Suit',
    subtitle: 'Floor-length 32-kali Anarkali with gota patti borders and embroidered organza dupatta',
    slug: 'zari-gota-patti-georgette-anarkali-chudithar-suit',
    price: 16999,
    compareAtPrice: 21000,
    discountPercentage: 19,
    description: 'An ethereal ensemble in rich burgundy georgette featuring authentic Jaipur Gota Patti hand applique work across all 32 kalis. Complemented by a matching stretch-comfort churidar and a sheer scalloped organza dupatta highlighted with delicate mirror work.',
    category: 'Chudithar & Salwar Sets',
    subCategory: 'Anarkali Suit Sets',
    craft: 'Jaipur Gota Patti Applique',
    fabric: 'Pure Viscose Georgette',
    occasion: 'Festive & Wedding',
    tags: ['Anarkali', 'Gota Patti', 'Chudithar', 'Wedding Wear', 'Burgundy Royal'],
    sizes: ['XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    colors: [
      { name: 'Royal Burgundy Wine', hex: '#800020', imageIndex: 0 },
      { name: 'Emerald Forest', hex: '#143828', imageIndex: 1 },
      { name: 'Dusty Peach Rose', hex: '#D68979', imageIndex: 2 }
    ],
    
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85'
    ],
    isNew: true,
    isBestseller: true,
    isFeatured: true,
    stockQuantity: 10,
    sku: 'DZ-ANK-007-GOT',
    rating: 5.0,
    reviewsCount: 47,
    details: {
      fabric: 'Kurta: Viscose Georgette with Shantoon lining. Chudithar: Lycra-Silk Blend. Dupatta: Silk Organza.',
      fit: 'Dramatic flared Anarkali bodice with 5.5 meter circumference hemline.',
      work: 'Ribbon gold gota ribbon, marodi stitch, and faux pearl embroidery.',
      neckline: 'Deep U-Neck with Back Tie Tassels',
      sleeves: 'Churidar Gather Full Sleeves',
      bottomStyle: 'Lycra-Silk Fitted Chudithar with Ankle Zipper',
      dupattaFabric: 'Scallop Embroidered Sheer Silk Organza',
      care: 'Strictly dry clean only.',
      shipping: 'Complimentary premium hanger and garment preservation bag.'
    },
    createdAt: '2026-08-05'
  },
  {
    id: 'prod-8',
    title: 'Brocade Cape & Dhoti Pants Fusion Co-ord',
    subtitle: 'Structured Banarasi brocade asymmetric cape with draped satin dhoti trousers',
    slug: 'brocade-cape-dhoti-pants-fusion-coord',
    price: 12499,
    compareAtPrice: 15000,
    discountPercentage: 16,
    description: 'Elevate your occasion style with this statement Indo-Western style. A sharp structured cape woven with gold floral brocade is layered over a hand-draped pleated satin dhoti pant for high-fashion runway allure.',
    category: 'Ethnic & Casual Co-ords',
    subCategory: 'Fusion Sets',
    craft: 'Banarasi Brocade & Draping',
    fabric: 'Banarasi Brocade & Silk Satin',
    occasion: 'Evening Cocktail',
    tags: ['Dhoti Set', 'Cape Co-ord', 'Fusion', 'Indo-Western', 'Statement'],
    sizes: ['XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    colors: [
      { name: 'Royal Burgundy & Gold', hex: '#800020', imageIndex: 0 },
      { name: 'Midnight Obsidian', hex: '#161616', imageIndex: 1 },
      { name: 'Teal Peacock', hex: '#0D474F', imageIndex: 2 }
    ],
    
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=85'
    ],
    isNew: true,
    isBestseller: false,
    isFeatured: true,
    stockQuantity: 14,
    sku: 'DZ-FUS-008-DHT',
    rating: 4.8,
    reviewsCount: 22,
    details: {
      fabric: 'Cape: Banarasi Silk Brocade. Inner & Dhoti: Heavy Silk Satin.',
      fit: 'Structured tailored shoulders with fluid draped tapered dhoti.',
      work: 'Zari woven patterns with hand-tucked pleat engineering.',
      care: 'Dry clean only.',
      shipping: 'Dispatches within 48 hours.'
    },
    createdAt: '2026-08-18'
  },
  {
    id: 'prod-9',
    title: 'Ajrakh Handblock Modal Satin A-Line Kurta',
    subtitle: 'Kutch natural dyed modal silk with antique coin tassel detailing',
    slug: 'ajrakh-handblock-modal-satin-aline-kurta',
    price: 4999,
    compareAtPrice: 5999,
    discountPercentage: 16,
    description: 'Characterized by complex 16-stage resist block printing in rich indigo and burgundy madder dyes. Tailored in supple modal satin that drapes fluidly, detailed with antique metal coins at the neck slit.',
    category: 'Kurtas & Kurtis',
    subCategory: 'A-Line & Straight',
    craft: 'Authentic Kutch Ajrakh Print',
    fabric: 'High-Lustre Modal Satin',
    occasion: 'Office & Casual',
    tags: ['Ajrakh', 'Modal Silk', 'A-Line Kurta', 'Natural Dyes'],
    sizes: ['XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)', 'XXL (44)'],
    colors: [
      { name: 'Burgundy Madder & Indigo', hex: '#681B2B', imageIndex: 0 },
      { name: 'Deep Indigo Blue', hex: '#1C2E4A', imageIndex: 1 }
    ],
    
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=1200&q=85'
    ],
    isNew: false,
    isBestseller: true,
    isFeatured: false,
    stockQuantity: 28,
    sku: 'DZ-KUR-009-AJR',
    rating: 4.9,
    reviewsCount: 39,
    details: {
      fabric: '100% Eco-friendly Modal Satin.',
      fit: 'Relaxed A-line silhouette with side slits and hidden inseam pockets.',
      work: 'Authentic double-sided Ajrakh hand block printing with natural mineral mordants.',
      neckline: 'V-Slit with Antique Coin Hangings',
      sleeves: 'Straight 3/4 Sleeves with Contrast Border',
      care: 'Hand wash separately in cold water with gentle liquid soap.',
      shipping: 'Dispatched in 24 hours.'
    },
    createdAt: '2026-07-15'
  },
  {
    id: 'prod-10',
    title: 'Kalamkari Hand-Painted Pure Silk Festive Dress',
    subtitle: 'Srikalahasti pen-kalamkari peacock motifs on raw silk with flared godets',
    slug: 'kalamkari-hand-painted-pure-silk-festive-dress',
    price: 13999,
    compareAtPrice: 16500,
    discountPercentage: 15,
    description: 'Each piece is a wearable canvas hand-drawn by master Kalamkari artists using bamboo pens and natural organic dyes. Features mythological flora and dancing peacocks on pure raw silk with a modern asymmetric midi hem.',
    category: 'Dresses & Indo-Western',
    subCategory: 'Festive Midi Dresses',
    craft: 'Srikalahasti Pen Kalamkari',
    fabric: 'Pure Raw Silk',
    occasion: 'Festive & Wedding',
    tags: ['Kalamkari', 'Raw Silk', 'Artisan Dress', 'Hand Painted'],
    sizes: ['XS (34)', 'S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    colors: [
      { name: 'Burgundy Rust & Ochre', hex: '#7A2228', imageIndex: 0 },
      { name: 'Natural Khadi Cream', hex: '#EDE8DB', imageIndex: 1 }
    ],
    
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1200&q=85'
    ],
    isNew: true,
    isBestseller: false,
    isFeatured: true,
    stockQuantity: 8,
    sku: 'DZ-DRS-010-KAL',
    rating: 5.0,
    reviewsCount: 16,
    details: {
      fabric: '100% Certified Mulberry Raw Silk.',
      fit: 'Structured bodice with asymmetric godet flare midi skirt.',
      work: 'Authentic freehand Pen Kalamkari with vegetable and alum dyes.',
      care: 'Specialist dry clean only.',
      shipping: 'Numbered limited batch garment.'
    },
    createdAt: '2026-08-20'
  }
];

export const categoriesData = [
  {
    id: 'cat-1',
    name: 'Chudithar & Salwar Sets',
    slug: 'chudithar-sets',
    tagline: 'Regal 3-Piece Silk & Georgette Ensembles',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
    itemCount: '48 Designs'
  },
  {
    id: 'cat-2',
    name: 'Kurtas & Kurtis',
    slug: 'kurtas-kurtis',
    tagline: 'Chikankari, Angrakha & A-line Styles',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85',
    itemCount: '64 Designs'
  },
  {
    id: 'cat-3',
    name: 'Ethnic & Casual Co-ords',
    slug: 'coords',
    tagline: 'Modern Peplum, Tunics & Flared Trouser Pairs',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
    itemCount: '32 Designs'
  },
  {
    id: 'cat-4',
    name: 'Dresses & Indo-Western',
    slug: 'dresses',
    tagline: 'Tiered Bandhani, Brocade & Fusion Gowns',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85',
    itemCount: '28 Designs'
  },
  {
    id: 'cat-5',
    name: 'Occasionwear & Dupattas',
    slug: 'dupattas-occasion',
    tagline: 'Handwoven Banarasi Zari & Scalloped Organza',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
    itemCount: '22 Designs'
  },
  {
    id: 'cat-6',
    name: 'Everyday Casuals',
    slug: 'casuals',
    tagline: 'Breathable Mulmul & Hand-block Cotton Essentials',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=85',
    itemCount: '36 Designs'
  }
];

export const initialAddress: Address = {
  id: 'addr-1',
  fullName: 'Priya Sundaram',
  street: 'Flat 402, Royal Palms Residency, 12th Main Road',
  apartment: 'Indiranagar 2nd Stage',
  landmark: 'Near BDA Complex',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560038',
  country: 'India',
  phone: '+91 94884 45184',
  isDefault: true
};

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@example.com',
    phone: '+91 94884 45184',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'customer',
    joinedDate: '2025-11-14',
    totalSpent: 84990,
    ordersCount: 6,
    tier: 'Premium Member',
    status: 'Active',
    defaultAddress: initialAddress
  },
  {
    id: 'cust-2',
    name: 'Ananya Mehra',
    email: 'ananya.mehra@luxuryatelier.in',
    phone: '+91 98110 34567',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    role: 'customer',
    joinedDate: '2026-01-20',
    totalSpent: 42500,
    ordersCount: 3,
    tier: 'Gold',
    status: 'Active'
  },
  {
    id: 'cust-3',
    name: 'Admin DOOZY HQ',
    email: 'admin@doozy.fashion',
    phone: '+91 80 4455 6677',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    role: 'admin',
    joinedDate: '2025-01-01',
    totalSpent: 0,
    ordersCount: 0,
    tier: 'Premium Member',
    status: 'Active'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-1092',
    orderNumber: 'DZ-2026-8841',
    date: '2026-08-24',
    customerName: 'Priya Sundaram',
    customerEmail: 'priya.sundaram@example.com',
    items: [
      {
        productId: 'prod-1',
        title: 'The Royal Burgundy Chanderi Chudithar Set',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85',
        size: 'M (38)',
        color: 'Royal Burgundy',
        price: 14999,
        quantity: 1
      },
      {
        productId: 'prod-2',
        title: 'Lucknowi Chikankari Angrakha Kurta',
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=85',
        size: 'M (38)',
        color: 'Ivory Pearl',
        price: 6499,
        quantity: 1
      }
    ],
    subtotal: 21498,
    shipping: 0,
    tax: 1075,
    discount: 2149,
    total: 20424,
    status: 'Shipped',
    shippingAddress: initialAddress,
    paymentMethod: 'UPI / NetBanking (HDFC Bank)',
    
    estimatedDelivery: 'Aug 29, 2026 by 4:00 PM'
  },
  {
    id: 'ord-1091',
    orderNumber: 'DZ-2026-8839',
    date: '2026-08-21',
    customerName: 'Ananya Mehra',
    customerEmail: 'ananya.mehra@luxuryatelier.in',
    items: [
      {
        productId: 'prod-4',
        title: 'Tiered Bandhani Silk Maxi Dress with Gilded Belt',
        image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=85',
        size: 'S (36)',
        color: 'Heritage Crimson Burgundy',
        price: 11499,
        quantity: 1
      }
    ],
    subtotal: 11499,
    shipping: 0,
    tax: 575,
    discount: 0,
    total: 12074,
    status: 'Delivered',
    shippingAddress: {
      ...initialAddress,
      fullName: 'Ananya Mehra',
      street: 'C-14, Vasant Vihar',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110057',
      phone: '+91 98110 34567'
    },
    paymentMethod: 'Credit Card (Razorpay - ICICI Coral)',
    trackingNumber: 'DELHIVERY-7749102834'
  }
];

export const initialHomepageConfig = {
  sectionOrder: ['hero', 'about', 'categories', 'suggestions', 'offers', 'reviews'],
  hero: {
    desktopImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90',
    mobileImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90',
    title: 'Sovereign Splendor',
    subtitle: 'In Indian Haute Craft',
    description: 'Exquisite Chanderi silk Chudithar sets, Lucknowi Chikankari kurtas, modern fluid Co-ords, and handcrafted Banarasi zari ensembles.'
  },
  about: {
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    title: 'The Pure Chanderi &\nBanarasi Zari Symphony',
    description: 'Every DOOZY garment is an ode to slow fashion. Handwoven by generational weavers across Madhya Pradesh and Varanasi, our Chanderi and Katan silks are spun using certified pure metallic zari and natural vegetable dyes that gracefully age with time.'
  },
  visibleCategories: ['Chudithar & Salwar Sets', 'Kurta Sets & Tunics', 'Luxury Co-ord Sets'],
  megaMenuPoster: {
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    title: 'The Royal Burgundy',
    subtitle: 'Explore the Collection'
  }
};
