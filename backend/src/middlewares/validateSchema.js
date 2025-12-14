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
            console.error('Validation Result Error Object:', JSON.stringify(result.error, null, 2));
            const errors = result.error.errors || result.error.issues || [];
            const errorMessages = errors.map(err => ({
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
        console.error('Validation Middleware Error:', error);
        return res.status(500).json({ error: 'Erro interno na validação' });
    }
};

module.exports = validate;
