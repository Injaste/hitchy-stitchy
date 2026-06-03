import { Skeleton } from "@/components/ui/skeleton";

import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { useMembersQuery } from "@/pages/admin/members/queries";
import ProfileForm from "./components/ProfileForm";

const Profile = () => {
  const { memberId } = useAdminStore();
  const { data: members, isLoading } = useMembersQuery();

  const self = members?.find((m) => m.id === memberId);

  if (isLoading || !self) return <Skeleton className="h-64 max-w-sm rounded-xl" />;

  return <ProfileForm key={self.updated_at} member={self} />;
};

export default Profile;
