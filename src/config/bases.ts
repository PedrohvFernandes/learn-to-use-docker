import { isDev } from '../utils'

const PORT = isDev ? 3000 : process.env.PORT

export default {
  nlwunite: {
    baseUrl: {
      // O Port podemos passar na onde iremos subir a aplicação, não tem necessidade de ser um env com a variável PORT
      port: PORT,
      // O api_base_url podemos passar na onde iremos subir a aplicação, não tem necessidade de ser um env com a variável API_BASE_URL
      api_base_url: isDev ? `http://localhost:${PORT}` : ''
    }
  }
}
