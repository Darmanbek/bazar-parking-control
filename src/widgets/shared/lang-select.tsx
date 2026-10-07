// Interface language switch. The change goes to the i18next singleton; app/i18n
// persists it, and the antd/dayjs locale and the API's Accept-Language follow.

import { GlobalOutlined } from "@ant-design/icons"
import { Button, Dropdown } from "antd"
import type { FC } from "react"
import { useTranslation } from "react-i18next"
import { isLang, LANG_LABELS, LANG_SHORT, LANGS } from "src/shared/config"

interface LangSelectProps {
	/** On the graphite header the trigger needs light text. */
	onDark?: boolean
}

export const LangSelect: FC<LangSelectProps> = ({ onDark }) => {
	const { t, i18n } = useTranslation()
	const current = isLang(i18n.language) ? i18n.language : undefined

	return (
		<Dropdown
			trigger={["click"]}
			menu={{
				selectable: true,
				selectedKeys: current ? [current] : [],
				items: LANGS.map((lng) => ({ key: lng, label: LANG_LABELS[lng] })),
				onClick: ({ key }) => void i18n.changeLanguage(key),
			}}
		>
			<Button
				type={onDark ? "text" : "default"}
				icon={<GlobalOutlined />}
				aria-label={t("common.language")}
				style={onDark ? { color: "rgba(255,255,255,0.86)" } : undefined}
			>
				{current ? LANG_SHORT[current] : null}
			</Button>
		</Dropdown>
	)
}
