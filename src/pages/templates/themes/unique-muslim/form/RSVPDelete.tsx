import BaseRSVPDelete from "@/pages/templates/form/RSVPDelete";
import type { RSVPDeleteProps } from "@/pages/templates/form";

import { themeRsvpDeleteClassNames, themeRsvpDeleteLabels } from "./classNames";

const RSVPDelete = (
  props: Omit<RSVPDeleteProps, "classNames" | "labels">,
) => (
  <BaseRSVPDelete
    {...props}
    classNames={themeRsvpDeleteClassNames}
    labels={themeRsvpDeleteLabels}
  />
);

export default RSVPDelete;
