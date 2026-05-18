import { useInvitationQuery } from "../queries";
import ConfigsView from "./components/ConfigsView";

const Config = () => {
  const { data: invitation } = useInvitationQuery();
  if (!invitation) return null;

  return <ConfigsView key={invitation.updated_at} invitation={invitation} />;
};

export default Config;
