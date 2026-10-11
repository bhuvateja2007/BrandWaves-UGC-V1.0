import { Creator, Brand, Product, MarketplaceCampaign } from '../types/marketplace';

// ============================================================================
// 10 FICTIONAL BRANDS
// ============================================================================
export const BRANDS: Brand[] = [
  {
    id: 'brand_crimson_pop',
    name: 'Crimson Pop',
    tagline: 'Modern craft sodas brewed with real botanicals and zero artificial fillers.',
    description: 'Crimson Pop reinvents everyday carbonated drinks with heritage brewing techniques, cold-pressed fruit extracts, and real cane sugar. Founded to bring authentic flavor back to social tables.',
    category: 'Beverages',
    logo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=160&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=1200&auto=format&fit=crop&q=80',
    location: 'Bengaluru, India',
    website: 'https://crimsonpop.demo.brandwaves.io',
    values: ['Cold-pressed botanicals', '100% Cane sugar', 'Zero artificial colors', 'Recyclable glass'],
    productIds: ['prod_crimson_classic_cola', 'prod_crimson_citrus_spark', 'prod_crimson_wild_berry_tonic'],
    campaignIds: ['camp_summer_sip_challenge'],
    creatorIds: ['creator_arjun_nair', 'creator_rahul_das', 'creator_ishita_reddy'],
    isFeatured: true,
  },
  {
    id: 'brand_dew_theory',
    name: 'Dew Theory',
    tagline: 'Clinically backed barrier care formulated for tropical sun and everyday city life.',
    description: 'Dew Theory bridges scientific dermatology with lightweight daily textures. Formulated with skin-identical ceramides, calming peptides, and invisible UV protection for all skin tones.',
    category: 'Beauty & Skincare',
    logo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=160&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&auto=format&fit=crop&q=80',
    location: 'Mumbai, India',
    website: 'https://dewtheory.demo.brandwaves.io',
    values: ['Dermatologist tested', 'Non-comedogenic', 'Cruelty-free', 'Zero white cast'],
    productIds: ['prod_dew_ceramide_sunscreen', 'prod_dew_peptide_serum', 'prod_dew_oat_cleanser'],
    campaignIds: ['camp_glow_into_summer'],
    creatorIds: ['creator_meera_iyer', 'creator_ananya_sharma', 'creator_sana_sheikh'],
    isFeatured: true,
  },
  {
    id: 'brand_northlane_studio',
    name: 'Northlane Studio',
    tagline: 'Architectural streetwear designed for functional ease and enduring silhouette.',
    description: 'Northlane Studio crafts contemporary apparel drawing inspiration from raw industrial architecture and metropolitan transit. Built with heavyweight sustainable cotton and timeless tailoring.',
    category: 'Fashion & Streetwear',
    logo: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=160&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    location: 'Delhi, India',
    website: 'https://northlanestudio.demo.brandwaves.io',
    values: ['Custom milled organic cotton', 'Reinforced seams', 'Unisex proportions', 'Plastic-free packaging'],
    productIds: ['prod_northlane_chore_jacket', 'prod_northlane_oversized_tee', 'prod_northlane_cargo_pant'],
    campaignIds: ['camp_streetwear_your_way'],
    creatorIds: ['creator_riya_kapoor', 'creator_zoya_khan', 'creator_kavya_joshi', 'creator_olivia_bennett'],
    isFeatured: true,
  },
  {
    id: 'brand_voltedge',
    name: 'VoltEdge',
    tagline: 'Precision acoustic engineering and minimalist everyday charging hardware.',
    description: 'VoltEdge creates high-fidelity audio equipment and desktop charging essentials that blend studio-grade acoustic performance with scandinavian industrial design.',
    category: 'Technology & Audio',
    logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&auto=format&fit=crop&q=80',
    location: 'Bengaluru, India',
    website: 'https://voltedge.demo.brandwaves.io',
    values: ['Custom 40mm beryllium drivers', 'Multipoint Bluetooth 5.4', 'Recycled aluminum body', 'Anodized finish'],
    productIds: ['prod_voltedge_pulse_pro_headphones', 'prod_voltedge_wave_earbuds', 'prod_voltedge_mag_dock'],
    campaignIds: ['camp_soundtrack_your_day'],
    creatorIds: ['creator_aarav_mehta', 'creator_aditya_rao', 'creator_ethan_brooks', 'creator_dev_malhotra'],
    isFeatured: true,
  },
  {
    id: 'brand_form_and_motion',
    name: 'Form & Motion',
    tagline: 'Purpose-built training gear engineered for athletic longevity and functional recovery.',
    description: 'Form & Motion designs studio-grade movement gear and resistance systems engineered for athletes, yogis, and everyday movers prioritizing joint health and posture alignment.',
    category: 'Fitness & Activewear',
    logo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=160&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
    location: 'Pune, India',
    website: 'https://formandmotion.demo.brandwaves.io',
    values: ['Natural tree rubber', 'Laser etched alignment', 'Eco-certified latex', 'Zero PVC'],
    productIds: ['prod_form_alignment_mat', 'prod_form_resistance_bands'],
    campaignIds: ['camp_everyday_fitness_reset'],
    creatorIds: ['creator_kabir_verma', 'creator_vikram_singh'],
    isFeatured: true,
  },
  {
    id: 'brand_ember_roast',
    name: 'Ember Roast',
    tagline: 'Small-batch shade-grown coffees sourced directly from generational Indian estates.',
    description: 'Ember Roast works with micro-lot coffee growers in Chikmagalur and Coorg to roast beans that celebrate origin nuances, balanced acidity, and chocolatey finishes.',
    category: 'Food & Beverage',
    logo: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=160&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80',
    location: 'Chikmagalur / Bengaluru, India',
    website: 'https://emberroast.demo.brandwaves.io',
    values: ['Direct trade certified', 'Shade-grown under rainforest canopy', 'Artisan drum roasting', 'Compostable bags'],
    productIds: ['prod_ember_monsoon_malabar', 'prod_ember_nitro_coldbrew'],
    campaignIds: ['camp_perfect_morning_ritual'],
    creatorIds: ['creator_arjun_nair', 'creator_ishita_reddy', 'creator_nisha_patel'],
    isFeatured: false,
  },
  {
    id: 'brand_roamwell',
    name: 'Roamwell',
    tagline: 'Ultralight travel luggage and modular packing systems for frictionless transit.',
    description: 'Roamwell designs weather-resistant carry gear that moves gracefully through terminals, train stations, and remote trails. Engineered for travelers who pack light and travel deeply.',
    category: 'Travel & Luggage',
    logo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=160&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80',
    location: 'Kochi, India',
    website: 'https://roamwell.demo.brandwaves.io',
    values: ['Waterproof Cordura ripstop', 'YKK Aquaguard zippers', 'TSA cabin approved', 'Lifetime hardware warranty'],
    productIds: ['prod_roamwell_nomad_backpack', 'prod_roamwell_packing_cubes'],
    campaignIds: ['camp_travel_light_live_more'],
    creatorIds: ['creator_priya_menon', 'creator_olivia_bennett', 'creator_aarav_mehta'],
    isFeatured: false,
  },
  {
    id: 'brand_haven_and_hue',
    name: 'Haven & Hue',
    tagline: 'Artisanal ceramics and ambient home accents crafted to ground modern living.',
    description: 'Haven & Hue celebrates slow home living through tactile stoneware, sculptural vessels, and clean-burning botanical scents created by generational potter collectives in Rajasthan and Khurja.',
    category: 'Home & Living',
    logo: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=160&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    location: 'Jaipur, India',
    website: 'https://havenandhue.demo.brandwaves.io',
    values: ['Studio thrown stoneware', 'Lead-free food safe glazes', '100% Soy wax', 'Fair artisan wages'],
    productIds: ['prod_haven_ripple_vase', 'prod_haven_amber_candle'],
    campaignIds: ['camp_spaces_feel_like_home'],
    creatorIds: ['creator_nisha_patel', 'creator_kavya_joshi', 'creator_ishita_reddy'],
    isFeatured: false,
  },
  {
    id: 'brand_loopkind',
    name: 'LoopKind',
    tagline: 'Circular everyday carry and hydration gear made from recovered ocean plastics.',
    description: 'LoopKind designs everyday utility items with closed-loop lifecycles. Every tote, bottle, and pouch repurposes marine plastics into durable, minimalist lifestyle companions.',
    category: 'Sustainable Lifestyle',
    logo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=160&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    location: 'Mumbai, India',
    website: 'https://loopkind.demo.brandwaves.io',
    values: ['Post-consumer recycled fabric', 'BPA-free stainless steel', 'Carbon neutral logistics', 'Take-back program'],
    productIds: ['prod_loopkind_ocean_tote', 'prod_loopkind_thermal_flask'],
    campaignIds: ['camp_better_everyday_carry'],
    creatorIds: ['creator_ishita_reddy', 'creator_olivia_bennett', 'creator_aarav_mehta'],
    isFeatured: false,
  },
  {
    id: 'brand_pawfolk',
    name: 'Pawfolk',
    tagline: 'Clean-ingredient grooming, orthopedic rest, and human-grade essentials for pets.',
    description: 'Pawfolk creates thoughtful lifestyle products designed for dogs and cats with sensitive skin and joint care needs. Formulated with veterinary herbs and human-grade comfort.',
    category: 'Pet Care & Lifestyle',
    logo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=160&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80',
    location: 'Ahmedabad, India',
    website: 'https://pawfolk.demo.brandwaves.io',
    values: ['Hypoallergenic botanical wash', 'Orthopedic dual-layer foam', 'Washable antimicrobial covers', 'Cruelty-free'],
    productIds: ['prod_pawfolk_cloud_bed', 'prod_pawfolk_oatmeal_shampoo'],
    campaignIds: ['camp_life_with_pets'],
    creatorIds: ['creator_nisha_patel', 'creator_kabir_verma', 'creator_ethan_brooks'],
    isFeatured: false,
  },
];

