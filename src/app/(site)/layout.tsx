import { AssistantBubble } from "@/components/chat/assistant-bubble";
import { MobileQuickActions } from "@/components/layout/mobile-quick-actions";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main className="pb-24 lg:pb-0">{children}</main>
      <SiteFooter />
      <MobileQuickActions />
      <AssistantBubble />
    </>
  );
}
