import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation using Swagger",
    },
    servers: [
      {
        url: "http://localhost:3005",
      },
    ],
  },
  apis: [path.resolve("./route/*.js")], // ✅ FIXED
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
