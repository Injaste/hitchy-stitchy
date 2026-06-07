import { useEffect } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";
import { NotebookPen } from "lucide-react";
import Logo from "@/components/custom/logo";

import { FieldGroup } from "@/components/ui/field";
import {
  FormCard,
  FormHeader,
  FormBody,
  FormFooter,
  FormError,
  TextField,
  PasswordField,
} from "@/components/custom/form";
import { container, itemFadeUp, itemScaleIn } from "@/lib/animations";
import BackLink from "@/components/custom/back-link";

import { useLoginMutation } from "./queries";
import { useIsAuthenticatedQuery } from "../queries";
import { signInSchema, type SignInFormValues } from "./types";

// A post-login destination is only honored if it's a clean same-origin path.
// `redirect` comes from a user-controllable query param, so without this an
// attacker could craft /login?redirect=https://evil.com and bounce a freshly
// authenticated user off-site (open redirect → phishing). Reject anything that
// isn't a relative path on our own origin — absolute URLs, //protocol-relative,
// and backslash tricks that the URL parser resolves to another host.
function isSafeRedirect(raw: string | null): raw is string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return false;
  try {
    return (
      new URL(raw, window.location.origin).origin === window.location.origin
    );
  } catch {
    return false;
  }
}

// The vetted destination: the param when it's safe, otherwise the dashboard.
function safeRedirect(raw: string | null): string {
  if (!isSafeRedirect(raw)) return "/dashboard";
  const url = new URL(raw, window.location.origin);
  return url.pathname + url.search + url.hash;
}

// ─── Form hook ────────────────────────────────────────────────────────────────

interface UseSignInFormOpts {
  onSubmit: (value: SignInFormValues) => Promise<void>;
}

const useSignInForm = ({ onSubmit }: UseSignInFormOpts) =>
  useForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onSubmit: signInSchema,
      onChange: signInSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: isAuthenticated } = useIsAuthenticatedQuery();
  const rawRedirect = searchParams.get("redirect");
  const {
    mutateAsync: login,
    isPending,
    error: mutationError,
    reset: resetMutation,
  } = useLoginMutation();

  const form = useSignInForm({
    onSubmit: async (value) => {
      resetMutation();
      await login(value);
      navigate(safeRedirect(rawRedirect), { replace: true });
    },
  });

  // Scrub an unsafe/garbage ?redirect out of the address bar on arrival, so a
  // crafted /login?redirect=https://evil.com never sits there and the user only
  // ever sees an honest destination. Valid same-origin paths are kept intact so
  // the bounce-to-login flow still remembers where they were headed on refresh.
  useEffect(() => {
    if (rawRedirect !== null && !isSafeRedirect(rawRedirect)) {
      searchParams.delete("redirect");
      setSearchParams(searchParams, { replace: true });
    }
  }, [rawRedirect, searchParams, setSearchParams]);

  // Already signed in (landed on /login with a live session)? Skip the form and
  // go straight to where they were headed — no point showing a login screen.
  if (isAuthenticated) {
    return <Navigate to={safeRedirect(rawRedirect)} replace />;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen flex justify-center items-center px-4"
    >
      <div className="w-full max-w-sm">
        <motion.div
          variants={itemScaleIn}
          className="flex items-center flex-col mb-6"
        >
          <Logo className="mb-4" imageClassName="w-24 h-24 -mb-6" />
          <h1 className="text-2xl font-bold text-primary">Hitchy Stitchy</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            A Wedding Planning Suite
          </p>
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <FormCard
            form={form}
            isPending={isPending}
            isError={Boolean(mutationError)}
          >
            <FormHeader
              icon={<NotebookPen className="size-4" />}
              title="Lets get into planning!"
            />

            <FormBody>
              <FieldGroup>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                />

                <PasswordField
                  name="password"
                  label="Password"
                  placeholder="Password"
                />

                <div className="-mt-1 text-right">
                  <Link
                    to="/reset-password"
                    className="text-xs text-muted-foreground hover:text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <FormError error={mutationError} />
              </FieldGroup>
            </FormBody>

            <FormFooter submitLabel="Sign in" fullWidth />
          </FormCard>
        </motion.div>

        <motion.div variants={itemFadeUp} className="text-center mt-6">
          <BackLink to="/" label="Back to Home" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SignIn;
