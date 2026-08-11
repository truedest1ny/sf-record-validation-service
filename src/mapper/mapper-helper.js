export function buildNormalizedFieldsMap(fields){
    return new Map(
        fields.map((field) => [field.toLowerCase(), field]));
}

export function getInstanceFieldsByClass(dtoClass){
    if (typeof dtoClass !== "function") return [];
    
    return Object.keys(new dtoClass());
}

export function mapDtoToSalesforcePayment(dto) {
    return {
        Amount__c: dto.amount,
        FirstName__c: dto.firstName,
        LastName__c: dto.lastName,
        OpportunityName__c: dto.opportunity
    };
}