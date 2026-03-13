'use client';

import Link from 'next/link';
import { ComponentProps } from 'react';

export default function NavigationLink(props: ComponentProps<typeof Link>) {
  return <Link {...props} />;
}
