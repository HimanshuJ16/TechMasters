import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser, isAuthenticated, signOut } from "@/lib/actions/auth.action";

const Navbar = async () => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();

  async function handleSignOut() {
    "use server"; 
    await signOut();
    redirect("/sign-in");
  }
  
  return (
    <div>
      <nav className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
          <h2 className="text-primary-100 text-3xl font-semibold">PrepWise</h2>
        </Link>

        <div className="flex items-center gap-4">
          <h5 className="text-primary-100 text-sm">Hi, {user?.name}</h5>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm rounded-md text-red-700 hover:bg-red-700/10 transition sm:mt-0"
            >
              Sign Out
            </button>
          </form>
        </div>
      </nav>
    </div>
  )
}

export default Navbar