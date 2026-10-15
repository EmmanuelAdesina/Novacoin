import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile";
import { getData, traderByHandle } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const trader = traderByHandle(handle);
  return { title: trader ? trader.name : "Person" };
}

export default function TraderPage({ params }: { params: Promise<{ handle: string }> }) {
  return <TraderPageInner params={params} />;
}

async function TraderPageInner({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const trader = traderByHandle(handle);
  if (!trader) notFound();
  return <ProfileView trader={trader} />;
}
