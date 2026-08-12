'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Modal, Alert } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, CheckCircleFilled } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function OrganizerSignupPage() {
  const router = useRouter();
  const { registerUser, isAuthenticated, user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedOrg, setSubmittedOrg] = useState('');

  // Redirect if already an ORGANIZER
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'ORGANIZER') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const onFinish = async (values: any) => {
    if (!isAuthenticated && values.password !== values.confirmPassword) {
      setError('Passwords do not match. Please check again.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isAuthenticated && user) {
        const res = await updateUserProfile({
          org: values.org,
          role: 'ORGANIZER',
          status: 'PENDING_APPROVAL'
        });
        if (res) {
          setSubmittedOrg(values.org);
          setIsSuccessModalOpen(true);
        } else {
          setError('Failed to submit application.');
        }
      } else {
        const res = await registerUser({
          username: values.username,
          name: values.name,
          email: values.email,
          password: values.password,
          mobile: values.mobile,
          org: values.org,
          role: 'ORGANIZER',
        });

        if (res.success) {
          setSubmittedOrg(values.org);
          setIsSuccessModalOpen(true);
        } else {
          setError(res.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit organizer application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-background flex flex-col font-sans">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-8 pb-16 px-4">
        <div className="w-full max-w-md text-center mb-8">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">
            Organizer <span className="text-primary">Application</span>
          </h1>
          <p className="text-sm text-on-surface-variant">
            Ready to stand out? <strong className="text-foreground">Submit your details</strong> and join the future of event management.
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

          <Form
            name="organizer_signup"
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            className="space-y-4"
          >
            {/* If user is already logged in as PARTICIPANT, they only need to provide Organization name */}
            {isAuthenticated && user ? (
              <>
                <Alert
                  message="You are currently logged in."
                  description={`Submit your organization name to upgrade your account (${user.email}) to an Organizer.`}
                  type="info"
                  showIcon
                  className="mb-6 rounded-xl border-blue-200 text-xs shadow-sm"
                />
                
                <Form.Item
                  label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">Organization / Company / Edu Institution</span>}
                  name="org"
                  className="mb-0"
                  rules={[{ required: true, message: 'Enter your organization name' }]}
                >
                  <Input
                    placeholder="Rong Plan Inc."
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white"
                  />
                </Form.Item>
              </>
            ) : (
              <>
                {/* Full Registration Form for unauthenticated users */}
                <Form.Item
                  label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">Full Name</span>}
                  name="name"
                  className="mb-0"
                  rules={[{ required: true, message: 'Enter your full name' }]}
                >
                  <Input
                    placeholder="John Doe"
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">Username</span>}
                  name="username"
                  className="mb-0"
                  rules={[
                    { required: true, message: 'Enter a username' },
                    { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Alphanumeric, underscores, and hyphens only' }
                  ]}
                >
                  <Input
                    placeholder="johndoe"
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white"
                  />
                </Form.Item>

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
                  label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">Mobile Number</span>}
                  name="mobile"
                  className="mb-0"
                  rules={[
                    { required: true, message: 'Enter mobile number' },
                    {
                      pattern: /^(\+88)?01[3-9]\d{8}$|^(\+\d{1,4})?\d{8,14}$/,
                      message: 'Enter a valid mobile number',
                    },
                  ]}
                >
                  <Input
                    placeholder="+8801XXXXXXXXX"
                    className="h-12 rounded-xl bg-surface-container-low border-outline-variant/50 focus:bg-white"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-bold text-foreground uppercase tracking-wider">Organization / Company / Edu Institution</span>}
                  name="org"
                  className="mb-0"
                  rules={[{ required: true, message: 'Enter your organization name' }]}
                >
                  <Input
                    placeholder="Rong Plan Inc."
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
              </>
            )}

            <div className="text-center text-xs text-on-surface-variant py-2">
              By applying I agree to the <Link href="/terms" className="text-primary hover:underline">Organizer Terms</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={loading}
              className="w-full mt-2"
            >
              SUBMIT APPLICATION
            </Button>

            {!isAuthenticated && (
              <div className="mt-6 text-center text-sm text-on-surface-variant">
                Already part of the network? <Link href="/sign-in" className="font-bold text-primary hover:underline">Login here</Link>
              </div>
            )}
          </Form>
        </div>
      </main>

      <Modal
        open={isSuccessModalOpen}
        footer={null}
        closable={false}
        centered
        className="text-center"
      >
        <div className="flex flex-col items-center justify-center py-6">
          <CheckCircleFilled className="text-primary text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
          <p className="text-on-surface-variant mb-6 text-sm text-center">
            Thank you for applying to become an organizer for <strong className="text-foreground">{submittedOrg}</strong>. 
            Our admin team will review your application shortly.
          </p>
          <div className="bg-primary-container/20 border border-primary/20 rounded-lg p-4 mb-6 w-full text-left">
            <h4 className="text-primary font-bold text-xs uppercase mb-1">What happens next?</h4>
            <p className="text-on-surface-variant text-xs m-0 leading-relaxed">
              Your account is currently active as a participant. Once approved, you will automatically gain access to the Organizer Dashboard.
            </p>
          </div>
          <Button 
            variant="primary"
            size="lg"
            onClick={() => {
              setIsSuccessModalOpen(false);
              router.push(isAuthenticated ? '/dashboard' : '/sign-in');
            }}
            className="w-full"
          >
            {isAuthenticated ? 'GO TO DASHBOARD' : 'LOGIN TO ACCOUNT'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
