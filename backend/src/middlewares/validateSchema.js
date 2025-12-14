const { z } = require('zod');

/**
 * Middleware genérico para validação com Zod
 * @param {z.ZodSchema} schema
 * @param {string} source
 */
const validate = (schema, source = 'body') => (req, res, next) => {
    try {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errorMessages = result.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));

            return res.status(400).json({
                error: 'Erro de validação',
                details: errorMessages
            });
        }

        req[source] = result.data;

        next();
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno na validação' });
    }
};

module.exports = validate;
