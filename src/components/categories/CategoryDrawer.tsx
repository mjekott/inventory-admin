/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
;

interface CategoryDrawerProps {
  onSave?: (category: any) => void;
}

export function CategoryDrawer({ onSave }: CategoryDrawerProps) {
  const { toast } = useToast();
  const { isDrawerOpen, editingCategory, onCategoryCreated, closeDrawer } = useCategoryStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    if (editingCategory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || '',
        image: editingCategory.image || '',
      } as any);
    } else {
      setFormData({ name: '', description: '', image: '' });
    }
  }, [editingCategory, isDrawerOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    const category  = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: formData.image || undefined,
      productCount: editingCategory?.productCount || 0,
      createdAt: editingCategory?.createdAt || new Date(),
    };

    if (onSave) {
      onSave(category);
    }

    if (onCategoryCreated) {
      onCategoryCreated(category);
    }

    toast({
      title: 'Success',
      description: editingCategory
        ? 'Category updated successfully'
        : 'Category created successfully',
    });

    closeDrawer();
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', image: '' });
    closeDrawer();
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </SheetTitle>
          <SheetDescription>
            {editingCategory
              ? 'Update the category details below.'
              : 'Create a new product category. Fill in the details below.'}
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="drawer-name">Name *</Label>
            <Input
              id="drawer-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter category name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drawer-description">Description</Label>
            <Textarea
              id="drawer-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter category description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Category Image</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4">
              {formData.image ? (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Category preview"
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setFormData({ ...formData, image: '' })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">Click to upload image</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingCategory ? 'Save Changes' : 'Create Category'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
