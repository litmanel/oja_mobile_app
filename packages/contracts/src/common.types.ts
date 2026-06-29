export enum Role {
  VENDOR = 'vendor',
  BUYER = 'buyer',
  ADMIN = 'admin',
}

export enum MarketName {
  BODIJA = 'bodija',
  KUTO = 'kuto',
  EKE_AWKA = 'eke_awka',
  OTHER = 'other',
}

export enum UnitLabel {
  KG = 'kg',
  G = 'g',
  LITRE = 'litre',
  PIECE = 'piece',
  BAG = 'bag',
  BUNCH = 'bunch',
  CUSTOM = 'custom',
}

export enum ListingCategory {
  FOOD = 'food',
  CLOTHING = 'clothing',
  HOUSEHOLD = 'household',
  ELECTRONICS = 'electronics',
  OTHER = 'other',
}

export enum ListingStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  HIDDEN_FLAGGED = 'hidden_flagged',
  DELETED = 'deleted',
}

export enum ReportReason {
  WRONG_PRICE = 'wrong_price',
  INACTIVE_VENDOR = 'inactive_vendor',
  OFFENSIVE = 'offensive',
  SPAM = 'spam',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  DISMISSED = 'dismissed',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
