import { CrudSorting } from "@refinedev/core";

export const generateSort = (sorters?: CrudSorting) => {
  if (sorters && sorters.length > 0) {
    const _sort: string[] = [];
    const _order: string[] = [];

    // eslint-disable-next-line array-callback-return
    sorters.map((item) => {
      _sort.push(item.field);
      if (item.order === "asc") {
        _order.push("+");
      }
      if (item.order === "desc") {
        _order.push("-");
      }
    });

    return {
      _sort,
      _order,
    };
  }

  return;
};
