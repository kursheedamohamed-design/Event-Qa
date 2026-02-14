

export enum Category {
  HOME_BAKER = 'Baker',
  PHOTOGRAPHER = 'Photographer',
  HENNA_ARTIST = 'Henna Artist',
  PERFORMER = 'Performer / Artist',
  DECORATOR = 'Decorator',
  MAKEUP_ARTIST = 'Makeup Artist',
  VENUE = 'Venue',
  BOOTH = 'Booth'
}

export enum PriceType {
  HOURLY = 'Hourly',
  SESSION = 'per Session'
}

export enum PartnerStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  HIDDEN = 'Hidden'
}

// Fix: Export alias for PartnerStatus to resolve VendorStatus import errors
export { PartnerStatus as VendorStatus };

export interface MenuItem {
  name: string;
  price: string;
  thumbnail: string;
}

export interface AddOnService {
  name: string;
  price: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  favorites: string[]; // Array of partner IDs
  isPartner?: boolean;
}

export interface Review {
  id: string;
  partnerId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface Partner {
  id: string;
  ownerId: string; // Linking to the User ID who created it
  name: string;
  category: Category;
  description: string;
  services: string[];
  includedItems?: string[];
  menu?: MenuItem[];
  price: string;
  priceType: PriceType;
  addOns?: AddOnService[];
  location: string;
  whatsapp: string;
  isWhatsAppVerified?: boolean;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
  videoUrls?: string[];
  keywords?: string[];
  images: string[];
  profilePhoto?: string;
  coverPhoto?: string;
  status: PartnerStatus;
  createdAt: number;
  featured?: boolean;
  verified?: boolean;
  whatsappClicks?: number;
  profileViews?: number;
}

// Fix: Define Vendor as an alias for Partner to resolve Vendor type import errors
export type Vendor = Partner;
