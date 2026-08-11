import {buildNormalizedFieldsMap, getInstanceFieldsByClass} from "./mapper-helper.js";

export default class DtoMapper {
    dtoClass = null;
    jsonData = [];

    constructor(dtoClass = null, jsonData = []){
        this.dtoClass = dtoClass;
        this.jsonData = jsonData;
    }

    mapJsonToDto(jsonItem, fieldsMap) {

        if (!jsonItem || typeof jsonItem !== 'object') {
            return null;
        }

        const rawData = {};

        for (const [rawKey, value] of Object.entries(jsonItem)) {

            const normalizedKey = rawKey.toLowerCase();
            const targetDtoField = fieldsMap.get(normalizedKey);

            if (targetDtoField) {
                rawData[targetDtoField] = value;
            }
        }
        return new this.dtoClass(rawData);
    }

    parseJsonData() {
        const dtoFields = getInstanceFieldsByClass(this.dtoClass);
        const fieldMap = buildNormalizedFieldsMap(dtoFields);

        return this.jsonData.map((item) => this.mapJsonToDto(item, fieldMap));
    }
}
