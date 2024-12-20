# env
rm .env.production && mv .env.development .env
echo $EXPO_PUBLIC_CLIENT_ITEM_ACCESS_TOKEN
echo \n >> .env
echo EXPO_PUBLIC_CLIENT_ITEM_ACCESS_TOKEN=$EXPO_PUBLIC_CLIENT_ITEM_ACCESS_TOKEN >> .env

yarn install
eas build --platform android --profile development --non-interactive