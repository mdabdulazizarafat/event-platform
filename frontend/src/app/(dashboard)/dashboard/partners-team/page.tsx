'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import {
  Tabs,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Upload,
  App,
  Popconfirm,
  Select
} from 'antd';
import { Plus, Edit2, Trash2, Link as LinkIcon, Eye } from 'lucide-react';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function PartnersTeamDashboard() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'partners';

  if (user && user.role !== 'SUPER_ADMIN') {
    return <div className="text-center py-20 text-error font-bold">Unauthorized Access - Super Admin Only</div>;
  }

  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [partners, setPartners] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null);

  // Form hooks
  const [partnerForm] = Form.useForm();
  const [teamForm] = Form.useForm();

  // Upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/v1/partners?all=true');
      if (res.ok) {
        const data = await res.json();
        setPartners(data);
      }
    } catch (err) {
      message.error('Failed to load partners');
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/v1/team?all=true');
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (err) {
      message.error('Failed to load team members');
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchPartners(), fetchTeam()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Image Upload helper
  const handleCustomUpload = async (file: File, type: 'logo' | 'image') => {
    if (file.size > 5 * 1024 * 1024) {
      message.error('File size must be under 5MB');
      return false;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        if (type === 'logo') setUploadingLogo(true);
        else setUploadingImage(true);

        const response = await fetch('/api/v1/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: reader.result,
            filename: `pt-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}`
          })
        });

        const data = await response.json();
        if (response.ok && data.url) {
          if (type === 'logo') {
            setLogoUrl(data.url);
            partnerForm.setFieldsValue({ logo: data.url });
            message.success('Logo uploaded successfully');
          } else {
            setImageUrl(data.url);
            teamForm.setFieldsValue({ image: data.url });
            message.success('Profile photo uploaded successfully');
          }
        } else {
          message.error(data.error || 'Upload failed');
        }
      } catch (err) {
        message.error('Upload failed');
      } finally {
        setUploadingLogo(false);
        setUploadingImage(false);
      }
    };
    return false; // Prevent default upload behavior
  };

  // Partner CRUD
  const handlePartnerSubmit = async (values: any) => {
    try {
      const isEdit = !!editingPartner;
      const url = isEdit ? `/api/v1/partners/${editingPartner.id}` : '/api/v1/partners';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          logo: logoUrl || values.logo
        })
      });

      if (res.ok) {
        message.success(isEdit ? 'Partner updated' : 'Partner created');
        setIsPartnerModalOpen(false);
        partnerForm.resetFields();
        setLogoUrl('');
        setEditingPartner(null);
        fetchPartners();
      } else {
        const data = await res.json();
        message.error(data.error || 'Failed to save partner');
      }
    } catch {
      message.error('Error saving partner');
    }
  };

  const handleEditPartner = (record: any) => {
    setEditingPartner(record);
    setLogoUrl(record.logo || '');
    partnerForm.setFieldsValue({
      name: record.name,
      logo: record.logo,
      description: record.description,
      website: record.website,
      founder_name: record.founder_name,
      founder_title: record.founder_title,
      category: record.category || 'Other Organizations',
      sort_order: record.sort_order,
      is_active: record.is_active
    });
    setIsPartnerModalOpen(true);
  };

  const handleDeletePartner = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/partners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('Partner deleted');
        fetchPartners();
      } else {
        message.error('Failed to delete partner');
      }
    } catch {
      message.error('Error deleting partner');
    }
  };

  // Team Member CRUD
  const handleTeamSubmit = async (values: any) => {
    try {
      const isEdit = !!editingTeamMember;
      const url = isEdit ? `/api/v1/team/${editingTeamMember.id}` : '/api/v1/team';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          image: imageUrl || values.image
        })
      });

      if (res.ok) {
        message.success(isEdit ? 'Team member updated' : 'Team member added');
        setIsTeamModalOpen(false);
        teamForm.resetFields();
        setImageUrl('');
        setEditingTeamMember(null);
        fetchTeam();
      } else {
        const data = await res.json();
        message.error(data.error || 'Failed to save team member');
      }
    } catch {
      message.error('Error saving team member');
    }
  };

  const handleEditTeam = (record: any) => {
    setEditingTeamMember(record);
    setImageUrl(record.image || '');
    teamForm.setFieldsValue({
      name: record.name,
      role: record.role,
      image: record.image,
      bio: record.bio,
      sort_order: record.sort_order,
      is_active: record.is_active
    });
    setIsTeamModalOpen(true);
  };

  const handleDeleteTeam = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('Team member deleted');
        fetchTeam();
      } else {
        message.error('Failed to delete team member');
      }
    } catch {
      message.error('Error deleting team member');
    }
  };

  const partnerColumns = [
    {
      key: 'logo',
      title: 'Logo',
      render: (row: any) => row.logo ? (
        <img src={row.logo} alt={row.name} className="h-8 w-auto object-contain max-w-[80px] rounded" />
      ) : <span className="text-gray-400 text-xs">No Logo</span>
    },
    { key: 'name', title: 'Partner Name' },
    {
      key: 'website',
      title: 'Website',
      render: (row: any) => row.website ? (
        <a href={row.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-xs">
          <LinkIcon size={12} /> Link
        </a>
      ) : '-'
    },
    { key: 'category', title: 'Category' },
    {
      key: 'founder',
      title: 'Founder Info',
      render: (row: any) => row.founder_name ? `${row.founder_name} (${row.founder_title || 'Founder'})` : '-'
    },
    { key: 'sort_order', title: 'Sort Order' },
    {
      key: 'is_active',
      title: 'Status',
      render: (row: any) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${row.is_active ? 'bg-primary-50 text-primary' : 'bg-surface-300 text-text-muted'
          }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEditPartner(row)} className="p-1 hover:text-primary transition-colors border-0 bg-transparent cursor-pointer">
            <Edit2 size={16} />
          </button>
          <Popconfirm title="Are you sure you want to delete this partner?" onConfirm={() => handleDeletePartner(row.id)}>
            <button className="p-1 hover:text-error transition-colors border-0 bg-transparent cursor-pointer">
              <Trash2 size={16} />
            </button>
          </Popconfirm>
        </div>
      )
    }
  ];

  const teamColumns = [
    {
      key: 'image',
      title: 'Photo',
      render: (row: any) => row.image ? (
        <img src={row.image} alt={row.name} className="h-10 w-10 object-cover rounded-full" />
      ) : <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">{row.name.charAt(0)}</div>
    },
    { key: 'name', title: 'Name' },
    { key: 'role', title: 'Role' },
    { key: 'sort_order', title: 'Sort Order' },
    {
      key: 'is_active',
      title: 'Status',
      render: (row: any) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${row.is_active ? 'bg-primary-50 text-primary' : 'bg-surface-300 text-text-muted'
          }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEditTeam(row)} className="p-1 hover:text-primary transition-colors border-0 bg-transparent cursor-pointer">
            <Edit2 size={16} />
          </button>
          <Popconfirm title="Are you sure you want to delete this team member?" onConfirm={() => handleDeleteTeam(row.id)}>
            <button className="p-1 hover:text-error transition-colors border-0 bg-transparent cursor-pointer">
              <Trash2 size={16} />
            </button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners & Team Directory"
        description="Manage the brands that collaborate with us, and the team behind the Ayojok platform."
      />

      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 sm:p-6 shadow-xs w-full">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            router.push(`/dashboard/partners-team?tab=${key}`, { scroll: false });
          }}
          className="custom-tabs"
          items={[
            {
              key: 'partners',
              label: 'Partners / Collaborators',
              children: (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading text-lg font-bold text-foreground m-0">Collaborating Brands</h3>
                    <Button variant="primary" onClick={() => {
                      setEditingPartner(null);
                      setLogoUrl('');
                      partnerForm.resetFields();
                      setIsPartnerModalOpen(true);
                    }}>
                      <span className="flex items-center gap-2">
                        <Plus size={16} /> Add Partner
                      </span>
                    </Button>
                  </div>
                  <DataTable
                    columns={partnerColumns}
                    data={partners}
                    emptyText="No partners registered yet."
                    loading={loading}
                  />
                </div>
              )
            },
            {
              key: 'team',
              label: 'Team Members / Mentors',
              children: (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading text-lg font-bold text-foreground m-0">Platform Team</h3>
                    <Button variant="primary" onClick={() => {
                      setEditingTeamMember(null);
                      setImageUrl('');
                      teamForm.resetFields();
                      setIsTeamModalOpen(true);
                    }}>
                      <span className="flex items-center gap-2">
                        <Plus size={16} /> Add Team Member
                      </span>
                    </Button>
                  </div>
                  <DataTable
                    columns={teamColumns}
                    data={team}
                    emptyText="No team members registered yet."
                    loading={loading}
                  />
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Partner Modal */}
      <Modal
        title={editingPartner ? "Edit Partner Brand" : "Add Partner Brand"}
        open={isPartnerModalOpen}
        onCancel={() => setIsPartnerModalOpen(false)}
        onOk={() => partnerForm.submit()}
        okText="Save"
        forceRender
      >
        <Form
          form={partnerForm}
          layout="vertical"
          onFinish={handlePartnerSubmit}
          initialValues={{ category: 'Other Organizations', sort_order: 0, is_active: true }}
          className="mt-4"
        >
          <Form.Item name="name" label="Partner Brand Name" rules={[{ required: true, message: 'Please input partner brand name' }]}>
            <Input placeholder="e.g. Aimspire Co., Ltd." />
          </Form.Item>

          <Form.Item label="Upload Brand Logo">
            <div className="flex items-center gap-4">
              <Upload
                beforeUpload={(file) => handleCustomUpload(file, 'logo')}
                showUploadList={false}
                accept="image/*"
              >
                <button type="button" className="flex items-center gap-2 border border-outline px-4 py-2 rounded bg-surface-50 cursor-pointer">
                  <UploadOutlined size={16} /> {uploadingLogo ? 'Uploading...' : 'Choose Logo'}
                </button>
              </Upload>
              {logoUrl && (
                <div className="relative w-20 h-10 border border-outline rounded bg-surface-100 flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>
            <Form.Item name="logo" rules={[{ required: true, message: 'Please upload a brand logo' }]} className="m-0">
              <Input type="hidden" />
            </Form.Item>
          </Form.Item>

          <Form.Item name="website" label="Website URL">
            <Input placeholder="e.g. https://ayojok.rongplan.com" prefix={<LinkIcon size={14} className="text-gray-400" />} />
          </Form.Item>

          <Form.Item name="category" label="Partner Category" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select>
              <Select.Option value="Educational Institutions">Educational Institutions</Select.Option>
              <Select.Option value="Clubs">Clubs</Select.Option>
              <Select.Option value="Companies">Companies</Select.Option>
              <Select.Option value="Other Organizations">Other Organizations</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Short Description">
            <TextArea rows={3} placeholder="Provide a brief description of the partner organization and collaboration context..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="founder_name" label="Founder / Representative Name">
              <Input placeholder="e.g. Orapim Luang-On" />
            </Form.Item>
            <Form.Item name="founder_title" label="Representative Designation">
              <Input placeholder="e.g. Chief Executive Officer" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="sort_order" label="Display Sort Order">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="is_active" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Team Member Modal */}
      <Modal
        title={editingTeamMember ? "Edit Team Member" : "Add Team Member"}
        open={isTeamModalOpen}
        onCancel={() => setIsTeamModalOpen(false)}
        onOk={() => teamForm.submit()}
        okText="Save"
        forceRender
      >
        <Form
          form={teamForm}
          layout="vertical"
          onFinish={handleTeamSubmit}
          initialValues={{ sort_order: 0, is_active: true }}
          className="mt-4"
        >
          <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please input full name' }]}>
            <Input placeholder="e.g. Raisul Kabir" />
          </Form.Item>

          <Form.Item name="role" label="Designation / Role">
            <Input placeholder="e.g. Co-founder & CEO, Brain Station 23" />
          </Form.Item>

          <Form.Item label="Upload Portrait Photo">
            <div className="flex items-center gap-4">
              <Upload
                beforeUpload={(file) => handleCustomUpload(file, 'image')}
                showUploadList={false}
                accept="image/*"
              >
                <button type="button" className="flex items-center gap-2 border border-outline px-4 py-2 rounded bg-surface-50 cursor-pointer">
                  <UploadOutlined size={16} /> {uploadingImage ? 'Uploading...' : 'Choose Portrait'}
                </button>
              </Upload>
              {imageUrl && (
                <div className="relative w-12 h-12 rounded-full border border-outline overflow-hidden">
                  <img src={imageUrl} alt="Portrait preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <Form.Item name="image" rules={[{ required: true, message: 'Please upload a portrait photo' }]} className="m-0">
              <Input type="hidden" />
            </Form.Item>
          </Form.Item>

          <Form.Item name="bio" label="Short Bio / Details">
            <TextArea rows={3} placeholder="Brief background info..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="sort_order" label="Display Sort Order">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="is_active" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
