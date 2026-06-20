import React from "react";
import {
  WindowsLogo as WindowsLogoIcon,
  AppleLogo as AppleLogoIcon,
  LinuxLogo as LinuxLogoIcon,
  DownloadSimple as DownloadSimpleIcon,
} from "@phosphor-icons/react";
import { OS } from "@/lib/types";

export default function OsGlyph({ os, size = 16 }: { os: OS; size?: number }) {
  if (os === "windows") return <WindowsLogoIcon size={size} weight="fill" />;
  if (os === "mac") return <AppleLogoIcon size={size} weight="fill" />;
  if (os === "linux") return <LinuxLogoIcon size={size} weight="fill" />;
  return <DownloadSimpleIcon size={size} weight="bold" />;
}
