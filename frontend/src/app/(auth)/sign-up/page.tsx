'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Alert } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function SignUpPage() {
  const router = useRouter();
  const { registerUser, login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onSignupFinish = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match. Please check again.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: 'USER',
      };

      const res = await registerUser(payload);

      if (res.success) {
        setSuccessMsg('Account created successfully! Signing you in...');
        const loggedIn = await login(values.email, values.password);
        if (loggedIn) {
          router.push('/dashboard');
        } else {
          router.push('/sign-in');
        }
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
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
            New <span className="text-primary">Account</span>
          </h1>
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
            Ready to stand out? Activate your account and join the future of event management.
          </p>
        </div>

        <div className="w-full max-w-md">
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-6 rounded-xl border-red-200 text-xs shadow-sm"
            />
          )}
          {successMsg && (
            <Alert
              message={successMsg}
              type="success"
              showIcon
              className="mb-6 rounded-xl border-emerald-200 text-xs shadow-sm"
            />
          )}

          <Form
            name="signup_form"
            layout="vertical"
            onFinish={onSignupFinish}
            requiredMark={false}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">First Name</span>}
                name="firstName"
                className="mb-0"
                rules={[{ required: true, message: 'Enter first name' }]}
              >
                <Input
                  placeholder="John"
                  className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">Last Name</span>}
                name="lastName"
                className="mb-0"
              >
                <Input
                  placeholder="Doe"
                  className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">E-mail Address</span>}
              name="email"
              className="mb-0"
              rules={[
                { required: true, message: 'Enter your email' },
                { type: 'email', message: 'Enter a valid email' },
              ]}
            >
              <Input
                placeholder="hello@email.com"
                className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">Password</span>}
              name="password"
              className="mb-0"
              rules={[
                { required: true, message: 'Enter a password' },
                { min: 6, message: 'At least 6 characters' },
              ]}
            >
              <Input.Password
                placeholder="••••••••"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white [&>input]:bg-transparent"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">Confirm Password</span>}
              name="confirmPassword"
              className="mb-0"
              rules={[
                { required: true, message: 'Confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="••••••••"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white [&>input]:bg-transparent"
              />
            </Form.Item>

            <div className="text-center text-xs text-on-surface-variant py-2">
              By registering I agree to the <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={loading}
              className="w-full mt-2"
            >
              REGISTER
            </Button>

            <div className="mt-6 text-center text-sm text-on-surface-variant">
              Already part of the network? <Link href="/sign-in" className="font-bold text-primary hover:underline">Login here</Link>
            </div>
            
            <div className="mt-4 text-center text-sm text-on-surface-variant border-t border-outline-variant/50 pt-4">
              Looking to host events? <Link href="/organizer-signup" className="font-bold text-emerald-500 hover:underline">Apply as Organizer</Link>
            </div>
          </Form>
        </div>
      </main>
    </div>
  );
}
