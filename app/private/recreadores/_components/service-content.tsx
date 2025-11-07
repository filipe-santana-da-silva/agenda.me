import { getAllRecreadores } from "../_data-access/get-all-recreators";
import { RecreatorList } from "./services-list";

interface ServiceContentProps {
    userId: string;
}

export async function ServiceContent({ userId } : ServiceContentProps){
    const services = await getAllRecreadores({ userId: userId })
    
    return (
        <>
            <RecreatorList recreadores={services.data || []}/>
        </>
    )
}