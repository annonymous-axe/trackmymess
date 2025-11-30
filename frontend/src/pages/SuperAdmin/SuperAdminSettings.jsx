import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { BACKEND_URL } from '@/lib/api/client';

const API = `${BACKEND_URL}/api`;

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/sa/settings/pricing`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API}/sa/settings/pricing`, settings);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="super-admin-settings">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Pricing Settings</h1>
            <p className="text-gray-600 mt-1">Configure pricing tiers and discounts</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-600 text-white" data-testid="save-settings-button">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Base Monthly Pricing */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Base Monthly Pricing (INR)</h3>
            <div className="space-y-4">
              {Object.entries(settings?.base_monthly_inr || {}).map(([capacity, price]) => (
                <div key={capacity} className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{capacity} users</Label>
                  <Input
                    type="number"
                    value={price}
                    data-testid={`price-${capacity}`}
                    onChange={(e) => setSettings({
                      ...settings,
                      base_monthly_inr: {
                        ...settings.base_monthly_inr,
                        [capacity]: parseInt(e.target.value)
                      }
                    })}
                    className="w-32"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tenure Discounts */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenure Discounts</h3>
            <div className="space-y-4">
              {Object.entries(settings?.tenure_discounts || {}).map(([tenure, discount]) => (
                <div key={tenure} className="flex items-center justify-between">
                  <Label className="text-sm font-medium capitalize">{tenure}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={discount}
                    data-testid={`discount-${tenure}`}
                    onChange={(e) => setSettings({
                      ...settings,
                      tenure_discounts: {
                        ...settings.tenure_discounts,
                        [tenure]: parseFloat(e.target.value)
                      }
                    })}
                    className="w-32"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* GST Rate */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">GST Rate</h3>
            <div className="flex items-center space-x-4">
              <Input
                type="number"
                step="0.01"
                value={settings?.gst_rate || 0}
                data-testid="gst-rate-input"
                onChange={(e) => setSettings({ ...settings, gst_rate: parseFloat(e.target.value) })}
                className="w-32"
              />
              <span className="text-sm text-gray-600">({(settings?.gst_rate * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuperAdminSettings;