import { 
  LayoutDashboard, 
  Bookmark, 
  Upload,
  Settings,
  LucideIcon
} from 'lucide-react'

export interface ProfileNavigationItem {
  name: string
  labelKey: string
  href: string
  icon: LucideIcon
  descriptionKey: string
}

export const profileNavigationConfig: ProfileNavigationItem[] = [
  {
    name: 'Dashboard',
    labelKey: 'dashboard',
    href: '/profile/dashboard',
    icon: LayoutDashboard,
    descriptionKey: 'dashboard_desc'
  },
  {
    name: 'Favorites',
    labelKey: 'favorites',
    href: '/profile/favorites',
    icon: Bookmark,
    descriptionKey: 'favorites_desc'
  },
  {
    name: 'Submissions',
    labelKey: 'submissions',
    href: '/profile/submissions',
    icon: Upload,
    descriptionKey: 'submissions_desc'
  },
  {
    name: 'Settings',
    labelKey: 'settings',
    href: '/profile/info',
    icon: Settings,
    descriptionKey: 'settings_desc'
  }
]