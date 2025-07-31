import React from "react";
import { useApiUrl, useCustom } from "@refinedev/core";
import { ITopicCount } from "../../interfaces/topic";
import SlotCounter from "react-slot-counter"

interface CounterTopicProps {
    id: number; // или number, если id — число
}

export const CounterTopic = ({ id }: CounterTopicProps) => {
    const API_URL = useApiUrl();

    // refetchInterval в миллисекундах (5000 = 5 секунд)
    const { data, isLoading, error } = useCustom<ITopicCount>({
        url: `${API_URL}/topic/line/${id}`,
        method: "get",
        queryOptions: {
            refetchInterval: 5000
        },
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="counter">

            <SlotCounter value={data?.data.count_items}
                animateOnVisible={{ triggerOnce: false, rootMargin: '0px 0px -100px 0px' }}

            />
        </div>
    );
};