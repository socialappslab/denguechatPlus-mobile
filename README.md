# DengueChatPlus Mobile

## Development

> [!NOTE]
> We use [Expo and EAS](https://expo.dev/) with [development builds](https://docs.expo.dev/develop/development-builds/introduction/) for the development of this application.

1. Clone the repository: `git clone <repository-url>` and `cd denguechatPlus-mobile`
2. Install dependencies: `yarn install`
3. Run the app on your device: `yarn ios` or `yarn android`

## Pipeline Process

> [!NOTE]
> This section is aimed at members of the core team.

We use EAS (Expo Application Services) for our CI/CD pipeline. The build triggers and configurations are managed through the Expo panel.

### Development Workflow

1. **Feature Development**: Create a new pull request from a feature branch targeting `develop`
   - This triggers an Android build that points to the sandbox environment
   - Used for testing and development purposes

2. **Production Release**: When ready for release, merge to the `main` branch
   - This triggers both Android and iOS builds
   - Builds are automatically submitted for production testing

All pipeline configurations, including which branches trigger new releases, are configured in the Expo panel.
