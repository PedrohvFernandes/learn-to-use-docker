import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";

// src/error-handler.ts
import { ZodError } from "zod";
var errorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: `Error during validation`,
      // Esse error vai vir dentro da mensagem do erro definido dentro por exemplo dentro de um type do zod, ex: invalid_type_error em create-events.ts. Que nesse caso é o tipo invalido da string do titulo. Ou simplesmente message para validar o minimo de caracteres do titulo. Dentro do string não é message porque o string valida duas coisas, primeiro se é uma string e que é oebrigatorio required_error
      // errors: error.format()
      errors: error.flatten().fieldErrors
    });
  }
  if (error instanceof BadRequest) {
    return reply.status(400).send({ message: error.message });
  }
  return reply.status(500).send({
    message: "Internal server error!"
    // error.message
  });
};

export {
  errorHandler
};
