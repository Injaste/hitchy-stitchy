import Logo from "@/components/custom/logo";
import { Link } from "react-router-dom";

import Container from "@/components/custom/container";
import AccountMenu from "@/pages/account/components/AccountMenu";

const DashboardTopbar = () => {
  return (
    <header className="border-b border-border/60 px-4 md:px-6">
      <Container>
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo
              imageClassName="w-12 h-12 -mb-3"
              brandClassName="text-base font-bold"
              showBrand
              direction="row"
            />
          </Link>
          <AccountMenu />
        </div>
      </Container>
    </header>
  );
};

export default DashboardTopbar;