// ============================================================================
// 24 FICTIONAL PRODUCTS
// ============================================================================
export const PRODUCTS: Product[] = [
  // Crimson Pop (3 products)
  {
    id: 'prod_crimson_classic_cola',
    name: 'Vintage Craft Cola (330ml Glass)',
    brandId: 'brand_crimson_pop',
    category: 'Beverages',
    description: 'Slow-brewed craft cola with real kola nut, Madagascar vanilla, and cold-pressed citrus oils. Sweetened exclusively with unrefined organic cane sugar.',
    price: 140,
    currency: '₹',
    priceFormatted: '₹140',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&auto=format&fit=crop&q=80',
    ],
    features: ['Natural kola nut brew', 'Madagascar bourbon vanilla', 'No high-fructose corn syrup', 'Fine sparkling effervescence'],
    isFeatured: true,
    externalPurchaseUrl: 'https://crimsonpop.demo.brandwaves.io/products/vintage-craft-cola',
    relatedCreatorIds: ['creator_arjun_nair', 'creator_rahul_das'],
  },
  {
    id: 'prod_crimson_citrus_spark',
    name: 'Citrus Spark Botanical Soda',
    brandId: 'brand_crimson_pop',
    category: 'Beverages',
    description: 'A crisp fusion of Nagpur mandarin, key lime, and crushed lemongrass. Crisp, tart, and naturally invigorating for warm afternoons.',
    price: 160,
    currency: '₹',
    priceFormatted: '₹160',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    features: ['Real cold-pressed mandarin oil', 'Fresh lemongrass infusion', 'Only 45 calories per bottle'],
    isFeatured: false,
    externalPurchaseUrl: 'https://crimsonpop.demo.brandwaves.io/products/citrus-spark',
    relatedCreatorIds: ['creator_arjun_nair'],
  },
  {
    id: 'prod_crimson_wild_berry_tonic',
    name: 'Wild Berry Botanical Tonic',
    brandId: 'brand_crimson_pop',
    category: 'Beverages',
    description: 'Himalayan wild blackberry and elderberry crushed with mountain spring water and quinine bark for an elevated mocktail mixer.',
    price: 175,
    currency: '₹',
    priceFormatted: '₹175',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
    features: ['Himalayan wild berries', 'Natural cinchona bark extract', 'Low glycemic index'],
    isFeatured: false,
    externalPurchaseUrl: 'https://crimsonpop.demo.brandwaves.io/products/wild-berry-tonic',
    relatedCreatorIds: ['creator_ishita_reddy'],
  },

  // Dew Theory (3 products)
  {
    id: 'prod_dew_ceramide_sunscreen',
    name: 'Ceramide Invisible Shield SPF 50+ PA++++',
    brandId: 'brand_dew_theory',
    category: 'Beauty & Skincare',
    description: 'An ultra-fluid water gel sunscreen that leaves zero white cast and zero greasy residue on warm, humid days. Fortified with 5 skin-identical ceramides.',
    price: 899,
    currency: '₹',
    priceFormatted: '₹899',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
    ],
    features: ['Broad spectrum UVA/UVB protection', '5 Essential barrier ceramides', 'Water resistant for 80 mins', 'Fragrance free'],
    isFeatured: true,
    externalPurchaseUrl: 'https://dewtheory.demo.brandwaves.io/products/ceramide-shield',
    relatedCreatorIds: ['creator_meera_iyer', 'creator_ananya_sharma'],
  },
  {
    id: 'prod_dew_peptide_serum',
    name: 'Dewdrop Multi-Peptide Barrier Serum',
    brandId: 'brand_dew_theory',
    category: 'Beauty & Skincare',
    description: 'Concentrated serum combining copper tripeptide-1 and tremella snow mushroom to deeply rehydrate, soothe redness, and plump fine expression lines.',
    price: 1299,
    currency: '₹',
    priceFormatted: '₹1,299',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    features: ['3% Peptide complex', 'Tremella mushroom polysaccharide', 'Non-sticky fast absorption'],
    isFeatured: false,
    externalPurchaseUrl: 'https://dewtheory.demo.brandwaves.io/products/dewdrop-serum',
    relatedCreatorIds: ['creator_meera_iyer', 'creator_sana_sheikh'],
  },
  {
    id: 'prod_dew_oat_cleanser',
    name: 'Gentle Calming Oat Barrier Cleanser',
    brandId: 'brand_dew_theory',
    category: 'Beauty & Skincare',
    description: 'A creamy low-foaming facial wash that lifts pollution and water-resistant sunscreen without stripping the delicate lipid barrier.',
    price: 649,
    currency: '₹',
    priceFormatted: '₹649',
    image: 'https://images.unsplash.com/photo-1556228722-d0b77732a392?w=800&auto=format&fit=crop&q=80',
    features: ['Colloidal oatmeal suspension', 'pH balanced at 5.5', 'Safe for eczema-prone skin'],
    isFeatured: false,
    externalPurchaseUrl: 'https://dewtheory.demo.brandwaves.io/products/oat-cleanser',
    relatedCreatorIds: ['creator_sana_sheikh'],
  },

  // Northlane Studio (3 products)
  {
    id: 'prod_northlane_chore_jacket',
    name: 'Raw Indigo Denim Chore Jacket',
    brandId: 'brand_northlane_studio',
    category: 'Fashion & Streetwear',
    description: '14oz Japanese selvedge denim woven from sustainable ringspun yarn. Boxy architectural cut with reinforced pocket rivets and dropped shoulders.',
    price: 4499,
    currency: '₹',
    priceFormatted: '₹4,499',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
    ],
    features: ['14oz Japanese selvedge denim', 'Raw unwashed finish', 'Custom engraved matte black hardware', 'Interior utility pocket'],
    isFeatured: true,
    externalPurchaseUrl: 'https://northlanestudio.demo.brandwaves.io/products/chore-jacket',
    relatedCreatorIds: ['creator_riya_kapoor', 'creator_zoya_khan', 'creator_olivia_bennett'],
  },
  {
    id: 'prod_northlane_oversized_tee',
    name: 'Heavyweight Boxy Fit Tee (280 GSM)',
    brandId: 'brand_northlane_studio',
    category: 'Fashion & Streetwear',
    description: '280 GSM tightly combed organic cotton. Features a structured high-ribbed collar, relaxed wide sleeves, and pre-shrunk wash treatment.',
    price: 1799,
    currency: '₹',
    priceFormatted: '₹1,799',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    features: ['280 GSM premium organic cotton', 'Tight 1.25 inch ribbed collar', 'Fade-resistant pigment dye'],
    isFeatured: false,
    externalPurchaseUrl: 'https://northlanestudio.demo.brandwaves.io/products/boxy-tee',
    relatedCreatorIds: ['creator_zoya_khan', 'creator_kavya_joshi'],
  },
  {
    id: 'prod_northlane_cargo_pant',
    name: 'Utilitarian Relaxed Cargo Pant',
    brandId: 'brand_northlane_studio',
    category: 'Fashion & Streetwear',
    description: 'Heavy cotton twill relaxed fit trousers with bellowed thigh pockets, articulated knees, and discreet bungee hem adjusters.',
    price: 3299,
    currency: '₹',
    priceFormatted: '₹3,299',
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
    features: ['Reinforced knee darting', '6 Multi-functional utility pockets', 'Adjustable hem drawcords'],
    isFeatured: false,
    externalPurchaseUrl: 'https://northlanestudio.demo.brandwaves.io/products/utilitarian-cargo',
    relatedCreatorIds: ['creator_riya_kapoor'],
  },

  // VoltEdge (3 products)
  {
    id: 'prod_voltedge_pulse_pro_headphones',
    name: 'Pulse Pro Hybrid ANC Wireless Headphones',
    brandId: 'brand_voltedge',
    category: 'Technology & Audio',
    description: 'Flagship studio headphones equipped with 40mm custom beryllium drivers, active hybrid noise cancellation up to -42dB, and 50-hour playback.',
    price: 8999,
    currency: '₹',
    priceFormatted: '₹8,999',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    ],
    features: ['40mm Custom tuned beryllium drivers', 'Hybrid ANC with transparency mode', '50-hour battery life with fast charge', 'Memory foam lambskin pads'],
    isFeatured: true,
    externalPurchaseUrl: 'https://voltedge.demo.brandwaves.io/products/pulse-pro',
    relatedCreatorIds: ['creator_aarav_mehta', 'creator_aditya_rao', 'creator_ethan_brooks'],
  },
  {
    id: 'prod_voltedge_wave_earbuds',
    name: 'Wave Active Noise-Cancelling Earbuds',
    brandId: 'brand_voltedge',
    category: 'Technology & Audio',
    description: 'Compact IPX5 water-resistant in-ear monitors with 6-mic beamforming noise suppression and low-latency gaming mode.',
    price: 4499,
    currency: '₹',
    priceFormatted: '₹4,499',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    features: ['Spatial audio simulation', 'Wireless Qi charging case', '32-hour combined battery'],
    isFeatured: false,
    externalPurchaseUrl: 'https://voltedge.demo.brandwaves.io/products/wave-earbuds',
    relatedCreatorIds: ['creator_dev_malhotra'],
  },
  {
    id: 'prod_voltedge_mag_dock',
    name: 'Tri-Magnetic Fast Charging Stand',
    brandId: 'brand_voltedge',
    category: 'Technology & Audio',
    description: 'Anodized aluminum stand that powers phone, smartwatch, and earbuds simultaneously with a single 65W GaN connection.',
    price: 2999,
    currency: '₹',
    priceFormatted: '₹2,999',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    features: ['Solid CNC aluminum chassis', '15W MagSafe compatible array', 'Weighted anti-slip base'],
    isFeatured: false,
    externalPurchaseUrl: 'https://voltedge.demo.brandwaves.io/products/tri-magnetic-dock',
    relatedCreatorIds: ['creator_aarav_mehta'],
  },

  // Form & Motion (2 products)
  {
    id: 'prod_form_alignment_mat',
    name: 'Pro Alignment High-Grip Yoga Mat (5mm)',
    brandId: 'brand_form_and_motion',
    category: 'Fitness & Activewear',
    description: 'Natural tree rubber base layered with a non-slip polyurethane top. Features laser-etched posture alignment guides to support accurate joint placement.',
    price: 2799,
    currency: '₹',
    priceFormatted: '₹2,799',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    features: ['High-density 5mm joint cushioning', 'Laser-etched anatomical alignment grid', 'Eco-friendly natural rubber base', 'Anti-odor closed-cell surface'],
    isFeatured: true,
    externalPurchaseUrl: 'https://formandmotion.demo.brandwaves.io/products/alignment-mat',
    relatedCreatorIds: ['creator_kabir_verma', 'creator_vikram_singh'],
  },
  {
    id: 'prod_form_resistance_bands',
    name: 'CoreFlex Fabric Resistance Bands (5-Pack)',
    brandId: 'brand_form_and_motion',
    category: 'Fitness & Activewear',
    description: 'Breathable elastic fabric resistance loop bands designed never to pinch, roll up, or snap during intense lower-body and mobility sessions.',
    price: 1299,
    currency: '₹',
    priceFormatted: '₹1,299',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    features: ['5 Calibrated resistance tiers (10lb - 50lb)', 'Anti-slip inner grip latex ribbing', 'Machine washable fabric'],
    isFeatured: false,
    externalPurchaseUrl: 'https://formandmotion.demo.brandwaves.io/products/coreflex-bands',
    relatedCreatorIds: ['creator_kabir_verma'],
  },

  // Ember Roast (2 products)
  {
    id: 'prod_ember_monsoon_malabar',
    name: 'Monsoon Malabar Single Origin Beans (250g)',
    brandId: 'brand_ember_roast',
    category: 'Food & Beverage',
    description: 'Aged through the monsoon sea winds of the Malabar coast. Yields an extraordinarily low-acidity cup with thick crema, dark baker’s chocolate, and salted caramel notes.',
    price: 650,
    currency: '₹',
    priceFormatted: '₹650',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    features: ['Natural monsooned aging process', 'Medium-dark espresso roast', 'Tasting notes: Dark chocolate & roasted nuts', 'Roasted to order'],
    isFeatured: true,
    externalPurchaseUrl: 'https://emberroast.demo.brandwaves.io/products/monsoon-malabar',
    relatedCreatorIds: ['creator_arjun_nair', 'creator_ishita_reddy'],
  },
  {
    id: 'prod_ember_nitro_coldbrew',
    name: 'Nitro Cold Brew Concentrate (500ml)',
    brandId: 'brand_ember_roast',
    category: 'Food & Beverage',
    description: '20-hour cold extracted concentrate steeped with filtered mountain spring water. Makes 8 glasses of velvety smooth iced coffee.',
    price: 520,
    currency: '₹',
    priceFormatted: '₹520',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop&q=80',
    features: ['Zero sugar and zero preservatives', '20-Hour slow steep extraction', 'Yields 8-10 servings'],
    isFeatured: false,
    externalPurchaseUrl: 'https://emberroast.demo.brandwaves.io/products/nitro-cold-brew',
    relatedCreatorIds: ['creator_nisha_patel'],
  },

  // Roamwell (2 products)
  {
    id: 'prod_roamwell_nomad_backpack',
    name: 'Nomad Flightpack 28L Travel Backpack',
    brandId: 'brand_roamwell',
    category: 'Travel & Luggage',
    description: 'Cabin-ready travel pack with full clamshell luggage opening, suspended 16” laptop cocoon, concealed passport pocket, and breathable 3D air-mesh harness.',
    price: 5499,
    currency: '₹',
    priceFormatted: '₹5,499',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    features: ['28L TSA Cabin friendly volume', 'Cordura 500D weatherproof outer', '180-degree clamshell packing access', 'Luggage trolley handle pass-through'],
    isFeatured: true,
    externalPurchaseUrl: 'https://roamwell.demo.brandwaves.io/products/nomad-backpack',
    relatedCreatorIds: ['creator_priya_menon', 'creator_olivia_bennett'],
  },
  {
    id: 'prod_roamwell_packing_cubes',
    name: 'Ultralight Compression Packing Cube Trio',
    brandId: 'brand_roamwell',
    category: 'Travel & Luggage',
    description: 'Tear-resistant nylon packing organizers with secondary perimeter compression zippers to reduce clothing bulk by up to 45%.',
    price: 1899,
    currency: '₹',
    priceFormatted: '₹1,899',
    image: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=800&auto=format&fit=crop&q=80',
    features: ['Dual-zipper compression technology', 'Semi-translucent ripstop nylon', 'Set of Small, Medium, Large'],
    isFeatured: false,
    externalPurchaseUrl: 'https://roamwell.demo.brandwaves.io/products/compression-cubes',
    relatedCreatorIds: ['creator_priya_menon'],
  },

  // Haven & Hue (2 products)
  {
    id: 'prod_haven_ripple_vase',
    name: 'Handcrafted Ceramic Ripple Arch Vase',
    brandId: 'brand_haven_and_hue',
    category: 'Home & Living',
    description: 'Architectural vessel wheel-thrown in studio terracotta and dipped in a matte oatmeal chalk glaze. Designed to stand alone as sculpture or hold dried botanical branches.',
    price: 2299,
    currency: '₹',
    priceFormatted: '₹2,299',
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80',
    features: ['High-fire terracotta clay', 'Hand-dipped matte stoneware finish', 'Waterproof interior sealant'],
    isFeatured: true,
    externalPurchaseUrl: 'https://havenandhue.demo.brandwaves.io/products/ripple-vase',
    relatedCreatorIds: ['creator_nisha_patel', 'creator_kavya_joshi'],
  },
  {
    id: 'prod_haven_amber_candle',
    name: 'Amber Glass Botanical Soy Candle (240g)',
    brandId: 'brand_haven_and_hue',
    category: 'Home & Living',
    description: 'Hand-poured 100% natural soy wax infused with cedarwood, crushed cardamon, and warm amber resin. Features a crackling FSC-certified wood wick.',
    price: 999,
    currency: '₹',
    priceFormatted: '₹999',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80',
    features: ['50-hour clean burn time', 'FSC wood wick with soft crackle', 'Phthalate-free essential oil blend'],
    isFeatured: false,
    externalPurchaseUrl: 'https://havenandhue.demo.brandwaves.io/products/amber-candle',
    relatedCreatorIds: ['creator_ishita_reddy'],
  },

  // LoopKind (2 products)
  {
    id: 'prod_loopkind_ocean_tote',
    name: 'Recovered Ocean Canvas Everyday Market Tote',
    brandId: 'brand_loopkind',
    category: 'Sustainable Lifestyle',
    description: 'Heavyweight canvas woven from 18 recycled coastal plastic bottles. Features dual reinforced handles, interior zipped key pocket, and flat structured base.',
    price: 1499,
    currency: '₹',
    priceFormatted: '₹1,499',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    features: ['Constructed from 18 diverted ocean bottles', 'Carries up to 20kg load', 'Machine washable water-based ink'],
    isFeatured: true,
    externalPurchaseUrl: 'https://loopkind.demo.brandwaves.io/products/ocean-canvas-tote',
    relatedCreatorIds: ['creator_ishita_reddy', 'creator_olivia_bennett'],
  },
  {
    id: 'prod_loopkind_thermal_flask',
    name: 'Matte Double-Wall Thermal Flask (750ml)',
    brandId: 'brand_loopkind',
    category: 'Sustainable Lifestyle',
    description: '18/8 food-grade stainless steel with vacuum insulation that keeps cold beverages chilled for 24 hours and coffee piping hot for 12 hours.',
    price: 1299,
    currency: '₹',
    priceFormatted: '₹1,299',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    features: ['Vacuum thermal insulation (24h cold / 12h hot)', 'Sweat-proof powder coated grip', '100% Leak-proof silicone seal'],
    isFeatured: false,
    externalPurchaseUrl: 'https://loopkind.demo.brandwaves.io/products/thermal-flask',
    relatedCreatorIds: ['creator_aarav_mehta'],
  },

  // Pawfolk (2 products)
  {
    id: 'prod_pawfolk_cloud_bed',
    name: 'Orthopedic Ergonomic Memory Foam Dog Bed',
    brandId: 'brand_pawfolk',
    category: 'Pet Care & Lifestyle',
    description: 'Human-grade orthopedic memory foam mattress with wrap-around bolster pillows that cradle joints and relieve hip pressure for dogs of all ages.',
    price: 3899,
    currency: '₹',
    priceFormatted: '₹3,899',
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800&auto=format&fit=crop&q=80',
    features: ['High-density orthopedic memory foam', 'Removable machine-washable faux suede cover', 'Waterproof internal foam lining'],
    isFeatured: true,
    externalPurchaseUrl: 'https://pawfolk.demo.brandwaves.io/products/cloud-dog-bed',
    relatedCreatorIds: ['creator_nisha_patel', 'creator_ethan_brooks'],
  },
  {
    id: 'prod_pawfolk_oatmeal_shampoo',
    name: 'Botanical Calming Oatmeal Pet Shampoo (400ml)',
    brandId: 'brand_pawfolk',
    category: 'Pet Care & Lifestyle',
    description: 'Gentle colloidal oatmeal, organic chamomile, and aloe vera wash that hydrates itchy sensitive skin and leaves fur silk-soft without synthetic fragrance.',
    price: 749,
    currency: '₹',
    priceFormatted: '₹749',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=80',
    features: ['Colloidal oatmeal and organic aloe', 'Soap-free and paraben-free', 'Naturally pH balanced for pet skin'],
    isFeatured: false,
    externalPurchaseUrl: 'https://pawfolk.demo.brandwaves.io/products/oatmeal-pet-shampoo',
    relatedCreatorIds: ['creator_kabir_verma'],
  },
];

