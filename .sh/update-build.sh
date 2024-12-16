# env
rm .env.production && mv .env.development .env

yarn install
eas build --platform android --profile development --non-interactive