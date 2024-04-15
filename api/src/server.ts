import { basesConfig } from './config'
import { errorHandler } from './error-handler'
import {
  checkIn,
  createEvent,
  getAttendeeBadge,
  getEvent,
  getEventAttendees,
  registerForEvent
} from './routes'

// Para conseguir tipar as rotas por inteiro
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  ZodTypeProvider
} from 'fastify-type-provider-zod'

// Segurança da Api
import fastifyCors from '@fastify/cors'
// Documentação
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastify from 'fastify'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*' // http://meufrontend.com em produção
})

app.register(fastifySwagger, {
  swagger: {
    // Todos os dados enviados para a minha api são do tipo JSON
    consumes: ['application/json'],
    // Todos os dados que a minha api retorna são do tipo JSON
    produces: ['application/json'],
    info: {
      title: 'pass.in',
      description:
        'Especificações da API para o back-end da aplicação pass.in construida duranta o NLW Unite da Rocketseat',
      version: '1.0.0'
    }
  },
  // Como swagger deve transformar e entender os schemas(params, response, body...) passados para cada rota
  transform: jsonSchemaTransform
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs'
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createEvent)
app.register(registerForEvent)
app.register(getEvent)
app.register(getAttendeeBadge)
app.register(checkIn)
app.register(getEventAttendees)

// Padronização do erro. Todo erro da aplicação das rotas vão cair dentro desse arquivo, levando a mensagem de erro para ele. Seja um erro de validação, um erro 400 ou um erro padrão...
app.setErrorHandler(errorHandler)

app
  .listen({
    port: basesConfig.nlwunite.baseUrl.port as number,
    // Para conseguir acessar a api por exemplo no react-native
    host: '0.0.0.0'
  })
  .then(() => {
    console.log(
      `Server is running on ${basesConfig.nlwunite.baseUrl.api_base_url}`
    )
  })
