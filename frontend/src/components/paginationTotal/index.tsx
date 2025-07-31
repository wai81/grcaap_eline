import type { FC } from "react";

import { useTranslate } from "@refinedev/core";

import { Typography, theme } from "antd";

type PaginationTotalProps = {
    total: number;
    //entityName: string;
};

export const PaginationTotal: FC<PaginationTotalProps> = ({
    total,
    //entityName,
}) => {
    const translate = useTranslate();
    const { token } = theme.useToken();
    return (
        <div
            style={{
                marginLeft: "16px",
                marginRight: "auto",
            }}
        >
            <Typography.Text
                style={{
                    color: token.colorTextTertiary,
                }}
            >
                {/* {translate("table.inTotal")} */}
                Всего
            </Typography.Text>
            {" "}
            <Typography.Text
                style={{
                    color: token.colorTextSecondary,
                }}
            >
                {total}
            </Typography.Text>
            {" "}
            <Typography.Text
                style={{
                    color: token.colorTextTertiary,
                }}
            >
                {/* {translate("table.items")} */}
                записей
            </Typography.Text>
        </div>
    );
};