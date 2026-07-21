import React from 'react';
import {
  Phone,
  MessageSquare,
  Globe,
  MessageCircle,
  Cloud,
  TrendingUp,
  BookOpen,
  Star,
  Radio,
  Home,
  Folder,
  Languages,
  Music,
  Camera,
  Settings,
  Compass,
  Heart,
  Calendar,
  MapPin,
  Shield,
  Layers,
  Image,
  Film,
  User,
  Smile,
  Sunset,
  Search,
  AppWindow,
  Mail,
  Clock,
  Play,
  HeartPulse,
  DollarSign,
  Coffee,
  CheckSquare
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Phone,
  MessageSquare,
  Globe,
  MessageCircle,
  Cloud,
  TrendingUp,
  BookOpen,
  Star,
  Radio,
  Home,
  Folder,
  Languages,
  Music,
  Camera,
  Settings,
  Compass,
  Heart,
  Calendar,
  MapPin,
  Shield,
  Layers,
  Image,
  Film,
  User,
  Smile,
  Sunset,
  Search,
  AppWindow,
  Mail,
  Clock,
  Play,
  HeartPulse,
  DollarSign,
  Coffee,
  CheckSquare
};

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function LucideIcon({ name, className, size = 24 }: LucideIconProps) {
  // Try to match exact case or capitalize first letter
  const iconKey = Object.keys(iconMap).find(
    (key) => key.toLowerCase() === name.toLowerCase()
  );
  
  const IconComponent = iconKey ? iconMap[iconKey] : AppWindow;
  return <IconComponent className={className} size={size} />;
}

export const AVAILABLE_ICONS = Object.keys(iconMap);