// ============================================================================
// 18 FICTIONAL CREATORS (16 Indian + 2 International)
// ============================================================================
export const CREATORS: Creator[] = [
  {
    id: 'creator_aarav_mehta',
    name: 'Aarav Mehta',
    handle: '@aaravtech',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    location: 'Mumbai, India',
    country: 'India',
    niche: 'Technology',
    bio: 'Independent hardware reviewer and mechanical keyboard designer testing productivity gear for creators and engineers.',
    languages: ['English', 'Hindi'],
    formats: ['YouTube Long-form', 'Shorts / Reels', 'Technical Desk Tours'],
    simulatedMetrics: {
      followersCount: '284K',
      avgViews: '62K',
      collabRate: '₹45,000 / video',
      completedCampaigns: 24,
      engagementRate: '5.8%',
    },
    portfolio: [
      {
        id: 'port_aarav_1',
        title: '30 Days with VoltEdge Pulse Pro: Studio Audio Test',
        format: 'YouTube Video',
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        views: '84.2K',
        engagement: '6.4%',
        date: '2026-08-14',
        relatedBrandId: 'brand_voltedge',
        relatedProductId: 'prod_voltedge_pulse_pro_headphones',
        relatedCampaignId: 'camp_soundtrack_your_day',
      },
      {
        id: 'port_aarav_2',
        title: 'The Minimal Desk Wireless Charging Matrix',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
        views: '112K',
        engagement: '7.1%',
        date: '2026-07-28',
        relatedBrandId: 'brand_voltedge',
        relatedProductId: 'prod_voltedge_mag_dock',
      },
    ],
    relatedProductIds: ['prod_voltedge_pulse_pro_headphones', 'prod_voltedge_mag_dock', 'prod_roamwell_nomad_backpack'],
    relatedCampaignIds: ['camp_soundtrack_your_day'],
    isFeatured: true,
  },
  {
    id: 'creator_ananya_sharma',
    name: 'Ananya Sharma',
    handle: '@ananyabeauty',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80',
    location: 'Bengaluru, India',
    country: 'India',
    niche: 'Beauty',
    bio: 'Cosmetic ingredient enthusiast breaking down barrier repair, clean aesthetics, and morning glow routines.',
    languages: ['English', 'Hindi', 'Kannada'],
    formats: ['Reels / Shorts', 'Get Ready With Me', 'Ingredient Deep Dives'],
    simulatedMetrics: {
      followersCount: '412K',
      avgViews: '95K',
      collabRate: '₹55,000 / reel',
      completedCampaigns: 31,
      engagementRate: '6.2%',
    },
    portfolio: [
      {
        id: 'port_ananya_1',
        title: 'Zero White-Cast Sunscreen Breakdown for Warm Tones',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
        views: '168K',
        engagement: '8.3%',
        date: '2026-09-02',
        relatedBrandId: 'brand_dew_theory',
        relatedProductId: 'prod_dew_ceramide_sunscreen',
        relatedCampaignId: 'camp_glow_into_summer',
      },
    ],
    relatedProductIds: ['prod_dew_ceramide_sunscreen', 'prod_dew_peptide_serum'],
    relatedCampaignIds: ['camp_glow_into_summer'],
    isFeatured: true,
  },
  {
    id: 'creator_riya_kapoor',
    name: 'Riya Kapoor',
    handle: '@riyakapoorstyle',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80',
    location: 'Delhi, India',
    country: 'India',
    niche: 'Fashion',
    bio: 'Streetwear archivist and sustainable stylist highlighting timeless tailoring and Indian independent labels.',
    languages: ['English', 'Hindi', 'Punjabi'],
    formats: ['Lookbooks', 'Streetwear Styling Reels', 'Photo Carousels'],
    simulatedMetrics: {
      followersCount: '195K',
      avgViews: '48K',
      collabRate: '₹38,000 / lookbook',
      completedCampaigns: 19,
      engagementRate: '5.1%',
    },
    portfolio: [
      {
        id: 'port_riya_1',
        title: '3 Ways to Style Raw Selvedge Denim in Monsoons',
        format: 'Photo Carousel',
        thumbnail: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
        views: '73K',
        engagement: '5.9%',
        date: '2026-08-20',
        relatedBrandId: 'brand_northlane_studio',
        relatedProductId: 'prod_northlane_chore_jacket',
        relatedCampaignId: 'camp_streetwear_your_way',
      },
    ],
    relatedProductIds: ['prod_northlane_chore_jacket', 'prod_northlane_cargo_pant'],
    relatedCampaignIds: ['camp_streetwear_your_way'],
    isFeatured: true,
  },
  {
    id: 'creator_kabir_verma',
    name: 'Kabir Verma',
    handle: '@kabirfitness',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    location: 'Pune, India',
    country: 'India',
    niche: 'Fitness',
    bio: 'Functional calisthenics coach and movement specialist helping desk workers rebuild posture and athletic power.',
    languages: ['English', 'Hindi', 'Marathi'],
    formats: ['Movement Tutorials', 'Reels / Shorts', 'Routine Breakdowns'],
    simulatedMetrics: {
      followersCount: '340K',
      avgViews: '82K',
      collabRate: '₹48,000 / reel',
      completedCampaigns: 22,
      engagementRate: '6.7%',
    },
    portfolio: [
      {
        id: 'port_kabir_1',
        title: '15-Minute Daily Spine & Hip Reset with Alignment Mat',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
        views: '144K',
        engagement: '7.8%',
        date: '2026-09-10',
        relatedBrandId: 'brand_form_and_motion',
        relatedProductId: 'prod_form_alignment_mat',
        relatedCampaignId: 'camp_everyday_fitness_reset',
      },
    ],
    relatedProductIds: ['prod_form_alignment_mat', 'prod_form_resistance_bands'],
    relatedCampaignIds: ['camp_everyday_fitness_reset'],
    isFeatured: true,
  },
  {
    id: 'creator_ishita_reddy',
    name: 'Ishita Reddy',
    handle: '@ishitareddy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    location: 'Hyderabad, India',
    country: 'India',
    niche: 'Lifestyle',
    bio: 'Slow living chronicler exploring intentional morning routines, mindful interiors, and quiet daily rituals.',
    languages: ['English', 'Telugu', 'Hindi'],
    formats: ['Vlogs', 'Photo Essays', 'Aesthetic Reels'],
    simulatedMetrics: {
      followersCount: '168K',
      avgViews: '39K',
      collabRate: '₹32,000 / video',
      completedCampaigns: 16,
      engagementRate: '5.4%',
    },
    portfolio: [
      {
        id: 'port_ishita_1',
        title: 'Sundays at Home: Cold Brew & Candlelight',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
        views: '68K',
        engagement: '6.1%',
        date: '2026-08-30',
        relatedBrandId: 'brand_haven_and_hue',
        relatedProductId: 'prod_haven_amber_candle',
        relatedCampaignId: 'camp_spaces_feel_like_home',
      },
    ],
    relatedProductIds: ['prod_haven_amber_candle', 'prod_ember_monsoon_malabar', 'prod_loopkind_ocean_tote'],
    relatedCampaignIds: ['camp_spaces_feel_like_home'],
    isFeatured: true,
  },
  {
    id: 'creator_arjun_nair',
    name: 'Arjun Nair',
    handle: '@arjuncooks',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    location: 'Kochi, India',
    country: 'India',
    niche: 'Food',
    bio: 'Culinary developer celebrating South Indian coastal spices, botanical beverages, and fermentation.',
    languages: ['English', 'Malayalam', 'Hindi'],
    formats: ['Short Recipe Videos', 'Cocktail / Mocktail Guides', 'Culinary Reels'],
    simulatedMetrics: {
      followersCount: '290K',
      avgViews: '74K',
      collabRate: '₹42,000 / recipe',
      completedCampaigns: 27,
      engagementRate: '6.8%',
    },
    portfolio: [
      {
        id: 'port_arjun_1',
        title: 'Kerala Spiced Mocktail with Crimson Craft Cola',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
        views: '128K',
        engagement: '7.9%',
        date: '2026-09-05',
        relatedBrandId: 'brand_crimson_pop',
        relatedProductId: 'prod_crimson_classic_cola',
        relatedCampaignId: 'camp_summer_sip_challenge',
      },
    ],
    relatedProductIds: ['prod_crimson_classic_cola', 'prod_ember_monsoon_malabar'],
    relatedCampaignIds: ['camp_summer_sip_challenge', 'camp_perfect_morning_ritual'],
    isFeatured: true,
  },
  {
    id: 'creator_meera_iyer',
    name: 'Meera Iyer',
    handle: '@meeraskincare',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1512290900672-1f41d9961603?w=1200&auto=format&fit=crop&q=80',
    location: 'Chennai, India',
    country: 'India',
    niche: 'Skincare',
    bio: 'Biochemistry graduate decoding cosmetic formulations and teaching realistic, barrier-supportive skincare.',
    languages: ['English', 'Tamil', 'Hindi'],
    formats: ['Science-backed Reels', 'Product Reviews', 'Skin Barrier Guides'],
    simulatedMetrics: {
      followersCount: '230K',
      avgViews: '58K',
      collabRate: '₹40,000 / reel',
      completedCampaigns: 20,
      engagementRate: '6.3%',
    },
    portfolio: [
      {
        id: 'port_meera_1',
        title: 'How Ceramides Actually Repair Transepidermal Water Loss',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
        views: '89K',
        engagement: '6.9%',
        date: '2026-09-08',
        relatedBrandId: 'brand_dew_theory',
        relatedProductId: 'prod_dew_peptide_serum',
        relatedCampaignId: 'camp_glow_into_summer',
      },
    ],
    relatedProductIds: ['prod_dew_ceramide_sunscreen', 'prod_dew_peptide_serum'],
    relatedCampaignIds: ['camp_glow_into_summer'],
    isFeatured: false,
  },
  {
    id: 'creator_zoya_khan',
    name: 'Zoya Khan',
    handle: '@zoyakhann',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
    location: 'Mumbai, India',
    country: 'India',
    niche: 'Fashion',
    bio: 'Fashion stylist working across editorial shoots and metropolitan everyday capsule wardrobes.',
    languages: ['English', 'Hindi', 'Urdu'],
    formats: ['Reels', 'Editorial Carousel', 'Styling Sessions'],
    simulatedMetrics: {
      followersCount: '310K',
      avgViews: '72K',
      collabRate: '₹50,000 / project',
      completedCampaigns: 25,
      engagementRate: '5.9%',
    },
    portfolio: [
      {
        id: 'port_zoya_1',
        title: 'Capsule Wardrobe Essentials: The Heavy Boxy Tee',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
        views: '105K',
        engagement: '6.7%',
        date: '2026-08-18',
        relatedBrandId: 'brand_northlane_studio',
        relatedProductId: 'prod_northlane_oversized_tee',
        relatedCampaignId: 'camp_streetwear_your_way',
      },
    ],
    relatedProductIds: ['prod_northlane_oversized_tee', 'prod_northlane_chore_jacket'],
    relatedCampaignIds: ['camp_streetwear_your_way'],
    isFeatured: false,
  },
  {
    id: 'creator_dev_malhotra',
    name: 'Dev Malhotra',
    handle: '@devplaystech',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80',
    location: 'Delhi, India',
    country: 'India',
    niche: 'Gaming',
    bio: 'Competitive esports athlete and audio reviewer testing high-performance gear under real tournament conditions.',
    languages: ['English', 'Hindi'],
    formats: ['Streams', 'Gaming Audio Tests', 'Shorts'],
    simulatedMetrics: {
      followersCount: '460K',
      avgViews: '115K',
      collabRate: '₹60,000 / video',
      completedCampaigns: 34,
      engagementRate: '7.4%',
    },
    portfolio: [
      {
        id: 'port_dev_1',
        title: 'Testing VoltEdge Wave ANC in Competitive FPS',
        format: 'YouTube Video',
        thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
        views: '138K',
        engagement: '7.9%',
        date: '2026-08-25',
        relatedBrandId: 'brand_voltedge',
        relatedProductId: 'prod_voltedge_wave_earbuds',
        relatedCampaignId: 'camp_soundtrack_your_day',
      },
    ],
    relatedProductIds: ['prod_voltedge_wave_earbuds', 'prod_voltedge_pulse_pro_headphones'],
    relatedCampaignIds: ['camp_soundtrack_your_day'],
    isFeatured: false,
  },
  {
    id: 'creator_nisha_patel',
    name: 'Nisha Patel',
    handle: '@nishahaven',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80',
    location: 'Ahmedabad, India',
    country: 'India',
    niche: 'Home & Lifestyle',
    bio: 'Interior decorator and ceramic collector turning urban apartments into tranquil, light-filled sanctuaries.',
    languages: ['English', 'Gujarati', 'Hindi'],
    formats: ['Home Tours', 'DIY Styling Reels', 'Before & Afters'],
    simulatedMetrics: {
      followersCount: '154K',
      avgViews: '36K',
      collabRate: '₹30,000 / reel',
      completedCampaigns: 14,
      engagementRate: '5.2%',
    },
    portfolio: [
      {
        id: 'port_nisha_1',
        title: 'Sculptural Ceramic Styling for Modern Living Rooms',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80',
        views: '62K',
        engagement: '5.8%',
        date: '2026-09-04',
        relatedBrandId: 'brand_haven_and_hue',
        relatedProductId: 'prod_haven_ripple_vase',
        relatedCampaignId: 'camp_spaces_feel_like_home',
      },
    ],
    relatedProductIds: ['prod_haven_ripple_vase', 'prod_pawfolk_cloud_bed'],
    relatedCampaignIds: ['camp_spaces_feel_like_home', 'camp_life_with_pets'],
    isFeatured: false,
  },
  {
    id: 'creator_aditya_rao',
    name: 'Aditya Rao',
    handle: '@adityaraotech',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
    location: 'Bengaluru, India',
    country: 'India',
    niche: 'Technology',
    bio: 'Software engineer building open-source developer setups and evaluating premium acoustics hardware.',
    languages: ['English', 'Kannada', 'Hindi'],
    formats: ['Shorts', 'Tech Tutorials', 'Desk Setups'],
    simulatedMetrics: {
      followersCount: '210K',
      avgViews: '51K',
      collabRate: '₹38,000 / video',
      completedCampaigns: 18,
      engagementRate: '6.0%',
    },
    portfolio: [
      {
        id: 'port_aditya_1',
        title: 'Building a Focused Coding Setup with ANC Headphones',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80',
        views: '77K',
        engagement: '6.5%',
        date: '2026-08-29',
        relatedBrandId: 'brand_voltedge',
        relatedProductId: 'prod_voltedge_pulse_pro_headphones',
        relatedCampaignId: 'camp_soundtrack_your_day',
      },
    ],
    relatedProductIds: ['prod_voltedge_pulse_pro_headphones'],
    relatedCampaignIds: ['camp_soundtrack_your_day'],
    isFeatured: false,
  },
  {
    id: 'creator_sana_sheikh',
    name: 'Sana Sheikh',
    handle: '@sanasheikh',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&auto=format&fit=crop&q=80',
    location: 'Hyderabad, India',
    country: 'India',
    niche: 'Beauty',
    bio: 'Clean beauty curator demonstrating everyday hydration hacks and soothing routines for sensitive skin.',
    languages: ['English', 'Telugu', 'Urdu', 'Hindi'],
    formats: ['Reels', 'Daily Routine Shorts', 'Product Comparison'],
    simulatedMetrics: {
      followersCount: '178K',
      avgViews: '42K',
      collabRate: '₹34,000 / reel',
      completedCampaigns: 15,
      engagementRate: '5.5%',
    },
    portfolio: [
      {
        id: 'port_sana_1',
        title: 'Calming Redness in 3 Steps: Oat Cleanser Routine',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1556228722-d0b77732a392?w=600&auto=format&fit=crop&q=80',
        views: '65K',
        engagement: '6.2%',
        date: '2026-08-22',
        relatedBrandId: 'brand_dew_theory',
        relatedProductId: 'prod_dew_oat_cleanser',
        relatedCampaignId: 'camp_glow_into_summer',
      },
    ],
    relatedProductIds: ['prod_dew_oat_cleanser', 'prod_dew_peptide_serum'],
    relatedCampaignIds: ['camp_glow_into_summer'],
    isFeatured: false,
  },
  {
    id: 'creator_priya_menon',
    name: 'Priya Menon',
    handle: '@priyatravels',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&auto=format&fit=crop&q=80',
    location: 'Kochi, India',
    country: 'India',
    niche: 'Travel',
    bio: 'Solo backpacker and visual storyteller documenting light-carry travel across Asia and Europe.',
    languages: ['English', 'Malayalam', 'Hindi'],
    formats: ['Travel Vlogs', 'Packing Guides', 'Cinematic Shorts'],
    simulatedMetrics: {
      followersCount: '325K',
      avgViews: '79K',
      collabRate: '₹46,000 / vlog',
      completedCampaigns: 23,
      engagementRate: '6.5%',
    },
    portfolio: [
      {
        id: 'port_priya_1',
        title: 'One 28L Bag for 14 Days in Himachal: Complete Packing Breakdown',
        format: 'YouTube Video',
        thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        views: '118K',
        engagement: '7.2%',
        date: '2026-09-01',
        relatedBrandId: 'brand_roamwell',
        relatedProductId: 'prod_roamwell_nomad_backpack',
        relatedCampaignId: 'camp_travel_light_live_more',
      },
    ],
    relatedProductIds: ['prod_roamwell_nomad_backpack', 'prod_roamwell_packing_cubes'],
    relatedCampaignIds: ['camp_travel_light_live_more'],
    isFeatured: false,
  },
  {
    id: 'creator_rahul_das',
    name: 'Rahul Das',
    handle: '@rahuldaskitchen',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    location: 'Kolkata, India',
    country: 'India',
    niche: 'Food',
    bio: 'Heritage food researcher sharing regional Bengali dishes and refreshing craft soda drink pairings.',
    languages: ['English', 'Bengali', 'Hindi'],
    formats: ['Food Documentaries', 'Reels', 'Taste Tests'],
    simulatedMetrics: {
      followersCount: '198K',
      avgViews: '44K',
      collabRate: '₹36,000 / episode',
      completedCampaigns: 17,
      engagementRate: '5.8%',
    },
    portfolio: [
      {
        id: 'port_rahul_1',
        title: 'Street Food Pairings: Craft Cola Meets Kolkata Rolls',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
        views: '92K',
        engagement: '6.8%',
        date: '2026-08-16',
        relatedBrandId: 'brand_crimson_pop',
        relatedProductId: 'prod_crimson_classic_cola',
        relatedCampaignId: 'camp_summer_sip_challenge',
      },
    ],
    relatedProductIds: ['prod_crimson_classic_cola'],
    relatedCampaignIds: ['camp_summer_sip_challenge'],
    isFeatured: false,
  },
  {
    id: 'creator_kavya_joshi',
    name: 'Kavya Joshi',
    handle: '@kavyajoshi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop&q=80',
    location: 'Jaipur, India',
    country: 'India',
    niche: 'Fashion',
    bio: 'Textile researcher and stylist blending block-print heritage with modern streetwear silhouettes.',
    languages: ['English', 'Hindi'],
    formats: ['Styling Carousels', 'Behind-the-Scenes', 'Shorts'],
    simulatedMetrics: {
      followersCount: '142K',
      avgViews: '31K',
      collabRate: '₹28,000 / post',
      completedCampaigns: 12,
      engagementRate: '5.0%',
    },
    portfolio: [
      {
        id: 'port_kavya_1',
        title: 'Styling Oversized Streetwear with Heritage Silver',
        format: 'Photo Carousel',
        thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
        views: '54K',
        engagement: '5.6%',
        date: '2026-08-10',
        relatedBrandId: 'brand_northlane_studio',
        relatedProductId: 'prod_northlane_oversized_tee',
        relatedCampaignId: 'camp_streetwear_your_way',
      },
    ],
    relatedProductIds: ['prod_northlane_oversized_tee', 'prod_haven_ripple_vase'],
    relatedCampaignIds: ['camp_streetwear_your_way'],
    isFeatured: false,
  },
  {
    id: 'creator_vikram_singh',
    name: 'Vikram Singh',
    handle: '@vikramstrength',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
    location: 'Chandigarh, India',
    country: 'India',
    niche: 'Fitness',
    bio: 'Strength coach and track athlete sharing minimalist mobility exercises and longevity routines.',
    languages: ['English', 'Punjabi', 'Hindi'],
    formats: ['Strength Tutorials', 'Form Fixes', 'Reels'],
    simulatedMetrics: {
      followersCount: '275K',
      avgViews: '66K',
      collabRate: '₹42,000 / reel',
      completedCampaigns: 21,
      engagementRate: '6.4%',
    },
    portfolio: [
      {
        id: 'port_vikram_1',
        title: 'Lower Body Mobility Circuit on High-Grip Mat',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
        views: '98K',
        engagement: '6.9%',
        date: '2026-08-28',
        relatedBrandId: 'brand_form_and_motion',
        relatedProductId: 'prod_form_alignment_mat',
        relatedCampaignId: 'camp_everyday_fitness_reset',
      },
    ],
    relatedProductIds: ['prod_form_alignment_mat'],
    relatedCampaignIds: ['camp_everyday_fitness_reset'],
    isFeatured: false,
  },
  // International Creators (2 creators)
  {
    id: 'creator_olivia_bennett',
    name: 'Olivia Bennett',
    handle: '@oliviabennett',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    location: 'London, UK',
    country: 'UK',
    niche: 'Lifestyle',
    bio: 'London-based creative director chronicling sustainable capsule wardrobes, train travel, and circular design.',
    languages: ['English'],
    formats: ['Vlogs', 'Photo Essays', 'Editorial Reels'],
    simulatedMetrics: {
      followersCount: '380K',
      avgViews: '88K',
      collabRate: '£650 / feature',
      completedCampaigns: 29,
      engagementRate: '5.7%',
    },
    portfolio: [
      {
        id: 'port_olivia_1',
        title: 'Eurostar Weekend Carry: Packing with Roamwell 28L',
        format: 'YouTube Video',
        thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        views: '142K',
        engagement: '6.8%',
        date: '2026-08-15',
        relatedBrandId: 'brand_roamwell',
        relatedProductId: 'prod_roamwell_nomad_backpack',
        relatedCampaignId: 'camp_travel_light_live_more',
      },
      {
        id: 'port_olivia_2',
        title: 'Why I Swapped Leather for Ocean Canvas Totes',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
        views: '96K',
        engagement: '6.1%',
        date: '2026-07-20',
        relatedBrandId: 'brand_loopkind',
        relatedProductId: 'prod_loopkind_ocean_tote',
        relatedCampaignId: 'camp_better_everyday_carry',
      },
    ],
    relatedProductIds: ['prod_roamwell_nomad_backpack', 'prod_loopkind_ocean_tote', 'prod_northlane_chore_jacket'],
    relatedCampaignIds: ['camp_travel_light_live_more', 'camp_better_everyday_carry'],
    isFeatured: true,
  },
  {
    id: 'creator_ethan_brooks',
    name: 'Ethan Brooks',
    handle: '@ethanbrooks',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    location: 'Austin, USA',
    country: 'USA',
    niche: 'Technology',
    bio: 'Software engineer and indie game developer benchmarking ergonomic hardware, mechanical keycaps, and rescue pets.',
    languages: ['English'],
    formats: ['Desk Setups', 'Hardware Benchmarks', 'Pet Vlogs'],
    simulatedMetrics: {
      followersCount: '495K',
      avgViews: '120K',
      collabRate: '$850 / review',
      completedCampaigns: 36,
      engagementRate: '6.9%',
    },
    portfolio: [
      {
        id: 'port_ethan_1',
        title: 'ANC Headphones Stress Test: 8 Hours in an Austin Coffee Shop',
        format: 'YouTube Video',
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        views: '175K',
        engagement: '7.5%',
        date: '2026-08-11',
        relatedBrandId: 'brand_voltedge',
        relatedProductId: 'prod_voltedge_pulse_pro_headphones',
        relatedCampaignId: 'camp_soundtrack_your_day',
      },
      {
        id: 'port_ethan_2',
        title: 'Upgrading My Rescue Golden’s Bed to Orthopedic Foam',
        format: 'Reel',
        thumbnail: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&auto=format&fit=crop&q=80',
        views: '210K',
        engagement: '8.7%',
        date: '2026-07-15',
        relatedBrandId: 'brand_pawfolk',
        relatedProductId: 'prod_pawfolk_cloud_bed',
        relatedCampaignId: 'camp_life_with_pets',
      },
    ],
    relatedProductIds: ['prod_voltedge_pulse_pro_headphones', 'prod_pawfolk_cloud_bed'],
    relatedCampaignIds: ['camp_soundtrack_your_day', 'camp_life_with_pets'],
    isFeatured: true,
  },
];

