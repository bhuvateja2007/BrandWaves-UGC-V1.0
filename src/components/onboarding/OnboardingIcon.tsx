import React from 'react';
import {
  Palette,
  Building,
  GraduationCap,
  Code,
  BookOpen,
  TrendingUp,
  Sparkles,
  Camera,
  Video,
  Music,
  Play,
  Briefcase,
  Globe,
  Share2,
  Tv,
  Film,
  Zap,
  Target,
  DollarSign,
  Users,
  Compass,
  ShoppingBag,
  Award,
  Crown,
  Heart,
  Coffee,
  Package,
  Headphones,
  Sliders,
  CheckCircle,
  HelpCircle,
  Search,
  Instagram,
  Youtube
} from 'lucide-react';

interface OnboardingIconProps {
  name?: string;
  className?: string;
}

export const OnboardingIcon: React.FC<OnboardingIconProps> = ({ name, className = 'w-5 h-5' }) => {
  if (!name) return <Sparkles className={className} />;

  switch (name.toLowerCase()) {
    case 'creator':
    case 'palette':
    case 'design':
      return <Palette className={className} />;
    case 'brand':
    case 'building':
    case 'business':
    case 'company':
      return <Building className={className} />;
    case 'student':
    case 'graduation-cap':
    case 'education':
      return <GraduationCap className={className} />;
    case 'developer':
    case 'code':
    case 'tech':
      return <Code className={className} />;
    case 'educator':
    case 'book-open':
    case 'learning':
      return <BookOpen className={className} />;
    case 'marketing':
    case 'trending-up':
    case 'growth':
      return <TrendingUp className={className} />;
    case 'camera':
    case 'photo':
    case 'instagram':
      return <Camera className={className} />;
    case 'video':
    case 'video-camera':
    case 'reel':
      return <Video className={className} />;
    case 'music':
    case 'tiktok':
      return <Music className={className} />;
    case 'play':
    case 'youtube':
      return <Play className={className} />;
    case 'briefcase':
    case 'work':
    case 'linkedin':
      return <Briefcase className={className} />;
    case 'globe':
    case 'web':
      return <Globe className={className} />;
    case 'share':
    case 'share2':
      return <Share2 className={className} />;
    case 'tv':
    case 'media':
      return <Tv className={className} />;
    case 'film':
      return <Film className={className} />;
    case 'zap':
    case 'fast':
      return <Zap className={className} />;
    case 'target':
    case 'goal':
      return <Target className={className} />;
    case 'dollar':
    case 'earn':
      return <DollarSign className={className} />;
    case 'users':
    case 'community':
      return <Users className={className} />;
    case 'compass':
    case 'discovery':
      return <Compass className={className} />;
    case 'shopping-bag':
    case 'ecommerce':
    case 'product':
      return <ShoppingBag className={className} />;
    case 'award':
    case 'trophy':
      return <Award className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'heart':
    case 'lifestyle':
      return <Heart className={className} />;
    case 'coffee':
    case 'food':
      return <Coffee className={className} />;
    case 'package':
      return <Package className={className} />;
    case 'headphones':
      return <Headphones className={className} />;
    case 'search':
      return <Search className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};
