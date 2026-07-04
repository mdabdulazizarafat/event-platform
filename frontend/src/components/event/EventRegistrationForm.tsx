'use client';

import React, { useState, useRef } from 'react';
import { Form, Input, Button, Modal, Typography, message } from 'antd';
import { 
  ClipboardList, 
  QrCode, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Building2, 
  Wallet, 
  Download, 
  CheckCircle 
} from 'lucide-react';
import type { Event } from '@/lib/api';

const { Text, Title, Paragraph } = Typography;

interface EventRegistrationFormProps {
  event: Event;
  trigger: React.ReactNode;
}

interface RegisterFormValues {
  fullName: string;
  email: string;
  organization?: string;
}

export default function EventRegistrationForm({ event, trigger }: EventRegistrationFormProps) {
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<RegisterFormValues | null>(null);
  const [orderId, setOrderId] = useState('');
  const [qrToken, setQrToken] = useState('');

  const ticketRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ticketRef.current) return;
    const ticket = ticketRef.current;
    const rect = ticket.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotateX = (y / rect.height) * 8;
    const rotateY = -(x / rect.width) * 8;
    
    ticket.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    ticket.style.transition = 'transform 0.05s ease-out';
  };

  const handleMouseLeave = () => {
    if (!ticketRef.current) return;
    ticketRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    ticketRef.current.style.transition = 'transform 0.5s ease-out';
  };

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/events/${event.slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          userId: values.fullName.replace(/\s+/g, '-').toLowerCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to complete registration.');
      }

      const data = await response.json();
      setRegisteredData(values);
      setOrderId(`#RP-2026-${data.registrationId}`);
      setQrToken(data.qrToken);
      setIsSuccess(true);
      message.success('Registration successful! Ticket generated.');
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setRegisteredData(null);
    }, 300);
  };

  const triggerElement = React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setIsOpen(true);
        }
      })
    : <span onClick={() => setIsOpen(true)}>{trigger}</span>;

  return (
    <>
      {triggerElement}

      <Modal
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        width={isSuccess ? 420 : 500}
        centered
        className={isSuccess ? "custom-ticket-modal" : "custom-registration-modal"}
        styles={{
          mask: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
          }
        }}
      >
        {!isSuccess ? (
          <div className="p-6 md:p-8">
            <div className="text-center mb-6 space-y-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] mb-2">
                <ClipboardList size={24} />
              </div>
              <Title level={3} className="!mt-0 !mb-1 !font-heading text-slate-800 text-xl font-extrabold tracking-tight">
                Event Registration
              </Title>
              <Paragraph className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto m-0">
                Register for <span className="font-bold text-[#4F46E5]">{event.title}</span>. Fill out your details below to secure your ticket.
              </Paragraph>
            </div>

            <Form
              form={form}
              name="event_registration"
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="space-y-4"
            >
              <Form.Item
                name="fullName"
                label={<span className="font-semibold text-slate-700 text-sm">Full Name</span>}
                rules={[{ required: true, message: 'Please enter your full name' }]}
              >
                <Input 
                  prefix={<User className="text-slate-400 mr-2" size={16} />} 
                  placeholder="e.g. Alex Johnson" 
                  className="rounded-lg h-11 hover:border-[#4F46E5] focus:border-[#4F46E5] text-slate-800 transition-colors"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span className="font-semibold text-slate-700 text-sm">Email Address</span>}
                rules={[
                  { required: true, message: 'Please enter your email address' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input 
                  prefix={<Mail className="text-slate-400 mr-2" size={16} />} 
                  placeholder="e.g. alex@example.com" 
                  className="rounded-lg h-11 hover:border-[#4F46E5] focus:border-[#4F46E5] text-slate-800 transition-colors"
                />
              </Form.Item>

              <Form.Item
                name="organization"
                label={<span className="font-semibold text-slate-700 text-sm">Organization / Company <span className="text-slate-400 font-normal">(Optional)</span></span>}
              >
                <Input 
                  prefix={<Building2 className="text-slate-400 mr-2" size={16} />} 
                  placeholder="e.g. Acme Corp" 
                  className="rounded-lg h-11 hover:border-[#4F46E5] focus:border-[#4F46E5] text-slate-800 transition-colors"
                />
              </Form.Item>

              <Form.Item className="pt-2 !mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] border-none text-white text-base font-bold transition-all shadow-md active:scale-[0.98]"
                >
                  Register Now
                </Button>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <div className="pt-8 pb-4 px-4 max-w-[380px] mx-auto">
            <div 
              ref={ticketRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative select-none cursor-grab active:cursor-grabbing transform-gpu will-change-transform shadow-[0_20px_50px_rgba(79,70,229,0.25)] rounded-3xl"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-[#10B981] text-white px-5 py-1.5 rounded-full flex items-center gap-2 border-2 border-white shadow-lg text-xs font-bold uppercase tracking-wider">
                  <CheckCircle className="text-white fill-current" size={14} />
                  <span>Valid Ticket</span>
                </div>
              </div>

              <div className="bg-white rounded-t-3xl p-6 pb-4 border-x-2 border-t-2 border-[#c7c4d8]/40">
                <div className="flex justify-between items-start mb-5 pt-2">
                  <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5]">
                    <QrCode size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none m-0">Platform</p>
                    <p className="font-heading text-[#4F46E5] text-base font-bold m-0 mt-1">Rong Plan</p>
                  </div>
                </div>
                
                <h2 className="font-heading text-slate-800 text-2xl font-extrabold leading-tight mb-4 tracking-tight">
                  {event.title}
                </h2>
                
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-slate-400" size={18} />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Date & Time</p>
                      <p className="text-slate-700 text-xs font-bold m-0">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-slate-400" size={18} />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Location</p>
                      <p className="text-slate-700 text-xs font-bold m-0 truncate max-w-[240px]">{event.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ticket-perforation h-6 bg-white border-x-2 border-[#c7c4d8]/40 flex items-center justify-center overflow-hidden">
                <div className="w-full h-[2px] ticket-dashed-line mx-6"></div>
              </div>

              <div className="bg-white px-6 py-4 border-x-2 border-[#c7c4d8]/40 flex flex-col items-center">
                <div className="p-3 bg-white border-4 border-[#4F46E5] rounded-xl shadow-inner relative overflow-hidden w-40 h-40 flex items-center justify-center">
                  {qrToken ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrToken)}`} 
                      alt="Check-in QR Code" 
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-32 h-32 text-slate-800 fill-current">
                      <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                      <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                      <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                      <path d="M40,0 h5 v10 h-5 z M50,5 h10 v5 h-10 z M60,0 h5 v5 h-5 z M45,15 h10 v5 h-10 z M40,25 h5 v5 h-5 z M55,20 h5 v10 h-5 z" />
                      <path d="M30,40 h10 v5 h-10 z M45,40 h5 v10 h-5 z M60,40 h15 v5 h-15 z M80,40 h10 v5 h-10 z M95,45 h5 v10 h-5 z" />
                      <path d="M0,45 h5 v10 h-5 z M10,50 h15 v5 h-15 z M30,55 h10 v5 h-10 z M50,50 h5 v10 h-5 z M65,55 h10 v5 h-10 z M85,50 h5 v5 h-5 z" />
                      <path d="M40,70 h10 v5 h-10 z M55,75 h5 v15 h-5 z M45,85 h10 v5 h-10 z M35,95 h15 v5 h-15 z M65,80 h5 v10 h-5 z" />
                      <path d="M75,70 h5 v10 h-5 z M85,75 h10 v5 h-10 z M70,90 h15 v5 h-15 z M90,85 h10 v15 h-10 z M75,95 h5 v5 h-5 z" />
                    </svg>
                  )}
                  <div className="absolute inset-x-0 top-0 h-1 bg-[#10B981]/50 animate-scan shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                </div>
                <p className="mt-3 text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase m-0 leading-none">Scan for entry</p>
              </div>

              <div className="bg-white rounded-b-3xl p-6 border-x-2 border-b-2 border-[#c7c4d8]/40 shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Participant</p>
                    <p className="text-slate-800 text-sm font-bold m-0 mt-0.5 truncate max-w-[120px]">
                      {registeredData?.fullName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Pass Type</p>
                    <div className="inline-block bg-[#4F46E5] text-white px-2 py-0.5 rounded text-[10px] font-bold mt-0.5">
                      {event.passType || 'VIP Access'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Order ID</p>
                    <p className="text-slate-800 text-xs font-mono font-bold m-0 mt-0.5">{orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Gate</p>
                    <p className="text-slate-800 text-xs font-bold m-0 mt-0.5">{event.gate || 'South Hall'}</p>
                  </div>
                </div>

                <div className="mt-5 p-3 bg-[#e2dfff]/30 rounded-xl border border-[#c3c0ff]/30 text-center">
                  <Text className="text-slate-600 text-xs block leading-normal">
                    🎟️ Check your inbox for your unique QR code ticket and a PDF receipt.
                  </Text>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 px-2">
              <Button
                className="w-full h-11 bg-black hover:bg-black/90 border-none text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] transition-transform shadow-md"
                icon={<Wallet size={16} />}
              >
                Add to Apple Wallet
              </Button>
              <Button
                className="w-full h-11 bg-slate-100 hover:bg-slate-200 border-none text-slate-800 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] transition-transform"
                icon={<Download size={16} />}
              >
                Download PDF Ticket
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
