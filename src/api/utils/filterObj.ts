type FilterObjProps<T> = keyof T;

export const filterObj = <T extends Record<string, any>>(
    body: T,
    ...props: FilterObjProps<T>[]
): Partial<T> => {
    const newObj: Partial<T> = {};
    (Object.keys(body) as Array<FilterObjProps<T>>).forEach((el) => {
        if (props.includes(el)) {
            newObj[el] = body[el];
        }
    });
    return newObj;
};
