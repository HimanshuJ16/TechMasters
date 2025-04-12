import Link from "next/link";
import Image from "next/image";
import { ReactNode, use } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser, isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");
  const user = await getCurrentUser();

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100">PrepWise</h2>
        </Link>
        <h5 className="text-primary-100 text-[1rem]">Hi, {user?.name}</h5>
      </nav>

      {children}
    </div>
  );
};

export default Layout;
