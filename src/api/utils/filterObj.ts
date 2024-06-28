type FilterObjfields<T> = keyof T;

export const filterObj = <T extends Record<string, any>>(
    body: T,
    options: {
        type: 'include' | 'exclude';
        fields: FilterObjfields<T>[];
    }
): Partial<T> => {
    const newObj: Partial<T> = {};
    (Object.keys(body) as Array<FilterObjfields<T>>).forEach((el) => {
        if (options.type == 'include' && options.fields.includes(el))
            newObj[el] = body[el];
        else if (options.type == 'exclude' && !options.fields.includes(el))
            newObj[el] = body[el];
    });
    return newObj;
};
