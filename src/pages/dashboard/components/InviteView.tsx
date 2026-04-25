import { memo, type FC } from "react";
import { motion } from "framer-motion";

import { container } from "@/lib/animations";
import type { PendingInvite } from "../types";
import InviteCard from "./InviteCard";

interface InviteViewProps {
  invites: PendingInvite[];
}

const InviteView: FC<InviteViewProps> = ({ invites }) => (
  <div className="space-y-4">
    <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
      Pending invitations
    </p>
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {invites.map((invite) => (
        <InviteCard key={invite.id} invite={invite} />
      ))}
    </motion.div>
  </div>
);

export default memo(InviteView);
