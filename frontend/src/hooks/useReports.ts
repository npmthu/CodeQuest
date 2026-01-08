import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Hook to generate Business Analytics PDF Report
export function useGenerateBusinessPDF() {
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (period?: string): Promise<void> => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const url = new URL(`${API_BASE}/reports/business/pdf`);
      if (period) {
        url.searchParams.append('period', period);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PDF report');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `business-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    },
    onSuccess: () => {
      toast.success('Business Analytics PDF report generated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate PDF report');
    },
  });
}

// Hook to generate Business Analytics CSV Report
export function useGenerateBusinessCSV() {
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (period?: string): Promise<void> => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const url = new URL(`${API_BASE}/reports/business/csv`);
      if (period) {
        url.searchParams.append('period', period);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate CSV report');
      }

      // Get the CSV blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `business-analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    },
    onSuccess: () => {
      toast.success('Business Analytics CSV report generated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate CSV report');
    },
  });
}

// Hook to generate Instructor Analytics PDF Report
export function useGenerateInstructorPDF() {
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (period?: string): Promise<void> => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const url = new URL(`${API_BASE}/reports/instructor/pdf`);
      if (period) {
        url.searchParams.append('period', period);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate PDF report');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `instructor-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    },
    onSuccess: () => {
      toast.success('Instructor Analytics PDF report generated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate PDF report');
    },
  });
}

// Hook to generate Instructor Analytics CSV Report
export function useGenerateInstructorCSV() {
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (period?: string): Promise<void> => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const url = new URL(`${API_BASE}/reports/instructor/csv`);
      if (period) {
        url.searchParams.append('period', period);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate CSV report');
      }

      // Get the CSV blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `instructor-analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    },
    onSuccess: () => {
      toast.success('Instructor Analytics CSV report generated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate CSV report');
    },
  });
}
