import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, TrendingUp, Search, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Principal } from '@icp-sdk/core/principal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PremiumButton } from '../components/PremiumButton';
import DiscountPanel from '../components/DiscountPanel';
import RestrictionsPanel from '../components/RestrictionsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  useGetPlatformAnalytics,
  useGetAllUsersWithStats,
  useGetAllProducts,
  useGetAllOrders,
  useSetUserRole,
  useSetSuspendedProfile,
  useDeleteUserAccount,
  useGetUserStats,
  useModerateProduct,
  useBulkUpdateProductAvailability,
  useDeleteProduct,
  useUpdateOrderStatus,
  useGetRecentActivity,
} from '../hooks/useQueries';
import { formatPrice } from '@/lib/helpers';
import { SeedGrowthLoader } from '../components/AnimatedComponents';
import { UserRole, ProductCategory, OrderStatus, UserProfile, Product, Order } from '../backend';

interface AdminDashboardProps {
  navigate: (page: any, params?: any) => void;
}

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: analytics, isLoading: analyticsLoading } = useGetPlatformAnalytics();
  const { data: recentActivity } = useGetRecentActivity();

  if (analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SeedGrowthLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header navigate={navigate} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display font-bold mb-8">{t('admin.title')}</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">{t('admin.dashboard')}</TabsTrigger>
            <TabsTrigger value="users">{t('admin.users')}</TabsTrigger>
            <TabsTrigger value="products">{t('admin.products')}</TabsTrigger>
            <TabsTrigger value="orders">{t('admin.manageOrders')}</TabsTrigger>
            <TabsTrigger value="discounts">{t('admin.discounts')}</TabsTrigger>
            <TabsTrigger value="restrictions">{t('admin.restrictions')}</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTab analytics={analytics} recentActivity={recentActivity} />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>

          {/* Discounts Tab */}
          <TabsContent value="discounts">
            <DiscountPanel />
          </TabsContent>

          {/* Restrictions Tab */}
          <TabsContent value="restrictions">
            <RestrictionsPanel />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}

