import { z } from 'zod'
import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'

export default class SessionController {
  /**
   * Validator using discriminated union to accept either password or webauthn assertion.
   * Tests that tuyau correctly handles union body types.
   */
  static storeValidator = z.discriminatedUnion('type', [
    z.object({
      type: z.literal('password'),
      password: z.string(),
    }),
    z.object({
      type: z.literal('webauthn'),
      assertion: z.object({
        id: z.string(),
        rawId: z.string(),
        type: z.string(),
      }),
    }),
  ])

  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(SessionController.storeValidator)
    const user = await User.verifyCredentials('test@test.com', 'password')

    await auth.use('web').login(user)
    response.redirect().toRoute('home')

    return { success: true, method: payload.type }
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
