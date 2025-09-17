import type { DataProvider } from "@refinedev/core";
import { generateFilter, generateSort } from "./utils";

const API_URL = import.meta.env.VITE_API_URL
//console.log("api_url " +API_URL)

const fetcher = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem("my_access_token");

  const headers: HeadersInit = {
    ...(options?.headers || {}),
    ...(token ? { Authorization: token } : {}), // Only add Authorization if token exists  
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

export const dataProvider: DataProvider = {
  getOne: async ({ resource, id, meta }) => {

    const response = await fetch(`${API_URL}/${resource}/${id}`);

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return { data };
  },
  update: async ({ resource, id, variables }) => {

    //const response = await fetch(`${API_URL}/${resource}/${id}`, {
    const response = await fetcher(`${API_URL}/${resource}/${id}`, {
      //method: "PATCH",
      method: "PUT",
      body: JSON.stringify(variables),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return { data };
  },
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const params = new URLSearchParams();
    //формируем строку запроса для пагинации
    if (pagination) {
      const currentPage = pagination.currentPage;
      if (currentPage !== undefined) {
        params.append("page", pagination.currentPage!.toString());
      } else {
        params.append("page", "1");
      }
      // params.append("page", pagination.current!.toString());
      params.append("size", pagination.pageSize!.toString());
    }
    //формируем строку запроса если есть сотртировка данных
    const getSort = generateSort(sorters)
    if (getSort) {
      const { _sort, _order } = getSort;
      params.append("order_by", `${_order}${_sort}`)
    }

    //формируем строку запроса если есть фильтры
    if (filters && filters.length > 0) {
      const getFilter = generateFilter(filters)
      Object.entries(getFilter).forEach(([key, value]) => {
        if (value.length !== 0 && value !== undefined && value !== "" &&
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === 'object' && Object.keys(value).length === 0)) {
          params.append(key, value);
        }
      })
    }

    //const response = await fetch(`${API_URL}/${resource}?${params.toString()}`);
    const response = await fetcher(`${API_URL}/${resource}?${params.toString()}`);

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();
    return {
      data: data.items,
      total: data.total,
    };
  },
  create: async ({ resource, variables }) => {

    //const response = await fetch(`${API_URL}/${resource}`, {
    const response = await fetcher(`${API_URL}/${resource}`, {
      method: "POST",
      body: JSON.stringify(variables),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status < 200 || response.status > 299) throw response;

    const data = await response.json();

    return { data };
  },
  deleteOne: () => {
    throw new Error("Not implemented");
  },
  getApiUrl: () => API_URL,
  // Optional methods:
  // getMany: () => { /* ... */ },
  // createMany: () => { /* ... */ },
  // deleteMany: () => { /* ... */ },
  // updateMany: () => { /* ... */ },
  custom: async ({ url, method, payload, filters, sorters, query, headers }) => {
    const params = new URLSearchParams();

    const getSort = generateSort(sorters)
    if (getSort) {
      const { _sort, _order } = getSort;
      params.append("order_by", `${_order}${_sort}`)
    }

    if (filters && filters.length > 0) {
      const getFilter = generateFilter(filters)
      Object.entries(getFilter).forEach(([key, value]) => {
        if (value.length !== 0 && value !== undefined && value !== "" &&
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === 'object' && Object.keys(value).length === 0)) {
          params.append(key, value);
        }
      })
    }
    //const response = await fetcher(`${API_URL}/${resource}?${params.toString()}`)
    const response = await fetch(`${url}?${params.toString()}`, {
      method,
      headers,
      body: JSON.stringify(payload),
    });
    if (response.status < 200 || response.status > 299) throw response;
    const data = await response.json();
    return { data };
  },
};