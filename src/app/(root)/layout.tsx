import { ReactNode } from "react";

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="root-layout">
      {children}
    </div>
  );
};

export default Layout;
 