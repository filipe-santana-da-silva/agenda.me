
import { getTimesClinic } from "../_data-access/get-times-clinic"
import { AppointmentsList } from "./appointment-list"

export async function Appointment({ userId } : {userId: string}){
    const { times, userId: id } = await getTimesClinic({ userId: userId})

    return (
        <AppointmentsList times={times}/>
    )
}