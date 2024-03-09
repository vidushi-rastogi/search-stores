const convertToURLParamString = (checks) => {
    let valueString = '';
    checks.forEach(val => {
        switch(val) {
            case 'Cashback Enabled':
                valueString += 'cashback_enabled,';
                break;
            case 'Promoted':
                valueString += 'is_promoted,';
                break;
            case 'Sharable':
                valueString += 'is_sharable,';
                break;
            case 'Coming Soon':
                valueString += 'draft,';
                break;
            case 'Active':
                valueString += 'publish,';
                break;
            case 'Discontinued':
                valueString += 'trash,';
                break;
            default: return;
        }
    });

    return valueString;
}

const convertFromURLParamString = (checks) => (
    checks.map(val => {
        switch(val) {
            case 'cashback_enabled':
                return 'Cashback Enabled';
            case 'is_promoted':
                return 'Promoted';
            case 'is_sharable':
                return 'Sharable';
            case 'draft':
                return 'Coming Soon';
            case 'publish':
                return 'Active';
            case 'trash':
                return 'Discontinued';
            default: return '';
        }
    })
)

export  {
    convertFromURLParamString,
    convertToURLParamString
}