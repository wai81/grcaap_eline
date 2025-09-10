import { GitHubBanner, I18nProvider, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useTranslation } from "react-i18next";
import {
  ErrorComponent,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
//import dataProvider from "@refinedev/simple-rest";
import { dataProvider } from "./providers/data-provider";
import { ConfigProvider, App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostList,
  BlogPostShow,
} from "./pages/blog-posts";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";
import { ThemedLayoutV2 } from "./components/layout";
import { ThemedTitleV2 } from "./components/layout/title";
import { ThemedSiderV2 } from "./components/layout/sider";
import { ThemedHeaderV2 } from "./components/layout/header";
import { DashboardOutlined, PieChartOutlined } from "@ant-design/icons";
import { DashboardPage } from "./pages/dashboard";
import { ItemsList, ItemsShow } from "./pages/items";
import ru_Ru from 'antd/locale/ru_RU'
import 'dayjs/locale/ru';
import './i18n'


function App() {
  const { t, i18n } = useTranslation();

  const i18nProvider: I18nProvider = {
    translate: (key: string, options?: any) => t(key, options),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      {/* <GitHubBanner /> */}
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <ConfigProvider locale={ru_Ru}>
            <AntdApp>
              <DevtoolsProvider>
                <Refine
                  i18nProvider={i18nProvider}
                  dataProvider={dataProvider}
                  //dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
                  notificationProvider={useNotificationProvider}
                  routerProvider={routerBindings}
                  resources={[
                    {
                      name: "dashboard",
                      list: "/",
                      meta: {
                        icon: <DashboardOutlined />
                      }
                    }, {
                      name: "item",
                      list: "item/",
                      show: "item/:id",
                      meta: {
                        icon: <PieChartOutlined />
                      }
                    }]}
                  options={{
                    syncWithLocation: false,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: "EGaGeR-GWoBY0-LRzZ9A",
                  }}
                >
                  <Routes>
                    <Route
                      element={
                        <ThemedLayoutV2
                          Title={(props) => (<ThemedTitleV2 {...props}
                            text="Мониторинг очереди"
                            icon={<img src="/images/logo.png" width={24} height={24} />}
                          />
                          )}
                          Header={() => <ThemedHeaderV2 sticky />}
                          Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      }
                    >
                      <Route index element={<DashboardPage />} />
                      <Route index element={<NavigateToResource resource="dashboard" />} />
                      <Route
                        index
                        element={<NavigateToResource resource="item" />}
                      />
                      <Route path="/item">
                        <Route index element={<ItemsList />} />
                        <Route path=":id" element={<ItemsShow />} />
                      </Route>
                      {/* <Route
                      index
                      element={<NavigateToResource resource="blog_posts" />}
                    />
                    <Route path="/blog-posts">
                      <Route index element={<BlogPostList />} />
                      <Route path="create" element={<BlogPostCreate />} />
                      <Route path="edit/:id" element={<BlogPostEdit />} />
                      <Route path="show/:id" element={<BlogPostShow />} />
                    </Route>
                    <Route path="/categories">
                      <Route index element={<CategoryList />} />
                      <Route path="create" element={<CategoryCreate />} />
                      <Route path="edit/:id" element={<CategoryEdit />} />
                      <Route path="show/:id" element={<CategoryShow />} />
                    </Route> */}
                      <Route path="*" element={<ErrorComponent />} />
                    </Route>
                  </Routes>

                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
              </DevtoolsProvider>
            </AntdApp>
          </ConfigProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter >
  );
}

export default App;
