import SetupGuideWidget from "./components/SetupGuideWidget";
import TourSpotlight from "./components/TourSpotlight";
import LiveRunDemoModal from "./modals/LiveRunDemoModal";

/** The setup-guide feature entry — mounts its always-on surfaces: the corner
 *  widget, the tour-spotlight overlay, and the live-run demo modal. Mounted once
 *  in AdminView (this feature has no route of its own). */
export default function SetupGuide() {
  return (
    <>
      <SetupGuideWidget />
      <TourSpotlight />
      <LiveRunDemoModal />
    </>
  );
}
