
import React from "react";
type Props = React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; width?: number; height?: number; fill?: boolean; };
export default function Image({ src, alt, width, height, ...rest }: Props) {
  return <img src={src} alt={alt} width={width} height={height} {...rest} />;
}
