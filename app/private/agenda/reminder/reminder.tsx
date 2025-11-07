
import { getReminders } from "../_data-access/get-reminder"
import { ReminderList } from "./reminder-content";

export async function Reminders({ userId }: { userId: string}){
    const reminders = await getReminders({ userId: userId})
    
    return(
        <ReminderList reminder={reminders}/>
    )
}