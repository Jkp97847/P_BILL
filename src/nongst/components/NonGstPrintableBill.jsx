import React from 'react';
import ClassicGstTheme from './themes/gst/ClassicGstTheme';
import ModernGstTheme from './themes/gst/ModernGstTheme';
import CompactGstTheme from './themes/gst/CompactGstTheme';
import MinimalistGstTheme from './themes/gst/MinimalistGstTheme';
import RoyalGstTheme from './themes/gst/RoyalGstTheme';
import EmeraldGstTheme from './themes/gst/EmeraldGstTheme';
import CrimsonGstTheme from './themes/gst/CrimsonGstTheme';
import OceanGstTheme from './themes/gst/OceanGstTheme';
import AmberGstTheme from './themes/gst/AmberGstTheme';
import SlateGstTheme from './themes/gst/SlateGstTheme';

export default function PrintableBill({ bill, settings, copyTitle }) {
  if (!bill) return null;

  const effectiveCopyTitle = copyTitle || bill._copyTitle || bill.copyTitle;
  const billWithCopy = effectiveCopyTitle ? { ...bill, _copyTitle: effectiveCopyTitle } : bill;

  const currentTheme = settings?.selectedTheme || 'classic';

  switch (currentTheme) {
    case 'modern':
      return <ModernGstTheme bill={billWithCopy} settings={settings} />;
    case 'compact':
      return <CompactGstTheme bill={billWithCopy} settings={settings} />;
    case 'minimalist':
      return <MinimalistGstTheme bill={billWithCopy} settings={settings} />;
    case 'royal':
      return <RoyalGstTheme bill={billWithCopy} settings={settings} />;
    case 'emerald':
      return <EmeraldGstTheme bill={billWithCopy} settings={settings} />;
    case 'crimson':
      return <CrimsonGstTheme bill={billWithCopy} settings={settings} />;
    case 'ocean':
      return <OceanGstTheme bill={billWithCopy} settings={settings} />;
    case 'amber':
      return <AmberGstTheme bill={billWithCopy} settings={settings} />;
    case 'slate':
      return <SlateGstTheme bill={billWithCopy} settings={settings} />;
    case 'classic':
    default:
      return <ClassicGstTheme bill={billWithCopy} settings={settings} />;
  }
}
