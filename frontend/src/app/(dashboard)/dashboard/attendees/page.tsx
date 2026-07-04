'use client';

import React from 'react';
import { Typography, Card, Table, Tag, Input, Select, Button, Avatar } from 'antd';
import { 
  Search, 
  ChevronRight, 
  Download, 
  UserPlus, 
  Users, 
  CheckCircle, 
  Star, 
  XCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const { Title, Paragraph } = Typography;

export default function AttendeesPage() {
  const columns = [
    { 
      title: 'Attendee', 
      dataIndex: 'name', 
      key: 'name', 
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar src={record.avatar} className="border border-outline-variant bg-surface-container flex-shrink-0">
            {text.charAt(0)}
          </Avatar>
          <div>
            <p className="font-bold text-foreground text-sm m-0 leading-normal">{text}</p>
            <p className="text-xs text-on-surface-variant m-0 mt-0.5">{record.email}</p>
          </div>
        </div>
      )
    },
    { 
      title: 'Ticket Type', 
      dataIndex: 'ticketType', 
      key: 'ticketType',
      render: (ticket: string) => {
        let tagColor = 'blue';
        if (ticket === 'VIP Access') tagColor = 'orange';
        if (ticket === 'Speaker') tagColor = 'purple';
        return (
          <Tag className="font-bold uppercase tracking-wider text-[10px]" color={tagColor}>
            {ticket}
          </Tag>
        );
      }
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string) => {
        let tagColor = 'processing';
        if (status === 'Checked-in') tagColor = 'success';
        if (status === 'Cancelled') tagColor = 'error';
        return (
          <Tag className="font-bold" color={tagColor}>
            {status}
          </Tag>
        );
      } 
    },
    { 
      title: 'Registration Date', 
      dataIndex: 'date', 
      key: 'date', 
      render: (text: string, record: any) => (
        <div>
          <p className="text-xs font-bold text-foreground m-0">{text}</p>
          <p className="text-[10px] text-on-surface-variant m-0 mt-0.5">{record.time}</p>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: () => (
        <div className="flex items-center justify-end gap-1">
          <Button size="small" type="text" className="text-on-surface-variant hover:text-primary flex items-center justify-center p-1" icon={<Eye size={16} />} />
          <Button size="small" type="text" className="text-on-surface-variant hover:text-primary flex items-center justify-center p-1" icon={<Edit size={16} />} />
          <Button size="small" type="text" className="text-on-surface-variant hover:text-error flex items-center justify-center p-1" icon={<Trash2 size={16} />} />
        </div>
      )
    }
  ];

  const data = [
    { 
      key: '1', 
      name: 'Sarah Jenkins', 
      email: 'sarah.j@techflow.io', 
      ticketType: 'VIP Access', 
      status: 'Checked-in', 
      date: 'Oct 12, 2026', 
      time: '14:24 PM',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTgAykfzHZN0jehankZP9Mh6cq5bX3VAj9z2bFsiWTWR0Y5r8izIoM2NmKgYFN9QFSFco_JPrPofumkTBu2_WST35YuP27Kz6qwG_VQlcYHF2burcpfWAFBbgdDzuXBztfMSxBGGN40HianLAzL88Rlz-3yRLp9ViFjIwum9dtKKbzW3ueslZRACRCwwa0fnIg5Rru0JkVo7HgfN-V2VydGNGcocwXrNUiaNoGl_nqbm3NnmZ_tVaZELiDPoi_xib40gWIDn85bQ'
    },
    { 
      key: '2', 
      name: 'Marcus Thorne', 
      email: 'm.thorne@globalconf.com', 
      ticketType: 'Speaker', 
      status: 'Pending', 
      date: 'Oct 14, 2026', 
      time: '09:12 AM',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0t743uYq7qUQ0uTP3S97LPS0I_D9-MIwU1XuaMEr3XG-uaqRSdh8UzDOzuIAnJXpxkRru8_Wb30tGM8dlmC6kh20LOvK7yb6WmfQQ2AGPyxhHYefk9JJJH4-0LSgd-FRBs2Zd37TRzbyhGIDwiemfnhpTIXlpNrHnAuHbF-P4H-yDfaQIwhF0bL95MbJz_HxYXcYfdi_m3bauUtbGgVVv0Cs9GUgIkiYnoBiHQMSxG-khUzc-Y2xlpHoheUSOqr_ltnTOd6goEA'
    },
    { 
      key: '3', 
      name: 'Elena Rodriguez', 
      email: 'elena.r@designers.hub', 
      ticketType: 'General Admission', 
      status: 'Cancelled', 
      date: 'Oct 11, 2026', 
      time: '18:05 PM',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE3_N9v_DEeAV_g_SJDbpqbqMU1iTEqtq4sArJ0awh6IjPmyzE8jeNsUyI7fHSpRhXMog-LJYiQ-FyOD1PJ9nIYFeFHpkbIbwN9R5HMTX-_LDj9EtyDdwM3iBbOGOTD6CSPxXOFMIk155s-xY2OX2OLQEg3I3_EDn2ynZMyvRELUIpReeVgysc9pVRgF3y0rMK1Fyjd1KbeFgT2d7H2Q0wJju5z0cArMd-sDu7LaSLVa6918TiYlaFS1KfrOvcpkRDRqzK7mTwpw'
    },
    { 
      key: '4', 
      name: 'David Chen', 
      email: 'd.chen@apex-systems.com', 
      ticketType: 'VIP Access', 
      status: 'Checked-in', 
      date: 'Oct 15, 2026', 
      time: '08:30 AM',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrLgb2zuue7f9syk1Cw4Q0m10PG1VK1vrQMbQuD_-igK6ICFvEZ5bt_0SEi2a5V-x1Ym1ZqrzFebsCeNd0ClE2KRJmMdtgKiWybgWcJM1f3k1SGBGf1mE4gVOWoUi7SJyfDnGkd0moAUXjOhSa3ZN2quf23_qsttM38z4MHdri4IA645gJBlpdJugOqlnkSXzKaqWPmCv1hAKy_fhrJpWpNErkA2pZVGKpinWFDM6TnlBykd2-r-bgqxrYrfqAofrIggObxcH8hg'
    },
  ];

  const glassStats = [
    { title: 'Total Registrations', value: '1,248', icon: Users, color: '#3525cd', bg: 'rgba(53, 37, 205, 0.08)' },
    { title: 'Checked In', value: '842', icon: CheckCircle, color: '#006c49', bg: 'rgba(0, 108, 73, 0.08)' },
    { title: 'VIP Guests', value: '156', icon: Star, color: '#684000', bg: 'rgba(104, 64, 0, 0.08)' },
    { title: 'Cancellations', value: '24', icon: XCircle, color: '#ba1a1a', bg: 'rgba(186, 26, 26, 0.08)' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant/60 font-semibold mb-2">
            <span>Dashboard</span>
            <ChevronRight size={12} />
            <span className="text-primary font-bold">Attendees</span>
          </nav>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">Manage Attendees</h2>
          <p className="text-sm text-on-surface-variant mt-1 mb-0">Real-time overview of all registered participants for Global Tech Summit 2026.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-bold text-xs hover:bg-surface-container-low transition-colors cursor-pointer">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-bold text-xs shadow-md hover:bg-primary/95 transition-all cursor-pointer">
            <UserPlus size={16} />
            <span>Add Attendee</span>
          </button>
        </div>
      </div>

      {/* Glass Stats Bento Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {glassStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-outline-variant/40 bg-surface-container-lowest/65">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-widest m-0">{stat.title}</p>
                <h3 className="font-heading text-2xl font-extrabold text-foreground mt-1 mb-0">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Table Panel */}
      <Card className="rounded-2xl border border-outline-variant shadow-sm overflow-hidden bg-surface-container-lowest" styles={{ body: { padding: 0 } }}>
        {/* Table Filters Header */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select defaultValue="All" style={{ width: 160 }} className="rounded-lg h-9">
              <Select.Option value="All">All Ticket Types</Select.Option>
              <Select.Option value="VIP">VIP Access</Select.Option>
              <Select.Option value="General">General Admission</Select.Option>
              <Select.Option value="Speaker">Speaker</Select.Option>
            </Select>

            <Select defaultValue="All" style={{ width: 140 }} className="rounded-lg h-9">
              <Select.Option value="All">Status: All</Select.Option>
              <Select.Option value="Checked-in">Checked-in</Select.Option>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
            </Select>

            <Button type="text" className="text-on-surface-variant hover:text-primary font-bold text-xs">
              Clear All
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <Input placeholder="Search attendees..." className="pl-8 w-60 h-9 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={{
            total: 1248,
            pageSize: 10,
            showSizeChanger: false,
            className: "px-6 py-4 border-t border-outline-variant m-0",
          }}
          className="custom-table"
        />
      </Card>
    </div>
  );
}
