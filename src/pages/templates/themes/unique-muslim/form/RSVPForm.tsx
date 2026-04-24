import BaseRSVPForm from "@/pages/templates/form/RSVPForm";
import type { RSVPFormProps } from "@/pages/templates/form";

import { themeRsvpClassNames, themeRsvpLabels } from "./classNames";

const RSVPForm = (
  props: Omit<RSVPFormProps, "classNames" | "labels">,
) => (
  <BaseRSVPForm
    {...props}
    classNames={themeRsvpClassNames}
    labels={themeRsvpLabels}
  />
);

export default RSVPForm;
