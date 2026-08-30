'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Alert, Modal } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function SignInPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password State
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onLoginFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const success = await login(values.emailOrUsername, values.password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid email/username or password. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotCode = async () => {
    if (!forgotEmail) {
      setForgotError('Please enter your email.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }
      
      if (!res.ok) {
        throw new Error((data && data.error) ? data.error : `Server error: ${res.status}. Please try again later.`);
      }
      
      setForgotSuccess('If your email is registered, a verification code has been sent.');
      setForgotStep(2);
    } catch (err: any) {
      setForgotError(err.message || 'An unexpected error occurred while communicating with the server.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotCode || !newPassword) {
      setForgotError('Please enter both the verification code and your new password.');
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: forgotCode, newPassword }),
      });
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }
      
      if (!res.ok) {
        throw new Error((data && data.error) ? data.error : `Server error: ${res.status}. Please try again later.`);
      }
      
      setForgotSuccess('Password reset successfully. You can now log in.');
      setTimeout(() => {
        setIsForgotModalVisible(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotCode('');
        setNewPassword('');
        setForgotSuccess(null);
      }, 2000);
    } catch (err: any) {
      setForgotError(err.message || 'An unexpected error occurred while communicating with the server.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-background flex flex-col font-sans">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center pt-8 pb-16 px-4">
        <div className="w-full max-w-md text-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Welcome <span className="text-primary">Back</span>
          </h1>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
            Access your Rong Plan account, manage registrations and update your profile.
          </p>
        </div>

        <div className="w-full max-w-md">
          {error && (
            <Alert
              title={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-6 rounded-xl border-red-200 text-xs shadow-sm"
            />
          )}

          <Form
            name="participant_login"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onLoginFinish}
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item
              label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">Email or Username</span>}
              name="emailOrUsername"
              className="mb-0"
              rules={[{ required: true, message: 'Please enter your username or email' }]}
            >
              <Input
                placeholder="hello@email.com or username"
                className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">Password</span>}
              name="password"
              className="mb-0"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                placeholder="••••••••"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white [&>input]:bg-transparent"
              />
            </Form.Item>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={loading}
              className="w-full mt-4"
            >
              SIGN IN
            </Button>

            <div className="mt-4 text-center space-y-3">
              <div>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgotModalVisible(true);
                    setForgotStep(1);
                    setForgotError(null);
                    setForgotSuccess(null);
                  }}
                  className="text-xs text-on-surface-variant hover:text-primary transition-colors"
                >
                  Forgot your password?
                </a>
              </div>
              <div className="text-sm text-on-surface-variant">
                New to Rong Plan? <Link href="/sign-up" className="font-bold text-primary hover:underline">Open account</Link>
              </div>
            </div>
          </Form>
        </div>

        <Modal
          title={<span className="font-bold text-lg text-foreground">Reset Password</span>}
          open={isForgotModalVisible}
          onCancel={() => setIsForgotModalVisible(false)}
          footer={null}
          destroyOnHidden
          className="rounded-xl overflow-hidden"
        >
          <div className="py-4">
            {forgotError && <Alert type="error" title={forgotError} className="mb-4 text-xs rounded-lg" showIcon />}
            {forgotSuccess && <Alert type="success" title={forgotSuccess} className="mb-4 text-xs rounded-lg" showIcon />}
            
            {forgotStep === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant">Enter your email address and we'll send you a 6-digit verification code to reset your password.</p>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Email Address</label>
                  <Input 
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)} 
                    placeholder="hello@email.com"
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button 
                  variant="primary" 
                  className="w-full mt-2" 
                  onClick={handleSendForgotCode} 
                  loading={forgotLoading}
                >
                  SEND VERIFICATION CODE
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-on-surface-variant">Enter the 6-digit code sent to <span className="font-semibold">{forgotEmail}</span>.</p>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">Verification Code</label>
                  <Input 
                    value={forgotCode} 
                    onChange={(e) => setForgotCode(e.target.value)} 
                    placeholder="123456"
                    maxLength={6}
                    className="h-11 rounded-xl tracking-widest text-center text-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">New Password</label>
                  <Input.Password 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button 
                  variant="primary" 
                  className="w-full mt-2" 
                  onClick={handleResetPassword} 
                  loading={forgotLoading}
                >
                  RESET PASSWORD
                </Button>
                <div className="text-center mt-2">
                  <button onClick={() => setForgotStep(1)} className="text-xs text-primary hover:underline">
                    Back to email input
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </main>
    </div>
  );
}
