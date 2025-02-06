# env
touch .env
rm .env.production && mv .env.development .env

echo .env
# add rollbar
printf "\nEXPO_PUBLIC_CLIENT_ITEM_ACCESS_TOKEN=$EXPO_PUBLIC_CLIENT_ITEM_ACCESS_TOKEN" >> .env

yarn install
eas build --platform all --profile development --non-interactive