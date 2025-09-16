import { useApiUrl, useCustom, useInfiniteList, useTranslate } from "@refinedev/core";
import { useEffect, useState } from "react";
import { ITopic } from "../../interfaces/topic";

import { List as AntdList, Card, Typography } from "antd";
import './styles.css'
import { CounterTopic } from "./counter";
import { List } from "@refinedev/antd";

export const StatusTopis = ({ }) => {
    const API_URL = useApiUrl();
    const [time, setTime] = useState(new Date());
    const translate = useTranslate();
    const {
        query: {
            isLoading,
            fetchNextPage
        },

        result: {
            data: listTopics,
            hasNextPage
        }
    } = useInfiniteList<ITopic>({
        resource: "topic",
        config: {
            filters: [
                {
                    field: "is_active",
                    operator: "eq",
                    value: "true"
                },
            ],
            pagination: {
                pageSize: 50,
                current: 1,
            },
        }

    });
    const topics = listTopics?.pages.flatMap((page) => page.data) || [];

    useEffect(() => {
        // Функция обновления
        const interval = setInterval(() => {
            setTime(new Date());
        }, 5000); // каждые 5 секунд

        // Очистка при "размонтировании"
        return () => clearInterval(interval);
    }, []);

    return (
        <List title={false} >
            <Typography>
                {translate("dashboard.currentTime")} {time.toLocaleTimeString()}</Typography>
            <AntdList

                grid={{
                    gutter: 10, column: 7
                }}
                itemLayout="horizontal"
                dataSource={topics}
                renderItem={(item) => {
                    return (

                        <AntdList.Item>
                            <Card
                                style={{
                                    height: 120,
                                    // backgroundColor: "Highlight", color: "white" 
                                }}
                                size={"small"}
                                variant="borderless"
                                styles={{ body: { height: "100%", padding: 8 } }}
                            >
                                <div className="topic">
                                    <div className="label">{item.name_ru}</div>
                                    <CounterTopic id={item.id} />
                                </div>
                            </Card>
                        </AntdList.Item>
                    )
                }}
            />

        </List>
    );
}