import { getDefaultFilter, useApiUrl, useCustom, useTranslate } from '@refinedev/core';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import dayjs, { Dayjs } from "dayjs";
import { Card, Empty, Select, Space, Spin } from 'antd';
import { useMemo, useState } from 'react';
import { useSelect } from '@refinedev/antd';
import { ITopic } from '../../interfaces/topic';


interface IItemsCountByDate {
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

    const {
        query: {
            isLoading,
            isError,
            error
        },

        result
    } = useCustom<IItemsCountByDate[]>({
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

    const raw = result?.data as any;
    const list =
        Array.isArray(raw) ? raw :
            Array.isArray(raw?.data) ? raw.data :
                Array.isArray(raw?.items) ? raw.items :
                    [];


    // Нормализация: переводим create_at в миллисекунды epoch и сортируем
    // Нормализация и агрегация по ts (на случай дублей create_at)
    const points = useMemo(() => {
        const rows = list;
        const map = new Map<number, number>(); // ts -> sum(count)

        for (const row of rows) {
            const ts = dayjs(row.create_at).isValid() ? dayjs(row.create_at).valueOf() : NaN;
            if (!Number.isFinite(ts)) continue;
            const v = Number(row.count ?? 0);
            map.set(ts, (map.get(ts) ?? 0) + v);
        }

        return Array.from(map.entries())
            .map(([ts, value]) => ({ ts, value }))
            .sort((a, b) => a.ts - b.ts);
    }, [list]);

    const [state, setState] = useState<ZoomState>({
        left: "dataMin",
        right: "dataMax",
        refAreaLeft: null,
        refAreaRight: null,
        top: "dataMax+1",
        bottom: "dataMin-1",
    });

    const getAxisYDomain = (fromTs: number, toTs: number, offset: number) => {
        const slice = points.filter((d) => d.ts >= fromTs && d.ts <= toTs);
        if (slice.length === 0) return [0, 1];

        let bottom = Infinity;
        let top = -Infinity;
        for (const d of slice) {
            const v = Number(d.value ?? 0);
            if (v > top) top = v;
            if (v < bottom) bottom = v;
        }
        if (!Number.isFinite(bottom) || !Number.isFinite(top)) return [0, 1];
        // небольшие поля
        return [Math.max(0, Math.floor(bottom - offset)), Math.ceil(top + offset)];
    };

    const zoom = () => {
        let { refAreaLeft, refAreaRight } = state;

        if (refAreaLeft == null || refAreaRight == null || refAreaLeft === refAreaRight) {
            setState((prev) => ({ ...prev, refAreaLeft: null, refAreaRight: null }));
            return;
        }

        if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

        const [bottom, top] = getAxisYDomain(refAreaLeft, refAreaRight, 1);

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
            placeholder={translate("item.dashboard.selectTopic")}
            value={selectedTopicIds}
            onChange={(vals) => setSelectedTopicIds(vals)}
            options={topicsSelectProps.options}
        />
    );

    return (
        <Card title={
            translate("item.dashboard.countClientsByTime")

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
                                formatter={(value: number) => [value, "Количество"]}
                            />

                            <Line
                                yAxisId="1"
                                type="monotone"
                                dataKey="value"
                                stroke="#4F46E5"
                                animationDuration={300}
                                dot={false}
                            />

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