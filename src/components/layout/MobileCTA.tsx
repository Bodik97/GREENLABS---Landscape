import { useLocation } from 'react-router-dom'
import { IcoPhone } from '../ui/Icons'

/**
 * Смуга внизу на телефоні — єдине місце, яке видно завжди.
 *
 * Тому заклик тут має відповідати сторінці. На сторінці вакансій людині
 * пропонувати «Зателефонувати» — це віддавати найпомітніше місце чужій дії:
 * вона прийшла влаштовуватись, а не замовляти сад. Там смуга веде до форми
 * відгуку, а дзвінок лишається поруч окремою кнопкою — багатьом майстрам
 * подзвонити швидше, ніж друкувати.
 *
 * На решті сайту все як було: одна широка кнопка «Зателефонувати».
 */
export function MobileCTA() {
  const { pathname } = useLocation()
  const наВакансіях = pathname.startsWith('/robota')

  const дзвінок =
    'flex items-center justify-center gap-2 bg-terra text-white font-display font-semibold text-[15px] py-3.5 rounded-lg active:scale-95 transition-transform duration-150'

  return (
    <div
      data-from={наВакансіях ? 'Смуга внизу — вакансії' : 'Смуга внизу'}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/96 backdrop-blur-md border-t border-[#d9d6d0] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      {наВакансіях ? (
        <div className="flex gap-2.5">
          {/* Звичайний якір, а не <Link>: людина вже на цій сторінці, і якщо
              адреса вже закінчується на #vidhuk, маршрутизатор не помітить
              зміни й нічого не прокрутить. Браузер із якорем справляється
              щоразу, а відступ під шапку задає scroll-mt на самій секції. */}
          <a href="#vidhuk" className={`${дзвінок} flex-1`}>
            Залишити відгук
          </a>
          {/* Телефон значком: він тут другий за важливістю, але прибирати його
              не можна — це другий живий канал, яким користуються. */}
          <a
            href="tel:+380976952473"
            aria-label="Зателефонувати"
            className="flex items-center justify-center w-14 shrink-0 rounded-lg border border-[#d9d6d0] bg-white text-green active:scale-95 transition-transform duration-150"
          >
            <IcoPhone className="w-5 h-5" />
          </a>
        </div>
      ) : (
        <a href="tel:+380976952473" className={`${дзвінок} w-full`}>
          <IcoPhone className="w-4 h-4" />
          Зателефонувати
        </a>
      )}
    </div>
  )
}
