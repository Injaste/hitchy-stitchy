import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FormDialogHeaderProps {
  title: React.ReactNode;
}

const FormDialogHeader = ({ title }: FormDialogHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
    </DialogHeader>
  );
};

export default FormDialogHeader;
