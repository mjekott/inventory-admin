"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { CategoryDrawer } from '@/components/categories/CategoryDrawer';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Category } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ImageIcon, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialCategories: Category[] = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and accessories', productCount: 4, createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Furniture', description: 'Office and home furniture', productCount: 2, createdAt: new Date('2024-01-01') },
  { id: '3', name: 'Accessories', description: 'Various accessories and add-ons', productCount: 1, createdAt: new Date('2024-01-02') },
  { id: '4', name: 'Stationery', description: 'Office supplies and stationery items', productCount: 1, createdAt: new Date('2024-01-03') },
];

export default function CategoriesPage() {
  const { toast } = useToast();
  const { openDrawer } = useCategoryStore();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleSaveCategory = (category: Category) => {
    const existingIndex = categories.findIndex(c => c.id === category.id);
    if (existingIndex >= 0) {
      setCategories(categories.map(c => c.id === category.id ? category : c));
    } else {
      setCategories([...categories, category]);
    }
  };

  const handleDelete = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category && category.productCount > 0) {
      toast({
        title: 'Cannot Delete',
        description: `This category has ${category.productCount} products. Remove products first.`,
        variant: 'destructive'
      });
      return;
    }

    setCategories(categories.filter(cat => cat.id !== id));
    toast({ title: 'Success', description: 'Category deleted successfully' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage product categories and organize your inventory"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">All Categories</CardTitle>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button onClick={() => openDrawer()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No categories found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {searchTerm ? 'Try a different search term' : 'Get started by creating your first category'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[300px] truncate">
                      {category.description || '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{category.productCount}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDrawer(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{category.name}&quot;? This action cannot be undone.
                                {category.productCount > 0 && (
                                  <span className="block mt-2 text-destructive">
                                    Warning: This category has {category.productCount} products.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(category.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoryDrawer onSave={handleSaveCategory} />
    </div>
  );
}
