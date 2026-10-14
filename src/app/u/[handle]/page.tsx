import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile";
import { getData, traderByHandle } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const data = await getData();
  const trader = traderByHandle(data, handle);
  return { title: trader ? trader.name : "Trader" };
}

export default async function TraderPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const data = await getData();
  const trader = traderByHandle(data, handle);
  if (!trader) notFound();
  return <ProfileView data={data} trader={trader} />;
}