// ============================================================================
// 10 FICTIONAL CAMPAIGNS (Open, In Progress, Completed)
// ============================================================================
export const CAMPAIGNS: MarketplaceCampaign[] = [
  {
    id: 'camp_summer_sip_challenge',
    title: 'Summer Sip Challenge',
    brandId: 'brand_crimson_pop',
    brandName: 'Crimson Pop',
    brandLogo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=160&auto=format&fit=crop&q=80',
    productId: 'prod_crimson_classic_cola',
    productName: 'Vintage Craft Cola (330ml Glass)',
    category: 'Beverages',
    platform: 'Instagram',
    format: 'Reels Video & Story Series',
    description: 'Create an engaging summer refresh video pairing Crimson Pop Vintage Craft Cola with your favorite homemade snack or social moment.',
    brief: 'We are seeking authentic food, beverage, and lifestyle creators to capture the satisfying opening and first-sip moment of Crimson Pop Vintage Craft Cola. Highlight the sound of the bottle cap, the rich natural fizz, and explain why real cane sugar tastes better than artificial soda.',
    objective: 'Generate organic awareness for Crimson Pop’s craft soda range across major Indian metropolitan areas.',
    targetNiches: ['Food', 'Lifestyle'],
    requiredFormats: ['1x 45-60s Vertical Reel', '2x Story Slides with Poll'],
    deliverables: [
      '1x Dedicated Instagram Reel with audio hook',
      '2x Instagram Story slides with sticker link to Crimson Pop',
      'Raw 4K footage delivered for brand whitelisting',
    ],
    eligibility: [
      'Creators based in India',
      'Minimum 10,000 engaged followers',
      'High video production quality (natural lighting, crisp audio)',
      'Previous experience in beverage or lifestyle content',
    ],
    deadline: '2026-11-15',
    rewardType: 'fixed',
    rewardAmount: '₹35,000 Fixed',
    status: 'open',
    spotsTotal: 12,
    spotsFilled: 4,
    isFeatured: true,
    relatedCreatorIds: ['creator_arjun_nair', 'creator_rahul_das', 'creator_ishita_reddy'],
  },
  {
    id: 'camp_glow_into_summer',
    title: 'Glow Into Summer',
    brandId: 'brand_dew_theory',
    brandName: 'Dew Theory',
    brandLogo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=160&auto=format&fit=crop&q=80',
    productId: 'prod_dew_ceramide_sunscreen',
    productName: 'Ceramide Invisible Shield SPF 50+ PA++++',
    category: 'Beauty & Skincare',
    platform: 'Multi-platform',
    format: 'Educational Application Demo',
    description: 'Demonstrate real UV protection with zero white cast using Dew Theory’s Ceramide Invisible Shield SPF 50+ on diverse skin tones.',
    brief: 'Show the seamless blend-out of Dew Theory Ceramide Shield SPF 50+ in natural daylight. Explain the importance of ceramides for barrier health during summer heat, and test wearability under everyday humidity or light makeup.',
    objective: 'Dispel the myth that high SPF sunscreens must feel heavy, chalky, or greasy on melanin-rich skin.',
    targetNiches: ['Beauty', 'Skincare'],
    requiredFormats: ['1x High-definition Close-up Reel', '1x YouTube Short'],
    deliverables: [
      '1x Application demo showing two-finger sunscreen rule',
      '1x 8-hour check-in showing grease-free finish',
      'Engagement in comments answering audience skin queries',
    ],
    eligibility: [
      'Skincare or beauty creators who prioritize ingredient honesty',
      'No beauty filters during product application',
      'Audience based primarily in India',
    ],
    deadline: '2026-11-20',
    rewardType: 'fixed',
    rewardAmount: '₹45,000 Fixed',
    status: 'open',
    spotsTotal: 15,
    spotsFilled: 7,
    isFeatured: true,
    relatedCreatorIds: ['creator_ananya_sharma', 'creator_meera_iyer', 'creator_sana_sheikh'],
  },
  {
    id: 'camp_streetwear_your_way',
    title: 'Streetwear Your Way',
    brandId: 'brand_northlane_studio',
    brandName: 'Northlane Studio',
    brandLogo: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=160&auto=format&fit=crop&q=80',
    productId: 'prod_northlane_chore_jacket',
    productName: 'Raw Indigo Denim Chore Jacket',
    category: 'Fashion & Streetwear',
    platform: 'Instagram',
    format: 'Lookbook & Styling Carousel',
    description: 'Style Northlane Studio’s raw selvedge chore jacket across three distinct occasions: casual work, evening social, and weekend transit.',
    brief: 'Capture the architectural drape, heavy fabric weight, and tactile textures of selvedge denim. Contrast the chore jacket against diverse silhouettes to prove its versatility as a lifetime wardrobe anchor.',
    objective: 'Position Northlane Studio as the premier destination for modern sustainable denim and minimalist streetwear.',
    targetNiches: ['Fashion', 'Streetwear'],
    requiredFormats: ['1x Dynamic Outfit Transition Reel', '1x 5-Slide Photo Carousel'],
    deliverables: [
      '1x 30s Fast-cut styling transition video',
      '1x High-resolution 5-slide editorial photo carousel',
      'Tagging @northlanestudio with official campaign hashtag #StreetwearYourWay',
    ],
    eligibility: [
      'Fashion stylists, creative directors, or lookbook creators',
      'Strong aesthetic curation and clean visual typography',
      'Minimum 15,000 followers',
    ],
    deadline: '2026-11-10',
    rewardType: 'fixed',
    rewardAmount: '₹40,000 Fixed',
    status: 'open',
    spotsTotal: 10,
    spotsFilled: 5,
    isFeatured: true,
    relatedCreatorIds: ['creator_riya_kapoor', 'creator_zoya_khan', 'creator_kavya_joshi'],
  },
  {
    id: 'camp_soundtrack_your_day',
    title: 'Soundtrack Your Day',
    brandId: 'brand_voltedge',
    brandName: 'VoltEdge',
    brandLogo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&auto=format&fit=crop&q=80',
    productId: 'prod_voltedge_pulse_pro_headphones',
    productName: 'Pulse Pro Hybrid ANC Wireless Headphones',
    category: 'Technology & Audio',
    platform: 'YouTube',
    format: 'Integrated Review & Productivity Desk Tour',
    description: 'In-depth testing of VoltEdge Pulse Pro noise cancellation in loud cafes, metro commutes, and deep-focus coding environments.',
    brief: 'Demonstrate the difference between standard noise isolation and VoltEdge’s -42dB Hybrid ANC. Test battery life, microphone isolation on calls, and evaluate audio neutrality across diverse music genres.',
    objective: 'Drive considered tech purchases ahead of the upcoming festival upgrade season.',
    targetNiches: ['Technology', 'Gaming'],
    requiredFormats: ['1x 8-12 min Dedicated/Integrated YouTube Review', '1x Teaser Short'],
    deliverables: [
      'Integrated 90-second dedicated segment in tech desk video',
      'Microphone background noise isolation audio comparison',
      'Unique trackable link in video description',
    ],
    eligibility: [
      'Tech reviewers, software developers, or gaming creators',
      'Minimum 30,000 subscribers',
      'Ability to produce studio-grade audio recordings',
    ],
    deadline: '2026-10-31',
    rewardType: 'fixed',
    rewardAmount: '₹60,000 Fixed',
    status: 'in_progress',
    spotsTotal: 8,
    spotsFilled: 7,
    isFeatured: true,
    relatedCreatorIds: ['creator_aarav_mehta', 'creator_aditya_rao', 'creator_ethan_brooks', 'creator_dev_malhotra'],
  },
  {
    id: 'camp_everyday_fitness_reset',
    title: 'Everyday Fitness Reset',
    brandId: 'brand_form_and_motion',
    brandName: 'Form & Motion',
    brandLogo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=160&auto=format&fit=crop&q=80',
    productId: 'prod_form_alignment_mat',
    productName: 'Pro Alignment High-Grip Yoga Mat (5mm)',
    category: 'Fitness & Activewear',
    platform: 'Instagram',
    format: 'Follow-Along Movement Tutorial',
    description: 'Lead a 10-minute follow-along morning mobility sequence utilizing Form & Motion’s laser-etched posture alignment guidelines.',
    brief: 'Help desk workers and athletes discover the importance of proper joint stacking. Demonstrate how laser guidelines eliminate guesswork during lunges, downward dogs, and deep hip openers.',
    objective: 'Build trust with conscious fitness enthusiasts seeking durability over cheap PVC mats.',
    targetNiches: ['Fitness', 'Lifestyle'],
    requiredFormats: ['1x Full-length Follow Along Reel', '1x Form Breakdown Carousel'],
    deliverables: [
      '1x 60-second follow-along movement reel with voiceover cueing',
      '1x 4-slide carousel highlighting common form errors',
      'Exclusive community discount code provided to followers',
    ],
    eligibility: [
      'Certified yoga teachers, mobility trainers, or fitness coaches',
      'Commitment to safe movement and injury prevention',
    ],
    deadline: '2026-11-25',
    rewardType: 'fixed',
    rewardAmount: '₹38,000 Fixed',
    status: 'open',
    spotsTotal: 10,
    spotsFilled: 3,
    isFeatured: false,
    relatedCreatorIds: ['creator_kabir_verma', 'creator_vikram_singh'],
  },
  {
    id: 'camp_perfect_morning_ritual',
    title: 'The Perfect Morning Ritual',
    brandId: 'brand_ember_roast',
    brandName: 'Ember Roast',
    brandLogo: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=160&auto=format&fit=crop&q=80',
    productId: 'prod_ember_monsoon_malabar',
    productName: 'Monsoon Malabar Single Origin Beans (250g)',
    category: 'Food & Beverage',
    platform: 'Multi-platform',
    format: 'Sensory Morning Coffee Vlog',
    description: 'Capture the calming ritual of manual coffee brewing at dawn with Ember Roast Monsoon Malabar beans.',
    brief: 'Focus on tactile ASMR audio: beans dropping into the hand grinder, the fresh aromatic bloom, and pouring over warm milk or black over ice. Tell the story of Indian estate coffee cultivation.',
    objective: 'Expand specialty coffee appreciation beyond traditional cafes into home kitchens.',
    targetNiches: ['Food', 'Lifestyle'],
    requiredFormats: ['1x ASMR Brewing Reel', '1x Sensory Tasting Notes Post'],
    deliverables: [
      '1x High-fidelity audio morning vlog reel',
      'Description of flavor profile (chocolate, malt, low acidity)',
      'Link to bean subscription discovery page',
    ],
    eligibility: [
      'Coffee creators, home baristas, or slow-lifestyle vloggers',
      'Access to manual brewing equipment (V60, French Press, or Aeropress)',
    ],
    deadline: '2026-11-18',
    rewardType: 'fixed',
    rewardAmount: '₹30,000 Fixed',
    status: 'open',
    spotsTotal: 12,
    spotsFilled: 6,
    isFeatured: false,
    relatedCreatorIds: ['creator_arjun_nair', 'creator_ishita_reddy', 'creator_nisha_patel'],
  },
  {
    id: 'camp_travel_light_live_more',
    title: 'Travel Light, Live More',
    brandId: 'brand_roamwell',
    brandName: 'Roamwell',
    brandLogo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=160&auto=format&fit=crop&q=80',
    productId: 'prod_roamwell_nomad_backpack',
    productName: 'Nomad Flightpack 28L Travel Backpack',
    category: 'Travel & Luggage',
    platform: 'YouTube',
    format: 'One-Bag Travel Packing Guide',
    description: 'Document a 7-day journey using solely the 28L Roamwell Nomad Flightpack as cabin baggage without checking any luggage.',
    brief: 'Show the art of packing light. Highlight the dedicated tech compartment, the clamshell clothing access, and demonstrate navigating airports without waiting at baggage claims.',
    objective: 'Establish Roamwell as the gold standard for minimalist modular carry equipment.',
    targetNiches: ['Travel', 'Lifestyle'],
    requiredFormats: ['1x Dedicated Travel Vlog / Packing Video', '2x Reel Shorts'],
    deliverables: [
      '1x Long-form packing and airport walkthrough video',
      '2x Shorts highlighting hidden passport and quick-access pockets',
      'Product wear and tear review after trip completion',
    ],
    eligibility: [
      'Travel creators, digital nomads, or weekend explorers',
      'Upcoming travel planned within campaign window',
      'Minimum 25,000 followers across platforms',
    ],
    deadline: '2026-10-28',
    rewardType: 'fixed',
    rewardAmount: '₹50,000 Fixed',
    status: 'in_progress',
    spotsTotal: 6,
    spotsFilled: 6,
    isFeatured: false,
    relatedCreatorIds: ['creator_priya_menon', 'creator_olivia_bennett'],
  },
  {
    id: 'camp_spaces_feel_like_home',
    title: 'Spaces That Feel Like Home',
    brandId: 'brand_haven_and_hue',
    brandName: 'Haven & Hue',
    brandLogo: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=160&auto=format&fit=crop&q=80',
    productId: 'prod_haven_ripple_vase',
    productName: 'Handcrafted Ceramic Ripple Arch Vase',
    category: 'Home & Living',
    platform: 'Instagram',
    format: 'Interior Styling Transformation',
    description: 'Style a neglected corner, entryway shelf, or work desk into an inviting anchor space with Haven & Hue ceramic vessels and amber candles.',
    brief: 'Focus on warm natural textures, architectural curves, and how intentional home accents transform everyday moods in urban spaces.',
    objective: 'Highlight Indian artisan studio ceramics and clean soy wax fragrances.',
    targetNiches: ['Home & Lifestyle', 'Lifestyle'],
    requiredFormats: ['1x Before/After Corner Styling Reel', '1x 4-Slide Gallery'],
    deliverables: [
      '1x Reel showing gradual step-by-step shelf styling transformation',
      'High-res photos capturing pottery texture and natural light',
    ],
    eligibility: [
      'Home decor, architecture, and interior styling creators',
      'Aesthetic photo composition and natural lighting',
    ],
    deadline: '2026-11-22',
    rewardType: 'fixed',
    rewardAmount: '₹32,000 Fixed',
    status: 'open',
    spotsTotal: 10,
    spotsFilled: 3,
    isFeatured: false,
    relatedCreatorIds: ['creator_nisha_patel', 'creator_ishita_reddy', 'creator_kavya_joshi'],
  },
  {
    id: 'camp_better_everyday_carry',
    title: 'Better Everyday Carry',
    brandId: 'brand_loopkind',
    brandName: 'LoopKind',
    brandLogo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=160&auto=format&fit=crop&q=80',
    productId: 'prod_loopkind_ocean_tote',
    productName: 'Recovered Ocean Canvas Everyday Market Tote',
    category: 'Sustainable Lifestyle',
    platform: 'Instagram',
    format: 'What’s In My Bag Everyday Video',
    description: 'Showcase how LoopKind circular gear eliminates single-use plastics from daily grocery, cafe work, and gym routines.',
    brief: 'Explain that the tote was made from 18 recovered ocean plastic bottles without compromising durability or aesthetic minimalism.',
    objective: 'Demonstrate that sustainable choices can be effortlessly stylish and durable.',
    targetNiches: ['Sustainable Lifestyle', 'Lifestyle'],
    requiredFormats: ['1x "What’s In My Bag" Reel', '1x Story Set'],
    deliverables: [
      '1x 45s Everyday Carry packing breakdown video',
      'Demonstration of weight bearing capacity and water repellency',
    ],
    eligibility: [
      'Sustainability advocates, student creators, or conscious lifestyle bloggers',
    ],
    deadline: '2026-09-30',
    rewardType: 'fixed',
    rewardAmount: '₹28,000 Fixed',
    status: 'completed',
    spotsTotal: 8,
    spotsFilled: 8,
    isFeatured: false,
    relatedCreatorIds: ['creator_ishita_reddy', 'creator_olivia_bennett'],
  },
  {
    id: 'camp_life_with_pets',
    title: 'Life With Pets',
    brandId: 'brand_pawfolk',
    brandName: 'Pawfolk',
    brandLogo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=160&auto=format&fit=crop&q=80',
    productId: 'prod_pawfolk_cloud_bed',
    productName: 'Orthopedic Ergonomic Memory Foam Dog Bed',
    category: 'Pet Care & Lifestyle',
    platform: 'Multi-platform',
    format: 'Wholesome Pet Routine & Unboxing',
    description: 'Document your rescue dog or senior pet experiencing deep, orthopedic sleep on Pawfolk’s Cloud Bed.',
    brief: 'Share your pet’s personality, daily routine, and show their genuine reaction to resting on orthopedic memory foam. Mention joint support and easy-to-wash cover maintenance.',
    objective: 'Help pet parents invest in orthopedic sleep wellness for their furry family members.',
    targetNiches: ['Pet Care & Lifestyle', 'Home & Lifestyle'],
    requiredFormats: ['1x Pet POV Unboxing Reel', '1x TikTok / Short'],
    deliverables: [
      '1x Heartwarming 30-45s pet unboxing and sleep test',
      'Highlight of washable waterproof inner lining feature',
    ],
    eligibility: [
      'Pet creators with dogs or cats',
      'Authentic storytelling and loving pet care emphasis',
    ],
    deadline: '2026-11-12',
    rewardType: 'fixed',
    rewardAmount: '₹34,000 Fixed',
    status: 'open',
    spotsTotal: 10,
    spotsFilled: 4,
    isFeatured: false,
    relatedCreatorIds: ['creator_nisha_patel', 'creator_ethan_brooks', 'creator_kabir_verma'],
  },
];

