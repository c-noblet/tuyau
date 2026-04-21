import { ApplicationService } from '@adonisjs/core/types'
import { HttpRequest } from '@adonisjs/core/http'
import { z, ZodError } from 'zod'

declare module '@adonisjs/core/http' {
  interface HttpRequest {
    validateUsing(schema: z.ZodSchema): Promise<any>
  }
}

export default class ZodProvider {
  constructor(protected app: ApplicationService) {}

  async boot() {
    /**
     * Extend the HttpRequest prototype to support Zod schema validation
     * Allows using request.validateUsing(zodSchema) just like with Vine
     */
    HttpRequest.prototype.validateUsing = async function (this: HttpRequest, schema: z.ZodSchema) {
      try {
        const method = this.method() as string
        const allData = method === 'GET' || method === 'HEAD' ? {} : await this.all()

        // Prepare data object with reserved properties
        const data = {
          ...allData,
          query: this.qs(),
          params: this.params(),
          headers: this.headers(),
          cookies: {},
        }

        // Validate and return parsed data
        return schema.parse(data)
      } catch (error) {
        if (error instanceof ZodError) {
          // Format Zod errors similar to Vine SimpleError format
          const errors = error.issues.map((issue) => ({
            field: issue.path.join('.') || 'root',
            rule: issue.code,
            message: issue.message,
          }))

          // Throw validation error with 422 status
          const validationError = new Error('Validation failed') as any
          validationError.status = 422
          validationError.messages = errors
          throw validationError
        }
        throw error
      }
    } as any
  }

  async ready() {
    // Application is ready
  }

  async shutdown() {
    // Application is shutting down
  }
}
