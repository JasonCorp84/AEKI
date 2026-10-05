// Generated from OpenAPI. Do not edit.
export const productSearchSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'name',
          'articleNumber',
          'description',
          'image',
          'price',
          'stock',
        ],
        properties: {
          id: {
            type: 'string',
            minLength: 1,
          },
          name: {
            type: 'string',
            minLength: 1,
          },
          articleNumber: {
            type: 'string',
            minLength: 1,
          },
          description: {
            type: 'string',
            minLength: 1,
          },
          image: {
            type: 'object',
            additionalProperties: false,
            required: ['url', 'alt'],
            properties: {
              url: {
                type: 'string',
                minLength: 1,
              },
              alt: {
                type: 'string',
                minLength: 1,
              },
            },
          },
          price: {
            type: 'object',
            additionalProperties: false,
            required: ['amountMinor', 'currency'],
            properties: {
              amountMinor: {
                type: 'integer',
                minimum: 0,
                description:
                  "Amount in the specified currency's minor units; use its standard fractional precision when formatting.",
              },
              currency: {
                type: 'string',
                pattern: '^[A-Z]{3}$',
              },
            },
          },
          stock: {
            type: 'object',
            additionalProperties: false,
            required: ['storeId', 'storeName', 'quantity'],
            properties: {
              storeId: {
                type: 'string',
                minLength: 1,
              },
              storeName: {
                type: 'string',
                minLength: 1,
              },
              quantity: {
                type: 'integer',
                minimum: 0,
              },
            },
          },
        },
      },
    },
  },
};
export const productSearchErrorSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['code'],
  properties: {
    code: {
      type: 'string',
      enum: ['PRODUCT_SEARCH_UNAVAILABLE'],
    },
  },
};
