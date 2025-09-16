import { useApiUrl, useCustom, useTranslate } from '@refinedev/core';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import dayjs, { Dayjs } from "dayjs";
import { Card, Empty, Spin } from 'antd';
import { useMemo } from 'react';
import { ITimeByTopic } from '../../interfaces/topic';

const toNumber = (val?: string | number | null) => {
    if (val == null) return 0;
    const n = typeof val === "number" ? val : Number(val);
    return Number.isFinite(n) ? n : 0;
};

const secondsToMinutes = (sec: number, digits = 2) =>
    Number.isFinite(sec) ? Number((sec / 60).toFixed(digits)) : 0;

export const BarChartAvgTimesByTopic = ({ range }: { range: [Dayjs, Dayjs] }) => {
    const API_URL = useApiUrl();
    const translate = useTranslate();
    const now = dayjs();



    const { data: countItem, isLoading, isError, error } = useCustom<ITimeByTopic[]>({
        url: `${API_URL}/analytic/avg_times_by_topic`,
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
                }
            ],
        }
    })

    const rows = (countItem?.data ?? []).map((r) => {
        const waitSec = toNumber(r.avg_wait_seconds);
        const serviceSec = toNumber(r.avg_service_seconds);
        return {
            name: r.topic.name_ru,
            waitMin: secondsToMinutes(waitSec, 2),
            serviceMin: secondsToMinutes(serviceSec, 2),
            // пригодится для tooltip:
            waitInterval: r.avg_wait_interval,
            serviceInterval: r.avg_service_interval,
            served: r.count,
        };
    });

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
        <Card title={
            translate("item.dashboard.avgTimesByTopic")
        }>

            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 280 }}>
                    <Spin />
                </div>
            ) : isError ? (
                <div style={{ padding: 16, color: "red" }}>
                    Ошибка: {String((error as any)?.message ?? "unknown")}
                </div>
            ) : rows.length === 0 ? (
                <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Empty description="Нет данных за выбранный период" />
                </div>
            ) : (
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            width={500}
                            height={300}
                            data={rows}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                scale="point"
                                padding={{ left: 10, right: 10 }}
                                tick={VerticalWrappedTick}
                                height={120}
                                interval={0}
                                tickMargin={8}
                            />
                            <YAxis
                                label={{ value: "минуты", angle: -90, position: "insideLeft" }}
                                allowDecimals />
                            <Tooltip
                                formatter={(v: any, name, props) => {
                                    // v — минутное значение, вернём "X мин"
                                    const label =
                                        name === "waitMin"
                                            ? "Ожидание"
                                            : name === "serviceMin"
                                                ? "Обслуживание"
                                                : name;
                                    return [`${Number(v).toFixed(2)} мин`, label];
                                }}
                                labelFormatter={(label, payload) => {
                                    const p = payload?.[0]?.payload;
                                    //return `${label}\nОжидание: ${p?.waitInterval}\nОбслуживание: ${p?.serviceInterval}`;
                                    return `${label}`;
                                }}
                                wrapperStyle={{ whiteSpace: "pre-line" }}
                            />
                            <Legend />

                            <Bar dataKey="waitMin" name="Ожидание" fill="#4F46E5" />
                            <Bar dataKey="serviceMin" name="Обслуживание" fill="#10B981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
}