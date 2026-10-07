// dayjs keeps its plugins and locale in a global instance, so they are set up
// here once, as a side effect of main.tsx. Lower layers just import "dayjs".
// The active locale follows the interface language (app/providers/antd-provider).

import dayjs from "dayjs"
import "dayjs/locale/ru"
import "dayjs/locale/uz-latn"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

dayjs.extend(utc)
dayjs.extend(timezone)
