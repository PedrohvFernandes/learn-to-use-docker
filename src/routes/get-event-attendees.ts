// Essa retorna todos os participantes de um unico evento, para o administrador conseguir gerenciar.

import { prisma } from '../lib'

import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { FastifyInstance } from 'fastify'
import z from 'zod'

export async function getEventAttendees(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/events/:eventId/attendees',
    {
      schema: {
        summary: 'Get event attendees',
        tags: ['events Get'],
        params: z.object({
          eventId: z.string().uuid()
        }),
        // Vamos usar Query params/search params para fazer o sistema de paginação e o sistema de busca(filtro)
        querystring: z.object({
          // pageIndex é o indice da pagina, a pagina que eu quero retornar
          // Tudo o que vem da query string é uma string, pode ser nullish porque se eu não passar nada, ele vai assumir o valor default que é a pagina 0 e por fim eu transformo em numero porque o skip do prisma espera um numero. Lembrando que 0 é a primeira pagina, 1 é a segunda pagina, 2 é a terceira pagina e assim por diante...
          // Nullish anda mais é que undefined e nulo
          pageIndex: z.string().nullish().default('0').transform(Number),
          query: z.string().nullish()
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                email: z.string().email(),
                // createdAt: z
                //   .string()
                //   .transform((value) => new Date(value).toISOString()),
                createdAt: z.date(),
                // checkIn: z
                //   .string()
                //   .nullish()
                //   .transform((value) =>
                //     value ? new Date(value).toISOString() : null
                //   )
                // checkIn: z.date().nullish() // z.date().optional()
                checkedInAt: z.date().nullable()
              })
            ),
            totalAttendees: z.number()
          })
        }
      }
    },
    async (request, reply) => {
      const { eventId } = request.params
      const { pageIndex, query } = request.query

      const [attendees, totalAttendees] = await Promise.all([
        // findMany retorna varios
        prisma.attendee.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            // Quando o usuario realizou o check-in
            checkIn: {
              select: {
                createdAt: true
              }
            }
          },
          // Se eu tiver a busca eu busco tanto pelo id quanto pelo nome ou email, se eu não tiver a busca eu busco apenas pelo id
          where: query
            ? {
                // Sistema de busca
                eventId,
                OR: [
                  {
                    name: {
                      contains: query
                    }
                  },
                  {
                    email: {
                      contains: query
                    }
                  }
                ]
              }
            : {
                eventId
              },
          // Criando sistema de paginação, para retornar de 10 registro por pargina
          take: 10,
          // Quantos registros eu vou pular, de quanto em quanto(10 em 10 por exemplo), se eu tenho uma lista de 20 registros(participantes) e quero retornar os ultimos 10, eu vou pular os 10 primeiros. Ex: 20/10 = 2, 2 * 10 = 20, então eu pulei os 10 primeiros registros. Logo o pageIndex precisa ser 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12... para eu conseguir pegar todos os registros. Então o pageIndex multiplica por 10 para pular os registros, se ele for 3 pegamos os registros de 30 a 40. 0 * 10 = 0, logo não pulamos nenhum registro, 1 * 10 = 10, logo pulamos 10 registros, 2 * 10 = 20, logo pulamos 20 registros...
          skip: pageIndex * 10,
          orderBy: {
            // Ordenando por data de criação, do mais recente para o mais antigo
            createdAt: 'desc'
          }
        }),
        prisma.attendee.count({
          // Se tiver a query eu busco o total pelo nome e o id do evento, se não eu busco o total somente pelo id do evento
          where: query
            ? {
                eventId,
                OR: [
                  {
                    name: {
                      contains: query
                    }
                  },
                  {
                    email: {
                      contains: query
                    }
                  }
                ]
              }
            : {
                eventId
              }
        })
      ])

      return reply.send({
        attendees: attendees.map((attendee) => ({
          id: attendee.id,
          name: attendee.name,
          email: attendee.email,
          createdAt: attendee.createdAt,
          // checkIn: attendee.checkIn?.createdAt // attendee.checkIn ? attendee.checkIn.createdAt : null
          checkedInAt: attendee.checkIn?.createdAt ?? null
        })),
        totalAttendees
      })
    }
  )
}
