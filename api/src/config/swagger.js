// Configuration Swagger : génère la spec OpenAPI à partir des commentaires
// JSDoc (@openapi) présents dans les fichiers de routeurs.
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pokédex API",
      version: "1.0.0",
      description: "API REST Pokédex avec système d'équipes",
    },
    servers: [{ url: process.env.RENDER_EXTERNAL_URL ||`http://localhost:${process.env.PORT || 3000}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // Où chercher les commentaires @openapi
  apis: ["./src/routers/*.js"],
};

export default swaggerJsdoc(options);
