import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser, isAuthenticated, signOut } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();

  async function handleSignOut() {
    "use server"; // Needed if you're using Next.js server actions
    await signOut();
    redirect("/sign-in");
  }

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between px-4 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100 text-3xl font-semibold">PrepWise</h2>
        </Link>

        <div className="flex items-center gap-4">
          <h5 className="text-primary-100 text-sm">Hi, {user?.name}</h5>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="px-3 py-1 text-sm rounded-md text-red-700 hover:bg-red-700/20 transition"
            >
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
