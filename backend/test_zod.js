const { z } = require('zod');

const schema = z.object({
  test: z.string({ required_error: "Custom Required" })
});

const result = schema.safeParse({});
console.log(JSON.stringify(result, null, 2));
