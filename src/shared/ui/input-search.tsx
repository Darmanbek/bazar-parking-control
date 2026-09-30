// Debounced text input. Pure UI: it holds the keystrokes and emits the settled
// value; where the value goes is the caller's decision.
//
// Controlled both ways: an external `value` change (Back/Forward over a
// URL-backed filter) resyncs the visible text. The resync happens during render,
// comparing against the last debounced emission, so the caller echoing back what
// this component just emitted never clobbers keystrokes typed since.

import { Input } from "antd"
import type { FC, ReactNode } from "react"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

interface InputSearchProps {
	value?: string
	/** Called with the settled value; `undefined` once the box is empty. */
	onChange: (value: string | undefined) => void
	placeholder?: string
	prefix?: ReactNode
	width?: number | string
	delay?: number
}

export const InputSearch: FC<InputSearchProps> = ({
	value,
	onChange,
	placeholder,
	prefix,
	width = 280,
	delay = 400,
}) => {
	const [local, setLocal] = useState(value ?? "")
	const [debounced] = useDebounce(local, delay)

	const [prevValue, setPrevValue] = useState(value)
	if (value !== prevValue) {
		setPrevValue(value)
		if ((value ?? "") !== debounced) setLocal(value ?? "")
	}

	useEffect(() => {
		if (debounced === (value ?? "")) return
		onChange(debounced || undefined)
		// Only a settled keystroke may drive this; `onChange` is a fresh closure.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debounced])

	return (
		<Input
			allowClear={true}
			prefix={prefix}
			placeholder={placeholder}
			value={local}
			onChange={(e) => setLocal(e.target.value)}
			style={{ width, maxWidth: "100%" }}
		/>
	)
}
