"use client"

import React from "react"
import { SideBarDashboard } from "./sidebar"

export default function SideBarClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SideBarDashboard>
      {children}
    </SideBarDashboard>
  )
}
