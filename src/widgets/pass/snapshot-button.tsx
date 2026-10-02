// A visit's snapshot (§7.11). Fetched only when the inspector opens it — one
// click, one audited read (A16) — with the token, as a Blob shown through an
// object URL that is revoked when the modal closes. Never cached or stored
// (§5.5). A 404 reads "unavailable" with no reason given (A18).

import { CameraOutlined } from "@ant-design/icons"
import { Button, Flex, Modal, Result, Spin, Tooltip } from "antd"
import type { FC, ReactNode } from "react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { fetchBlob } from "src/shared/api"
import { errorCode, errorCodeText } from "src/shared/lib"

interface SnapshotButtonProps {
	passId: number | null | undefined
	/** Only for a candidate's visit: the same `date` the candidates screen uses. */
	date?: string
	title: ReactNode
	disabledReason?: string
}

type SnapshotState = { kind: "loading" } | { kind: "ready"; url: string } | { kind: "error"; message: string }

const SnapshotView: FC<{ passId: number; date?: string }> = ({ passId, date }) => {
	const { t } = useTranslation()
	const [state, setState] = useState<SnapshotState>({ kind: "loading" })

	useEffect(() => {
		let url: string | undefined
		let alive = true
		fetchBlob("/passes/{id}/image", { path: { id: passId }, query: date ? { date } : {} })
			.then((blob) => {
				url = URL.createObjectURL(blob)
				if (alive) setState({ kind: "ready", url })
				else URL.revokeObjectURL(url)
			})
			.catch((error: unknown) => {
				// 404 is deliberately vague: the server does not say why (A18).
				const text = errorCodeText(errorCode(error)) ?? t("errors.snapshot_unavailable")
				if (alive) setState({ kind: "error", message: text })
			})
		return () => {
			alive = false
			if (url) URL.revokeObjectURL(url)
		}
	}, [passId, date, t])

	if (state.kind === "loading") {
		return (
			<Flex
				justify={"center"}
				align={"center"}
				style={{ minHeight: 240 }}
			>
				<Spin size={"large"} />
			</Flex>
		)
	}
	if (state.kind === "error") {
		return (
			<Result
				status={"warning"}
				title={state.message}
			/>
		)
	}
	return (
		<img
			src={state.url}
			alt={""}
			style={{ width: "100%", borderRadius: 10, display: "block" }}
		/>
	)
}

export const SnapshotButton: FC<SnapshotButtonProps> = ({ passId, date, title, disabledReason }) => {
	const { t } = useTranslation()
	const [open, setOpen] = useState(false)
	const disabled = passId === null || passId === undefined

	return (
		<>
			<Tooltip title={disabled ? disabledReason : t("day.snapshot")}>
				<Button
					icon={<CameraOutlined />}
					disabled={disabled}
					onClick={(e) => {
						e.stopPropagation()
						setOpen(true)
					}}
					aria-label={t("day.snapshot")}
				/>
			</Tooltip>
			<Modal
				open={open}
				title={title}
				footer={null}
				width={760}
				onCancel={() => setOpen(false)}
				destroyOnHidden={true}
			>
				{open && !disabled ? (
					<SnapshotView
						passId={passId}
						date={date}
					/>
				) : null}
			</Modal>
		</>
	)
}
