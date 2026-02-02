"use client";

import { PageHeader } from '@/components/shared/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useCreateManufacturer,
  useDeleteManufacturer,
  useManufacturers,
  useUpdateManufacturer,
} from '@/features/products/hooks/useManufacturers';
import type { CreateManufacturerDto } from '@/types/generated/createManufacturerDto';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Building2, Edit, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Manufacturer } from '@/types/generated/manufacturer';

const manufacturerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type ManufacturerFormValues = z.infer<typeof manufacturerSchema>;

export default function ManufacturersPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: manufacturers = [], isLoading, isError } = useManufacturers();
  const { mutate: createManufacturer, isPending: isCreating } = useCreateManufacturer();
  const { mutate: updateManufacturer, isPending: isUpdating } = useUpdateManufacturer();
  const { mutate: deleteManufacturer, isPending: isDeleting } = useDeleteManufacturer();

  const form = useForm<ManufacturerFormValues>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleCreate = (values: ManufacturerFormValues) => {
    const data: CreateManufacturerDto = {
      name: values.name,
    };

    createManufacturer(data, {
      onSuccess: () => {
        setShowCreateDialog(false);
        form.reset();
      },
    });
  };

  const handleEdit = (manufacturer: Manufacturer) => {
    setEditingManufacturer(manufacturer);
    form.reset({
      name: manufacturer.name,
    });
  };

  const handleUpdate = (values: ManufacturerFormValues) => {
    if (!editingManufacturer) return;

    updateManufacturer(
      { id: editingManufacturer.id, data: { name: values.name } },
      {
        onSuccess: () => {
          setEditingManufacturer(null);
          form.reset();
        },
      }
    );
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteManufacturer(deleteId, {
        onSuccess: () => {
          setDeleteId(null);
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manufacturers"
        description="Manage product manufacturers"
        action={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Manufacturer
          </Button>
        }
      />

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load manufacturers. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : manufacturers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 className="w-12 h-12" />
                      <p className="text-sm">No manufacturers found</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCreateDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add your first manufacturer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                manufacturers.map((manufacturer) => (
                  <TableRow key={manufacturer.id}>
                    <TableCell className="font-medium">{manufacturer.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(manufacturer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(manufacturer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(manufacturer.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingManufacturer}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingManufacturer(null);
            form.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingManufacturer ? 'Edit Manufacturer' : 'Create Manufacturer'}
            </DialogTitle>
            <DialogDescription>
              {editingManufacturer
                ? 'Update manufacturer information'
                : 'Add a new manufacturer'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(editingManufacturer ? handleUpdate : handleCreate)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manufacturer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingManufacturer(null);
                    form.reset();
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingManufacturer ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manufacturer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this manufacturer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
