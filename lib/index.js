var _ = require('lodash');


function isBasicValue(val) {
    return _.isString(val) || _.isNumber(val) || _.isBoolean(val);
}

// Create element and apply shcema
function createElement(feed, schema, value) {
    var el = feed.ele(schema.tag);
    applySchema(el, schema, value);
}

// Apply a schema to an existing element
function applySchema(el, schema, value) {
    schema = _.defaults(schema || {}, {
        // Sub elements fields
        fields: {},

        // Attribute for the element
        attributes: {},

        // Value transformation
        transform: _.identity,

        // Default value
        default: undefined,

        // Map basic value to object
        map: {},

        // Add value as text
        text: true,

        // Use raw node instead of escaped text
        raw: true
    });

    // Apply default value
    if (schema.default !== undefined) {
        value = _.isPlainObject(value)? _.defaults(value, schema.default || {}) : (value || schema.default);
    }

    if (value === null || value == undefined) {
        el.remove();
        return;
    }

    // Map value
    if (schema.map.to && isBasicValue(value)) {
        value = _.object([[schema.map.to, value]]);
    }

    // Transform value
    value = schema.transform(value);

    // Add value if string or number
    if (schema.text && isBasicValue(value)) {
        if (schema.raw) el.raw(value);
        else el.txt(value);
    }

    // Apply sub-fields
    _.each(schema.fields, function(field, key) {
        // Extract valeu to use for the field
        var val = key == '$'? value : _.get(value, key);

        // Create new element and handle arrays
        if (_.isArray(val)) {
            _.each(val, _.partial(createElement, el, field));
        } else {
            createElement(el, field, val);
        }
    });

}

module.exports = {
    createElement: createElement,
    applySchema: applySchema
};