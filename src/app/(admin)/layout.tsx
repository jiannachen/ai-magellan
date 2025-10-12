import { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理后台 - AI Magellan",
  description: "AI Magellan 管理后台",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}