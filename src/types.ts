export type SubscriptionTier = 'free' | 'premium';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  usageCount: number;
  tier: SubscriptionTier;
  role: UserRole;
}

export type ToolId =
  | 'naver-diagnostic'
  | 'review-reply'
  | 'naver-news'
  | 'blog-press'
  | 'experience-recruit'
  | 'instagram-script'
  | 'advert-copy'
  | 'naver-seo'
  | 'store-intro'
  | 'lead-cta';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  shortDesc: string;
  longDesc: string;
  iconName: string;
  category: 'place' | 'review' | 'blog' | 'marketing' | 'social';
}

export interface GenerationRecord {
  id: string;
  userId: string;
  userIdEmail: string;
  toolId: ToolId;
  toolName: string;
  inputs: Record<string, any>;
  outputs: string;
  createdAt: string;
  bookmarked: boolean;
}

export interface SystemErrorLog {
  id: string;
  userId?: string;
  errorMessage: string;
  toolId?: string;
  createdAt: string;
}

// Submissions for each generator
export interface NaverDiagnosticInput {
  businessName: string;
  industry: string;
  region: string;
  reviewCount: number;
  rating: number;
  photoCount: number;
  newsCount: number;
  hasBooking: boolean;
}

export interface ReviewReplyInput {
  reviewText: string;
  tone: 'friendly' | 'professional' | 'emotional' | 'vip';
}

export interface NaverNewsInput {
  industry: string;
  weather: string;
  dayOfWeek: string;
  event: string;
  promoKeyword: string;
}

export interface BlogPressInput {
  businessName: string;
  region: string;
  keyword: string;
  industry: string;
}

export interface ExperienceRecruitInput {
  businessName: string;
  recruitCount: number;
  benefits: string;
  type: 'visit' | 'delivery';
}

export interface InstagramScriptInput {
  industry: string;
  productName: string;
  event: string;
}

export interface AdvertCopyInput {
  industry: string;
  productName: string;
  eventContent: string;
}

export interface NaverSeoInput {
  region: string;
  industry: string;
}

export interface StoreIntroInput {
  businessName: string;
  industry: string;
  features: string;
}

export interface LeadCtaInput {
  industry: string;
  serviceDetail: string;
}
