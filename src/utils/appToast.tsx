import toast from 'react-hot-toast'
import { AppToastCard, type AppToastTone } from '../components/feedback/AppToastCard'

type AppToastContent = {
  title: string
  message?: string
  duration?: number
  id?: string
}

function show(tone: AppToastTone, content: AppToastContent) {
  return toast.custom(
    (item) => <AppToastCard item={item} tone={tone} title={content.title} message={content.message} />,
    {
      id: content.id,
      duration: content.duration ?? (tone === 'loading' ? Infinity : tone === 'error' ? 5000 : 3800),
    },
  )
}

export const appToast = {
  success: (content: AppToastContent) => show('success', content),
  error: (content: AppToastContent) => show('error', content),
  warning: (content: AppToastContent) => show('warning', content),
  info: (content: AppToastContent) => show('info', content),
  loading: (content: AppToastContent) => show('loading', content),
  dismiss: (id?: string) => toast.dismiss(id),
}
