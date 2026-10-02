// dayjs keeps its plugins and locale in a global instance, so they are set up
// here once, as a side effect of main.tsx. Lower layers just import "dayjs".

import dayjs from "dayjs"
import "dayjs/locale/ru"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale("ru")
