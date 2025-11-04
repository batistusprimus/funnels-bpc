'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navItems = [
  {
    title: 'Funnels',
    href: '/funnels',
  },
  {
    title: 'Leads',
    href: '/leads',
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error('Erreur de déconnexion');
      return;
    }

    toast.success('Déconnecté avec succès');
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/funnels" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">BPC Funnels</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground/80',
                  pathname?.startsWith(item.href)
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
}

