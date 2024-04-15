import {
  generateSlug
} from "./chunk-KDMJHR3Z.mjs";
import {
  BadRequest
} from "./chunk-JRO4E4TH.mjs";
import {
  prisma
} from "./chunk-DNHFPAKL.mjs";

// src/routes/create-event.ts
import z from "zod";
async function createEvent(app) {
  app.withTypeProvider().post(
    "/events",
    {
      // Por arqui tipamos o body da requisição(O que ela vai receber) e a resposta(O que ela vai devolver) usando o zod, atraves do withTypeProvider<ZodTypeProvider>() fastify-type-provider-zod. Isso facilita na documentação da API
      schema: {
        // Personaliza para a documentação do swagger
        summary: "Create a new event",
        tags: ["events Post"],
        // O que a rota vai receber no body da requisição
        body: z.object({
          title: z.string({
            // Mensagem de erro caso o titulo não seja uma string
            invalid_type_error: "O t\xEDtulo precisa ser um texto"
          }).min(4, {
            message: "O t\xEDtulo precisa ter no m\xEDnimo 4 caracteres"
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
      const { details, maximumAttendees, title } = request.body;
      const slug = generateSlug(title);
      const eventWithSameSlug = await prisma.event.findUnique({
        where: {
          slug
        }
      });
      if (eventWithSameSlug !== null) {
        throw new BadRequest("Event with same title already exists");
      }
      const event = await prisma.event.create({
        data: {
          details,
          maximumAttendees,
          title,
          slug
        }
      });
      return reply.status(201).send({ eventId: event.id });
    }
  );
}

export {
  createEvent
};
