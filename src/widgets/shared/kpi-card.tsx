// A counter tile. Optionally a toggle: the dashboard uses the three tiles as the
// status filter of the table below, so a pressed tile says which slice is shown.

import { Card, Flex, Skeleton, Typography } from "antd"
import type { FC, ReactNode } from "react"
import { useToken } from "src/shared/hooks"
import { CountUp } from "src/shared/ui"

const { Text } = Typography

interface KpiCardProps {
	title: string
	value: number | undefined
	icon?: ReactNode
	/** Accent for the icon, the side bar and — when active — the border. */
	color: string
	footer?: ReactNode
	active?: boolean
	onClick?: () => void
}

export const KpiCard: FC<KpiCardProps> = ({ title, value, icon, color, footer, active, onClick }) => {
	const { token } = useToken()
	const clickable = Boolean(onClick)

	return (
		<Card
			hoverable={clickable}
			role={clickable ? "button" : undefined}
			aria-pressed={clickable ? Boolean(active) : undefined}
			tabIndex={clickable ? 0 : undefined}
			onClick={onClick}
			onKeyDown={
				clickable
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault()
								onClick?.()
							}
						}
					: undefined
			}
			styles={{ body: { padding: "20px 22px" } }}
			style={{
				height: "100%",
				position: "relative",
				overflow: "hidden",
				outline: active ? `2px solid ${color}` : undefined,
				outlineOffset: -1,
			}}
		>
			<div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: color }} />
			<Flex
				justify={"space-between"}
				align={"flex-start"}
				gap={12}
			>
				<div style={{ minWidth: 0 }}>
					<Text
						type={"secondary"}
						style={{ fontSize: 14, fontWeight: 500 }}
					>
						{title}
					</Text>
					<div
						className={"mono-num"}
						style={{ fontWeight: 700, fontSize: 40, lineHeight: 1.1, marginTop: 10, color: token.colorTextHeading }}
					>
						{value === undefined ? (
							<Skeleton.Button
								active={true}
								size={"large"}
								style={{ width: 96 }}
							/>
						) : (
							<CountUp value={value} />
						)}
					</div>
				</div>
				{icon ? (
					<span
						style={{
							width: 46,
							height: 46,
							borderRadius: 12,
							background: `color-mix(in srgb, ${color} 14%, transparent)`,
							color,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 22,
							flexShrink: 0,
						}}
					>
						{icon}
					</span>
				) : null}
			</Flex>
			{footer ? <div style={{ marginTop: 10 }}>{footer}</div> : null}
		</Card>
	)
}
