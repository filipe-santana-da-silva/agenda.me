import { getAllContractors } from "../_data-access/getAllContractors";
import { ContractorList } from "./service-list";

interface ServiceContentProps {
    userId: string;
}

export async function ServiceContent({ userId } : ServiceContentProps){
    const services = await getAllContractors({ userId: userId })
    
    return (
        <>
            <ContractorList contractors={services.data || []}/>
        </>
    )
}