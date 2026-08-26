'use client';

import React from 'react';
import { ConfigProvider, Card, Typography, Row, Col, Avatar, Button, Tag, Space } from 'antd';
import { UserOutlined, CalendarOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { theme } from '../../../theme/theme';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;

export default function HostProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);

  // Mock data for host profiles
  const hostsData: Record<string, { name: string; handle: string; description: string; events: any[] }> = {
    'tech-hub': {
      name: 'Tech Hub Community',
      handle: '@tech-hub',
      description: 'Fostering tech innovation and developer growth. Host of the annual Global Tech Summit, DevCon, and monthly workshops.',
      events: [
        { id: '1', slug: 'global-tech-summit', title: 'Global Tech Summit 2026', date: 'Oct 24-26, 2026', status: 'Open' },
        { id: '2', slug: 'react-advanced-workshop', title: 'React 19 & Next.js 16 Masterclass', date: 'Nov 12, 2026', status: 'Selling Fast' }
      ]
    },
    'creative-studio': {
      name: 'Creative Studio Co.',
      handle: '@creative-studio',
      description: 'A collective of designers, writers, and product builders designing the future. Sharing design systems and product knowledge.',
      events: [
        { id: '3', slug: 'design-systems-summit', title: 'Design Systems & UX Architecture', date: 'Dec 05, 2026', status: 'Waitlist' }
      ]
    }
  };

  const host = hostsData[username];

  if (!host) {
    notFound();
  }

  return (
    <ConfigProvider theme={theme}>
      <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', padding: '40px 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          
          {/* Top Section: Host Profile Directory */}
          <Card 
            style={{ 
              borderRadius: theme.token?.borderRadius, 
              boxShadow: theme.token?.boxShadow,
              marginBottom: 32,
              textAlign: 'center',
              padding: '24px 0'
            }}
          >
            <Avatar size={96} icon={<UserOutlined />} style={{ backgroundColor: theme.token?.colorPrimary, marginBottom: 16 }} />
            <Title level={2} style={{ margin: 0 }}>{host.name}</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>{host.handle}</Text>
            <Paragraph style={{ marginTop: 16, fontSize: 16, color: '#4B5563', maxWidth: 600, margin: '16px auto 0' }}>
              {host.description}
            </Paragraph>
          </Card>

          {/* Bottom Grid: Upcoming Events List View */}
          <Title level={3} style={{ marginBottom: 24 }}>Upcoming Events</Title>
          {host.events.length > 0 ? (
            <Row gutter={[16, 16]}>
              {host.events.map((event) => (
                <Col xs={24} key={event.id}>
                  <Card 
                    hoverable
                    style={{ borderRadius: theme.token?.borderRadius, boxShadow: theme.token?.boxShadow }}
                    styles={{ body: { padding: 24 } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <Space size="middle" align="center">
                          <Title level={4} style={{ margin: 0 }}>{event.title}</Title>
                          <Tag color={event.status === 'Waitlist' ? 'orange' : 'green'}>{event.status}</Tag>
                        </Space>
                        <div style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: 15 }}>
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            {event.date}
                          </Text>
                        </div>
                      </div>
                      
                      <Link href={`/events/${event.slug}`}>
                        <Button type="primary" shape="round" icon={<ArrowRightOutlined />} iconPlacement="end">
                          View Event
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card style={{ textAlign: 'center', padding: '40px 0', borderRadius: theme.token?.borderRadius }}>
              <Text type="secondary" style={{ fontSize: 16 }}>No upcoming events scheduled yet.</Text>
            </Card>
          )}

        </div>
      </div>
    </ConfigProvider>
  );
}
