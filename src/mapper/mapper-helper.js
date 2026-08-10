export function buildNormalizedFieldsMap(fields){
    return new Map(
        fields.map((field) => [field.toLowerCase(), field]));
}

export function getInstanceFieldsByClass(dtoClass){
    if (typeof dtoClass !== "function") return [];
    
    return Object.keys(new dtoClass());
}