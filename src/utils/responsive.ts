import { useEffect, useState } from 'react';

/**
 * Custom hook to detect if the screen is desktop size
 * @param breakpoint - The minimum width to consider as desktop (default: 768)
 * @returns boolean indicating if screen is desktop size
 */
export const useIsDesktop = (breakpoint = 768): boolean => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      if (typeof window !== 'undefined') {
        setIsDesktop(window.innerWidth >= breakpoint);
      }
    };

    // Initial check
    checkIsDesktop();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsDesktop);

    // Clean up
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, [breakpoint]);

  return isDesktop;
};

/**
 * Returns styles based on screen size
 * @param mobileStyles - Styles to apply on mobile screens
 * @param desktopStyles - Styles to apply on desktop screens
 * @param breakpoint - The minimum width to consider as desktop (default: 768)
 * @returns The appropriate styles object based on screen size
 */
export const getResponsiveStyles = (
  mobileStyles: any,
  desktopStyles: any,
  breakpoint = 768
): any => {
  if (typeof window !== 'undefined') {
    return window.innerWidth >= breakpoint ? desktopStyles : mobileStyles;
  }
  return mobileStyles; // Default to mobile on server-side
};
