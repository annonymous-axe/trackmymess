/**
 * Subscription Plan Constants
 * Defines available subscription tiers and their features
 */
import { Zap, Award, Crown } from 'lucide-react';

export const SUBSCRIPTION_PLANS = [
  {
    value: 'BASIC',
    label: 'Basic',
    price: 500,
    icon: Zap,
    features: ['Up to 50 customers', 'Basic reporting', 'Email support'],
    color: 'primary'
  },
  {
    value: 'STANDARD',
    label: 'Standard',
    price: 1000,
    icon: Award,
    features: ['Up to 200 customers', 'Advanced reporting', 'Priority support', 'SMS notifications'],
    color: 'secondary'
  },
  {
    value: 'PREMIUM',
    label: 'Premium',
    price: 2000,
    icon: Crown,
    features: ['Unlimited customers', 'Premium reporting', '24/7 support', 'All integrations', 'Custom features'],
    color: 'warning'
  },
];
