import { useState } from 'react';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function DataDeletion() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke(
        'handle-deletion',
        {
          body: JSON.stringify({ email, reason }),
        },
      );
      
      if (error) throw error;

      toast({ 
        title: "Request Submitted",
        description: "We'll process your data deletion request within 30 days.",
      });

      setEmail('');
      setReason('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit deletion request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold mb-6">Data Deletion Request</h1>
            
            <div className="prose prose-slate max-w-none mb-8">
              <h2 className="text-2xl font-semibold mb-4">Your Data Privacy Rights</h2>
              <p className="mb-4">
                You have the right to request deletion of your personal data. Here are your options:
              </p>
              
              <h3 className="text-xl font-semibold mb-3">Option 1: Self-Service Account Deletion</h3>
              <ol className="list-decimal list-inside mb-6">
                <li className="mb-2">Sign in to your account</li>
                <li className="mb-2">Go to Profile Settings</li>
                <li className="mb-2">Click on "Delete Account"</li>
                <li className="mb-2">Confirm deletion</li>
              </ol>
              <p className="mb-6">
                This will permanently delete your account and all associated data within 30 days.
              </p>

              <h3 className="text-xl font-semibold mb-3">Option 2: Submit a Deletion Request</h3>
              <p className="mb-4">
                If you cannot access your account or prefer to submit a manual request, please use the form below:
              </p>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please let us know why you're requesting data deletion"
                  className="min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FEC6A1] text-accent hover:bg-[#FDE1D3]"
              >
                {loading ? "Submitting..." : "Submit Deletion Request"}
              </Button>
            </form>

            <div className="mt-8 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-semibold mb-2">What happens next?</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>We'll verify your request within 7 days</li>
                <li>Data deletion will be completed within 30 days</li>
                <li>You'll receive email confirmation once completed</li>
                <li>Backup data may take up to 90 days to be fully removed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}