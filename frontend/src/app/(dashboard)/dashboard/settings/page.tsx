'use client';

import React, { useState, useEffect } from 'react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Non-admins are redirected to their personal account page
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      router.replace('/dashboard/account');
    }
  }, [user, router]);

  const [platformName, setPlatformName] = useState('Rong Plan');
  const [supportEmail, setSupportEmail] = useState('support@rongplan.com');
  const [platformFee, setPlatformFee] = useState('5');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Global platform configurations saved.');
    }, 1000);
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <section className="flex items-center gap-3 border-b border-outline-variant/60 pb-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div>
          <h2 className="font-heading text-2xl font-extrabold text-foreground leading-tight m-0">
            Global Platform Configurations
          </h2>
          <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
            Configure system fees, platform details, and global parameters.
          </p>
        </div>
      </section>

      <form onSubmit={handleSave} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-4 shadow-xs">
        <FormField
          label="Platform Brand Name"
          value={platformName}
          onChange={(e) => setPlatformName(e.target.value)}
          required
        />

        <FormField
          label="Global Support Email"
          type="email"
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          required
        />

        <FormField
          label="Platform Processing Fee (%)"
          type="number"
          value={platformFee}
          onChange={(e) => setPlatformFee(e.target.value)}
          required
        />

        <div className="flex justify-end pt-4 border-t border-outline-variant/60">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={<Save className="w-4 h-4" />}
          >
            Save configurations
          </Button>
        </div>
      </form>
    </div>
  );
}
