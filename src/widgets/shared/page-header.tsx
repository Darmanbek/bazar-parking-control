import { Flex, Typography } from "antd"
import type { FC, ReactNode } from "react"

const { Title, Text } = Typography

interface PageHeaderProps {
	title: ReactNode
	subtitle?: ReactNode
	/** Left of the title — a BackButton on detail pages. */
	prefix?: ReactNode
	extra?: ReactNode
}

export const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, prefix, extra }) => (
	<Flex
		justify={"space-between"}
		align={"center"}
		gap={16}
		wrap={"wrap"}
	>
		<Flex
			align={"center"}
			gap={14}
			wrap={"wrap"}
		>
			{prefix}
			<div>
				{typeof title === "string" ? (
					<Title
						level={3}
						style={{ margin: 0, letterSpacing: "-0.01em" }}
					>
						{title}
					</Title>
				) : (
					title
				)}
				{subtitle ? <Text type={"secondary"}>{subtitle}</Text> : null}
			</div>
		</Flex>
		{extra ? (
			<Flex
				gap={10}
				wrap={"wrap"}
				align={"center"}
			>
				{extra}
			</Flex>
		) : null}
	</Flex>
)
