/**
 * InvoicesToolbar Component
 * Toolbar with Generate Monthly Invoices action and customer filter
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

export function InvoicesToolbar({ onGenerateInvoices, isGenerating, customers = [], selectedCustomerId, onCustomerChange }) {
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const [invoiceMonth, setInvoiceMonth] = useState(new Date().getMonth() + 1);
    const [invoiceYear, setInvoiceYear] = useState(new Date().getFullYear());
    const [generateForCustomerId, setGenerateForCustomerId] = useState(''); // '' means all customers

    const handleGenerate = () => {
        onGenerateInvoices({
            month: invoiceMonth,
            year: invoiceYear,
            customer_id: generateForCustomerId || undefined // Send customer_id if specific customer selected
        });
        setShowGenerateDialog(false);
        setGenerateForCustomerId(''); // Reset after generation
    };

    const getMonthName = (monthNum) => {
        const date = new Date();
        date.setMonth(monthNum - 1);
        return date.toLocaleString('en-US', { month: 'long' });
    };

    const handleClearFilter = () => {
        onCustomerChange('');
    };

    const selectedCustomerName = generateForCustomerId
        ? customers.find(c => c.id === generateForCustomerId)?.full_name
        : 'All Customers';

    return (
        <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
                <h2 className="text-xl font-semibold text-gray-700">Invoice History</h2>

                {/* Customer Filter for Invoice List */}
                <div className="flex items-center gap-2">
                    <Select value={selectedCustomerId} onValueChange={onCustomerChange}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Filter by customer..." />
                        </SelectTrigger>
                        <SelectContent>
                            {customers.filter(c => c.is_active).map(customer => (
                                <SelectItem key={customer.id} value={customer.id}>
                                    {customer.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedCustomerId && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilter}
                            className="h-10 px-3"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            <Button
                className="bg-primary hover:bg-primary-600 text-white h-11"
                onClick={() => setShowGenerateDialog(true)}
                disabled={isGenerating}
            >
                <Plus className="w-5 h-5 mr-2" />
                Generate Monthly Invoices
            </Button>

            {/* Generate Invoices Dialog */}
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Generate Monthly Invoices</DialogTitle>
                        <DialogDescription>
                            Generate invoices for all or specific customer for a month
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="invoice_month">Month</Label>
                                <Input
                                    id="invoice_month"
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={invoiceMonth}
                                    onChange={(e) => setInvoiceMonth(parseInt(e.target.value))}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice_year">Year</Label>
                                <Input
                                    id="invoice_year"
                                    type="number"
                                    min="2020"
                                    max="2100"
                                    value={invoiceYear}
                                    onChange={(e) => setInvoiceYear(parseInt(e.target.value))}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {/* Customer Selection for Generation */}
                        <div className="space-y-2">
                            <Label htmlFor="generate_customer">Customer</Label>
                            <Select value={generateForCustomerId} onValueChange={setGenerateForCustomerId}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="All Customers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Customers</SelectItem>
                                    {customers.filter(c => c.is_active).map(customer => (
                                        <SelectItem key={customer.id} value={customer.id}>
                                            {customer.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">
                                Generating invoices for: <strong className="text-gray-900">{getMonthName(invoiceMonth)} {invoiceYear}</strong>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                For: <strong className="text-gray-700">{selectedCustomerName}</strong>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowGenerateDialog(false)}
                                disabled={isGenerating}
                                className="flex-1 h-11"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="flex-1 bg-primary hover:bg-primary-600 text-white h-11"
                            >
                                {isGenerating ? 'Generating...' : `Generate for ${selectedCustomerName}`}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
