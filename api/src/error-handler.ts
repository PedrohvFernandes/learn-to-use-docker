// Padronização de erros
import { BadRequest } from './routes/_errors/bad-request'

import { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  // Se houve um error de validação do zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: `Error during validation`,
      // Esse error vai vir dentro da mensagem do erro definido dentro por exemplo dentro de um type do zod, ex: invalid_type_error em create-events.ts. Que nesse caso é o tipo invalido da string do titulo. Ou simplesmente message para validar o minimo de caracteres do titulo. Dentro do string não é message porque o string valida duas coisas, primeiro se é uma string e que é oebrigatorio required_error
      // errors: error.format()
      errors: error.flatten().fieldErrors
    })
  }
  // Se for algum erro 400
  if (error instanceof BadRequest) {
    // O message vai vir de dentro do erro que foi lançado, ex: throw new BadRequest('Attendee not found') em get-attendee-badge.ts. O bad request nada mais é que padronizando errors 400 em um arquivo dentro da pasta _errors
    return reply.status(400).send({ message: error.message })
  }

  // Erro padrão
  return reply.status(500).send({
    message: 'Internal server error!' // error.message
  })
}
