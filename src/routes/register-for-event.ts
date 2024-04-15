import { prisma } from '../lib'
import { BadRequest } from './_errors/bad-request'

import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { FastifyInstance } from 'fastify'
import z from 'zod'

export async function registerForEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    // Eu quero criar um participante /attendees dentro de um evento especifico /events/:eventId/
    .post(
      '/events/:eventId/attendees',
      {
        schema: {
          summary: 'Register an attendees',
          tags: ['attendees Post'],
          body: z.object({
            // Recebemos um objeto com nome e email do user
            name: z.string(),
            email: z.string().email()
          }),
          params: z.object({
            // O id do evento tem que ser uuid porque no bd é um uuid
            eventId: z.string().uuid()
          }),
          response: {
            201: z.object({
              // Retornamos o id do participante é um number porque no bd é um number
              attendeeId: z.number()
            })
          }
        }
      },
      async (request, reply) => {
        const { eventId } = request.params
        const { email, name } = request.body

        const attendeeFromEmail = await prisma.attendee.findUnique({
          where: {
            // Como criamos um índice(index) unico no bd, entre email e o eventId em attendee @@unique conseguimos usar esse eventId_email(Mas ele não é um campo da tabela attendee). Isso otimiza em nossa busca, porque tudo o que é índice(index) como PK, FK, campo unico(Ex: slug) ou dois campos juntos que formam uma chave unica(Email e eventId). Quando fazemos uma busca atraves desse index nos temos um processo mais rapido, do que por campos que não possui index, como exemplo pesquisar alguem atraves do proprio email sozinho
            eventId_email: {
              email,
              eventId
            }
          }
        })

        if (attendeeFromEmail !== null) {
          // throw new Error('Attendee already registered for this event')
          throw new BadRequest('Attendee already registered for this event')
        }

        // Essas duas queries agora irão executar ao mesmo tempo
        const [event, amountOfAttendeesForEvent] = await Promise.all([
          prisma.event.findUnique({
            where: {
              id: eventId
            }
          }),
          // Contamos a quantidade de participantes para o evento informado
          prisma.attendee.count({
            where: {
              eventId
            }
          })
        ])

        // const event = await prisma.event.findUnique({
        //   where: {
        //     id: eventId
        //   }
        // })

        // const amountOfAttendeesForEvent = await prisma.attendee.count({
        //   where: {
        //     eventId
        //   }
        // })

        if (
          event?.maximumAttendees &&
          amountOfAttendeesForEvent >= event.maximumAttendees
        ) {
          throw new Error('Event is full')
        }

        const attendee = await prisma.attendee.create({
          data: {
            name,
            email,
            eventId
          }
        })

        return reply.status(201).send({ attendeeId: attendee.id })
      }
    )
}
