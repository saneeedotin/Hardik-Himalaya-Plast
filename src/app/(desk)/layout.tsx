import { MainLayout } from "@/components/layout/MainLayout";

export default function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
