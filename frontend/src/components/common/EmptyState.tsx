'use client';

import React from 'react';
import { Typography } from 'antd';
import { Calendar } from 'lucide-react';

const { Title, Paragraph } = Typography;

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({ 
  title = 'No Upcoming Events', 
  description = 'This host hasn\'t scheduled any live public events yet. Check back later!' 
}: EmptyStateProps) {
  return (
    <div className="w-full py-16 px-6 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-full bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] mb-6 relative">
        <Calendar className="text-[#4F46E5]" size={36} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4F46E5] opacity-30"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#4F46E5]"></span>
        </span>
      </div>
      
      <Title level={4} className="!mt-0 !mb-2 !font-heading text-slate-800 font-bold text-lg">
        {title}
      </Title>
      <Paragraph className="text-slate-500 text-sm max-w-xs m-0 leading-relaxed">
        {description}
      </Paragraph>
    </div>
  );
}
