
import React from 'react';
import { Cake, MapPin, Palette, Music, Sparkles, Camera, Brush, Tent } from 'lucide-react';
import { Category } from './types';

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  [Category.HOME_BAKER]: <Cake className="w-6 h-6" />,
  [Category.PHOTOGRAPHER]: <Camera className="w-6 h-6" />,
  [Category.HENNA_ARTIST]: <Palette className="w-6 h-6" />,
  [Category.PERFORMER]: <Music className="w-6 h-6" />,
  [Category.DECORATOR]: <Sparkles className="w-6 h-6" />,
  [Category.MAKEUP_ARTIST]: <Brush className="w-6 h-6" />,
  [Category.VENUE]: <MapPin className="w-6 h-6" />,
  [Category.BOOTH]: <Tent className="w-6 h-6" />
};

export const QATAR_REGIONS = [
  'Doha',
  'Al Rayyan',
  'Al Wakrah',
  'Lusail',
  'The Pearl',
  'Al Khor',
  'Umm Salal',
  'Madinat ash Shamal'
];

export const WHATSAPP_TEMPLATE = (vendorName: string) => 
  `Hi, I found ${vendorName} on Qatar Party Hub. I'd like to ask about your services.`;
