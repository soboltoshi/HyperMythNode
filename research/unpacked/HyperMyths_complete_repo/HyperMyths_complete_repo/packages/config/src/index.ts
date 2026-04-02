export type AppConfig = {
  appName: string;
  defaultWorld: string;
  dataPath?: string;
};

export function getAppConfig(): AppConfig {
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'HyperMyths',
    defaultWorld: process.env.NEXT_PUBLIC_DEFAULT_WORLD || 'genesis',
    dataPath: process.env.HYPERMYTHS_DATA_PATH
  };
}
