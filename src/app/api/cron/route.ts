import { buildClient } from "@datocms/cma-client-node";

export async function GET() {
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

  return Response.json({ status: 200 });
}
