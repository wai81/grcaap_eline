export interface ITopic {
    id: number;
    name_ru: string;
    is_active:boolean;
}

export interface ITopicCount {
    topic_id: number;
    name: string;
    count_items: number
}