// ============================================================================
// DATA ACCESS & FILTERING HELPERS
// ============================================================================

export function getCreators(filters?: {
  search?: string;
  niche?: string;
  country?: string;
  language?: string;
}): Creator[] {
  let list = [...CREATORS];

  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.niche.toLowerCase().includes(q)
    );
  }

  if (filters?.niche && filters.niche !== 'All') {
    list = list.filter((c) => c.niche.toLowerCase() === filters.niche!.toLowerCase());
  }

  if (filters?.country && filters.country !== 'All') {
    list = list.filter((c) => c.country.toLowerCase() === filters.country!.toLowerCase());
  }

  if (filters?.language && filters.language !== 'All') {
    list = list.filter((c) =>
      c.languages.some((l) => l.toLowerCase() === filters.language!.toLowerCase())
    );
  }

  return list;
}

export function getCreatorById(id: string): Creator | undefined {
  return CREATORS.find((c) => c.id === id);
}

export function getBrands(filters?: { search?: string; category?: string }): Brand[] {
  let list = [...BRANDS];

  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q)
    );
  }

  if (filters?.category && filters.category !== 'All') {
    list = list.filter((b) => b.category.toLowerCase() === filters.category!.toLowerCase());
  }

  return list;
}

export function getBrandById(id: string): Brand | undefined {
  return BRANDS.find((b) => b.id === id);
}

