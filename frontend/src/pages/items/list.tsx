import { SearchOutlined } from "@ant-design/icons";
import { IItems } from "../../interfaces/items";
import { CreateButton, DateField, FilterDropdown, getDefaultSortOrder, List, rangePickerFilterMapper, useSelect, useTable } from "@refinedev/antd";
import { getDefaultFilter, HttpError, useTranslate } from "@refinedev/core";
import { Card, Col, DatePicker, Input, Row, Select, Space, Table, theme, Typography } from "antd";
import { PaginationTotal } from "../../components/paginationTotal";
import dayjs, { Dayjs } from "dayjs";
import { ITopic } from "../../interfaces/topic";
import { BarChartServicesCount } from "../../components/charts/barChartServiceCount";
import { useState } from "react";
import { LineChartServicesCountByDaytetime } from "../../components/charts/lineChartServiceCountAtCreateDateTime";
import { BarChartCountClosetItemsAtUser } from "../../components/charts/barChartCountClosedUser"
const { RangePicker } = DatePicker;

export const ItemsList = () => {
    const translate = useTranslate();
    const { token } = theme.useToken();
    const now = dayjs();

    const [range, setRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf("month"),
        dayjs().endOf("day"),
    ]);

    // We'll use pass `tableProps` to the `<Table />` component,
    // This will manage the data, pagination, filters and sorters for us.
    const { tableProps, sorters, filters, setFilters } = useTable<IItems, HttpError>({
        sorters: { initial: [{ field: "created_at", order: "desc" }] },
        filters: {
            initial: [
                {
                    field: "created_at",
                    operator: "between",
                    value: [
                        // now.startOf("week").format('YYYY-MM-DD HH:mm:ss'),
                        // now.endOf("day").format('YYYY-MM-DD HH:mm:ss'),
                        range[0].startOf("day").format('YYYY-MM-DD HH:mm:ss'),
                        range[1].endOf("day").format('YYYY-MM-DD HH:mm:ss'),
                    ],
                }
            ]
        },
        pagination: {
            pageSize: 10
        }

    });

    const { selectProps: topicsSelectProps, query: queryResult, } = useSelect<ITopic>({
        resource: "topic",
        optionLabel: "name_ru",
        optionValue: "id",
        sorters: [{ field: "name_ru", order: "asc" }],
        //defaultValue: getDefaultFilter("organization_id", filters, "in"),
        defaultValue: getDefaultFilter("topic_id", filters, "eq"),
        pagination: {
            pageSize: 50,
        },
    });

    // 4) Обработчик изменения периода: меняем состояние и обновляем фильтры таблицы
    const onRangeChange = (vals: null | [Dayjs, Dayjs]) => {
        if (!vals || !vals[0] || !vals[1]) return;
        const start = vals[0].startOf("day");
        const end = vals[1].endOf("day");
        setRange([start, end]);

        // Обновляем фильтры таблицы, не теряя остальные фильтры
        setFilters([
            // сохраняем другие активные фильтры из текущего состояния
            // ...((filters ?? []).filter((f) => f.field !== "created_at") as any[]),
            {
                field: "created_at",
                operator: "between",
                value: [
                    start.format("YYYY-MM-DD HH:mm:ss"),
                    end.format("YYYY-MM-DD HH:mm:ss"),
                ],
            },
        ]);
    };

    return (


        <List
            headerButtons={
                <Space wrap>
                    <RangePicker
                        allowClear={false}
                        value={range}
                        onChange={onRangeChange}
                        presets={[
                            { label: "Сегодня", value: [dayjs().startOf("day"), dayjs().endOf("day")] },
                            { label: "Вчера", value: [dayjs().subtract(1, "day").startOf("day"), dayjs().subtract(1, "day").endOf("day")] },
                            { label: "Текущая неделя", value: [dayjs().startOf("week"), dayjs().endOf("week")] },
                            { label: "Текущий месяц", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
                            { label: "Последние 7 дней", value: [dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")] },
                        ]}
                    />
                    <CreateButton hidden />
                </Space>}

        >
            <Row gutter={[16, 16]}>
                <Col md={24}>
                    <Row gutter={[16, 16]}>
                        <Col xl={{ span: 12 }} lg={12} md={24} sm={24} xs={24}>
                            <BarChartServicesCount range={range} />
                        </Col>
                        <Col xl={{ span: 12 }} lg={12} md={24} sm={24} xs={24}>
                            <LineChartServicesCountByDaytetime range={range}/>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col xl={{ span: 12 }} lg={12} md={24} sm={24} xs={24}>
                            <BarChartCountClosetItemsAtUser  range={range}/>
                        </Col>
                        <Col xl={{ span: 12 }} lg={12} md={24} sm={24} xs={24}>
                            <Card title={translate("dashboard.countClientsByDatte")}>

                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col md={24}>
                    <Row gutter={[16, 16]}>
                        <Col xl={{ span: 24 }} lg={24} md={24} sm={24} xs={24}>
                            <Table
                                {...tableProps}
                                rowKey="id"
                                pagination={{
                                    ...tableProps.pagination,
                                    showTotal: (total) => (
                                        <PaginationTotal total={total}
                                        //entityName="orders" 
                                        />
                                    ),
                                }}
                            > {/* Настройка таблицы */}
                                <Table.Column
                                    title={translate("item.fields.client")}
                                    width={50}
                                    dataIndex="generated_number"
                                /> {/* Отображение номера */}
                                <Table.Column
                                    title={translate("item.fields.created_at")}
                                    sorter
                                    dataIndex="created_at"
                                    width={200}
                                    key={"created_at"}
                                    // filterDropdown={(props) => (
                                    //     <FilterDropdown
                                    //         {...props}
                                    //         mapValue={(selectedKeys, event) => {
                                    //             return rangePickerFilterMapper(selectedKeys, event);
                                    //         }}
                                    //     >
                                    //         <DatePicker.RangePicker />
                                    //     </FilterDropdown>
                                    // )}
                                    // defaultFilteredValue={getDefaultFilter(
                                    //     "created_at",
                                    //     filters,
                                    //     "between",
                                    // )}
                                    defaultSortOrder={getDefaultSortOrder("created_at", sorters)}
                                    render={(date) => new Date(date).toLocaleString()} // Форматирование даты
                                />
                                <Table.Column

                                    title={translate("item.fields.typeService")}
                                    dataIndex={["topic", "name_ru"]} // Доступ к вложенному полю topic.name_ru
                                    key={"topic_id"}
                                    filterDropdown={(props) => (
                                        <FilterDropdown
                                            {...props}
                                            // We'll store the selected id as number
                                            //mapValue={(selectedKey) => Number(selectedKey)}
                                            selectedKeys={props.selectedKeys.map((item) => Number(item))}
                                        >
                                            <Select {...topicsSelectProps}
                                                allowClear
                                                mode="multiple"
                                                style={{ width: "350px" }}
                                            />
                                        </FilterDropdown>
                                    )}
                                    defaultFilteredValue={getDefaultFilter("topic_id", filters, "in")}
                                    render={(name) => name || "-"} // Значение по умолчанию, если имя отсутствует
                                />
                                <Table.Column
                                    width={100}
                                    title={translate("item.fields.status.title")}
                                    dataIndex={["group", "is_closed"]} // Отображение поля is_closed из вложенного объекта group
                                    render={(isClosed) => (isClosed ? translate("item.fields.status.true") : translate("item.fields.status.false"))} // Преобразование булевого значения в строку
                                />
                                <Table.Column
                                    width={300}
                                    title={translate("item.fields.updated_at")}
                                    dataIndex="updated_at"
                                    render={(date) => {
                                        if (date != null) {
                                            return new Date(date).toLocaleString()
                                        }
                                        return "";
                                    }
                                    } // Форматирование даты
                                />
                                <Table.Column
                                    width={250}
                                    title={translate("item.fields.servesUser")}
                                    dataIndex="modified_by"
                                    key={"modified_by"}
                                    filterIcon={(filtered) => (
                                        <SearchOutlined
                                            style={{
                                                color: filtered ? token.colorPrimary : undefined,
                                            }}
                                        />
                                    )}
                                    defaultFilteredValue={getDefaultFilter("modified_by", filters, "contains")}
                                    filterDropdown={(props) => (
                                        <FilterDropdown {...props}>
                                            <Input
                                                placeholder={translate("item.filter.searchByServesUser")}
                                            />
                                        </FilterDropdown>
                                    )}
                                /> {/*Отображение кто принял */}

                            </Table>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/*  */}
        </List>
    );
};
