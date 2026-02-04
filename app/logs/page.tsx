'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/common';
import { LogsViewerContent } from './LogsViewerContent';

export default function LogsViewerPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading logs..." />}>
      <LogsViewerContent />
    </Suspense>
  );
}
