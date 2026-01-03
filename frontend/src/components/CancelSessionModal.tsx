import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface CancelSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
  onSuccess: () => void;
}

export default function CancelSessionModal({
  isOpen,
  onClose,
  sessionId,
  sessionTitle,
  onSuccess
}: CancelSessionModalProps) {
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCancel = async () => {
    if (cancelReason.trim().length < 10) {
      toast.error('Cancel reason must be at least 10 characters');
      return;
    }

    if (cancelReason.trim().length > 500) {
      toast.error('Cancel reason must be less than 500 characters');
      return;
    }

    try {
      setLoading(true);
      const { supabase } = await import('../../lib/supabaseClient');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Session expired. Please login again.');
      }
      
      const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/mock-interviews/sessions/${sessionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cancel_reason: cancelReason.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel session');
      }

      toast.success('Session cancelled successfully. Refunds have been processed.');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error cancelling session:', error);
      toast.error(error.message || 'Failed to cancel session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Cancel Interview Session</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            You are about to cancel: <strong>{sessionTitle}</strong>
          </p>
          <p className="text-sm text-red-600 mb-4">
            ⚠️ All learners with active bookings will be refunded automatically.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Reason for Cancellation <span className="text-red-500">*</span>
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancelling this session (minimum 10 characters)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            maxLength={500}
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {cancelReason.length < 10 
                ? `Need ${10 - cancelReason.length} more characters`
                : 'Valid reason length'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              {cancelReason.length}/500
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            Keep Session
          </Button>
          <Button
            onClick={handleCancel}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={loading || cancelReason.trim().length < 10}
          >
            {loading ? 'Cancelling...' : 'Cancel Session'}
          </Button>
        </div>
      </div>
    </div>
  );
}
