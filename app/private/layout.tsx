import React from "react"
import { SideBarDashboard } from "./components/sidebar"
export default function DashboardLayout({ children }: {children: React.ReactNode}){
    return (
        <>
            <SideBarDashboard>
                {children}
            </SideBarDashboard>
        </>
    )
}