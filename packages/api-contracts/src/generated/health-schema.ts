// Generated from OpenAPI. Do not edit.
export const healthSchema = {
  "type": "object",
  "additionalProperties": false,
  "required": [
    "status",
    "service"
  ],
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "ok"
      ]
    },
    "service": {
      "type": "string",
      "enum": [
        "aeki-api"
      ]
    }
  }
};
