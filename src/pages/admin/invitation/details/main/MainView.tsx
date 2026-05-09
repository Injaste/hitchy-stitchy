import { type FC } from "react";
import type { DetailsDraft } from "../../types";
import MainCoupleCard from "./MainCoupleCard";
import MainEventCard from "./MainEventCard";
import MainVenueCard from "./MainVenueCard";

interface MainViewProps {
  draft: DetailsDraft;
  onUpdate: (patch: Partial<DetailsDraft>) => void;
}

const MainView: FC<MainViewProps> = ({ draft, onUpdate }) => (
  <div className="space-y-3 bg-primary/20 rounded-lg p-3">
    <MainCoupleCard draft={draft} onUpdate={onUpdate} />
    <div className="grid xl:grid-cols-2 gap-3">
      <MainEventCard draft={draft} onUpdate={onUpdate} />
      <MainVenueCard draft={draft} onUpdate={onUpdate} />
    </div>
  </div>
);

export default MainView;
