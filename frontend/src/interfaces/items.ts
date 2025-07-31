import { IItemGroupe } from "./item_group";
import { ITopic } from "./topic";

export interface IItemsEline {
    id: number;
    generated_number: string;
    item_created_at: string;
    topic_id: number;
    status_updated_at: string;
    item_status_id: number;
    modified_by: string;
    is_closed: boolean;
}

export interface IItems{
    id: number;
    generated_number: string;
    created_by: string,
    modified_by?: string;
    created_at: string;
    updated_at?: string;
    group:IItemGroupe;
    topic:ITopic
    
}