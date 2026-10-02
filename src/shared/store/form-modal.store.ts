// Global add/edit modal coordinator (antd CRUD recipe). A button calls
// `setParams(params, formKey)` to open the matching form; the form reads its
// params from here and FormModal closes itself once the mutation succeeds — so
// forms take no open/close props. `formKey` tells several modals on one page apart.

import { create } from "zustand"

interface FormDevtoolsState {
	open: boolean
	key: string
	params: unknown
	setParams: (params: unknown, formKey?: string) => void
	close: () => void
	getParams: <T>() => T | null
}

export const useFormDevtoolsStore = create<FormDevtoolsState>((set, get) => ({
	open: false,
	key: "main",
	params: null,
	setParams: (params, formKey = "main") => set({ open: true, params, key: formKey }),
	close: () => set({ open: false, params: null }),
	getParams: <T>() => get().params as T | null,
}))

/** Typed reader for one modal: is it open, and with what. */
export const useFormModal = <T>(formKey = "main") => {
	const open = useFormDevtoolsStore((s) => s.open && s.key === formKey)
	const params = useFormDevtoolsStore((s) => (s.key === formKey ? (s.params as T | null) : null))
	const close = useFormDevtoolsStore((s) => s.close)
	return { open, params, close }
}
