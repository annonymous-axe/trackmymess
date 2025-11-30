/**
 * PricingBreakdown Component
 * Displays quote breakdown
 */
import React from 'react';

export function PricingBreakdown({ quote, isCalculating }) {
    if (isCalculating || !quote) return null;

    return (
        <div className="bg-gray-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{quote.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-medium">₹{quote.tax.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">₹{quote.total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">For {quote.months} month(s)</p>
        </div>
    );
}
