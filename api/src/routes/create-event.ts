import { prisma } from '../lib'
import { generateSlug } from '../utils'
import { BadRequest } from './_errors/bad-request'

import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { FastifyInstance } from 'fastify'
import z from 'zod'

// Quando separamos os rotas em arquivos usando o fastify é necessário a rota ser uma função async, se não vai ficar rodando a função infinitamente
export async function createEvent(app: FastifyInstance) {
  // Mantendo a rota no plural, isso é identificação de recurso: Events
  app.withTypeProvider<ZodTypeProvider>().post(
    '/events',
    {
      // Por arqui tipamos o body da requisição(O que ela vai receber) e a resposta(O que ela vai devolver) usando o zod, atraves do withTypeProvider<ZodTypeProvider>() fastify-type-provider-zod. Isso facilita na documentação da API
      schema: {
        // Personaliza para a documentação do swagger
        summary: 'Create a new event',
        tags: ['events Post'],
        // O que a rota vai receber no body da requisição
        body: z.object({
          title: z
            .string({
              // Mensagem de erro caso o titulo não seja uma string
              invalid_type_error: 'O título precisa ser um texto'
            })
            .min(4, {
              message: 'O título precisa ter no mínimo 4 caracteres'
            }),
          details: z.string().nullable(),
          // Um numero, em inteiro, somente positivo e pode ser nulo
          maximumAttendees: z.number().int().positive().nullable()
        }),
        // O que a rota vai devolver na resposta
        response: {
          201: z.object({
            eventId: z.string().uuid()
          })
        }
      }
    },
    async (request, reply) => {
      // const createEventSchema = z.object({
      //   title: z.string().min(4),
      //   details: z.string().nullable(),
      //   // Um numero, em inteiro, somente positivo e pode ser nulo
      //   maximumAttendees: z.number().int().positive().nullable()
      // })

      // O parse faz a validação dos dados
      // const { details, maximumAttendees, title } = createEventSchema.parse(request.body)

      // Agora pegamos os dados do body da requisição definidos no schema
      const { details, maximumAttendees, title } = request.body

      const slug = generateSlug(title)

      const eventWithSameSlug = await prisma.event.findUnique({
        where: {
          slug
        }
      })

      if (eventWithSameSlug !== null) {
        // throw new Error('Event with same title already exists')
        throw new BadRequest('Event with same title already exists')
      }

      const event = await prisma.event.create({
        data: {
          details,
          maximumAttendees,
          title,
          slug
        }
      })

      // return { eventId: event.id }
      // Tem que respeitar agora o schema de resposta definido la em cima
      return reply.status(201).send({ eventId: event.id })
    }
  )
}
