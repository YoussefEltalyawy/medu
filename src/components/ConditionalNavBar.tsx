'use client';

import { usePathname } from 'next/navigation';
import NavBar from './NavBar';

const ConditionalNavBar = () => {
  const pathname = usePathname();

  // Hide navbar during onboarding
  if (pathname?.startsWith('/onboarding')) {
    return null;
  }

  return <NavBar />;
};

export default ConditionalNavBar;
