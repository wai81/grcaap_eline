import { SearchOutlined } from "@ant-design/icons";
import { IItems } from "../../interfaces/items";
import { CreateButton, DateField, FilterDropdown, getDefaultSortOrder, List, rangePickerFilterMapper, useSelect, useTable } from "@refinedev/antd";
import { getDefaultFilter, HttpError, useTranslate } from "@refinedev/core";
import { DatePicker, Input, Select, Table, theme, Typography } from "antd";
import { PaginationTotal } from "../../components/paginationTotal";
import dayjs from "dayjs";
import { ITopic } from "../../interfaces/topic";

export const ItemsList = () => {
    const translate = useTranslate();
    const { token } = theme.useToken();
    const now = dayjs();

    // We'll use pass `tableProps` to the `<Table />` component,
    // This will manage the data, pagination, filters and sorters for us.
    const { tableProps, sorters, filters } = useTable<IItems, HttpError>({
        sorters: { initial: [{ field: "created_at", order: "desc" }] },
        filters: {
            initial: [
                {
                    field: "created_at",
                    operator: "between",
                    value: [
                        now.subtract(1, "month").startOf("day").format('YYYY-MM-DD HH:mm:ss'),
                        now.endOf("day").format('YYYY-MM-DD HH:mm:ss'),
                    ],
                }
            ]
        },
        pagination: {
            pageSize: 10
        }

    });
    //const translate = useTranslate();
    const { selectProps: topicsSelectProps, query: queryResult, } = useSelect<ITopic>({
        resource: "topic",
        optionLabel: "name_ru",
        optionValue: "id",
        sorters: [{ field: "name_ru", order: "asc" }],
        //defaultValue: getDefaultFilter("organization_id", filters, "in"),
        defaultValue: getDefaultFilter("topic_id", filters, "eq"),
        pagination: {
            pageSize: 25,
        },
    });

    return (
        <List
            headerButtons={<CreateButton hidden />}
        >
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
                    filterDropdown={(props) => (
                        <FilterDropdown
                            {...props}
                            mapValue={(selectedKeys, event) => {
                                return rangePickerFilterMapper(selectedKeys, event);
                            }}
                        >
                            <DatePicker.RangePicker />
                        </FilterDropdown>
                    )}
                    defaultFilteredValue={getDefaultFilter(
                        "order_create_date",
                        filters,
                        "between",
                    )}
                    defaultSortOrder={getDefaultSortOrder("created_at", sorters)}
                    render={(date) => new Date(date).toLocaleString()} // Форматирование даты
                />
                {/* <Table.Column
                    title="Создатель"
                    dataIndex="created_by"
                /> Отображение создателя */}
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
                            {/* <Select style={{ minWidth: 200 }} {...selectProps} /> */}
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
        </List>

    );
};
