import "./chunk-2JRKVAPI.mjs";
import {
  getEvent
} from "./chunk-E32IWKP5.mjs";
import {
  registerForEvent
} from "./chunk-ME6E7K2B.mjs";
import {
  errorHandler
} from "./chunk-ZBZVNSIZ.mjs";
import {
  checkIn
} from "./chunk-3J5OQPPY.mjs";
import {
  createEvent
} from "./chunk-IOGYFGWT.mjs";
import "./chunk-KDMJHR3Z.mjs";
import {
  getAttendeeBadge
} from "./chunk-SGPN3Z5Z.mjs";
import "./chunk-JRO4E4TH.mjs";
import {
  getEventAttendees
} from "./chunk-T7BEZZZZ.mjs";
import "./chunk-KQTWUIAM.mjs";
import "./chunk-DNHFPAKL.mjs";

// src/server.ts
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform
} from "fastify-type-provider-zod";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastify from "fastify";
var app = fastify();
app.register(fastifyCors, {
  origin: "*"
  // http://meufrontend.com em produção
});
app.register(fastifySwagger, {
  swagger: {
    // Todos os dados enviados para a minha api são do tipo JSON
    consumes: ["application/json"],
    // Todos os dados que a minha api retorna são do tipo JSON
    produces: ["application/json"],
    info: {
      title: "pass.in",
      description: "Especifica\xE7\xF5es da API para o back-end da aplica\xE7\xE3o pass.in construida duranta o NLW Unite da Rocketseat",
      version: "1.0.0"
    }
  },
  // Como swagger deve transformar e entender os schemas(params, response, body...) passados para cada rota
  transform: jsonSchemaTransform
});
app.register(fastifySwaggerUI, {
  routePrefix: "/docs",
  swagger: {
    url: "/swagger.json"
  },
  exposeRoute: true
});
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(createEvent);
app.register(registerForEvent);
app.register(getEvent);
app.register(getAttendeeBadge);
app.register(checkIn);
app.register(getEventAttendees);
app.setErrorHandler(errorHandler);
app.listen({
  port: 3e3,
  // Para conseguir acessar a api por exemplo no react-native
  host: "0.0.0.0"
}).then(() => {
  console.log("Server is running on port 3000");
});
