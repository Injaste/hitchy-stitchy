import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormDialogHeaderProps {
  title: React.ReactNode;
  description: React.ReactNode;
}

const FormDialogHeader = ({ title, description }: FormDialogHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
};

export default FormDialogHeader;
