'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import StatusChip from '@/components/ui/StatusChip';
import { Search, UserCheck, ShieldAlert, ArrowLeft, Plus, Edit, Trash2, LogIn } from 'lucide-react';
import { Modal, Form, Input, Select, Pagination, App } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminAccountsPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const { user, refetchUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals visibility states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUsername, setDeletingUsername] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Form instances
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Load accounts
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/users');
      if (res.ok) {
        const result = await res.json();
        setUsers(result.data || []);
      } else {
        message.error('Failed to load users from registry.');
      }
    } catch {
      message.error('Network error loading users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Create User Handler
  const handleCreateUser = async (values: any) => {
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      if (res.ok) {
        message.success(data.message || 'User created successfully.');
        setIsCreateModalOpen(false);
        createForm.resetFields();
        loadAccounts();
      } else {
        message.error(data.error || 'Failed to create user.');
      }
    } catch (err: any) {
      message.error(err.message || 'Error creating user.');
    }
  };

  // Edit User Handler
  const handleEditUser = async (values: any) => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${editingUser.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      if (res.ok) {
        message.success(data.message || 'User updated successfully.');
        setIsEditModalOpen(false);
        setEditingUser(null);
        editForm.resetFields();
        loadAccounts();
      } else {
        message.error(data.error || 'Failed to update user.');
      }
    } catch (err: any) {
      message.error(err.message || 'Error updating user.');
    }
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (deleteConfirmText !== 'delete user') {
      message.error('Confirmation text does not match.');
      return;
    }
    
    try {
      const res = await fetch(`/api/v1/admin/users/${deletingUsername}`, {
        method: 'DELETE'
      });
      
      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      if (res.ok) {
        message.success(data.message || 'User deleted successfully.');
        setIsDeleteModalOpen(false);
        setDeletingUsername('');
        setDeleteConfirmText('');
        loadAccounts();
      } else {
        message.error(data.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      message.error(err.message || 'Error deleting user.');
    }
  };

  // Impersonate User Handler
  const handleImpersonateUser = async (username: string) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${username}/impersonate`, {
        method: 'POST'
      });
      
      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.ok) {
        message.success(`You are now logged in as ${username}.`);
        await refetchUser();
        router.push('/dashboard');
      } else {
        message.error(data.error || 'Failed to impersonate user.');
      }
    } catch (err: any) {
      message.error(err.message || 'Error impersonating user.');
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      username: user.username,
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      org: user.org || '',
      role: user.role,
      status: user.status
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (username: string) => {
    setDeletingUsername(username);
    setDeleteConfirmText('');
    setIsDeleteModalOpen(true);
  };

  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: 'name', title: 'Full Name' },
    { key: 'username', title: 'Username' },
    { key: 'email', title: 'Email Address' },
    {
      key: 'role',
      title: 'Global Role',
      render: (row: any) => (
        <span className="text-xs font-bold font-mono tracking-wider">{row.role}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (row: any) => (
        <StatusChip status={row.status} label={row.status} />
      )
    },
    {
      key: 'actions',
      title: 'Administrative Actions',
      render: (row: any) => (
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(row)}
            icon={<Edit className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => openDeleteModal(row.username)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>

          {user?.role === 'SUPER_ADMIN' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleImpersonateUser(row.username)}
              icon={<LogIn className="w-3.5 h-3.5" />}
              className="text-primary border-primary hover:bg-primary/10"
            >
              Login as
            </Button>
          )}
        </div>
      )
    }
  ];

  if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return <div className="text-center py-20 text-error">Unauthorized Access</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Management Registry"
        description="Configure authorization clearance and moderations."
        action={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create User Account
          </Button>
        }
      />

      {/* Filter and Search */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-xs max-w-md">
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search username, name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full placeholder:text-on-surface-variant"
          />
        </div>
      </section>

      <section className="space-y-4">
        <DataTable columns={columns} data={filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)} emptyText="No accounts registered." />
        <div className="flex justify-end pt-2">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredUsers.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            showTotal={(total) => `Showing ${Math.min(total, (currentPage - 1) * pageSize + 1)}-${Math.min(total, currentPage * pageSize)} of ${total} entries`}
          />
        </div>
      </section>

      {/* CREATE USER MODAL */}
      <Modal
        title={<span className="font-heading font-extrabold text-lg">Create New User Account</span>}
        open={isCreateModalOpen}
        onCancel={() => { setIsCreateModalOpen(false); createForm.resetFields(); }}
        footer={null}
        centered
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateUser}
          requiredMark={true}
          className="mt-4 space-y-4"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input placeholder="e.g. janesmith" className="h-10 rounded-lg" />
          </Form.Item>

          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="e.g. Jane Smith" className="h-10 rounded-lg" />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Enter a valid email address' }
            ]}
          >
            <Input placeholder="e.g. jane@company.com" className="h-10 rounded-lg" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="••••••••" className="h-10 rounded-lg" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Mobile Number" name="mobile">
              <Input placeholder="+8801XXXXXXXXX" className="h-10 rounded-lg" />
            </Form.Item>
            <Form.Item label="Organization" name="org">
              <Input placeholder="Rong Plan Inc." className="h-10 rounded-lg" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Global Role"
              name="role"
              initialValue="USER"
              rules={[{ required: true }]}
            >
              <Select className="h-10 rounded-lg">
                <Select.Option value="ADMIN">ADMIN</Select.Option>
                <Select.Option value="ORGANIZER">ORGANIZER</Select.Option>
                <Select.Option value="USER">USER</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              initialValue="ACTIVE"
              rules={[{ required: true }]}
            >
              <Select className="h-10 rounded-lg">
                <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                <Select.Option value="PENDING_APPROVAL">PENDING_APPROVAL</Select.Option>
                <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => { setIsCreateModalOpen(false); createForm.resetFields(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Account
            </Button>
          </div>
        </Form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        title={<span className="font-heading font-extrabold text-lg">Edit User Account Details</span>}
        open={isEditModalOpen}
        onCancel={() => { setIsEditModalOpen(false); setEditingUser(null); editForm.resetFields(); }}
        footer={null}
        centered
        width={500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditUser}
          requiredMark={true}
          className="mt-4 space-y-4"
        >
          {user?.role === 'SUPER_ADMIN' && (
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please enter username' }]}
            >
              <Input placeholder="e.g. janesmith" className="h-10 rounded-lg" />
            </Form.Item>
          )}

          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="e.g. Jane Smith" className="h-10 rounded-lg" />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Enter a valid email address' }
            ]}
          >
            <Input placeholder="e.g. jane@company.com" className="h-10 rounded-lg" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Mobile Number" name="mobile">
              <Input placeholder="+8801XXXXXXXXX" className="h-10 rounded-lg" />
            </Form.Item>
            <Form.Item label="Organization" name="org">
              <Input placeholder="Rong Plan Inc." className="h-10 rounded-lg" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Global Role"
              name="role"
              rules={[{ required: true }]}
            >
              <Select className="h-10 rounded-lg">
                <Select.Option value="SUPER_ADMIN">SUPER_ADMIN</Select.Option>
                <Select.Option value="ADMIN">ADMIN</Select.Option>
                <Select.Option value="ORGANIZER">ORGANIZER</Select.Option>
                <Select.Option value="USER">USER</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true }]}
            >
              <Select className="h-10 rounded-lg">
                <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                <Select.Option value="PENDING_APPROVAL">PENDING_APPROVAL</Select.Option>
                <Select.Option value="SUSPENDED">SUSPENDED</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingUser(null); editForm.resetFields(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <Modal
        title={<span className="font-heading font-extrabold text-lg text-error">Confirm Permanent Deletion</span>}
        open={isDeleteModalOpen}
        onCancel={() => { setIsDeleteModalOpen(false); setDeletingUsername(''); setDeleteConfirmText(''); }}
        footer={[
          <Button key="cancel" variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeletingUsername(''); setDeleteConfirmText(''); }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            variant="danger" 
            onClick={handleDeleteUser}
            disabled={deleteConfirmText !== 'delete user'}
          >
            Permanently Delete
          </Button>
        ]}
        centered
        width={400}
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-on-surface-variant leading-relaxed m-0">
            Warning: This action is permanent and cannot be undone. All registrations and account settings associated with user <strong className="text-foreground">"{deletingUsername}"</strong> will be removed.
          </p>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
              Type <strong className="text-error">"delete user"</strong> to confirm
            </label>
            <Input 
              value={deleteConfirmText} 
              onChange={(e) => setDeleteConfirmText(e.target.value)} 
              placeholder="delete user"
              className="h-10 rounded-lg"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
