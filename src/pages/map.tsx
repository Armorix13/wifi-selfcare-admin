import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/main-layout';
import OldMap from '@/components/maps/OldMap';

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const selectedOLTId = searchParams.get('oltId');

  return (
    <MainLayout title="OLT Map View">
      <div className="h-[calc(100vh-4rem)] w-full">
        <OldMap 
          isFullscreen={false}
          selectedOLTId={selectedOLTId || undefined}
        />
      </div>
    </MainLayout>
  );
}
