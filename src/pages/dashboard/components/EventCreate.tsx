import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cardHover, itemFadeUp } from "@/lib/animations";

const CreateEvent = () => {
  return (
    <motion.div variants={itemFadeUp}>
      <Link to="/create-event">
        <motion.div
          whileHover={cardHover}
          className="h-full min-h-48 rounded-xl border-2 border-dashed border-border hover:border-primary/30 bg-transparent hover:bg-primary/3 transition-colors flex flex-col items-center justify-center gap-3 p-6 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full border border-dashed border-muted-foreground/30 group-hover:border-primary/40 flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium text-center">
            Plan another event
          </p>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default CreateEvent;
