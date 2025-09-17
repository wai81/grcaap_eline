import React, { useEffect, useRef, useState } from "react";
import { useApiUrl, useCustom } from "@refinedev/core";
import { ITopicCount } from "../../interfaces/topic";
import SlotCounter from "react-slot-counter"

interface CounterTopicProps {
    id: number; // или number, если id — число
    onChange?: (value: number) => void;
}

export const CounterTopic: React.FC<CounterTopicProps> = ({ id, onChange }) => {
    const API_URL = useApiUrl();
    const [value, setValue] = useState<number>(0);

    // refetchInterval в миллисекундах (5000 = 5 секунд)
    const {
        query: {
            isLoading,
            error
        },

        result: data
    } = useCustom<ITopicCount>({
        url: `${API_URL}/topic/line/${id}`,
        method: "get",
        queryOptions: {
            refetchInterval: 5000
        },
    });

    // Храним предыдущий value, чтобы сравнивать и не делать лишних setState/onChange
    const prevValueRef = useRef<number>(value);
    // Обновляем локальное значение при получении данных
    useEffect(() => {
        const next = data?.data?.count_items ?? 0;

        // Обновляем локальный стейт только если значение реально поменялось
        if (prevValueRef.current !== next) {
            prevValueRef.current = next;
            setValue(next);
            // Уведомляем родителя только при реальном изменении
            onChange?.(next);
        }
    }, [data, onChange]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="counter">

            <SlotCounter
                value={value}
                animateOnVisible={{ triggerOnce: false, rootMargin: '0px 0px -100px 0px' }}

            />
        </div>
    );
};