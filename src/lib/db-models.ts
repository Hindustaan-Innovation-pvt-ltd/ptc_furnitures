import mongoose, { type Document, Schema } from "mongoose";

// ==========================================
// 1. Stored File (Binary Media storage)
// ==========================================
export interface IStoredFile extends Document {
  filename: string;
  contentType: string;
  data: Buffer;
  createdAt: Date;
}

const StoredFileSchema = new Schema<IStoredFile>({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const StoredFile =
  mongoose.models.StoredFile ||
  mongoose.model<IStoredFile>("StoredFile", StoredFileSchema);

// ==========================================
// 2. Product Schema
// ==========================================
export interface IProductCustomField {
  label: string;
  value: string;
}

export interface IProduct extends Document {
  id: string; // custom UUID string to match existing signature
  brand: string;
  images: string[];
  originalImages?: string[];
  createdAt: string;
  name?: string;
  price?: string;
  material?: string;
  craftedBy?: string;
  tag?: string;
  customFields?: IProductCustomField[];
}

const ProductCustomFieldSchema = new Schema<IProductCustomField>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

const ProductSchema = new Schema<IProduct>({
  id: { type: String, required: true, unique: true },
  brand: { type: String, default: "" },
  images: { type: [String], default: [] },
  originalImages: { type: [String], default: [] },
  createdAt: { type: String, required: true },
  name: { type: String },
  price: { type: String },
  material: { type: String },
  craftedBy: { type: String },
  tag: { type: String },
  customFields: { type: [ProductCustomFieldSchema], default: [] },
});

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

// ==========================================
// 3. Brand Schema
// ==========================================
export interface IBrand extends Document {
  name: string;
}

const BrandSchema = new Schema<IBrand>({
  name: { type: String, required: true, unique: true },
});

export const BrandModel =
  mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);

// ==========================================
// 4. Catalog Schema
// ==========================================
export interface ICatalog extends Document {
  id: string;
  title: string;
  description?: string;
  type: "pdf" | "custom";
  pdfUrl?: string;
  productIds?: string[];
  createdAt: string;
  theme?: "minimal" | "gold" | "dark";
  brand?: string;
}

const CatalogSchema = new Schema<ICatalog>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true, enum: ["pdf", "custom"] },
  pdfUrl: { type: String },
  productIds: { type: [String], default: [] },
  createdAt: { type: String, required: true },
  theme: {
    type: String,
    enum: ["minimal", "gold", "dark"],
    default: "minimal",
  },
  brand: { type: String },
});

export const CatalogModel =
  mongoose.models.Catalog || mongoose.model<ICatalog>("Catalog", CatalogSchema);

// ==========================================
// 5. Dealer Lead Schema
// ==========================================
export interface IDealerLead extends Document {
  id: string;
  name: string;
  phone: string;
  city: string;
  email?: string;
  createdAt: string;
  status: "new" | "contacted" | "approved" | "rejected";
  whatsappStatus?: "sent" | "failed";
  whatsappSentAt?: string;
  whatsappMessage?: string;
}

const DealerLeadSchema = new Schema<IDealerLead>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  email: { type: String },
  createdAt: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["new", "contacted", "approved", "rejected"],
    default: "new",
  },
  whatsappStatus: { type: String, enum: ["sent", "failed"] },
  whatsappSentAt: { type: String },
  whatsappMessage: { type: String },
});

export const DealerLeadModel =
  mongoose.models.DealerLead ||
  mongoose.model<IDealerLead>("DealerLead", DealerLeadSchema);

// ==========================================
// 6. Product Review Schema
// ==========================================
export interface IProductReview extends Document {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  text: string;
  date: string;
  status: "approved" | "pending" | "rejected";
  reviewerName?: string;
  reviewerLocation?: string;
  source?: "storefront" | "google";
}

const ProductReviewSchema = new Schema<IProductReview>({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  date: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["approved", "pending", "rejected"],
    default: "approved",
  },
  reviewerName: { type: String, default: "Anonymous" },
  reviewerLocation: { type: String, default: "" },
  source: {
    type: String,
    enum: ["storefront", "google"],
    default: "storefront",
  },
});

export const ProductReviewModel =
  mongoose.models.ProductReview ||
  mongoose.model<IProductReview>("ProductReview", ProductReviewSchema);

// ==========================================
// 7. Brand Watermark Schema
// ==========================================
export interface IBrandWatermark extends Document {
  brand: string;
  url: string;
  size?: "small" | "medium" | "large";
  opacity?: number;
  position?: string;
}

const BrandWatermarkSchema = new Schema<IBrandWatermark>({
  brand: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  size: { type: String, enum: ["small", "medium", "large"], default: "medium" },
  opacity: { type: Number, default: 50 },
  position: { type: String, default: "center" },
});

export const BrandWatermarkModel =
  mongoose.models.BrandWatermark ||
  mongoose.model<IBrandWatermark>("BrandWatermark", BrandWatermarkSchema);

// ==========================================
// 8. Dynamic Brand Logo Schema
// ==========================================
export interface IBrandLogo extends Document {
  brand: string;
  src: string;
  alt: string;
  aliases: string[];
}

const BrandLogoSchema = new Schema<IBrandLogo>({
  brand: { type: String, required: true, unique: true },
  src: { type: String, required: true },
  alt: { type: String, required: true },
  aliases: { type: [String], default: [] },
});

export const BrandLogoModel =
  mongoose.models.BrandLogo ||
  mongoose.model<IBrandLogo>("BrandLogo", BrandLogoSchema);

// ==========================================
// 9. Background Removal Cache Schema
// ==========================================
export interface IBgRemovedCache extends Document {
  originalImage: string;
  derivedImage: string;
}

const BgRemovedCacheSchema = new Schema<IBgRemovedCache>({
  originalImage: { type: String, required: true, unique: true },
  derivedImage: { type: String, required: true },
});

export const BgRemovedCacheModel =
  mongoose.models.BgRemovedCache ||
  mongoose.model<IBgRemovedCache>("BgRemovedCache", BgRemovedCacheSchema);

// ==========================================
// 10. Download Lead Schema
// ==========================================
export interface IDownloadLead extends Document {
  name: string;
  mobile: string;
  action: string; // e.g. "image_download", "catalog_download", "catalog_print"
  productId?: string;
  productName?: string;
  catalogUrl?: string;
  createdAt: Date;
}

const DownloadLeadSchema = new Schema<IDownloadLead>({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  action: { type: String, required: true, default: "image_download" },
  productId: { type: String },
  productName: { type: String },
  catalogUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const DownloadLeadModel =
  mongoose.models.DownloadLead ||
  mongoose.model<IDownloadLead>("DownloadLead", DownloadLeadSchema);

// ==========================================
// 11. Banking Details Schema (multi-account)
// ==========================================
export interface IBankingDetails extends Document {
  label: string; // e.g. "Primary Account", "UPI Only"
  isActive: boolean; // toggle visibility on public page
  // Bank Transfer
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string; // "Current" | "Savings" | "OD" | "NRI"
  branchName?: string;
  // UPI
  upiId?: string;
  upiName?: string;
  // QR image (base64 data URI)
  qrImage?: string;
  // Extra notes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BankingDetailsSchema = new Schema<IBankingDetails>({
  label: { type: String, default: "Bank Account" },
  isActive: { type: Boolean, default: true },
  accountHolderName: { type: String, default: "" },
  bankName: { type: String, default: "" },
  accountNumber: { type: String, default: "" },
  ifscCode: { type: String, default: "" },
  accountType: { type: String, default: "Current" },
  branchName: { type: String },
  upiId: { type: String },
  upiName: { type: String },
  qrImage: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const BankingDetailsModel =
  mongoose.models.BankingDetails ||
  mongoose.model<IBankingDetails>("BankingDetails", BankingDetailsSchema);

// ==========================================
// 12. Contact Message Schema
// ==========================================
export interface IContactMessage extends Document {
  name: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ContactMessageModel =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);

// ==========================================
// 13. Google Connection Schema
// ==========================================
export interface IGoogleConnection extends Document {
  isConnected: boolean;
  accountEmail?: string;
  businessName?: string;
  lastSyncedAt?: string;
  accessToken?: string;
}

const GoogleConnectionSchema = new Schema<IGoogleConnection>({
  isConnected: { type: Boolean, required: true, default: false },
  accountEmail: { type: String },
  businessName: { type: String },
  lastSyncedAt: { type: String },
  accessToken: { type: String },
});

export const GoogleConnectionModel =
  mongoose.models.GoogleConnection ||
  mongoose.model<IGoogleConnection>("GoogleConnection", GoogleConnectionSchema);

