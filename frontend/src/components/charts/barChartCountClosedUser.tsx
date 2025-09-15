import { useApiUrl, useTranslate } from '@refinedev/core';
import {
  Bar, BarChart, ResponsiveContainer, XAxis,
  YAxis, Legend, Tooltip
} from 'recharts';
import dayjs, { Dayjs } from "dayjs";
import { Card } from 'antd';
import { count } from 'console';

const data = [
  {
    name: 'Амельяньчик',
    count: 590,
    pv: 800,
    amt: 1400,
  },
  {
    name: 'Сергеева',
    count: 868,
    pv: 967,
    amt: 1506,
  },
  {
    name: 'Будовская',
    count: 1397,
    pv: 1098,
    amt: 989,
  },
  {
    name: 'Ничипор',
    count: 1480,
    pv: 1200,
    amt: 1228,
  },
  {
    name: 'Лысенко',
    count: 1520,
    pv: 1108,
    amt: 1100,
  },
  {
    name: 'Мельникова',
    count: 1400,
    pv: 680,
    amt: 1700,
  },
  {
    name: 'Амельяньчик1',
    count: 590,
    pv: 800,
    amt: 1400,
  },
  {
    name: 'Сергеева1',
    count: 868,
    pv: 967,
    amt: 1506,
  },
  {
    name: 'Будовская1',
    count: 1397,
    pv: 1098,
    amt: 989,
  },
  {
    name: 'Ничипор1',
    count: 1480,
    pv: 1200,
    amt: 1228,
  },
  {
    name: 'Лысенко1',
    count: 1520,
    pv: 1108,
    amt: 1100,
  },
  {
    name: 'Мельникова1',
    count: 1400,
    pv: 680,
    amt: 1700,
  },
];

export const BarChartCountClosetItemsAtUser = ({ range }: { range: [Dayjs, Dayjs] }) => {
  const API_URL = useApiUrl();
  const translate = useTranslate();
  const now = dayjs();

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
  // const VerticalWrappedTick = (props: any) => {
  //     const { x, y, payload } = props;
  //     const text = String(payload?.value ?? "");
  //     const fontSize = 12;

  //     // Максимальная "визуальная" ширина строки в пикселях (подберите под ваши отступы и ширину столбца)
  //     const maxLineWidth = 120;

  //     // Грубая оценка ширины символа: 0.6 * fontSize
  //     const charWidth = 0.6 * fontSize;

  //     // Wrap по словам
  //     const words = text.split(/\s+/);
  //     const lines: string[] = [];
  //     let current = "";

  //     words.forEach((w, i) => {
  //         const candidate = current ? `${current} ${w}` : w;
  //         const candidateWidth = candidate.length * charWidth;
  //         if (candidateWidth <= maxLineWidth) {
  //             current = candidate;
  //         } else {
  //             if (current) lines.push(current);
  //             // если слово само длиннее строки — режем по символам
  //             if (w.length * charWidth > maxLineWidth) {
  //                 let part = "";
  //                 for (const ch of w) {
  //                     if ((part + ch).length * charWidth <= maxLineWidth) {
  //                         part += ch;
  //                     } else {
  //                         lines.push(part);
  //                         part = ch;
  //                     }
  //                 }
  //                 current = part;
  //             } else {
  //                 current = w;
  //             }
  //         }
  //         if (i === words.length - 1 && current) {
  //             lines.push(current);
  //         }
  //     });

  //     // Отступ между строками
  //     const lineHeight = fontSize + 2;

  //     return (
  //         <g transform={`translate(${x},${y})`}>
  //             {/* Вращаем на -90 градусов вокруг точки тика */}
  //             <text transform="rotate(-60)" textAnchor="end" fill="#334155" fontSize={fontSize}>
  //                 {lines.map((line, idx) => (
  //                     // dy: 0 для первой строки и смещение вниз для следующих
  //                     <tspan key={idx} x={0} dy={idx === 0 ? 0 : lineHeight}>
  //                         {line}
  //                     </tspan>
  //                 ))}
  //             </text>
  //         </g>
  //     );
  // };

  return (
    <Card title={"Количесво принятых клиентов сотрудником"
      //translate("dashboard.countClietsByService")
    }>

      {/* {isLoading ? (
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
            ) : ( */}
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            width={150}
            height={40}
            data={data}
            margin={{
              top: 8,
              right: 8,
              bottom: 8,
              left: 60,
            }}
          >
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              scale="band"
              padding={{ top: 0, bottom: 0 }} // для вертикального layout эффективнее top/bottom 
              width={60}
              tickMargin={0}
            />
            <Tooltip />
            <Bar dataKey="count" barSize={8} fill="#8884d8" />
          </BarChart>

        </ResponsiveContainer>
      </div>
      {/* )} */}
    </Card>
  );
}