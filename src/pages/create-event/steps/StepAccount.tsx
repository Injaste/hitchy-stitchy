import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface AccountData {
  fullName: string;
  email: string;
  password: string;
}

interface Props {
  defaultValues?: Partial<AccountData>;
  onNext: (data: AccountData) => void;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export function StepAccount({ defaultValues, onNext }: Props) {
  const [fullName, setFullName] = useState(defaultValues?.fullName ?? "");
  const [email, setEmail] = useState(defaultValues?.email ?? "");
  const [password, setPassword] = useState(defaultValues?.password ?? "");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (fullName.trim().length < 2) next.fullName = "Name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext({ fullName: fullName.trim(), email: email.trim(), password });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Danish Izhan"
          autoFocus
        />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="pr-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirm"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className="pr-12"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
      </div>

      <Button onClick={handleNext} className="w-full mt-2">
        Next
      </Button>
    </div>
  );
}
