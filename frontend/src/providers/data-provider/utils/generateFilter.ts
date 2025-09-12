import { CrudFilters } from "@refinedev/core";
import { mapOperator } from "./mapOperator";

export const generateFilter = (filters?: CrudFilters) => {
  const queryFilters: { [key: string]: string } = {};

  if (filters) {
    // eslint-disable-next-line array-callback-return
    filters.map((filter) => {
      if (filter.operator === "or" || filter.operator === "and") {
        throw new Error(
            `[@refinedev/simple-rest]: \`operator: ${filter.operator}\` is not supported. You can create custom data provider. https://refine.dev/docs/api-reference/core/providers/data-provider/#creating-a-data-provider`
        );
      }
      if ("field" in filter) {
        const { field, operator, value } = filter;

        if (field === "q") {
          queryFilters[field] = value;
          // eslint-disable-next-line array-callback-return
          return;
        }

        if(operator==="between" && Array.isArray(value) && value.length === 2){
          console.log(value);
          const [startDate, endDate] = value; 
          queryFilters[`${field}_gte`] = new Date(startDate).toISOString().slice(0, 19); // Фильтр для начала диапазона  
          queryFilters[`${field}_lte`] = new Date(endDate).toISOString().slice(0, 19);   // Фильтр для конца диапазона  
          return;
        }

        // Спец-обработка для одиночного фильтра через in
        // if(operator==="in" && Array.isArray(value) && value.length === 1){
        //   queryFilters[`${field}`] = value[0];
        //   return;
        // }
        //else{
        const mappedOperator = mapOperator(operator);
        queryFilters[`${field}${mappedOperator}`] = value;
       // }
      }
    });
  }

  return queryFilters;
};
