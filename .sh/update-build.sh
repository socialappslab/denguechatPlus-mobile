# env
rm .env.production && mv .env.development .env && echo "arg: "$ENV_NAME

yarn install
eas build --platform android --profile development --non-interactive