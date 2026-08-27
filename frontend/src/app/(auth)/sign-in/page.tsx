'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Alert } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function SignInPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
                <Link href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                  Forgot your password?
                </Link>
              </div>
              <div className="text-sm text-on-surface-variant">
                New to Rong Plan? <Link href="/sign-up" className="font-bold text-primary hover:underline">Open account</Link>
              </div>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
}
