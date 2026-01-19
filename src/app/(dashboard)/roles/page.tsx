"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { mockRoles, mockPermissions } from '@/data/mockData';
import { Role, Permission, PermissionModule } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Key,
  Package,
  ShoppingCart,
  Layers,
  Users,
  FileText,
  Settings,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const moduleIcons: Record<PermissionModule, React.ElementType> = {
  inventory: Package,
  orders: ShoppingCart,
  stock: Layers,
  users: Users,
  reports: FileText,
  settings: Settings,
};

const moduleLabels: Record<PermissionModule, string> = {
  inventory: 'Inventory',
  orders: 'Orders',
  stock: 'Stock Management',
  users: 'User Management',
  reports: 'Reports',
  settings: 'Settings',
};

export default function RolesPermissionsPage() {
  const { hasPermission, isSuperAdmin } = useAuth();
  const [roles] = useState<Role[]>(mockRoles);
  const [permissions] = useState<Permission[]>(mockPermissions);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissions: [] as string[],
  });

  if (!hasPermission(['admin', 'super_admin'])) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need administrator privileges to manage roles and permissions.
          </p>
        </div>
      </div>
    );
  }

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<PermissionModule, Permission[]>);

  const getRolePermissionCount = (role: Role) => {
    return role.permissions.length;
  };

  const handleCreateRole = () => {
    if (!formData.name || !formData.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Role created successfully!', {
      description: `${formData.name} has been added with ${formData.permissions.length} permissions.`,
    });

    setIsCreateRoleOpen(false);
    resetForm();
  };

  const handleUpdateRole = () => {
    if (!formData.name || !formData.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Role updated successfully!', {
      description: `${formData.name} permissions have been updated.`,
    });

    setEditingRole(null);
    resetForm();
  };

  const handleDeleteRole = (role: Role) => {
    if (role.isSystem) {
      toast.error('Cannot delete system roles');
      return;
    }

    toast.success('Role deleted', {
      description: `${role.name} has been removed from the system.`,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      permissions: [],
    });
  };

  const openEditDialog = (role: Role) => {
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description,
      permissions: [...role.permissions],
    });
    setEditingRole(role);
  };

  const togglePermission = (permId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const toggleModulePermissions = (module: PermissionModule, checked: boolean) => {
    const modulePerms = groupedPermissions[module].map((p) => p.id);
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...new Set([...prev.permissions, ...modulePerms])]
        : prev.permissions.filter((p) => !modulePerms.includes(p)),
    }));
  };

  const isModuleFullySelected = (module: PermissionModule) => {
    const modulePerms = groupedPermissions[module].map((p) => p.id);
    return modulePerms.every((p) => formData.permissions.includes(p));
  };

  const isModulePartiallySelected = (module: PermissionModule) => {
    const modulePerms = groupedPermissions[module].map((p) => p.id);
    const selectedCount = modulePerms.filter((p) => formData.permissions.includes(p)).length;
    return selectedCount > 0 && selectedCount < modulePerms.length;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage user roles and configure access permissions"
        action={
          isSuperAdmin() ? (
            <Button onClick={() => setIsCreateRoleOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          ) : undefined
        }
      />

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className="relative">
                {role.isSystem && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      System
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    {role.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Key className="w-4 h-4" />
                      {getRolePermissionCount(role)} permissions
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Created {format(role.createdAt, 'MMM yyyy')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewingRole(role)}
                    >
                      View
                    </Button>
                    {isSuperAdmin() && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(role)}
                          disabled={role.code === 'super_admin'}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRole(role)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="space-y-6">
            {(Object.keys(groupedPermissions) as PermissionModule[]).map((module) => {
              const Icon = moduleIcons[module];
              return (
                <Card key={module}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      {moduleLabels[module]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permission</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedPermissions[module].map((perm) => (
                          <TableRow key={perm.id}>
                            <TableCell className="font-medium">{perm.name}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {perm.code}
                              </code>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {perm.description}
                            </TableCell>
                            <TableCell>
                              <Badge variant={perm.action ? 'default' : 'secondary'}>
                                {perm.action || 'Action'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Role Dialog */}
      <Dialog open={!!viewingRole} onOpenChange={() => setViewingRole(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {viewingRole?.name}
            </DialogTitle>
            <DialogDescription>{viewingRole?.description}</DialogDescription>
          </DialogHeader>

          {viewingRole && (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4">
                {(Object.keys(groupedPermissions) as PermissionModule[]).map((module) => {
                  const modulePerms = groupedPermissions[module];
                  const grantedPerms = modulePerms.filter((p) =>
                    viewingRole.permissions.includes(p.id)
                  );

                  if (grantedPerms.length === 0) return null;

                  const Icon = moduleIcons[module];
                  return (
                    <div key={module}>
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {moduleLabels[module]}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {grantedPerms.map((perm) => (
                          <Badge key={perm.id} variant="secondary">
                            {perm.name}
                          </Badge>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingRole(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Role Dialog */}
      <Dialog
        open={isCreateRoleOpen || !!editingRole}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateRoleOpen(false);
            setEditingRole(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Update role permissions and settings.'
                : 'Define a new role with specific permissions.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name *</Label>
                <Input
                  id="roleName"
                  placeholder="e.g., Sales Manager"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleCode">Role Code *</Label>
                <Input
                  id="roleCode"
                  placeholder="e.g., sales_manager"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                  }
                  disabled={!!editingRole}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleDesc">Description</Label>
              <Textarea
                id="roleDesc"
                placeholder="Describe what this role can do..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions ({formData.permissions.length} selected)</Label>
              <ScrollArea className="h-[300px] border rounded-lg p-4">
                <div className="space-y-6">
                  {(Object.keys(groupedPermissions) as PermissionModule[]).map((module) => {
                    const Icon = moduleIcons[module];
                    return (
                      <div key={module}>
                        <div className="flex items-center gap-2 mb-3">
                          <Checkbox
                            id={`module-${module}`}
                            checked={isModuleFullySelected(module)}
                            onCheckedChange={(checked) =>
                              toggleModulePermissions(module, checked as boolean)
                            }
                            className={isModulePartiallySelected(module) ? 'data-[state=checked]:bg-primary/50' : ''}
                          />
                          <Label
                            htmlFor={`module-${module}`}
                            className="font-medium flex items-center gap-2 cursor-pointer"
                          >
                            <Icon className="w-4 h-4 text-primary" />
                            {moduleLabels[module]}
                          </Label>
                        </div>
                        <div className="ml-6 grid grid-cols-2 gap-2">
                          {groupedPermissions[module].map((perm) => (
                            <div key={perm.id} className="flex items-center gap-2">
                              <Checkbox
                                id={`perm-${perm.id}`}
                                checked={formData.permissions.includes(perm.id)}
                                onCheckedChange={() => togglePermission(perm.id)}
                              />
                              <Label
                                htmlFor={`perm-${perm.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {perm.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateRoleOpen(false);
                setEditingRole(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={editingRole ? handleUpdateRole : handleCreateRole}>
              {editingRole ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
