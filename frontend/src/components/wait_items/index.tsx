import { Card, List, notification, Select, Table, Tag, Typography } from "antd"
import { IItemsEline } from "../../interfaces/items"
import { DateField, FilterDropdown, useSelect, useTable } from "@refinedev/antd"
import { PaginationTotal } from "../paginationTotal"
import { TagOutlined } from "@ant-design/icons"
import { getDefaultFilter, HttpError } from "@refinedev/core"
import dayjs from 'dayjs'; // Убедитесь, что вы установили dayjs
import { ITopic } from "../../interfaces/topic"
import { IItemStatusType } from "../../interfaces/item_status_type"

export const WaitItems = () => {

    const { tableProps, filters } = useTable<IItemsEline, HttpError>({
        resource: "status/wait_items",
        filters: {
            initial: [
                {
                    field: "topic_id",
                    operator: "eq",
                    value: []
                },
                {
                    field: "item_status_id",
                    operator: "eq",
                    value: 2
                },
                {
                    field: "is_closed",
                    operator: "eq",
                    value: "false"
                },
            ]
        },
        pagination: {
            pageSize: 5
        },
        queryOptions: {
            refetchInterval: 5000,
            onError: (error: HttpError) => {
                notification.error({
                    message: 'Ошибка при загрузке данных',
                    description: error.message,
                });
            },
        }
    });

    const { selectProps: topicSelectProps, query: topicQueryResult, } = useSelect<ITopic>({
        resource: "topic",
        optionLabel: "name_ru",
        optionValue: "id",
        defaultValue: getDefaultFilter("topic_id", filters, "eq"),
        pagination: {
            pageSize: 25,
        },
    });
    const topics = topicQueryResult?.data?.data || [];

    const { selectProps: itemStausTypeSelectProps, query: itemStatusTypeQueryResult, } = useSelect<IItemStatusType>({
        resource: "item_status_type",
        optionLabel: "name",
        optionValue: "id",
        //sorters: [{ field: "id", order: "asc" }],
        defaultValue: getDefaultFilter("item_status_id", filters, "eq"),
        pagination: {
            pageSize: 25,
        },
    });
    const status_types = itemStatusTypeQueryResult?.data?.data || [];

    return (
        <Card title={"Клиенты ожидают"}>
            <List>
                <Table
                    {...tableProps}
                    rowKey={"id"}
                    pagination={{
                        ...tableProps.pagination,
                        showTotal: (total) => (
                            <PaginationTotal total={total}
                            //entityName="orders" 
                            />
                        ),

                    }}
                >
                    <Table.Column
                        // title={translate("in_line.fields.row_num")}
                        key={"combined"}
                        title="Клиент / Время"
                        width={50}
                        render={(_, record: IItemsEline) => {
                            // Получите значения из record
                            const generatedNumber = record.generated_number;
                            const itemСreatedАt = record.item_created_at;
                            return (
                                <div>
                                    <Tag color="orange" icon={<TagOutlined />}>
                                        {generatedNumber}
                                    </Tag>
                                    <br />
                                    <DateField value={itemСreatedАt} format="HH:mm:ss" />
                                </div>
                            );
                        }}
                    />
                    <Table.Column
                        dataIndex={["topic_id", "name_ru"]}
                        // title={translate("in_line.fields.completion_date")}
                        key={"topic_id"}
                        title={"Услуга"}
                        width={180}
                        filterDropdown={(props) => (
                            <FilterDropdown
                                {...props}
                                // We'll store the selected id as number
                                //mapValue={(selectedKey) => Number(selectedKey)}
                                selectedKeys={
                                    Array.isArray(props.selectedKeys)
                                        ? props.selectedKeys.map((item) => Number(item))
                                        : props.selectedKeys !== undefined && props.selectedKeys !== null && props.selectedKeys !== ""
                                            ? [Number(props.selectedKeys)]
                                            : []
                                }
                            >
                                {/* <Select style={{ minWidth: 200 }} {...selectProps} /> */}
                                <Select {...topicSelectProps}
                                    allowClear
                                    //mode="multiple"
                                    style={{ width: "200px" }}
                                />
                            </FilterDropdown>
                        )}
                        defaultFilteredValue={getDefaultFilter("topic_id", filters, "eq")}
                        render={(_, value) => {
                            const topic = topics.find(
                                (topic) => topic?.id === value?.topic_id,
                            );
                            return (topic?.name_ru || "-")
                        }}
                    />
                    <Table.Column
                        dataIndex="item_status_id"
                        // title={translate("in_line.fields.completion_date")}
                        title={"Статус"}
                        width={80}
                        align="center"
                        defaultFilteredValue={getDefaultFilter("item_status_id", filters, "eq")}
                        render={(value) => {
                            const status = status_types.find(
                                (s) => s.id === value,
                            );
                            return (status?.name || "-")
                        }}
                    />

                    {/* <Table.Column
                        dataIndex={["status_updated_at"]}
                        // title={translate("in_line.fields.completion_date")}
                        title={"Выдан"}
                        width={100}
                        align="center"
                        render={(value: any) => <DateField value={value} format="HH:mm:ss" />}
                    /> */}
                    <Table.Column
                        title={"Ожидание"}
                        dataIndex={["item_created_at"]}
                        width={120}
                        align="center"
                        render={(createdAt: any) => {
                            const duration = dayjs().diff(dayjs(createdAt), 'minutes'); // Рассчитываем разницу в минутах
                            const hours = Math.floor(duration / 60);
                            const minutes = duration % 60;
                            return (
                                <Typography.Text>
                                    {hours} ч {minutes} мин
                                </Typography.Text>
                            );
                        }}
                    />

                </Table>
            </List>
        </Card>

    )
}