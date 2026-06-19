import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import MobileNav from '@/components/layout/mobile-nav';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import OnboardingOverlay from '@/components/dashboard/onboarding-overlay';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const sessionUser = session?.user;
  const userId = (sessionUser as any)?.id;

  // Check if onboarding is completed
  let dbUser = null;
  try {
    dbUser = userId 
      ? await prisma.user.findUnique({ 
          where: { id: userId },
          select: { name: true, age: true, occupation: true } 
        }) 
      : null;
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }

  const user = sessionUser ? {
    name: dbUser?.name || sessionUser.name,
    email: sessionUser.email,
    id: userId,
  } : null;

  const showOnboarding = dbUser && (dbUser.age === null || dbUser.occupation === null);

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} />
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileNav />
      {showOnboarding && user?.id && (
        <OnboardingOverlay userId={user.id} initialName={dbUser?.name || ''} />
      )}
    </div>
  );
}
