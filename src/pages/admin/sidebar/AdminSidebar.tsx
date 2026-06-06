import { useEffect, useRef } from "react";
import { Sidebar, SidebarSeparator } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { BREAKPOINTS } from "@/lib/breakpoints";
import AdminSidebarHeader from "./components/AdminSidebarHeader";
import AdminSidebarContent from "./components/AdminSidebarContent";
import AdminSidebarFooter from "./components/AdminSidebarFooter";

const AdminSidebar = () => {
  const { setOpen } = useSidebar();
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.lg - 1}px)`);
    if (mql.matches) setOpenRef.current(false);
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setOpenRef.current(false);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <Sidebar collapsible="icon">
      <AdminSidebarHeader />
      <SidebarSeparator />
      <AdminSidebarContent />
      <SidebarSeparator />
      <AdminSidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
