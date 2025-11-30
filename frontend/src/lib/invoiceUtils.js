import axios, { API } from './http';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const downloadInvoice = async (paymentId, paymentDate) => {
  try {
    const response = await axios.get(`${API}/admin/payments/${paymentId}/invoice`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${paymentId}_${format(new Date(paymentDate), 'yyyyMMdd')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Invoice downloaded successfully');
  } catch (error) {
    toast.error('Failed to download invoice');
  }
};