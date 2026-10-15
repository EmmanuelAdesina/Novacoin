import { ProfileView } from "@/components/profile";
import { getData } from "@/lib/data";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  const data = getData();
  return <ProfileView trader={data.you} />;
}
