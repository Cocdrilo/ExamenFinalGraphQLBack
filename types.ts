import { ObjectId, OptionalId } from "mongodb";

export type Restaurant_Model = OptionalId<{
    name : string,
    address : string,
    city : string,
    country : string,
    telephone_number : string
    timezone : string
}>

