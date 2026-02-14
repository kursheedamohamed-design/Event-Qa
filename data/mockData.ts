
import { Vendor, Category, PriceType, VendorStatus } from '../types';

export const MOCK_VENDORS: Vendor[] = [
  {
    id: '1',
    name: 'Sweet Crumbs by Aisha',
    category: Category.HOME_BAKER,
    description: 'Bespoke cakes and dessert tables for magical celebrations. We specialize in custom-themed cakes, hand-crafted with premium organic ingredients for weddings, birthdays, and corporate events.',
    services: ['Custom Cakes', 'Cupcakes', 'Dessert Tables', 'Macarons'],
    includedItems: ['Cake Box Included', 'Disposable Knife', 'Candle Set', 'Theme Consultation'],
    price: '350',
    priceType: PriceType.SESSION,
    isWhatsAppVerified: true,
    addOns: [
      { name: 'Same Day Delivery', price: '50' },
      { name: 'Theme Customization', price: '150' }
    ],
    location: 'Al Rayyan',
    whatsapp: '97433445566',
    instagram: 'sweetcrumbs_qa',
    profilePhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400',
    images: [
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800'
    ],
    keywords: ['Celebration Cake Doha', 'Custom Cakes Qatar', 'Luxury Baker'],
    status: VendorStatus.APPROVED,
    createdAt: Date.now(),
    featured: true,
    verified: true,
    profileViews: 1240,
    whatsappClicks: 45
  },
  {
    id: '2',
    name: 'Wonderland Event Venue',
    category: Category.VENUE,
    description: 'The ultimate indoor playground and party venue. All-inclusive packages with private party rooms, professional hosting, and premium amenities for unforgettable gatherings.',
    services: ['Venue Hire', 'Soft Play Access', 'Event Hosting', 'Premium Menu'],
    includedItems: ['Standard Decorations', 'Music System', 'Cleanup Service'],
    price: '1500',
    priceType: PriceType.SESSION,
    isWhatsAppVerified: true,
    location: 'Lusail',
    whatsapp: '97455667788',
    website: 'www.wonderlandqatar.com',
    profilePhoto: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=400',
    images: [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=800'
    ],
    keywords: ['Party Venue Lusail', 'Event Space Qatar'],
    status: VendorStatus.APPROVED,
    createdAt: Date.now() - 86400000,
    featured: true,
    verified: true,
    profileViews: 3500,
    whatsappClicks: 128
  },
  {
    id: '5',
    name: 'Capturing Smiles Photography',
    category: Category.PHOTOGRAPHER,
    description: 'Professional event photography specializing in family and social gatherings. We capture the candid moments and joyful smiles that last a lifetime.',
    services: ['Event Coverage', 'Portrait Session', 'Digital Album', 'Photo Booth'],
    includedItems: ['Edited Digital Files', 'Online Gallery', 'Highlight Video'],
    price: '1200',
    priceType: PriceType.SESSION,
    isWhatsAppVerified: true,
    location: 'The Pearl',
    whatsapp: '97433221144',
    instagram: 'capturingsmiles_qa',
    profilePhoto: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=80&w=400',
    images: [
      'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=800'
    ],
    keywords: ['Photographer Pearl Qatar', 'Event Photos Doha'],
    status: VendorStatus.APPROVED,
    createdAt: Date.now() - 30000,
    verified: true,
    profileViews: 1100,
    whatsappClicks: 56
  }
];
