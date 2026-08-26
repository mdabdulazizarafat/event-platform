import { redirect } from 'next/navigation';
import React from 'react';

export default function RedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  redirect(`/dashboard/events/${slug}`);
}
