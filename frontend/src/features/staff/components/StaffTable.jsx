/**
 * StaffTable Component
 * Desktop table view for staff
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export function StaffTable({ staff, onEdit, onDelete, onRecordPayment, isDeleting }) {
    return (
        <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-semibold text-gray-700">Name</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Mobile</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Role</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Salary</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Joining Date</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map((member) => (
                        <tr
                            key={member.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            <td className="p-3">
                                <p className="font-medium text-gray-900">{member.full_name}</p>
                                <p className="text-xs text-gray-600">{member.email || 'No email'}</p>
                            </td>
                            <td className="p-3 text-gray-700">{member.mobile}</td>
                            <td className="p-3">
                                <Badge variant="outline" className="border-gray-300">
                                    {member.role.replace('_', ' ')}
                                </Badge>
                            </td>
                            <td className="p-3 font-medium text-success-600">₹{member.salary}</td>
                            <td className="p-3 text-gray-700">
                                {member.joining_date ? format(new Date(member.joining_date), 'dd MMM yyyy') : '-'}
                            </td>
                            <td className="p-3">
                                <Badge
                                    className={member.is_active
                                        ? 'bg-success-100 text-success-800 border-success-200'
                                        : 'bg-gray-100 text-gray-800 border-gray-200'
                                    }
                                >
                                    {member.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </td>
                            <td className="p-3">
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onEdit(member)}
                                        className="p-2 h-auto hover:bg-gray-100"
                                        title="Edit staff"
                                    >
                                        <Edit className="w-4 h-4 text-gray-600" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onRecordPayment(member)}
                                        className="p-2 h-auto hover:bg-success-50"
                                        title="Record payment"
                                    >
                                        <DollarSign className="w-4 h-4 text-success-600" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => onDelete(member)}
                                        className="p-2 h-auto hover:bg-danger-50"
                                        title="Delete staff"
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="w-4 h-4 text-danger-600" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
