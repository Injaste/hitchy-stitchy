import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DetailsTab from "./DetailsTab"
import AppearanceTab from "./AppearanceTab"
import RSVPTab from "./RSVPTab"
import ThemeTab from "./ThemeTab"

const EditorTabs = () => (
  <Tabs defaultValue="details" className="w-full">
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="details">Details</TabsTrigger>
      <TabsTrigger value="appearance">Appearance</TabsTrigger>
      <TabsTrigger value="rsvp">RSVP</TabsTrigger>
      <TabsTrigger value="theme">Theme</TabsTrigger>
    </TabsList>
    <TabsContent value="details" className="mt-5">
      <DetailsTab />
    </TabsContent>
    <TabsContent value="appearance" className="mt-5">
      <AppearanceTab />
    </TabsContent>
    <TabsContent value="rsvp" className="mt-5">
      <RSVPTab />
    </TabsContent>
    <TabsContent value="theme" className="mt-5">
      <ThemeTab />
    </TabsContent>
  </Tabs>
)

export default EditorTabs