export function getProducts(filters?: {
  search?: string;
  category?: string;
  brandId?: string;
}): Product[] {
  let list = [...PRODUCTS];

  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter((p) => {
      const brand = getBrandById(p.brandId);
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (brand && brand.name.toLowerCase().includes(q))
      );
    });
  }

  if (filters?.category && filters.category !== 'All' && filters.category !== 'All Products') {
    const targetCat = filters.category.toLowerCase().trim();
    list = list.filter((p) => {
      const pCat = p.category.toLowerCase();
      if (targetCat === 'skincare & beauty' || targetCat === 'skincare' || targetCat === 'beauty') {
        return pCat.includes('beauty') || pCat.includes('skincare');
      }
      if (targetCat === 'audio & headphones' || targetCat === 'audio' || targetCat === 'technology') {
        return pCat.includes('audio') || pCat.includes('technology') || p.name.toLowerCase().includes('headphone') || p.name.toLowerCase().includes('earbud');
      }
      if (targetCat === 'fashion & apparel' || targetCat === 'fashion & accessories' || targetCat === 'fashion' || targetCat === 'streetwear') {
        return pCat.includes('fashion') || pCat.includes('streetwear');
      }
      if (targetCat === 'beverages & roastery' || targetCat === 'beverages' || targetCat === 'drinks' || targetCat === 'coffee') {
        return pCat.includes('beverage') || pCat.includes('food');
      }
      if (targetCat === 'lifestyle & home' || targetCat === 'lifestyle & other products' || targetCat === 'lifestyle' || targetCat === 'home') {
        return pCat.includes('fitness') || pCat.includes('activewear') || pCat.includes('travel') || pCat.includes('luggage') || pCat.includes('home') || pCat.includes('living') || pCat.includes('sustainable') || pCat.includes('pet');
      }
      return pCat === targetCat || pCat.includes(targetCat) || targetCat.includes(pCat);
    });
  }

  if (filters?.brandId) {
    list = list.filter((p) => p.brandId === filters.brandId);
  }

  return list;
}

