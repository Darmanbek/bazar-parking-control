// Excel export adapter over exceljs. Features describe WHAT goes into the sheet
// (columns + rows); how a workbook is built and handed to the browser stays
// here. exceljs is ~1 MB, so it is loaded on the first export, not with the app.

import { downloadBlob } from "src/shared/utils"

export interface ExcelColumn<T> {
	header: string
	width?: number
	value: (row: T) => string | number | null | undefined
}

interface ExportToExcelOptions<T> {
	filename: string
	sheet: string
	columns: ExcelColumn<T>[]
	rows: T[]
}

export const exportToExcel = async <T>({ filename, sheet, columns, rows }: ExportToExcelOptions<T>): Promise<void> => {
	const { Workbook } = await import("exceljs")
	const workbook = new Workbook()
	const ws = workbook.addWorksheet(sheet)

	ws.columns = columns.map((c, i) => ({ header: c.header, key: String(i), width: c.width ?? 18 }))
	for (const row of rows) {
		ws.addRow(Object.fromEntries(columns.map((c, i) => [String(i), c.value(row) ?? ""])))
	}

	const header = ws.getRow(1)
	header.font = { bold: true }
	header.alignment = { vertical: "middle" }
	ws.views = [{ state: "frozen", ySplit: 1 }]

	const buffer = await workbook.xlsx.writeBuffer()
	downloadBlob(
		new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
		filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`
	)
}
