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
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<any>(null);
  const [otpCode, setOtpCode] = useState('');

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
      const response = await fetch('/api/v1/auth/send-signup-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to send verification code.');
      }

      setFormData(values);
      setSuccessMsg('Verification code sent to your email.');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        code: otpCode,
        role: 'USER',
      };

      const res = await registerUser(payload);

      if (res.success) {
        setSuccessMsg('Account created successfully! Signing you in...');
        const loggedIn = await login(formData.email, formData.password);
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
    <div className="min-h-screen bg-background flex flex-col font-sans">
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
              title={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-6 rounded-xl border-red-200 text-xs shadow-sm"
            />
          )}
          {successMsg && (
            <Alert
              title={successMsg}
              type="success"
              showIcon
              className="mb-6 rounded-xl border-emerald-200 text-xs shadow-sm"
            />
          )}

          {step === 1 ? (
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
                  { min: 8, message: 'At least 8 characters' },
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
                CONTINUE
              </Button>

              <div className="mt-6 text-center text-sm text-on-surface-variant">
                Already part of the network? <Link href="/sign-in" className="font-bold text-primary hover:underline">Login here</Link>
              </div>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/50">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Verification Code
                </label>
                <p className="text-sm text-on-surface-variant mb-4">
                  We've sent a 6-digit code to <span className="font-semibold text-foreground">{formData?.email}</span>.
                </p>
                <Input
                  placeholder="123456"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="h-12 text-center text-xl tracking-[0.5em] rounded-xl bg-white border-outline-variant/50"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onVerifyOtp}
                  loading={loading}
                  className="w-full"
                >
                  VERIFY & REGISTER
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="w-full"
                >
                  GO BACK
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
