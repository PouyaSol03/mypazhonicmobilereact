import { FaBuilding, FaHome, FaStore, FaWarehouse, FaIndustry } from 'react-icons/fa'

export const PANEL_ICONS = [
  { value: 'building', label: 'ساختمان', Icon: FaBuilding },
  { value: 'home', label: 'خانه', Icon: FaHome },
  { value: 'store', label: 'فروشگاه', Icon: FaStore },
  { value: 'warehouse', label: 'انبار', Icon: FaWarehouse },
  { value: 'industry', label: 'صنعت', Icon: FaIndustry },
] as const

export type PanelIconValue = (typeof PANEL_ICONS)[number]['value']

export function getPanelIcon(iconKey: string | null | undefined) {
  const key = (iconKey ?? 'building').toLowerCase()
  return PANEL_ICONS.find((i) => i.value === key)?.Icon ?? FaBuilding
}
