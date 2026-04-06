import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarPlus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { itemScaleIn } from "@/lib/animations";

const EventEmpty = () => {
  return (
    <motion.div variants={itemScaleIn} initial="hidden" animate="show">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center text-center py-24 px-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <CalendarPlus className="w-9 h-9 text-primary" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-foreground mb-2">
            No events yet
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
            Your planning journey begins here. Create your first event and start
            building the day you've always imagined.
          </p>
          <Link to="/create-event">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create your first event
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EventEmpty;
