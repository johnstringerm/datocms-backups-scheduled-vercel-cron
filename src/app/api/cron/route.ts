import { buildClient } from "@datocms/cma-client-node";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const client = buildClient({
    apiToken: process.env.DATOCMS_FULLACCESS_TOKEN as string,
  });

  const environments = await client.environments.list();

  const mainEnvironment = environments.find(
    (environment) => environment.meta.primary
  );

  const previousUnusedWeeklyBackup = environments.find(
    (environment) =>
      environment.id.match("backup-plugin-weekly") && !environment.meta.primary
  );

  if (previousUnusedWeeklyBackup) {
    await client.environments.destroy(previousUnusedWeeklyBackup.id);
  }

  await client.environments.fork(mainEnvironment!.id, {
    id: `backup-plugin-weekly-${new Date().toISOString().split("T")[0]}`,
  });

  return Response.json({ success: true });
}
