import React from "react"
import SideBarClientWrapper from "./components/SideBarClientWrapper"

export default function DashboardLayout({ children }: {children: React.ReactNode}){
    return (
        <>
            <SideBarClientWrapper>
                {children}
            </SideBarClientWrapper>
        </>
    )
}