/**
 * StaffCards Component
 * Mobile card view for staff
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export function StaffCards({ staff, onEdit, onDelete, onRecordPayment, isDeleting }) {
    return (
        <div className="md:hidden space-y-3">
            {staff.map((member) => (
                <div
                    key={member.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white space-y-3"
                >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-semibold text-gray-900">{member.full_name}</p>
                            <p className="text-xs text-gray-600">{member.email || 'No email'}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEdit(member)}
                                className="p-2 h-auto hover:bg-gray-100"
                            >
                                <Edit className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onRecordPayment(member)}
                                className="p-2 h-auto hover:bg-success-50"
                            >
                                <DollarSign className="w-4 h-4 text-success-600" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDelete(member)}
                                className="p-2 h-auto hover:bg-danger-50"
                                disabled={isDeleting}
                            >
                                <Trash2 className="w-4 h-4 text-danger-600" />
                            </Button>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-xs font-medium text-gray-600">Mobile</p>
                            <p className="text-gray-900">{member.mobile}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Role</p>
                            <Badge variant="outline" className="border-gray-300 mt-1">
                                {member.role.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Salary</p>
                            <p className="font-medium text-success-600">₹{member.salary}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">Joining Date</p>
                            <p className="text-gray-900">
                                {member.joining_date ? format(new Date(member.joining_date), 'dd MMM yyyy') : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">Status:</span>
                            <Badge
                                className={member.is_active
                                    ? 'bg-success-100 text-success-800 border-success-200'
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                }
                            >
                                {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
