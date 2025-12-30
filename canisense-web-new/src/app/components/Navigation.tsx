'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/observer', label: 'Observer' },
    { href: '/comprendre', label: 'Comprendre' },
    { href: '/historique', label: 'Historique' },
    { href: '/profil', label: 'Profil' },
  ];

  return (
    <nav className="bg-slate-900 p-3 shadow-md sm:p-4">
      <div className="container mx-auto flex justify-center space-x-4 sm:space-x-6">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded-md text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
