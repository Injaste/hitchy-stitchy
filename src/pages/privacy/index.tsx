import { Link } from "react-router-dom";
import BackLink from "@/components/custom/back-link";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <BackLink to="/" label="Back" />

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: May 2026</p>

        <p className="mb-8">
          Hitchy Stitchy ("we", "us") is currently in beta. This policy explains how we handle your
          personal data when you use our platform at{" "}
          <Link to="/" className="underline hover:text-muted-foreground">hitchystitchy.com</Link>.
        </p>

        <hr className="border-border mb-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Who We Are</h2>
          <p>
            Hitchy Stitchy is a wedding planning platform operated as an independent beta product,
            based in Singapore. For privacy matters, contact us at{" "}
            <a
              href="mailto:izhandanish@hitchystitchy.com"
              className="underline hover:text-muted-foreground"
            >
              izhandanish@hitchystitchy.com
            </a>
            .
          </p>
        </section>

        <hr className="border-border mb-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. What Data We Collect</h2>
          <p className="font-medium mb-2">If you create an account:</p>
          <ul className="list-disc list-inside mb-4 text-muted-foreground">
            <li>Email address</li>
            <li>Display name</li>
          </ul>
          <p className="font-medium mb-2">If you submit an RSVP:</p>
          <ul className="list-disc list-inside mb-4 text-muted-foreground">
            <li>Name</li>
            <li>Phone number</li>
            <li>Guest count</li>
            <li>Any message you choose to include</li>
          </ul>
          <p className="font-medium mb-2">If you use our platform:</p>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Basic usage data (pages visited, features used) for product improvement purposes only</li>
          </ul>
        </section>

        <hr className="border-border mb-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Why We Collect It</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium">Data</th>
                  <th className="text-left py-2 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4 align-top">Email, display name</td>
                  <td className="py-2">Account creation and authentication</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4 align-top">RSVP details (name, phone, guest count)</td>
                  <td className="py-2">To manage your event RSVP on behalf of the event organiser</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 align-top">Usage data</td>
                  <td className="py-2">To improve the platform during beta</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-muted-foreground">We collect only what is necessary for these purposes.</p>
        </section>

        <hr className="border-border mb-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Legal Basis</h2>
          <p>
            We process your data under the{" "}
            <strong>Personal Data Protection Act 2012 (Singapore) (PDPA)</strong>. We collect and
            use your personal data only for the purposes stated above, which are directly related to
            the service you are using.
          </p>
        </section>

        <hr className="border-border mb-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Who We Share Data With</h2>
          <p className="mb-4">
            We do not sell or share your personal data with third parties for marketing purposes.
          </p>
          <p className="mb-2">
            Your data may be processed by the following service providers solely to operate the
            platform:
          </p>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>
              <strong className="text-foreground">Supabase</strong> — database and authentication
              (data stored in their cloud infrastructure)
            </li>
          </ul>
        </section>

        <hr className="border-border mb-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. How Long We Keep Your Data</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Account data is retained for as long as your account is active</li>
            <li>
              RSVP data is retained for the duration of the event and a reasonable period after
            </li>
            <li>You may request deletion of your data at any time by contacting us</li>
          </ul>
        </section>

        <hr className="border-border mb-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Your Rights Under PDPA</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
            <li>
              <strong className="text-foreground">Access</strong> the personal data we hold about
              you
            </li>
            <li>
              <strong className="text-foreground">Correct</strong> any inaccurate data
            </li>
            <li>
              <strong className="text-foreground">Withdraw consent</strong> or request deletion of
              your data
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:izhandanish@hitchystitchy.com"
              className="underline hover:text-muted-foreground"
            >
              izhandanish@hitchystitchy.com
            </a>{" "}
            and we will respond within 10 business days.
          </p>
        </section>

        <hr className="border-border mb-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Beta Disclaimer</h2>
          <p>
            Hitchy Stitchy is currently in beta. Features may change and in exceptional
            circumstances, data may be reset. We will notify users in advance where possible.
          </p>
        </section>

        <hr className="border-border mb-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Changes to This Policy</h2>
          <p>
            We may update this policy as the platform evolves. We will notify users of material
            changes via email or a notice on the platform.
          </p>
        </section>

        <hr className="border-border mb-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. Contact</h2>
          <p className="mb-1">For any privacy-related questions or requests:</p>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Email:</strong>{" "}
            <a
              href="mailto:izhandanish@hitchystitchy.com"
              className="underline hover:text-foreground"
            >
              izhandanish@hitchystitchy.com
            </a>
          </p>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Platform:</strong>{" "}
            <Link to="/" className="underline hover:text-foreground">hitchystitchy.com</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
