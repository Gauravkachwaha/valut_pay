import { useRef } from 'react'
import { Link, Outlet } from 'react-router-dom'
import {
  HomeIcon,
  BanknotesIcon,
  DocumentPlusIcon,
  CreditCardIcon,
  ChartBarIcon,
  BellIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import Chatbot from '../common/Chatbot'
import PageFade from '../common/PageFade'
import SidebarShell from './SidebarShell'

const NAV_ITEMS = [
  { to: '/borrower/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { to: '/borrower/loans', label: 'My Loans', Icon: BanknotesIcon, end: true },
  { to: '/borrower/loans/apply', label: 'Apply Loan', Icon: DocumentPlusIcon },
  { to: '/borrower/pay-emi', label: 'Pay EMI', Icon: CreditCardIcon },
  { to: '/borrower/credit', label: 'Credit Score', Icon: ChartBarIcon },
  { to: '/borrower/notifications', label: 'Notifications', Icon: BellIcon },
  { to: '/borrower/payments', label: 'Payment History', Icon: ClipboardDocumentListIcon },
]

const TITLES = {
  '/borrower/dashboard': 'Dashboard',
  '/borrower/loans': 'My Loans',
  '/borrower/loans/apply': 'Apply Loan',
  '/borrower/pay-emi': 'Pay EMI',
  '/borrower/credit': 'Credit Score',
  '/borrower/notifications': 'Notifications',
  '/borrower/payments': 'Payment History',
}

export default function BorrowerLayout() {
  const chatbotRef = useRef(null)

  return (
    <>
      <SidebarShell
        navItems={NAV_ITEMS}
        titles={TITLES}
        subtitle="Premium Finance"
        fallbackRole="Borrower"
        topBarRight={
          <Link
            to="/borrower/notifications"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cred-border bg-cred-elevated transition-all hover:border-cred-gold lg:h-10 lg:w-10"
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5 text-cred-text-secondary" />
          </Link>
        }
      >
        <PageFade>
          <Outlet context={{ openChat: () => chatbotRef.current?.open() }} />
        </PageFade>
      </SidebarShell>
      <Chatbot ref={chatbotRef} />
    </>
  )
}
