# Inventory Management Feature

A fully functional inventory management system built with Next.js, React Query, and Orval-generated API clients.

## Features

### 1. Inventory List (`/dashboard/inventory`)
- **Real-time inventory data** with pagination
- **Search functionality** by product name, SKU, or variant
- **Sorting options** by name, SKU, stock level, or last updated
- **Stock level visualization** with progress bars
- **Status badges** for stock health (Normal, Low, Out of Stock, High)
- **Quick stock adjustment** from the list view
- **Loading states** with skeleton loaders
- **Error handling** with user-friendly messages

### 2. Low Stock Alerts (`/dashboard/inventory/low-stock`)
- **Dashboard statistics** showing:
  - Total low stock items
  - Out of stock count
  - Critical stock count
- **Priority-based alerts**:
  - Out of Stock (red)
  - Critical (below 50% of minimum) (orange)
  - Low Stock (below minimum) (yellow)
- **Stock health visualization** with colored progress bars
- **Quick restock action** for each item
- **Pagination** for large datasets

### 3. Inventory Detail View (`/dashboard/inventory/[id]`)
- **Comprehensive product information**
- **Key metrics**:
  - Current stock level
  - Minimum stock threshold
  - Stock health percentage
  - Last update timestamp
- **Product details** including SKU, description, variant info
- **Full transaction history** with pagination
- **Quick stock adjustment** button

### 4. Stock Adjustment Dialog
- **Three transaction types**:
  - Stock In (Add to inventory)
  - Stock Out (Remove from inventory)
  - Adjustment (Set absolute value)
- **Real-time stock preview** showing new balance
- **Reason tracking** for audit purposes
- **Optional notes** field
- **Form validation** using Zod
- **Loading states** during submission

### 5. Transaction History
- **Detailed transaction log** showing:
  - Date and time
  - Transaction type (In/Out/Adjustment)
  - Quantity changed
  - Balance after transaction
  - Reason and notes
  - User who performed the action
- **Color-coded indicators**:
  - Green for stock in
  - Red for stock out
  - Blue for adjustments
- **Pagination** for historical data

## Architecture

### Hooks (`hooks/useInventory.ts`)

Custom React Query hooks for inventory operations:

```typescript
// Fetching hooks
useInventory(params)              // Get all inventory with filters
useLowStockInventory(params)      // Get low stock items
useInventoryDetail(id)            // Get single inventory item
useInventoryByProduct(productId)  // Get inventory by product
useInventoryByVariant(variantId)  // Get inventory by variant
useInventoryTransactions(id)      // Get transaction history

// Mutation hooks
useUpdateInventory()              // Update inventory settings
useAdjustStock()                  // Adjust stock levels
```

### Components

#### `InventoryList/index.tsx`
Main inventory management page with:
- Search and filter controls
- Sortable table columns
- Real-time data fetching
- Pagination controls
- Stock adjustment integration

#### `AdjustStockDialog.tsx`
Modal dialog for adjusting stock levels:
- Form validation
- Real-time balance calculation
- Transaction type selection
- Reason and notes capture

#### `LowStockAlerts.tsx`
Low stock monitoring dashboard:
- Statistical overview
- Priority-based filtering
- Urgency indicators
- Quick restock actions

#### `InventoryTransactions.tsx`
Transaction history viewer:
- Chronological transaction log
- Type-based filtering
- User attribution
- Detailed audit trail

## API Integration

The feature uses Orval-generated API functions from `/types/api.ts`:

```typescript
inventoryControllerFindAll()         // List inventory
inventoryControllerGetLowStock()     // Get low stock
inventoryControllerFindOne()         // Get details
inventoryControllerAdjustStock()     // Adjust stock
inventoryControllerGetTransactions() // Get history
```

All API calls automatically use the custom axios instances:
- **Public endpoints** → `ApiPublicApiInstance`
- **Private endpoints** → `ApiPrivateApiInstance` (with auth)

## Permissions

Protected by role-based permissions:
- `inventory:read` - View inventory data
- `inventory:create` - Add new products (future)
- `inventory:update` - Adjust stock levels
- `inventory:delete` - Remove inventory items (future)

## Type Safety

Fully typed using TypeScript with:
- Orval-generated API types
- Zod schema validation
- React Hook Form integration
- Type-safe query keys

## State Management

- **React Query** for server state
- **Automatic cache invalidation** on mutations
- **Optimistic updates** for better UX
- **Background refetching** to keep data fresh

## Error Handling

- Network errors with retry logic
- User-friendly error messages
- Toast notifications for success/failure
- Fallback UI for error states

## Performance Optimizations

- **Pagination** to limit data fetching
- **Skeleton loaders** for better perceived performance
- **Debounced search** to reduce API calls
- **Cached queries** to avoid redundant requests
- **Lazy loading** of transaction history

## Usage Example

```tsx
import { useInventory, useAdjustStock } from '@/features/inventory';

function InventoryPage() {
  const { data, isLoading } = useInventory({ page: 1, limit: 20 });
  const { mutate: adjustStock } = useAdjustStock();

  const handleAdjust = (id: string, data: AdjustInventoryDto) => {
    adjustStock({ id, data });
  };

  // ... component implementation
}
```

## Future Enhancements

- [ ] Bulk stock adjustments
- [ ] CSV import/export
- [ ] Stock forecasting
- [ ] Automated reorder suggestions
- [ ] Multi-location inventory
- [ ] Barcode scanning integration
- [ ] Stock alerts via email/SMS
- [ ] Advanced filtering (by category, brand, etc.)

## Dependencies

- **@tanstack/react-query** - Server state management
- **react-hook-form** - Form handling
- **zod** - Schema validation
- **sonner** - Toast notifications
- **date-fns** - Date formatting
- **lucide-react** - Icons
