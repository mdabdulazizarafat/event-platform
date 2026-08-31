'use client';

import React, { useState, useEffect } from 'react';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import { ArrowLeft, Save, Shield, Settings, Server, Mail, LogIn, UserPlus, Briefcase, Ticket } from 'lucide-react';
import { Switch, App } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { message } = App.useApp();

  // Non-admins are redirected to their personal account page
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      router.replace('/dashboard/account');
    }
  }, [user, router]);

  const [platformName, setPlatformName] = useState('Rong Plan');
  const [supportEmail, setSupportEmail] = useState('support@rongplan.com');
  const [platformFee, setPlatformFee] = useState('5');
  
  // Toggles state
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [signInEnabled, setSignInEnabled] = useState(true);
  const [signUpEnabled, setSignUpEnabled] = useState(true);
  const [orgAppEnabled, setOrgAppEnabled] = useState(true);
  const [partRegEnabled, setPartRegEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/v1/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.general) {
            setPlatformName(data.general.platformName || 'Rong Plan');
            setSupportEmail(data.general.supportEmail || 'support@rongplan.com');
            setPlatformFee(data.general.platformFee || '5');
          }
          if (data.features) {
            setEmailEnabled(data.features.email ?? true);
            setSignInEnabled(data.features.signIn ?? true);
            setSignUpEnabled(data.features.signUp ?? true);
            setOrgAppEnabled(data.features.organizerApplication ?? true);
            setPartRegEnabled(data.features.participantRegistration ?? true);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      loadSettings();
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          general: {
            platformName,
            supportEmail,
            platformFee
          },
          features: {
            email: emailEnabled,
            signIn: signInEnabled,
            signUp: signUpEnabled,
            organizerApplication: orgAppEnabled,
            participantRegistration: partRegEnabled
          }
        })
      });
      
      if (res.ok) {
        message.success('Global platform configurations saved successfully.');
      } else {
        const data = await res.json();
        message.error(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      message.error('An error occurred while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Platform Configurations"
        description="Configure system fees, platform details, and global parameters."
        action={
          <Settings className="w-12 h-12 text-primary opacity-20 hidden sm:block" />
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column - General Info */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-3 mb-4">
              <Server className="text-primary w-5 h-5" />
              <h3 className="font-heading text-lg font-bold m-0 text-foreground">General Settings</h3>
            </div>
            
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
          </div>

          {/* Right Column - Service Toggles */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-3 mb-4">
              <Shield className="text-primary w-5 h-5" />
              <h3 className="font-heading text-lg font-bold m-0 text-foreground">Service Controls</h3>
            </div>
            
            <p className="text-xs text-on-surface-variant mb-4">
              Toggle essential platform services on or off globally.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-outline-variant/40 rounded-xl bg-surface-container-low/20">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground m-0">Email Delivery</h4>
                    <p className="text-[10px] text-on-surface-variant m-0">Enable outbound emails.</p>
                  </div>
                </div>
                <Switch checked={emailEnabled} onChange={setEmailEnabled} />
              </div>

              <div className="flex items-center justify-between p-3 border border-outline-variant/40 rounded-xl bg-surface-container-low/20">
                <div className="flex items-center gap-3">
                  <LogIn className="w-4 h-4 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground m-0">Sign In</h4>
                    <p className="text-[10px] text-on-surface-variant m-0">Allow users to log into accounts.</p>
                  </div>
                </div>
                <Switch checked={signInEnabled} onChange={setSignInEnabled} />
              </div>

              <div className="flex items-center justify-between p-3 border border-outline-variant/40 rounded-xl bg-surface-container-low/20">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-4 h-4 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground m-0">Sign Up</h4>
                    <p className="text-[10px] text-on-surface-variant m-0">Allow new account registration.</p>
                  </div>
                </div>
                <Switch checked={signUpEnabled} onChange={setSignUpEnabled} />
              </div>

              <div className="flex items-center justify-between p-3 border border-outline-variant/40 rounded-xl bg-surface-container-low/20">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground m-0">Organizer Application</h4>
                    <p className="text-[10px] text-on-surface-variant m-0">Allow users to apply to organize events.</p>
                  </div>
                </div>
                <Switch checked={orgAppEnabled} onChange={setOrgAppEnabled} />
              </div>

              <div className="flex items-center justify-between p-3 border border-outline-variant/40 rounded-xl bg-surface-container-low/20">
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4 text-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground m-0">Participant Registration</h4>
                    <p className="text-[10px] text-on-surface-variant m-0">Allow purchasing/registering for events.</p>
                  </div>
                </div>
                <Switch checked={partRegEnabled} onChange={setPartRegEnabled} />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end pt-4 border-t border-outline-variant/60">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              icon={<Save className="w-4 h-4" />}
            >
              Save All Configurations
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
