# env
if [ "$ENV_NAME" = "develop" ]; then rm ../.env.production && mv ../.env.development ../.env && echo "arg: "$ENV_NAME ; fi

yarn install
eas build --platform android --profile development --non-interactive