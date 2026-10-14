import { ProfileView } from "@/components/profile";
import { getData } from "@/lib/data";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const data = await getData();
  return <ProfileView data={data} trader={data.you} />;
}
