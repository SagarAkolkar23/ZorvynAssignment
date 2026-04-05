import swaggerJSDoc from "swagger-jsdoc";

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
  apis: ["../routes/*.js"], // where your docs live
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
