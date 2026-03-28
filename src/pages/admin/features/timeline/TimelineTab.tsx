import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore } from "@/pages/admin/store/useAdminStore";
import { TimelineList } from "./TimelineList";

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TimelineTab({ activeTab, onTabChange }: Props) {
  const { day1Events, day2Events } = useAdminStore();

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="flex justify-center mb-6 md:mb-8">
        <TabsList className="flex w-full max-w-md bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="day1" className="flex-1 whitespace-nowrap text-xs md:text-sm">
            Day 1 (4th July)
          </TabsTrigger>
          <TabsTrigger value="day2" className="flex-1 whitespace-nowrap text-xs md:text-sm">
            Day 2 (5th July)
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="day1" className="mt-0 outline-none">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-primary mb-1 md:mb-2">
            Day 1: The Ceremony
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Plan: 7:00 AM – 7:00 PM | Main Event: 10:00 AM – 4:00 PM
          </p>
        </div>
        <TimelineList events={day1Events} day="day1" />
      </TabsContent>

      <TabsContent value="day2" className="mt-0 outline-none">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-primary mb-1 md:mb-2">
            Day 2: The Reception
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Plan: 10:00 AM – 10:00 PM | Main Event: 2:00 PM – 7:00 PM
          </p>
        </div>
        <TimelineList events={day2Events} day="day2" />
      </TabsContent>
    </Tabs>
  );
}