export function getProductCategoriesWithCounts(): Array<{ id: string; label: string; count: number }> {
  return [
    { id: 'All Products', label: 'All Products', count: getProducts().length },
    { id: 'Skincare & Beauty', label: 'Skincare & Beauty', count: getProducts({ category: 'Skincare & Beauty' }).length },
    { id: 'Audio & Headphones', label: 'Audio & Headphones', count: getProducts({ category: 'Audio & Headphones' }).length },
    { id: 'Fashion & Apparel', label: 'Fashion & Apparel', count: getProducts({ category: 'Fashion & Apparel' }).length },
    { id: 'Beverages & Roastery', label: 'Beverages & Roastery', count: getProducts({ category: 'Beverages & Roastery' }).length },
    { id: 'Lifestyle & Home', label: 'Lifestyle & Home', count: getProducts({ category: 'Lifestyle & Home' }).length },
  ];
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getMarketplaceCampaigns(filters?: {
  search?: string;
  status?: string;
  category?: string;
  brandId?: string;
}): MarketplaceCampaign[] {
  let list = [...CAMPAIGNS];

  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.brandName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.targetNiches.some((n) => n.toLowerCase().includes(q))
    );
  }

  if (filters?.status && filters.status !== 'All') {
    list = list.filter((c) => c.status.toLowerCase() === filters.status!.toLowerCase());
  }

  if (filters?.category && filters.category !== 'All') {
    list = list.filter((c) => c.category.toLowerCase() === filters.category!.toLowerCase());
  }

  if (filters?.brandId) {
    list = list.filter((c) => c.brandId === filters.brandId);
  }

  return list;
}

