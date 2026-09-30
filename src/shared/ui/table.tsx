// Thin antd Table wrapper: a toolbar (search on the left, actions on the right),
// an optional filter row, and the defaults every table here repeats. Layout
// only — no fetching, no business logic.

import { Card, Flex, Table as AntTable } from "antd"
import type { TableProps as AntTableProps } from "antd"
import type { ReactNode } from "react"

export interface TableProps<T> extends Omit<AntTableProps<T>, "title"> {
	/** Toolbar, left — a plain ReactNode, NOT antd's `(data) => ReactNode`. */
	title?: ReactNode
	/** Toolbar, right. Action buttons from widgets/actions. */
	extra?: ReactNode
	/** Filter row beneath the toolbar. */
	filters?: ReactNode
}

export const Table = <T extends object>({ title, extra, filters, ...rest }: TableProps<T>) => (
	<Card
		size={"small"}
		styles={{ body: { padding: 16 } }}
	>
		{title || extra || filters ? (
			<Flex
				vertical={true}
				gap={12}
				style={{ marginBottom: 16 }}
			>
				{title || extra ? (
					<Flex
						justify={"space-between"}
						align={"center"}
						gap={12}
						wrap={"wrap"}
					>
						<div>{title}</div>
						{extra ? (
							<Flex
								gap={8}
								wrap={"wrap"}
							>
								{extra}
							</Flex>
						) : null}
					</Flex>
				) : null}
				{filters ? (
					<Flex
						gap={12}
						wrap={"wrap"}
					>
						{filters}
					</Flex>
				) : null}
			</Flex>
		) : null}
		<AntTable<T>
			rowKey={"id"}
			scroll={{ x: "max-content" }}
			{...rest}
			pagination={rest.pagination === false ? false : { showSizeChanger: true, ...rest.pagination }}
		/>
	</Card>
)
