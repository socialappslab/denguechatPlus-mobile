if [[ $GITHUB_REF_NAME == *"main-v"* ]]; then
     BUILD_PROFILE="production"
     SUBMIT_PROFILE="production"
elif [[ $GITHUB_REF_NAME == *"v."* ]]; then
     BUILD_PROFILE="internal_test"
     SUBMIT_PROFILE="internal_test"
fi

# env
if [ "$ENV_NAME" = "production" ]; then rm ../.env.development && mv ../.env.production ../.env ; fi


yarn install
eas build --platform android --profile $BUILD_PROFILE --non-interactive