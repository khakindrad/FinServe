'use client';

import Link from 'next/link';

export default function Footer() {
  return (
      <footer className="text-center py-6 bg-white border-t border-gray-200 text-gray-500 text-sm">
        © {new Date().getFullYear()} FinServe. All rights reserved.
      </footer>
  );
}
