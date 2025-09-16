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

export interface ITimeByTopic {
    topic: ITopic
    avg_wait_seconds: string,
    avg_wait_interval: string,
    avg_service_seconds: string,
    avg_service_interval: string,
    count: number
}