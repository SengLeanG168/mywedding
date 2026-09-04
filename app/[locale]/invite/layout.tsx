export default function PublicInvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-[100dvh] w-full bg-black flex justify-center text-foreground">
      <div className="w-full max-w-[430px] bg-background text-foreground relative overflow-x-hidden min-h-[100dvh] shadow-2xl">
        {children}
      </div>
    </div>
  );
}
