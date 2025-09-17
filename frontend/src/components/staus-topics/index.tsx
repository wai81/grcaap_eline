import { useApiUrl, useCustom, useInfiniteList, useTranslate } from "@refinedev/core";
import { useEffect, useRef, useState } from "react";
import { ITopic } from "../../interfaces/topic";

import { List as AntdList, Card, theme, Typography } from "antd";
import './styles.css'
import { CounterTopic } from "./counter";
import { List } from "@refinedev/antd";

export const StatusTopis = () => {
    const [time, setTime] = useState(new Date());
    const countersRef = useRef<Record<number, number>>({});
    const { token } = theme.useToken();
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
        filters: [
            {
                field: "is_active",
                operator: "eq",
                value: "true"
            },
        ],
        pagination: {
            pageSize: 100,
            currentPage: 1,
        },
    }

    );
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
            <AntdList
                grid={{
                    gutter: 10, column: 7
                }}
                itemLayout="horizontal"
                dataSource={topics}
                renderItem={(item) => {
                    const count = countersRef.current[item.id] ?? 0;

                    // Логика выбора палитры
                    const isSucces = count > 0;
                    const isError = count > 9;
                    const isWarning = !isError && count > 5;

                    const bg = isError
                        ? token.colorErrorBg
                        : isWarning
                            ? token.colorWarningBg
                            : isSucces
                                ? token.colorSuccessBg
                                : undefined


                    const border = isError
                        ? token.colorError
                        : isWarning
                            ? token.colorWarning
                            : isSucces
                                ? token.colorSuccess
                                : undefined

                    const text = isError
                        ? token.colorErrorText
                        : isWarning
                            ? token.colorWarningText
                            : isSucces
                                ? token.colorSuccessText
                                : undefined
                    return (

                        <AntdList.Item>
                            <Card
                                style={{
                                    height: 120,
                                    backgroundColor: bg,
                                    borderColor: border,
                                    color: text,
                                }}
                                size={"small"}
                                variant="borderless"
                                styles={{ body: { height: "100%", padding: 8 } }}
                            >
                                <div className="topic">
                                    <div className="label">{item.name_ru}</div>
                                    <CounterTopic id={item.id}
                                        onChange={(value) => {
                                            countersRef.current[item.id] = value;
                                            // форсируем перерендер текущего компонента
                                            setTime(new Date()); // дергаем setTime для обновления
                                        }}
                                    />
                                </div>
                            </Card>
                        </AntdList.Item>
                    )
                }}
            />

        </List>
    );
}