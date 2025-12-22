import React from "react"
import SideBarClientWrapper from "./components/SideBarClientWrapper"
import { TourGuide } from "@/components/tour-guide"

export default function DashboardLayout({ children }: {children: React.ReactNode}){
    return (
        <>
            <SideBarClientWrapper>
                {children}
            </SideBarClientWrapper>
            <TourGuide />
        </>
    )
}