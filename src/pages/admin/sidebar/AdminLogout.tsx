import { useLogoutMutation } from "@/auth/queries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const AdminLogout = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const { mutate: logout } = useLogoutMutation();

  const handleLogout = () => {
    // onSuccess is the second arg (callbacks) — passing it as the first arg
    // (mutation vars) silently drops it, leaving AuthGate to bounce to /login.
    // Admin logout returns to the public event page, per the dialog copy.
    logout(undefined, { onSuccess: () => navigate(`/${slug}`) });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => e.preventDefault()}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be returned to the event invitation page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} variant="destructive">
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminLogout;
