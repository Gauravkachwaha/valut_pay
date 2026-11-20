import { Outlet } from 'react-router-dom'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import PageFade from '../common/PageFade'
import SidebarShell from './SidebarShell'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { to: '/admin/loans', label: 'Pending Loans', Icon: ClipboardDocumentListIcon },
  { to: '/admin/analytics', label: 'Analytics', Icon: ChartBarIcon },
  { to: '/admin/fraud', label: 'Fraud Detection', Icon: ShieldExclamationIcon },
  { to: '/admin/reports', label: 'Reports', Icon: DocumentTextIcon },
]

const TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/loans': 'Pending Loans',
  '/admin/analytics': 'Analytics',
  '/admin/fraud': 'Fraud Detection',
  '/admin/reports': 'Reports',
}

export default function AdminLayout() {
  return (
    <SidebarShell
      navItems={NAV_ITEMS}
      titles={TITLES}
      subtitle="Admin Portal"
      fallbackTitle="Admin"
      fallbackRole="Admin"
    >
      <PageFade>
        <Outlet />
      </PageFade>
    </SidebarShell>
  )
}
