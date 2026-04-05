import { Link } from 'react-router-dom'
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

interface NavItemProps {
  icon: React.ElementType
  label: string
  to: string
  isActive: boolean
  badge?: React.ReactNode
}

const NavItem = ({ icon: Icon, label, to, isActive, badge }: NavItemProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={to}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
          {badge}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export default NavItem
