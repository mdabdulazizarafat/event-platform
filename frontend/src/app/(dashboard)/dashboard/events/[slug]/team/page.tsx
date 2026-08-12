'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, message, Modal, Select, Table, Tag } from 'antd';
import { ArrowLeft, UserPlus, Shield, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';

export default function EventTeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  
  // Invite Form
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState('SCANNER');

  useEffect(() => {
    fetchTeam();
  }, [slug]);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`/api/v1/events/${slug}/team`);
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      } else {
        message.error('Failed to load team members');
      }
    } catch (err) {
      message.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteUsername) {
      message.error('Please enter a username');
      return;
    }
    setInviting(true);
    try {
      const res = await fetch(`/api/v1/events/${slug}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inviteUsername, role: inviteRole })
      });
      if (res.ok) {
        message.success('Team member invited successfully');
        setIsModalOpen(false);
        setInviteUsername('');
        fetchTeam();
      } else {
        const err = await res.json();
        message.error(err.error || 'Failed to invite team member');
      }
    } catch (err) {
      message.error('An error occurred while inviting');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (username: string) => {
    try {
      const res = await fetch(`/api/v1/events/${slug}/team/${username}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Team member removed');
        fetchTeam();
      } else {
        message.error('Failed to remove team member');
      }
    } catch (err) {
      message.error('An error occurred while removing');
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <span className="font-bold">{text}</span>
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const color = role === 'ORGANIZER' ? 'blue' : role === 'SCANNER' ? 'cyan' : 'default';
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: 'Added By',
      dataIndex: 'added_by',
      key: 'added_by',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-error border-error hover:bg-error/10"
          onClick={() => handleRemove(record.username)}
          icon={<Trash2 className="w-4 h-4" />}
        >
          Remove
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/events/${slug}`)} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h2 className="font-heading text-2xl font-extrabold text-foreground leading-tight m-0">
            Event Team Management
          </h2>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
          Invite Member
        </Button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs">
        <div className="mb-6 flex items-start gap-4 p-4 bg-primary-container/10 rounded-xl border border-primary-container/20">
          <Shield className="text-primary-container shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-foreground m-0">Role Permissions</h4>
            <p className="text-xs text-on-surface-variant m-0 mt-1">
              <strong>Organizer:</strong> Full access to edit details, manage team, and view financials. <br/>
              <strong>Scanner:</strong> Limited strictly to the QR Scanner UI and check-in logs.
            </p>
          </div>
        </div>

        <Table 
          dataSource={team} 
          columns={columns} 
          rowKey="username" 
          loading={loading}
          pagination={false}
          className="overflow-x-auto"
        />
      </div>

      <Modal
        title="Invite Team Member"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" variant="outline" onClick={() => setIsModalOpen(false)} className="mr-2">Cancel</Button>,
          <Button key="invite" variant="primary" loading={inviting} onClick={handleInvite}>Send Invite</Button>
        ]}
      >
        <div className="space-y-4 py-4">
          <FormField 
            label="User's Username" 
            value={inviteUsername} 
            onChange={(e) => setInviteUsername(e.target.value)} 
            placeholder="e.g. sarah123" 
            required 
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-label-bold text-on-surface-variant font-bold uppercase tracking-wider block">
              Assign Role
            </label>
            <Select 
              value={inviteRole} 
              onChange={setInviteRole} 
              className="w-full"
              size="large"
              options={[
                { value: 'ORGANIZER', label: 'Organizer (Full Access)' },
                { value: 'SCANNER', label: 'Scanner (Scan Only)' }
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
