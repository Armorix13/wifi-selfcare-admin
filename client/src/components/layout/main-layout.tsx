import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title={title} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
