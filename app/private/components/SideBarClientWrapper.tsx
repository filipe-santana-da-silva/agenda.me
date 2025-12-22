"use client"

import React from "react"
import { SideBarDashboard } from "./sidebar-new"

export default function SideBarClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SideBarDashboard>
      {children}
    </SideBarDashboard>
  )
}
