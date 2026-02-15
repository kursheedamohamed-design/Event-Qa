
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

export enum UserRole {
  USER = 'USER',     // For Parents / Event Planners
  PARTNER = 'PARTNER' // For Business Owners
}

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
  role: UserRole;
  favorites: string[]; // Array of partner IDs
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
  ownerId: string;
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

export type Vendor = Partner;
