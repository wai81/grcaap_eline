import { List } from "@refinedev/antd";
import { useApiUrl, useCustom } from "@refinedev/core";
import { StatusTopis } from "../../components/staus-topics";
import { Card, Col, Row } from "antd";
import { WaitItems } from "../../components/wait_items";
import { HandingItems } from "../../components/handling_items";
import { BarChartServicesCount } from "../../components/charts/barChartServiceCount";

export const DashboardPage: React.FC = () => {
    const API_URL = useApiUrl();
    return (
        <List title={false}>
            <Row gutter={[16, 16]}>
                <Col md={24}>
                    <StatusTopis />
                </Col>
                <Col xl={10} lg={10} md={24} sm={24} xs={24}>
                    <WaitItems />
                </Col>
                <Col xl={14} lg={14} md={24} sm={24} xs={24}>
                    <HandingItems />
                </Col>
            </Row>
        </List>
    )
}