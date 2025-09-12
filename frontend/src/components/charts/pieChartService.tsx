import { useApiUrl, useCustom, useTranslate } from '@refinedev/core';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import dayjs, { Dayjs } from "dayjs";
import { Card, DatePicker, Empty, Space, Spin } from 'antd';
import { useMemo, useState } from 'react';

const { RangePicker } = DatePicker;

export const PieChartServices = ({ range }: { range: [Dayjs, Dayjs] }) => {
    const API_URL = useApiUrl();
    const translate = useTranslate();
    const now = dayjs();



    const { data: countItemByService, isLoading, isError, error } = useCustom({
        url: `${API_URL}/status/grop_by_services`,
        method: 'get',
        config: {
            filters: [
                {
                    field: "created_at",
                    operator: "between",
                    value: [
                        //     now.startOf("week").format('YYYY-MM-DD HH:mm:ss'),
                        //     now.endOf("day").format('YYYY-MM-DD HH:mm:ss'),
                        range[0].startOf("day").format('YYYY-MM-DD HH:mm:ss'),
                        range[1].endOf("day").format('YYYY-MM-DD HH:mm:ss'),
                    ],
                }
            ]
        }
    })

    const raw = countItemByService?.data ?? [];
    const activeOnly = (raw ?? []).filter((item: any) => item?.topic?.is_active);

    const chartData = useMemo(() => {
        if (!Array.isArray(activeOnly)) return [];

        return activeOnly.map((item: any) => ({
            name: item?.topic?.name_ru ?? "—",
            value: Number(item?.count ?? 0),
            // можно сохранить доп. поля для тултипа
            id: item?.topic?.id,
        }));
    }, [raw]);

    const RADIAN = Math.PI / 180;
    const COLORS = [
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

    // Настраиваемый рендерер тиков с поворотом и переносом
    const VerticalWrappedTick = (props: any) => {
        const { x, y, payload } = props;
        const text = String(payload?.value ?? "");
        const fontSize = 12;

        // Максимальная "визуальная" ширина строки в пикселях (подберите под ваши отступы и ширину столбца)
        const maxLineWidth = 120;

        // Грубая оценка ширины символа: 0.6 * fontSize
        const charWidth = 0.6 * fontSize;

        // Wrap по словам
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let current = "";

        words.forEach((w, i) => {
            const candidate = current ? `${current} ${w}` : w;
            const candidateWidth = candidate.length * charWidth;
            if (candidateWidth <= maxLineWidth) {
                current = candidate;
            } else {
                if (current) lines.push(current);
                // если слово само длиннее строки — режем по символам
                if (w.length * charWidth > maxLineWidth) {
                    let part = "";
                    for (const ch of w) {
                        if ((part + ch).length * charWidth <= maxLineWidth) {
                            part += ch;
                        } else {
                            lines.push(part);
                            part = ch;
                        }
                    }
                    current = part;
                } else {
                    current = w;
                }
            }
            if (i === words.length - 1 && current) {
                lines.push(current);
            }
        });

        // Отступ между строками
        const lineHeight = fontSize + 2;

        return (
            <g transform={`translate(${x},${y})`}>
                {/* Вращаем на -90 градусов вокруг точки тика */}
                <text transform="rotate(-60)" textAnchor="end" fill="#334155" fontSize={fontSize}>
                    {lines.map((line, idx) => (
                        // dy: 0 для первой строки и смещение вниз для следующих
                        <tspan key={idx} x={0} dy={idx === 0 ? 0 : lineHeight}>
                            {line}
                        </tspan>
                    ))}
                </text>
            </g>
        );
    };

    return (
        <Card title={translate("dashboard.countClietsByService")}>

            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 280 }}>
                    <Spin />
                </div>
            ) : isError ? (
                <div style={{ padding: 16, color: "red" }}>
                    Ошибка: {String((error as any)?.message ?? "unknown")}
                </div>
            ) : chartData.length === 0 ? (
                <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Empty description="Нет данных за выбранный период" />
                </div>
            ) : (
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            width={500}
                            height={300}
                            data={chartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <XAxis
                                dataKey="name"
                                scale="point"
                                padding={{ left: 10, right: 10 }}
                                tick={VerticalWrappedTick}
                                height={120}
                                interval={0}
                                tickMargin={8}
                            />
                            <YAxis />
                            <Tooltip />
                            {/* <Legend /> */}
                            <CartesianGrid strokeDasharray="3 3" />
                            <Bar dataKey="value">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] ?? "#6366F1"} />
                                ))}
                            </Bar>
                        </BarChart>
                        {/* <PieChart width={400} height={400}>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={renderCustomizedLabel}
                                label={({ name, value }) => `${name}: ${value}`}
                                outerRadius={110}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart> */}
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
}