export function getMarketplaceCampaignById(id: string): MarketplaceCampaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

export function getFeaturedCreators(): Creator[] {
  return CREATORS.filter((c) => c.isFeatured);
}

export function getFeaturedBrands(): Brand[] {
  return BRANDS.filter((b) => b.isFeatured);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.isFeatured);
}

export function getFeaturedCampaigns(): MarketplaceCampaign[] {
  return CAMPAIGNS.filter((c) => c.isFeatured);
}

// ============================================================================
// DATA INTEGRITY VALIDATION SUITE
// ============================================================================
export interface IntegrityValidationResult {
  isValid: boolean;
  creatorCount: number;
  brandCount: number;
  productCount: number;
  campaignCount: number;
  errors: string[];
}

export function validateMarketplaceDataIntegrity(): IntegrityValidationResult {
  const errors: string[] = [];

  // Check counts
  if (CREATORS.length !== 18) {
    errors.push(`Expected exactly 18 creators, got ${CREATORS.length}`);
  }
  if (BRANDS.length !== 10) {
    errors.push(`Expected exactly 10 brands, got ${BRANDS.length}`);
  }
  if (PRODUCTS.length !== 24) {
    errors.push(`Expected exactly 24 products, got ${PRODUCTS.length}`);
  }
  if (CAMPAIGNS.length !== 10) {
    errors.push(`Expected exactly 10 campaigns, got ${CAMPAIGNS.length}`);
  }

  // Check unique IDs
  const creatorIds = new Set<string>();
  for (const c of CREATORS) {
    if (creatorIds.has(c.id)) errors.push(`Duplicate creator ID: ${c.id}`);
    creatorIds.add(c.id);
  }

  const brandIds = new Set<string>();
  for (const b of BRANDS) {
    if (brandIds.has(b.id)) errors.push(`Duplicate brand ID: ${b.id}`);
    brandIds.add(b.id);
  }

  const productIds = new Set<string>();
  for (const p of PRODUCTS) {
    if (productIds.has(p.id)) errors.push(`Duplicate product ID: ${p.id}`);
    productIds.add(p.id);
  }

  const campaignIds = new Set<string>();
  for (const c of CAMPAIGNS) {
    if (campaignIds.has(c.id)) errors.push(`Duplicate campaign ID: ${c.id}`);
    campaignIds.add(c.id);
  }

  // Validate product -> brand references
  for (const p of PRODUCTS) {
    if (!brandIds.has(p.brandId)) {
      errors.push(`Product "${p.id}" references non-existent brandId "${p.brandId}"`);
    }
    if (p.relatedCreatorIds) {
      for (const crId of p.relatedCreatorIds) {
        if (!creatorIds.has(crId)) {
          errors.push(`Product "${p.id}" references non-existent creatorId "${crId}"`);
        }
      }
    }
  }

  // Validate brand -> products & campaigns references
  for (const b of BRANDS) {
    for (const prodId of b.productIds) {
      if (!productIds.has(prodId)) {
        errors.push(`Brand "${b.id}" references non-existent productId "${prodId}"`);
      }
    }
    for (const campId of b.campaignIds) {
      if (!campaignIds.has(campId)) {
        errors.push(`Brand "${b.id}" references non-existent campaignId "${campId}"`);
      }
    }
    for (const crId of b.creatorIds) {
      if (!creatorIds.has(crId)) {
        errors.push(`Brand "${b.id}" references non-existent creatorId "${crId}"`);
      }
    }
  }

  // Validate campaign -> brand and product references
  for (const camp of CAMPAIGNS) {
    if (!brandIds.has(camp.brandId)) {
      errors.push(`Campaign "${camp.id}" references non-existent brandId "${camp.brandId}"`);
    }
    if (camp.productId && !productIds.has(camp.productId)) {
      errors.push(`Campaign "${camp.id}" references non-existent productId "${camp.productId}"`);
    }
    for (const crId of camp.relatedCreatorIds) {
      if (!creatorIds.has(crId)) {
        errors.push(`Campaign "${camp.id}" references non-existent creatorId "${crId}"`);
      }
    }
  }

  // Validate creator portfolio item references
  for (const cr of CREATORS) {
    for (const port of cr.portfolio) {
      if (port.relatedBrandId && !brandIds.has(port.relatedBrandId)) {
        errors.push(`Creator "${cr.id}" portfolio "${port.id}" references non-existent brandId "${port.relatedBrandId}"`);
      }
      if (port.relatedProductId && !productIds.has(port.relatedProductId)) {
        errors.push(`Creator "${cr.id}" portfolio "${port.id}" references non-existent productId "${port.relatedProductId}"`);
      }
      if (port.relatedCampaignId && !campaignIds.has(port.relatedCampaignId)) {
        errors.push(`Creator "${cr.id}" portfolio "${port.id}" references non-existent campaignId "${port.relatedCampaignId}"`);
      }
    }
    for (const prodId of cr.relatedProductIds) {
      if (!productIds.has(prodId)) {
        errors.push(`Creator "${cr.id}" references non-existent productId "${prodId}"`);
      }
    }
    for (const campId of cr.relatedCampaignIds) {
      if (!campaignIds.has(campId)) {
        errors.push(`Creator "${cr.id}" references non-existent campaignId "${campId}"`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    creatorCount: CREATORS.length,
    brandCount: BRANDS.length,
    productCount: PRODUCTS.length,
    campaignCount: CAMPAIGNS.length,
    errors,
  };
}
