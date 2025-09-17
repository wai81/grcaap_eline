import React, { useContext, useEffect, useState } from "react";
import {
  useGetIdentity,
  useGetLocale,
  useSetLocale,
  useTranslate,
} from "@refinedev/core";
import { Layout as AntdLayout, Typography, Avatar, Space, theme, Switch, Menu, Dropdown, Button } from "antd";
import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { ColorModeContext } from "../../contexts/color-mode";
import { useTranslation } from "react-i18next";
import { DownOutlined } from "@ant-design/icons";

export const ThemedHeader: React.FC<RefineThemedLayoutHeaderProps> = ({
  sticky,
}) => {
  const translate = useTranslate();
  const [time, setTime] = useState(new Date());
  const { token } = theme.useToken();
  const { i18n } = useTranslation();
  const changeLocale = useSetLocale();
  const locale = useGetLocale();
  const { mode, setMode } = useContext(ColorModeContext);
  const { data: user } = useGetIdentity();

  const shouldRenderHeader = user && (user.name || user.avatar);

  // if (!shouldRenderHeader) {
  //   return null;
  // }

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  const currentLocale = locale();
  const menuLang = (
    <Menu selectedKeys={currentLocale ? [currentLocale] : []}>
      {[...(i18n.languages || [])].sort().map((lang: string) => (
        <Menu.Item
          key={lang}
          onClick={() => changeLocale(lang)}
          icon={
            <span style={{ marginRight: 8 }}>
              <Avatar size={16} src={`/images/flags/${lang}.svg`} />
            </span>
          }
        >
          {lang === "en"
            ? "English"
            : lang === "ru"
              ? "Русский"
              : "Беларускі"}
        </Menu.Item>
      ))}
    </Menu>
  );

  const menuItems = [
    ...(i18n.languages || [])
      .slice()
      .sort()
      .map((lang: string) => ({
        key: lang,
        label: (
          <div
            onClick={(e) => {
              e.stopPropagation();
              changeLocale(lang);
            }}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Avatar size={16} src={`/images/flags/${lang}.svg`} />
            <span>
              {lang === "en" ? "English" : lang === "ru" ? "Русский" : "Беларуская"}
            </span>
          </div>
        ),
      })),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // обновляем каждую секунду

    return () => clearInterval(interval); // очистка при размонтировании
  }, []);

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space style={{ width: "100%", justifyContent: "flex-start" }} align="center">
        <Typography.Title level={4} style={{ margin: 0 }}>
          {translate("dashboard.currentTime")} {time.toLocaleString()}
        </Typography.Title>
      </Space>
      <Dropdown
        //overlay={menuLang}
        menu={{
          items: menuItems,
        }}
        trigger={["click"]}
      >
        <Button type="link">
          <Space>
            <Avatar size={16} src={`/images/flags/${currentLocale}.svg`} />
            {currentLocale === "en"
              ? "English"
              : currentLocale === "ru"
                ? "Русский"
                : "Беларускі"}


            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
      <Space>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        <Space size="middle">
          {user?.name && <Typography.Text strong>{user.name}</Typography.Text>}
          {user?.avatar && <Avatar src={user?.avatar} alt={user?.name} />}
        </Space>
      </Space>

    </AntdLayout.Header>
  );
};
