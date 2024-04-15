import { prisma } from '../lib'
import { BadRequest } from './_errors/bad-request'

import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { FastifyInstance } from 'fastify'
import z from 'zod'

export async function getEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/events/:eventId',
    {
      schema: {
        summary: 'Get an event',
        tags: ['events Get'],
        params: z.object({
          eventId: z.string().uuid()
        }),
        response: {
          200: z.object({
            event: z.object({
              id: z.string().uuid(),
              title: z.string(),
              slug: z.string(),
              details: z.string().nullable(),
              maximumAttendees: z.number().int().nullable(),
              attendeesAmount: z.number().int()
            })
          })
        }
      }
    },
    async (request, reply) => {
      const { eventId } = request.params

      const event = await prisma.event.findUnique({
        // Quais campos eu quero mostrar do evento, mesmo que eu tenha que passar tudo, porque se futuramente tiver alguma informação sensível, eu não quero que seja exposta
        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximumAttendees: true,
          // Por conta do relacionamento entre as tabelas attendees e events  attendees  Attendee[], eu posso acessar os dados de attendees, a contagem de registros de participantes
          _count: {
            select: {
              attendees: true
            }
          }
        },
        where: {
          id: eventId
        }
      })

      if (event === null) {
        // throw new Error('Event not found')
        throw new BadRequest('Event not found')
      }

      return reply.send({
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          details: event.details,
          maximumAttendees: event.maximumAttendees,
          attendeesAmount: event._count.attendees
        }
      })
    }
  )
}
