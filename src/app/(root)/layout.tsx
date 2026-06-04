import FloatingActionButton from "@/components/custom/floating-action-button";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <FloatingActionButton />
    </div>
  );
}
