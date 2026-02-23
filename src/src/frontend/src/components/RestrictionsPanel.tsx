import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit, ShieldAlert, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useRestrictions, Restriction } from '../hooks/useRestrictions';
import { ProductCategory } from '../backend';
import { PremiumButton } from './PremiumButton';

export default function RestrictionsPanel() {
  const { t } = useTranslation();
  const { restrictions, createRestriction, updateRestriction, deleteRestriction, getActiveRestrictions } = useRestrictions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRestriction, setEditingRestriction] = useState<Restriction | null>(null);

  const [formData, setFormData] = useState({
    type: 'product' as Restriction['type'],
    targetId: '',
    reason: '',
    active: true,
  });

  const handleOpenDialog = (restriction?: Restriction) => {
    if (restriction) {
      setEditingRestriction(restriction);
      setFormData({
        type: restriction.type,
        targetId: restriction.targetId,
        reason: restriction.reason,
        active: restriction.active,
      });
    } else {
      setEditingRestriction(null);
      setFormData({
        type: 'product',
        targetId: '',
        reason: '',
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.targetId || !formData.reason) {
      toast.error(t('messages.error.required'));
      return;
    }

    const restrictionData: Omit<Restriction, 'id' | 'createdAt'> = {
      type: formData.type,
      targetId: formData.targetId,
      reason: formData.reason,
      active: formData.active,
    };

    if (editingRestriction) {
      updateRestriction(editingRestriction.id, restrictionData);
      toast.success(t('messages.success.statusUpdated'));
    } else {
      createRestriction(restrictionData);
      toast.success('Restriction created successfully');
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteRestriction(id);
    toast.success('Restriction deleted successfully');
  };

  const activeRestrictions = getActiveRestrictions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('restrictions.title')}</h2>
          <p className="text-muted-foreground">Manage product, category, and user restrictions</p>
        </div>
        <PremiumButton variant="glow" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('restrictions.createRestriction')}
        </PremiumButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t('restrictions.activeRestrictions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{activeRestrictions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Restrictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{restrictions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Restriction Types</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{new Set(restrictions.map(r => r.type)).size}</p>
          </CardContent>
        </Card>
      </div>

      {/* Restrictions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('restrictions.restrictionType')}</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>{t('restrictions.restrictionReason')}</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>{t('orders.status')}</TableHead>
              <TableHead className="text-right">{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {restrictions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No restrictions created
                </TableCell>
              </TableRow>
            ) : (
              restrictions.map((restriction) => (
                <TableRow key={restriction.id}>
                  <TableCell>
                    <Badge variant="outline">{restriction.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-[200px] truncate">
                    {restriction.targetId}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="line-clamp-2 text-sm">{restriction.reason}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(restriction.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={restriction.active ? 'destructive' : 'secondary'}>
                      {restriction.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <PremiumButton variant="scale" onClick={() => handleOpenDialog(restriction)} className="h-8 px-3 text-xs">
                        <Edit className="w-3 h-3" />
                      </PremiumButton>
                      <PremiumButton variant="ripple" onClick={() => handleDelete(restriction.id)} className="h-8 px-3 text-xs bg-destructive hover:bg-destructive/90">
                        <Trash2 className="w-3 h-3" />
                      </PremiumButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                {editingRestriction ? 'Edit Restriction' : t('restrictions.createRestriction')}
              </div>
            </DialogTitle>
            <DialogDescription>Configure restriction details and target</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('restrictions.restrictionType')}*</Label>
              <Select value={formData.type} onValueChange={(value: Restriction['type']) => setFormData({ ...formData, type: value, targetId: '' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product (by ID)</SelectItem>
                  <SelectItem value="category">{t('restrictions.categoryBased')}</SelectItem>
                  <SelectItem value="seller">Seller (by Principal)</SelectItem>
                  <SelectItem value="buyer">Buyer (by Principal)</SelectItem>
                  <SelectItem value="region">{t('restrictions.regionBased')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Target {formData.type === 'category' ? 'Category' : formData.type === 'region' ? 'Region' : 'ID'}*
              </Label>
              {formData.type === 'category' ? (
                <Select value={formData.targetId} onValueChange={(value) => setFormData({ ...formData, targetId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProductCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={formData.targetId}
                  onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                  placeholder={
                    formData.type === 'product'
                      ? 'Enter product ID'
                      : formData.type === 'region'
                      ? 'Enter region name'
                      : 'Enter principal ID'
                  }
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('restrictions.restrictionReason')}*</Label>
              <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Explain why this restriction is needed" rows={3} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })} />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('profile.cancel')}
            </Button>
            <PremiumButton variant="glow" onClick={handleSubmit}>
              {editingRestriction ? t('profile.save') : t('restrictions.createRestriction')}
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
