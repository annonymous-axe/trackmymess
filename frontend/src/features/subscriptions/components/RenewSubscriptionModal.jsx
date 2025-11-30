/**
 * RenewSubscriptionModal Component  
 * Modal for renewing/upgrading subscription with Razorpay payment
 */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../constants/plans';
import { createRazorpayOrder } from '../api/subscriptionsApi';
import { toast } from 'sonner';

export function RenewSubscriptionModal({ isOpen, onOpenChange, tenantId, selectedPlan: initialPlan, onRenewSuccess }) {
    const [selectedPlan, setSelectedPlan] = useState(initialPlan || SUBSCRIPTION_PLANS[0].value);
    const [renewMonths, setRenewMonths] = useState(1);
    const [processing, setProcessing] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tenantId) {
            toast.error('Tenant information not available');
            return;
        }

        const planObj = SUBSCRIPTION_PLANS.find(p => p.value === selectedPlan);
        if (!planObj) {
            toast.error('Invalid plan selected');
            return;
        }

        const amount = planObj.price * Math.max(1, renewMonths);
        setProcessing(true);

        try {
            const orderRes = await createRazorpayOrder({ amount, customer_id: '' });
            const { order_id, key_id } = orderRes;

            await loadRazorpayScript();

            const options = {
                key: key_id,
                amount: amount * 100,
                currency: 'INR',
                name: 'TrackMyMess',
                description: `${planObj.label} Plan - ${renewMonths} month(s)`,
                order_id: order_id,
                handler: async function (response) {
                    await onRenewSuccess({
                        subscription_plan: selectedPlan,
                        months: renewMonths,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id
                    });
                },
                prefill: {},
                notes: { tenant_id: tenantId },
                theme: { color: '#3b82f6' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.detail || err.message || 'Failed to start payment');
        } finally {
            setProcessing(false);
        }
    };

    const totalAmount = (SUBSCRIPTION_PLANS.find(p => p.value === selectedPlan)?.price || 0) * renewMonths;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Renew or Upgrade Subscription</DialogTitle>
                    <DialogDescription>
                        Select a plan and duration to proceed with payment
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="plan_select">Select Plan *</Label>
                        <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                            <SelectTrigger className="h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SUBSCRIPTION_PLANS.map(plan => {
                                    const PlanIcon = plan.icon;
                                    return (
                                        <SelectItem key={plan.value} value={plan.value}>
                                            <div className="flex items-center gap-2">
                                                <PlanIcon className="w-4 h-4" />
                                                <span>{plan.label} - ₹{plan.price}/month</span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="months_select">Duration (Months) *</Label>
                        <Input
                            id="months_select"
                            type="number"
                            min="1"
                            max="12"
                            value={renewMonths}
                            onChange={(e) => setRenewMonths(parseInt(e.target.value || '1'))}
                            className="h-11"
                        />
                        <p className="text-xs text-gray-600">Maximum 12 months at a time</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Plan Price:</span>
                            <span className="font-semibold">₹{SUBSCRIPTION_PLANS.find(p => p.value === selectedPlan)?.price || 0}/month</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-semibold">{renewMonths} month(s)</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold">Total Amount:</span>
                                <span className="text-2xl font-bold text-primary">₹{totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-primary hover:bg-primary-600 text-white h-11 font-semibold text-base"
                    >
                        <CreditCard className="w-5 h-5 mr-2" />
                        {processing ? 'Processing...' : `Pay ₹${totalAmount}`}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
