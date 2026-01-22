// User Roles - now dynamic with super_admin as highest
export type UserRole = "super_admin" | "admin" | "manager" | "staff" | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Permissions System
export type PermissionModule =
  | "inventory"
  | "orders"
  | "stock"
  | "users"
  | "reports"
  | "settings";
export type PermissionAction = "create" | "read" | "update" | "delete";

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: PermissionModule;
  action?: PermissionAction;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[]; // Permission IDs
  isSystem: boolean; // System roles cannot be deleted
  createdAt: Date;
}

export interface Staff {
  id: string;
  userId: string;
  employeeId: string;
  department: string;
  position: string;
  phone?: string;
  hireDate: Date;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  unit: string;
  location?: string;
  lastUpdated: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: "inward" | "outward" | "adjustment";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  tax?: number;
  discount?: number;
  paymentMethod?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: "product" | "order" | "stock" | "user" | "role" | "permission";
  entityId: string;
  details: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  stockValue: number;
}

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId?: string;
  logo?: string;
  receiptFooter?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  avatar?: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  createdAt: Date;
  notes?: string;
}

export interface CustomerActivity {
  id: string;
  customerId: string;
  type: "order" | "payment" | "refund" | "note" | "status_change";
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface SessionPayload {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  role: string;
}

export interface LoginState {
  success?: boolean;

  fieldErrors?: {
    email?: string[];
    password?: string[];
  };

  formError?: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: {
        code: string;
      };
    };
    accessToken: string;
    refreshToken: string;
    refreshTokenExpires: string;
  };
}
