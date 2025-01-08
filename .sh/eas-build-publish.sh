if [[ $GITHUB_REF_NAME == *"main-v"* ]]; then
     BUILD_PROFILE="production"
     SUBMIT_PROFILE="production"
elif [[ $GITHUB_REF_NAME == *"v."* ]]; then
     BUILD_PROFILE="internal_test"
     SUBMIT_PROFILE="internal_test"
fi

# env
rm .env.development && mv .env.production .env

# add rollbar
echo "\nEXPO_PUBLIC_CLIENT_ITEM_ACCESS_TOKEN=$EXPO_PUBLIC_CLIENT_ITEM_ACCESS_TOKEN" >> .env

yarn install
eas build --platform android --profile $BUILD_PROFILE --non-interactive