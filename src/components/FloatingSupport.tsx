'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const FloatingSupport: React.FC = () => {
  const { settings } = useStore();
  const waHref = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
    'سلام، برای انتخاب عطر بارگلو و استفاده از طرح ۱+۱ راهنمایی می‌خواستم.'
  )}`;

  return (
    <div className="floating-support">
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        aria-label="مشاوره واتساپ انتخاب عطر"
      >
        <MessageCircle size={17} />
        <span>مشاوره انتخاب عطر (واتساپ)</span>
      </a>
    </div>
  );
};
