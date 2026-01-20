import { Category } from '@/types/inventory';
import { create } from 'zustand';

interface CategoryState {
  isDrawerOpen: boolean;
  editingCategory: Category | null;
  onCategoryCreated: ((category: Category) => void) | null;

  openDrawer: (category?: Category | null, onCreated?: (category: Category) => void) => void;
  closeDrawer: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  isDrawerOpen: false,
  editingCategory: null,
  onCategoryCreated: null,

  openDrawer: (category = null, onCreated) => set({
    isDrawerOpen: true,
    editingCategory: category,
    onCategoryCreated: onCreated || null,
  }),

  closeDrawer: () => set({
    isDrawerOpen: false,
    editingCategory: null,
    onCategoryCreated: null,
  }),
}));
