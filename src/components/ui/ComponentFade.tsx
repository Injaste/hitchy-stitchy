import { motion } from "framer-motion";

interface Props {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function ComponentFade({ id, children, className }: Props) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
