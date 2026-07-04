'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function LoginPage() {
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

  const onFinish = async (values: any) => {
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
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] font-heading font-extrabold text-2xl">
          R
        </div>
        <Title level={2} className="!mt-0 !mb-1 !font-heading text-slate-800 font-extrabold tracking-tight">
          Welcome back
        </Title>
        <Paragraph className="text-slate-500 text-sm max-w-sm mx-auto">
          Access your Rong Plan organizer dashboard to manage event registrations.
        </Paragraph>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card 
          className="border border-slate-200/80 shadow-md rounded-2xl bg-white"
          styles={{ body: { padding: '32px' } }}
        >
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="mb-6 rounded-lg text-xs"
            />
          )}

          <Form
            name="normal_login"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              label={<span className="font-semibold text-slate-700 text-sm">Username or Email</span>}
              name="emailOrUsername"
              rules={[{ required: true, message: 'Please enter your username or email address' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-slate-400 mr-2" />} 
                placeholder="organizer@techhub.com"
                className="h-11 rounded-lg hover:border-[#4F46E5] focus:border-[#4F46E5] text-slate-800 transition-colors"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-semibold text-slate-700 text-sm">Password</span>}
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400 mr-2" />}
                type="password"
                placeholder="password123"
                className="h-11 rounded-lg hover:border-[#4F46E5] focus:border-[#4F46E5] text-slate-800 transition-colors"
              />
            </Form.Item>

            <Form.Item className="pt-2 !mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] border-none text-white text-base font-bold transition-all shadow-md active:scale-[0.98]"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link href="/" className="text-xs font-bold text-[#4F46E5] hover:underline">
              ← Back to Homepage
            </Link>
          </div>
        </Card>

        {/* Development Tip Callout */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <Typography.Text className="text-amber-800 text-xs leading-normal block">
            💡 <strong>Dev Seed Account:</strong> Try logging in with <br/>
            Email: <code className="bg-amber-100 px-1 py-0.5 rounded text-red-600 font-bold">organizer@techhub.com</code><br/>
            Password: <code className="bg-amber-100 px-1 py-0.5 rounded text-red-600 font-bold">password123</code>
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}
