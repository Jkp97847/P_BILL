import React from 'react';
import ClassicGstTheme from './themes/gst/ClassicGstTheme';
import ModernGstTheme from './themes/gst/ModernGstTheme';
import CompactGstTheme from './themes/gst/CompactGstTheme';
import RoyalGstTheme from './themes/gst/RoyalGstTheme';
import EmeraldGstTheme from './themes/gst/EmeraldGstTheme';
import MinimalistGstTheme from './themes/gst/MinimalistGstTheme';
import CrimsonGstTheme from './themes/gst/CrimsonGstTheme';
import OceanGstTheme from './themes/gst/OceanGstTheme';
import AmberGstTheme from './themes/gst/AmberGstTheme';
import SlateGstTheme from './themes/gst/SlateGstTheme';

export default function PrintableBill({ bill, settings }) {
  if (!bill) return null;

  // Determine which theme to use (from bill.theme or settings.selectedTheme or fallback to classic)
  const themeName = bill.theme || settings?.selectedTheme || 'classic';

  switch (themeName) {
    case 'modern':
      return <ModernGstTheme bill={bill} settings={settings} />;
    case 'compact':
      return <CompactGstTheme bill={bill} settings={settings} />;
    case 'royal':
      return <RoyalGstTheme bill={bill} settings={settings} />;
    case 'emerald':
      return <EmeraldGstTheme bill={bill} settings={settings} />;
    case 'minimal':
      return <MinimalistGstTheme bill={bill} settings={settings} />;
    case 'crimson':
      return <CrimsonGstTheme bill={bill} settings={settings} />;
    case 'ocean':
      return <OceanGstTheme bill={bill} settings={settings} />;
    case 'amber':
      return <AmberGstTheme bill={bill} settings={settings} />;
    case 'slate':
      return <SlateGstTheme bill={bill} settings={settings} />;
    case 'classic':
    default:
      return <ClassicGstTheme bill={bill} settings={settings} />;
  }
}
