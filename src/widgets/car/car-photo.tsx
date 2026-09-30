// A camera snapshot: a thumbnail in a table row, full size on click.

import { Image } from "antd"
import type { FC } from "react"

interface CarPhotoProps {
	src: string
	alt: string
	width?: number | string
	height?: number | string
}

export const CarPhoto: FC<CarPhotoProps> = ({ src, alt, width = 96, height = 60 }) => (
	<Image
		src={src}
		alt={alt}
		width={width}
		height={height}
		loading={"lazy"}
		placeholder={true}
		style={{ objectFit: "cover", borderRadius: 8 }}
		// A click on the thumbnail is a preview, never a row click.
		onClick={(e) => e.stopPropagation()}
	/>
)
