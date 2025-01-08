# env
rm .env.production && mv .env.development .env

# add rollbar
printf "EXPO_PUBLIC_CLIENT_ITEM_ACCESS_TOKEN=$EXPO_PUBLIC_CLIENT_ITEM_ACCESS_TOKEN\n" >> .env

yarn install
eas build --platform android --profile development --non-interactive