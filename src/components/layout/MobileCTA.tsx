import { IcoPhone } from '../ui/Icons'

export function MobileCTA() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/96 backdrop-blur-md border-t border-[#d9d6d0] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <a href="tel:+380976952473" className="flex items-center justify-center gap-2 bg-terra text-white font-display font-semibold text-[15px] py-3.5 rounded-lg w-full active:scale-95 transition-transform duration-150">
        <IcoPhone className="w-4 h-4" />
        Зателефонувати
      </a>
    </div>
  )
}