// ===== Dashboard Tab =====
function DashboardTab({ analytics, recentActivity }: any) {
  const { t } = useTranslation();

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label={t('admin.totalUsers')}
          value={analytics?.totalUsers.toString() || '0'}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Users}
          label={t('admin.farmers')}
          value={analytics?.totalFarmers.toString() || '0'}
          color="bg-success/10 text-success"
        />
        <StatCard
          icon={Package}
          label={t('admin.totalProducts')}
          value={analytics?.totalProducts.toString() || '0'}
          color="bg-accent/10 text-accent"
        />
        <StatCard
          icon={ShoppingCart}
          label={t('admin.totalOrders')}
          value={analytics?.totalOrders.toString() || '0'}
          color="bg-secondary/10 text-secondary"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('admin.suspendedUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.totalSuspendedUsers.toString() || '0'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('admin.homeBuyers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.totalHomeBuyers.toString() || '0'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('admin.businessBuyers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics?.totalBusinessBuyers.toString() || '0'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Card */}
      <Card className="bg-gradient-to-br from-primary/20 to-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            {t('admin.totalRevenue')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold text-primary">
            {formatPrice(analytics?.totalRevenue || 0)}
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentActivity && (
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.recentProducts?.slice(0, 5).map((product: Product) => (
              <div key={product.id.toString()} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('common.rupees')}{product.price}
                  </p>
                </div>
                <Badge variant={product.available ? 'default' : 'secondary'}>
                  {product.available ? t('admin.active') : t('admin.inactive')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===== Users Tab =====
function UsersTab() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>(UserRole.homeBuyer);

  const { data: usersWithStats = [], isLoading } = useGetAllUsersWithStats();
  const setUserRoleMutation = useSetUserRole();
  const setSuspendedMutation = useSetSuspendedProfile();
  const deleteUserMutation = useDeleteUserAccount();

  const filteredUsers = useMemo(() => {
    return usersWithStats.filter((userWithStats: any) => {
      const profile = userWithStats.profile;
      const matchesSearch =
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || profile.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [usersWithStats, searchQuery, roleFilter]);

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    try {
      await setUserRoleMutation.mutateAsync({
        userPrincipal: Principal.fromText(selectedUser.principal),
        role: newRole,
      });
      toast.success(t('messages.success.statusUpdated'));
      setRoleDialogOpen(false);
    } catch (error) {
      toast.error(t('messages.error.submitFailed'));
    }
  };

  const handleSuspendToggle = async () => {
    if (!selectedUser) return;
    try {
      await setSuspendedMutation.mutateAsync({
        userPrincipal: Principal.fromText(selectedUser.principal),
        suspended: !selectedUser.profile.suspended,
      });
      toast.success(t('messages.success.statusUpdated'));
      setSuspendDialogOpen(false);
    } catch (error) {
      toast.error(t('messages.error.submitFailed'));
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUserMutation.mutateAsync(Principal.fromText(selectedUser.principal));
      toast.success(t('messages.success.productDeleted'));
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(t('messages.error.submitFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SeedGrowthLoader />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.searchUsers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allRoles')}</SelectItem>
            <SelectItem value={UserRole.farmer}>{t('profileSetup.farmer')}</SelectItem>
            <SelectItem value={UserRole.homeBuyer}>{t('profileSetup.homeBuyer')}</SelectItem>
            <SelectItem value={UserRole.businessBuyer}>{t('profileSetup.businessBuyer')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('profile.name')}</TableHead>
              <TableHead>{t('admin.role')}</TableHead>
              <TableHead>{t('admin.contact')}</TableHead>
              <TableHead>{t('profile.location')}</TableHead>
              <TableHead>{t('orders.status')}</TableHead>
              <TableHead className="text-right">{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  {t('admin.noUsers')}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((userWithStats: any) => {
                const profile = userWithStats.profile;
                const stats = userWithStats.stats;
                const principal = Object.keys(usersWithStats).find(
                  (key: any) => (usersWithStats as any)[key] === userWithStats
                );

                return (
                  <TableRow key={principal}>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{profile.role}</Badge>
                    </TableCell>
                    <TableCell>{profile.contact}</TableCell>
                    <TableCell>{profile.location}</TableCell>
                    <TableCell>
                      <Badge variant={profile.suspended ? 'destructive' : 'default'}>
                        {profile.suspended ? t('admin.suspended') : t('admin.active')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PremiumButton
                          variant="scale"
                          onClick={() => {
                            setSelectedUser({ profile, stats, principal });
                            setStatsDialogOpen(true);
                          }}
                          className="h-8 px-3 text-xs"
                        >
                          {t('admin.viewStats')}
                        </PremiumButton>
                        <PremiumButton
                          variant="glow"
                          onClick={() => {
                            setSelectedUser({ profile, stats, principal });
                            setNewRole(profile.role);
                            setRoleDialogOpen(true);
                          }}
                          className="h-8 px-3 text-xs"
                        >
                          {t('admin.editRole')}
                        </PremiumButton>
                        <PremiumButton
                          variant="pulse"
                          onClick={() => {
                            setSelectedUser({ profile, stats, principal });
                            setSuspendDialogOpen(true);
                          }}
                          className="h-8 px-3 text-xs"
                        >
                          {profile.suspended ? t('admin.activate') : t('admin.suspend')}
                        </PremiumButton>
                        <PremiumButton
                          variant="ripple"
                          onClick={() => {
                            setSelectedUser({ profile, stats, principal });
                            setDeleteDialogOpen(true);
                          }}
                          className="h-8 px-3 text-xs bg-destructive hover:bg-destructive/90"
                        >
                          {t('admin.delete')}
                        </PremiumButton>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* User Stats Dialog */}
      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.userStats')}</DialogTitle>
            <DialogDescription>{selectedUser?.profile.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('admin.productsListed')}:</span>
              <span className="font-bold text-xl">{selectedUser?.stats.productsListed.toString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('admin.ordersMade')}:</span>
              <span className="font-bold text-xl">{selectedUser?.stats.ordersMade.toString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('admin.ordersReceived')}:</span>
              <span className="font-bold text-xl">{selectedUser?.stats.ordersReceived.toString()}</span>
            </div>
          </div>
          <DialogFooter>
            <PremiumButton variant="scale" onClick={() => setStatsDialogOpen(false)}>
              {t('common.close')}
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Update Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.updateRole')}</DialogTitle>
            <DialogDescription>{selectedUser?.profile.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={newRole}
              onValueChange={(value) => setNewRole(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.farmer}>{t('profileSetup.farmer')}</SelectItem>
                <SelectItem value={UserRole.homeBuyer}>{t('profileSetup.homeBuyer')}</SelectItem>
                <SelectItem value={UserRole.businessBuyer}>{t('profileSetup.businessBuyer')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <PremiumButton
              variant="scale"
              onClick={() => setRoleDialogOpen(false)}
              className="bg-secondary hover:bg-secondary/90"
            >
              {t('profile.cancel')}
            </PremiumButton>
            <PremiumButton
              variant="glow"
              onClick={handleRoleUpdate}
              isLoading={setUserRoleMutation.isPending}
            >
              {t('admin.updateRole')}
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend/Activate Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.profile.suspended ? t('admin.confirmActivate') : t('admin.confirmSuspend')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.profile.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('profile.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspendToggle}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.profile.name} - {t('admin.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('profile.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {t('admin.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ===== Products Tab =====
function ProductsTab() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<Set<bigint>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [moderateDialogOpen, setModerateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moderationNote, setModerationNote] = useState('');

  const { data: products = [], isLoading } = useGetAllProducts();
  const moderateProductMutation = useModerateProduct();
  const bulkUpdateMutation = useBulkUpdateProductAvailability();
  const deleteProductMutation = useDeleteProduct();

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && product.available) ||
        (availabilityFilter === 'unavailable' && !product.available);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [products, searchQuery, categoryFilter, availabilityFilter]);

  const handleToggleSelect = (productId: bigint) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p: Product) => p.id)));
    }
  };

  const handleBulkUpdate = async (available: boolean) => {
    if (selectedProducts.size === 0) return;
    try {
      await bulkUpdateMutation.mutateAsync({
        productIds: Array.from(selectedProducts),
        available,
      });
      toast.success(t('messages.success.statusUpdated'));
      setSelectedProducts(new Set());
    } catch (error) {
      toast.error(t('messages.error.submitFailed'));
    }
  };

  const handleModerate = async () => {
    if (!selectedProduct) return;
    try {
      await moderateProductMutation.mutateAsync({
        productId: selectedProduct.id,
        available: !selectedProduct.available,
        moderationNote: moderationNote || null,
      });
      toast.success(t('messages.success.statusUpdated'));
      setModerateDialogOpen(false);
      setModerationNote('');
    } catch (error) {
      toast.error(t('messages.error.submitFailed'));
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      toast.success(t('messages.success.productDeleted'));
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error(t('messages.error.submitFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SeedGrowthLoader />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.searchProducts')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allCategories')}</SelectItem>
            <SelectItem value={ProductCategory.fruits}>{t('categories.fruits')}</SelectItem>
            <SelectItem value={ProductCategory.vegetables}>{t('categories.vegetables')}</SelectItem>
            <SelectItem value={ProductCategory.grains}>{t('categories.grains')}</SelectItem>
            <SelectItem value={ProductCategory.dairy}>{t('categories.dairy')}</SelectItem>
            <SelectItem value={ProductCategory.organicFood}>{t('categories.organicFood')}</SelectItem>
            <SelectItem value={ProductCategory.others}>{t('categories.others')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
            <SelectItem value="available">{t('product.available')}</SelectItem>
            <SelectItem value="unavailable">{t('product.outOfStock')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <Card className="bg-accent/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedProducts.size} {t('admin.selected')}
              </span>
              <div className="flex gap-2">
                <PremiumButton
                  variant="scale"
                  onClick={() => handleBulkUpdate(true)}
                  className="h-8 px-3 text-xs"
                  isLoading={bulkUpdateMutation.isPending}
                >
                  {t('admin.activate')}
                </PremiumButton>
                <PremiumButton
                  variant="scale"
                  onClick={() => handleBulkUpdate(false)}
                  className="h-8 px-3 text-xs"
                  isLoading={bulkUpdateMutation.isPending}
                >
                  {t('admin.inactive')}
                </PremiumButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>{t('listing.productName')}</TableHead>
              <TableHead>{t('product.category')}</TableHead>
              <TableHead>{t('listing.price')}</TableHead>
              <TableHead>{t('product.quantity')}</TableHead>
              <TableHead>{t('orders.status')}</TableHead>
              <TableHead className="text-right">{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  {t('admin.noProducts')}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product: Product) => (
                <TableRow key={product.id.toString()}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => handleToggleSelect(product.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    {product.quantity.toString()} {product.unit}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.available ? 'default' : 'secondary'}>
                      {product.available ? t('product.available') : t('product.outOfStock')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PremiumButton
                        variant="glow"
                        onClick={() => {
                          setSelectedProduct(product);
                          setModerationNote(product.moderationNote || '');
                          setModerateDialogOpen(true);
                        }}
                        className="h-8 px-3 text-xs"
                      >
                        {t('admin.toggleAvailability')}
                      </PremiumButton>
                      <PremiumButton
                        variant="ripple"
                        onClick={() => {
                          setSelectedProduct(product);
                          setDeleteDialogOpen(true);
                        }}
                        className="h-8 px-3 text-xs bg-destructive hover:bg-destructive/90"
                      >
                        {t('admin.delete')}
                      </PremiumButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Moderate Product Dialog */}
      <Dialog open={moderateDialogOpen} onOpenChange={setModerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.toggleAvailability')}</DialogTitle>
            <DialogDescription>{selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('admin.moderationNote')}</label>
              <Textarea
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                placeholder={t('admin.addNote')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <PremiumButton
              variant="scale"
              onClick={() => setModerateDialogOpen(false)}
              className="bg-secondary hover:bg-secondary/90"
            >
              {t('profile.cancel')}
            </PremiumButton>
            <PremiumButton
              variant="glow"
              onClick={handleModerate}
              isLoading={moderateProductMutation.isPending}
            >
              {selectedProduct?.available ? t('admin.inactive') : t('admin.activate')}
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProduct?.name} - {t('admin.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('profile.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {t('admin.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ===== Orders Tab =====
function OrdersTab() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.pending);

  const { data: orders = [], isLoading } = useGetAllOrders();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      const matchesSearch = order.id.toString().includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId: selectedOrder.id,
        status: newStatus,
      });
      toast.success(t('messages.success.statusUpdated'));
      setUpdateStatusDialogOpen(false);
    } catch (error) {
      toast.error(t('messages.error.submitFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SeedGrowthLoader />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('admin.searchOrders')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
            <SelectItem value={OrderStatus.pending}>{t('orders.pending')}</SelectItem>
            <SelectItem value={OrderStatus.accepted}>{t('orders.processing')}</SelectItem>
            <SelectItem value={OrderStatus.fulfilled}>{t('orders.completed')}</SelectItem>
            <SelectItem value={OrderStatus.delivered}>{t('orders.completed')}</SelectItem>
            <SelectItem value={OrderStatus.cancelled}>{t('orders.cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('orders.orderId')}</TableHead>
              <TableHead>{t('orders.buyer')}</TableHead>
              <TableHead>{t('orders.seller')}</TableHead>
              <TableHead>{t('orders.amount')}</TableHead>
              <TableHead>{t('orders.items')}</TableHead>
              <TableHead>{t('orders.status')}</TableHead>
              <TableHead className="text-right">{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  {t('admin.noOrders')}
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order: Order) => (
                <TableRow key={order.id.toString()}>
                  <TableCell className="font-medium">#{order.id.toString()}</TableCell>
                  <TableCell className="text-xs">{order.buyer.toString().slice(0, 10)}...</TableCell>
                  <TableCell className="text-xs">{order.farmer.toString().slice(0, 10)}...</TableCell>
                  <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === OrderStatus.delivered
                          ? 'default'
                          : order.status === OrderStatus.cancelled
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PremiumButton
                        variant="scale"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDetailsDialogOpen(true);
                        }}
                        className="h-8 px-3 text-xs"
                      >
                        {t('orders.viewDetails')}
                      </PremiumButton>
                      <PremiumButton
                        variant="glow"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setUpdateStatusDialogOpen(true);
                        }}
                        className="h-8 px-3 text-xs"
                      >
                        {t('orders.updateStatus')}
                      </PremiumButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('admin.orderDetails')}</DialogTitle>
            <DialogDescription>Order #{selectedOrder?.id.toString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('orders.buyer')}</p>
                <p className="font-mono text-xs">{selectedOrder?.buyer.toString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('orders.seller')}</p>
                <p className="font-mono text-xs">{selectedOrder?.farmer.toString()}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t('orders.items')}</p>
              <div className="space-y-2">
                {selectedOrder?.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-accent/10 rounded">
                    <span>
                      Product ID: {item.productId.toString()} x {item.quantity.toString()}
                    </span>
                    <span className="font-medium">{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="font-bold">{t('cart.total')}</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(selectedOrder?.totalAmount || 0)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <PremiumButton variant="scale" onClick={() => setDetailsDialogOpen(false)}>
              {t('common.close')}
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateStatusDialogOpen} onOpenChange={setUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.updateOrderStatus')}</DialogTitle>
            <DialogDescription>Order #{selectedOrder?.id.toString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrderStatus.pending}>{t('orders.pending')}</SelectItem>
                <SelectItem value={OrderStatus.accepted}>{t('orders.processing')}</SelectItem>
                <SelectItem value={OrderStatus.fulfilled}>{t('orders.completed')}</SelectItem>
                <SelectItem value={OrderStatus.delivered}>{t('orders.completed')}</SelectItem>
                <SelectItem value={OrderStatus.cancelled}>{t('orders.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <PremiumButton
              variant="scale"
              onClick={() => setUpdateStatusDialogOpen(false)}
              className="bg-secondary hover:bg-secondary/90"
            >
              {t('profile.cancel')}
            </PremiumButton>
            <PremiumButton
              variant="glow"
              onClick={handleUpdateStatus}
              isLoading={updateOrderStatusMutation.isPending}
            >
              {t('orders.updateStatus')}
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
