import { type FC } from "react";
import AccessLegend from "./AccessLegend";

interface AccessTableFooterProps {
  colCount: number;
}

const AccessTableFooter: FC<AccessTableFooterProps> = ({ colCount }) => (
  <tfoot className="sticky bottom-0 z-10 bg-card">
    <tr className="border-t border-border/40 bg-muted/20">
      <td colSpan={colCount} className="px-5 py-3.5">
        <AccessLegend />
      </td>
    </tr>
  </tfoot>
);

export default AccessTableFooter;
