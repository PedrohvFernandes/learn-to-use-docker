// Essa rota retorna as credenciais para o cracha de um participante, faz e retorna tambem a url em formato de URL para o check-in do participante com o seu id. A parte do cracha fica no APP do participante, e a url vira um QRCODE no app para se escaneado

import { prisma } from '../lib'
import { BadRequest } from './_errors/bad-request'

import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { FastifyInstance } from 'fastify'
import z from 'zod'

export async function getAttendeeBadge(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/attendees/:attendeeId/badge',
    {
      schema: {
        summary: 'Get an attendee badge',
        tags: ['attendees Get'],
        params: z.object({
          // O id do participante é um number no bd, mas quando passamos parametros via URL eles chegam como string
          // attendeeId: z.string().transform(Number)
          // o coerce converte, pode ser que o valor seja uma string, mas ele vai tentar converter para number
          attendeeId: z.coerce.number().int()
        }),
        response: {
          200: z.object({
            badge: z.object({
              name: z.string(),
              email: z.string(),
              eventTitle: z.string(),
              checkInURL: z.string().url()
            })
          })
        }
      }
    },
    async (request, reply) => {
      const { attendeeId } = request.params

      const attendee = await prisma.attendee.findUnique({
        select: {
          name: true,
          email: true,
          // Como a tabela attendee tem uma relação com a tabela event, podemos selecionar os campos que queremos da tabela Event relacionado ao participante
          event: {
            select: {
              title: true
            }
          }
        },
        where: {
          id: attendeeId
        }
      })

      if (attendee === null) {
        // throw new Error('Attendee not found')
        throw new BadRequest('Attendee not found')
      }

      // Pegamos a url do back-end --> http://localhost:3000
      const baseURL = `${request.protocol}://${request.hostname}`

      // O primeiro parametro é o path que é o que vem depois da URL base, ou seja, uma rota, o segundo é a url base o dominio em si. Então estamos ditando a url do qrcode(APP DO PARTICIPANTE) que vai ser gerado para ele fazer o check-in --> /attendees/:attendeeId/check-in --> check-in.ts
      const checkInURL = new URL(`/attendees/${attendeeId}/check-in`, baseURL)

      return reply.send({
        badge: {
          name: attendee.name,
          email: attendee.email,
          eventTitle: attendee.event.title,
          // Colocamos toString() porque o checkInURL é um objeto que vem da classe URL
          checkInURL: checkInURL.toString()
        }
      })
    }
  )
}
