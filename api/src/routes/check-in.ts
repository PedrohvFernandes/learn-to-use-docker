// Essa rota faz o checkin do participante, ela é chamada quando o participante escaneia o qrcode(URL retornada da rota get-attendee-badge junto com as demais credenciais) do seu cracha feito no APP

import { prisma } from '../lib'
import { BadRequest } from './_errors/bad-request'

import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { FastifyInstance } from 'fastify'
import z from 'zod'

export async function checkIn(app: FastifyInstance) {
  // Iremos usar essa rota como get, porque como a url de checkin ela vai ser usada no qrcode, e o qrcode é um link, ou seja, vai ser acessado no navegador, e o navegador só faz requisições get
  app.withTypeProvider<ZodTypeProvider>().get(
    '/attendees/:attendeeId/check-in',
    {
      schema: {
        summary: 'Check-in an attendee',
        tags: ['check-ins'],
        params: z.object({
          // Lembrando que o attendeeId é um number no BD
          attendeeId: z.coerce.number().int()
        }),
        response: {
          201: z.null()
        }
      }
    },
    async (request, reply) => {
      const { attendeeId } = request.params

      const attendee = await prisma.attendee.findUnique({
        where: {
          id: attendeeId
        }
      })

      if (!attendee) {
        // throw new Error('Attendee not found')
        throw new BadRequest('Attendee not found')
      }

      const attendeeCheckIn = await prisma.checkIn.findUnique({
        where: {
          attendeeId
        }
      })

      // Se dentro de checkin tiver o id daquele participante, significa que ele já fez o checkin
      if (attendeeCheckIn) {
        // throw new Error('Attendee already checked in')
        throw new BadRequest('Attendee already checked in')
      }

      // Criamos o checkin do participante passando somente o seu id, a data de criação o prorprio prisma já faz
      await prisma.checkIn.create({
        data: {
          attendeeId
        }
      })

      return reply.status(201).send()
    }
  )
}
