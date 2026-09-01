import React from 'react';
import { Stack } from 'expo-router';
import { CrmBottomLayout } from '@/components/crmBottomLayout';

export default function CRMLayout() {
  return (
    <CrmBottomLayout>
      <Stack screenOptions={{ headerShown: false }} />
    </CrmBottomLayout>
  );
}