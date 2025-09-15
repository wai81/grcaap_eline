import { getDefaultFilter, useApiUrl, useCustom, useTranslate } from '@refinedev/core';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import dayjs, { Dayjs } from "dayjs";
import { Card, Empty, Select, Space, Spin } from 'antd';
import { useMemo, useState } from 'react';
import { useSelect } from '@refinedev/antd';
import { ITopic } from '../../interfaces/topic';


interface IItemsCountByDate {
    name: string,
    create_at: string,
    count: number
}

type ZoomState = {
    left: number | "dataMin";
    right: number | "dataMax";
    refAreaLeft: number | null;
    refAreaRight: number | null;
    top: number | "dataMax+1";
    bottom: number | "dataMin-1";
};

export const LineChartServicesCountByDaytetime = ({ range }: { range: [Dayjs, Dayjs] }) => {
    const API_URL = useApiUrl();
    const translate = useTranslate();

    const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);

    const { data: countItems, isLoading, isError, error } = useCustom<IItemsCountByDate[]>({
        url: `${API_URL}/analytic/count_created_items_by_topic`,
        method: 'get',
        config: {
            filters: [
                {
                    field: "created_at",
                    operator: "between",
                    value: [
                        range[0].startOf("day").format('YYYY-MM-DD HH:mm:ss'),
                        range[1].endOf("day").format('YYYY-MM-DD HH:mm:ss'),
                    ],
                },
                {
                    field: "topic_id",      // используйте точное поле бэкенда
                    operator: "in",
                    value: selectedTopicIds,
                }
            ],
        }
    })

    const rawData = countItems?.data ?? [];

    // Нормализация: переводим create_at в миллисекунды epoch и сортируем
    const { points, topics } = useMemo(() => {
        const byTs: Record<number, Record<string, number>> = {};
        const topicSet = new Set<string>();

        for (const row of rawData ?? []) {
            const ts = dayjs(row.create_at).isValid() ? dayjs(row.create_at).valueOf() : NaN;
            if (!Number.isFinite(ts)) continue;

            const topic = String(row.name ?? "").trim();
            if (!topic) continue;

            const count = Number(row.count ?? 0);
            if (!byTs[ts]) byTs[ts] = { ts };
            byTs[ts][topic] = (byTs[ts][topic] ?? 0) + count;
            topicSet.add(topic);
        }

        const pts = Object.values(byTs).sort((a, b) => a.ts - b.ts);
        const topicsArr = Array.from(topicSet);

        // Фильтрация точек, где все услуги == 0
        const filteredPts = pts.filter((p) => {
            let sum = 0;
            for (const t of topicsArr) sum += Number(p[t] ?? 0);
            return sum > 0;
        });

        return { points: filteredPts, topics: topicsArr };
    }, [rawData]);

    const [state, setState] = useState<ZoomState>({
        left: "dataMin",
        right: "dataMax",
        refAreaLeft: null,
        refAreaRight: null,
        top: "dataMax+1",
        bottom: "dataMin-1",
    });

    const getAxisYDomainAllSeries = (fromTs: number, toTs: number, series: string[], offset: number) => {
        const slice = points.filter((d: any) => d.ts >= fromTs && d.ts <= toTs);
        if (slice.length === 0) return [0, 1];

        let bottom = Infinity;
        let top = -Infinity;

        for (const d of slice) {
            for (const key of series) {
                const val = Number(d[key] ?? 0);
                if (val > top) top = val;
                if (val < bottom) bottom = val;
            }
        }

        if (!Number.isFinite(bottom) || !Number.isFinite(top)) return [0, 1];
        return [Math.floor(bottom - offset), Math.ceil(top + offset)];
    };

    const zoom = () => {
        let { refAreaLeft, refAreaRight } = state;

        if (refAreaLeft == null || refAreaRight == null || refAreaLeft === refAreaRight) {
            setState((prev) => ({ ...prev, refAreaLeft: null, refAreaRight: null }));
            return;
        }

        if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

        const [bottom, top] = getAxisYDomainAllSeries(refAreaLeft, refAreaRight, topics, 1);

        setState((prev) => ({
            ...prev,
            refAreaLeft: null,
            refAreaRight: null,
            left: refAreaLeft!,
            right: refAreaRight!,
            bottom,
            top,
        }));
    };

    const zoomOut = () => {
        setState((prev) => ({
            ...prev,
            refAreaLeft: null,
            refAreaRight: null,
            left: "dataMin",
            right: "dataMax",
            top: "dataMax+1",
            bottom: "dataMin-1",
        }));
    };

    const palette = [
        "#4F46E5", // Indigo 600
        "#10B981", // Emerald 500
        "#F59E0B", // Amber 500
        "#EF4444", // Red 500
        "#3B82F6", // Blue 500
        "#8B5CF6", // Violet 500
        "#14B8A6", // Teal 500
        "#F43F5E", // Rose 500
        "#22C55E", // Green 500
        "#A855F7", // Purple 500
        "#FB923C", // Orange 400
        "#0EA5E9", // Sky 500
        "#84CC16", // Lime 500
        "#DC2626", // Red 600
        "#6366F1", // Indigo 500
    ];

    const { selectProps: topicsSelectProps } = useSelect<ITopic>({
        resource: "topic",
        optionLabel: "name_ru",
        optionValue: "id",
        sorters: [{ field: "name_ru", order: "asc" }],
        //defaultValue: getDefaultFilter("topic_id", filters, "eq"),
        pagination: { pageSize: 50 },
    });

    const seletedServices = (
        <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 320, marginRight: 8 }}
            placeholder="Выберите услуги"
            value={selectedTopicIds}
            onChange={(vals) => setSelectedTopicIds(vals)}
            options={topicsSelectProps.options}
        />
    );

    return (
        <Card title={
            "Количество клиентов на дату"
            //translate("dashboard.countClietsByService")

        }
            extra={seletedServices}
        >

            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 280 }}>
                    <Spin />
                </div>
            ) : isError ? (
                <div style={{ padding: 16, color: "red" }}>
                    Ошибка: {String((error as any)?.message ?? "unknown")}
                </div>
            ) : points.length === 0 ? (
                <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Empty description="Нет данных за выбранный период" />
                </div>
            ) : (
                <div style={{ width: "100%", height: 350 }}>
                    <div className="highlight-bar-charts" style={{ userSelect: 'none', width: '100%', marginBottom: 8 }}>
                        <button type="button" className="btn update" onClick={zoomOut}>Zoom Out</button>
                    </div>

                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart
                            width={800}
                            height={250}
                            data={points}
                            onMouseDown={(e: any) => {
                                if (e && typeof e.activeLabel === "number") {
                                    setState((prev) => ({ ...prev, refAreaLeft: e.activeLabel as number }));
                                }
                            }}
                            onMouseMove={(e: any) => {
                                if (state.refAreaLeft != null && e && typeof e.activeLabel === "number") {
                                    setState((prev) => ({ ...prev, refAreaRight: e.activeLabel as number }));
                                }
                            }}
                            onMouseUp={zoom}
                        >

                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="ts"
                                type="category"
                                domain={[state.left as any, state.right as any]}
                                tickFormatter={(ts) => dayjs(ts).format("MM-DD HH:mm")}
                            />
                            <YAxis
                                allowDataOverflow
                                domain={[state.bottom as any, state.top as any]}
                                type="number"
                                yAxisId="1"
                            />
                            <Tooltip
                                labelFormatter={(ts) => dayjs(ts as number).format("YYYY-MM-DD HH:mm")}
                                formatter={(value: number, name: string) => {
                                    // name — это dataKey текущей линии, т.е. строка с названием услуги
                                    return [value, name]; // [значение, подпись серии]
                                }}
                            />
                            {topics.map((topic, idx) => (
                                <Line
                                    key={topic}
                                    yAxisId="1"
                                    type="monotone"
                                    dataKey={topic}
                                    //stroke="#8884d8"
                                    stroke={palette[idx % palette.length]}
                                    animationDuration={300}
                                    dot={false}
                                />
                            ))}

                            {state.refAreaLeft != null && state.refAreaRight != null ? (
                                <ReferenceArea yAxisId="1" x1={state.refAreaLeft} x2={state.refAreaRight} strokeOpacity={0.3} />
                            ) : null}
                        </LineChart>
                    </ResponsiveContainer>

                </div>
            )}
        </Card>
    );
}