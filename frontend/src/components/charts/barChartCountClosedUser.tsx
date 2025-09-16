import { useApiUrl, useCustom, useTranslate } from '@refinedev/core';
import {
  Bar, BarChart, ResponsiveContainer, XAxis,
  YAxis, Legend, Tooltip
} from 'recharts';
import dayjs, { Dayjs } from "dayjs";
import { Card, Empty, Select, Spin, Tag } from 'antd';
import { count } from 'console';
import { useSelect } from '@refinedev/antd';
import { ITopic } from '../../interfaces/topic';
import { useMemo, useState } from 'react';


interface IItemsCountCloset {
  modified_by: string,
  count: number
}

export const BarChartCountClosetItemsAtUser = ({ range }: { range: [Dayjs, Dayjs] }) => {
  const API_URL = useApiUrl();
  const translate = useTranslate();
  const now = dayjs();

  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  // Безопасно формируем массив фильтров:
  // когда ничего не выбрано — не отправляем фильтр topic_id вообще
  const filters = useMemo(() => {
    const base = [
      {
        field: "created_at",
        operator: "between",
        value: [
          range[0].startOf("day").format('YYYY-MM-DD HH:mm:ss'),
          range[1].endOf("day").format('YYYY-MM-DD HH:mm:ss'),
        ],
      },
    ] as any[];

    if (selectedTopicIds.length > 0) {
      base.push({
        field: "topic_id",
        operator: "in",
        value: selectedTopicIds,
      });
    }
    return base;
  }, [range, selectedTopicIds]);

  const {
    query: {
      isLoading,
      isError,
      error
    },

    result
  } = useCustom<IItemsCountCloset>({
    url: `${API_URL}/analytic/count_complete_item_user`,
    method: 'get',
    config: { filters }
  })

  const raw = result?.data as any;
  const list =
    Array.isArray(raw) ? raw :
      Array.isArray(raw?.data) ? raw.data :
        Array.isArray(raw?.items) ? raw.items :
          [];
  // Сортируем по count убыванию, защищаемся от некорректных значений
  const data = useMemo<IItemsCountCloset[]>(() => {
    const rows = list;
    return [...rows]
      .map(r => ({
        modified_by: r.modified_by ?? "",
        count: Number.isFinite(Number(r.count)) ? Number(r.count) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [list]);

  const { selectProps: topicsSelectProps } = useSelect<ITopic>({
    resource: "topic",
    optionLabel: "name_ru",
    optionValue: "id",
    sorters: [{ field: "name_ru", order: "asc" }],
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
      translate("item.dashboard.countClientsAcceptedEmploee")
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
      ) : data.length === 0 ? (
        <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Empty description="Нет данных за выбранный период" />
        </div>
      ) : (
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
                left: 80,
              }}
            >
              <XAxis type="number" />
              <YAxis
                dataKey="modified_by"
                type="category"
                scale="band"
                padding={{ top: 0, bottom: 0 }} // для вертикального layout эффективнее top/bottom 
                width={100}
                tickMargin={0}
              />
              <Tooltip
                formatter={(val: any) => [val, "Количество"]}
                labelFormatter={(label) => `Сотрудник: ${label}`}
              />
              <Bar dataKey="count" barSize={14} fill="#8884d8" />
            </BarChart>

          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}