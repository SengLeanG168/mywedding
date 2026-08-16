export default function PublicInvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full bg-black flex justify-center">
      <div className="w-full max-w-[430px] bg-background relative overflow-x-hidden min-h-[100dvh] shadow-2xl">
        {children}
      </div>
    </div>
  );
}
