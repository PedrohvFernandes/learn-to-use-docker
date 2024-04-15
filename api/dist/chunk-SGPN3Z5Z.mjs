import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";
import {
  prisma
} from "./chunk-DNHFPAKL.mjs";

// src/routes/get-attendee-badge.ts
import z from "zod";
async function getAttendeeBadge(app) {
  app.withTypeProvider().get(
    "/attendees/:attendeeId/badge",
    {
      schema: {
        summary: "Get an attendee badge",
        tags: ["attendees Get"],
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
      const { attendeeId } = request.params;
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
      });
      if (attendee === null) {
        throw new BadRequest("Attendee not found");
      }
      const baseURL = `${request.protocol}://${request.hostname}`;
      const checkInURL = new URL(`/attendees/${attendeeId}/check-in`, baseURL);
      return reply.send({
        badge: {
          name: attendee.name,
          email: attendee.email,
          eventTitle: attendee.event.title,
          // Colocamos toString() porque o checkInURL é um objeto que vem da classe URL
          checkInURL: checkInURL.toString()
        }
      });
    }
  );
}

export {
  getAttendeeBadge
};
