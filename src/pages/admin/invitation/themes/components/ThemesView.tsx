import { type FC } from "react";
import { motion } from "framer-motion";
import { container, itemFadeUp } from "@/lib/animations";
import ThemeCard from "./ThemeCard";
import type { Template } from "../../types";

interface ThemesViewProps {
  templates: Template[];
}

const ThemesView: FC<ThemesViewProps> = ({ templates }) => (
  <motion.div
    variants={container}
    initial="hidden"
    animate="show"
    className="space-y-2"
  >
    {templates.map((template) => (
      <motion.div key={template.id} variants={itemFadeUp} className="w-full">
        <ThemeCard template={template} />
      </motion.div>
    ))}
  </motion.div>
);

export default ThemesView;
