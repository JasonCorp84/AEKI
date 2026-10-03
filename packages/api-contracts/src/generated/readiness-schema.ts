// Generated from OpenAPI. Do not edit.
export const readinessSchema = {
  "oneOf": [
    {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "status",
        "database"
      ],
      "properties": {
        "status": {
          "type": "string",
          "enum": [
            "ready"
          ]
        },
        "database": {
          "type": "string",
          "enum": [
            "reachable"
          ]
        }
      }
    },
    {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "status",
        "database",
        "code"
      ],
      "properties": {
        "status": {
          "type": "string",
          "enum": [
            "not_ready"
          ]
        },
        "database": {
          "type": "string",
          "enum": [
            "unreachable"
          ]
        },
        "code": {
          "type": "string",
          "enum": [
            "DATABASE_UNAVAILABLE",
            "DATABASE_TIMEOUT"
          ]
        }
      }
    }
  ]
};
