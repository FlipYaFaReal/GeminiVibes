import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { computeDomainHealth } from "../services/domain-health";

export const domainsRouter = router({
  health: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return computeDomainHealth(input.userId);
    }),
});
