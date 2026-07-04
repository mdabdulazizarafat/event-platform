'use client';

import React, { useState } from 'react';
import { Typography, Card, Form, Input, Button, Switch, Avatar, Select, message } from 'antd';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  MapPin, 
  Users,
  Edit,
  Trash2,
  Mail,
  Lock,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const { Title, Paragraph } = Typography;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('General');

  const onFinish = (values: any) => {
    message.success('Settings saved successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Workspace Preferences Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="col-span-1 md:col-span-3">
          <h3 className="font-heading text-3xl font-extrabold text-foreground mb-2">Workspace Preferences</h3>
          <p className="text-sm text-on-surface-variant m-0">Manage your profile, event configurations, and team permissions in one centralized dashboard.</p>
        </div>
        <div className="flex items-end justify-end">
          <div className="bg-surface-container-high rounded-xl p-1 flex gap-1 border border-outline-variant/30">
            {['General', 'Security', 'Billing'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-lg border-none transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-primary shadow-sm font-extrabold'
                    : 'text-on-surface-variant hover:bg-white/40'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Profile Settings Left column */}
        <section className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-outline-variant p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 m-0">
              <User className="text-primary" size={20} />
              <span>Profile Settings</span>
            </h4>
            <button className="text-primary font-bold text-xs border-none bg-transparent hover:underline cursor-pointer">Save Changes</button>
          </div>

          <div className="flex flex-col items-center py-4 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <Avatar size={96} src={user?.avatar} className="shadow-lg border-4 border-white mb-2" />
            <button className="text-primary font-bold text-xs border-none bg-transparent hover:underline cursor-pointer">Update Photo</button>
          </div>

          <Form layout="vertical" initialValues={{ name: user?.name, email: user?.email, bio: user?.bio || 'Senior Event Strategist with 12+ years experience in large-scale tech conferences and regional summits.' }} onFinish={onFinish} className="space-y-4">
            <Form.Item label={<span className="font-bold text-on-surface-variant text-xs">Full Name</span>} name="name">
              <Input className="h-10 rounded-lg" />
            </Form.Item>
            <Form.Item label={<span className="font-bold text-on-surface-variant text-xs">Email Address</span>} name="email">
              <Input className="h-10 rounded-lg" disabled />
            </Form.Item>
            <Form.Item label={<span className="font-bold text-on-surface-variant text-xs">Professional Bio</span>} name="bio">
              <Input.TextArea rows={4} className="rounded-lg" />
            </Form.Item>
          </Form>
        </section>

        {/* Right Configuration & Preferences Column */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* Event Configuration */}
          <section className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
              <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 m-0">
                <SettingsIcon className="text-primary" size={20} />
                <span>Event Configuration</span>
              </h4>
              <span className="px-3 py-1 bg-secondary-container/20 text-secondary border border-secondary-container rounded-full text-[10px] font-bold uppercase">Active Event</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Event Name</label>
                <Input value="Global Tech Summit 2026" className="h-10 rounded-lg" />
              </div>
              <div>
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Date</label>
                <Input value="Oct 24 - 26, 2026" className="h-10 rounded-lg" />
              </div>
              <div>
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Timezone</label>
                <Select defaultValue="Pacific" className="w-full h-10 rounded-lg">
                  <Select.Option value="Pacific">(GMT-08:00) Pacific Time</Select.Option>
                  <Select.Option value="Eastern">(GMT-05:00) Eastern Time</Select.Option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block font-bold text-on-surface-variant text-xs mb-1.5">Venue / Platform</label>
                <div className="flex items-center gap-2 p-4 bg-surface-container-low rounded-lg border border-dashed border-outline-variant/80">
                  <MapPin className="text-on-surface-variant" size={18} />
                  <span className="text-xs text-foreground font-semibold">Convention Center North, SF</span>
                  <button className="ml-auto text-primary font-bold text-xs border-none bg-transparent hover:underline cursor-pointer">Change</button>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications toggles */}
          <section className="bg-white rounded-xl border border-outline-variant p-6">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-4 mb-6">
              <Bell className="text-primary" size={20} />
              <h4 className="font-heading text-base font-bold text-foreground m-0">Notification Preferences</h4>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground m-0">New Registrations</p>
                  <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">Alert when a new participant signs up for the event.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground m-0">Session Changes</p>
                  <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">Notify me if a speaker or schedule detail is modified.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground m-0">System Alerts</p>
                  <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">Critical platform updates and maintenance notices.</p>
                </div>
                <Switch />
              </div>
            </div>
          </section>
        </div>

        {/* Team Management list */}
        <section className="col-span-12 bg-white rounded-xl border border-outline-variant p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2 m-0">
                <Users className="text-primary" size={20} />
                <span>Team Management</span>
              </h4>
              <p className="text-xs text-on-surface-variant m-0 mt-1">Manage roles and permissions for event collaborators.</p>
            </div>
            <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all border-none cursor-pointer text-xs">
              <UserPlus size={14} />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/50">
                  <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Member</th>
                  <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                  <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Last Active</th>
                  <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {[
                  { name: 'Jane Doe', email: 'jane@example.com', role: 'Admin', active: '2 mins ago', initial: 'JD', color: 'blue' },
                  { name: 'Rick Martinez', email: 'rick.m@gmail.com', role: 'Editor', active: '5 hours ago', initial: 'RM', color: 'orange' },
                  { name: 'Sarah Lee', email: 's.lee@corp.com', role: 'Viewer', active: 'Yesterday', initial: 'SL', color: 'default' }
                ].map((member, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="bg-primary-container text-white font-bold">{member.initial}</Avatar>
                        <div>
                          <p className="text-xs font-bold text-foreground m-0">{member.name}</p>
                          <p className="text-[10px] text-on-surface-variant m-0 mt-0.5">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <Tag color={member.color === 'blue' ? 'blue' : member.color === 'orange' ? 'orange' : 'default'} className="font-bold text-[10px]">
                        {member.role}
                      </Tag>
                    </td>
                    <td className="py-3 text-[11px] text-on-surface-variant">{member.active}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant border-none bg-transparent cursor-pointer">
                          <Edit size={14} />
                        </button>
                        <button className="p-1 hover:bg-error-container/20 rounded transition-colors text-error border-none bg-transparent cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Danger Zone */}
      <Card className="rounded-2xl border border-red-200 shadow-sm bg-red-50/10" styles={{ body: { padding: '24px' } }}>
        <Title level={5} className="!m-0 text-error font-bold mb-2">Sign Out</Title>
        <Paragraph className="text-on-surface-variant text-xs mb-4">End your current session and return to the login page.</Paragraph>
        <Button danger onClick={() => { logout(); window.location.href = '/login'; }} className="h-10 rounded-lg font-bold px-6">
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
