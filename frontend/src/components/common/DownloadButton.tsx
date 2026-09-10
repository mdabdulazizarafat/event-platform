'use client';
import React from 'react';

export default function DownloadButton({ 
  url, 
  filename, 
  children, 
  className 
}: { 
  url: string, 
  filename: string, 
  children: React.ReactNode, 
  className?: string 
}) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn('Direct download blocked by CORS, opening in new tab instead.');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <a href={url} onClick={handleDownload} className={className}>
      {children}
    </a>
  );
}
