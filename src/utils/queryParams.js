import { URL_QUERY_PARAMS } from "../constants";

const { SORT_KEY, CHECKS_KEY } = URL_QUERY_PARAMS;

const convertQueryStringToObject = (params) => {
    const queryString = params.replace('?', '');

    if (!queryString) return {};
    else {
        return queryString.split('&').reduce((accumulator, pair) => {
            const [queryKey, queryValue] = pair.split('=');
            
            switch(queryKey) {
                case SORT_KEY: {
                    if (queryValue === 'cashback')
                        accumulator['_sort'] = 'amount_type,cashback_amount&_order=asc,desc';
                    else
                        accumulator['_sort'] = `${queryValue}&_order=desc`;

                    break;
                }
                case CHECKS_KEY: {
                    queryValue.split(',').forEach(val => {
                        if (['publish', 'draft', 'trash'].includes(val))
                            accumulator[`status_${val}`] = val
                        else
                            accumulator[val] = 1
                    });
                    break;  
                }
                default:
                    accumulator[queryKey] = queryValue;
                    break;
            }

            return accumulator;
        }, {});
    }
}

export {
    convertQueryStringToObject
}
